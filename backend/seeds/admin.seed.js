import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { hashPassword } from '../utils/hashPassword.js';

// Load env variables
dotenv.config();

export const seedDefaultUsers = async () => {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management', {
        dbName: 'fleet_management',
      });
      console.log('MongoDB Connected for seeding...');
    }

    // Seed Super Admin
    const adminExists = await User.findOne({ email: 'admin@fleet.com' });
    const hashedAdminPassword = await hashPassword('Admin@123');
    if (adminExists) {
      console.log('✅ Super Admin user already exists (admin@fleet.com). Enforcing default password and active status...');
      adminExists.password = hashedAdminPassword;
      adminExists.isActive = true;
      await adminExists.save();
    } else {
      const admin = new User({
        name: 'Super Admin',
        email: 'admin@fleet.com',
        password: hashedAdminPassword,
        role: 'SUPER_ADMIN',
        phone: '1234567890'
      });
      await admin.save();
      console.log('✅ Super Admin user created successfully (admin@fleet.com / Admin@123)');
    }

    // Seed Fleet Manager
    const managerExists = await User.findOne({ email: 'manager@fleet.com' });
    const hashedManagerPassword = await hashPassword('Manager@123');
    if (managerExists) {
      console.log('✅ Fleet Manager user already exists (manager@fleet.com). Enforcing default password and active status...');
      managerExists.password = hashedManagerPassword;
      managerExists.isActive = true;
      await managerExists.save();
    } else {
      const manager = new User({
        name: 'Fleet Manager',
        email: 'manager@fleet.com',
        password: hashedManagerPassword,
        role: 'FLEET_MANAGER',
        phone: '0987654321'
      });
      await manager.save();
      console.log('✅ Fleet Manager user created successfully (manager@fleet.com / Manager@123)');
    }

    console.log('Seeding verification completed.');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

// If run directly via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDefaultUsers().then(() => process.exit(0));
}
