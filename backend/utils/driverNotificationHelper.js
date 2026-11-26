import createAndEmitNotification from './notification.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';

/**
 * Driver Action Notification Trigger Types:
 * 1. TRIP_ACCEPTED
 * 2. TRIP_REJECTED
 * 3. DRIVER_MESSAGE
 * 4. DRIVER_CALL
 * 5. MAINTENANCE_RAISED
 * 6. FUEL_SUBMITTED
 * 7. POD_UPLOADED
 * 8. WEIGHBRIDGE_UPLOADED
 * 9. TRIP_STARTED
 * 10. TRIP_COMPLETED
 */

export const triggerDriverNotification = async ({
  type,
  driverId,
  driverName,
  tripId,
  tripNumber,
  vehicleId,
  vehicleNumber,
  ticketId,
  fuelBillId,
  managerId,
  io,
  customMessage
}) => {
  try {
    let title = "";
    let message = "";
    let targetUrl = "";

    // Resolve driver name if not passed
    let resolvedDriverName = driverName;
    if (!resolvedDriverName && driverId) {
      const dDoc = await Driver.findById(driverId);
      if (dDoc) resolvedDriverName = dDoc.fullName;
    }
    resolvedDriverName = resolvedDriverName || "Driver";

    // Resolve trip number if not passed
    let resolvedTripNumber = tripNumber || tripId;
    let resolvedManagerId = managerId;
    let resolvedVehicleNumber = vehicleNumber;

    if (tripId && (!resolvedTripNumber || !resolvedManagerId || !resolvedVehicleNumber)) {
      const tDoc = await Trip.findById(tripId).populate('vehicle');
      if (tDoc) {
        if (!resolvedTripNumber) resolvedTripNumber = tDoc.tripNumber || tDoc._id;
        if (!resolvedManagerId) resolvedManagerId = tDoc.assignedManager;
        if (!resolvedVehicleNumber) resolvedVehicleNumber = tDoc.vehiclePlate || (tDoc.vehicle && tDoc.vehicle.vehicleNumber);
      }
    }

    if (vehicleId && !resolvedVehicleNumber) {
      const vDoc = await Vehicle.findById(vehicleId);
      if (vDoc) resolvedVehicleNumber = vDoc.vehicleNumber;
    }

    switch (type) {
      case 'TRIP_ACCEPTED':
        title = 'Trip Accepted';
        message = `Driver "${resolvedDriverName}" has accepted Trip ${resolvedTripNumber}.`;
        targetUrl = `/manager/trip-details/${tripId}`;
        break;

      case 'TRIP_REJECTED':
        title = 'Trip Rejected';
        message = `Driver "${resolvedDriverName}" has rejected Trip ${resolvedTripNumber}.`;
        targetUrl = `/manager/trip-details/${tripId}`;
        break;

      case 'DRIVER_MESSAGE':
        title = 'New Message';
        message = customMessage || `Driver "${resolvedDriverName}" sent a new message regarding Trip ${resolvedTripNumber}.`;
        targetUrl = `/manager/trip-details/${tripId}?tab=communication`;
        break;

      case 'DRIVER_CALL':
        title = 'Call Request';
        message = `Driver "${resolvedDriverName}" requested a call for Trip ${resolvedTripNumber}.`;
        targetUrl = `/manager/trip-details/${tripId}?tab=communication`;
        break;

      case 'MAINTENANCE_RAISED':
        title = 'Maintenance Ticket Raised';
        message = `Driver "${resolvedDriverName}" raised a maintenance ticket for Vehicle ${resolvedVehicleNumber || 'N/A'}.`;
        targetUrl = `/manager/maintenance`;
        break;

      case 'FUEL_SUBMITTED':
        title = 'Fuel Bill Submitted';
        message = `Driver "${resolvedDriverName}" submitted a fuel bill for approval.`;
        targetUrl = `/manager/fuel-management`;
        break;

      case 'POD_UPLOADED':
        title = 'Proof of Delivery Uploaded';
        message = `Driver "${resolvedDriverName}" uploaded the Proof of Delivery for Trip ${resolvedTripNumber}.`;
        targetUrl = `/manager/trip-details/${tripId}`;
        break;

      case 'WEIGHBRIDGE_UPLOADED':
        title = 'Weighbridge Slip Uploaded';
        message = `Driver "${resolvedDriverName}" uploaded the Weighbridge Slip.`;
        targetUrl = `/manager/trip-details/${tripId}`;
        break;

      case 'TRIP_STARTED':
        title = 'Trip Started';
        message = `Driver "${resolvedDriverName}" started Trip ${resolvedTripNumber}.`;
        targetUrl = `/manager/trip-details/${tripId}`;
        break;

      case 'TRIP_COMPLETED':
        title = 'Trip Completed';
        message = `Driver "${resolvedDriverName}" completed Trip ${resolvedTripNumber}.`;
        targetUrl = `/manager/trip-details/${tripId}`;
        break;

      default:
        title = 'Driver Update';
        message = customMessage || `Driver "${resolvedDriverName}" performed an update.`;
        targetUrl = `/manager/notifications`;
        break;
    }

    return await createAndEmitNotification({
      io,
      recipient: resolvedManagerId,
      sender: driverId,
      recipientRole: 'FLEET_MANAGER',
      type,
      title,
      message,
      priority: 'high',
      metadata: {
        driverId,
        driverName: resolvedDriverName,
        tripId,
        tripNumber: resolvedTripNumber,
        vehicleId,
        vehicleNumber: resolvedVehicleNumber,
        ticketId,
        fuelBillId,
        targetUrl
      },
      referenceId: tripId || ticketId || fuelBillId,
      referenceType: type
    });
  } catch (err) {
    console.error('❌ Error triggering driver notification:', err.message);
  }
};
