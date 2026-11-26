import SecurityEvent, { SECURITY_CATEGORIES } from '../models/SecurityEvent.js';
import LoginLockout from '../models/LoginLockout.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { isCspReportOnly } from '../middleware/security.middleware.js';
import { logAction } from '../services/audit.service.js';
import { getClientIp } from '../services/securityMonitor.service.js';

const escapeRegex = (val) => String(val).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/**
 * GET /api/admin/security/events
 * Super Admin only: returns real persisted SecurityEvent entries, category/severity summaries,
 * active temporary lockouts, and active CSP enforcement posture.
 */
export const getSecurityEventsAdmin = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category && SECURITY_CATEGORIES.includes(String(req.query.category).toUpperCase())) {
      filter.category = String(req.query.category).toUpperCase();
    }
    if (req.query.severity && ['Low', 'Medium', 'High', 'Critical'].includes(req.query.severity)) {
      filter.severity = req.query.severity;
    }
    if (req.query.status && ['Blocked', 'Allowed', 'Monitored'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const search = String(req.query.search || '').trim();
    if (search.length >= 2) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { category: searchRegex },
        { ipAddress: searchRegex },
        { actor: searchRegex },
        { path: searchRegex },
        { reason: searchRegex },
      ];
    }

    const now = new Date();
    const [
      total,
      events,
      blockedCount,
      allowedCount,
      monitoredCount,
      highCriticalCount,
      activeLockouts,
      byCategoryAgg,
      bySeverityAgg,
    ] = await Promise.all([
      SecurityEvent.countDocuments(filter),
      SecurityEvent.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SecurityEvent.countDocuments({ status: 'Blocked' }),
      SecurityEvent.countDocuments({ status: 'Allowed' }),
      SecurityEvent.countDocuments({ status: 'Monitored' }),
      SecurityEvent.countDocuments({ severity: { $in: ['High', 'Critical'] } }),
      LoginLockout.find({ lockedUntil: { $gt: now } })
        .select('identifier ipAddress attempts lockedUntil lastAttemptAt')
        .sort({ lockedUntil: -1 })
        .limit(20)
        .lean(),
      SecurityEvent.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      SecurityEvent.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
    ]);

    const totalEvents = blockedCount + allowedCount + monitoredCount;

    return sendSuccess(
      res,
      200,
      {
        events: events.map((ev) => ({
          id: ev._id,
          category: ev.category,
          severity: ev.severity,
          status: ev.status,
          ipAddress: ev.ipAddress,
          method: ev.method,
          path: ev.path,
          actor: ev.actor,
          reason: ev.reason,
          details: ev.details || {},
          timestamp: ev.createdAt,
        })),
        activeLockouts,
        summary: {
          totalEvents,
          blockedCount,
          allowedCount,
          monitoredCount,
          highCriticalCount,
          activeLockoutCount: activeLockouts.length,
          cspMode: isCspReportOnly(process.env) ? 'report-only' : 'enforce',
          byCategory: byCategoryAgg.map((c) => ({ category: c._id, count: c.count })),
          bySeverity: bySeverityAgg.reduce((acc, s) => {
            acc[s._id] = s.count;
            return acc;
          }, {}),
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
      'Security monitoring events fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/security/lockouts/:id
 * Allows Super Admin to manually lift a temporary brute-force lockout for a legitimate user.
 */
export const unlockAccountAdmin = async (req, res, next) => {
  try {
    const lockout = await LoginLockout.findByIdAndDelete(req.params.id);
    if (!lockout) {
      return sendError(res, 404, 'Lockout record not found');
    }

    await logAction({
      user: req.user?.email || 'Super Admin',
      action: 'Cleared Login Lockout',
      ipAddress: getClientIp(req),
      status: 'Success',
      details: { unlockedActor: lockout.identifier, sourceIp: lockout.ipAddress },
    });

    return sendSuccess(res, 200, { unlockedId: req.params.id }, 'Login lockout cleared successfully');
  } catch (error) {
    next(error);
  }
};

