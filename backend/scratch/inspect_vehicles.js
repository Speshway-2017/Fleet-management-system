import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

dotenv.config();

async function inspectVehicles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
    const vehicles = await Vehicle.find();
    console.log(`Total Vehicles in DB: ${vehicles.length}`);
    vehicles.forEach(v => {
      console.log(`Vehicle ${v.vehicleNumber} (${v.brand} ${v.model}): status=${v.currentStatus}, assignedManager=${v.assignedManager}, createdBy=${v.createdBy}, org=${v.organization}`);
    });

    const managers = await User.find({ role: 'FLEET_MANAGER' });
    console.log("Managers:", managers.map(m => ({ id: m._id, name: m.name, email: m.email, org: m.organization })));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectVehicles();
