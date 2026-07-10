import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseType: { type: String },
    licenseExpiry: { type: String },
    assignedVehicle: { type: String, default: 'Unassigned' },
    status: { type: String, default: 'Available' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Driver', driverSchema);
