/**
 * seedDrivers.js
 * Connects to MongoDB and inserts 5 sample drivers with the correct fields.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from './models/Driver.js';

dotenv.config();

const SEED_DRIVERS = [
  {
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@fleet.com',
    phoneNumber: '+91 98765 43210',
    licenseNumber: 'DL-1420180098765',
    licenseType: 'HMV',
    licenseExpiry: new Date('2028-12-15'),
    assignedVehicle: 'Unassigned',
    driverStatus: 'AVAILABLE',
    experience: '8 Years',
    joiningDate: new Date('2024-03-10'),
    tripsCompleted: 142,
    incidentCount: 0,
    medicalFitnessStatus: 'Fit',
  },
  {
    fullName: 'Ram Kumar',
    email: 'ram.kumar@fleet.com',
    phoneNumber: '+91 87654 32109',
    licenseNumber: 'DL-1520190012345',
    licenseType: 'LMV',
    licenseExpiry: new Date('2029-06-20'),
    assignedVehicle: 'Unassigned',
    driverStatus: 'AVAILABLE',
    experience: '5 Years',
    joiningDate: new Date('2023-07-01'),
    tripsCompleted: 89,
    incidentCount: 1,
    medicalFitnessStatus: 'Fit',
  },
  {
    fullName: 'Eshwar Singh',
    email: 'eshwar.singh@fleet.com',
    phoneNumber: '+91 76543 21098',
    licenseNumber: 'DL-1220160087654',
    licenseType: 'HMV',
    licenseExpiry: new Date('2026-10-05'),
    assignedVehicle: 'Unassigned',
    driverStatus: 'AVAILABLE',
    experience: '10 Years',
    joiningDate: new Date('2022-01-15'),
    tripsCompleted: 215,
    incidentCount: 2,
    medicalFitnessStatus: 'Fit',
  },
  {
    fullName: 'Manish Patel',
    email: 'manish.patel@fleet.com',
    phoneNumber: '+91 65432 10987',
    licenseNumber: 'DL-1320170023456',
    licenseType: 'HMV',
    licenseExpiry: new Date('2026-09-15'),
    assignedVehicle: 'Unassigned',
    driverStatus: 'ON_TRIP',
    experience: '7 Years',
    joiningDate: new Date('2023-02-20'),
    tripsCompleted: 173,
    incidentCount: 0,
    medicalFitnessStatus: 'Fit',
  },
  {
    fullName: 'Ramana K',
    email: 'ramana.k@fleet.com',
    phoneNumber: '+91 54321 09876',
    licenseNumber: 'DL-1120150034567',
    licenseType: 'HMV',
    licenseExpiry: new Date('2026-08-25'),
    assignedVehicle: 'Unassigned',
    driverStatus: 'SUSPENDED',
    experience: '12 Years',
    joiningDate: new Date('2021-06-10'),
    tripsCompleted: 310,
    incidentCount: 3,
    medicalFitnessStatus: 'Overdue',
  },
];

async function seed() {
  try {
    const MONGO_URI = process.env.MONGODB_URI;
    if (!MONGO_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(MONGO_URI, { dbName: 'fleet_management' });
    console.log('✅ Connected to MongoDB');

    const existingCount = await Driver.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️ Skipping seed — ${existingCount} driver(s) already exist.`);
      await mongoose.disconnect();
      return;
    }

    const inserted = await Driver.insertMany(SEED_DRIVERS);
    console.log(`🌱 Seeded ${inserted.length} drivers successfully!`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();
