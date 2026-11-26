import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({
  title,
  description,
  activityType,
  vehicleNumber = '',
  vehicleName = '',
  relatedModule = 'Vehicle',
  relatedId = null,
  user = 'Manager',
  assignedManager
}) => {
  try {
    if (!assignedManager) return;
    const userName = typeof user === 'object' ? (user.fullName || user.name || user.email || 'Manager') : (user || 'Manager');
    const managerId = typeof assignedManager === 'object' ? (assignedManager._id || assignedManager) : assignedManager;

    const log = new ActivityLog({
      title,
      description,
      activityType,
      vehicleNumber,
      vehicleName,
      relatedModule,
      relatedId: relatedId ? String(relatedId) : null,
      user: userName,
      assignedManager: managerId
    });
    await log.save();
  } catch (error) {
    console.error('Failed to save activity log:', error);
  }
};
