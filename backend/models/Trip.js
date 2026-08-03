import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripNumber: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: false },
    driverName: { type: String, default: '' },
    driverPhone: { type: String, default: '' },
    vehicleName: { type: String, default: '' },
    vehiclePlate: { type: String, default: '' },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    departureTime: { type: String, required: true },
    eta: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'Scheduled',
        'Assigned',
        'Accepted',
        'Rejected',
        'In Progress',
        'Start Trip',
        'En Route',
        'At Loading',
        'Loading',
        'In Transit',
        'On Transit',
        'Dispatched',
        'Delivered',
        'Completed',
        'Complete Trip',
        'Cancelled',
        'Delayed',
        'On Trip',
        'Ready to Dispatch'
      ],
      default: 'Assigned'
    },
    description: { type: String, default: '' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cargoType: { type: String, default: '' },
    cargoWeight: { type: Number, default: 0 },
    tripNotes: { type: String, default: '' },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    estimatedDistance: { type: Number, default: 0 },
    actualDistance: { type: Number, default: 0 },
    customerLocationReached: { type: Boolean, default: false },
    customerLocationReachedAt: { type: Date },
    podStatus: { type: String, enum: ['Not Uploaded', 'Uploaded', 'Pending', 'Approved', 'Rejected'], default: 'Not Uploaded' },
    weighbridgeStatus: { type: String, enum: ['Not Uploaded', 'Uploaded', 'Pending', 'Approved', 'Rejected'], default: 'Not Uploaded' },
    notified15MinBefore: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
