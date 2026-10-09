import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';
import Analytics from '../models/Analytics.js';
import Organization from '../models/Organization.js';
import PlatformIssue from '../models/PlatformIssue.js';
import Settings from '../models/Settings.js';
import { calculateDistance } from '../utils/distanceCalculator.js';
import { calculateTripFinance } from '../utils/earningsCalculator.js';

export const getAllManagers = async () => {
  return User.find({ role: { $in: ['FLEET_MANAGER', 'fleet_manager'] } }).populate('organization', 'name status _id').select('-password');
};

export const createManager = async (managerData) => {
  const manager = new User({ role: 'FLEET_MANAGER', ...managerData });
  return manager.save();
};

export const getManagerById = async (id) => {
  return User.findOne({ _id: id, role: { $in: ['FLEET_MANAGER', 'fleet_manager'] } }).populate('organization', 'name status _id').select('-password');
};

export const getDistinctOrganizations = async (filter = {}) => {
  const query = {};
  if (filter.isActive === true) {
    query.status = 'Active';
  } else if (filter.isActive === false) {
    query.status = { $ne: 'Active' };
  } else if (filter.status) {
    query.status = filter.status;
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

export const VALID_SETTLED_TRIP_STATUSES = [
  'Completed',
  'COMPLETED',
  'completed',
  'Delivered',
  'DELIVERED',
  'delivered',
  'Complete Trip',
  'COMPLETE TRIP',
  'complete trip'
];

export const VALID_TRIP_CONDITION = {
  status: { $nin: ['Cancelled', 'Rejected', 'CANCELLED', 'REJECTED'] }
};

export const SETTLED_TRIP_CONDITION = {
  $or: [
    { status: { $in: VALID_SETTLED_TRIP_STATUSES } },
    { status: { $regex: /^(completed|delivered|complete trip)$/i } },
    { tripEnded: true }
  ]
};

export const fetchInvoicesMap = async (trips = []) => {
  if (!trips || trips.length === 0) return new Map();
  const tripIds = trips.map(t => t._id).filter(Boolean);
  const invoiceNumbers = trips.map(t => t.tripInvoice?.invoiceNumber).filter(Boolean);

  const invoices = await Invoice.find({
    $or: [
      { trip: { $in: tripIds } },
      { invoiceNumber: { $in: invoiceNumbers } }
    ]
  }).lean();

  const invoiceMap = new Map();
  invoices.forEach(inv => {
    if (inv.trip) invoiceMap.set(inv.trip.toString(), inv);
    if (inv.invoiceNumber) invoiceMap.set(inv.invoiceNumber, inv);
  });
  return invoiceMap;
};

export const calculateTripRevenue = (dist, weight, trip = {}, invoice = null) => {
  const fin = calculateTripFinance(trip, invoice);
  return fin.revenue;
};

export const getSettledRevenueForOrganization = async (orgId) => {
  try {
    const orgManagers = await User.find({ role: 'FLEET_MANAGER', organization: orgId }).select('_id');
    const orgManagerIds = orgManagers.map(m => m._id);

    const trips = await Trip.find({
      $and: [
        {
          $or: [
            { organization: orgId },
            { assignedManager: { $in: orgManagerIds } }
          ]
        },
        VALID_TRIP_CONDITION
      ]
    }).lean();

    if (!trips || trips.length === 0) return 0;

    const invoiceMap = await fetchInvoicesMap(trips);

    return trips.reduce((sum, t) => {
      const inv = invoiceMap.get(t._id?.toString()) || (t.tripInvoice?.invoiceNumber ? invoiceMap.get(t.tripInvoice.invoiceNumber) : null);
      const fin = calculateTripFinance(t, inv);
      return sum + fin.revenue;
    }, 0);
  } catch (error) {
    console.error('Error in getSettledRevenueForOrganization:', error);
    return 0;
  }
};

export const getSettledRevenueForManager = async (managerId, orgId = null) => {
  try {
    let trips = [];
    if (orgId) {
      const orgManagers = await User.find({ role: 'FLEET_MANAGER', organization: orgId }).select('_id');
      if (orgManagers.length === 1) {
        trips = await Trip.find({
          $and: [
            {
              $or: [
                { organization: orgId },
                { assignedManager: managerId }
              ]
            },
            VALID_TRIP_CONDITION
          ]
        }).lean();
      } else {
        trips = await Trip.find({
          $and: [
            {
              $or: [
                { assignedManager: managerId },
                { organization: orgId, assignedManager: { $in: [null, undefined] } }
              ]
            },
            VALID_TRIP_CONDITION
          ]
        }).lean();
      }
    } else {
      trips = await Trip.find({
        $and: [
          { assignedManager: managerId },
          VALID_TRIP_CONDITION
        ]
      }).lean();
    }

    if (!trips || trips.length === 0) return 0;

    const invoiceMap = await fetchInvoicesMap(trips);

    return trips.reduce((sum, t) => {
      const inv = invoiceMap.get(t._id?.toString()) || (t.tripInvoice?.invoiceNumber ? invoiceMap.get(t.tripInvoice.invoiceNumber) : null);
      const fin = calculateTripFinance(t, inv);
      return sum + fin.revenue;
    }, 0);
  } catch (error) {
    console.error('Error in getSettledRevenueForManager:', error);
    return 0;
  }
};

export const getRevenueAggregate = async () => {
  try {
    const trips = await Trip.find(VALID_TRIP_CONDITION).lean();
    if (!trips || trips.length === 0) return 0;

    const invoiceMap = await fetchInvoicesMap(trips);

    return trips.reduce((sum, t) => {
      const inv = invoiceMap.get(t._id?.toString()) || (t.tripInvoice?.invoiceNumber ? invoiceMap.get(t.tripInvoice.invoiceNumber) : null);
      const fin = calculateTripFinance(t, inv);
      return sum + fin.revenue;
    }, 0);
  } catch (error) {
    console.error('Error in getRevenueAggregate:', error);
    return 0;
  }
};

export const getTodayRevenueAggregate = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const trips = await Trip.find({
      $and: [
        VALID_TRIP_CONDITION,
        {
          $or: [
            { actualEndTime: { $gte: startOfDay } },
            { endedAt: { $gte: startOfDay } },
            { completedAt: { $gte: startOfDay } },
            { updatedAt: { $gte: startOfDay } },
            { createdAt: { $gte: startOfDay } },
            { departureTime: { $gte: startOfDay.toISOString() } }
          ]
        }
      ]
    }).lean();

    if (!trips || trips.length === 0) return 0;

    const invoiceMap = await fetchInvoicesMap(trips);

    return trips.reduce((sum, t) => {
      const inv = invoiceMap.get(t._id?.toString()) || (t.tripInvoice?.invoiceNumber ? invoiceMap.get(t.tripInvoice.invoiceNumber) : null);
      const fin = calculateTripFinance(t, inv);
      return sum + fin.revenue;
    }, 0);
  } catch (error) {
    console.error('Error in getTodayRevenueAggregate:', error);
    return 0;
  }
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
    const trips = await Trip.find(VALID_TRIP_CONDITION).lean();
    const monthlyMap = {};
    for (let i = 1; i <= 12; i++) {
      monthlyMap[i] = 0;
    }

    if (trips && trips.length > 0) {
      const invoiceMap = await fetchInvoicesMap(trips);
      trips.forEach(t => {
        const tripDate = t.actualEndTime || t.endedAt || t.completedAt || t.updatedAt || t.createdAt;
        if (tripDate) {
          const m = new Date(tripDate).getMonth() + 1;
          const inv = invoiceMap.get(t._id?.toString()) || (t.tripInvoice?.invoiceNumber ? invoiceMap.get(t.tripInvoice.invoiceNumber) : null);
          const fin = calculateTripFinance(t, inv);
          monthlyMap[m] = (monthlyMap[m] || 0) + fin.revenue;
        }
      });
    }

    return Object.keys(monthlyMap).map(m => ({
      _id: Number(m),
      total: monthlyMap[m] || 0
    }));
  } catch (error) {
    console.error('Error in getRevenueChartData:', error);
    return [];
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
  return User.findOneAndDelete({ _id: id, role: { $in: ['FLEET_MANAGER', 'fleet_manager'] } });
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
  return Notification.find({
    $or: [
      { recipientRole: { $in: ['SUPER_ADMIN', 'admin', 'ADMIN'] } },
      { recipientRole: { $exists: false } },
      { recipientRole: null },
      { type: { $in: ['CONTACT_REQUEST', 'contact_request', 'SUBSCRIPTION_REQUEST', 'subscription_request', 'system', 'alert', 'maintenance_ticket', 'user_registered'] } }
    ]
  }).populate('organization', 'name email phone').sort({ createdAt: -1 });
};

export const markNotificationReadInRepo = async (id) => {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

export const markAllNotificationsReadInRepo = async () => {
  return Notification.updateMany({
    $or: [
      { recipientRole: { $in: ['SUPER_ADMIN', 'admin', 'ADMIN'] } },
      { recipientRole: { $exists: false } },
      { recipientRole: null },
      { type: { $in: ['CONTACT_REQUEST', 'contact_request', 'SUBSCRIPTION_REQUEST', 'subscription_request', 'system', 'alert', 'maintenance_ticket', 'user_registered'] } }
    ],
    isRead: false
  }, { isRead: true });
};

export const deleteNotificationInRepo = async (id) => {
  return Notification.findByIdAndDelete(id);
};
