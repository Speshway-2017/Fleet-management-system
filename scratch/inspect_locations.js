import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet-management');
    console.log('MongoDB connected');

    const drivers = await Driver.find({});
    console.log(`\nTOTAL DRIVERS IN DB: ${drivers.length}`);
    drivers.forEach(d => {
      console.log(`- Name: ${d.fullName}, EmpID: ${d.employeeId}, Status: ${d.driverStatus}, currentLocation: "${d.currentLocation}", driverLocation: "${d.driverLocation}", branch: "${d.branch}"`);
    });

    const vehicles = await Vehicle.find({});
    console.log(`\nTOTAL VEHICLES IN DB: ${vehicles.length}`);
    vehicles.forEach(v => {
      console.log(`- Reg: ${v.vehicleNumber}, Name: ${v.vehicleName}, Status: ${v.currentStatus}, currentLocation: "${v.currentLocation}", branch: "${v.branch}", branchDepot: "${v.branchDepot}"`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
