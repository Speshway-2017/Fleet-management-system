import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Maintenance from '../models/Maintenance.js';

export const syncVehicleStatus = async (vehicleId) => {
  try {
    if (!vehicleId) return;

    // 1. Check if there is any active maintenance log (In Progress, or Scheduled for today or past)
    const activeMaintenance = await Maintenance.findOne({
      vehicle: vehicleId,
      status: { $ne: 'Completed' }
    });

    let newStatus = 'Available';

    if (activeMaintenance) {
      const targetDate = new Date(activeMaintenance.scheduledDate);
      targetDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (activeMaintenance.status === 'In Progress' || (activeMaintenance.status === 'Scheduled' && targetDate <= today)) {
        newStatus = 'Under Maintenance';
      }
    }

    // 2. If it's not under maintenance, check if it is assigned to an active trip
    if (newStatus === 'Available') {
      const activeTrip = await Trip.findOne({
        vehicle: vehicleId,
        status: { $in: ['Scheduled', 'Assigned', 'In Progress', 'On Transit', 'Delayed', 'On Trip', 'Ready to Dispatch'] }
      });
      if (activeTrip) {
        newStatus = ['Scheduled', 'Assigned', 'Ready to Dispatch'].includes(activeTrip.status) ? 'Assigned' : 'On Trip';
      }
    }

    // 3. Update the vehicle status
    await Vehicle.findByIdAndUpdate(vehicleId, { currentStatus: newStatus });
  } catch (err) {
    console.error(`Failed to sync status for vehicle ${vehicleId}:`, err);
  }
};

export const syncAllVehicleStatuses = async () => {
  try {
    const vehicles = await Vehicle.find({});
    for (const vehicle of vehicles) {
      await syncVehicleStatus(vehicle._id);
    }
    console.log('🔄 All vehicle statuses synced successfully.');
  } catch (err) {
    console.error('Failed to sync all vehicle statuses:', err);
  }
};
