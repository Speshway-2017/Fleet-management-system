import mongoose from 'mongoose';
import { connectDB } from '../config/db.config.js';
import { hashPassword } from '../utils/hashPassword.js';
import User from '../models/User.js';

async function updateCredentials() {
  await connectDB();

  // 1. Admin -> newadmin@fleet.com / Admin@123
  const adminHashed = await hashPassword('Admin@123');
  const admin = await User.findOneAndUpdate(
    { email: 'newadmin@fleet.com' },
    {
      name: 'Admin',
      email: 'newadmin@fleet.com',
      password: adminHashed,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log('✓ Admin credentials updated successfully:', admin.email, admin.role);

  // 2. Manager -> sai@fleet.com / manager123
  const managerHashed = await hashPassword('manager123');
  const manager = await User.findOneAndUpdate(
    { email: 'sai@fleet.com' },
    {
      name: 'Sai',
      email: 'sai@fleet.com',
      password: managerHashed,
      role: 'FLEET_MANAGER',
      isActive: true,
      subscriptionStatus: 'ACTIVE',
    },
    { upsert: true, new: true }
  );
  console.log('✓ Manager credentials updated successfully:', manager.email, manager.role);

  process.exit(0);
}

updateCredentials().catch((err) => {
  console.error('Failed to update credentials:', err);
  process.exit(1);
});
