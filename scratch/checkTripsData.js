import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: 'c:/Users/user/Downloads/Fleet-management-system/backend/.env' });

async function checkTrips() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  const Trip = mongoose.model('Trip', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Organization = mongoose.model('Organization', new mongoose.Schema({}, { strict: false }));

  const orgs = await Organization.find({}).lean();
  console.log('Organizations:', orgs.map(o => ({ id: o._id, name: o.name })));

  const managers = await User.find({ role: 'FLEET_MANAGER' }).lean();
  console.log('Managers:', managers.map(m => ({ id: m._id, name: m.name, org: m.organization })));

  const trips = await Trip.find({}).lean();
  console.log('Trips count:', trips.length);
  trips.forEach(t => {
    console.log({
      id: t._id,
      tripNumber: t.tripNumber,
      status: t.status,
      org: t.organization,
      assignedManager: t.assignedManager,
      estimatedDistance: t.estimatedDistance,
      cargoWeight: t.cargoWeight
    });
  });

  await mongoose.disconnect();
}

checkTrips().catch(console.error);
