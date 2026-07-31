import mongoose from 'mongoose';
import Driver from '../models/Driver.js';

async function inspectDrivers() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fleet_management');
  const drivers = await Driver.find({ isDeleted: { $ne: true } });
  console.log("=== ALL DRIVERS IN DATABASE ===");
  for (const d of drivers) {
    console.log(`ID: ${d._id} | Name: "${d.fullName}" | EmpID: ${d.employeeId} | Status: "${d.driverStatus}" / "${d.status}" | currentLocation: "${d.currentLocation}" | driverLocation: "${d.driverLocation}" | branch: "${d.branch}" | Manager: ${d.assignedManager}`);
  }
  await mongoose.disconnect();
}

inspectDrivers().catch(console.error);
