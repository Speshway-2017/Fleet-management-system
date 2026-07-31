import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import { getAvailableDrivers } from '../controllers/driver.controller.js';
import { getAvailableVehicles } from '../controllers/vehicle.controller.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
    console.log('MongoDB connected to fleet_management');

    const sampleDriver = await Driver.findOne({});
    const managerId = sampleDriver?.assignedManager;
    console.log(`Testing with actual driver manager ID: ${managerId}`);

    const reqMockDriver = {
      user: { _id: managerId },
      query: { location: 'Pune' }
    };

    const reqMockVehicle = {
      user: { _id: managerId },
      query: { location: 'Pune' }
    };

    let driverResponseData = null;
    const resMockDriver = {
      status: (code) => ({
        json: (data) => {
          driverResponseData = data;
          return data;
        }
      })
    };

    let vehicleResponseData = null;
    const resMockVehicle = {
      status: (code) => ({
        json: (data) => {
          vehicleResponseData = data;
          return data;
        }
      })
    };

    console.log('\n--- TESTING DRIVER ALLOCATION ENDPOINT FOR "Pune" ---');
    await getAvailableDrivers(reqMockDriver, resMockDriver, (err) => console.error(err));
    console.log('Driver Endpoint Payload Summary:');
    console.log(`- Drivers count returned: ${driverResponseData?.data?.drivers?.length}`);
    console.log(`- Local drivers count: ${driverResponseData?.data?.localCount}`);
    console.log(`- Is nearby fallback: ${driverResponseData?.data?.isNearbyFallback}`);
    if (driverResponseData?.data?.drivers) {
      driverResponseData.data.drivers.forEach(d => console.log(`   * ${d.fullName} (Loc: ${d.currentLocation || d.branch})`));
    }

    console.log('\n--- TESTING VEHICLE ALLOCATION ENDPOINT FOR "Pune" ---');
    await getAvailableVehicles(reqMockVehicle, resMockVehicle, (err) => console.error(err));
    console.log('Vehicle Endpoint Payload Summary:');
    console.log(`- Vehicles count returned: ${vehicleResponseData?.data?.vehicles?.length}`);
    console.log(`- Local vehicles count: ${vehicleResponseData?.data?.localCount}`);
    console.log(`- Is nearby fallback: ${vehicleResponseData?.data?.isNearbyFallback}`);
    if (vehicleResponseData?.data?.vehicles) {
      vehicleResponseData.data.vehicles.forEach(v => console.log(`   * ${v.vehicleNumber} ${v.vehicleName} (Loc: ${v.currentLocation || v.branchDepot || v.branch}, Distance: ${v.distanceKm || 0} KM)`));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
