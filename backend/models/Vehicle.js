import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true, trim: true },
    model: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: Number },
    status: { type: String, enum: ['ACTIVE', 'MAINTENANCE', 'IDLE'], default: 'ACTIVE' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
