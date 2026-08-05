import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

dotenv.config();

async function checkDriverSupport() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
    const driver = await Driver.findOne({ email: 'bunny01@fleet.com' }).populate('assignedManager');
    console.log("Driver bunny01:", {
      id: driver?._id,
      name: driver?.fullName,
      email: driver?.email,
      assignedManager: driver?.assignedManager,
      organization: driver?.organization
    });

    if (driver?.assignedManager) {
      console.log("Assigned Manager:", driver.assignedManager);
    } else {
      // Check trips for this driver
      const trips = await Trip.find({ driver: driver?._id }).populate('assignedManager');
      console.log("Trips manager:", trips.map(t => t.assignedManager));
    }

    const allManagers = await User.find({ role: 'FLEET_MANAGER' });
    console.log("All Fleet Managers in DB:", allManagers.map(m => ({ name: m.name, phone: m.phone, email: m.email, org: m.organization })));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDriverSupport();
