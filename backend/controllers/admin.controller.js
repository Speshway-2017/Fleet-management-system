import { getAdminDashboardData, getMonthlyGrowthStats } from '../services/admin.service.js';
import {
  createManager as createManagerInRepo,
  getAllManagers,
  getManagerById,
  createOrganization as createOrgInRepo,
  getAllOrganizations,
  updateOrganizationById,
  deleteOrganizationById,
  getOrganizationById,
  updateManagerById,
  deleteManagerById,
  getSettingsData,
  updateSettingsData,
  createPlatformIssueInRepo,
  getAllPlatformIssues,
  getPlatformIssueByIdInRepo,
  updatePlatformIssueInRepo,
  deletePlatformIssueInRepo,
  createNotificationInRepo,
  getAdminNotificationsInRepo,
  markNotificationReadInRepo,
  markAllNotificationsReadInRepo,
  deleteNotificationInRepo
} from '../repositories/admin.repository.js';
import { changeUserPassword } from '../services/auth.service.js';
import { hashPassword } from '../utils/hashPassword.js';
import { sendSuccess, sendError } from '../utils/response.js';
import sendEmail from '../utils/email.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import PlatformIssue from '../models/PlatformIssue.js';
import Notification from '../models/Notification.js';

// Dashboard
export const getDashboard = async (_req, res, next) => {
  try {
    const data = await getAdminDashboardData();
    return sendSuccess(res, 200, data, 'Dashboard loaded');
  } catch (error) {
    next(error);
  }
};

// Organizations
export const listOrganizations = async (_req, res, next) => {
  try {
    const orgs = await getAllOrganizations();
    
    // Map to frontend expected format
    const formattedOrgs = await Promise.all(orgs.map(async (org) => {
      const activeManagers = await User.countDocuments({
        role: 'FLEET_MANAGER',
        organization: org._id
      });
      return {
        id: org._id.toString(),
        name: org.name,
        email: org.email,
        phone: org.phone,
        industry: org.industry,
        subscription: org.plan || 'Standard',
        status: org.status || 'Pending',
        createdAt: new Date(org.createdAt).toLocaleDateString(),
        activeManagers,
        managers: activeManagers, // support details page
        joined: new Date(org.createdAt).toLocaleDateString(),
        address: org.address,
        city: org.city,
        state: org.state,
        country: org.country,
        plan: org.plan
      };
    }));
    
    return sendSuccess(res, 200, formattedOrgs, 'Organizations fetched');
  } catch (error) {
    next(error);
  }
};

export const getOrganizationDetails = async (req, res, next) => {
  try {
    const org = await getOrganizationById(req.params.id);
    if (!org) return sendError(res, 404, 'Organization not found');

    const User = (await import('../models/User.js')).default;
    const Vehicle = (await import('../models/Vehicle.js')).default;
    const Trip = (await import('../models/Trip.js')).default;
    const Analytics = (await import('../models/Analytics.js')).default;

    const activeManagers = await User.countDocuments({ role: 'FLEET_MANAGER', organization: org._id });
    const totalVehicles = await Vehicle.countDocuments({ organization: org._id });
    // Assuming active trips for organization: we can query trips whose vehicles belong to this org, or maybe the manager's org. Since trips don't have org directly, we can aggregate or maybe just query by manager if we don't have an org field on Trip.
    // Wait, let's query the managers of this org and then query trips assigned to those managers.
    const orgManagers = await User.find({ role: 'FLEET_MANAGER', organization: org._id });
    const orgManagerIds = orgManagers.map(m => m._id);

    // Active trips per manager
    const activeTripsAgg = await Trip.aggregate([
      { $match: { assignedManager: { $in: orgManagerIds }, status: 'Active' } },
      { $group: { _id: '$assignedManager', count: { $sum: 1 } } }
    ]);

    // Revenue per manager
    const revenuePerManagerAgg = await Analytics.aggregate([
      { $match: { metric: 'Revenue', recordedBy: { $in: orgManagerIds } } },
      { $group: { _id: '$recordedBy', total: { $sum: '$value' } } }
    ]);

    const managersWithStats = orgManagers.map(manager => {
      const activeTripsCount = activeTripsAgg.find(t => t._id.toString() === manager._id.toString())?.count || 0;
      const totalRevenue = revenuePerManagerAgg.find(r => r._id.toString() === manager._id.toString())?.total || 0;
      const nameParts = (manager.name || '').split(' ');
      const initials = nameParts.length > 1 
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
        : nameParts[0]?.substring(0, 2) || 'NA';

      return {
        id: manager._id.toString(),
        name: manager.name,
        email: manager.email,
        status: manager.status || (manager.isActive ? 'Active' : 'Inactive'),
        initials: initials.toUpperCase(),
        stats: {
          activeTripsCount,
          totalRevenue
        }
      };
    });

    const activeTripsCount = managersWithStats.reduce((sum, m) => sum + m.stats.activeTripsCount, 0);
    const totalRevenue = managersWithStats.reduce((sum, m) => sum + m.stats.totalRevenue, 0);

    const formattedOrg = {
      id: org._id.toString(),
      name: org.name,
      email: org.email,
      phone: org.phone,
      industry: org.industry,
      subscription: org.plan || 'Standard',
      status: org.status || 'Pending',
      createdAt: new Date(org.createdAt).toLocaleDateString(),
      activeManagers,
      managers: activeManagers,
      joined: new Date(org.createdAt).toLocaleDateString(),
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      plan: org.plan,
      fleetManagers: managersWithStats,
      stats: {
        totalFleetManagers: activeManagers,
        totalVehicles,
        totalActiveTrips: activeTripsCount,
        totalRevenue
      }
    };

    return sendSuccess(res, 200, formattedOrg, 'Organization details fetched');
  } catch (error) {
    next(error);
  }
};

export const createOrganization = async (req, res, next) => {
  try {
    const { name, industry, email, phone, address, city, state, country, plan, status } = req.body;

    console.log('[DEBUG createOrganization] req.body:', req.body);

    if (!name || !industry || !email) {
      return sendError(res, 400, 'Name, industry, and email are required');
    }

    const org = await createOrgInRepo({ name, industry, email, phone, address, city, state, country, plan, status: status || 'Pending' });

    // Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: 'Organization Registered',
      message: `Organization "${org.name}" has been onboarded successfully under "${org.plan || 'Standard'}" plan.`,
      type: 'success',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id
    });
    if (req.io) {
      req.io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 201, org, 'Organization created');
  } catch (error) {
    console.error('[ERROR createOrganization] Failed with error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return sendError(res, 400, `Validation failed: ${messages.join(', ')}`);
    }
    if (error.code === 11000) {
      return sendError(res, 400, 'An organization with this email already exists');
    }
    next(error);
  }
};

export const updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[DEBUG updateOrganization] req.params.id:', id);
    console.log('[DEBUG updateOrganization] req.body:', req.body);

    const oldOrg = await getOrganizationById(id);
    if (!oldOrg) return sendError(res, 404, 'Organization not found');

    const updatedOrg = await updateOrganizationById(id, req.body);
    
    // Check status activation/deactivation
    let statusMsg = '';
    let notificationType = 'system';
    if (req.body.status && req.body.status !== oldOrg.status) {
      if (req.body.status === 'Active') {
        statusMsg = ' and activated';
        notificationType = 'success';
      } else if (req.body.status === 'Suspended') {
        statusMsg = ' and suspended/deactivated';
        notificationType = 'warning';
      } else {
        statusMsg = ` and status set to ${req.body.status}`;
      }
    }

    // Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: statusMsg ? 'Organization Status Changed' : 'Organization Updated',
      message: `Organization "${updatedOrg.name}" details have been updated${statusMsg}.`,
      type: notificationType,
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id
    });
    if (req.io) {
      req.io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 200, updatedOrg, 'Organization updated successfully');
  } catch (error) {
    console.error('[ERROR updateOrganization] Failed with error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return sendError(res, 400, `Validation failed: ${messages.join(', ')}`);
    }
    if (error.code === 11000) {
      return sendError(res, 400, 'An organization with this email already exists');
    }
    next(error);
  }
};

export const deleteOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = await getOrganizationById(id);
    if (!org) return sendError(res, 404, 'Organization not found');

    await deleteOrganizationById(id);

    // Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: 'Organization Deleted',
      message: `Organization "${org.name}" has been deleted from the platform.`,
      type: 'danger',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id
    });
    if (req.io) {
      req.io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 200, null, 'Organization deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Fleet Managers
export const listManagers = async (_req, res, next) => {
  try {
    const managers = await getAllManagers();
    
    // Map to frontend expected format
    const formattedManagers = managers.map(manager => {
      const nameParts = (manager.name || '').split(' ');
      const initials = nameParts.length > 1 
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
        : nameParts[0]?.substring(0, 2) || 'NA';

      return {
        id: manager._id.toString(),
        name: manager.name,
        email: manager.email,
        phone: manager.phone || 'N/A',
        org: manager.organization ? manager.organization.name : 'N/A',
        organization: manager.organization ? {
          _id: manager.organization._id.toString(),
          id: manager.organization._id.toString(),
          name: manager.organization.name
        } : null,
        organizationId: manager.organization ? manager.organization._id.toString() : null,
        role: manager.role === 'FLEET_MANAGER' ? 'Fleet Manager' : manager.role,
        status: manager.status || (manager.isActive ? 'Active' : 'Inactive'),
        lastLogin: manager.lastLogin ? new Date(manager.lastLogin).toLocaleDateString() : 'Never',
        initials: initials.toUpperCase(),
        created: new Date(manager.createdAt).toLocaleDateString()
      };
    });

    return sendSuccess(res, 200, formattedManagers, 'Fleet managers fetched');
  } catch (error) {
    next(error);
  }
};

export const createManager = async (req, res, next) => {
  try {
    const { name, email, password, phone, organization } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required");
    }

    const hashedPassword = await hashPassword(password);

    const manager = await createManagerInRepo({
      name,
      email,
      password: hashedPassword,
      phone,
      organization,
      role: "FLEET_MANAGER",
      status: "Active",
      isActive: true
    });

    // Resolve Org Name for Notification
    let orgName = 'N/A';
    if (organization) {
      const orgObj = await getOrganizationById(organization);
      if (orgObj) orgName = orgObj.name;
    }

    // Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: 'Fleet Manager Created',
      message: `Fleet Manager "${manager.name}" has been created and assigned to "${orgName}".`,
      type: 'success',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id
    });
    if (req.io) {
      req.io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    // Send account email
    await sendEmail({
      email: manager.email,
      subject: "Fleet Management - Account Created",
      message: `Hello ${manager.name},

Your Fleet Management account has been created successfully.

Login Credentials:
Email: ${manager.email}
Password: ${password}

Please login and change your password after your first login.

Regards,
Fleet Management Team`,
    });

    return sendSuccess(
      res,
      201,
      {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
      },
      "Fleet manager created successfully"
    );
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, "A user with this email already exists");
    }
    next(error);
  }
};

export const updateManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[DEBUG updateManager] req.params.id:', id);
    console.log('[DEBUG updateManager] req.body:', req.body);

    const oldManager = await getManagerById(id);
    if (!oldManager) return sendError(res, 404, 'Fleet manager not found');

    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    } else {
      delete updateData.password;
    }

    // Resolve organization ID from name if needed
    if (updateData.org) {
      const orgObj = await Organization.findOne({ name: updateData.org });
      if (orgObj) {
        updateData.organization = orgObj._id;
      }
    }

    if (updateData.fullName) {
      updateData.name = updateData.fullName;
    }

    const updatedManager = await updateManagerById(id, updateData);

    // Check status changes
    let statusMsg = '';
    let notificationType = 'system';
    if (updateData.status && updateData.status !== oldManager.status) {
      if (updateData.status === 'Active') {
        statusMsg = ' and activated';
        notificationType = 'success';
        await User.findByIdAndUpdate(id, { isActive: true, status: 'Active' });
      } else if (updateData.status === 'Inactive') {
        statusMsg = ' and deactivated';
        notificationType = 'warning';
        await User.findByIdAndUpdate(id, { isActive: false, status: 'Inactive' });
      }
    }

    // Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: statusMsg ? 'Fleet Manager Status Changed' : 'Fleet Manager Updated',
      message: `Fleet Manager "${updatedManager.name}" details have been updated${statusMsg}.`,
      type: notificationType,
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id
    });
    if (req.io) {
      req.io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 200, updatedManager, 'Fleet manager updated successfully');
  } catch (error) {
    console.error('[ERROR updateManager] Failed with error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return sendError(res, 400, `Validation failed: ${messages.join(', ')}`);
    }
    if (error.code === 11000) {
      return sendError(res, 400, 'A user with this email already exists');
    }
    next(error);
  }
};

export const deleteManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const manager = await getManagerById(id);
    if (!manager) return sendError(res, 404, 'Fleet manager not found');

    await deleteManagerById(id);

    // Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: 'Fleet Manager Deleted',
      message: `Fleet Manager "${manager.name}" has been deleted.`,
      type: 'danger',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id
    });
    if (req.io) {
      req.io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 200, null, 'Fleet manager deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getManagerDetails = async (req, res, next) => {
  try {
    const manager = await getManagerById(req.params.id);
    if (!manager) return sendError(res, 404, 'Fleet manager not found');

    const nameParts = (manager.name || '').split(' ');
    const initials = nameParts.length > 1 
      ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
      : nameParts[0]?.substring(0, 2) || 'NA';

    let orgManagersCount = 0;
    let vehiclesCount = 0;
    let activeTripsCount = 0;
    let totalRevenue = 0;

    if (manager.organization) {
      orgManagersCount = await User.countDocuments({ role: 'FLEET_MANAGER', organization: manager.organization._id });
      
      const Vehicle = (await import('../models/Vehicle.js')).default;
      vehiclesCount = await Vehicle.countDocuments({ organization: manager.organization._id });
      
      const Trip = (await import('../models/Trip.js')).default;
      // Depending on schema, assignedManager might be used, or driver's organization. We'll use assignedManager for now or we just query trips where assignedManager = manager._id. Wait, tripSchema has assignedManager.
      activeTripsCount = await Trip.countDocuments({ assignedManager: manager._id, status: 'Active' });
      
      const Analytics = (await import('../models/Analytics.js')).default;
      const revenueAgg = await Analytics.aggregate([
        { $match: { metric: 'Revenue', recordedBy: manager._id } },
        { $group: { _id: null, total: { $sum: "$value" } } }
      ]);
      totalRevenue = revenueAgg[0]?.total || 0;
    }

    const formatted = {
      id: manager._id.toString(),
      name: manager.name,
      email: manager.email,
      phone: manager.phone || 'N/A',
      org: manager.organization ? manager.organization.name : 'N/A',
      organization: manager.organization ? {
        _id: manager.organization._id.toString(),
        id: manager.organization._id.toString(),
        name: manager.organization.name
      } : null,
      organizationId: manager.organization ? manager.organization._id.toString() : null,
      role: manager.role === 'FLEET_MANAGER' ? 'Fleet Manager' : manager.role,
      status: manager.status || (manager.isActive ? 'Active' : 'Inactive'),
      lastLogin: manager.lastLogin ? new Date(manager.lastLogin).toLocaleDateString() : 'Never',
      initials: initials.toUpperCase(),
      created: new Date(manager.createdAt).toLocaleDateString(),
      stats: {
        orgManagersCount,
        vehiclesCount,
        activeTripsCount,
        totalRevenue
      }
    };

    return sendSuccess(res, 200, formatted, 'Fleet manager details fetched');
  } catch (error) {
    next(error);
  }
};

// Settings
export const getSettings = async (_req, res, next) => {
  try {
    const settings = await getSettingsData();
    return sendSuccess(res, 200, settings, 'Settings fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await updateSettingsData(req.body);
    
    await createNotificationInRepo({
      title: 'Settings Updated',
      message: `Platform settings have been updated.`,
      type: 'system',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id
    });

    return sendSuccess(res, 200, settings, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
};

// Platform Issues
export const createIssue = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return sendError(res, 400, 'Title and description are required');
    }

    const issue = await createPlatformIssueInRepo({
      title,
      description,
      reportedBy: req.user._id,
      status: 'Open'
    });

    // Create notifications automatically
    const notification = await createNotificationInRepo({
      title: 'Platform Issue Raised',
      message: `New Platform Issue "${title}" has been reported by ${req.user.name}.`,
      type: 'danger',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user._id
    });
    if (req.io) {
      req.io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 201, issue, 'Platform issue raised successfully');
  } catch (error) {
    next(error);
  }
};

export const listIssues = async (_req, res, next) => {
  try {
    const issues = await getAllPlatformIssues();
    return sendSuccess(res, 200, issues, 'Platform issues fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const oldIssue = await getPlatformIssueByIdInRepo(id);
    if (!oldIssue) return sendError(res, 404, 'Platform issue not found');

    const updatedIssue = await updatePlatformIssueInRepo(id, req.body);

    if (status && status !== oldIssue.status) {
      let title = 'Issue Status Updated';
      let type = 'warning';
      let message = `Platform Issue "${updatedIssue.title}" status changed to "${status}".`;

      if (status === 'Resolved') {
        title = 'Platform Issue Resolved';
        type = 'success';
        message = `Platform Issue "${updatedIssue.title}" has been resolved.`;
      } else if (status === 'Reopened') {
        title = 'Platform Issue Reopened';
        type = 'warning';
        message = `Platform Issue "${updatedIssue.title}" has been reopened.`;
      }

      // Create Admin notification
      const notification = await createNotificationInRepo({
        title,
        message,
        type,
        recipientRole: 'SUPER_ADMIN',
        createdBy: req.user?._id
      });
      if (req.io) {
        req.io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
      }
      
      // Notify reporting manager specifically
      await createNotificationInRepo({
        recipient: oldIssue.reportedBy._id,
        title,
        description: message,
        type,
        isRead: false
      });
    }

    return sendSuccess(res, 200, updatedIssue, 'Platform issue updated successfully');
  } catch (error) {
    next(error);
  }
};

// Analytics
export const getAnalytics = async (_req, res, next) => {
  try {
    const [
      totalOrgs,
      activeOrgs,
      suspendedOrgs,
      totalManagers,
      activeManagers,
      inactiveManagers,
      totalIssues,
      openIssues,
      closedIssues
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ status: 'Active' }),
      Organization.countDocuments({ status: 'Suspended' }),
      User.countDocuments({ role: 'FLEET_MANAGER' }),
      User.countDocuments({ role: 'FLEET_MANAGER', status: 'Active' }),
      User.countDocuments({ role: 'FLEET_MANAGER', status: 'Inactive' }),
      PlatformIssue.countDocuments(),
      PlatformIssue.countDocuments({ status: 'Open' }),
      PlatformIssue.countDocuments({ status: 'Resolved' })
    ]);

    const { orgGrowthData, managerGrowthData } = await getMonthlyGrowthStats();

    // Group organizations by plan for subscription distribution
    const plansAgg = await Organization.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    const plansMap = { Enterprise: 0, Professional: 0, Standard: 0 };
    plansAgg.forEach(p => {
      if (p._id && plansMap[p._id] !== undefined) {
        plansMap[p._id] = p.count;
      }
    });

    const subscriptionData = [
      { name: 'Enterprise', value: plansMap.Enterprise, color: '#0f172a' },
      { name: 'Professional', value: plansMap.Professional, color: '#b45309' },
      { name: 'Standard', value: plansMap.Standard, color: '#cbd5e1' },
    ];

    // Weekly login activity
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const loginActivityData = weekdayNames.map(day => ({ name: day, value: 0 }));
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const loginAgg = await User.aggregate([
      { $match: { lastLogin: { $gte: startOfWeek } } },
      { $group: { _id: { $dayOfWeek: '$lastLogin' }, count: { $sum: 1 } } }
    ]);

    loginAgg.forEach(item => {
      const idx = item._id - 1;
      if (idx >= 0 && idx < 7) {
        loginActivityData[idx].value = item.count;
      }
    });

    return sendSuccess(res, 200, {
      kpis: {
        organizations: {
          total: totalOrgs,
          active: activeOrgs,
          inactive: totalOrgs - activeOrgs,
          suspended: suspendedOrgs
        },
        managers: {
          total: totalManagers,
          active: activeManagers,
          inactive: inactiveManagers
        },
        issues: {
          total: totalIssues,
          open: openIssues,
          closed: closedIssues
        }
      },
      charts: {
        orgGrowthData,
        managerGrowthData,
        loginActivityData,
        subscriptionData
      }
    }, 'Analytics data loaded');
  } catch (error) {
    next(error);
  }
};

// Admin Notifications
export const getNotifications = async (_req, res, next) => {
  try {
    const notifications = await getAdminNotificationsInRepo();
    return sendSuccess(res, 200, notifications, 'Notifications fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markNotificationReadInRepo(req.params.id);
    if (!notification) return sendError(res, 404, 'Notification not found');
    
    // Emit notification:read event
    if (req.io) {
      // Emit to role room and admin room (if we know admin id, but for now role room)
      req.io.to(`role:SUPER_ADMIN`).emit('notification:read', notification);
    }
    
    return sendSuccess(res, 200, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await markAllNotificationsReadInRepo();
    
    // Emit notification:update event for all read
    if (req.io) {
      req.io.to(`role:SUPER_ADMIN`).emit('notification:update', { allRead: true });
    }
    
    return sendSuccess(res, 200, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await deleteNotificationInRepo(req.params.id);
    if (!notification) return sendError(res, 404, 'Notification not found');
    
    // Emit notification:delete event
    if (req.io) {
      req.io.to(`role:SUPER_ADMIN`).emit('notification:delete', { id: req.params.id });
    }
    
    return sendSuccess(res, 200, null, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Profile Update
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'Admin user not found');

    if (firstName || lastName) {
      user.name = `${firstName || ''} ${lastName || ''}`.trim();
    }
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    if (currentPassword && newPassword) {
      await changeUserPassword(user.email, currentPassword, newPassword);
    }

    await user.save();
    
    const updated = user.toObject();
    delete updated.password;

    return sendSuccess(res, 200, updated, 'Profile updated successfully');
  } catch (error) {
    if (error.message === 'Old password is incorrect') {
      return sendError(res, 401, error.message);
    }
    if (error.code === 11000) {
      return sendError(res, 409, 'Email address is already in use');
    }
    next(error);
  }
};
