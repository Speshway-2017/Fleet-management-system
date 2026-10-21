import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import schemas directly
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Document from '../models/Document.js';
import Fuel from '../models/Fuel.js';

const uploadsDir = path.join(__dirname, '../uploads');

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fleet_management' });
  console.log("Connected successfully!");

  if (!fs.existsSync(uploadsDir)) {
    console.log("Uploads directory does not exist.");
    process.exit(0);
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} files in backend/uploads directory.`);

  for (const filename of files) {
    if (filename === '.gitkeep' || filename === 'fuel_bill_receipt.png') {
      console.log(`Skipping template/control file: ${filename}`);
      continue;
    }

    const localFilePath = path.join(uploadsDir, filename);
    console.log(`\nProcessing file: ${filename}`);

    try {
      // 1. Upload to Cloudinary
      console.log(`Uploading ${filename} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'fleet_documents',
        resource_type: 'auto',
      });
      const cloudinaryUrl = result.secure_url;
      const publicId = result.public_id;
      console.log(`Cloudinary Upload Success: ${cloudinaryUrl}`);

      let dbUpdatesCount = 0;

      // 2. Update Drivers
      const driverLicenseUpdates = await Driver.updateMany(
        { licenseDocument: { $regex: filename } },
        { $set: { licenseDocument: cloudinaryUrl } }
      );
      if (driverLicenseUpdates.modifiedCount > 0) {
        console.log(`- Updated ${driverLicenseUpdates.modifiedCount} Driver license documents.`);
        dbUpdatesCount += driverLicenseUpdates.modifiedCount;
      }
      const driverProfileUpdates = await Driver.updateMany(
        { profileImage: { $regex: filename } },
        { $set: { profileImage: cloudinaryUrl } }
      );
      if (driverProfileUpdates.modifiedCount > 0) {
        console.log(`- Updated ${driverProfileUpdates.modifiedCount} Driver profile images.`);
        dbUpdatesCount += driverProfileUpdates.modifiedCount;
      }

      // 3. Update Vehicles
      const vehicles = await Vehicle.find({
        $or: [
          { 'documents.rc.fileUrl': { $regex: filename } },
          { 'documents.insurance.fileUrl': { $regex: filename } },
          { 'documents.puc.fileUrl': { $regex: filename } },
          { 'documents.fitness.fileUrl': { $regex: filename } },
          { 'documents.permit.fileUrl': { $regex: filename } },
          { 'documents.roadTax.fileUrl': { $regex: filename } },
          { image: { $regex: filename } }
        ]
      });

      for (const vehicle of vehicles) {
        let changed = false;
        if (vehicle.image && vehicle.image.includes(filename)) {
          vehicle.image = cloudinaryUrl;
          changed = true;
        }
        for (const docKey of ['rc', 'insurance', 'puc', 'fitness', 'permit', 'roadTax']) {
          if (vehicle.documents && vehicle.documents[docKey] && vehicle.documents[docKey].fileUrl && vehicle.documents[docKey].fileUrl.includes(filename)) {
            vehicle.documents[docKey].fileUrl = cloudinaryUrl;
            vehicle.markModified(`documents.${docKey}.fileUrl`);
            changed = true;
          }
        }
        if (changed) {
          await vehicle.save();
          console.log(`- Updated Vehicle documents for: ${vehicle.vehicleNumber}`);
          dbUpdatesCount++;
        }
      }

      // 4. Update Documents
      const documentUpdates = await Document.updateMany(
        { fileUrl: { $regex: filename } },
        {
          $set: {
            fileUrl: cloudinaryUrl,
            secure_url: cloudinaryUrl,
            public_id: publicId,
            originalName: filename
          }
        }
      );
      if (documentUpdates.modifiedCount > 0) {
        console.log(`- Updated ${documentUpdates.modifiedCount} Document records.`);
        dbUpdatesCount += documentUpdates.modifiedCount;
      }

      // 5. Update Fuels
      const fuelUpdates = await Fuel.updateMany(
        { billUrl: { $regex: filename } },
        { $set: { billUrl: cloudinaryUrl } }
      );
      if (fuelUpdates.modifiedCount > 0) {
        console.log(`- Updated ${fuelUpdates.modifiedCount} Fuel receipts.`);
        dbUpdatesCount += fuelUpdates.modifiedCount;
      }

      console.log(`Database updates completed for ${filename}. Total modifications: ${dbUpdatesCount}`);

      // 6. Delete local file
      fs.unlinkSync(localFilePath);
      console.log(`Deleted local file: ${localFilePath}`);

    } catch (error) {
      console.error(`❌ Failed to process ${filename}:`, error);
    }
  }

  console.log("\nMigration finished successfully!");
  await mongoose.disconnect();
};

run().catch(console.error);
