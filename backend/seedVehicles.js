/**
 * seedVehicles.js
 * Connects to MongoDB, retrieves seeded drivers, and inserts 8 mock vehicles.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from './models/Vehicle.js';
import Driver from './models/Driver.js';

dotenv.config();

const MOCK_VEHICLES = [
  {
    vehicleName: "Ashok Leyland 3118",
    brand: "Ashok Leyland",
    model: "3118",
    vehicleNumber: "MH 12 AB 5678",
    vehicleType: "Truck",
    driverName: "Rajesh Kumar",
    currentStatus: "On Trip",
    fuelCapacity: 350,
    fastagBalance: 12450,
    insuranceExpiry: new Date("2027-10-12"),
    rcExpiry: new Date("2031-01-15"),
    pollutionExpiry: new Date("2026-10-15"),
    permitExpiry: new Date("2027-01-15"),
    fitnessExpiry: new Date("2027-04-15"),
    odometer: 45200,
    fuelType: "Diesel",
  },
  {
    vehicleName: "Tata Ace Gold",
    brand: "Tata",
    model: "Ace Gold",
    vehicleNumber: "KA 02 AB 1456",
    vehicleType: "Van",
    driverName: "Ram Kumar",
    currentStatus: "Available",
    fuelCapacity: 60,
    fastagBalance: 5320,
    insuranceExpiry: new Date("2027-08-15"),
    rcExpiry: new Date("2032-02-10"),
    pollutionExpiry: new Date("2026-08-10"),
    permitExpiry: new Date("2027-02-10"),
    fitnessExpiry: new Date("2027-05-10"),
    odometer: 18500,
    fuelType: "CNG",
  },
  {
    vehicleName: "Bharat Benz 211",
    brand: "Bharat Benz",
    model: "211",
    vehicleNumber: "AP 39 EP 9465",
    vehicleType: "Truck",
    driverName: "Eshwar Singh",
    currentStatus: "Inactive", // maps to Idle
    fuelCapacity: 280,
    fastagBalance: 1222,
    insuranceExpiry: new Date("2026-11-05"),
    rcExpiry: new Date("2031-01-20"),
    pollutionExpiry: new Date("2026-07-20"),
    permitExpiry: new Date("2026-11-20"),
    fitnessExpiry: new Date("2027-01-20"),
    odometer: 74200,
    fuelType: "Diesel",
  },
  {
    vehicleName: "Mahindra Bolero XL",
    brand: "Mahindra",
    model: "Bolero XL",
    vehicleNumber: "TN 07 EQ 2312",
    vehicleType: "Truck",
    driverName: "Manish Patel",
    currentStatus: "On Trip",
    fuelCapacity: 80,
    fastagBalance: 450,
    insuranceExpiry: new Date("2026-07-15"),
    rcExpiry: new Date("2031-03-01"),
    pollutionExpiry: new Date("2026-09-01"),
    permitExpiry: new Date("2026-12-01"),
    fitnessExpiry: new Date("2027-03-01"),
    odometer: 32800,
    fuelType: "Diesel",
  },
  {
    vehicleName: "Scania Model X",
    brand: "Scania",
    model: "Model X",
    vehicleNumber: "MH 12 AB 5679",
    vehicleType: "Truck",
    driverName: "Ramana K",
    currentStatus: "Maintenance",
    fuelCapacity: 400,
    fastagBalance: 320,
    insuranceExpiry: new Date("2026-01-12"),
    rcExpiry: new Date("2031-01-05"),
    pollutionExpiry: new Date("2026-07-05"),
    permitExpiry: new Date("2026-11-05"),
    fitnessExpiry: new Date("2027-01-05"),
    odometer: 112000,
    fuelType: "Diesel",
  },
  {
    vehicleName: "Eicher Pro 2049",
    brand: "Eicher",
    model: "Pro 2049",
    vehicleNumber: "DL 03 EC 9876",
    vehicleType: "Tipper",
    driverName: "Vijay Kumar",
    currentStatus: "Available",
    fuelCapacity: 120,
    fastagBalance: 6780,
    insuranceExpiry: new Date("2027-02-18"),
    rcExpiry: new Date("2032-04-10"),
    pollutionExpiry: new Date("2026-10-10"),
    permitExpiry: new Date("2027-04-10"),
    fitnessExpiry: new Date("2027-07-10"),
    odometer: 9800,
    fuelType: "Electric",
  },
  {
    vehicleName: "Force Traveller",
    brand: "Force",
    model: "Traveller",
    vehicleNumber: "MH 14 EU 1122",
    vehicleType: "Bus",
    driverName: "Sanjay Singh",
    currentStatus: "Inactive", // maps to Out of Service
    fuelCapacity: 90,
    fastagBalance: 120,
    insuranceExpiry: new Date("2026-05-20"),
    rcExpiry: new Date("2031-01-12"),
    pollutionExpiry: new Date("2026-07-12"),
    permitExpiry: new Date("2026-10-12"),
    fitnessExpiry: new Date("2027-01-12"),
    odometer: 54300,
    fuelType: "Diesel",
  },
  {
    vehicleName: "Tata Signa 4825",
    brand: "Tata",
    model: "Signa 4825",
    vehicleNumber: "GJ 01 ZY 8899",
    vehicleType: "Trailer",
    driverName: "Unassigned",
    currentStatus: "Inactive", // maps to Idle
    fuelCapacity: 450,
    fastagBalance: 14500,
    insuranceExpiry: new Date("2027-05-20"),
    rcExpiry: new Date("2031-02-22"),
    pollutionExpiry: new Date("2026-08-22"),
    permitExpiry: new Date("2026-12-22"),
    fitnessExpiry: new Date("2027-02-22"),
    odometer: 98600,
    fuelType: "Diesel",
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

    const existingCount = await Vehicle.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️ Skipping seed — ${existingCount} vehicle(s) already exist.`);
      await mongoose.disconnect();
      return;
    }

    // Fetch drivers to link them
    const drivers = await Driver.find({});
    console.log(`Found ${drivers.length} drivers for association.`);

    const vehiclesToInsert = MOCK_VEHICLES.map((v) => {
      // Find driver by name
      const matchingDriver = drivers.find(
        (d) => d.fullName.toLowerCase() === v.driverName.toLowerCase() ||
               (v.driverName === 'Ramana K' && d.fullName.startsWith('Ramana'))
      );
      
      const { driverName, ...vehicleData } = v;
      return {
        ...vehicleData,
        assignedDriver: matchingDriver ? matchingDriver._id : undefined,
      };
    });

    const inserted = await Vehicle.insertMany(vehiclesToInsert);
    console.log(`🌱 Seeded ${inserted.length} vehicles successfully!`);

    // For seeded vehicles with drivers, we should also update the driver's assignedVehicle field in DB!
    for (const veh of inserted) {
      if (veh.assignedDriver) {
        await Driver.findByIdAndUpdate(veh.assignedDriver, {
          assignedVehicle: veh.vehicleNumber,
          driverStatus: veh.currentStatus === 'On Trip' ? 'ON_TRIP' : 'AVAILABLE'
        });
      }
    }
    console.log('🔗 Linked drivers and vehicles successfully.');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();
