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
  vehicleNumber: {
    type: String,
    default: '',
  },
  vehicleName: {
    type: String,
    default: '',
  },
  activityType: {
    type: String,
    required: true,
  },
  relatedModule: {
    type: String,
    enum: ['Vehicle', 'Trip', 'Driver', 'Maintenance', 'Fuel', 'Document'],
    default: 'Vehicle',
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  user: {
    type: String,
    default: 'Manager',
  },
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
