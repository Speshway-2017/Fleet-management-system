import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import Analytics from '../models/Analytics.js';
import { hashPassword } from '../utils/hashPassword.js';

// Load env variables
dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management');
    console.log('MongoDB Connected for seeding...');

    // Clear existing data for fresh seeding
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Trip.deleteMany({}),
      Notification.deleteMany({}),
      Analytics.deleteMany({})
    ]);
    console.log('Cleared existing collections for fresh seeding.');

    // 1. Seed Organizations
    const fleetHqOrg = new Organization({
      name: 'Fleet HQ',
      industry: 'Logistics',
      email: 'hq@fleet.com',
      phone: '1234567890',
      address: '123 Logistics Way',
      city: 'Metropolis',
      state: 'NY',
      country: 'USA',
      plan: 'Enterprise',
      status: 'Active'
    });
    await fleetHqOrg.save();

    const branchAOrg = new Organization({
      name: 'Branch A',
      industry: 'Transportation',
      email: 'brancha@fleet.com',
      phone: '0987654321',
      address: '456 Delivery Rd',
      city: 'Gotham',
      state: 'NJ',
      country: 'USA',
      plan: 'Standard',
      status: 'Active'
    });
    await branchAOrg.save();
    console.log('✅ Organizations seeded successfully.');

    // 2. Seed Users
    const hashedSuperAdminPassword = await hashPassword('Admin@123');
    const hashedAltAdminPassword = await hashPassword('admin 123');
    const hashedManagerPassword = await hashPassword('Manager@123');

    // Super Admin (admin@fleet.com / Admin@123)
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@fleet.com',
      password: hashedSuperAdminPassword,
      role: 'SUPER_ADMIN',
      phone: '1234567890',
      organization: fleetHqOrg._id,
      isActive: true
    });
    await superAdmin.save();

    // Alternate Admin (admin@123 / admin 123)
    const altAdmin = new User({
      name: 'Alternate Admin',
      email: 'admin@123',
      password: hashedAltAdminPassword,
      role: 'SUPER_ADMIN',
      phone: '1234567899',
      organization: fleetHqOrg._id,
      isActive: true
    });
    await altAdmin.save();

    // Alternate Admin password option 2 (admin@123.com / admin@123)
    const altAdmin2 = new User({
      name: 'Admin Local',
      email: 'admin@123.com',
      password: await hashPassword('admin@123'),
      role: 'SUPER_ADMIN',
      phone: '1234567898',
      organization: fleetHqOrg._id,
      isActive: true
    });
    await altAdmin2.save();

    // Fleet Manager
    const manager = new User({
      name: 'Fleet Manager',
      email: 'manager@fleet.com',
      password: hashedManagerPassword,
      role: 'FLEET_MANAGER',
      phone: '0987654321',
      organization: branchAOrg._id,
      isActive: true
    });
    await manager.save();
    console.log('✅ Users seeded successfully.');

    // 3. Seed Vehicles
    const vehiclesData = [
      { vehicleNumber: 'NY-1234', model: 'Model 3', brand: 'Tesla', year: 2023, status: 'ACTIVE', assignedManager: manager._id },
      { vehicleNumber: 'CA-5678', model: 'F-150', brand: 'Ford', year: 2022, status: 'ACTIVE', assignedManager: manager._id },
      { vehicleNumber: 'TX-9012', model: 'Sprinter', brand: 'Mercedes', year: 2021, status: 'MAINTENANCE', assignedManager: manager._id },
      { vehicleNumber: 'FL-3456', model: 'E-Transit', brand: 'Ford', year: 2023, status: 'IDLE', assignedManager: manager._id }
    ];
    const seededVehicles = await Vehicle.insertMany(vehiclesData);
    console.log('✅ Vehicles seeded successfully.');

    // 4. Seed Drivers
    const driversData = [
      { name: 'John Doe', email: 'john@fleet.com', phone: '1112223333', licenseNumber: 'DL123456', status: 'ACTIVE', assignedManager: manager._id },
      { name: 'Jane Smith', email: 'jane@fleet.com', phone: '4445556666', licenseNumber: 'DL789012', status: 'ON_TRIP', assignedManager: manager._id },
      { name: 'Bob Johnson', email: 'bob@fleet.com', phone: '7778889999', licenseNumber: 'DL345678', status: 'ACTIVE', assignedManager: manager._id }
    ];
    const seededDrivers = await Driver.insertMany(driversData);
    console.log('✅ Drivers seeded successfully.');

    // 5. Seed Trips
    const tripsData = [
      { tripNumber: 'TRIP-001', vehicle: seededVehicles[0]._id, driver: seededDrivers[0]._id, status: 'COMPLETED', assignedManager: manager._id },
      { tripNumber: 'TRIP-002', vehicle: seededVehicles[1]._id, driver: seededDrivers[1]._id, status: 'IN_PROGRESS', assignedManager: manager._id },
      { tripNumber: 'TRIP-003', vehicle: seededVehicles[2]._id, driver: seededDrivers[2]._id, status: 'PENDING', assignedManager: manager._id }
    ];
    await Trip.insertMany(tripsData);
    console.log('✅ Trips seeded successfully.');

    // 6. Seed Notifications
    const notificationsData = [
      { recipient: superAdmin._id, message: 'Welcome to Fleet Management System!' },
      { recipient: manager._id, message: 'New vehicle CA-5678 assigned to you.' },
      { recipient: manager._id, message: 'Maintenance due for vehicle TX-9012.' }
    ];
    await Notification.insertMany(notificationsData);
    console.log('✅ Notifications seeded successfully.');

    // 7. Seed Analytics (for Revenue chart and sums)
    const now = new Date();
    const analyticsData = [];
    
    // We will generate data for the past 6 months
    for (let i = 0; i < 6; i++) {
      const recordedDate = new Date(now.getFullYear(), now.getMonth() - i, 15);
      
      analyticsData.push(
        {
          metric: 'Revenue',
          value: 12000 + Math.floor(Math.random() * 5000),
          recordedBy: superAdmin._id,
          createdAt: recordedDate,
          updatedAt: recordedDate
        },
        {
          metric: 'FuelCost',
          value: 3000 + Math.floor(Math.random() * 1000),
          recordedBy: superAdmin._id,
          createdAt: recordedDate,
          updatedAt: recordedDate
        },
        {
          metric: 'MaintenanceCost',
          value: 1500 + Math.floor(Math.random() * 800),
          recordedBy: superAdmin._id,
          createdAt: recordedDate,
          updatedAt: recordedDate
        }
      );
    }
    
    await Analytics.insertMany(analyticsData);
    console.log('✅ Analytics seeded successfully.');

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedAdmin();
