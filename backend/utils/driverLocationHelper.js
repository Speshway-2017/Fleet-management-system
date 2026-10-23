import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';

/**
 * Ensures a driver's currentLocation and driverLocation are synced with the destination
 * of their most recently completed trip if completed trips exist.
 *
 * @param {Object} driver - Mongoose document or plain JS object
 * @returns {Promise<Object>} Updated driver document or object
 */
export const syncDriverLocationFromLatestTrip = async (driver) => {
  if (!driver || !driver._id) return driver;

  try {
    const latestCompletedTrip = await Trip.findOne({
      driver: driver._id,
      status: 'Completed'
    }).sort({ actualEndTime: -1, updatedAt: -1, createdAt: -1 });

    if (latestCompletedTrip && (latestCompletedTrip.endLocation || latestCompletedTrip.destination)) {
      const latestDest = (latestCompletedTrip.endLocation || latestCompletedTrip.destination).trim();
      if (latestDest) {
        driver.currentLocation = latestDest;
        driver.driverLocation = latestDest;

        await Driver.findByIdAndUpdate(driver._id, {
          currentLocation: latestDest,
          driverLocation: latestDest
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('Error syncing driver location from latest trip:', e);
  }
  return driver;
};

/**
 * Atomically updates Driver and Vehicle locations upon trip completion
 *
 * @param {string|ObjectId} driverId
 * @param {string|ObjectId} vehicleId
 * @param {string} destinationLocation
 */
export const updateDriverAndVehicleOnCompletion = async (driverId, vehicleId, destinationLocation = '') => {
  const cleanDest = (destinationLocation || '').trim();
  const dId = (driverId && typeof driverId === 'object') ? (driverId._id || driverId.id) : driverId;
  const vId = (vehicleId && typeof vehicleId === 'object') ? (vehicleId._id || vehicleId.id) : vehicleId;

  try {
    if (dId) {
      const driverUpdate = {
        driverStatus: 'AVAILABLE',
        assignedVehicle: 'Unassigned',
        isAssigned: false,
        activeTripId: null,
        currentTripId: null
      };
      if (cleanDest) {
        driverUpdate.currentLocation = cleanDest;
        driverUpdate.driverLocation = cleanDest;
      }
      await Driver.findByIdAndUpdate(dId, driverUpdate);

      // Unassign any vehicles pointing to this driver
      await Vehicle.updateMany(
        { assignedDriver: dId },
        {
          $set: {
            assignedDriver: null,
            currentStatus: 'Available',
            isAssigned: false,
            activeTripId: null,
            currentTripId: null,
            ...(cleanDest ? { branch: cleanDest, currentLocation: cleanDest } : {})
          }
        }
      ).catch(() => {});
    }

    if (vId) {
      const vehicleUpdate = {
        currentStatus: 'Available',
        assignedDriver: null,
        isAssigned: false,
        activeTripId: null,
        currentTripId: null
      };
      if (cleanDest) {
        vehicleUpdate.branch = cleanDest;
        vehicleUpdate.currentLocation = cleanDest;
      }
      await Vehicle.findByIdAndUpdate(vId, vehicleUpdate);
    }
  } catch (err) {
    console.error('Error updating driver/vehicle location on completion:', err);
    throw err;
  }
};

/**
 * Ensures a vehicle's currentLocation and branch are synced with the destination
 * of its most recently completed trip if completed trips exist.
 *
 * @param {Object} vehicle - Mongoose document or plain JS object
 * @returns {Promise<Object>} Updated vehicle document or object
 */
export const syncVehicleLocationFromLatestTrip = async (vehicle) => {
  if (!vehicle || !vehicle._id) return vehicle;

  try {
    const latestCompletedTrip = await Trip.findOne({
      vehicle: vehicle._id,
      status: 'Completed'
    }).sort({ actualEndTime: -1, updatedAt: -1, createdAt: -1 });

    if (latestCompletedTrip && (latestCompletedTrip.endLocation || latestCompletedTrip.destination)) {
      const latestDest = (latestCompletedTrip.endLocation || latestCompletedTrip.destination).trim();
      if (latestDest) {
        vehicle.currentLocation = latestDest;
        vehicle.branch = latestDest;

        await Vehicle.findByIdAndUpdate(vehicle._id, {
          currentLocation: latestDest,
          branch: latestDest
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('Error syncing vehicle location from latest trip:', e);
  }
  return vehicle;
};
