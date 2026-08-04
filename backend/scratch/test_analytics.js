import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import PlatformIssue from '../models/PlatformIssue.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import Fuel from '../models/Fuel.js';
import Maintenance from '../models/Maintenance.js';
import { getMonthlyGrowthStats } from '../services/admin.service.js';

dotenv.config();

async function testAnalytics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
    console.log("Connected to DB");

    const filters = ['today', 'week', 'month', 'year'];

    for (const filter of filters) {
      console.log(`\n=================== FILTER: ${filter} ===================`);
      
      let startDate = null;
      const now = new Date();
      if (filter === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (filter === 'week') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (filter === 'month') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (filter === 'year') {
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const dateQuery = startDate ? { createdAt: { $gte: startDate } } : {};

      const [
        totalOrgs,
        activeOrgs,
        suspendedOrgs,
        totalManagers,
        activeManagers,
        inactiveManagers,
        totalIssues,
        openIssues,
        closedIssues,
        vehicles,
        drivers,
        activeTrips,
        completedTrips,
        fuelDocs,
        maintenanceCount
      ] = await Promise.all([
        Organization.countDocuments(),
        Organization.countDocuments({ status: 'Active' }),
        Organization.countDocuments({ status: 'Suspended' }),
        User.countDocuments({ role: 'FLEET_MANAGER' }),
        User.countDocuments({ role: 'FLEET_MANAGER', status: 'Active' }),
        User.countDocuments({ role: 'FLEET_MANAGER', status: 'Inactive' }),
        PlatformIssue.countDocuments(),
        PlatformIssue.countDocuments({ status: 'Open' }),
        PlatformIssue.countDocuments({ status: 'Resolved' }),
        Vehicle.countDocuments(),
        Driver.countDocuments(),
        Trip.countDocuments({ status: { $in: ['Scheduled', 'Assigned', 'In Progress', 'Accepted', 'On Transit'] }, ...dateQuery }),
        Trip.countDocuments({ status: 'Completed', ...dateQuery }),
        Fuel.aggregate([
          ...(startDate ? [{ $match: { createdAt: { $gte: startDate } } }] : []),
          { $group: { _id: null, totalFuel: { $sum: '$quantity' } } }
        ]),
        Maintenance.countDocuments(dateQuery)
      ]);

      const fuelUsage = fuelDocs.length > 0 ? fuelDocs[0].totalFuel : 0;
      console.log(`KPIs -> Orgs: ${totalOrgs}, ActiveOrgs: ${activeOrgs}, Managers: ${totalManagers}, ActiveTrips: ${activeTrips}, CompletedTrips: ${completedTrips}, Vehicles: ${vehicles}, Drivers: ${drivers}, Fuel: ${fuelUsage}`);
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testAnalytics();
