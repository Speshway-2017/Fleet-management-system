import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';

const run = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { dbName: 'test' });
    const admin = new mongoose.mongo.Admin(conn.connection.db);
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(d => d.name));

    for (const dbInfo of dbs.databases) {
      if (['admin', 'local'].includes(dbInfo.name)) continue;
      const db = conn.connection.useDb(dbInfo.name);
      const Drv = db.model('Driver', Driver.schema);
      const Veh = db.model('Vehicle', Vehicle.schema);
      const countD = await Drv.countDocuments({});
      const countV = await Veh.countDocuments({});
      console.log(`DB "${dbInfo.name}": ${countD} drivers, ${countV} vehicles`);
      if (countD > 0) {
        const drivers = await Drv.find({});
        drivers.forEach(d => {
          console.log(`  Driver -> Name: "${d.fullName}", EmpID: "${d.employeeId}", Status: "${d.driverStatus}", currentLocation: "${d.currentLocation}", driverLocation: "${d.driverLocation}", branch: "${d.branch}"`);
        });
      }
      if (countV > 0) {
        const vehicles = await Veh.find({});
        vehicles.forEach(v => {
          console.log(`  Vehicle -> Reg: "${v.vehicleNumber}", Name: "${v.vehicleName}", Status: "${v.currentStatus}", currentLocation: "${v.currentLocation}", branch: "${v.branch}", branchDepot: "${v.branchDepot}"`);
        });
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
