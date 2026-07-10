import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import Analytics from '../models/Analytics.js';
import Organization from '../models/Organization.js';

export const getAllManagers = async () => {
  return User.find({ role: 'FLEET_MANAGER' }).populate('organization', 'name').select('-password');
};

export const createManager = async (managerData) => {
  const manager = new User({ role: 'FLEET_MANAGER', ...managerData });
  return manager.save();
};

export const getManagerById = async (id) => {
  return User.findOne({ _id: id, role: 'FLEET_MANAGER' }).select('-password');
};

export const getDistinctOrganizations = async (filter = {}) => {
  const orgs = await User.distinct('organization', filter);
  return orgs.length;
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
