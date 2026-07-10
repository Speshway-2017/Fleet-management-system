import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseType: { type: String, enum: ['HMV', 'LMV', 'MCWG'], default: 'HMV' },
    licenseExpiry: { type: Date },
    assignedVehicle: { type: String, default: 'Unassigned' },
    driverStatus: {
      type: String,
      enum: ['AVAILABLE', 'ON_TRIP', 'SUSPENDED'],
      default: 'AVAILABLE',
    },
    profileImage: { type: String, default: '' },
    licenseDocument: { type: String, default: '' },
    experience: { type: String, default: '' },
    joiningDate: { type: Date },
    medicalFitnessStatus: { type: String, default: 'Fit' },
    tripsCompleted: { type: Number, default: 0 },
    incidentCount: { type: Number, default: 0 },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Driver', driverSchema);
