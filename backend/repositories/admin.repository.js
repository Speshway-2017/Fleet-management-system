import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import Analytics from '../models/Analytics.js';
import Organization from '../models/Organization.js';
import PlatformIssue from '../models/PlatformIssue.js';
import Settings from '../models/Settings.js';

export const getAllManagers = async () => {
  return User.find({ role: 'FLEET_MANAGER' }).populate('organization', 'name').select('-password');
};

export const createManager = async (managerData) => {
  const manager = new User({ role: 'FLEET_MANAGER', ...managerData });
  return manager.save();
};

export const getManagerById = async (id) => {
  return User.findOne({ _id: id, role: 'FLEET_MANAGER' }).populate('organization', 'name _id').select('-password');
};

export const getDistinctOrganizations = async (filter = {}) => {
  const query = {};
  if (filter.isActive !== undefined) {
    query.status = filter.isActive ? 'Active' : 'Pending';
  }
  return Organization.countDocuments(query);
};

export const createOrganization = async (orgData) => {
  const org = new Organization(orgData);
  return org.save();
};

export const getAllOrganizations = async () => {
  return Organization.find().sort({ createdAt: -1 });
};

export const getUsersCount = async (filter = {}) => {
  return User.countDocuments(filter);
};

export const getVehiclesCount = async (filter = {}) => {
  return Vehicle.countDocuments(filter);
};

export const getPendingRequestsCount = async () => {
  return Organization.countDocuments({ status: 'Pending' });
};

export const getRevenueAggregate = async () => {
  try {
    const result = await Trip.aggregate([
      {
        $group: {
          _id: null,
          totalDistance: { $sum: { $toDouble: { $ifNull: ['$estimatedDistance', 0] } } },
          totalWeight: { $sum: { $toDouble: { $ifNull: ['$cargoWeight', 0] } } }
        }
      }
    ]);
    if (result.length > 0) {
      const dist = Number(result[0].totalDistance) || 0;
      const weight = Number(result[0].totalWeight) || 0;
      return Math.round(dist * 52 + weight * 4.5);
    }
  } catch (_) {
    const trips = await Trip.find().lean();
    let total = 0;
    trips.forEach(t => {
      const dist = Number(t.estimatedDistance || t.actualDistance) || 0;
      const weight = Number(t.cargoWeight) || 0;
      total += Math.round(dist * 52 + weight * 4.5);
    });
    return total;
  }
  return 0;
};

export const getTodayRevenueAggregate = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const result = await Trip.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: { $toDouble: { $ifNull: ['$estimatedDistance', 0] } } },
          totalWeight: { $sum: { $toDouble: { $ifNull: ['$cargoWeight', 0] } } }
        }
      }
    ]);
    if (result.length > 0) {
      const dist = Number(result[0].totalDistance) || 0;
      const weight = Number(result[0].totalWeight) || 0;
      return Math.round(dist * 52 + weight * 4.5);
    }
  } catch (_) {
    const trips = await Trip.find({ createdAt: { $gte: startOfDay } }).lean();
    let total = 0;
    trips.forEach(t => {
      const dist = Number(t.estimatedDistance || t.actualDistance) || 0;
      const weight = Number(t.cargoWeight) || 0;
      total += Math.round(dist * 52 + weight * 4.5);
    });
    return total;
  }
  return 0;
};

export const getRecentTrips = async (limit = 5) => {
  return Trip.find().sort({ createdAt: -1 }).limit(limit).populate('vehicle', 'vehicleNumber model');
};

export const getRecentNotifications = async (limit = 5) => {
  return Notification.find().sort({ createdAt: -1 }).limit(limit).populate('recipient', 'name email');
};

export const getAnalyticsSummary = async () => {
  return Analytics.aggregate([
    { $group: { _id: '$metric', total: { $sum: '$value' } } }
  ]);
};

export const getRevenueChartData = async () => {
  try {
    const result = await Trip.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalDistance: { $sum: { $toDouble: { $ifNull: ['$estimatedDistance', 0] } } },
          totalWeight: { $sum: { $toDouble: { $ifNull: ['$cargoWeight', 0] } } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return result.map(item => ({
      _id: Number(item._id) || 1,
      total: Math.round((Number(item.totalDistance) || 0) * 52 + (Number(item.totalWeight) || 0) * 4.5)
    }));
  } catch (_) {
    const trips = await Trip.find().lean();
    const monthlyMap = {};
    trips.forEach(t => {
      if (t.createdAt) {
        const m = new Date(t.createdAt).getMonth() + 1;
        const dist = Number(t.estimatedDistance || t.actualDistance) || 0;
        const weight = Number(t.cargoWeight) || 0;
        const rev = Math.round(dist * 52 + weight * 4.5);
        monthlyMap[m] = (monthlyMap[m] || 0) + rev;
      }
    });
    return Object.keys(monthlyMap).map(m => ({
      _id: Number(m),
      total: monthlyMap[m]
    }));
  }
};

// Organization update / delete
export const updateOrganizationById = async (id, data) => {
  return Organization.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteOrganizationById = async (id) => {
  return Organization.findByIdAndDelete(id);
};

export const getOrganizationById = async (id) => {
  return Organization.findById(id);
};

// Fleet Manager update / delete
export const updateManagerById = async (id, data) => {
  return User.findOneAndUpdate({ _id: id, role: 'FLEET_MANAGER' }, data, { new: true, runValidators: true }).select('-password');
};

export const deleteManagerById = async (id) => {
  return User.findOneAndDelete({ _id: id, role: 'FLEET_MANAGER' });
};

// Settings functions
export const getSettingsData = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
    await settings.save();
  }
  return settings;
};

export const updateSettingsData = async (data) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings(data);
  } else {
    Object.assign(settings, data);
  }
  return settings.save();
};

// Platform Issue functions
export const createPlatformIssueInRepo = async (issueData) => {
  const issue = new PlatformIssue(issueData);
  return issue.save();
};

export const getAllPlatformIssues = async () => {
  return PlatformIssue.find().populate('reportedBy', 'name email').sort({ createdAt: -1 });
};

export const getPlatformIssueByIdInRepo = async (id) => {
  return PlatformIssue.findById(id).populate('reportedBy', 'name email');
};

export const updatePlatformIssueInRepo = async (id, data) => {
  return PlatformIssue.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('reportedBy', 'name email');
};

export const deletePlatformIssueInRepo = async (id) => {
  return PlatformIssue.findByIdAndDelete(id);
};

// Notifications functions
export const createNotificationInRepo = async (data) => {
  const notification = new Notification(data);
  await notification.save();
  return notification.populate('organization', 'name email phone');
};

export const getAdminNotificationsInRepo = async () => {
  return Notification.find({ recipientRole: 'SUPER_ADMIN' }).populate('organization', 'name email phone').sort({ createdAt: -1 });
};

export const markNotificationReadInRepo = async (id) => {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

export const markAllNotificationsReadInRepo = async () => {
  return Notification.updateMany({ recipientRole: 'SUPER_ADMIN', isRead: false }, { isRead: true });
};

export const deleteNotificationInRepo = async (id) => {
  return Notification.findByIdAndDelete(id);
};
