import mongoose from 'mongoose';

const fuelSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: false },
    vehicleId: { type: String, default: '' }, // Plate number
    vehicleName: { type: String, default: '' },
    driver: { type: String, default: '' },
    driverId: { type: String, default: '' },
    tripId: { type: String, default: '' },
    odometer: { type: Number, default: 0 },
    billUrl: { type: String, default: '' },
    receiptImage: { type: String, default: '' },
    billStatus: { type: String, enum: ['Uploaded', 'Pending', 'Final Validation', 'Approved', 'Rejected'], default: 'Pending' },
    approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: String, default: '' },
    approvedAt: { type: Date },
    rejectedBy: { type: String, default: '' },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
    fuelStation: { type: String, default: '' },
    amount: { type: Number, required: true },
    liters: { type: Number, required: true },
    status: { type: String, enum: ['normal', 'anomaly', 'resolved'], default: 'normal' },
    resolutionComment: { type: String, default: '' },
    hasReceipt: { type: Boolean, default: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fuelType: { type: String, default: 'Diesel' },
    dateTime: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Fuel', fuelSchema);
