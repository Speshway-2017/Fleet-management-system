import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripNumber: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, default: '' },
    driverPhone: { type: String, default: '' },
    vehicleName: { type: String, default: '' },
    vehiclePlate: { type: String, default: '' },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    departureTime: { type: String, required: true },
    eta: { type: String, required: true },
    status: { type: String, default: 'Scheduled' }, // Scheduled, On Transit, Delayed, Completed
    description: { type: String, default: '' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
