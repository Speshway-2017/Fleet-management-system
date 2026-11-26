import xss from 'xss';
import { getTrustedOrigins } from '../config/csp.config.js';
import { recordSecurityEvent, trackApiAnomaly } from '../services/securityMonitor.service.js';

const PROTOTYPE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const PASSWORD_LIKE_KEY_RE = /^(password|newPassword|oldPassword|currentPassword|confirmPassword|token|jwt|otp|secret)$/i;

const XSS_SIGNATURE_RE = /<\s*script\b|javascript\s*:|on(?:error|load|click|mouseover|focus|submit|animationstart)\s*=|<\s*iframe\b|<\s*object\b|<\s*embed\b|<\s*svg[^>]*\bon\w+\s*=/i;
const CMD_INJECTION_RE = /(?:\$\([^)]{1,120}\)|`[^`]{1,120}`|(?:;|&&|\|\||\||%0a|%0d)\s*(?:cat|ls|dir|rm|del|sh|bash|zsh|cmd|powershell|pwsh|wget|curl|nc|netcat|whoami|id|uname|chmod|chown|python|perl|node|ruby)\b)/i;
const PATH_TRAVERSAL_RE = /(?:^|[\\/])\.\.(?:[\\/]|$)|%2e%2e(?:%2f|%5c|\/|\\)/i;

/**
 * Recursively inspects request objects for MongoDB operator injection (`$gt`, `$where`, etc.),
 * dotted key injection (`a.b`), and prototype pollution keys.
 */
const findNoSqlInjection = (obj, path = '') => {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i += 1) {
      const hit = findNoSqlInjection(obj[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }

  for (const key of Object.keys(obj)) {
    if (PROTOTYPE_KEYS.has(key)) {
      return { field: `${path}.${key}`, key, reason: `Prototype pollution key "${key}" rejected` };
    }
    if (key.startsWith('$') || key.includes('.')) {
      return { field: `${path}.${key}`, key, reason: `Disallowed NoSQL operator or dotted key "${key}"` };
    }
    const val = obj[key];
    if (val && typeof val === 'object') {
      const hit = findNoSqlInjection(val, path ? `${path}.${key}` : key);
      if (hit) return hit;
    }
  }
  return null;
};

/**
 * Recursively detects XSS, shell command injection, and path traversal payloads
 * on string inputs while preserving raw password fields intact (passwords may use `&` / `;` / `$`).
 */
const scanInputStrings = (obj, path = '') => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'string') {
    const fieldName = path.split('.').pop()?.replace(/\[\d+\]$/, '') || '';
    if (PASSWORD_LIKE_KEY_RE.test(fieldName)) {
      return null;
    }
    if (XSS_SIGNATURE_RE.test(obj)) {
      return { category: 'XSS_ATTEMPT', field: path || 'body', reason: 'Potential XSS script/event payload detected' };
    }
    if (CMD_INJECTION_RE.test(obj)) {
      return { category: 'COMMAND_INJECTION', field: path || 'body', reason: 'Potential shell command injection payload detected' };
    }
    if (PATH_TRAVERSAL_RE.test(obj)) {
      return { category: 'PATH_TRAVERSAL', field: path || 'body', reason: 'Path traversal sequence detected' };
    }
    return null;
  }

  if (typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i += 1) {
      const hit = scanInputStrings(obj[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }

  for (const key of Object.keys(obj)) {
    const nextPath = path ? `${path}.${key}` : key;
    const hit = scanInputStrings(obj[key], nextPath);
    if (hit) return hit;
  }
  return null;
};

/**
 * Sanitizes harmless stray HTML markup in non-password text inputs using `xss`
 * only when angle brackets exist (preserving ampersands, URLs, JSON strings cleanly).
 */
const sanitizeTextStrings = (obj, keyName = '') => {
  if (typeof obj === 'string') {
    if (PASSWORD_LIKE_KEY_RE.test(keyName)) return obj;
    if (obj.includes('<') && obj.includes('>')) {
      return xss(obj, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script', 'style'] });
    }
    return obj;
  }
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeTextStrings(item, keyName));
  }
  for (const k of Object.keys(obj)) {
    obj[k] = sanitizeTextStrings(obj[k], k);
  }
  return obj;
};

export const preventNoSqlInjection = async (req, res, next) => {
  for (const source of ['body', 'query', 'params']) {
    const hit = findNoSqlInjection(req[source], source);
    if (hit) {
      await recordSecurityEvent({
        category: 'NOSQL_INJECTION',
        severity: 'High',
        status: 'Blocked',
        req,
        reason: hit.reason,
        details: { source, field: hit.field },
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid request structure detected',
      });
    }
  }
  next();
};

export const inspectAndSanitizeInputs = async (req, res, next) => {
  // CSP reports naturally contain blocked HTML/script URI snippets; do not block telemetry
  if (req.path === '/api/security/csp-report') {
    return next();
  }

  for (const source of ['body', 'query', 'params']) {
    const hit = scanInputStrings(req[source], source);
    if (hit) {
      await recordSecurityEvent({
        category: hit.category,
        severity: hit.category === 'COMMAND_INJECTION' ? 'Critical' : 'High',
        status: 'Blocked',
        req,
        reason: hit.reason,
        details: { source, field: hit.field },
      });
      return res.status(400).json({
        success: false,
        message: 'Potentially malicious input rejected',
      });
    }
  }

  if (req.body && typeof req.body === 'object') {
    sanitizeTextStrings(req.body);
  }
  next();
};

/**
 * Defense-in-depth CSRF protection for browser state-changing requests.
 * Non-browser clients (Flutter mobile app, server webhooks) without Origin/Referer continue working,
 * while cross-site browser requests from untrusted origins are blocked and logged.
 */
export const csrfOriginGuard = async (req, res, next) => {
  const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
  if (safeMethods.has(req.method) || req.path === '/api/security/csp-report') {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const secFetchSite = req.headers['sec-fetch-site'];

  let candidateOrigin = '';
  if (origin && origin !== 'null') {
    candidateOrigin = origin;
  } else if (referer) {
    try {
      candidateOrigin = new URL(referer).origin;
    } catch {
      candidateOrigin = 'invalid';
    }
  }

  if (!candidateOrigin) {
    return next();
  }

  const { isProduction, frontendHttpOrigins, apiHttpOrigins } = getTrustedOrigins(process.env);
  const trustedSet = new Set([...frontendHttpOrigins, ...apiHttpOrigins]);

  const isLocalDevOrigin =
    !isProduction &&
    /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/i.test(
      candidateOrigin
    );

  const isSameHost =
    req.headers.host &&
    (candidateOrigin === `http://${req.headers.host}` ||
      candidateOrigin === `https://${req.headers.host}`);

  const isAllowed = trustedSet.has(candidateOrigin) || isLocalDevOrigin || isSameHost;

  if (!isAllowed || (secFetchSite === 'cross-site' && !trustedSet.has(candidateOrigin) && !isLocalDevOrigin)) {
    await recordSecurityEvent({
      category: 'CSRF_VIOLATION',
      severity: 'High',
      status: 'Blocked',
      req,
      reason: `Blocked cross-origin state-changing request from untrusted origin (${candidateOrigin})`,
      details: { candidateOrigin, secFetchSite: secFetchSite || '' },
    });
    return res.status(403).json({
      success: false,
      message: 'Cross-site request forbidden',
    });
  }

  next();
};

export const securityActivityMonitor = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 404) {
      trackApiAnomaly(req, res.statusCode);
    }
    if (res.statusCode === 403 && !req._securityEventLogged && !req.path.startsWith('/api/security')) {
      // Capture unauthorized privilege probes cleanly
      recordSecurityEvent({
        category: 'PRIVILEGE_ESCALATION',
        severity: 'Medium',
        status: 'Blocked',
        req,
        reason: `Forbidden access attempt (HTTP 403) on ${req.originalUrl}`,
        details: { statusCode: 403, role: req.user?.role || 'Anonymous' },
      });
    }
  });
  next();
};
