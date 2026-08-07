import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import Document from '../models/Document.js';
import ProofOfDelivery from '../models/ProofOfDelivery.js';
import WeighbridgeSlip from '../models/WeighbridgeSlip.js';
import Vehicle from '../models/Vehicle.js';
import Maintenance from '../models/Maintenance.js';
import Fuel from '../models/Fuel.js';
import VehicleComplaint from '../models/VehicleComplaint.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';
import TollTransaction from '../models/TollTransaction.js';
import { comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import cloudinary from '../utils/cloudinary.js';
import { createAndEmitNotification } from '../utils/notification.js';
import { getClosestCity, calculateDistance } from '../utils/distanceCalculator.js';
import { syncDriverLocationFromLatestTrip, updateDriverAndVehicleOnCompletion } from '../utils/driverLocationHelper.js';

// Helper to resolve trip by ObjectId or Trip Number
export async function resolveTripHelper(idOrNumber) {
  if (!idOrNumber) return null;
  const cleanId = String(idOrNumber).replaceAll('#', '').trim();
  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    const t = await Trip.findById(cleanId);
    if (t) return t;
  }
  return await Trip.findOne({
    $or: [
      { tripNumber: cleanId },
      { tripNumber: `#${cleanId}` },
      { tripNumber: cleanId.startsWith('TRP-') ? cleanId : `TRP-${cleanId}` }
    ]
  });
}

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

    let driver = await Driver.findOne({
      $or: [
        { email: loginId.toLowerCase().trim() },
        { phoneNumber: loginId.trim() },
        { employeeId: loginId.trim() }
      ]
    }).select('+password').populate('assignedManager');

    if (!driver) {
      return sendError(res, 404, 'No account found with this email');
    }

    let isMatch = false;
    if (driver.password) {
      if (password === driver.password) {
        isMatch = true;
      } else {
        isMatch = await comparePassword(password, driver.password);
      }
    }

    if (!isMatch) {
      return sendError(res, 401, 'Incorrect password');
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
    let driver = await Driver.findById(req.user._id)
      .populate('assignedManager', 'name email phone profileImage jobTitle organization')
      .lean();

    if (!driver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    await syncDriverLocationFromLatestTrip(driver);

    let organizationName = 'Fleet Management Corp';
    if (driver.assignedManager && driver.assignedManager.organization) {
      try {
        const Org = (await import('../models/Organization.js')).default;
        const org = await Org.findById(driver.assignedManager.organization);
        if (org) organizationName = org.name;
      } catch (e) { }
    }

    const assignedVeh = await Vehicle.findOne({ assignedDriver: driver._id });
    const vehicleNumber = assignedVeh ? assignedVeh.vehicleNumber : 'Unassigned';

    return sendSuccess(res, 200, {
      driverId: driver.employeeId || driver._id,
      employeeId: driver.employeeId || '',
      fullName: driver.fullName,
      email: driver.email,
      phone: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      licenseExpiry: driver.licenseExpiry || null,
      vehicle: vehicleNumber,
      driverStatus: driver.driverStatus,
      profileImage: driver.profileImage || '',
      address: driver.address || '',
      branch: driver.branch || '',
      currentLocation: driver.currentLocation || driver.driverLocation || driver.branch || '',
      driverLocation: driver.driverLocation || driver.currentLocation || driver.branch || '',
      experience: driver.experience || '',
      joiningDate: driver.joiningDate || driver.createdAt,
      dob: driver.dob || null,
      manager: driver.assignedManager ? {
        id: driver.assignedManager._id,
        name: driver.assignedManager.name,
        phone: driver.assignedManager.phone || '',
        email: driver.assignedManager.email || '',
      } : null,
      organization: organizationName,
      performanceScore: driver.performanceScore || 95,
      tripsCompleted: driver.tripsCompleted || 0,
      twoFactorEnabled: driver.twoFactorEnabled || false,
      twoFactorMethod: driver.twoFactorMethod || 'SMS',
      twoFactorPhone: driver.twoFactorPhone || '',
      recoveryCodes: driver.recoveryCodes || [],
      language: driver.language || 'English (US)',
      isDarkMode: driver.isDarkMode || false,
      driverStatus: driver.driverStatus || 'AVAILABLE',
      isOnline: (driver.isOnline !== undefined && driver.isOnline !== null)
        ? (driver.isOnline === true || driver.isOnline === 'true' || driver.isOnline === 1)
        : (driver.driverStatus !== 'OFFLINE'),
      notificationPreferences: driver.notificationPreferences || {
        routeChanges: true,
        trafficWarnings: true,
        healthAlertes: true,
        fuelWarnings: true,
        emergencyAlerts: true,
        tripUpdates: true,
        sound: true,
        vibration: true,
        pushNotifications: true,
        emailNotifications: false,
        smsNotifications: true,
      },
    }, 'Driver profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Driver Profile
 * PUT /api/driver/profile
 */
export const updateDriverProfile = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    console.log('[DEBUG] [Availability Update] Request Body:', req.body);

    const driverBefore = await Driver.findById(driverId).lean();
    console.log('[DEBUG] [Availability Update] Driver Before Update:', {
      _id: driverBefore?._id,
      isOnline: driverBefore?.isOnline,
      driverStatus: driverBefore?.driverStatus
    });

    const allowedFields = [
      'fullName',
      'phoneNumber',
      'phone',
      'email',
      'dob',
      'address',
      'licenseNumber',
      'licenseType',
      'licenseExpiry',
      'profileImage',
      'branch',
      'twoFactorEnabled',
      'twoFactorMethod',
      'twoFactorPhone',
      'recoveryCodes',
      'language',
      'isDarkMode',
      'notificationPreferences',
      'fcmToken',
      'driverStatus',
      'isOnline'
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        if (key === 'phone') {
          updateData['phoneNumber'] = req.body[key];
        } else if (key === 'isOnline') {
          const val = req.body.isOnline;
          updateData['isOnline'] = (val === true || val === 'true' || val === 1 || val === '1');
        } else {
          updateData[key] = req.body[key];
        }
      }
    }

    if (req.body.isOnline !== undefined || req.body.driverStatus !== undefined) {
      const rawIsOnline = req.body.isOnline;
      const isOff = (
        rawIsOnline === false ||
        rawIsOnline === 'false' ||
        rawIsOnline === 0 ||
        rawIsOnline === '0' ||
        req.body.driverStatus === 'OFFLINE'
      );

      if (isOff) {
        updateData.driverStatus = 'OFFLINE';
        updateData.isOnline = false;
      } else {
        updateData.isOnline = true;
        if (driverBefore && driverBefore.driverStatus !== 'ON_TRIP') {
          updateData.driverStatus = 'AVAILABLE';
        }
      }
    }

    console.log('[DEBUG] [Availability Update] MongoDB updateData:', updateData);

    // If profileImage is a base64 string, upload to Cloudinary!
    if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {
      const uploadResult = await cloudinary.uploader.upload(updateData.profileImage, {
        folder: 'driver_profiles',
        resource_type: 'image'
      });
      updateData.profileImage = uploadResult.secure_url;
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedDriver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    console.log('[DEBUG] [Availability Update] Driver After Update in MongoDB:', {
      _id: updatedDriver._id,
      isOnline: updatedDriver.isOnline,
      driverStatus: updatedDriver.driverStatus
    });

    if (updatedDriver.assignedManager) {
      try {
        const { getIO } = await import('../server.js');
        if (getIO()) {
          const managerRoom = `manager:${updatedDriver.assignedManager._id || updatedDriver.assignedManager}`;
          getIO().to(managerRoom).emit('driver:status-changed', {
            driverId: updatedDriver._id,
            driverName: updatedDriver.fullName,
            driverStatus: updatedDriver.driverStatus,
            isOnline: updatedDriver.isOnline,
          });
        }
      } catch (_) {}
    }

    const responsePayload = {
      ...updatedDriver,
      driverId: updatedDriver.employeeId || updatedDriver._id,
      id: updatedDriver._id,
      isOnline: updatedDriver.isOnline,
      driverStatus: updatedDriver.driverStatus,
    };

    console.log('[DEBUG] [Availability Update] API Response payload isOnline:', responsePayload.isOnline);

    return sendSuccess(res, 200, responsePayload, 'Driver profile updated successfully');
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

    const activeStatuses = [
      'Pending Driver Acceptance',
      'Assigned',
      'Scheduled',
      'In Progress',
      'Accepted',
      'On Transit',
      'Enroute',
      'Reach Pickup',
      'Pickup Completed'
    ];

    let currentTrip = await Trip.findOne({
      driver: driverId,
      status: { $in: activeStatuses }
    }).populate('vehicle').populate('driver').sort({ createdAt: -1 });

    if (!currentTrip) {
      currentTrip = await Trip.findOne({
        driver: driverId
      }).populate('vehicle').populate('driver').sort({ createdAt: -1 });
    }

    if (!currentTrip) {
      return sendSuccess(res, 200, null, 'No trip assigned');
    }

    let managerInfo = null;
    if (currentTrip.assignedManager) {
      const manager = await User.findById(currentTrip.assignedManager).select('name phone email');
      if (manager) managerInfo = manager;
    }

    const invoice = await Invoice.findOne({ trip: currentTrip._id });
    const invoiceNumber = invoice ? invoice.invoiceNumber : 'N/A';

    let podStatus = currentTrip.podStatus || 'Not Uploaded';
    let weighbridgeStatus = currentTrip.weighbridgeStatus || 'Not Uploaded';

    const podDoc = await ProofOfDelivery.findOne({ trip: currentTrip._id });
    if (podDoc) {
      podStatus = podDoc.status === 'Approved' ? 'Approved' : 'Uploaded';
    }

    const wbDoc = await WeighbridgeSlip.findOne({ trip: currentTrip._id });
    if (wbDoc) {
      weighbridgeStatus = wbDoc.status === 'Approved' ? 'Approved' : 'Uploaded';
    }

    const currentCalcDist = calculateDistance(currentTrip.startLocation, currentTrip.endLocation);
    let currentStoredDist = (currentTrip.actualDistance && Number(currentTrip.actualDistance) > 0)
      ? Number(currentTrip.actualDistance)
      : ((currentTrip.estimatedDistance && Number(currentTrip.estimatedDistance) > 0 && Math.abs(Number(currentTrip.estimatedDistance) - currentCalcDist) < 100)
          ? Number(currentTrip.estimatedDistance)
          : currentCalcDist);

    if (currentTrip.estimatedDistance !== currentStoredDist && (!currentTrip.actualDistance || Number(currentTrip.actualDistance) === 0)) {
      Trip.findByIdAndUpdate(currentTrip._id, { estimatedDistance: currentStoredDist }).catch(() => {});
      currentTrip.estimatedDistance = currentStoredDist;
    }

    return sendSuccess(res, 200, {
      tripId: currentTrip._id,
      driverId: currentTrip.driver?._id || currentTrip.driver,
      tripNumber: currentTrip.tripNumber,
      pickup: currentTrip.startLocation,
      destination: currentTrip.endLocation,
      startLocation: currentTrip.startLocation,
      endLocation: currentTrip.endLocation,
      status: currentTrip.status,
      eta: currentTrip.eta,
      departureTime: currentTrip.departureTime,
      cargoType: currentTrip.cargoType,
      cargoWeight: currentTrip.cargoWeight,
      vehicle: currentTrip.vehiclePlate || currentTrip.vehicleName || 'Vehicle',
      vehicleName: currentTrip.vehicleName || (currentTrip.vehicle ? currentTrip.vehicle.vehicleName : ''),
      vehiclePlate: currentTrip.vehiclePlate || (currentTrip.vehicle ? currentTrip.vehicle.vehicleNumber : ''),
      driverName: currentTrip.driverName || (currentTrip.driver ? currentTrip.driver.fullName : ''),
      driverPhone: currentTrip.driverPhone || (currentTrip.driver ? currentTrip.driver.phoneNumber : ''),
      podStatus,
      weighbridgeStatus,
      podUploaded: podStatus !== 'Not Uploaded',
      weighbridgeUploaded: weighbridgeStatus !== 'Not Uploaded',
      customerLocationReached: currentTrip.customerLocationReached || false,
      customerLocationReachedAt: currentTrip.customerLocationReachedAt || null,
      distance: currentStoredDist,
      totalDistance: currentStoredDist,
      estimatedDistance: currentStoredDist,
      actualDistance: (currentTrip.actualDistance && Number(currentTrip.actualDistance) > 0) ? Number(currentTrip.actualDistance) : currentStoredDist,
      invoiceNumber,
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
      status: { $in: ['In Progress', 'On Transit', 'Accept Trip', 'Start Trip', 'Reach Pickup', 'Pickup Completed', 'Enroute'] }
    });

    const upcomingTripsCount = await Trip.countDocuments({
      driver: driverId,
      status: { $in: ['Scheduled', 'Upcoming', 'Assigned', 'Accepted'] }
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
        { recipientRole: 'DRIVER', recipient: { $exists: false } },
        { recipientRole: 'DRIVER', recipient: null }
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
        { recipientRole: 'DRIVER', recipient: { $exists: false } },
        { recipientRole: 'DRIVER', recipient: null }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    return sendSuccess(res, 200, notifications, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a Notification as Read
 * PATCH /api/driver/notifications/:id/read
 */
export const markDriverNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const driverId = req.user._id;
    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { recipient: driverId },
          { user: driverId },
          { recipientRole: 'DRIVER', recipient: { $exists: false } },
          { recipientRole: 'DRIVER', recipient: null }
        ]
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, 'Notification not found or access denied');
    }
    return sendSuccess(res, 200, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark All Notifications as Read
 * PATCH /api/driver/notifications/read-all
 */
export const markAllDriverNotificationsRead = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    await Notification.updateMany(
      {
        isRead: false,
        $or: [
          { recipient: driverId },
          { user: driverId },
          { recipientRole: 'DRIVER', recipient: { $exists: false } },
          { recipientRole: 'DRIVER', recipient: null }
        ]
      },
      { isRead: true }
    );
    return sendSuccess(res, 200, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Trip Status
 * PATCH /api/driver/trips/:id/status
 */
/**
 * Accept Trip Assignment
 * POST /api/driver/trips/:id/accept
 */
export const acceptTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id).populate('vehicle').populate('driver');
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    trip.status = 'Scheduled';
    trip.acceptedAt = new Date();
    trip.isActive = true;
    await trip.save();

    const driverDoc = await Driver.findByIdAndUpdate(req.user._id, {
      driverStatus: 'ASSIGNED',
      isAssigned: true,
      activeTripId: trip._id,
      currentTripId: trip._id
    }, { new: true });

    if (trip.vehicle) {
      await Vehicle.findByIdAndUpdate(trip.vehicle._id || trip.vehicle, {
        currentStatus: 'Assigned',
        isAssigned: true,
        activeTripId: trip._id,
        currentTripId: trip._id
      });
    }

    const io = req.io || req.app?.get?.('socketio') || req.app?.locals?.io;
    const managerId = trip.assignedManager;

    if (managerId) {
      await createAndEmitNotification({
        io,
        recipient: managerId,
        recipientRole: 'FLEET_MANAGER',
        type: 'trip_accepted',
        title: `Trip #${trip.tripNumber} Accepted`,
        message: `Driver ${driverDoc?.fullName || req.user.name || 'Assigned driver'} has accepted trip #${trip.tripNumber}. Status updated to Scheduled.`,
        priority: 'normal',
        metadata: { tripId: trip._id, tripNumber: trip.tripNumber, status: 'Scheduled' }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('trip:accepted', {
          tripId: trip._id,
          tripNumber: trip.tripNumber,
          status: 'Scheduled',
          driverId: req.user._id
        });
        io.to(`manager:${managerId}`).emit('trip:status-updated', {
          tripId: trip._id,
          tripNumber: trip.tripNumber,
          status: 'Scheduled',
          driverId: req.user._id
        });
      }
    }

    if (io) {
      io.to(`driver:${req.user._id}`).emit('trip:accepted', {
        tripId: trip._id,
        status: 'Scheduled'
      });
    }

    return sendSuccess(res, 200, trip, 'Trip accepted successfully. Status updated to Scheduled.');
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Trip Assignment
 * POST /api/driver/trips/:id/reject
 */
export const rejectTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, rejectionReason } = req.body;
    const cleanReason = reason || rejectionReason || '';

    const trip = await Trip.findById(id).populate('vehicle').populate('driver');
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    trip.status = 'Rejected';
    trip.rejectedAt = new Date();
    trip.rejectionReason = cleanReason;
    trip.isActive = false;
    await trip.save();

    const driverDoc = await Driver.findByIdAndUpdate(req.user._id, {
      driverStatus: 'AVAILABLE',
      assignedVehicle: 'Unassigned',
      isAssigned: false,
      activeTripId: null,
      currentTripId: null
    }, { new: true });

    if (trip.vehicle) {
      await Vehicle.findByIdAndUpdate(trip.vehicle._id || trip.vehicle, {
        currentStatus: 'Available',
        assignedDriver: null,
        isAssigned: false,
        activeTripId: null,
        currentTripId: null
      });
    }

    const io = req.io || req.app?.get?.('socketio') || req.app?.locals?.io;
    const managerId = trip.assignedManager;

    if (managerId) {
      await createAndEmitNotification({
        io,
        recipient: managerId,
        recipientRole: 'FLEET_MANAGER',
        type: 'trip_rejected',
        title: `Trip #${trip.tripNumber} Rejected`,
        message: `Driver ${driverDoc?.fullName || req.user.name || 'Assigned driver'} has rejected trip #${trip.tripNumber}.${cleanReason ? ` Reason: ${cleanReason}` : ''}`,
        priority: 'high',
        metadata: { tripId: trip._id, tripNumber: trip.tripNumber, status: 'Rejected', reason: cleanReason }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('trip:rejected', {
          tripId: trip._id,
          tripNumber: trip.tripNumber,
          status: 'Rejected',
          driverId: req.user._id,
          reason: cleanReason
        });
        io.to(`manager:${managerId}`).emit('trip:status-updated', {
          tripId: trip._id,
          tripNumber: trip.tripNumber,
          status: 'Rejected',
          driverId: req.user._id
        });
      }
    }

    if (io) {
      io.to(`driver:${req.user._id}`).emit('trip:rejected', {
        tripId: trip._id,
        status: 'Rejected'
      });
    }

    return sendSuccess(res, 200, trip, 'Trip rejected successfully. Driver and vehicle released.');
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to Trip Assignment (Accept or Reject)
 * PATCH /api/driver/trips/:id/respond
 */
export const respondToTripAssignment = async (req, res, next) => {
  try {
    const action = (req.body.action || req.body.status || '').toLowerCase();
    if (action === 'accept' || action === 'accepted' || action === 'scheduled') {
      return acceptTrip(req, res, next);
    } else if (action === 'reject' || action === 'rejected') {
      return rejectTrip(req, res, next);
    } else {
      return sendError(res, 400, 'Valid action (accept or reject) is required');
    }
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

    console.log(`[updateTripStatus] Request Params ID: ${id}, Body:`, req.body);

    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    const trip = await resolveTripHelper(id);
    if (!trip) {
      console.warn(`[updateTripStatus] Trip not found for ID: ${id}`);
      return sendError(res, 404, `Trip not found for ID '${id}'`);
    }

    const targetStatus = status === 'Start Trip' ? 'In Progress' : (status === 'Complete Trip' ? 'Completed' : status);

    // Validate backend restrictions for starting trip
    if (targetStatus === 'In Progress') {
      const allowedStartStatuses = ['Scheduled', 'Accepted', 'Assigned'];
      if (!allowedStartStatuses.includes(trip.status)) {
        return sendError(res, 400, `Cannot start trip with status '${trip.status}'. Trip must be in Scheduled/Accepted status before starting.`);
      }
      if (trip.departureTime) {
        const departureTime = new Date(trip.departureTime);
        const now = new Date();
        const fifteenMinBefore = new Date(departureTime.getTime() - 15 * 60 * 1000);
        if (now < fifteenMinBefore) {
          return sendError(res, 400, 'Cannot start trip before the 15-minute departure window.');
        }
      }
      if (!trip.actualStartTime) trip.actualStartTime = new Date();
      trip.status = 'In Progress';
    } else if (['Completed', 'Complete Trip', 'Waiting for Manager Approval'].includes(targetStatus)) {
      // Validate backend mandatory document uploads (POD & Weighbridge Slip)
      const podDoc = await ProofOfDelivery.findOne({ trip: trip._id });
      const weighbridgeDoc = await WeighbridgeSlip.findOne({ trip: trip._id });

      const hasPod = Boolean(
        (podDoc && (podDoc.podDocumentUrl || podDoc.deliveryPhotoUrl || podDoc.customerSignatureUrl)) ||
        (trip.proofOfDelivery && (trip.proofOfDelivery.url || trip.proofOfDelivery.deliveryPhotoUrl || trip.proofOfDelivery.podDocumentUrl)) ||
        ['uploaded', 'pending', 'approved'].includes(String(trip.podStatus || '').toLowerCase()) ||
        ['uploaded', 'pending', 'approved'].includes(String(trip.proofOfDelivery?.status || '').toLowerCase())
      );

      const hasWeighbridge = Boolean(
        (weighbridgeDoc && (weighbridgeDoc.documentUrl || weighbridgeDoc.url)) ||
        (trip.weighbridgeSlip && (trip.weighbridgeSlip.url || trip.weighbridgeSlip.documentUrl)) ||
        ['uploaded', 'pending', 'approved'].includes(String(trip.weighbridgeStatus || '').toLowerCase()) ||
        ['uploaded', 'pending', 'approved'].includes(String(trip.weighbridgeSlip?.status || '').toLowerCase())
      );

      console.log(`[updateTripStatus] Validating docs for Trip ${trip._id} (${trip.tripNumber}):`, {
        podDocFound: !!podDoc,
        weighbridgeDocFound: !!weighbridgeDoc,
        tripPodStatus: trip.podStatus,
        tripWbStatus: trip.weighbridgeStatus,
        hasPod,
        hasWeighbridge
      });

      if (!hasPod || !hasWeighbridge) {
        let missingReason = '';
        if (!hasPod && !hasWeighbridge) {
          missingReason = 'Submission failed! Please upload both Proof of Delivery and Weighbridge Slip before requesting trip completion.';
        } else if (!hasPod) {
          missingReason = 'Submission failed! Please upload Proof of Delivery before requesting trip completion.';
        } else {
          missingReason = 'Submission failed! Please upload Weighbridge Slip before requesting trip completion.';
        }
        console.warn(`[updateTripStatus] Validation failed for Trip ${trip._id}: ${missingReason}`);
        return sendError(res, 400, missingReason);
      }

      // Transition to Waiting for Manager Approval
      trip.status = 'Waiting for Manager Approval';
      trip.completionRequestedAt = new Date();
    } else {
      trip.status = targetStatus;
    }

    await trip.save();

    // Update Driver and Vehicle status if applicable
    if (trip.status === 'In Progress') {
      await Driver.findByIdAndUpdate(req.user._id, { driverStatus: 'ON_TRIP' });
      if (trip.vehicle) {
        await Vehicle.findByIdAndUpdate(trip.vehicle, { currentStatus: 'On Trip' });
      }
    }

    // Broadcast Socket.io event and notification to manager
    const io = req.app.get('socketio') || req.app.locals?.io;
    const managerId = trip.assignedManager;
    const driverDoc = await Driver.findById(req.user._id);

    if (managerId) {
      if (trip.status === 'In Progress') {
        await createAndEmitNotification({
          io,
          recipient: managerId,
          recipientRole: 'FLEET_MANAGER',
          type: 'trip_started',
          title: `Trip Started: ${trip.tripNumber}`,
          message: `Driver ${driverDoc?.fullName || 'Driver'} has started trip #${trip.tripNumber} (${trip.startLocation} ➔ ${trip.endLocation}). Live GPS tracking activated.`,
          priority: 'normal',
          metadata: { tripId: trip._id, driverId: req.user._id }
        });
      } else if (trip.status === 'Waiting for Manager Approval') {
        await createAndEmitNotification({
          io,
          recipient: managerId,
          recipientRole: 'FLEET_MANAGER',
          type: 'trip_completion_requested',
          title: `Trip Completion Request`,
          message: `Driver ${driverDoc?.fullName || 'Driver'} has submitted POD and Weighbridge documents for Trip #${trip.tripNumber}. Please review and approve.`,
          priority: 'high',
          metadata: { tripId: trip._id, tripNumber: trip.tripNumber, driverId: req.user._id }
        });

        if (io) {
          io.to(`manager:${managerId}`).emit('trip:completion-requested', {
            tripId: trip._id,
            tripNumber: trip.tripNumber,
            driverName: driverDoc?.fullName || 'Driver',
            status: 'Waiting for Manager Approval'
          });
          io.emit('trip:updated', trip);
        }
      }

      if (io) {
        io.to(`manager:${managerId}`).emit('trip:status-updated', {
          tripId: trip._id,
          status: trip.status,
          driverId: req.user._id
        });
      }
    }

    return sendSuccess(res, 200, trip, 'Trip status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * End Trip (Destination Reached / Journey Ended)
 * PATCH /api/driver/trips/:id/end-trip
 */
export const endTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    trip.tripEnded = true;
    trip.endedAt = new Date();
    trip.customerLocationReached = true;
    trip.customerLocationReachedAt = new Date();
    await trip.save();

    const io = req.app.get('socketio') || req.app.locals?.io;
    const managerId = trip.assignedManager;
    const driverDoc = await Driver.findById(req.user._id);

    if (managerId) {
      await createAndEmitNotification({
        io,
        recipient: managerId,
        recipientRole: 'FLEET_MANAGER',
        type: 'trip_ended',
        title: `Trip Journey Ended: ${trip.tripNumber}`,
        message: `Driver ${driverDoc?.fullName || 'Driver'} has arrived at destination and ended trip #${trip.tripNumber}. Document uploads are now unlocked.`,
        priority: 'normal',
        metadata: { tripId: trip._id, driverId: req.user._id }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('trip:ended', {
          tripId: trip._id,
          tripNumber: trip.tripNumber,
          driverId: req.user._id
        });
        io.to(`manager:${managerId}`).emit('trip:status-updated', {
          tripId: trip._id,
          tripNumber: trip.tripNumber,
          status: 'In Progress',
          tripEnded: true
        });
      }

      // Auto generate Invoice in DB if missing
      try {
        let existingInvoice = await Invoice.findOne({ trip: trip._id });
        if (!existingInvoice) {
          const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const count = await Invoice.countDocuments({ invoiceNumber: { $regex: new RegExp('^INV-' + datePart) } });
          const seq = String(count + 1).padStart(4, '0');
          const invoiceNumber = `INV-${datePart}-${seq}`;
          await Invoice.create({
            invoiceNumber,
            invoiceDate: new Date(),
            trip: trip._id,
            driver: req.user?._id || trip.driver,
            vehicle: trip.vehicle,
            createdBy: trip.assignedManager || req.user?._id
          });
        }
      } catch (invErr) {
        console.error('Error auto-generating invoice on trip completion:', invErr);
      }

      // Auto generate TollTransaction in DB if missing
      try {
        let existingToll = await TollTransaction.findOne({ trip: trip._id });
        if (!existingToll) {
          const vehicleDoc = trip.vehicle && mongoose.Types.ObjectId.isValid(trip.vehicle) ? await Vehicle.findById(trip.vehicle) : null;
          const plate = vehicleDoc?.registrationNumber || trip.vehiclePlate || 'AP 28 TE 4829';
          await TollTransaction.create({
            trip: trip._id,
            vehiclePlate: plate,
            tollPlazaName: 'National Highway Toll Plaza - Gate 4',
            location: `${trip.startLocation || 'Origin'} - ${trip.endLocation || 'Destination'} Highway`,
            dateTime: new Date(),
            amountPaid: 350,
            paymentMethod: 'FASTag',
            fastagTransactionId: `FT${Date.now()}`,
            receiptStatus: 'Paid'
          });
        }
      } catch (tollErr) {
        console.error('Error auto-generating toll receipt on trip completion:', tollErr);
      }
    } else {
      await Driver.findByIdAndUpdate(req.user._id, { driverStatus: 'ON_TRIP' });
      if (trip.vehicle && mongoose.Types.ObjectId.isValid(trip.vehicle)) {
        await Vehicle.findByIdAndUpdate(trip.vehicle, { currentStatus: 'On Trip' });
      }
    }

    if (io) {
      io.to(`driver:${req.user._id}`).emit('trip:updated', trip);
    }

    return sendSuccess(res, 200, trip, 'Trip ended successfully. You can now upload Proof of Delivery and Weighbridge Slip.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Trip Invoice
 * GET /api/driver/trips/:id/invoice
 */
export const getTripInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    let invoice = await Invoice.findOne({ trip: id })
      .populate({
        path: 'trip',
        populate: [
          { path: 'driver' },
          { path: 'vehicle' }
        ]
      })
      .populate('driver')
      .populate('vehicle')
      .populate('createdBy', 'fullName email username');

    if (!invoice) {
      const trip = await Trip.findById(id).populate('driver').populate('vehicle');
      if (!trip) {
        return sendError(res, 404, 'Trip not found');
      }

      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = await Invoice.countDocuments({ invoiceNumber: { $regex: new RegExp('^INV-' + datePart) } });
      const seq = String(count + 1).padStart(4, '0');
      const invoiceNumber = `INV-${datePart}-${seq}`;

      const newInvoice = new Invoice({
        invoiceNumber,
        invoiceDate: new Date(),
        trip: trip._id,
        driver: trip.driver?._id || req.user?._id,
        vehicle: trip.vehicle?._id || trip.vehicle,
        createdBy: trip.assignedManager || req.user?._id
      });
      await newInvoice.save();

      invoice = await Invoice.findById(newInvoice._id)
        .populate({
          path: 'trip',
          populate: [
            { path: 'driver' },
            { path: 'vehicle' }
          ]
        })
        .populate('driver')
        .populate('vehicle')
        .populate('createdBy', 'fullName email username');
    }

    return sendSuccess(res, 200, invoice, 'Invoice retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Trip Toll Receipt
 * GET /api/driver/trips/:id/toll-receipt
 */
export const getTripTollReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    let tollTx = await TollTransaction.findOne({ trip: id }).populate('trip');
    if (!tollTx) {
      const trip = await Trip.findById(id).populate('vehicle');
      if (!trip) {
        return sendError(res, 404, 'Trip not found');
      }
      const vehicleDoc = trip.vehicle;
      const plate = vehicleDoc?.registrationNumber || trip.vehiclePlate || 'AP 28 TE 4829';
      tollTx = await TollTransaction.create({
        trip: trip._id,
        vehiclePlate: plate,
        tollPlazaName: 'National Highway Toll Plaza - Gate 4',
        location: `${trip.startLocation || 'Origin'} - ${trip.endLocation || 'Destination'} Highway`,
        dateTime: new Date(),
        amountPaid: 350,
        paymentMethod: 'FASTag',
        fastagTransactionId: `FT${Date.now()}`,
        receiptStatus: 'Paid'
      });
      tollTx = await TollTransaction.findById(tollTx._id).populate('trip');
    }
    return sendSuccess(res, 200, tollTx, 'Toll receipt retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Customer Location Reached
 * PATCH /api/driver/trips/:id/customer-location
 */
export const toggleCustomerLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reached = true } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    trip.customerLocationReached = reached;
    if (reached) {
      trip.customerLocationReachedAt = new Date();
    }
    await trip.save();

    const io = req.app.get('socketio') || req.app.locals?.io;
    const managerId = trip.assignedManager;
    const driverDoc = await Driver.findById(req.user._id);

    if (managerId && reached) {
      await createAndEmitNotification({
        io,
        recipient: managerId,
        recipientRole: 'FLEET_MANAGER',
        type: 'customer_location_reached',
        title: `Customer Location Reached: ${trip.tripNumber}`,
        message: `Driver ${driverDoc?.fullName || 'Driver'} has arrived at customer location (${trip.endLocation}) for trip #${trip.tripNumber}. Document uploads enabled.`,
        priority: 'normal',
        metadata: { tripId: trip._id, driverId: req.user._id }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('trip:customer-location-reached', {
          tripId: trip._id,
          driverId: req.user._id
        });
      }
    }

    return sendSuccess(res, 200, trip, 'Customer location status updated');
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
    const closestCity = getClosestCity(Number(latitude), Number(longitude));
    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      { currentLocation: closestCity, driverLocation: locationStr },
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
    const { tripId, customerName, receiverName, customerSignatureUrl, deliveryPhotoUrl, podDocumentUrl } = req.body;

    const tripDoc = await resolveTripHelper(tripId);
    const resolvedTripId = tripDoc ? tripDoc._id : (mongoose.Types.ObjectId.isValid(tripId) ? tripId : null);

    if (tripDoc) {
      if (['Waiting for Manager Approval', 'Completed'].includes(tripDoc.status)) {
        return sendError(res, 400, 'Document uploads are locked after submitting for manager approval.');
      }
      const isEnded = tripDoc.tripEnded || tripDoc.customerLocationReached || ['reached destination', 'trip ended', 'ended', 'waiting for manager approval', 'completed'].includes(tripDoc.status?.toLowerCase());
      if (!isEnded) {
        return sendError(res, 400, 'Cannot upload documents before ending the trip. Please click End Trip first.');
      }
    }

    let secureUrl = deliveryPhotoUrl || podDocumentUrl || '';
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'fleet_pod', resource_type: 'auto' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          uploadStream.end(req.file.buffer);
        });
        secureUrl = uploadResult.secure_url;
      } catch (err) {
        console.warn('Cloudinary POD upload warning:', err.message);
      }
    }

    if (!secureUrl) {
      secureUrl = 'https://via.placeholder.com/300x300.png?text=POD+Uploaded';
    }

    const finalSigUrl = customerSignatureUrl || 'https://via.placeholder.com/300x100.png?text=Signature';
    const finalDocUrl = podDocumentUrl || secureUrl;

    let pod = null;
    if (resolvedTripId) {
      pod = await ProofOfDelivery.findOne({ trip: resolvedTripId });
    }
    if (pod) {
      pod.customerName = customerName || pod.customerName || 'Customer Receiver';
      pod.receiverName = receiverName || pod.receiverName || 'Verified Receiver';
      pod.deliveryPhotoUrl = secureUrl;
      pod.customerSignatureUrl = finalSigUrl;
      pod.podDocumentUrl = finalDocUrl;
      pod.status = 'Pending';
      pod.rejectionReason = '';
      await pod.save();
    } else {
      const podNumber = `POD-${Date.now()}`;
      pod = new ProofOfDelivery({
        podNumber,
        trip: resolvedTripId || null,
        driver: req.user._id,
        customerName: customerName || 'Customer Receiver',
        receiverName: receiverName || 'Verified Receiver',
        deliveryDate: new Date(),
        customerSignatureUrl: finalSigUrl,
        deliveryPhotoUrl: secureUrl,
        podDocumentUrl: finalDocUrl,
        status: 'Pending',
        uploadedBy: req.user.name || 'Driver'
      });
      await pod.save();
    }

    let updatedTrip = null;
    if (tripDoc) {
      tripDoc.podStatus = 'Uploaded';
      tripDoc.proofOfDelivery = {
        url: finalDocUrl,
        deliveryPhotoUrl: secureUrl,
        customerSignatureUrl: finalSigUrl,
        customerName: customerName || 'Customer Receiver',
        receiverName: receiverName || 'Verified Receiver',
        uploadedAt: new Date(),
        status: 'Uploaded'
      };
      await tripDoc.save();
      updatedTrip = tripDoc;
    } else if (resolvedTripId) {
      updatedTrip = await Trip.findByIdAndUpdate(
        resolvedTripId,
        {
          podStatus: 'Uploaded',
          proofOfDelivery: {
            url: finalDocUrl,
            deliveryPhotoUrl: secureUrl,
            customerSignatureUrl: finalSigUrl,
            customerName: customerName || 'Customer Receiver',
            receiverName: receiverName || 'Verified Receiver',
            uploadedAt: new Date(),
            status: 'Uploaded'
          }
        },
        { new: true }
      );
    }

    let managerId = updatedTrip?.assignedManager || null;
    const driverDoc = await Driver.findById(req.user._id);
    if (!managerId && driverDoc?.assignedManager) {
      managerId = driverDoc.assignedManager;
    }

    const io = req.app.get('socketio') || req.app.locals?.io;
    if (managerId) {
      await createAndEmitNotification({
        io,
        recipient: managerId,
        recipientRole: 'FLEET_MANAGER',
        type: 'pod_uploaded',
        title: `Proof of Delivery Uploaded`,
        message: `Driver ${driverDoc?.fullName || req.user.name || 'Driver'} uploaded Proof of Delivery (POD) for review.`,
        priority: 'high',
        metadata: { podId: pod._id, tripId: resolvedTripId || tripId }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('pod:uploaded', pod);
        io.to(`manager:${managerId}`).emit('trip:status-updated', {
          _id: resolvedTripId || tripId,
          tripId: resolvedTripId || tripId,
          tripNumber: updatedTrip?.tripNumber,
          podStatus: 'Uploaded',
          proofOfDelivery: updatedTrip?.proofOfDelivery,
          status: updatedTrip?.status
        });
        io.to(`driver:${req.user._id}`).emit('trip:status-updated', { tripId, podStatus: 'Uploaded' });
      }
    }

    return sendSuccess(res, 201, { pod, trip: updatedTrip }, 'Proof of Delivery uploaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Weighbridge Slip
 * POST /api/driver/weighbridge
 */
export const uploadWeighbridgeSlip = async (req, res, next) => {
  try {
    const { tripId, grossWeight, tareWeight, netWeight, location, documentUrl } = req.body;

    const tripDoc = await resolveTripHelper(tripId);
    const resolvedTripId = tripDoc ? tripDoc._id : (mongoose.Types.ObjectId.isValid(tripId) ? tripId : null);

    if (tripDoc) {
      if (['Waiting for Manager Approval', 'Completed'].includes(tripDoc.status)) {
        return sendError(res, 400, 'Document uploads are locked after submitting for manager approval.');
      }
      const isEnded = tripDoc.tripEnded || tripDoc.customerLocationReached || ['reached destination', 'trip ended', 'ended', 'waiting for manager approval', 'completed'].includes(tripDoc.status?.toLowerCase());
      if (!isEnded) {
        return sendError(res, 400, 'Cannot upload documents before ending the trip. Please click End Trip first.');
      }
    }

    let secureUrl = documentUrl || '';
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'fleet_weighbridge', resource_type: 'auto' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          uploadStream.end(req.file.buffer);
        });
        secureUrl = uploadResult.secure_url;
      } catch (err) {
        console.warn('Cloudinary upload warning:', err.message);
      }
    }

    const gross = Number(grossWeight) || 25000;
    const tare = Number(tareWeight) || 10000;
    const calculatedNet = Number(netWeight) || (gross - tare);

    const finalWbUrl = secureUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    let slip = null;
    if (resolvedTripId) {
      slip = await WeighbridgeSlip.findOne({ trip: resolvedTripId });
    }
    if (slip) {
      slip.grossWeight = gross;
      slip.tareWeight = tare;
      slip.netWeight = calculatedNet;
      if (location) slip.location = location;
      slip.documentUrl = finalWbUrl;
      slip.status = 'Pending';
      slip.rejectionReason = '';
      await slip.save();
    } else {
      slip = new WeighbridgeSlip({
        slipNumber: `WB-${Date.now()}`,
        trip: resolvedTripId || null,
        driver: req.user._id,
        grossWeight: gross,
        tareWeight: tare,
        netWeight: calculatedNet,
        location: location || 'Highway Weighbridge Station',
        uploadedBy: req.user.name || 'Driver',
        status: 'Pending',
        documentUrl: finalWbUrl
      });
      await slip.save();
    }

    let updatedTrip = null;
    if (tripDoc) {
      tripDoc.weighbridgeStatus = 'Uploaded';
      tripDoc.weighbridgeSlip = {
        url: finalWbUrl,
        documentUrl: finalWbUrl,
        grossWeight: gross,
        tareWeight: tare,
        netWeight: calculatedNet,
        location: location || 'Highway Weighbridge Station',
        uploadedAt: new Date(),
        status: 'Uploaded'
      };
      await tripDoc.save();
      updatedTrip = tripDoc;
    } else if (resolvedTripId) {
      updatedTrip = await Trip.findByIdAndUpdate(
        resolvedTripId,
        {
          weighbridgeStatus: 'Uploaded',
          weighbridgeSlip: {
            url: finalWbUrl,
            documentUrl: finalWbUrl,
            grossWeight: gross,
            tareWeight: tare,
            netWeight: calculatedNet,
            location: location || 'Highway Weighbridge Station',
            uploadedAt: new Date(),
            status: 'Uploaded'
          }
        },
        { new: true }
      );
    }

    let managerId = updatedTrip?.assignedManager || null;
    const driverDoc = await Driver.findById(req.user._id);
    if (!managerId && driverDoc?.assignedManager) {
      managerId = driverDoc.assignedManager;
    }

    const io = req.app.get('socketio') || req.app.locals?.io;
    if (managerId) {
      await createAndEmitNotification({
        io,
        recipient: managerId,
        recipientRole: 'FLEET_MANAGER',
        type: 'weighbridge_uploaded',
        title: `Weighbridge Slip Uploaded`,
        message: `Driver ${driverDoc?.fullName || req.user.name || 'Driver'} uploaded a Weighbridge Slip (${calculatedNet} kg net) for review.`,
        priority: 'high',
        metadata: { slipId: slip._id, tripId: resolvedTripId || tripId }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('weighbridge:uploaded', {
          slip,
          slipId: slip._id,
          tripId: resolvedTripId || tripId,
          tripNumber: updatedTrip?.tripNumber,
          url: slip.documentUrl
        });
        io.to(`manager:${managerId}`).emit('trip:status-updated', {
          _id: resolvedTripId || tripId,
          tripId: resolvedTripId || tripId,
          tripNumber: updatedTrip?.tripNumber,
          weighbridgeStatus: 'Uploaded',
          weighbridgeSlip: updatedTrip?.weighbridgeSlip,
          status: updatedTrip?.status
        });
        io.to(`driver:${req.user._id}`).emit('trip:status-updated', { tripId, weighbridgeStatus: 'Uploaded' });
      }
    }

    return sendSuccess(res, 201, { slip, trip: updatedTrip }, 'Weighbridge slip uploaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Driver Trips (Filtered by status, e.g. Completed, In Progress)
 * GET /api/driver/trips
 */
export const getDriverTrips = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { status } = req.query;

    const query = { driver: driverId };
    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',').map(s => s.trim()) };
      } else {
        query.status = status;
      }
    }

    const trips = await Trip.find(query).populate('vehicle').populate('driver').sort({ createdAt: -1 });

    const formattedTrips = await Promise.all(trips.map(async (trip) => {
      const invoice = await Invoice.findOne({ trip: trip._id });

      let pStat = trip.podStatus || 'Not Uploaded';
      let wStat = trip.weighbridgeStatus || 'Not Uploaded';

      const pDoc = await ProofOfDelivery.findOne({ trip: trip._id });
      if (pDoc) pStat = pDoc.status === 'Approved' ? 'Approved' : 'Uploaded';

      const wDoc = await WeighbridgeSlip.findOne({ trip: trip._id });
      if (wDoc) wStat = wDoc.status === 'Approved' ? 'Approved' : 'Uploaded';

      const tripCalcDist = calculateDistance(trip.startLocation, trip.endLocation);
      let tripStoredDist = (trip.actualDistance && Number(trip.actualDistance) > 0)
        ? Number(trip.actualDistance)
        : ((trip.estimatedDistance && Number(trip.estimatedDistance) > 0 && Math.abs(Number(trip.estimatedDistance) - tripCalcDist) < 100)
            ? Number(trip.estimatedDistance)
            : tripCalcDist);

      if (trip.estimatedDistance !== tripStoredDist && (!trip.actualDistance || Number(trip.actualDistance) === 0)) {
        Trip.findByIdAndUpdate(trip._id, { estimatedDistance: tripStoredDist }).catch(() => {});
        trip.estimatedDistance = tripStoredDist;
      }

      return {
        _id: trip._id,
        id: trip._id,
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        pickup: trip.startLocation,
        destination: trip.endLocation,
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        origin: { address: trip.startLocation },
        destinationObj: { address: trip.endLocation },
        status: trip.status,
        eta: trip.eta,
        departureTime: trip.departureTime,
        createdAt: trip.createdAt,
        actualStartTime: trip.actualStartTime,
        actualEndTime: trip.actualEndTime,
        cargoType: trip.cargoType,
        cargoWeight: trip.cargoWeight,
        vehicle: trip.vehiclePlate || trip.vehicleName || 'Vehicle',
        vehicleName: trip.vehicleName || (trip.vehicle ? trip.vehicle.vehicleName : ''),
        vehiclePlate: trip.vehiclePlate || (trip.vehicle ? trip.vehicle.vehicleNumber : ''),
        driverName: trip.driverName || (trip.driver ? trip.driver.fullName : ''),
        driverPhone: trip.driverPhone || (trip.driver ? trip.driver.phoneNumber : ''),
        podStatus: pStat,
        weighbridgeStatus: wStat,
        podUploaded: pStat !== 'Not Uploaded',
        weighbridgeUploaded: wStat !== 'Not Uploaded',
        customerLocationReached: trip.customerLocationReached || false,
        customerLocationReachedAt: trip.customerLocationReachedAt || null,
        distance: tripStoredDist,
        totalDistance: tripStoredDist,
        estimatedDistance: tripStoredDist,
        actualDistance: (trip.actualDistance && Number(trip.actualDistance) > 0) ? Number(trip.actualDistance) : tripStoredDist,
        invoiceNumber: invoice ? invoice.invoiceNumber : 'N/A'
      };
    }));

    return sendSuccess(res, 200, formattedTrips, 'Driver trips retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Assigned Vehicle for Driver
 * GET /api/driver/vehicle
 */
export const getAssignedVehicle = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    let vehicle = await Vehicle.findOne({ assignedDriver: driverId }).populate('assignedManager', 'name email phone');
    if (!vehicle && driver.assignedVehicle && driver.assignedVehicle !== 'Unassigned' && driver.assignedVehicle !== '') {
      vehicle = await Vehicle.findOne({ vehicleNumber: driver.assignedVehicle }).populate('assignedManager', 'name email phone');
    }
    if (!vehicle) {
      const activeTrip = await Trip.findOne({ driver: driverId, status: { $nin: ['Completed', 'Cancelled'] } }).populate('vehicle');
      if (activeTrip && activeTrip.vehicle && typeof activeTrip.vehicle === 'object') {
        vehicle = activeTrip.vehicle;
      }
    }

    if (!vehicle) {
      return sendSuccess(res, 200, { assigned: false, vehicle: null }, 'No vehicle assigned');
    }

    const vehObj = vehicle.toObject ? vehicle.toObject() : vehicle;

    // Attach driver info for completeness
    vehObj.assignedDriverName = driver.fullName;
    vehObj.assignedDriverPhone = driver.phoneNumber;
    vehObj.assignedDriverEmpId = driver.employeeId;
    vehObj.assignedDriverLicense = driver.licenseNumber;

    return sendSuccess(res, 200, {
      assigned: true,
      vehicle: vehObj
    }, 'Assigned vehicle retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Driver Vehicle Maintenance Records
 * GET /api/driver/maintenance
 */
export const getDriverMaintenance = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    let vehicle = await Vehicle.findOne({ assignedDriver: driverId });
    if (!vehicle && driver.assignedVehicle && driver.assignedVehicle !== 'Unassigned' && driver.assignedVehicle !== '') {
      vehicle = await Vehicle.findOne({ vehicleNumber: driver.assignedVehicle });
    }
    if (!vehicle) {
      const activeTrip = await Trip.findOne({ driver: driverId, status: { $nin: ['Completed', 'Cancelled'] } }).populate('vehicle');
      if (activeTrip && activeTrip.vehicle && typeof activeTrip.vehicle === 'object') {
        vehicle = activeTrip.vehicle;
      }
    }

    if (!vehicle) {
      return sendSuccess(res, 200, {
        assigned: false,
        maintenances: [],
        activeMaintenances: [],
        completedMaintenances: [],
        upcomingCount: 0,
        overdueCount: 0,
        lastCompleted: null
      }, 'No vehicle assigned');
    }

    const vehNum = vehicle.vehicleNumber || '';
    const cleanVehNum = vehNum.replace(/\s+/g, '').toUpperCase();

    // Find maintenance records matching vehicle._id or vehicleNumber
    const maintenances = await Maintenance.find({
      $or: [
        { vehicle: vehicle._id },
        { vehicleId: vehNum },
        { vehicleId: new RegExp(cleanVehNum.split('').join('\\s*'), 'i') }
      ]
    }).sort({ createdAt: -1 });

    const activeMaintenances = maintenances.filter(m => m.status !== 'Completed' && m.status !== 'Cancelled');
    const completedMaintenances = maintenances.filter(m => m.status === 'Completed');

    // Calculate upcoming and overdue
    let upcomingCount = 0;
    let overdueCount = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    activeMaintenances.forEach(m => {
      if (m.status === 'Scheduled' || m.status === 'In Progress') {
        if (m.scheduledDate) {
          try {
            const schedDate = new Date(m.scheduledDate);
            if (!isNaN(schedDate.getTime()) && schedDate < now) {
              overdueCount++;
            } else {
              upcomingCount++;
            }
          } catch (_) {
            upcomingCount++;
          }
        } else {
          upcomingCount++;
        }
      }
    });

    const lastCompleted = completedMaintenances.length > 0 ? completedMaintenances[0] : null;

    return sendSuccess(res, 200, {
      assigned: true,
      vehicle: {
        _id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleName: vehicle.vehicleName || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle',
        lastServiceDate: vehicle.lastServiceDate || vehicle.lastService,
        nextServiceDue: vehicle.nextServiceDue || vehicle.nextService,
        branchDepot: vehicle.branchDepot || vehicle.currentLocation || 'Fleet Service Hub'
      },
      maintenances,
      activeMaintenances,
      completedMaintenances,
      upcomingCount,
      overdueCount,
      lastCompleted
    }, 'Driver maintenance list retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create Driver Fuel Entry with Receipt Image Cloudinary Upload
 * POST /api/driver/fuel
 */
export const createDriverFuelEntry = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { fuelStation, station, location, city, fuelLocation, purchaseLocation, amount, liters, quantity, odometer, tripId, fuelType, dateTime, notes } = req.body;

    const purchaseCity = (location || city || fuelLocation || purchaseLocation || '').trim();
    if (!purchaseCity) {
      return sendError(res, 400, 'Fuel Purchase Location (City) is required before submitting the fuel entry.');
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    // 1. Verify driver currently has an assigned vehicle
    let vehicle = await Vehicle.findOne({ assignedDriver: driverId });
    if (!vehicle && driver.assignedVehicle && driver.assignedVehicle !== 'Unassigned' && driver.assignedVehicle !== '' && driver.assignedVehicle !== 'No Vehicle Assigned') {
      vehicle = await Vehicle.findOne({ vehicleNumber: driver.assignedVehicle });
    }

    if (!vehicle) {
      return sendError(res, 400, 'Fuel logging is disabled. No vehicle is currently assigned to you.');
    }

    // 2. Verify driver currently has an active trip in progress (active trips > 0)
    const activeTrip = await Trip.findOne({
      driver: driverId,
      status: { $in: ['Assigned', 'Accepted', 'In Progress', 'Start Trip', 'En Route', 'At Loading', 'Loading', 'In Transit', 'On Transit', 'Dispatched', 'Delivered'] }
    }).populate('vehicle');

    if (!activeTrip) {
      return sendError(res, 400, 'Fuel logging is disabled. You currently have 0 active trips.');
    }

    let receiptImageUrl = '';
    const rawImage = req.body.receiptImage || req.body.billUrl || req.body.file;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const mime = req.file.mimetype || 'image/jpeg';
      const dataURI = `data:${mime};base64,${b64}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'fleet_fuel_receipts'
      });
      receiptImageUrl = uploadResult.secure_url;
    } else if (rawImage && typeof rawImage === 'string' && rawImage.trim().length > 0) {
      if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
        receiptImageUrl = rawImage;
      } else {
        const uploadResult = await cloudinary.uploader.upload(rawImage, {
          folder: 'fleet_fuel_receipts'
        });
        receiptImageUrl = uploadResult.secure_url;
      }
    }

    const stationName = fuelStation || station || 'General Fuel Station';
    const totalAmount = Number(amount) || 0;
    const totalLiters = Number(liters) || Number(quantity) || 0;

    const fuel = new Fuel({
      vehicle: vehicle ? vehicle._id : null,
      vehicleId: vehicle ? vehicle.vehicleNumber : (driver.assignedVehicle || 'Unassigned'),
      vehicleName: vehicle ? (vehicle.vehicleName || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle') : 'Vehicle',
      driver: driver.fullName || req.user.name || 'Driver',
      driverId: driver.employeeId || driver._id.toString(),
      tripId: tripId || '',
      odometer: Number(odometer) || (vehicle ? vehicle.odometer : 0) || 0,
      fuelStation: stationName,
      location: purchaseCity,
      amount: totalAmount,
      liters: totalLiters,
      receiptImage: receiptImageUrl,
      billUrl: receiptImageUrl,
      billStatus: receiptImageUrl ? 'Uploaded' : 'Pending',
      approvalStatus: 'Pending',
      hasReceipt: Boolean(receiptImageUrl),
      recordedBy: req.user._id,
      fuelType: fuelType || (vehicle ? vehicle.fuelType : 'Diesel') || 'Diesel',
      dateTime: dateTime ? new Date(dateTime) : Date.now(),
      notes: notes || ''
    });

    await fuel.save();

    return sendSuccess(res, 201, fuel, 'Fuel entry submitted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Driver Fuel Records
 * GET /api/driver/fuel
 */
export const getDriverFuelRecords = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const driver = await Driver.findById(driverId);

    const filter = {
      $or: [
        { recordedBy: driverId },
        { driverId: driver ? driver.employeeId : '' },
        { driverId: driverId.toString() },
        { driver: driver ? driver.fullName : '' }
      ]
    };

    const fuels = await Fuel.find(filter).populate('vehicle').sort({ createdAt: -1 });

    const formattedFuels = fuels.map(f => {
      const obj = f.toObject();
      const img = obj.receiptImage || obj.billUrl || '';
      obj.receiptImage = img;
      obj.billUrl = img;
      return obj;
    });

    return sendSuccess(res, 200, formattedFuels, 'Driver fuel records retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create Driver Ticket / Complaint
 * POST /api/driver/tickets
 */
export const createDriverTicket = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { category, issueType, severity, subject, description, tripId, vehicleId, imageUrl } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
    }

    // Find Active Trip or Latest Trip Safely
    let trip = null;
    if (tripId && mongoose.Types.ObjectId.isValid(tripId)) {
      trip = await Trip.findById(tripId);
    }
    if (!trip) {
      trip = await Trip.findOne({ driver: driverId, status: { $in: ['In Transit', 'Dispatched', 'Assigned', 'Loading', 'On Trip'] } }).sort({ createdAt: -1 });
    }
    if (!trip) {
      trip = await Trip.findOne({ driver: driverId }).sort({ createdAt: -1 });
    }

    // Safely Find Vehicle by ObjectId or Registration / Plate String
    let vehicle = null;
    const candidates = [vehicleId, trip?.vehicle, driver.assignedVehicle].filter(Boolean);

    for (const cand of candidates) {
      if (typeof cand === 'object' && cand._id) {
        vehicle = cand;
        break;
      }
      if (mongoose.Types.ObjectId.isValid(cand)) {
        vehicle = await Vehicle.findById(cand);
        if (vehicle) break;
      }
      if (typeof cand === 'string' && cand.trim()) {
        vehicle = await Vehicle.findOne({
          $or: [
            { registrationNumber: cand.trim() },
            { plateNumber: cand.trim() },
            { vehicleNumber: cand.trim() }
          ]
        });
        if (vehicle) break;
      }
    }

    if (!vehicle) {
      vehicle = await Vehicle.findOne({ assignedDriver: driverId });
    }

    // Determine Vehicle Plate string safely
    let vehiclePlateStr = 'VEH-UNKNOWN';
    if (vehicle) {
      vehiclePlateStr = vehicle.registrationNumber || vehicle.plateNumber || vehicle.vehicleNumber || 'VEH-UNKNOWN';
    } else if (typeof vehicleId === 'string' && vehicleId.trim()) {
      vehiclePlateStr = vehicleId.trim();
    } else if (driver && typeof driver.assignedVehicle === 'string' && driver.assignedVehicle.trim()) {
      vehiclePlateStr = driver.assignedVehicle.trim();
    } else if (trip && trip.vehiclePlate) {
      vehiclePlateStr = trip.vehiclePlate;
    }

    // Attachments / Image Upload
    const attachments = [];
    let uploadUrl = imageUrl || '';

    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'fleet_tickets', resource_type: 'auto' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          uploadStream.end(req.file.buffer);
        });
        uploadUrl = uploadResult.secure_url;
      } catch (err) {
        console.warn('Cloudinary ticket photo upload error:', err.message);
      }
    }

    if (uploadUrl) {
      attachments.push({
        url: uploadUrl,
        filename: req.file ? req.file.originalname : 'ticket_attachment.jpg',
        uploadedAt: new Date()
      });
    }

    // Custom Ticket ID
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await VehicleComplaint.countDocuments({ ticketId: { $regex: new RegExp('^TKT-VEH-' + todayStr) } });
    const seq = String(count + 1).padStart(4, '0');
    const ticketId = `TKT-VEH-${todayStr}-${seq}`;

    // Normalize severity string to Title Case ('Low', 'Medium', 'High', 'Critical')
    let normSeverity = 'Medium';
    if (severity) {
      const s = severity.toString().trim().toLowerCase();
      if (s === 'low') normSeverity = 'Low';
      else if (s === 'medium') normSeverity = 'Medium';
      else if (s === 'high') normSeverity = 'High';
      else if (s === 'critical') normSeverity = 'Critical';
    }

    // Determine Issue Matrix Rules
    const complaintIssueType = issueType || category || 'Vehicle Maintenance';
    const issueLower = complaintIssueType.toLowerCase();

    let canContinueTrip = 'After Repair';
    let setMaintenance = true;

    if (issueLower.includes('low air') || issueLower.includes('air pressure') || issueLower.includes('tire pressure')) {
      canContinueTrip = 'Yes';
      setMaintenance = false;
    } else if (issueLower.includes('headlight') || issueLower.includes('light')) {
      canContinueTrip = 'Yes';
      setMaintenance = false;
    } else if (issueLower.includes('tyre') || issueLower.includes('tire') || issueLower.includes('puncture')) {
      canContinueTrip = 'After Repair';
      setMaintenance = true;
    } else if (issueLower.includes('engine') || issueLower.includes('overheating')) {
      canContinueTrip = 'No';
      setMaintenance = true;
    } else if (issueLower.includes('brake')) {
      canContinueTrip = 'No';
      setMaintenance = true;
    } else if (issueLower.includes('accident') || issueLower.includes('breakdown')) {
      canContinueTrip = 'No';
      setMaintenance = true;
    }

    // Auto-update vehicle status to Maintenance if required by issue type
    if (setMaintenance && vehicle && vehicle._id) {
      try {
        await Vehicle.findByIdAndUpdate(vehicle._id, {
          status: 'Maintenance',
          operationalStatus: 'Maintenance'
        });
      } catch (vehErr) {
        console.warn('Could not set vehicle status to Maintenance:', vehErr.message);
      }
    }

    const complaint = new VehicleComplaint({
      ticketId,
      trip: trip ? trip._id : null,
      vehicle: vehicle ? vehicle._id : null,
      vehiclePlate: vehiclePlateStr,
      driver: driver._id,
      driverName: driver.fullName,
      issueType: complaintIssueType,
      severity: normSeverity,
      canContinueTrip,
      description: subject ? `${subject}${description ? ` - ${description}` : ''}` : (description || 'Vehicle issue reported by driver'),
      status: 'Open',
      attachments,
      repairTimeline: [
        {
          status: 'Open',
          updatedBy: `Driver (${driver.fullName})`,
          updatedAt: new Date(),
          notes: 'Ticket submitted by driver'
        }
      ],
      reportedAt: new Date()
    });

    await complaint.save();

    // Create & emit notification for assigned manager
    const managerId = driver.assignedManager || req.user.managerId;
    if (managerId) {
      try {
        await createAndEmitNotification({
          io: req.io,
          recipient: managerId,
          recipientRole: 'FLEET_MANAGER',
          title: `New Vehicle Ticket: ${ticketId}`,
          message: `Driver ${driver.fullName} reported a ${normSeverity} issue (${complaint.issueType}) for vehicle ${complaint.vehiclePlate}.`,
          type: 'alert',
          priority: (normSeverity === 'Critical' || normSeverity === 'High') ? 'high' : 'normal',
          metadata: {
            ticketId,
            complaintId: complaint._id,
            vehiclePlate: complaint.vehiclePlate,
            driverName: driver.fullName,
            issueType: complaint.issueType,
            severity: complaint.severity,
            status: complaint.status
          }
        });
      } catch (notifErr) {
        console.warn('Failed to emit manager notification for ticket:', notifErr.message);
      }
    }

    return sendSuccess(res, 201, complaint, 'Vehicle issue ticket submitted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Driver Tickets
 * GET /api/driver/tickets
 */
export const getDriverTickets = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const tickets = await VehicleComplaint.find({ driver: driverId })
      .populate('vehicle')
      .populate('trip')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, tickets, 'Driver tickets retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Driver Ticket Details
 * GET /api/driver/tickets/:id
 */
export const getDriverTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const driverId = req.user._id;

    const queryFilter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { ticketId: id }], driver: driverId }
      : { ticketId: id, driver: driverId };

    const ticket = await VehicleComplaint.findOne(queryFilter)
      .populate('vehicle')
      .populate('trip');

    if (!ticket) {
      return sendError(res, 404, 'Ticket not found');
    }

    return sendSuccess(res, 200, ticket, 'Ticket details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Driver Update Ticket Repair Status
 * PATCH /api/driver/tickets/:id/status
 */
export const updateDriverTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const driverId = req.user._id;

    const queryFilter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { ticketId: id }], driver: driverId }
      : { ticketId: id, driver: driverId };

    const ticket = await VehicleComplaint.findOne(queryFilter);

    if (!ticket) {
      return sendError(res, 404, 'Ticket not found');
    }

    const validStatuses = ['Mechanic Arrived', 'Repair In Progress', 'Repair Completed'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    ticket.status = status;
    ticket.repairTimeline.push({
      status,
      updatedBy: `Driver (${ticket.driverName || 'Driver'})`,
      updatedAt: new Date(),
      notes: notes || `Driver updated status to ${status}`
    });

    await ticket.save();

    // Create & emit manager notification
    const driver = await Driver.findById(driverId);
    const managerId = driver?.assignedManager || req.user.managerId;
    if (managerId) {
      try {
        await createAndEmitNotification({
          io: req.io,
          recipient: managerId,
          recipientRole: 'FLEET_MANAGER',
          title: `Ticket Update: ${ticket.ticketId}`,
          message: `Driver ${ticket.driverName} updated ticket ${ticket.ticketId} stage to ${status}.`,
          type: 'alert',
          priority: 'normal',
          metadata: {
            ticketId: ticket.ticketId,
            complaintId: ticket._id,
            status: ticket.status
          }
        });
      } catch (err) {
        console.warn('Failed to emit ticket status update notification:', err.message);
      }
    }

    return sendSuccess(res, 200, ticket, `Ticket status updated to ${status} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Trip Details by ID for Driver
 * GET /api/driver/trips/:id
 */
export const getDriverTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let trip;
    const mongoose = (await import('mongoose')).default;
    if (mongoose.Types.ObjectId.isValid(id)) {
      trip = await Trip.findById(id).populate('vehicle').populate('driver');
    }
    
    if (!trip) {
      trip = await Trip.findOne({ tripNumber: id }).populate('vehicle').populate('driver');
    }
    
    if (!trip && !id.startsWith('#')) {
      trip = await Trip.findOne({ tripNumber: `#${id}` }).populate('vehicle').populate('driver');
    }
    
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    let managerInfo = null;
    if (trip.assignedManager) {
      const manager = await User.findById(trip.assignedManager).select('name fullName phone email');
      if (manager) {
        managerInfo = {
          _id: manager._id,
          name: manager.name || manager.fullName || '',
          fullName: manager.fullName || manager.name || '',
          phone: manager.phone || '',
          email: manager.email || ''
        };
      }
    }

    // Single source of truth for trip distance stored in MongoDB
    const calculatedDist = calculateDistance(trip.startLocation, trip.endLocation);
    let storedDistance = (trip.actualDistance && Number(trip.actualDistance) > 0)
      ? Number(trip.actualDistance)
      : ((trip.estimatedDistance && Number(trip.estimatedDistance) > 0 && Math.abs(Number(trip.estimatedDistance) - calculatedDist) < 1500)
          ? Number(trip.estimatedDistance)
          : calculatedDist);

    if (trip.estimatedDistance !== storedDistance && (!trip.actualDistance || Number(trip.actualDistance) === 0)) {
      Trip.findByIdAndUpdate(trip._id, { estimatedDistance: storedDistance }).catch(() => {});
      trip.estimatedDistance = storedDistance;
    }

    const estimatedDistance = storedDistance;
    const actualDistance = (trip.actualDistance && Number(trip.actualDistance) > 0) ? Number(trip.actualDistance) : storedDistance;

    console.log(`==================================================`);
    console.log(`[Backend Distance Log - Driver getTripDetails]`);
    console.log(`  • Trip ID: ${trip._id} (${trip.tripNumber})`);
    console.log(`  • Origin: ${trip.startLocation}`);
    console.log(`  • Destination: ${trip.endLocation}`);
    console.log(`  • Calculated route distance: ${calculatedDist} KM`);
    console.log(`  • Distance returned to Driver API: ${storedDistance} KM`);
    console.log(`==================================================`);

    let invoice = await Invoice.findOne({
      $or: [
        { trip: trip._id },
        ...(trip.tripInvoice?.invoiceId ? [{ _id: trip.tripInvoice.invoiceId }] : []),
        ...(trip.tripInvoice?.invoiceNumber ? [{ invoiceNumber: trip.tripInvoice.invoiceNumber }] : [])
      ]
    });

    // Dynamic document resolution and status determination
    const podDoc = (trip.proofOfDelivery && trip.proofOfDelivery.url)
      ? trip.proofOfDelivery
      : await ProofOfDelivery.findOne({
          $or: [{ trip: trip._id }, { tripId: trip._id.toString() }, { tripId: trip.tripNumber }]
        });
    const podUrl = trip.proofOfDelivery?.url || podDoc?.podDocumentUrl || podDoc?.deliveryPhotoUrl;
    const resolvedPodStatus = podUrl ? (trip.podStatus === 'Approved' ? 'Approved' : 'Uploaded') : 'Not Uploaded';

    const wbDoc = (trip.weighbridgeSlip && trip.weighbridgeSlip.url)
      ? trip.weighbridgeSlip
      : await WeighbridgeSlip.findOne({
          $or: [{ trip: trip._id }, { tripId: trip._id.toString() }, { tripId: trip.tripNumber }]
        });
    const wbUrl = trip.weighbridgeSlip?.url || wbDoc?.documentUrl;
    const resolvedWbStatus = wbUrl ? (trip.weighbridgeStatus === 'Approved' ? 'Approved' : 'Uploaded') : 'Not Uploaded';

    const resolvedReceiverName = podDoc?.receiverName || podDoc?.customerName || trip.proofOfDelivery?.receiverName || trip.deliveryAddress?.contactPerson || '';

    const proofOfDeliveryObj = {
      url: podUrl || '',
      deliveryPhotoUrl: podDoc?.deliveryPhotoUrl || podUrl || '',
      customerSignatureUrl: podDoc?.customerSignatureUrl || '',
      customerName: podDoc?.customerName || '',
      receiverName: resolvedReceiverName,
      status: resolvedPodStatus
    };

    const weighbridgeSlipObj = {
      url: wbUrl || '',
      documentUrl: wbUrl || '',
      grossWeight: wbDoc?.grossWeight || 0,
      tareWeight: wbDoc?.tareWeight || 0,
      netWeight: wbDoc?.netWeight || 0,
      location: wbDoc?.location || '',
      status: resolvedWbStatus
    };

    const tripInvoiceObj = {
      invoiceId: invoice?._id || trip.tripInvoice?.invoiceId || null,
      invoiceNumber: invoice?.invoiceNumber || trip.tripInvoice?.invoiceNumber || '',
      url: invoice?.pdfUrl || invoice?.invoiceUrl || trip.tripInvoice?.url || '',
      generatedAt: invoice?.createdAt || invoice?.invoiceDate || trip.tripInvoice?.generatedAt || null
    };

    // Calculate total fuel liters across all fuel entries for this trip
    const fuelEntries = await Fuel.find({
      $or: [
        { tripId: trip._id.toString() },
        { tripId: trip.tripNumber },
        { tripId: trip.tripNumber?.replace('#', '') },
        { tripId: '#' + trip.tripNumber?.replace('#', '') }
      ]
    });
    
    let totalFuelLiters = 0;
    for (const f of fuelEntries) {
      totalFuelLiters += (Number(f.liters) || 0);
    }
    if (totalFuelLiters === 0 && trip.totalFuelLiters) {
      totalFuelLiters = Number(trip.totalFuelLiters) || 0;
    }

    const fuel = fuelEntries.length > 0 ? fuelEntries[fuelEntries.length - 1] : null;

    const tollsList = await TollTransaction.find({ trip: trip._id }).sort({ dateTime: 1 });
    let totalTollsAmount = 0;
    for (const t of tollsList) {
      totalTollsAmount += t.amountPaid || 0;
    }
    const toll = tollsList.length > 0 ? tollsList[tollsList.length - 1] : null;

    const podDetailsObj = {
      podNumber: podDoc?.podNumber || '',
      customerName: podDoc?.customerName || '',
      receiverName: resolvedReceiverName,
      status: resolvedPodStatus,
      rejectionReason: podDoc?.rejectionReason || '',
      deliveryDate: podDoc?.deliveryDate || null,
      podDocumentUrl: podUrl || '',
      customerSignatureUrl: podDoc?.customerSignatureUrl || '',
    };

    const weighbridgeDetailsObj = {
      slipNumber: wbDoc?.slipNumber || '',
      grossWeight: wbDoc?.grossWeight || 0,
      tareWeight: wbDoc?.tareWeight || 0,
      netWeight: wbDoc?.netWeight || 0,
      location: wbDoc?.location || '',
      status: resolvedWbStatus,
      rejectionReason: wbDoc?.rejectionReason || '',
      documentUrl: wbUrl || '',
    };

    const fuelDetailsObj = fuel ? {
      fuelStation: fuel.fuelStation,
      location: fuel.location || fuel.city || '',
      amount: fuel.amount,
      liters: fuel.liters,
      odometer: fuel.odometer,
      approvalStatus: fuel.approvalStatus || fuel.billStatus,
      rejectionReason: fuel.rejectionReason,
      billUrl: fuel.billUrl || fuel.receiptImage,
    } : null;

    const formattedFuelEntries = fuelEntries.map(f => ({
      _id: f._id,
      fuelStation: f.fuelStation,
      location: f.location || f.city || '',
      amount: f.amount,
      liters: f.liters,
      odometer: f.odometer,
      dateTime: f.dateTime || f.createdAt,
      approvalStatus: f.approvalStatus || f.billStatus || 'Pending',
    }));

    const tollDetailsObj = toll ? {
      tollPlazaName: toll.tollPlazaName,
      amountPaid: toll.amountPaid,
      dateTime: toll.dateTime,
      fastagTransactionId: toll.fastagTransactionId,
      receiptStatus: toll.receiptStatus,
      receiptUrl: toll.receiptUrl,
    } : null;

    // Vehicle and Driver resolution
    let vehicleObj = trip.vehicle;
    if (vehicleObj && typeof vehicleObj !== 'object') {
      vehicleObj = await Vehicle.findById(vehicleObj);
    }
    const resolvedVehicleName = trip.vehicleName || vehicleObj?.vehicleModel || vehicleObj?.brand || vehicleObj?.vehicleName || vehicleObj?.name || '';
    const resolvedVehiclePlate = trip.vehiclePlate || vehicleObj?.vehicleNumber || vehicleObj?.registrationNumber || '';

    let driverObj = trip.driver;
    if (driverObj && typeof driverObj !== 'object') {
      driverObj = await Driver.findById(driverObj);
    }
    const resolvedDriverName = trip.driverName || driverObj?.fullName || driverObj?.name || `${driverObj?.firstName || ''} ${driverObj?.lastName || ''}`.trim() || '';
    const resolvedDriverPhone = trip.driverPhone || driverObj?.phone || driverObj?.phoneNumber || driverObj?.mobile || '';

    return sendSuccess(res, 200, {
      tripId: trip._id,
      _id: trip._id,
      tripNumber: trip.tripNumber,
      pickup: trip.startLocation,
      destination: trip.endLocation,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      status: trip.status,
      eta: trip.eta,
      departureTime: trip.departureTime,
      cargoType: trip.cargoType,
      cargoWeight: trip.cargoWeight,
      vehicleName: resolvedVehicleName,
      vehiclePlate: resolvedVehiclePlate,
      vehicle: vehicleObj,
      driverName: resolvedDriverName,
      driverPhone: resolvedDriverPhone,
      driver: driverObj,
      tripNotes: trip.tripNotes || trip.description || '',
      description: trip.description || '',
      distance: storedDistance,
      totalDistance: storedDistance,
      estimatedDistance: estimatedDistance,
      actualDistance: actualDistance,
      totalFuelLiters: totalFuelLiters,
      fuelUsed: totalFuelLiters > 0 ? `${totalFuelLiters}L` : (trip.fuelUsed || ''),
      actualStartTime: trip.actualStartTime || null,
      actualEndTime: trip.actualEndTime || null,
      podStatus: resolvedPodStatus,
      weighbridgeStatus: resolvedWbStatus,
      proofOfDelivery: proofOfDeliveryObj,
      weighbridgeSlip: weighbridgeSlipObj,
      tripInvoice: tripInvoiceObj,
      customerLocationReached: trip.customerLocationReached || false,
      invoiceNumber: invoice.invoiceNumber,
      manager: managerInfo,
      assignedManager: managerInfo,
      managerName: managerInfo ? (managerInfo.name || managerInfo.fullName) : '',
      receiverName: resolvedReceiverName,

      // Compatibility fields for mobile screens
      podUrl: podUrl || '',
      podDetails: podDetailsObj,
      weighbridgeUrl: wbUrl || '',
      weighbridgeDetails: weighbridgeDetailsObj,
      fuelStatus: fuel ? (fuel.approvalStatus || fuel.billStatus) : 'Not Uploaded',
      fuelUrl: fuel ? (fuel.billUrl || fuel.receiptImage) : '',
      fuelDetails: fuelDetailsObj,
      fuelEntries: formattedFuelEntries,
      fuelStops: formattedFuelEntries.map(f => f.location).filter(Boolean),
      tollStatus: toll ? 'Uploaded' : 'Not Uploaded',
      tollUrl: toll ? toll.receiptUrl : '',
      tollDetails: tollDetailsObj,
      totalTollsAmount: totalTollsAmount
    }, 'Trip details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Create Driver Toll Transaction with Multiple Receipt Images Upload
 * POST /api/driver/tolls
 */
export const createDriverTollTransaction = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { tollPlazaName, amountPaid, amount, dateTime, tripId } = req.body;

    let resolvedTripId = tripId;
    if (tripId) {
      let tripDoc;
      if (mongoose.Types.ObjectId.isValid(tripId)) {
        tripDoc = await Trip.findById(tripId);
      } else {
        tripDoc = await Trip.findOne({ tripNumber: tripId });
        if (!tripDoc && !tripId.startsWith('#')) {
          tripDoc = await Trip.findOne({ tripNumber: `#${tripId}` });
        }
      }
      if (tripDoc) {
        resolvedTripId = tripDoc._id;
      }
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    let vehicle = await Vehicle.findOne({ assignedDriver: driverId });
    if (!vehicle) {
      const activeTrip = await Trip.findOne({ driver: driverId, status: { $nin: ['Completed', 'Cancelled'] } }).populate('vehicle');
      if (activeTrip && activeTrip.vehicle) {
        vehicle = activeTrip.vehicle;
      }
    }

    let receiptUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const mime = file.mimetype || 'image/jpeg';
        const dataURI = `data:${mime};base64,${b64}`;
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'fleet_toll_receipts'
        });
        receiptUrls.push(uploadResult.secure_url);
      }
    }

    const plazaName = tollPlazaName || 'General Toll Plaza';
    const totalAmount = Number(amountPaid) || Number(amount) || 0;
    const transactionDate = dateTime ? new Date(dateTime) : new Date();

    const toll = new TollTransaction({
      trip: resolvedTripId,
      vehiclePlate: vehicle ? (vehicle.registrationNumber || vehicle.plateNumber || vehicle.vehicleNumber || '') : '',
      tollPlazaName: plazaName,
      location: vehicle?.currentLocation || 'NH Highway',
      dateTime: transactionDate,
      amountPaid: totalAmount,
      paymentMethod: 'Cash/Card',
      fastagTransactionId: `TXN-TOLL-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptStatus: 'Paid',
      receiptUrl: receiptUrls.join(',')
    });

    await toll.save();
    console.log("[DEBUG] [Toll Upload API] Saved Toll Transaction:", toll);

    // Broadcast to Fleet Manager
    const io = req.app.get('socketio') || req.app.locals?.io;
    const tripObj = await Trip.findById(resolvedTripId);
    if (tripObj && tripObj.assignedManager) {
      const managerId = tripObj.assignedManager;
      await createAndEmitNotification({
        io,
        recipient: managerId,
        recipientRole: 'FLEET_MANAGER',
        type: 'toll_uploaded',
        title: 'Toll Receipt Uploaded',
        message: `Driver ${driver?.fullName || req.user.name || 'Driver'} uploaded a manual toll receipt for plaza ${plazaName}.`,
        priority: 'normal',
        metadata: { tollId: toll._id, tripId: resolvedTripId }
      });
      if (io) {
        io.to(`manager:${managerId}`).emit('trip:status-updated', { _id: resolvedTripId, status: tripObj.status });
      }
    }

    return sendSuccess(res, 201, toll, 'Toll transaction submitted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Driver Trip Tolls
 * GET /api/driver/trips/:id/tolls
 */
export const getDriverTripTolls = async (req, res, next) => {
  try {
    const { id } = req.params;
    let trip;
    if (mongoose.Types.ObjectId.isValid(id)) {
      trip = await Trip.findById(id);
    } else {
      trip = await Trip.findOne({ tripNumber: id });
      if (!trip && !id.startsWith('#')) {
        trip = await Trip.findOne({ tripNumber: `#${id}` });
      }
    }
    if (!trip) {
      return sendSuccess(res, 200, [], 'Trip not found');
    }
    const tolls = await TollTransaction.find({ trip: trip._id }).sort({ dateTime: 1 });
    return sendSuccess(res, 200, tolls, 'Toll transactions fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Invoice for a Trip (Driver API)
 * GET /api/driver/invoices/trip/:tripId
 * GET /api/driver/trips/:tripId/invoice
 */
export const getDriverInvoiceByTripId = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const mongoose = (await import('mongoose')).default;
    const cleanId = String(tripId).replaceAll('#', '').trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);

    console.log(`[Driver Invoice API] Invoice API request URL: ${req.originalUrl}`);
    console.log(`[Driver Invoice API] Incoming tripId param: "${tripId}", cleanId: "${cleanId}"`);

    let trip = await Trip.findOne({
      $or: [
        ...(isObjectId ? [{ _id: cleanId }] : []),
        { tripNumber: cleanId },
        { tripNumber: `#${cleanId}` },
        { tripNumber: cleanId.startsWith('TRP-') ? cleanId : `TRP-${cleanId}` },
        { tripNumber: `#${cleanId.startsWith('TRP-') ? cleanId : `TRP-${cleanId}`}` },
        { 'tripInvoice.invoiceNumber': cleanId },
        { 'tripInvoice.invoiceNumber': `INV-${cleanId}` }
      ]
    }).populate('vehicle').populate('driver');

    console.log(`[Driver Invoice API] Current Trip ID: ${tripId} -> MongoDB Trip _id: ${trip?._id || 'NOT FOUND'}`);
    console.log(`[Driver Invoice API] Invoice ID stored in Trip: ${trip?.tripInvoice?.invoiceId || 'None'}`);

    let invoice = null;
    let invoiceCount = 0;

    if (trip) {
      const invoicesFound = await Invoice.find({
        $or: [
          { trip: trip._id },
          ...(trip.tripInvoice?.invoiceId ? [{ _id: trip.tripInvoice.invoiceId }] : []),
          ...(trip.tripInvoice?.invoiceNumber ? [{ invoiceNumber: trip.tripInvoice.invoiceNumber }] : [])
        ]
      })
      .populate('driver')
      .populate('vehicle')
      .populate('createdBy', 'name fullName email phone');

      invoiceCount = invoicesFound.length;
      if (invoiceCount > 0) {
        invoice = invoicesFound[0];
      }
    } else {
      const invoicesFound = await Invoice.find({
        $or: [
          ...(isObjectId ? [{ _id: cleanId }, { trip: cleanId }] : []),
          { invoiceNumber: cleanId },
          { invoiceNumber: `INV-${cleanId}` }
        ]
      })
      .populate('driver')
      .populate('vehicle')
      .populate('createdBy', 'name fullName email phone');

      invoiceCount = invoicesFound.length;
      if (invoiceCount > 0) {
        invoice = invoicesFound[0];
        trip = await Trip.findById(invoice.trip).populate('vehicle').populate('driver');
      }
    }

    console.log(`[Driver Invoice API] Number of invoices found: ${invoiceCount}`);

    if (!invoice) {
      if (trip) {
        console.log(`[Driver Invoice API] Auto-creating missing Invoice record in DB for trip ${trip._id}`);
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await Invoice.countDocuments({ invoiceNumber: { $regex: new RegExp('^INV-' + datePart) } });
        const seq = String(count + 1).padStart(4, '0');
        const invoiceNumber = trip.tripInvoice?.invoiceNumber || `INV-${datePart}-${seq}`;

        const newInvoice = new Invoice({
          invoiceNumber,
          invoiceDate: new Date(),
          trip: trip._id,
          driver: trip.driver?._id || trip.driver,
          vehicle: trip.vehicle?._id || trip.vehicle,
          createdBy: trip.assignedManager || req.user?._id
        });
        await newInvoice.save();

        trip.tripInvoice = {
          invoiceId: newInvoice._id,
          invoiceNumber: newInvoice.invoiceNumber,
          url: newInvoice.pdfUrl || '',
          generatedAt: newInvoice.createdAt || newInvoice.invoiceDate
        };
        await trip.save();

        invoice = await Invoice.findById(newInvoice._id)
          .populate('driver')
          .populate('vehicle')
          .populate('createdBy', 'name fullName email phone');
      } else {
        console.log(`[Driver Invoice API] No trip or manager-generated invoice exists in DB for cleanId ${cleanId}`);
        return sendSuccess(res, 200, null, 'Invoice not generated yet.');
      }
    }

    console.log(`==================================================`);
    console.log(`[Backend Invoice API Log]`);
    console.log(`  • Trip ID received: ${tripId} (cleanId: "${cleanId}")`);
    console.log(`  • Invoice document found: ${invoice ? `YES (ID: ${invoice._id})` : 'NO'}`);
    console.log(`  • Invoice Number: ${invoice ? invoice.invoiceNumber : 'None'}`);
    console.log(`==================================================`);

    // Single source of truth for trip distance stored in MongoDB
    const storedDistance = (trip.actualDistance && Number(trip.actualDistance) > 0)
      ? Number(trip.actualDistance)
      : ((trip.estimatedDistance && Number(trip.estimatedDistance) > 0)
          ? Number(trip.estimatedDistance)
          : calculateDistance(trip.startLocation, trip.endLocation));

    const actualDistance = storedDistance;

    console.log(`==================================================`);
    console.log(`[Backend Distance Log - Driver Invoice API]`);
    console.log(`  • Trip ID: ${trip._id} (${trip.tripNumber})`);
    console.log(`  • Origin: ${trip.startLocation}`);
    console.log(`  • Destination: ${trip.endLocation}`);
    console.log(`  • Stored distance in MongoDB: ${trip.estimatedDistance} (actual: ${trip.actualDistance})`);
    console.log(`  • Distance used for Invoice: ${storedDistance} KM`);
    console.log(`==================================================`);

    // Fuel and Toll calculation
    const fuelEntries = await Fuel.find({
      $or: [
        { tripId: trip._id.toString() },
        { tripId: trip.tripNumber },
        { tripId: trip.tripNumber?.replace('#', '') },
        { tripId: '#' + trip.tripNumber?.replace('#', '') }
      ]
    });
    let fuelAmount = 0;
    for (const f of fuelEntries) {
      fuelAmount += (Number(f.amount) || 0);
    }
    if (fuelAmount === 0 && trip.totalFuelAmount) {
      fuelAmount = Number(trip.totalFuelAmount) || 0;
    }

    const tollsList = await TollTransaction.find({ trip: trip._id });
    let tollAmount = 0;
    for (const t of tollsList) {
      tollAmount += (Number(t.amountPaid) || 0);
    }

    const freightCharges = Math.round((actualDistance * 230 / 100) * 100) || 5000;
    const loadingCharges = 2500;
    const unloadingCharges = 2500;
    const subtotal = freightCharges + loadingCharges + unloadingCharges + tollAmount + fuelAmount;
    const gstTax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + gstTax;

    let managerInfo = null;
    if (trip.assignedManager) {
      const manager = await User.findById(trip.assignedManager).select('name fullName phone email');
      if (manager) {
        managerInfo = {
          _id: manager._id,
          name: manager.name || manager.fullName || '',
          fullName: manager.fullName || manager.name || '',
          phone: manager.phone || '',
          email: manager.email || ''
        };
      }
    }

    let vehicleObj = trip.vehicle;
    if (vehicleObj && typeof vehicleObj !== 'object') {
      vehicleObj = await Vehicle.findById(vehicleObj);
    }
    const resolvedVehicleName = trip.vehicleName || vehicleObj?.vehicleModel || vehicleObj?.brand || vehicleObj?.vehicleName || vehicleObj?.name || '';
    const resolvedVehiclePlate = trip.vehiclePlate || vehicleObj?.vehicleNumber || vehicleObj?.registrationNumber || '';

    let driverObj = trip.driver;
    if (driverObj && typeof driverObj !== 'object') {
      driverObj = await Driver.findById(driverObj);
    }
    const resolvedDriverName = trip.driverName || driverObj?.fullName || driverObj?.name || `${driverObj?.firstName || ''} ${driverObj?.lastName || ''}`.trim() || '';
    const resolvedDriverPhone = trip.driverPhone || driverObj?.phone || driverObj?.phoneNumber || driverObj?.mobile || '';

    const pickupAddress = trip.pickupAddress || trip.fromAddress || {
      companyName: `${trip.startLocation || 'Pickup'} Logistics Hub`,
      contactPerson: 'Dispatch Desk',
      mobile: resolvedDriverPhone,
      streetAddress: trip.startLocation || '',
      city: trip.startLocation || '',
      state: ''
    };

    const podDoc = (trip.proofOfDelivery && trip.proofOfDelivery.url)
      ? trip.proofOfDelivery
      : await ProofOfDelivery.findOne({
          $or: [{ trip: trip._id }, { tripId: trip._id.toString() }, { tripId: trip.tripNumber }]
        });
    const resolvedReceiverName = podDoc?.receiverName || podDoc?.customerName || trip.proofOfDelivery?.receiverName || trip.deliveryAddress?.contactPerson || '';

    const resolvedDeliveryMobile = trip.deliveryAddress?.mobile ||
      trip.deliveryAddress?.mobileNumber ||
      trip.deliveryAddress?.phone ||
      trip.deliveryAddress?.contactPhone ||
      trip.toAddress?.mobile ||
      trip.toAddress?.mobileNumber ||
      trip.toAddress?.phone ||
      trip.receiverPhone ||
      trip.customerPhone ||
      trip.proofOfDelivery?.customerPhone ||
      trip.proofOfDelivery?.receiverPhone ||
      trip.assignedManager?.phoneNumber ||
      trip.assignedManager?.phone ||
      '';

    const deliveryAddress = {
      ...(trip.deliveryAddress || trip.toAddress || {}),
      companyName: (trip.deliveryAddress?.companyName || trip.toAddress?.companyName || `${trip.endLocation || 'Destination'} Depot`),
      contactPerson: (trip.deliveryAddress?.contactPerson || trip.toAddress?.contactPerson || resolvedReceiverName || 'Receiving Manager'),
      mobile: resolvedDeliveryMobile,
      streetAddress: (trip.deliveryAddress?.streetAddress || trip.toAddress?.streetAddress || ''),
      area: (trip.deliveryAddress?.area || trip.deliveryAddress?.areaLocality || trip.toAddress?.area || trip.toAddress?.areaLocality || ''),
      city: (trip.deliveryAddress?.city || trip.toAddress?.city || trip.endLocation || ''),
      state: (trip.deliveryAddress?.state || trip.toAddress?.state || ''),
      pincode: (trip.deliveryAddress?.pincode || trip.deliveryAddress?.postalCode || trip.toAddress?.pincode || trip.toAddress?.postalCode || '')
    };

    const pdfUrl = invoice.pdfUrl || invoice.invoiceUrl || trip.tripInvoice?.url || '';

    return sendSuccess(res, 200, {
      invoiceId: invoice._id,
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate || invoice.createdAt || invoice.updatedAt || trip.createdAt || trip.departureTime || new Date().toISOString(),
      pdfUrl: pdfUrl,
      documentUrl: pdfUrl,
      status: trip.status === 'Completed' ? 'Paid' : (invoice.status || 'Pending'),
      paymentStatus: trip.status === 'Completed' ? 'Paid' : (invoice.status || 'Pending'),
      paymentMethod: 'Bank Transfer',
      trip: {
        _id: trip._id,
        tripNumber: trip.tripNumber,
        status: trip.status,
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        departureTime: trip.departureTime,
        eta: trip.eta,
        cargoType: trip.cargoType || 'General Cargo',
        cargoWeight: trip.cargoWeight || 0,
        actualDistance: actualDistance,
        vehicleName: resolvedVehicleName,
        vehiclePlate: resolvedVehiclePlate,
        driverName: resolvedDriverName,
        driverPhone: resolvedDriverPhone,
        pickupAddress: pickupAddress,
        deliveryAddress: deliveryAddress,
        manager: managerInfo
      },
      charges: {
        freightCharges,
        loadingCharges,
        unloadingCharges,
        fuelCharges: fuelAmount,
        tollCharges: tollAmount,
        subtotal,
        gstTax,
        totalAmount
      },
      createdBy: invoice.createdBy || managerInfo
    }, 'Invoice fetched successfully');
  } catch (error) {
    next(error);
  }
};





