import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import Document from '../models/Document.js';
import ProofOfDelivery from '../models/ProofOfDelivery.js';
import User from '../models/User.js';
import { comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import cloudinary from '../utils/cloudinary.js';

/**
 * Driver Login
 * POST /api/driver/login
 */
export const loginDriver = async (req, res, next) => {
  try {
    const { email, phoneNumber, employeeId, password, identifier } = req.body;
    const loginId = identifier || email || phoneNumber || employeeId;

    if (!loginId || !password) {
      return sendError(res, 400, 'Email/Phone/Employee ID and password are required');
    }

    const driver = await Driver.findOne({
      $or: [
        { email: loginId.toLowerCase().trim() },
        { phoneNumber: loginId.trim() },
        { employeeId: loginId.trim() }
      ]
    }).select('+password').populate('assignedManager');

    if (!driver) {
      return sendError(res, 401, 'Invalid driver credentials');
    }

    const isMatch = await comparePassword(password, driver.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid driver credentials');
    }

    const managerId = driver.assignedManager?._id || driver.assignedManager || null;
    const organizationId = driver.assignedManager?.organization || null;

    const token = generateToken({
      id: driver._id,
      role: 'DRIVER',
      managerId,
      organizationId
    });

    const driverObj = driver.toObject();
    delete driverObj.password;

    return sendSuccess(res, 200, {
      token,
      driverId: driver._id,
      managerId,
      organizationId,
      driver: driverObj
    }, 'Driver logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Driver Logout
 * POST /api/driver/logout
 */
export const logoutDriver = async (req, res) => {
  return sendSuccess(res, 200, {}, 'Logout successful');
};

/**
 * Get Driver Profile
 * GET /api/driver/profile
 */
export const getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user._id)
      .populate('assignedManager', 'name email phone profileImage jobTitle organization')
      .lean();

    if (!driver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    let organizationName = 'Fleet Management Corp';
    if (driver.assignedManager && driver.assignedManager.organization) {
      try {
        const Org = (await import('../models/Organization.js')).default;
        const org = await Org.findById(driver.assignedManager.organization);
        if (org) organizationName = org.name;
      } catch (e) {}
    }

    return sendSuccess(res, 200, {
      driverId: driver.employeeId || driver._id,
      fullName: driver.fullName,
      email: driver.email,
      phone: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      vehicle: driver.assignedVehicle || 'Unassigned',
      driverStatus: driver.driverStatus,
      profileImage: driver.profileImage || '',
      manager: driver.assignedManager ? {
        id: driver.assignedManager._id,
        name: driver.assignedManager.name,
        phone: driver.assignedManager.phone || '',
        email: driver.assignedManager.email || '',
      } : null,
      organization: organizationName
    }, 'Driver profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Active Trip for Driver
 * GET /api/driver/trips/current
 */
export const getCurrentTrip = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const currentTrip = await Trip.findOne({
      driver: driverId,
      status: { $nin: ['Completed', 'Cancelled'] }
    }).populate('vehicle').sort({ createdAt: -1 });

    if (!currentTrip) {
      return sendSuccess(res, 200, null, 'No active trip assigned');
    }

    let managerInfo = null;
    if (currentTrip.assignedManager) {
      const manager = await User.findById(currentTrip.assignedManager).select('name phone email');
      if (manager) managerInfo = manager;
    }

    return sendSuccess(res, 200, {
      tripId: currentTrip._id,
      tripNumber: currentTrip.tripNumber,
      pickup: currentTrip.startLocation,
      destination: currentTrip.endLocation,
      status: currentTrip.status,
      eta: currentTrip.eta,
      departureTime: currentTrip.departureTime,
      cargoType: currentTrip.cargoType,
      cargoWeight: currentTrip.cargoWeight,
      vehicle: currentTrip.vehiclePlate || currentTrip.vehicleName || 'Vehicle',
      manager: managerInfo
    }, 'Current trip retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Driver Dashboard Overview
 * GET /api/driver/dashboard
 */
export const getDriverDashboard = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const activeTripsCount = await Trip.countDocuments({
      driver: driverId,
      status: { $in: ['Assigned', 'In Progress', 'On Transit', 'Accept Trip', 'Start Trip', 'Reach Pickup', 'Pickup Completed', 'Enroute'] }
    });

    const upcomingTripsCount = await Trip.countDocuments({
      driver: driverId,
      status: { $in: ['Scheduled', 'Upcoming'] }
    });

    const completedTripsCount = await Trip.countDocuments({
      driver: driverId,
      status: 'Completed'
    });

    const todaySchedule = await Trip.find({
      driver: driverId,
      status: { $nin: ['Cancelled'] }
    }).sort({ departureTime: 1 }).limit(5);

    const notifications = await Notification.find({
      $or: [
        { recipient: driverId },
        { user: driverId },
        { targetRole: 'DRIVER' }
      ]
    }).sort({ createdAt: -1 }).limit(5);

    return sendSuccess(res, 200, {
      activeTrips: activeTripsCount,
      upcomingTrips: upcomingTripsCount,
      completedTrips: completedTripsCount,
      todaySchedule,
      notifications
    }, 'Dashboard metrics fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Notifications
 * GET /api/driver/notifications
 */
export const getDriverNotifications = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const notifications = await Notification.find({
      $or: [
        { recipient: driverId },
        { user: driverId },
        { targetRole: 'DRIVER' }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    return sendSuccess(res, 200, notifications, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Trip Status
 * PATCH /api/driver/trips/:id/status
 */
export const updateTripStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    trip.status = status;
    if (status === 'Start Trip' || status === 'In Progress' || status === 'Enroute') {
      if (!trip.actualStartTime) trip.actualStartTime = new Date();
    } else if (status === 'Completed' || status === 'Complete Trip') {
      trip.status = 'Completed';
      trip.actualEndTime = new Date();
    }
    await trip.save();

    // Update Driver status if applicable
    if (['Completed', 'Complete Trip'].includes(status)) {
      await Driver.findByIdAndUpdate(req.user._id, { driverStatus: 'AVAILABLE' });
    } else {
      await Driver.findByIdAndUpdate(req.user._id, { driverStatus: 'ON_TRIP' });
    }

    // Broadcast Socket.io event to manager
    const io = req.app.get('socketio') || req.app.locals?.io;
    if (io && trip.assignedManager) {
      io.to(`manager:${trip.assignedManager}`).emit('trip:status-updated', {
        tripId: trip._id,
        status: trip.status,
        driverId: req.user._id
      });
    }

    return sendSuccess(res, 200, trip, 'Trip status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Driver GPS Location
 * POST /api/driver/location
 */
export const updateDriverLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, speed, heading, tripId } = req.body;

    if (!latitude || !longitude) {
      return sendError(res, 400, 'Latitude and longitude are required');
    }

    const locationStr = `${latitude},${longitude}`;
    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      { currentLocation: locationStr, driverLocation: locationStr },
      { new: true }
    );

    const io = req.app.get('socketio') || req.app.locals?.io;
    if (io && driver?.assignedManager) {
      io.to(`manager:${driver.assignedManager}`).emit('driver:location-update', {
        driverId: req.user._id,
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || 0,
        tripId: tripId || null,
        updatedAt: new Date()
      });
    }

    return sendSuccess(res, 200, { latitude, longitude }, 'Driver location updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Documents
 * GET /api/driver/documents
 */
export const getDriverDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, docs, 'Documents fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Document Details
 * GET /api/driver/documents/:id
 */
export const getDriverDocumentById = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return sendError(res, 404, 'Document not found');
    return sendSuccess(res, 200, doc, 'Document fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Dispatcher Support Info
 * GET /api/driver/support
 */
export const getDriverSupportInfo = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user._id).populate('assignedManager');
    const manager = driver?.assignedManager;

    return sendSuccess(res, 200, {
      dispatcherName: manager ? manager.name : 'Fleet Operations Team',
      phone: manager ? manager.phone || '+18005550199' : '+18005550199',
      email: manager ? manager.email || 'support@fleetapp.com' : 'support@fleetapp.com',
      whatsapp: manager ? manager.phone || '+18005550199' : '+18005550199',
      workingHours: '24/7 Fleet Control Center'
    }, 'Support contact retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Proof of Delivery (POD)
 * POST /api/driver/pod
 */
export const uploadProofOfDelivery = async (req, res, next) => {
  try {
    const { tripId, customerName, receiverName } = req.body;

    if (!req.file) {
      return sendError(res, 400, 'POD image/document file is required');
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'fleet_pod', resource_type: 'auto' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      uploadStream.end(req.file.buffer);
    });

    const podNumber = `POD-${Date.now()}`;
    const pod = new ProofOfDelivery({
      podNumber,
      trip: tripId || null,
      driver: req.user._id,
      customerName: customerName || 'Customer Receiver',
      receiverName: receiverName || 'Verified Receiver',
      deliveryDate: new Date(),
      deliveryPhotoUrl: uploadResult.secure_url,
      podDocumentUrl: uploadResult.secure_url,
      status: 'Pending',
      uploadedBy: 'Driver'
    });

    await pod.save();

    if (tripId) {
      await Trip.findByIdAndUpdate(tripId, { podStatus: 'Uploaded' });
    }

    const io = req.app.get('socketio') || req.app.locals?.io;
    const driver = await Driver.findById(req.user._id);
    if (io && driver?.assignedManager) {
      io.to(`manager:${driver.assignedManager}`).emit('pod:uploaded', {
        podId: pod._id,
        tripId,
        url: uploadResult.secure_url
      });
    }

    return sendSuccess(res, 201, pod, 'Proof of Delivery uploaded successfully');
  } catch (error) {
    next(error);
  }
};
