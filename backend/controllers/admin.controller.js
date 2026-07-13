import { getAdminDashboardData, getAdminAnalyticsData } from '../services/admin.service.js';
import { createManager as createManagerInRepo, getAllManagers, getManagerById, updateManager as updateManagerInRepo, deleteManager as deleteManagerInRepo, createOrganization as createOrgInRepo, getAllOrganizations, getOrganizationById as getOrgByIdInRepo, updateOrganization as updateOrgInRepo, deleteOrganization as deleteOrgInRepo } from '../repositories/admin.repository.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAction } from '../services/audit.service.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import os from 'os';

export const getDashboard = async (_req, res, next) => {
  try {
    const data = await getAdminDashboardData();
    return sendSuccess(res, 200, data, 'Dashboard loaded');
  } catch (error) {
    next(error);
  }
};

export const listOrganizations = async (_req, res, next) => {
  try {
    const orgs = await getAllOrganizations();
    
    // Map to frontend expected format
    const formattedOrgs = await Promise.all(orgs.map(async (org) => {
      const activeManagers = await User.countDocuments({ organization: org._id, role: 'FLEET_MANAGER' });
      return {
        id: org._id.toString(),
        name: org.name,
        email: org.email,
        phone: org.phone,
        industry: org.industry,
        subscription: org.plan || 'Standard',
        status: org.status || 'Pending',
        createdAt: new Date(org.createdAt).toLocaleDateString(),
        activeManagers: activeManagers,
      };
    }));
    
    return sendSuccess(res, 200, formattedOrgs, 'Organizations fetched');
  } catch (error) {
    next(error);
  }
};

export const createOrganization = async (req, res, next) => {
  try {
    const { name, industry, email, phone, address, city, state, country, plan, status } = req.body;

    if (!name || !industry || !email) {
      return sendError(res, 400, 'Name, industry, and email are required');
    }

    const org = await createOrgInRepo({ name, industry, email, phone, address, city, state, country, plan, status });
    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Organization Created',
      organization: name,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    
    if (req.user && req.user._id) {
      await Notification.create({
        recipient: req.user._id,
        title: 'Organization Created',
        message: `Organization ${name} was created successfully.`,
        type: 'success',
        priority: 'medium'
      });
    }

    return sendSuccess(res, 201, org, 'Organization created');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'An organization with this email already exists');
    }
    next(error);
  }
};

export const getOrganizationDetails = async (req, res, next) => {
  try {
    const org = await getOrgByIdInRepo(req.params.id);
    if (!org) return sendError(res, 404, 'Organization not found');
    
    const activeManagers = await User.countDocuments({ organization: org._id, role: 'FLEET_MANAGER' });
    
    const formattedOrg = {
      id: org._id.toString(),
      name: org.name,
      email: org.email,
      phone: org.phone,
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      industry: org.industry,
      plan: org.plan || 'Standard',
      status: org.status || 'Pending',
      activeManagers: activeManagers
    };
    
    return sendSuccess(res, 200, formattedOrg, 'Organization details fetched');
  } catch (error) {
    next(error);
  }
};

export const updateOrganization = async (req, res, next) => {
  try {
    const org = await updateOrgInRepo(req.params.id, req.body);
    if (!org) return sendError(res, 404, 'Organization not found');
    
    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Organization Updated',
      organization: org.name,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    
    if (req.user && req.user._id) {
      await Notification.create({
        recipient: req.user._id,
        title: 'Organization Updated',
        message: `Organization ${org.name} was updated successfully.`,
        type: 'success',
        priority: 'medium'
      });
    }
    
    return sendSuccess(res, 200, org, 'Organization updated');
  } catch (error) {
    next(error);
  }
};

export const deleteOrganization = async (req, res, next) => {
  try {
    const org = await deleteOrgInRepo(req.params.id);
    if (!org) return sendError(res, 404, 'Organization not found');
    
    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Organization Deleted',
      organization: org.name,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    
    return sendSuccess(res, 200, null, 'Organization deleted');
  } catch (error) {
    next(error);
  }
};

export const listManagers = async (_req, res, next) => {
  try {
    const managers = await getAllManagers();
    
    // Map to frontend expected format
    const formattedManagers = managers.map(manager => {
      // Create initials from name
      const nameParts = (manager.name || '').split(' ');
      const initials = nameParts.length > 1 
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
        : nameParts[0]?.substring(0, 2) || 'NA';

      return {
        id: manager._id.toString(),
        name: manager.name,
        email: manager.email,
        phone: manager.phone || 'N/A',
        org: manager.organization ? manager.organization.name : 'N/A', // Extract populated name
        role: manager.role === 'FLEET_MANAGER' ? 'Fleet Manager' : manager.role,
        status: manager.status || 'Active', // Default to active if not set in schema
        lastLogin: manager.lastLogin ? new Date(manager.lastLogin).toLocaleDateString() : 'Never',
        initials: initials.toUpperCase()
      };
    });

    return sendSuccess(res, 200, formattedManagers, 'Fleet managers fetched');
  } catch (error) {
    next(error);
  }
};

export const createManager = async (req, res, next) => {
  try {
    const { name, email, password, phone, organization, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required');
    }

    const hashedPassword = await hashPassword(password);
    const manager = await createManagerInRepo({ 
      name, 
      email, 
      password: hashedPassword, 
      phone, 
      organization,
      role: role === 'Admin' ? 'ADMIN' : (role === 'Dispatcher' ? 'DISPATCHER' : 'FLEET_MANAGER')
    });

    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Fleet Manager Added',
      organization: organization || '—',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });

    if (req.user && req.user._id) {
      await Notification.create({
        recipient: req.user._id,
        title: 'Fleet Manager Added',
        message: `Fleet manager ${name} was created successfully.`,
        type: 'success',
        priority: 'medium'
      });
    }

    return sendSuccess(res, 201, { id: manager._id, name: manager.name, email: manager.email, role: manager.role }, 'Fleet manager created');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'A user with this email already exists');
    }
    next(error);
  }
};

export const getManagerDetails = async (req, res, next) => {
  try {
    const manager = await getManagerById(req.params.id);
    if (!manager) return sendError(res, 404, 'Fleet manager not found');
    
    const formattedManager = {
      id: manager._id.toString(),
      name: manager.name,
      email: manager.email,
      phone: manager.phone || '',
      organization: manager.organization ? manager.organization._id.toString() : '',
      orgName: manager.organization ? manager.organization.name : 'N/A',
      role: manager.role,
      status: manager.status || 'Active'
    };
    
    return sendSuccess(res, 200, formattedManager, 'Fleet manager details fetched');
  } catch (error) {
    next(error);
  }
};

export const updateManager = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    const manager = await updateManagerInRepo(req.params.id, updateData);
    if (!manager) return sendError(res, 404, 'Fleet manager not found');
    
    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Fleet Manager Updated',
      organization: manager.organization ? manager.organization.toString() : '—',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    
    if (req.user && req.user._id) {
      await Notification.create({
        recipient: req.user._id,
        title: 'Fleet Manager Updated',
        message: `Fleet manager ${manager.name} was updated successfully.`,
        type: 'success',
        priority: 'medium'
      });
    }
    
    return sendSuccess(res, 200, manager, 'Fleet manager updated');
  } catch (error) {
    next(error);
  }
};

export const deleteManager = async (req, res, next) => {
  try {
    const manager = await deleteManagerInRepo(req.params.id);
    if (!manager) return sendError(res, 404, 'Fleet manager not found');
    
    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Fleet Manager Deleted',
      organization: manager.organization ? manager.organization.toString() : '—',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    
    return sendSuccess(res, 200, null, 'Fleet manager deleted');
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { filter } = req.query; // 'today', 'week', 'month', 'year', or undefined
    const data = await getAdminAnalyticsData(filter);
    return sendSuccess(res, 200, data, 'Analytics data loaded');
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (_req, res, next) => {
  try {
    // 1. API Status (Self-reporting, if it answers it's online)
    const apiStatus = { status: 'Operational', value: '99.9%' };

    // 2. Database Status
    const dbState = mongoose.connection.readyState;
    let dbStatus = 'Down';
    if (dbState === 1) dbStatus = 'Healthy';
    else if (dbState === 2) dbStatus = 'Connecting';
    else if (dbState === 3) dbStatus = 'Disconnecting';

    // 3. Server Status & Uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const uptimeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h`;

    // 4. Response Time (Mocked logic for simplicity, could measure request start to now)
    const responseTime = `${Math.floor(Math.random() * 50) + 10}ms`;

    // 5. CPU Usage (Load avg over 1 min / num CPUs)
    const cpus = os.cpus().length;
    const loadAvg = os.loadavg()[0];
    const cpuUsagePct = Math.min(Math.round((loadAvg / cpus) * 100), 100);

    // 6. Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePct = Math.round((usedMem / totalMem) * 100);

    // 7. Storage Usage (Mocked to 62% for now since Node cross-platform disk usage is complex)
    const storageUsagePct = 62;

    const healthData = {
      api: apiStatus,
      database: { status: 'Operational', value: dbStatus },
      server: { status: 'Operational', value: 'Online' },
      responseTime: { status: 'Normal', value: responseTime },
      storage: { status: 'Normal', value: `${storageUsagePct}%` },
      cpu: { status: cpuUsagePct < 80 ? 'Normal' : 'High', value: `${cpuUsagePct}%` },
      memory: { status: memUsagePct < 85 ? 'Normal' : 'High', value: `${memUsagePct}%` },
      uptime: { status: 'Operational', value: uptimeStr }
    };

    return sendSuccess(res, 200, healthData, 'System health retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Build filter query
    const filter = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { user: searchRegex },
        { action: searchRegex },
        { organization: searchRegex },
        { status: searchRegex }
      ];
    }

    const totalLogs = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const formattedLogs = logs.map(log => ({
      id: log._id.toString(),
      timestamp: new Date(log.createdAt).toLocaleString('en-US', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }),
      user: log.user,
      action: log.action,
      organization: log.organization,
      ip: log.ipAddress,
      status: log.status
    }));

    return sendSuccess(res, 200, {
      logs: formattedLogs,
      pagination: {
        total: totalLogs,
        page: pageNum,
        totalPages: Math.ceil(totalLogs / limitNum),
        limit: limitNum
      }
    }, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (_req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({}); // Creates with default values
    }
    return sendSuccess(res, 200, setting, 'Settings fetched');
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { platformName, timezone, language } = req.body;
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }

    if (platformName) setting.platformName = platformName;
    if (timezone) setting.timezone = timezone;
    if (language) setting.language = language;

    // Handle logo upload
    if (req.file) {
      // upload to cloudinary
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'fleet_settings');
      setting.logoUrl = uploadResult.secure_url;
    }

    await setting.save();
    
    // Log the action
    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Platform Settings Updated',
      organization: '—',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });

    return sendSuccess(res, 200, setting, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getSecuritySettings = async (_req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    return sendSuccess(res, 200, setting.security || {}, 'Security settings fetched');
  } catch (error) {
    next(error);
  }
};

export const updateSecuritySettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }

    // Merge req.body into security
    setting.security = {
      ...setting.security.toObject(),
      ...req.body
    };

    await setting.save();

    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Security Settings Updated',
      organization: '—',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });

    return sendSuccess(res, 200, setting.security, 'Security settings updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getNotificationSettings = async (_req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    return sendSuccess(res, 200, setting.notifications || {}, 'Notification settings fetched');
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }

    // Merge req.body into notifications
    setting.notifications = {
      ...setting.notifications.toObject(),
      ...req.body
    };

    await setting.save();

    await logAction({
      user: req.user ? req.user.email : 'Admin',
      action: 'Notification Settings Updated',
      organization: '—',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });

    return sendSuccess(res, 200, setting.notifications, 'Notification settings updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, user, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // Handle password change if requested
    if (currentPassword && newPassword) {
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return sendError(res, 400, 'Incorrect current password');
      }
      user.password = await hashPassword(newPassword);
    }

    // Handle profile image upload
    if (req.file) {
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'fleet_profiles');
      user.profileImage = uploadResult.secure_url;
    }

    await user.save();
    
    // Log action
    await logAction({
      user: user.email,
      action: 'Profile Updated',
      organization: '—',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });

    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    return sendSuccess(res, 200, updatedUser, 'Profile updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'Email is already in use by another account');
    }
    next(error);
  }
};
