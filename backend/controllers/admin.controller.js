import { getAdminDashboardData } from '../services/admin.service.js';
import { createManager as createManagerInRepo, getAllManagers, getManagerById, createOrganization as createOrgInRepo, getAllOrganizations } from '../repositories/admin.repository.js';
import { hashPassword } from '../utils/hashPassword.js';
import { sendSuccess, sendError } from '../utils/response.js';
import sendEmail from '../utils/email.js';

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
    });

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

export const getManagerDetails = async (req, res, next) => {
  try {
    const manager = await getManagerById(req.params.id);
    if (!manager) return sendError(res, 404, 'Fleet manager not found');
    return sendSuccess(res, 200, manager, 'Fleet manager details fetched');
  } catch (error) {
    next(error);
  }
};
