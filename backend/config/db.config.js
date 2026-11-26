import mongoose from 'mongoose';
import dns from 'dns';

// Set reliable public DNS servers to resolve MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if unsupported
}

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'fleet_management',
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('Initial SRV connection attempt failed, trying direct cluster connection...', error.message);
    try {
      // Dynamically extract user:password from process.env.MONGODB_URI if present
      let userPass = 'fleet:fleet123';
      const match = process.env.MONGODB_URI.match(/mongodb(?:\+srv)?:\/\/([^@]+)@/);
      if (match && match[1]) {
        userPass = match[1];
      }
      const directUri = `mongodb://${userPass}@ac-zihlped-shard-00-00.wtcv25p.mongodb.net:27017,ac-zihlped-shard-00-01.wtcv25p.mongodb.net:27017,ac-zihlped-shard-00-02.wtcv25p.mongodb.net:27017/?ssl=true&replicaSet=atlas-zihlped-shard-0&authSource=admin&retryWrites=true&w=majority`;
      await mongoose.connect(directUri, {
        dbName: 'fleet_management',
      });
      console.log('MongoDB connected successfully via direct connection');
    } catch (fallbackError) {
      console.error('MongoDB connection failed:', fallbackError.message);
      process.exit(1);
    }
  }
};
