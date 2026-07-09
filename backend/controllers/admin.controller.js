import { getAdminDashboardData, getAdminAnalyticsData } from '../services/admin.service.js';
import { createManager as createManagerInRepo, getAllManagers, getManagerById, createOrganization as createOrgInRepo, getAllOrganizations } from '../repositories/admin.repository.js';
import { hashPassword } from '../utils/hashPassword.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAction } from '../services/audit.service.js';
import AuditLog from '../models/AuditLog.js';
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
    const formattedOrgs = orgs.map(org => ({
      id: org._id.toString(),
      name: org.name,
      email: org.email,
      phone: org.phone,
      industry: org.industry,
      subscription: org.plan || 'Standard',
      status: org.status || 'Pending',
      createdAt: new Date(org.createdAt).toLocaleDateString(),
      activeManagers: 0, // Placeholder
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
    return sendSuccess(res, 201, org, 'Organization created');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'An organization with this email already exists');
    }
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
    return sendSuccess(res, 200, manager, 'Fleet manager details fetched');
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
