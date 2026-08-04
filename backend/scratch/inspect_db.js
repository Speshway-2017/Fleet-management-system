import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
    console.log("Connected to DB successfully (fleet_management)");
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`${c.name}: ${count} documents`);
    }

    console.log("\n--- Trip counts by status ---");
    const tripStatus = await db.collection('trips').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    console.log("Trip status counts:", tripStatus);

    console.log("\n--- Organization counts by status & plan ---");
    const orgStatus = await db.collection('organizations').aggregate([
      { $group: { _id: { status: '$status', plan: '$plan' }, count: { $sum: 1 } } }
    ]).toArray();
    console.log("Org status counts:", orgStatus);

    console.log("\n--- User counts by role & status ---");
    const userRoles = await db.collection('users').aggregate([
      { $group: { _id: { role: '$role', status: '$status', isActive: '$isActive' }, count: { $sum: 1 } } }
    ]).toArray();
    console.log("User counts:", userRoles);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

inspect();
