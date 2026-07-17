import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleId: { type: String, default: '' }, // Plate number
    vehicleName: { type: String, default: '' },
    serviceType: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    status: { type: String, default: 'Scheduled' }, // Scheduled, In Progress, Completed
    cost: { type: String, default: '' },
    specialist: { type: String, default: '' },
    garage: { type: String, default: '' },
    comments: { type: String, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Maintenance', maintenanceSchema);
