import SecurityEvent from '../models/SecurityEvent.js';
import LoginLockout from '../models/LoginLockout.js';
import Settings from '../models/Settings.js';
import { logAction } from './audit.service.js';

const SENSITIVE_KEY_RE = /(password|pass|token|jwt|otp|secret|authorization|cookie|credential)/i;

const DEFAULT_MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// In-memory sliding burst tracker for unusual API probing detection
const apiAnomalyTracker = new Map();

export const getClientIp = (req) => {
  if (!req) return 'Unknown';
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'Unknown';
};

export const maskActor = (value) => {
  if (!value) return 'Anonymous';
  const raw = String(value).trim();
  if (!raw) return 'Anonymous';
  if (raw.includes('@')) {
    const [local, domain] = raw.split('@');
    const maskedLocal =
      local.length <= 2 ? `${local[0] || '*'}***` : `${local.slice(0, 2)}***${local.slice(-1)}`;
    return `${maskedLocal}@${domain || ''}`;
  }
  if (/^\+?\d{7,15}$/.test(raw.replace(/[\s-]/g, ''))) {
    const digits = raw.replace(/\D/g, '');
    return `***${digits.slice(-4)}`;
  }
  return raw.length > 48 ? `${raw.slice(0, 48)}...` : raw;
};

export const sanitizeLogMeta = (value, depth = 0) => {
  if (depth > 4) return '[Truncated]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    const redacted = value
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
      .replace(/\b\d{6}\b/g, (m) => (m === '123456' ? '[OTP]' : m));
    return redacted.length > 240 ? `${redacted.slice(0, 240)}...` : redacted;
  }
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => sanitizeLogMeta(item, depth + 1));
  }
  const clean = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE_KEY_RE.test(k)) {
      clean[k] = '[REDACTED]';
    } else {
      clean[k] = sanitizeLogMeta(v, depth + 1);
    }
  }
  return clean;
};

export const recordSecurityEvent = async ({
  category,
  severity = 'Medium',
  status = 'Blocked',
  req = null,
  ipAddress,
  method,
  path,
  actor,
  reason,
  details = {},
  alsoAudit = false,
}) => {
  try {
    const resolvedIp = ipAddress || getClientIp(req);
    const resolvedPath = String(path || req?.originalUrl || req?.url || '/').split('?')[0].slice(0, 200);
    const resolvedMethod = String(method || req?.method || 'GET').toUpperCase();
    const resolvedActor = maskActor(actor || req?.user?.email || req?.user?._id || 'Anonymous');
    const userAgent = String(req?.headers?.['user-agent'] || '').slice(0, 200);

    const doc = await SecurityEvent.create({
      category,
      severity,
      status,
      ipAddress: resolvedIp,
      method: resolvedMethod,
      path: resolvedPath,
      actor: resolvedActor,
      userAgent,
      reason: String(reason || category).slice(0, 300),
      details: sanitizeLogMeta(details),
    });

    if (req && status === 'Blocked') {
      req._securityEventLogged = true;
    }

    if (alsoAudit) {
      await logAction({
        user: resolvedActor,
        action: `Security Alert: ${category}`,
        ipAddress: resolvedIp,
        status: status === 'Blocked' ? 'Warning' : 'Failed',
        details: sanitizeLogMeta({ category, severity, path: resolvedPath, reason }),
      });
    }

    return doc;
  } catch (err) {
    console.error('[SecurityMonitor] Failed to persist security event:', err.message);
    return null;
  }
};

export const trackApiAnomaly = async (req, statusCode) => {
  try {
    if (statusCode !== 401 && statusCode !== 403 && statusCode !== 404) return;
    const ip = getClientIp(req);
    const now = Date.now();
    const windowMs = 60 * 1000;
    const entry = apiAnomalyTracker.get(ip) || { count: 0, paths: new Set(), windowStart: now, alerted: false };

    if (now - entry.windowStart > windowMs) {
      entry.count = 0;
      entry.paths.clear();
      entry.windowStart = now;
      entry.alerted = false;
    }

    entry.count += 1;
    entry.paths.add(String(req.originalUrl || req.url || '').split('?')[0]);
    apiAnomalyTracker.set(ip, entry);

    // Log unusual scanning / enumeration burst (monitoring only, never auto-blocks normal users)
    if (!entry.alerted && entry.count >= 25 && entry.paths.size >= 8) {
      entry.alerted = true;
      await recordSecurityEvent({
        category: 'UNUSUAL_API_ACTIVITY',
        severity: 'High',
        status: 'Monitored',
        req,
        reason: `Unusual burst of ${entry.count} failed/not-found probes across ${entry.paths.size} distinct routes in 60s`,
        details: { probeCount: entry.count, uniqueRoutes: entry.paths.size, lastStatus: statusCode },
      });
    }
  } catch {
    // Non-blocking telemetry
  }
};

const getConfiguredMaxLoginAttempts = async () => {
  try {
    const setting = await Settings.findOne().select('securitySettings.maxLoginAttempts').lean();
    const val = Number(setting?.securitySettings?.maxLoginAttempts);
    if (Number.isFinite(val) && val >= 3 && val <= 10) {
      return val;
    }
  } catch {
    // fallback safely
  }
  return DEFAULT_MAX_ATTEMPTS;
};

const buildLockoutKey = (req, identifier) => {
  const ip = getClientIp(req);
  const cleanId = String(identifier || 'unknown').trim().toLowerCase().slice(0, 120);
  return `${ip}::${cleanId}`;
};

export const checkLoginLockout = async (req, identifier) => {
  try {
    const key = buildLockoutKey(req, identifier);
    const record = await LoginLockout.findOne({ key });
    if (!record || !record.lockedUntil) {
      return { locked: false, retryAfterSeconds: 0 };
    }

    const remainingMs = new Date(record.lockedUntil).getTime() - Date.now();
    if (remainingMs <= 0) {
      await LoginLockout.deleteOne({ _id: record._id });
      return { locked: false, retryAfterSeconds: 0 };
    }

    const retryAfterSeconds = Math.ceil(remainingMs / 1000);
    await recordSecurityEvent({
      category: 'ACCOUNT_LOCKOUT',
      severity: 'High',
      status: 'Blocked',
      req,
      actor: identifier,
      reason: `Login blocked by temporary lockout (${retryAfterSeconds}s remaining)`,
      details: { attempts: record.attempts, retryAfterSeconds },
    });

    return { locked: true, retryAfterSeconds };
  } catch {
    return { locked: false, retryAfterSeconds: 0 };
  }
};

export const recordLoginFailure = async (req, identifier, reason = 'Invalid credentials') => {
  try {
    const key = buildLockoutKey(req, identifier);
    const ip = getClientIp(req);
    const maxAttempts = await getConfiguredMaxLoginAttempts();
    const now = new Date();

    let record = await LoginLockout.findOne({ key });
    if (!record || now.getTime() - new Date(record.firstAttemptAt).getTime() > ATTEMPT_WINDOW_MS) {
      record = await LoginLockout.findOneAndUpdate(
        { key },
        {
          $set: {
            key,
            identifier: maskActor(identifier),
            ipAddress: ip,
            attempts: 1,
            firstAttemptAt: now,
            lastAttemptAt: now,
            lockedUntil: null,
            expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
          },
        },
        { upsert: true, new: true }
      );
    } else {
      record.attempts += 1;
      record.lastAttemptAt = now;
      if (record.attempts >= maxAttempts) {
        record.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
      }
      record.expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
      await record.save();
    }

    const isLockedNow = Boolean(record.lockedUntil && record.lockedUntil > now);
    await recordSecurityEvent({
      category: isLockedNow ? 'BRUTE_FORCE' : 'AUTH_FAILURE',
      severity: isLockedNow ? 'High' : 'Medium',
      status: isLockedNow ? 'Blocked' : 'Monitored',
      req,
      actor: identifier,
      reason: isLockedNow
        ? `Brute-force threshold reached (${record.attempts}/${maxAttempts} failed attempts); temporary lockout activated`
        : reason,
      details: {
        attemptCount: record.attempts,
        maxAttempts,
        locked: isLockedNow,
      },
      alsoAudit: isLockedNow,
    });

    return {
      attempts: record.attempts,
      maxAttempts,
      locked: isLockedNow,
      retryAfterSeconds: isLockedNow ? Math.ceil(LOCKOUT_DURATION_MS / 1000) : 0,
    };
  } catch (err) {
    console.error('[SecurityMonitor] Failed to track login failure:', err.message);
    return { attempts: 1, maxAttempts: DEFAULT_MAX_ATTEMPTS, locked: false, retryAfterSeconds: 0 };
  }
};

export const clearLoginFailures = async (req, identifier) => {
  try {
    const key = buildLockoutKey(req, identifier);
    await LoginLockout.deleteOne({ key });
  } catch {
    // non-fatal cleanup
  }
};
