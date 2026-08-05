import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Driver from '../models/Driver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function resetPassword() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
  console.log('Connected to fleet_management...');

  const newPassword = 'Fleet@123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const driver = await Driver.findOneAndUpdate(
    { email: 'bunny02@fleet.com' },
    { 
      $set: { 
        password: hashedPassword,
        mustChangePassword: false 
      } 
    },
    { new: true }
  );

  if (driver) {
    console.log('\n===================================');
    console.log('✅ PASSWORD RESET SUCCESSFUL FOR BUNNY02');
    console.log('===================================');
    console.log(`Driver Name: ${driver.fullName}`);
    console.log(`Email: ${driver.email}`);
    console.log(`Employee ID: ${driver.employeeId}`);
    console.log(`New Password: ${newPassword}`);
    console.log('===================================\n');
  } else {
    console.log('❌ Driver bunny02@fleet.com not found!');
  }

  process.exit(0);
}

resetPassword().catch(err => {
  console.error(err);
  process.exit(1);
});
