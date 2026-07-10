import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true, trim: true },
    plateNumber: { type: String, default: '' },
    name: { type: String, default: '' },
    manufacturer: { type: String, default: '' },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    type: { type: String, default: '' },
    driver: { type: String, default: 'Unassigned' },
    status: { type: String, default: 'Available' },
    fuelLevel: { type: Number, default: 50 },
    fastagBalance: { type: Number, default: 1000 },
    insuranceExpiry: { type: String, default: '' },
    lastService: { type: String, default: '' },
    nextService: { type: String, default: '' },
    branch: { type: String, default: '' },
    fuelType: { type: String, default: 'Diesel' },
    ownership: { type: String, default: 'Owned' },
    availability: { type: String, default: 'Immediate' },
    dateAdded: { type: String, default: '' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
