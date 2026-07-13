import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ title, description, activityType, user, assignedManager }) => {
  try {
    const log = new ActivityLog({
      title,
      description,
      activityType,
      user: user.name || user.email || 'System',
      assignedManager: assignedManager._id || assignedManager
    });
    await log.save();
  } catch (error) {
    console.error('Failed to save activity log:', error);
  }
};
