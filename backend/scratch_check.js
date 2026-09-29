import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkTrips() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  const Trip = mongoose.model('Trip', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Organization = mongoose.model('Organization', new mongoose.Schema({}, { strict: false }));

  const orgs = await Organization.find({}).lean();
  console.log('Organizations:', orgs.map(o => ({ id: o._id.toString(), name: o.name })));

  const managers = await User.find({ role: 'FLEET_MANAGER' }).lean();
  console.log('Managers:', managers.map(m => ({ id: m._id.toString(), name: m.name, org: m.organization?.toString() })));

  const trips = await Trip.find({}).lean();
  console.log('Trips count:', trips.length);
  trips.forEach(t => {
    console.log({
      id: t._id.toString(),
      tripNumber: t.tripNumber,
      status: t.status,
      org: t.organization?.toString(),
      assignedManager: t.assignedManager?.toString(),
      estimatedDistance: t.estimatedDistance,
      cargoWeight: t.cargoWeight
    });
  });

  await mongoose.disconnect();
}

checkTrips().catch(console.error);
