import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripNumber: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, required: false },
    driverName: { type: String, default: '' },
    driverPhone: { type: String, default: '' },
    vehicleName: { type: String, default: '' },
    vehiclePlate: { type: String, default: '' },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    departureTime: { type: String, required: true },
    eta: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Assigned', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled' },
    description: { type: String, default: '' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cargoType: { type: String, default: '' },
    cargoWeight: { type: Number, default: 0 },
    tripNotes: { type: String, default: '' },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    estimatedDistance: { type: Number, default: 0 },
    actualDistance: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
