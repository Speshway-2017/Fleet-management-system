import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Driver from './models/Driver.js';
import Trip from './models/Trip.js';
import Fuel from './models/Fuel.js';
import Maintenance from './models/Maintenance.js';
import Document from './models/Document.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management', {
      dbName: 'fleet_management'
    });
    console.log('MongoDB Connected.');
    
    const [uCount, vCount, drCount, trCount, fCount, mCount, docCount] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments(),
      Driver.countDocuments(),
      Trip.countDocuments(),
      Fuel.countDocuments(),
      Maintenance.countDocuments(),
      Document.countDocuments()
    ]);
    
    console.log(`Counts -> Users: ${uCount}, Vehicles: ${vCount}, Drivers: ${drCount}, Trips: ${trCount}, Fuel: ${fCount}, Maintenance: ${mCount}, Documents: ${docCount}`);
    
    // Check assignments for a few vehicles
    const sampleVehicles = await Vehicle.find().limit(3);
    console.log('Sample Vehicles:', JSON.stringify(sampleVehicles, null, 2));

    const sampleDrivers = await Driver.find().limit(3);
    console.log('Sample Drivers:', JSON.stringify(sampleDrivers, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
