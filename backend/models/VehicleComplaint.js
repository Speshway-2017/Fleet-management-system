import mongoose from 'mongoose';

const vehicleComplaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehiclePlate: { type: String, default: '' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, default: '' },
    issueType: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    completionDate: { type: Date },
    reportedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('VehicleComplaint', vehicleComplaintSchema);
