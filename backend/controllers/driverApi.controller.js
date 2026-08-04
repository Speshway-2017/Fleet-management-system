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
import { comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import cloudinary from '../utils/cloudinary.js';
import { createAndEmitNotification } from '../utils/notification.js';

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
      } catch (e) { }
    }

    return sendSuccess(res, 200, {
      driverId: driver.employeeId || driver._id,
      employeeId: driver.employeeId || '',
      fullName: driver.fullName,
      email: driver.email,
      phone: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      licenseExpiry: driver.licenseExpiry || null,
      vehicle: driver.assignedVehicle || 'Unassigned',
      driverStatus: driver.driverStatus,
      profileImage: driver.profileImage || '',
      address: driver.address || '',
      branch: driver.branch || '',
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
      'isDuty',
      'driverStatus'
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        if (key === 'phone') {
          updateData['phoneNumber'] = req.body[key];
        } else {
          updateData[key] = req.body[key];
        }
      }
    }

    if (req.body.isDuty !== undefined) {
      const isDutyBool = Boolean(req.body.isDuty);
      updateData['isDuty'] = isDutyBool;
      if (!isDutyBool) {
        updateData['driverStatus'] = 'OFFLINE';
      } else {
        const currentDriver = await Driver.findById(driverId).select('driverStatus');
        if (currentDriver && currentDriver.driverStatus !== 'ON_TRIP' && currentDriver.driverStatus !== 'ASSIGNED') {
          updateData['driverStatus'] = 'AVAILABLE';
        }
      }
    }

    if (req.body.driverStatus !== undefined) {
      updateData['driverStatus'] = req.body.driverStatus;
      if (req.body.driverStatus === 'OFFLINE' || req.body.driverStatus === 'OFF_DUTY') {
        updateData['isDuty'] = false;
      } else if (req.body.driverStatus === 'AVAILABLE' || req.body.driverStatus === 'ON_TRIP') {
        updateData['isDuty'] = true;
      }
    }

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
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedDriver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    // Emit real-time status update to assigned manager & global manager socket room
    try {
      const io = req.app.get('io');
      if (io) {
        const payload = {
          driverId: updatedDriver._id,
          id: updatedDriver._id,
          driverStatus: updatedDriver.driverStatus,
          isDuty: updatedDriver.isDuty,
          fullName: updatedDriver.fullName
        };
        if (updatedDriver.assignedManager) {
          io.to(`user_${updatedDriver.assignedManager}`).emit('driver:status-updated', payload);
        }
        io.emit('driver:status-updated', payload);
      }
    } catch (sockErr) {
      console.error('Socket emit error on driver status update:', sockErr);
    }

    return sendSuccess(res, 200, updatedDriver, 'Driver profile updated successfully');
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
      _id: currentTrip._id,
      id: currentTrip._id,
      tripId: currentTrip._id,
      tripNumber: currentTrip.tripNumber,
      pickup: currentTrip.startLocation,
      destination: currentTrip.endLocation,
      startLocation: currentTrip.startLocation,
      endLocation: currentTrip.endLocation,
      origin: { address: currentTrip.startLocation },
      destinationObj: { address: currentTrip.endLocation },
      status: currentTrip.status,
      eta: currentTrip.eta,
      departureTime: currentTrip.departureTime,
      cargoType: currentTrip.cargoType,
      cargoWeight: currentTrip.cargoWeight,
      vehicle: currentTrip.vehicle || currentTrip.vehiclePlate || currentTrip.vehicleName || 'Vehicle',
      vehiclePlate: currentTrip.vehiclePlate || currentTrip.vehicle?.registrationNumber || 'Vehicle',
      podStatus: currentTrip.podStatus,
      weighbridgeStatus: currentTrip.weighbridgeStatus,
      customerLocationReached: currentTrip.customerLocationReached || false,
      customerLocationReachedAt: currentTrip.customerLocationReachedAt || null,
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
          { targetRole: 'DRIVER' }
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
          { targetRole: 'DRIVER' }
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
 * Respond to Trip Assignment (Accept or Reject)
 * PATCH /api/driver/trips/:id/respond
 */
export const respondToTripAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawAction = req.body.action || req.body.status;
    const action = rawAction?.toLowerCase() === 'accepted' ? 'accept' : rawAction?.toLowerCase() === 'rejected' ? 'reject' : rawAction;

    if (!action || !['accept', 'reject'].includes(action.toLowerCase())) {
      return sendError(res, 400, 'Valid action (accept or reject) is required');
    }

    const trip = await Trip.findById(id).populate('vehicle').populate('driver');
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    const isAccept = action.toLowerCase() === 'accept';
    const newStatus = isAccept ? 'Accepted' : 'Rejected';
    trip.status = newStatus;
    await trip.save();

    const driverDoc = await Driver.findById(req.user._id);

    if (!isAccept) {
      // Revert driver and vehicle status to available
      await Driver.findByIdAndUpdate(req.user._id, { driverStatus: 'AVAILABLE', assignedVehicle: 'Unassigned' });
      if (trip.vehicle) {
        await Vehicle.findByIdAndUpdate(trip.vehicle._id || trip.vehicle, { currentStatus: 'Available', assignedDriver: null });
      }
    }

    const io = req.app.get('socketio') || req.app.locals?.io;
    const managerId = trip.assignedManager;

    if (managerId) {
      await createAndEmitNotification({
        io,
        recipient: managerId,
        recipientRole: 'FLEET_MANAGER',
        type: isAccept ? 'trip_accepted' : 'trip_rejected',
        title: `Trip ${trip.tripNumber} ${isAccept ? 'Accepted' : 'Rejected'}`,
        message: `Driver ${driverDoc?.fullName || req.user.name || 'Assigned driver'} has ${isAccept ? 'accepted' : 'rejected'} trip #${trip.tripNumber}.`,
        priority: isAccept ? 'normal' : 'high',
        metadata: { tripId: trip._id, action: newStatus }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('trip:status-updated', {
          tripId: trip._id,
          status: newStatus,
          driverId: req.user._id
        });
      }
    }

    return sendSuccess(res, 200, trip, `Trip assignment ${isAccept ? 'accepted' : 'rejected'} successfully`);
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid trip ID format');
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    const targetStatus = status === 'Start Trip' ? 'In Progress' : (status === 'Complete Trip' ? 'Completed' : status);

    // Validate 15 min start restriction for starting active progress
    if (['In Progress', 'En Route', 'At Loading', 'In Transit'].includes(targetStatus) && trip.status === 'Assigned') {
      const departure = new Date(trip.departureTime);
      const now = new Date();
      // Enable start if current time is within 15 minutes of departure or later
      if (trip.departureTime && !isNaN(departure.getTime())) {
        const marginMs = 15 * 60 * 1000;
        if (now.getTime() + marginMs < departure.getTime()) {
          const diffMins = Math.ceil((departure.getTime() - now.getTime()) / 60000);
          return sendError(res, 400, `Trip start is locked until 15 minutes before scheduled departure time. Scheduled departure is in ${diffMins} minutes.`);
        }
      }
      if (!trip.actualStartTime) trip.actualStartTime = new Date();
    } else if (['In Progress', 'En Route', 'At Loading', 'In Transit', 'Delivered'].includes(targetStatus)) {
      if (!trip.actualStartTime) trip.actualStartTime = new Date();
    } else if (['Completed', 'Complete Trip'].includes(targetStatus)) {
      trip.actualEndTime = new Date();
    }

    trip.status = targetStatus;
    await trip.save();

    // Update Driver & Vehicle status and locations if applicable
    if (['Completed', 'Complete Trip'].includes(targetStatus)) {
      const destLocation = trip.endLocation || trip.destination?.address || trip.destinationObj?.address || 'Customer Location';
      await Driver.findByIdAndUpdate(req.user._id, {
        driverStatus: 'AVAILABLE',
        assignedVehicle: 'Unassigned',
        driverLocation: destLocation,
        currentLocation: destLocation,
        currentCity: destLocation
      });
      if (trip.vehicle && mongoose.Types.ObjectId.isValid(trip.vehicle)) {
        await Vehicle.findByIdAndUpdate(trip.vehicle, {
          currentStatus: 'Available',
          assignedDriver: null,
          currentLocation: destLocation,
          branch: destLocation
        });
      }
    } else {
      await Driver.findByIdAndUpdate(req.user._id, { driverStatus: 'ON_TRIP' });
      if (trip.vehicle && mongoose.Types.ObjectId.isValid(trip.vehicle)) {
        await Vehicle.findByIdAndUpdate(trip.vehicle, { currentStatus: 'On Trip' });
      }
    }

    // Broadcast Socket.io event and notification to manager safely
    try {
      const io = req.app.get('socketio') || req.app.locals?.io;
      const managerId = trip.assignedManager;
      const driverDoc = await Driver.findById(req.user._id);

      if (managerId) {
        if (targetStatus === 'In Progress') {
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
        }

        if (io) {
          io.to(`manager:${managerId}`).emit('trip:status-updated', {
            tripId: trip._id,
            status: trip.status,
            driverId: req.user._id
          });
        }
      }
    } catch (notifyErr) {
      console.error('Error emitting trip status notification:', notifyErr);
    }

    return sendSuccess(res, 200, trip, 'Trip status updated successfully');
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
    let manager = driver?.assignedManager;

    if (!manager && driver?.organization) {
      manager = await User.findOne({ role: 'FLEET_MANAGER', organization: driver.organization });
    }
    if (!manager) {
      const trip = await Trip.findOne({ driver: req.user._id }).populate('assignedManager');
      if (trip && trip.assignedManager) {
        manager = trip.assignedManager;
      }
    }
    if (!manager) {
      manager = await User.findOne({ role: 'FLEET_MANAGER' });
    }

    return sendSuccess(res, 200, {
      manager: {
        name: manager ? manager.name : 'Fleet Manager',
        phone: manager ? (manager.phone || '+919876543210') : '+919876543210',
        email: manager ? manager.email : 'manager@fleet.com',
        jobTitle: manager?.jobTitle || 'Assigned Fleet Manager'
      },
      dispatcher: {
        name: 'Central Dispatch Desk',
        phone: '+919876543211',
        email: 'dispatch@fleet.com'
      }
    }, 'Support contact retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Proof of Delivery (POD)
 * POST /api/driver/pod
 */
/**
 * Upload Proof of Delivery (POD)
 * POST /api/driver/pod
 */
export const uploadProofOfDelivery = async (req, res, next) => {
  try {
    const { tripId, customerName, receiverName, customerSignatureUrl, deliveryPhotoUrl, podDocumentUrl } = req.body;

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

    let pod = await ProofOfDelivery.findOne({ trip: tripId });
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
        trip: tripId || null,
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

    let managerId = null;
    if (tripId) {
      const updatedTrip = await Trip.findByIdAndUpdate(tripId, { podStatus: 'Uploaded' }, { new: true });
      if (updatedTrip?.assignedManager) {
        managerId = updatedTrip.assignedManager;
      }
    }

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
        metadata: { podId: pod._id, tripId }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('pod:uploaded', pod);
        io.to(`manager:${managerId}`).emit('trip:status-updated', { tripId, podStatus: 'Uploaded' });
      }
    }

    return sendSuccess(res, 201, pod, 'Proof of Delivery uploaded successfully');
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

    let slip = await WeighbridgeSlip.findOne({ trip: tripId });
    if (slip) {
      slip.grossWeight = gross;
      slip.tareWeight = tare;
      slip.netWeight = calculatedNet;
      if (location) slip.location = location;
      if (secureUrl) slip.documentUrl = secureUrl;
      slip.status = 'Pending';
      slip.rejectionReason = '';
      await slip.save();
    } else {
      slip = new WeighbridgeSlip({
        slipNumber: `WB-${Date.now()}`,
        trip: tripId || null,
        driver: req.user._id,
        grossWeight: gross,
        tareWeight: tare,
        netWeight: calculatedNet,
        location: location || 'Highway Weighbridge Station',
        uploadedBy: req.user.name || 'Driver',
        status: 'Pending',
        documentUrl: secureUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      });
      await slip.save();
    }

    let managerId = null;
    if (tripId) {
      const updatedTrip = await Trip.findByIdAndUpdate(tripId, { weighbridgeStatus: 'Uploaded' }, { new: true });
      if (updatedTrip?.assignedManager) {
        managerId = updatedTrip.assignedManager;
      }
    }

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
        metadata: { slipId: slip._id, tripId }
      });

      if (io) {
        io.to(`manager:${managerId}`).emit('weighbridge:uploaded', { slip, slipId: slip._id, tripId, url: slip.documentUrl });
        io.to(`manager:${managerId}`).emit('trip:status-updated', { tripId, weighbridgeStatus: 'Uploaded' });
      }
    }

    return sendSuccess(res, 201, slip, 'Weighbridge slip uploaded successfully');
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

    const trips = await Trip.find(query).populate('vehicle').sort({ createdAt: -1 });

    const formattedTrips = trips.map((trip) => ({
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
      vehicle: trip.vehicle || trip.vehiclePlate || trip.vehicleName || 'Vehicle',
      vehiclePlate: trip.vehiclePlate || trip.vehicle?.registrationNumber || 'Vehicle',
      podStatus: trip.podStatus,
      weighbridgeStatus: trip.weighbridgeStatus,
      customerLocationReached: trip.customerLocationReached || false,
      customerLocationReachedAt: trip.customerLocationReachedAt || null,
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

    // 1. Direct query on Vehicle by assignedDriver
    let vehicle = await Vehicle.findOne({
      $or: [
        { assignedDriver: driverId },
        { assignedDriver: driver._id.toString() }
      ]
    }).populate('assignedManager', 'name email phone');

    // 2. Check driver's assignedVehicle property
    if (!vehicle && driver.assignedVehicle && driver.assignedVehicle !== 'Unassigned' && driver.assignedVehicle !== '') {
      const orConditions = [
        { vehicleNumber: driver.assignedVehicle },
        { registrationNumber: driver.assignedVehicle }
      ];
      if (mongoose.Types.ObjectId.isValid(driver.assignedVehicle)) {
        orConditions.push({ _id: driver.assignedVehicle });
      }
      vehicle = await Vehicle.findOne({ $or: orConditions }).populate('assignedManager', 'name email phone');
    }

    // 3. Fallback to active trip vehicle ONLY (not completed/cancelled trips)
    if (!vehicle) {
      const activeTrip = await Trip.findOne({
        driver: driverId,
        status: { $nin: ['Completed', 'Cancelled', 'Rejected'] }
      }).sort({ createdAt: -1 }).populate('vehicle');

      if (activeTrip && activeTrip.vehicle) {
        if (typeof activeTrip.vehicle === 'object' && activeTrip.vehicle._id) {
          vehicle = await Vehicle.findById(activeTrip.vehicle._id).populate('assignedManager', 'name email phone');
        } else if (mongoose.Types.ObjectId.isValid(activeTrip.vehicle)) {
          vehicle = await Vehicle.findById(activeTrip.vehicle).populate('assignedManager', 'name email phone');
        } else if (typeof activeTrip.vehicle === 'string') {
          vehicle = await Vehicle.findOne({
            $or: [
              { vehicleNumber: activeTrip.vehicle },
              { registrationNumber: activeTrip.vehicle }
            ]
          }).populate('assignedManager', 'name email phone');
        }
      }
    }

    if (!vehicle) {
      return sendSuccess(res, 200, { assigned: false, vehicle: null }, 'No vehicle assigned');
    }

    const vehObj = vehicle.toObject ? vehicle.toObject() : { ...vehicle };

    // Normalize field aliases so frontend components receive uniform data
    vehObj.registrationNumber = vehObj.registrationNumber || vehObj.vehicleNumber || 'N/A';
    vehObj.vehicleNumber = vehObj.vehicleNumber || vehObj.registrationNumber || 'N/A';
    vehObj.brand = vehObj.brand || vehObj.manufacturer || vehObj.make || '';
    vehObj.make = vehObj.make || vehObj.brand || vehObj.manufacturer || '';
    vehObj.model = vehObj.model || '';
    vehObj.type = vehObj.vehicleType || vehObj.type || 'Truck';
    vehObj.vehicleType = vehObj.vehicleType || vehObj.type || 'Truck';
    vehObj.year = vehObj.manufactureYear || vehObj.year || '';
    vehObj.manufactureYear = vehObj.manufactureYear || vehObj.year || '';
    vehObj.fuelType = vehObj.fuelType || 'Diesel';
    vehObj.tankCapacity = vehObj.fuelCapacity || vehObj.tankCapacity || 0;
    vehObj.fuelCapacity = vehObj.fuelCapacity || vehObj.tankCapacity || 0;
    vehObj.status = vehObj.currentStatus || vehObj.status || 'Available';
    vehObj.currentStatus = vehObj.currentStatus || vehObj.status || 'Available';
    vehObj.insuranceExpiry = vehObj.insuranceExpiry || vehObj.insuranceDetails?.expiryDate || null;
    vehObj.fitnessExpiry = vehObj.fitnessExpiry || vehObj.permitDetails?.expiryDate || null;

    // Attach driver info
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
    const { fuelStation, station, stationName, amount, totalCost, liters, quantity, odometer, odometerReading, tripId } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return sendError(res, 404, 'Driver profile not found');
    }

    let vehicle = await Vehicle.findOne({ assignedDriver: driverId });
    if (!vehicle && driver.assignedVehicle && driver.assignedVehicle !== 'Unassigned' && driver.assignedVehicle !== '') {
      const orConditions = [
        { vehicleNumber: driver.assignedVehicle },
        { registrationNumber: driver.assignedVehicle }
      ];
      if (mongoose.Types.ObjectId.isValid(driver.assignedVehicle)) {
        orConditions.push({ _id: driver.assignedVehicle });
      }
      vehicle = await Vehicle.findOne({ $or: orConditions });
    }
    if (!vehicle) {
      const activeTrip = await Trip.findOne({ driver: driverId, status: { $nin: ['Completed', 'Cancelled'] } }).populate('vehicle');
      if (activeTrip && activeTrip.vehicle && typeof activeTrip.vehicle === 'object') {
        vehicle = activeTrip.vehicle;
      }
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

    const stName = stationName || fuelStation || station || 'General Fuel Station';
    const totalAmt = Number(amount) || Number(totalCost) || 0;
    const totalLit = Number(liters) || Number(quantity) || 0;
    const odom = Number(odometer) || Number(odometerReading) || (vehicle ? vehicle.odometer : 0) || 0;

    const fuel = new Fuel({
      vehicle: vehicle ? vehicle._id : undefined,
      vehicleId: vehicle ? (vehicle.vehicleNumber || vehicle.registrationNumber) : (driver.assignedVehicle || 'Unassigned'),
      vehicleName: vehicle ? (vehicle.vehicleName || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle') : 'Vehicle',
      driver: driver.fullName || req.user.name || 'Driver',
      driverId: driver.employeeId || driver._id.toString(),
      tripId: tripId || '',
      odometer: odom,
      fuelStation: stName,
      amount: totalAmt,
      liters: totalLit,
      receiptImage: receiptImageUrl,
      billUrl: receiptImageUrl,
      billStatus: receiptImageUrl ? 'Uploaded' : 'Pending',
      approvalStatus: 'Pending',
      hasReceipt: Boolean(receiptImageUrl),
      recordedBy: req.user._id
    });

    await fuel.save();

    const obj = fuel.toObject();
    obj.stationName = stName;
    obj.fuelStation = stName;
    obj.quantity = totalLit;
    obj.liters = totalLit;
    obj.totalCost = totalAmt;
    obj.amount = totalAmt;
    obj.odometerReading = odom;
    obj.status = 'Pending';
    obj.approvalStatus = 'Pending';
    obj.receiptUrl = receiptImageUrl;
    obj.vehicleRegistration = obj.vehicleId;

    return sendSuccess(res, 201, obj, 'Fuel entry submitted successfully');
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

    const filterConditions = [{ recordedBy: driverId }];
    if (driverId) filterConditions.push({ driverId: driverId.toString() });
    if (driver?.employeeId) filterConditions.push({ driverId: driver.employeeId });
    if (driver?.fullName) filterConditions.push({ driver: driver.fullName });

    const filter = filterConditions.length > 0 ? { $or: filterConditions } : {};

    const fuels = await Fuel.find(filter).populate('vehicle').sort({ createdAt: -1 });

    const formattedFuels = fuels.map(f => {
      const obj = f.toObject();
      const img = obj.receiptImage || obj.billUrl || '';
      obj.receiptImage = img;
      obj.billUrl = img;
      obj.receiptUrl = img;
      obj.stationName = obj.fuelStation || obj.stationName || 'Fuel Station';
      obj.quantity = obj.liters || obj.quantity || 0;
      obj.totalCost = obj.amount || obj.totalCost || 0;
      obj.odometerReading = obj.odometer || obj.odometerReading || 0;
      obj.status = obj.approvalStatus || obj.billStatus || 'Pending';
      obj.vehicleRegistration = obj.vehicleId || obj.vehicleName || (obj.vehicle ? (obj.vehicle.registrationNumber || obj.vehicle.vehicleNumber) : 'Assigned Truck');
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

    // Update vehicle currentStatus to Need Maintenance
    if (complaint.vehiclePlate) {
      await Vehicle.findOneAndUpdate(
        { vehicleNumber: complaint.vehiclePlate },
        { currentStatus: 'Need Maintenance' }
      ).catch(() => {});
    }

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
 * POST /api/driver/tickets/:id/resolve
 */
export const updateDriverTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { status, notes, actualCost } = req.body;
    const driverId = req.user._id;

    const queryFilter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { ticketId: id }], driver: driverId }
      : { ticketId: id, driver: driverId };

    const ticket = await VehicleComplaint.findOne(queryFilter);

    if (!ticket) {
      return sendError(res, 404, 'Ticket not found');
    }

    const validStatuses = [
      'Mechanic Arrived',
      'Repair In Progress',
      'Repair Completed',
      'Need Maintenance',
      'Resolved',
      'Closed'
    ];

    if (status && !validStatuses.includes(status)) {
      return sendError(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (!status) {
      status = ticket.status || 'Need Maintenance';
    }

    // Process file upload for service bill if provided
    let serviceBillUrl = req.body.serviceBillUrl || '';
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'fleet_service_bills', resource_type: 'auto' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          uploadStream.end(req.file.buffer);
        });
        serviceBillUrl = uploadResult.secure_url;
      } catch (err) {
        console.warn('Cloudinary service bill upload error:', err.message);
      }
    }

    if (serviceBillUrl) {
      if (!ticket.attachments) ticket.attachments = [];
      ticket.attachments.push({
        url: serviceBillUrl,
        filename: req.file ? req.file.originalname : 'service_bill.jpg',
        uploadedAt: new Date()
      });
    }

    if (actualCost !== undefined && actualCost !== null && actualCost !== '') {
      ticket.actualCost = Number(actualCost) || ticket.actualCost || 0;
    }

    ticket.status = status;

    let timelineNote = notes || `Driver updated status to ${status}`;
    if (serviceBillUrl) {
      timelineNote += ` (Service Bill uploaded)`;
    }

    ticket.repairTimeline.push({
      status,
      updatedBy: `Driver (${ticket.driverName || req.user.name || 'Driver'})`,
      updatedAt: new Date(),
      notes: timelineNote
    });

    if (status === 'Resolved' || status === 'Closed' || status === 'Repair Completed') {
      ticket.completionDate = new Date();
      // Restore vehicle operational status if assigned
      if (ticket.vehicle) {
        try {
          await Vehicle.findByIdAndUpdate(ticket.vehicle, {
            status: 'Available',
            currentStatus: 'Available',
            operationalStatus: 'Operational'
          });
        } catch (vehErr) {
          console.warn('Could not restore vehicle status:', vehErr.message);
        }
      }
    }

    await ticket.save();

    // Create & emit manager notification
    const driver = await Driver.findById(driverId);
    const managerId = driver?.assignedManager || req.user.managerId;

    if (managerId) {
      try {
        let notifTitle = `Ticket Update: ${ticket.ticketId}`;
        let notifMessage = `Driver ${ticket.driverName || 'Driver'} updated ticket ${ticket.ticketId} stage to ${status}.`;
        let notifPriority = 'normal';

        if (status === 'Need Maintenance') {
          notifTitle = `🚨 Need Maintenance Alert: ${ticket.ticketId}`;
          notifMessage = `Vehicle ${ticket.vehiclePlate || 'assigned'} repair incomplete! Driver ${ticket.driverName || 'Driver'} requested manager maintenance assistance.`;
          notifPriority = 'high';
        } else if (status === 'Resolved' || status === 'Closed') {
          notifTitle = `✅ Maintenance Resolved: ${ticket.ticketId}`;
          notifMessage = `Driver ${ticket.driverName || 'Driver'} resolved ticket ${ticket.ticketId}.${serviceBillUrl ? ' Service bill uploaded.' : ''}`;
        }

        const io = req.app.get('socketio') || req.app.locals?.io || req.io;

        await createAndEmitNotification({
          io,
          recipient: managerId,
          recipientRole: 'FLEET_MANAGER',
          title: notifTitle,
          message: notifMessage,
          type: 'alert',
          priority: notifPriority,
          metadata: {
            ticketId: ticket.ticketId,
            complaintId: ticket._id,
            vehiclePlate: ticket.vehiclePlate,
            status: ticket.status,
            serviceBillUrl
          }
        });

        if (io) {
          io.to(`manager:${managerId}`).emit('ticket:status-updated', {
            ticketId: ticket.ticketId,
            complaintId: ticket._id,
            status: ticket.status,
            serviceBillUrl,
            driverName: ticket.driverName
          });
        }
      } catch (err) {
        console.warn('Failed to emit ticket status update notification:', err.message);
      }
    }

    return sendSuccess(res, 200, ticket, `Ticket status updated to ${status} successfully`);
  } catch (error) {
    next(error);
  }
};





