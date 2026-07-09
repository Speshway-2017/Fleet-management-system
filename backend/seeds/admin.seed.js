import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { hashPassword } from '../utils/hashPassword.js';

// Load env variables
dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management');
    console.log('MongoDB Connected for seeding...');

    // Seed Super Admin
    const adminExists = await User.findOne({ email: 'admin@fleet.com' });
    if (adminExists) {
      console.log('✅ Super Admin user already exists (admin@fleet.com)');
    } else {
      const hashedPassword = await hashPassword('Admin@123');
      const admin = new User({
        name: 'Super Admin',
        email: 'admin@fleet.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        phone: '1234567890',
        organization: 'Fleet HQ'
      });
      await admin.save();
      console.log('✅ Super Admin user created successfully (admin@fleet.com / Admin@123)');
    }

    // Seed Fleet Manager
    const managerExists = await User.findOne({ email: 'manager@fleet.com' });
    if (managerExists) {
      console.log('✅ Fleet Manager user already exists (manager@fleet.com)');
    } else {
      const hashedPassword = await hashPassword('Manager@123');
      const manager = new User({
        name: 'Fleet Manager',
        email: 'manager@fleet.com',
        password: hashedPassword,
        role: 'FLEET_MANAGER',
        phone: '0987654321',
        organization: 'Branch A'
      });
      await manager.save();
      console.log('✅ Fleet Manager user created successfully (manager@fleet.com / Manager@123)');
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedAdmin();
