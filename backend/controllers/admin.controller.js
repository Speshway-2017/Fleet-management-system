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
  deleteNotificationInRepo,
  VALID_SETTLED_TRIP_STATUSES,
  calculateTripRevenue,
  getSettledRevenueForOrganization,
  getSettledRevenueForManager
} from '../repositories/admin.repository.js';
import { changeUserPassword } from '../services/auth.service.js';
import { hashPassword } from '../utils/hashPassword.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';
import sendEmail, { sendManagerWelcomeEmail } from '../utils/email.js';
import path from 'path';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import PlatformIssue from '../models/PlatformIssue.js';
import Notification from '../models/Notification.js';
import Blog from '../models/Blog.js';
import About from '../models/About.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import Fuel from '../models/Fuel.js';
import AuditLog from '../models/AuditLog.js';

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

      const totalRevenue = await getSettledRevenueForOrganization(org._id);

      const currentStatus = org.status || 'Pending';

      return {
        id: org._id.toString(),
        name: org.name,
        logoUrl: org.logoUrl,
        email: org.email,
        phone: org.phone,
        industry: org.industry,
        subscription: org.plan || 'Standard',
        status: currentStatus,
        createdAt: new Date(org.createdAt).toLocaleDateString(),
        activeManagers,
        managers: activeManagers, // support details page
        joined: new Date(org.createdAt).toLocaleDateString(),
        address: org.address,
        city: org.city,
        state: org.state,
        country: org.country,
        plan: org.plan,
        stats: {
          totalFleetManagers: activeManagers,
          totalRevenue
        }
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

    const orgManagers = await User.find({ role: 'FLEET_MANAGER', organization: org._id });
    const orgManagerIds = orgManagers.map(m => m._id);

    // All trips belonging to this organization and its managers
    const orgTrips = await Trip.find({
      $or: [
        { organization: org._id },
        { assignedManager: { $in: orgManagerIds } }
      ]
    }).lean();

    const settledTrips = orgTrips.filter(t => VALID_SETTLED_TRIP_STATUSES.includes(t.status));
    const activeTrips = orgTrips.filter(t => !['Rejected', 'Cancelled', 'Pending Driver Acceptance', ...VALID_SETTLED_TRIP_STATUSES].includes(t.status));

    // Vehicles associated with this organization and its managers
    const orgVehicles = await Vehicle.find({
      $or: [
        { organization: org._id },
        { assignedManager: { $in: orgManagerIds } },
        { createdBy: { $in: orgManagerIds } }
      ]
    }).lean();

    const isSingleManager = orgManagers.length === 1;

    const managersWithStats = orgManagers.map(manager => {
      const managerSettledTrips = isSingleManager
        ? settledTrips
        : settledTrips.filter(t => String(t.assignedManager) === String(manager._id) || (!t.assignedManager && String(t.organization) === String(org._id)));

      const managerActiveTrips = isSingleManager
        ? activeTrips
        : activeTrips.filter(t => String(t.assignedManager) === String(manager._id) || (!t.assignedManager && String(t.organization) === String(org._id)));

      const managerVehicles = isSingleManager
        ? orgVehicles
        : orgVehicles.filter(v => String(v.assignedManager) === String(manager._id) || String(v.createdBy) === String(manager._id) || (!v.assignedManager && !v.createdBy && String(v.organization) === String(org._id)));

      const totalRevenue = managerSettledTrips.reduce((sum, t) => sum + calculateTripRevenue(t.estimatedDistance || t.actualDistance, t.cargoWeight), 0);
      const activeTripsCount = managerActiveTrips.length;
      const vehiclesManaged = managerVehicles.length;

      const nameParts = (manager.name || '').split(' ');
      const initials = nameParts.length > 1 
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
        : nameParts[0]?.substring(0, 2) || 'NA';

      return {
        id: manager._id.toString(),
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        status: manager.status || (manager.isActive ? 'Active' : 'Inactive'),
        role: manager.role === 'FLEET_MANAGER' ? 'Fleet Manager' : manager.role,
        initials: initials.toUpperCase(),
        vehiclesManaged,
        stats: {
          activeTripsCount,
          totalRevenue,
          vehiclesManaged
        }
      };
    });

    const totalActiveTrips = activeTrips.length;
    const orgTotalRevenue = settledTrips.reduce((sum, t) => sum + calculateTripRevenue(t.estimatedDistance || t.actualDistance, t.cargoWeight), 0);
    const totalVehiclesCount = orgVehicles.length;

    const currentStatus = org.status || 'Pending';

    const formattedOrg = {
      id: org._id.toString(),
      name: org.name,
      logoUrl: org.logoUrl,
      email: org.email,
      phone: org.phone,
      industry: org.industry,
      subscription: org.plan || 'Standard',
      status: currentStatus,
      createdAt: new Date(org.createdAt).toLocaleDateString(),
      activeManagers: orgManagers.length,
      managers: orgManagers.length,
      stats: {
        totalFleetManagers: orgManagers.length,
        totalVehicles: totalVehiclesCount,
        totalActiveTrips: totalActiveTrips,
        totalRevenue: orgTotalRevenue,
      },
      joined: new Date(org.createdAt).toLocaleDateString(),
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      plan: org.plan
    };

    return sendSuccess(res, 200, {
      ...formattedOrg,
      fleetManagers: managersWithStats
    }, 'Organization details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createOrganization = async (req, res, next) => {
  try {
    const { name, industry, email, phone, address, city, state, country, plan, status, managers } = req.body;

    console.log('[DEBUG createOrganization] req.body:', req.body);

    if (!name || !industry || !email) {
      return sendError(res, 400, 'Name, industry, and email are required');
    }

    // 1. Upload Logo if provided
    let logoUrl = '';
    if (req.file) {
      const allowedExts = ['.jpg', '.jpeg', '.png'];
      const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
      const ext = path.extname(req.file.originalname || '').toLowerCase();
      if (!allowedExts.includes(ext) || !allowedMimes.includes(req.file.mimetype)) {
        return sendError(res, 400, 'Invalid logo file format. Only JPG, JPEG, and PNG files are allowed.');
      }
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'fleet_management/organizations');
      logoUrl = uploadResult.secure_url;
    }

    // 2. Create Organization
    const org = await createOrgInRepo({ name, industry, email, phone, address, city, state, country, plan, status: status || 'Pending', logoUrl });

    let createdManagerIds = [];
    let createdManagersList = [];

    // 2. Create Fleet Managers if provided
    if (managers && Array.isArray(managers) && managers.length > 0) {
      for (const manager of managers) {
        if (manager.name && manager.email && manager.password) {
          try {
            const hashedPassword = await hashPassword(manager.password);
            const createdManager = await createManagerInRepo({
              name: manager.name,
              email: manager.email,
              password: hashedPassword,
              phone: manager.phone,
              organization: org._id,
              role: "FLEET_MANAGER",
              status: "Active",
              isActive: true,
              subscriptionStatus: 'INACTIVE',
              subscriptionPlan: null,
              subscriptionExpiry: null,
              subscriptionRequestedPlan: null
            });
            createdManagerIds.push(createdManager._id);
            createdManagersList.push(createdManager);

            console.log(`[ADMIN] Fleet Manager "${createdManager.name}" (${createdManager.email}) created for organization "${org.name}".`);

            // Send welcome credentials email via Nodemailer
            try {
              await sendManagerWelcomeEmail({
                name: createdManager.name,
                email: createdManager.email,
                password: manager.password,
                organizationName: org.name,
                phone: createdManager.phone
              });
            } catch (mailError) {
              console.error('[WARNING] Failed to send welcome email:', mailError);
            }
          } catch (managerError) {
            // Rollback organization and successfully created managers
            for (const id of createdManagerIds) {
              await deleteManagerById(id);
            }
            await deleteOrganizationById(org._id);
            
            if (managerError.code === 11000) {
              return sendError(res, 400, `A user with the email '${manager.email}' already exists. Transaction rolled back.`);
            }
            throw managerError;
          }
        }
      }
    }

    // 3. Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: 'Organization Registered',
      message: `Organization "${org.name}" has been onboarded successfully under "${org.plan || 'Standard'}" plan.`,
      type: 'success',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id,
      organization: org._id
    });
    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    const responseData = { ...org.toObject() };
    if (createdManagersList.length > 0) {
      responseData.fleetManagersCount = createdManagersList.length;
    }

    return sendSuccess(res, 201, responseData, 'Organization created');
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

    let updateData = { ...req.body };
    if (req.file) {
      const allowedExts = ['.jpg', '.jpeg', '.png'];
      const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
      const ext = path.extname(req.file.originalname || '').toLowerCase();
      if (!allowedExts.includes(ext) || !allowedMimes.includes(req.file.mimetype)) {
        return sendError(res, 400, 'Invalid logo file format. Only JPG, JPEG, and PNG files are allowed.');
      }
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'fleet_management/organizations');
      updateData.logoUrl = uploadResult.secure_url;
    }
    const updatedOrg = await updateOrganizationById(id, updateData);
    
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
      createdBy: req.user?._id,
      organization: updatedOrg._id
    });
    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
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
    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 200, null, 'Organization deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const suspendOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = 'Suspended' } = req.body;

    const org = await Organization.findById(id);
    if (!org) return sendError(res, 404, 'Organization not found');

    const newStatus = status === 'Active' ? 'Active' : 'Suspended';
    org.status = newStatus;
    await org.save();

    // Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: newStatus === 'Suspended' ? 'Organization Suspended' : 'Organization Activated',
      message: `Organization "${org.name}" status has been changed to ${newStatus}.`,
      type: newStatus === 'Suspended' ? 'warning' : 'success',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id,
      organization: org._id
    });

    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 200, org, `Organization ${newStatus === 'Suspended' ? 'suspended' : 'activated'} successfully`);
  } catch (error) {
    next(error);
  }
};

// Fleet Managers
export const listManagers = async (_req, res, next) => {
  try {
    const managers = await getAllManagers();
    const Trip = (await import('../models/Trip.js')).default;
    const Vehicle = (await import('../models/Vehicle.js')).default;

    // Map to frontend expected format with authoritative stats
    const formattedManagers = await Promise.all(managers.map(async (manager) => {
      const nameParts = (manager.name || '').split(' ');
      const initials = nameParts.length > 1 
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
        : nameParts[0]?.substring(0, 2) || 'NA';

      const orgId = manager.organization?._id;
      const totalRevenue = await getSettledRevenueForManager(manager._id, orgId);

      const activeTripsCount = await Trip.countDocuments({
        $or: [
          { assignedManager: manager._id },
          ...(orgId ? [{ organization: orgId }] : [])
        ],
        status: { $nin: ['Rejected', 'Cancelled', 'Pending Driver Acceptance', ...VALID_SETTLED_TRIP_STATUSES] }
      });

      const vehiclesManaged = await Vehicle.countDocuments({
        $or: [
          { assignedManager: manager._id },
          { createdBy: manager._id },
          ...(orgId ? [{ organization: orgId }] : [])
        ]
      });

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
        created: new Date(manager.createdAt).toLocaleDateString(),
        vehiclesManaged,
        stats: {
          activeTripsCount,
          totalRevenue,
          vehiclesManaged
        }
      };
    }));

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
      isActive: true,
      subscriptionStatus: 'INACTIVE',
      subscriptionPlan: null,
      subscriptionExpiry: null,
      subscriptionRequestedPlan: null
    });

    // Resolve Org Name for Notification
    let orgName = 'N/A';
    if (organization) {
      const orgObj = await getOrganizationById(organization);
      if (orgObj) orgName = orgObj.name;
    }

    console.log(`[ADMIN] Fleet Manager "${manager.name}" (${manager.email}) created for organization "${orgName}".`);

    // Store Admin Notification in MongoDB
    const notification = await createNotificationInRepo({
      title: 'Fleet Manager Created',
      message: `Fleet Manager "${manager.name}" has been created and assigned to "${orgName}".`,
      type: 'success',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user?._id,
      organization: manager.organization
    });
    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
    }

    // Send manager welcome email with credentials via Nodemailer
    let emailStatus = 'Delivered';
    try {
      await sendManagerWelcomeEmail({
        name: manager.name,
        email: manager.email,
        password: password,
        organizationName: orgName !== 'N/A' ? orgName : '',
        phone: manager.phone
      });
    } catch (mailError) {
      emailStatus = 'Failed';
      console.error('[WARNING] Failed to send welcome email:', mailError.message);
    }

    const responseMsg = emailStatus === 'Delivered'
      ? 'Fleet manager created and credentials emailed successfully'
      : 'Fleet manager created successfully (Email delivery failed - please check SMTP configuration)';

    return sendSuccess(
      res,
      201,
      {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
        emailStatus
      },
      responseMsg
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
      createdBy: req.user?._id,
      organization: updatedManager.organization
    });
    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
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
    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
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

    const orgId = manager.organization?._id;
    const User = (await import('../models/User.js')).default;
    const Vehicle = (await import('../models/Vehicle.js')).default;
    const Trip = (await import('../models/Trip.js')).default;

    let orgManagersCount = 0;
    if (orgId) {
      orgManagersCount = await User.countDocuments({ role: 'FLEET_MANAGER', organization: orgId });
    }

    const totalRevenue = await getSettledRevenueForManager(manager._id, orgId);

    const activeTripsCount = await Trip.countDocuments({
      $or: [
        { assignedManager: manager._id },
        ...(orgId ? [{ organization: orgId }] : [])
      ],
      status: { $nin: ['Rejected', 'Cancelled', 'Pending Driver Acceptance', ...VALID_SETTLED_TRIP_STATUSES] }
    });

    const vehiclesCount = await Vehicle.countDocuments({
      $or: [
        { assignedManager: manager._id },
        { createdBy: manager._id },
        ...(orgId ? [{ organization: orgId }] : [])
      ]
    });

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
    const updateData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'fleet_management/settings');
      updateData.logoUrl = uploadResult.secure_url;
    }

    const settings = await updateSettingsData(updateData);
    
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

export const getSecuritySettingsAdmin = async (_req, res, next) => {
  try {
    const settings = await getSettingsData();
    const security = settings.securitySettings || {
      twoFactorAdmin: true,
      twoFactorManager: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordPolicy: { requireUppercase: true, requireNumber: true, requireSpecial: true },
      ipAllowlistEnabled: false,
      allowedIps: ""
    };
    return sendSuccess(res, 200, security, 'Security settings fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSecuritySettingsAdmin = async (req, res, next) => {
  try {
    const settings = await getSettingsData();
    settings.securitySettings = {
      ...settings.securitySettings,
      ...req.body
    };
    await settings.save();
    return sendSuccess(res, 200, settings.securitySettings, 'Security settings saved successfully');
  } catch (error) {
    next(error);
  }
};

export const getNotificationSettingsAdmin = async (_req, res, next) => {
  try {
    const settings = await getSettingsData();
    const notifications = settings.notificationSettings || {
      emailNotifications: true,
      primaryEmailAddress: "admin@fleetcommand.io",
      systemAlerts: true,
      systemAlertsSeverity: "warning",
      maintenanceAlerts: true,
      maintenanceAlert48h: true,
      maintenanceAlert1h: true,
      inviteNotifications: true,
      inviteSent: true,
      inviteAccepted: true,
      weeklyReports: true,
      weeklyReportDay: "monday",
      newOrganizationAlerts: true,
      requireAdminReview: true
    };
    return sendSuccess(res, 200, notifications, 'Notification settings fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettingsAdmin = async (req, res, next) => {
  try {
    const settings = await getSettingsData();
    settings.notificationSettings = {
      ...settings.notificationSettings,
      ...req.body
    };
    await settings.save();
    return sendSuccess(res, 200, settings.notificationSettings, 'Notification settings saved successfully');
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
    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`role:${notification.recipientRole}`).emit('notification:new', notification);
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
export const getAnalytics = async (req, res, next) => {
  try {
    const filter = req.query.filter || 'year';

    let startDate = null;
    const now = new Date();
    if (filter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filter === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (filter === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (filter === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const [
      totalOrgs,
      activeOrgs,
      suspendedOrgs,
      totalManagers,
      activeManagers,
      inactiveManagers,
      totalIssues,
      openIssues,
      closedIssues,
      vehicles,
      drivers,
      activeTripsCount,
      completedTripsCount,
      fuelDocs
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ status: 'Active' }),
      Organization.countDocuments({ status: 'Suspended' }),
      User.countDocuments({ role: 'FLEET_MANAGER' }),
      User.countDocuments({ role: 'FLEET_MANAGER', status: 'Active' }),
      User.countDocuments({ role: 'FLEET_MANAGER', status: 'Inactive' }),
      PlatformIssue.countDocuments(),
      PlatformIssue.countDocuments({ status: 'Open' }),
      PlatformIssue.countDocuments({ status: 'Resolved' }),
      Vehicle.countDocuments(),
      Driver.countDocuments(),
      Trip.countDocuments({ status: { $in: ['Scheduled', 'Assigned', 'In Progress', 'Accepted', 'On Transit'] } }),
      Trip.countDocuments({ status: 'Completed', ...(startDate ? { updatedAt: { $gte: startDate } } : {}) }),
      Fuel.aggregate([
        ...(startDate ? [{ $match: { createdAt: { $gte: startDate } } }] : []),
        { $group: { _id: null, totalFuel: { $sum: '$quantity' } } }
      ])
    ]);

    const fuelUsage = fuelDocs.length > 0 ? fuelDocs[0].totalFuel : 0;

    const { orgGrowthData, managerGrowthData } = await getMonthlyGrowthStats();

    // Group organizations by plan for subscription distribution
    const plansAgg = await Organization.aggregate([
      { $match: { plan: { $exists: true, $ne: '' } } },
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    const plansMap = { Enterprise: 0, Professional: 0, Standard: 0 };
    plansAgg.forEach(p => {
      const planName = p._id ? String(p._id).trim().toLowerCase() : '';
      if (planName.includes('enterprise')) {
        plansMap.Enterprise += p.count;
      } else if (planName.includes('pro')) {
        plansMap.Professional += p.count;
      } else if (planName.includes('standard') || planName.includes('basic')) {
        plansMap.Standard += p.count;
      }
    });

    const subscriptionData = [
      { name: 'Enterprise', value: plansMap.Enterprise, color: '#0f172a' },
      { name: 'Professional', value: plansMap.Professional, color: '#b45309' },
      { name: 'Standard', value: plansMap.Standard, color: '#2563eb' },
    ];

    // System activity from AuditLog
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const loginActivityData = weekdayNames.map(day => ({ name: day, value: 0 }));
    
    const AuditLog = (await import('../models/AuditLog.js')).default;
    const activityAgg = await AuditLog.aggregate([
      ...(startDate ? [{ $match: { createdAt: { $gte: startDate } } }] : []),
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } }
    ]);

    activityAgg.forEach(item => {
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
        },
        vehicles,
        drivers,
        activeTrips: activeTripsCount,
        completedTrips: completedTripsCount,
        fuelUsage
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
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'Admin user not found');

    if (name) {
      user.name = name;
    }
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    // Handle Profile Image Upload
    if (req.file) {
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'fleet_management/profiles');
      user.profileImage = uploadResult.secure_url;
    }

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

// Blog Management
export const listBlogsAdmin = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, blogs, 'Blogs fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createBlogAdmin = async (req, res, next) => {
  try {
    const { title, category, summary, content, image, date, readTime } = req.body;
    if (!title || !category || !summary || !content || !image || !date || !readTime) {
      return sendError(res, 400, 'All fields are required');
    }
    const blog = new Blog({ title, category, summary, content, image, date, readTime });
    await blog.save();
    return sendSuccess(res, 201, blog, 'Blog created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateBlogAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!blog) return sendError(res, 404, 'Blog not found');
    return sendSuccess(res, 200, blog, 'Blog updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteBlogAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return sendError(res, 404, 'Blog not found');
    return sendSuccess(res, 200, null, 'Blog deleted successfully');
  } catch (error) {
    next(error);
  }
};

// About Management
export const getAboutAdmin = async (req, res, next) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About({
        storyTitle: "Built for Fleet Operators, by Logistics Experts",
        storyContent: [
          "Founded in 2021, FleetManagement began with a simple observation: most fleet management tools were either too complicated for daily operations or too basic for enterprise needs.",
          "Our team of logistics veterans and enterprise engineers came together to build a platform that bridges the gap — powerful analytics wrapped in an intuitive, driver-friendly interface."
        ],
        missionTitle: "Eliminating Blind Spots in Fleet Operations",
        missionContent: [
          "Every year, inefficient fleet management costs businesses billions in wasted resources, unexpected breakdowns, and compliance failures. Most operators don't know what they don't know.",
          "FleetManagement gives operations teams complete, real-time intelligence across every asset in their fleet — so decisions are driven by data, not guesswork."
        ],
        missionQuote: "The only way to run a fleet well is to see it clearly.",
        statsFounded: "2018",
        statsEnterprises: "340+",
        statsVehicles: "1.2M+",
        statsSavings: "$180M+",
        timeline: [
          { year: "2018", text: "FleetManagement founded in Bengaluru, India. Seed funding of ₹30 Cr." },
          { year: "2019", text: "First 50 enterprise customers. Launched real-time GPS tracking." },
          { year: "2021", text: "Series A — ₹200 Cr. Expanded to reporting & analytics and driver management." },
          { year: "2023", text: "Surpassed 1M vehicles tracked. Launched performance monitoring cloud platform." },
          { year: "2026", text: "340+ enterprise clients. ₹1,500 Cr+ in documented customer savings." }
        ]
      });
      await about.save();
    }
    return sendSuccess(res, 200, about, 'About content fetched');
  } catch (error) {
    next(error);
  }
};

export const updateAboutAdmin = async (req, res, next) => {
  try {
    const about = await About.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    return sendSuccess(res, 200, about, 'About content updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getAuditLogsAdmin = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 15);
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * limit;

    // Check if initial audit logs should be seeded
    const countTotal = await AuditLog.countDocuments();
    if (countTotal === 0) {
      await AuditLog.insertMany([
        {
          user: "Super Admin",
          action: "Updated Platform Settings",
          organization: "Fleet Management",
          ipAddress: "192.168.1.1",
          status: "Success",
          details: { category: "Settings" },
          createdAt: new Date()
        },
        {
          user: "System",
          action: "Daily Database Backup Completed",
          organization: "System",
          ipAddress: "127.0.0.1",
          status: "Success",
          details: { automated: true },
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          user: "Super Admin",
          action: "Created Fleet Manager Account",
          organization: "ARC Logistics",
          ipAddress: "192.168.1.1",
          status: "Success",
          details: { role: "FLEET_MANAGER" },
          createdAt: new Date(Date.now() - 7200000)
        },
        {
          user: "System",
          action: "Automated Maintenance Service Health Check",
          organization: "System",
          ipAddress: "127.0.0.1",
          status: "Success",
          details: { target: "Telemetry Sync" },
          createdAt: new Date(Date.now() - 14400000)
        },
        {
          user: "admin@fleetcommand.io",
          action: "Admin Portal Security Login",
          organization: "Fleet Management",
          ipAddress: "192.168.1.1",
          status: "Success",
          details: { method: "Password" },
          createdAt: new Date(Date.now() - 28800000)
        },
        {
          user: "System",
          action: "FASTag Toll Balance Synchronization",
          organization: "System",
          ipAddress: "127.0.0.1",
          status: "Success",
          details: { syncedCount: 14 },
          createdAt: new Date(Date.now() - 43200000)
        }
      ]);
    }

    let filter = {};
    if (search && search.length >= 2) {
      const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      filter.$or = [
        { user: searchRegex },
        { action: searchRegex },
        { organization: searchRegex },
        { ipAddress: searchRegex },
        { status: searchRegex }
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter)
    ]);

    const formattedLogs = logs.map(log => ({
      id: log._id,
      timestamp: log.createdAt || log.updatedAt || new Date().toISOString(),
      user: log.user || 'Unknown',
      action: log.action || 'Unknown',
      organization: log.organization || '—',
      ip: log.ipAddress || '—',
      status: log.status || 'Success',
      details: log.details || {}
    }));

    return sendSuccess(res, 200, {
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        total
      }
    }, 'Audit logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

