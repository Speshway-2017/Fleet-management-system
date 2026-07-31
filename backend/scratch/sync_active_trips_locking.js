import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

async function syncLocking() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fleet_management');
  console.log("Connected to MongoDB.");

  // Get all active trips (status not Completed and not Cancelled)
  const activeTrips = await Trip.find({ status: { $nin: ['Completed', 'Cancelled'] } }).sort({ createdAt: -1 });
  console.log(`Found ${activeTrips.length} active trips.`);

  const lockedVehicles = new Set();
  const lockedDrivers = new Set();

  for (const t of activeTrips) {
    console.log(`Active Trip ${t.tripNumber} (${t.status}) - Vehicle: ${t.vehicle}, Driver: ${t.driver}`);
    
    const vId = String(t.vehicle);
    const dId = String(t.driver);

    // If vehicle is already locked by a newer active trip, cancel/reassign duplicate trip or log
    if (lockedVehicles.has(vId)) {
      console.log(`⚠️ Duplicate vehicle detected on active trip ${t.tripNumber}!`);
    } else {
      lockedVehicles.add(vId);
      const vStatus = t.status === 'In Progress' || t.status === 'On Transit' ? 'On Trip' : 'Assigned';
      await Vehicle.findByIdAndUpdate(t.vehicle, { currentStatus: vStatus, assignedDriver: t.driver });
    }

    if (lockedDrivers.has(dId)) {
      console.log(`⚠️ Duplicate driver detected on active trip ${t.tripNumber}!`);
    } else {
      lockedDrivers.add(dId);
      const dStatus = t.status === 'In Progress' || t.status === 'On Transit' ? 'ON_TRIP' : 'ASSIGNED';
      await Driver.findByIdAndUpdate(t.driver, { driverStatus: dStatus });
    }
  }

  // Set all vehicles NOT on active trips to Available (unless Under Maintenance)
  const unlockedVehicles = await Vehicle.find({ _id: { $nin: Array.from(lockedVehicles) }, currentStatus: { $ne: 'Under Maintenance' } });
  for (const v of unlockedVehicles) {
    await Vehicle.findByIdAndUpdate(v._id, { currentStatus: 'Available', assignedDriver: null });
  }

  // Set all drivers NOT on active trips to AVAILABLE
  const unlockedDrivers = await Driver.find({ _id: { $nin: Array.from(lockedDrivers) }, driverStatus: { $ne: 'SUSPENDED' } });
  for (const d of unlockedDrivers) {
    await Driver.findByIdAndUpdate(d._id, { driverStatus: 'AVAILABLE', assignedVehicle: 'Unassigned' });
  }

  await mongoose.disconnect();
  console.log("Done syncing resource locking.");
}

syncLocking().catch(console.error);
