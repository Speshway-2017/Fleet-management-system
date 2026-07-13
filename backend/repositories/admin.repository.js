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
  const result = await Analytics.aggregate([
    { $match: { metric: 'Revenue' } },
    { $group: { _id: null, total: { $sum: '$value' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

export const getRecentTrips = async (limit = 5) => {
  return Trip.find().sort({ createdAt: -1 }).limit(limit).populate('vehicle', 'vehicleNumber model').populate('driver', 'name');
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
  return Analytics.aggregate([
    { $match: { metric: 'Revenue' } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$value' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
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
  return notification.save();
};

export const getAdminNotificationsInRepo = async () => {
  return Notification.find({ recipientRole: 'SUPER_ADMIN' }).sort({ createdAt: -1 });
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
