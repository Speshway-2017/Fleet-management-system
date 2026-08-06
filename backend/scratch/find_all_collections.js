import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function inspectDb() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
  console.log('Connected to DB: fleet_management');

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  for (const c of collections) {
    const docs = await mongoose.connection.db.collection(c.name).find({}).toArray();
    console.log(`\nCollection [${c.name}]: ${docs.length} documents`);
    docs.forEach(d => {
      if (d.email || d.fullName || d.name) {
        console.log(`  - ID: ${d._id} | Name: ${d.fullName || d.name} | Email: ${d.email} | EmpID: ${d.employeeId}`);
      }
    });
  }

  // Look up bunny02
  const bunny02 = await Driver.findOne({ email: /bunny02/i }).select('+password');
  console.log('\n===================================');
  console.log('Lookup bunny02@fleet.com:');
  console.log('===================================');
  if (bunny02) {
    console.log(`Name: ${bunny02.fullName}`);
    console.log(`Email: ${bunny02.email}`);
    console.log(`Employee ID: ${bunny02.employeeId}`);
    console.log(`Phone: ${bunny02.phoneNumber}`);
    console.log(`Password Hash: ${bunny02.password ? bunny02.password.slice(0, 20) + '...' : 'NONE'}`);
  } else {
    console.log('Driver bunny02 not found in Driver collection. Checking User collection...');
    const userBunny = await User.findOne({ email: /bunny02/i }).select('+password');
    if (userBunny) {
      console.log(`User Name: ${userBunny.fullName}`);
      console.log(`User Email: ${userBunny.email}`);
      console.log(`User Phone: ${userBunny.phone}`);
    }
  }

  process.exit(0);
}

inspectDb().catch(err => {
  console.error(err);
  process.exit(1);
});
