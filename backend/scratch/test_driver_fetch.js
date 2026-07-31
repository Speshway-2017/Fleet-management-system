import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import { resolveLocationName, isCoordinateString } from '../utils/reverseGeocoder.js';

async function testFetch() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fleet_management');
  console.log("Connected to MongoDB.");

  const drivers = await Driver.find({});
  console.log(`Total Drivers in DB: ${drivers.length}`);
  for (const d of drivers) {
    console.log(`Driver: ${d.fullName} | EmpID: ${d.employeeId} | Status: ${d.driverStatus} | Location: "${d.currentLocation}" | DriverLoc: "${d.driverLocation}" | Branch: "${d.branch}"`);
    
    // Resolve coordinates if any
    const rawLoc = d.currentLocation || d.driverLocation;
    if (isCoordinateString(rawLoc)) {
      const resolved = await resolveLocationName(rawLoc, d.branch);
      console.log(`   -> Resolving coordinates "${rawLoc}" -> "${resolved}"`);
      await Driver.findByIdAndUpdate(d._id, { currentLocation: resolved, driverLocation: resolved });
    }
  }

  const vehicles = await Vehicle.find({});
  console.log(`\nTotal Vehicles in DB: ${vehicles.length}`);
  for (const v of vehicles) {
    console.log(`Vehicle: ${v.vehicleName} (${v.vehicleNumber}) | Status: ${v.currentStatus} | Location: "${v.currentLocation}" | Branch: "${v.branch}"`);
    
    if (isCoordinateString(v.currentLocation)) {
      const resolved = await resolveLocationName(v.currentLocation, v.branch || v.branchDepot);
      console.log(`   -> Resolving coordinates "${v.currentLocation}" -> "${resolved}"`);
      await Vehicle.findByIdAndUpdate(v._id, { currentLocation: resolved });
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

testFetch().catch(console.error);
