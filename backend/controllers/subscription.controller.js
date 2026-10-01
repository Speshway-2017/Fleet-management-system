import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SubscriptionRequest from '../models/SubscriptionRequest.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { createNotificationInRepo } from '../repositories/admin.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createSubscriptionPlanSchema, updateSubscriptionPlanSchema } from '../validations/subscription.schema.js';

// GET /api/subscriptions/public/plans (Public)
export const getPublicPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ status: 'Active' }).sort({ displayOrder: 1 });
    return sendSuccess(res, 200, plans, 'Public plans fetched successfully');
  } catch (error) {
    next(error);
  }
};

// GET /api/subscriptions/plans (Admin/Managers)
export const getPlans = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { status: 'Active' };
    const plans = await SubscriptionPlan.find(filter).sort({ displayOrder: 1 });
    return sendSuccess(res, 200, plans, 'Plans fetched successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/subscriptions/plans (Admin only)
export const createPlan = async (req, res, next) => {
  try {
    const parsed = createSubscriptionPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || 'Invalid subscription plan data.';
      return sendError(res, 400, firstError);
    }
    const validatedData = parsed.data;

    const plan = new SubscriptionPlan({
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      duration: validatedData.duration,
      status: validatedData.status || 'Active',
      displayOrder: validatedData.displayOrder !== undefined ? validatedData.displayOrder : 0,
      features: validatedData.features || [],
      maxVehicles: validatedData.maxVehicles !== undefined ? validatedData.maxVehicles : 0,
      maxDrivers: validatedData.maxDrivers !== undefined ? validatedData.maxDrivers : 0,
      maxTrips: validatedData.maxTrips !== undefined ? validatedData.maxTrips : 0
    });
    await plan.save();

    return sendSuccess(res, 201, plan, 'Subscription plan created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'A plan with this name already exists');
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return sendError(res, 400, message || 'Validation Error');
    }
    next(error);
  }
};

// PUT /api/subscriptions/plans/:id (Admin only)
export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = updateSubscriptionPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || 'Invalid subscription plan data.';
      return sendError(res, 400, firstError);
    }
    const validatedData = parsed.data;

    const plan = await SubscriptionPlan.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true });
    if (!plan) return sendError(res, 404, 'Subscription plan not found');
    return sendSuccess(res, 200, plan, 'Subscription plan updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'A plan with this name already exists');
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return sendError(res, 400, message || 'Validation Error');
    }
    next(error);
  }
};

// DELETE /api/subscriptions/plans/:id (Admin only)
export const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByIdAndDelete(id);
    if (!plan) return sendError(res, 404, 'Subscription plan not found');
    return sendSuccess(res, 200, null, 'Subscription plan deleted successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/subscriptions/requests (Manager only)
export const submitRequest = async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) return sendError(res, 400, 'Plan ID is required');

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return sendError(res, 404, 'Subscription plan not found');

    // Check for duplicate pending request
    const pending = await SubscriptionRequest.findOne({ manager: req.user._id, status: 'Pending' });
    if (pending) {
      return sendError(res, 400, 'Manager cannot submit duplicate pending requests.');
    }

    // Check if manager already has an active plan
    if (req.user.subscriptionStatus === 'ACTIVE') {
      return sendError(res, 400, 'Manager already has an active subscription plan.');
    }

    const request = new SubscriptionRequest({
      manager: req.user._id,
      plan: planId,
      status: 'Pending'
    });
    await request.save();

    // Update manager's user document
    await User.findByIdAndUpdate(req.user._id, { subscriptionRequestedPlan: planId });

    // Create Super Admin Notification
    const notification = await createNotificationInRepo({
      title: 'Subscription Requested',
      message: `Fleet Manager "${req.user.name}" has requested the subscription plan "${plan.name}".`,
      type: 'subscription_request',
      recipientRole: 'SUPER_ADMIN',
      createdBy: req.user._id,
      organization: req.user.organization,
      referenceId: request._id.toString(),
      referenceType: 'SubscriptionRequest'
    });

    const io = req.app.locals.io || req.io;
    if (io) {
      io.to('role:SUPER_ADMIN').emit('notification:new', notification);
    }

    return sendSuccess(
      res,
      201,
      request,
      'Subscription request submitted successfully. Your request has been sent to the administrator for approval.'
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/subscriptions/requests/my (Manager only)
export const getMyRequest = async (req, res, next) => {
  try {
    const pending = await SubscriptionRequest.findOne({ manager: req.user._id, status: 'Pending' }).populate('plan');
    return sendSuccess(res, 200, pending, 'Active pending request fetched');
  } catch (error) {
    next(error);
  }
};

// GET /api/subscriptions/requests (Admin only)
export const listRequests = async (req, res, next) => {
  try {
    const requests = await SubscriptionRequest.find()
      .populate({
        path: 'manager',
        select: 'name email organization',
        populate: { path: 'organization', select: 'name' }
      })
      .populate('plan')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, requests, 'Subscription requests fetched');
  } catch (error) {
    next(error);
  }
};

// PUT /api/subscriptions/requests/:id/approve (Admin only)
export const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await SubscriptionRequest.findById(id).populate('plan');
    if (!request) return sendError(res, 404, 'Request not found');
    if (request.status !== 'Pending') {
      return sendError(res, 400, `Request has already been ${request.status.toLowerCase()}`);
    }

    request.status = 'Approved';
    await request.save();

    const plan = request.plan;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    const manager = await User.findByIdAndUpdate(
      request.manager,
      {
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: plan._id,
        subscriptionExpiry: expiryDate,
        subscriptionRequestedPlan: null
      },
      { new: true }
    );

    if (manager && manager.organization) {
      await Organization.findByIdAndUpdate(manager.organization, {
        status: 'Active',
        plan: plan.name || 'Standard'
      });
    }

    // Create Notification for the Manager
    const notification = await createNotificationInRepo({
      title: 'Subscription Approved',
      message: `Your subscription request for the "${plan.name}" plan has been approved and activated.`,
      type: 'success',
      recipient: manager._id,
      recipientRole: 'FLEET_MANAGER',
      createdBy: req.user._id,
      organization: manager.organization
    });

    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`manager:${manager._id.toString()}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 200, request, 'Subscription request approved successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/subscriptions/requests/:id/reject (Admin only)
export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await SubscriptionRequest.findById(id).populate('plan');
    if (!request) return sendError(res, 404, 'Request not found');
    if (request.status !== 'Pending') {
      return sendError(res, 400, `Request has already been ${request.status.toLowerCase()}`);
    }

    request.status = 'Rejected';
    await request.save();

    const manager = await User.findByIdAndUpdate(
      request.manager,
      {
        subscriptionRequestedPlan: null
      },
      { new: true }
    );

    // Create Notification for the Manager
    const notification = await createNotificationInRepo({
      title: 'Subscription Rejected',
      message: `Your subscription request for "${request.plan.name}" plan has been rejected.`,
      type: 'warning',
      recipient: manager._id,
      recipientRole: 'FLEET_MANAGER',
      createdBy: req.user._id,
      organization: manager.organization
    });

    const io = req.app.locals.io || req.io;
    if (io) {
      io.to(`manager:${manager._id.toString()}`).emit('notification:new', notification);
    }

    return sendSuccess(res, 200, request, 'Subscription request rejected successfully');
  } catch (error) {
    next(error);
  }
};
