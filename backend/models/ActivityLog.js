import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  activityType: {
    type: String,
    enum: [
      'VEHICLE_ADDED',
      'VEHICLE_UPDATED',
      'VEHICLE_DELETED',
      'DRIVER_ASSIGNED',
      'MAINTENANCE_COMPLETED',
      'FUEL_ENTRY_ADDED',
      'DOCUMENT_UPLOADED',
      'TRIP_DISPATCHED',
      'TRIP_COMPLETED'
    ],
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
