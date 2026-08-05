import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getAdminDashboardData } from '../services/admin.service.js';

dotenv.config();

async function testFinal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
    console.log("Connected to MongoDB Atlas");
    
    const dashboard = await getAdminDashboardData();
    console.log("Dashboard Statistics:", dashboard.statistics);
    console.log("Revenue Chart Data Points:", dashboard.chartData.length);

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testFinal();
