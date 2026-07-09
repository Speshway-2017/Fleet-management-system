import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import Analytics from '../models/Analytics.js';
import Organization from '../models/Organization.js';
import Driver from '../models/Driver.js';
import Maintenance from '../models/Maintenance.js';
import Fuel from '../models/Fuel.js';

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

export const getRealRecentActivities = async (limit = 5) => {
  const recentOrgs = await Organization.find().sort({ createdAt: -1 }).limit(limit);
  const recentManagers = await User.find({ role: 'FLEET_MANAGER' }).populate('organization', 'name').sort({ createdAt: -1 }).limit(limit);

  const activities = [];

  recentOrgs.forEach(org => {
    activities.push({
      type: 'Organization Created',
      organization: org.name,
      createdAt: org.createdAt,
      status: 'green'
    });
  });

  recentManagers.forEach(manager => {
    activities.push({
      type: 'Fleet Manager Added',
      organization: manager.organization ? manager.organization.name : 'N/A',
      createdAt: manager.createdAt,
      status: 'blue'
    });
  });

  // Sort by createdAt descending and take top 'limit'
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return activities.slice(0, limit);
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

// Analytics Filter Functions

export const getFilteredCount = async (modelName, filter = {}) => {
  const models = { User, Vehicle, Trip, Organization, Driver, Maintenance, Fuel };
  const Model = models[modelName];
  if (!Model) throw new Error(`Model ${modelName} not found`);
  return Model.countDocuments(filter);
};

export const getFuelUsageAggregate = async (filter = {}) => {
  const result = await Fuel.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$liters' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

export const getOrgGrowthData = async (filter = {}) => {
  return Organization.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        value: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, name: "$_id", value: 1 } }
  ]);
};

export const getManagerGrowthData = async (filter = {}) => {
  return User.aggregate([
    { $match: { role: 'FLEET_MANAGER', ...filter } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        value: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, name: "$_id", value: 1 } }
  ]);
};

export const getSubscriptionDistribution = async () => {
  return Organization.aggregate([
    {
      $group: {
        _id: "$plan",
        value: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ["$_id", "Standard"] },
        value: 1
      }
    }
  ]);
};

export const getLoginActivityData = async (filter = {}) => {
  // In a real app, you'd use an Audit/Login log collection. 
  // Since we don't have one, we'll return mock trends based on recent users.
  return [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 18 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 20 },
    { name: 'Fri', value: 25 },
    { name: 'Sat', value: 10 },
    { name: 'Sun', value: 8 },
  ];
};
