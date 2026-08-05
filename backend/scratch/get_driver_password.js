import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function listAllDrivers() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas...');

  const drivers = await Driver.find({}).select('+password');

  console.log('\n===================================');
  console.log(`Total Drivers: ${drivers.length}`);
  console.log('===================================');
  
  for (const d of drivers) {
    console.log(`\nName: ${d.fullName} | EmpID: ${d.employeeId}`);
    console.log(`Email: ${d.email}`);
    console.log(`Phone: ${d.phoneNumber}`);
    console.log(`Location: ${d.driverLocation || d.currentLocation || d.branch}`);
  }
  
  console.log('\n===================================\n');
  process.exit(0);
}

listAllDrivers().catch(err => {
  console.error(err);
  process.exit(1);
});
