import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getAdminDashboardData, getMonthlyGrowthStats } from '../services/admin.service.js';

dotenv.config();

async function testDashboard() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
    console.log("Connected to DB");
    
    const dashboardData = await getAdminDashboardData();
    console.log("\n--- Dashboard Data ---");
    console.log(JSON.stringify(dashboardData, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testDashboard();
