import AuditLog from '../models/AuditLog.js';

/**
 * Creates an audit log entry in the database.
 * @param {Object} params - The log details.
 * @param {String} params.user - The user performing the action (email or name).
 * @param {String} params.action - The action being performed.
 * @param {String} [params.organization] - The organization context, if applicable.
 * @param {String} [params.ipAddress] - The IP address of the user.
 * @param {String} [params.status='Success'] - The status of the action ('Success', 'Warning', 'Failed').
 * @param {Object} [params.details={}] - Additional details about the action.
 */
export const logAction = async ({
  user,
  action,
  organization = '—',
  ipAddress = 'Unknown',
  status = 'Success',
  details = {}
}) => {
  try {
    const log = new AuditLog({
      user,
      action,
      organization,
      ipAddress,
      status,
      details
    });
    await log.save();
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
