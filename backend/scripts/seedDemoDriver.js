import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.config.js';
import { seedDemoDriver } from '../utils/seedDemoDriver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await connectDB();
  const result = await seedDemoDriver();
  console.log('Seed demo driver result:', result);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Demo driver seed failed:', err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});

