import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import { resolveLocationName, isCoordinates } from '../utils/reverseGeocoder.js';

async function cleanupCoordinates() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fleet_management');
  console.log("Connected to MongoDB for location coordinate cleanup.");

  const drivers = await Driver.find({});
  let driverCount = 0;

  for (const d of drivers) {
    let updated = false;

    if (isCoordinates(d.driverLocation) || !d.driverLocation) {
      d.driverLocation = resolveLocationName(d.driverLocation, d.branch || "Hyderabad");
      updated = true;
    }
    if (isCoordinates(d.currentLocation) || !d.currentLocation) {
      d.currentLocation = resolveLocationName(d.currentLocation, d.branch || d.driverLocation || "Hyderabad");
      updated = true;
    }
    if (isCoordinates(d.branch) || !d.branch) {
      d.branch = resolveLocationName(d.branch, d.driverLocation || "Hyderabad");
      updated = true;
    }

    if (updated) {
      await d.save();
      driverCount++;
      console.log(`Updated Driver ${d.fullName} (${d.employeeId}) location to: ${d.driverLocation}`);
    }
  }

  const vehicles = await Vehicle.find({});
  let vehicleCount = 0;

  for (const v of vehicles) {
    let updated = false;

    if (isCoordinates(v.currentLocation) || !v.currentLocation) {
      v.currentLocation = resolveLocationName(v.currentLocation, v.branch || "Pune");
      updated = true;
    }
    if (isCoordinates(v.branch) || !v.branch) {
      v.branch = resolveLocationName(v.branch, v.currentLocation || "Pune");
      updated = true;
    }

    if (updated) {
      await v.save();
      vehicleCount++;
      console.log(`Updated Vehicle ${v.vehicleNumber} location to: ${v.currentLocation}`);
    }
  }

  await mongoose.disconnect();
  console.log(`Successfully cleaned up ${driverCount} drivers and ${vehicleCount} vehicles in MongoDB.`);
}

cleanupCoordinates().catch(console.error);
