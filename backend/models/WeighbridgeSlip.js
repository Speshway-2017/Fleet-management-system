import mongoose from 'mongoose';

const weighbridgeSlipSchema = new mongoose.Schema(
  {
    slipNumber: { type: String, required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    grossWeight: { type: Number, required: true },
    tareWeight: { type: Number, required: true },
    netWeight: { type: Number, required: true },
    location: { type: String, required: true },
    uploadedBy: { type: String, default: 'Driver' },
    status: {
      type: String,
      enum: ['Uploaded', 'Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    rejectionReason: { type: String, default: '' },
    documentUrl: { type: String, required: false }
  },
  { timestamps: true }
);

export default mongoose.model('WeighbridgeSlip', weighbridgeSlipSchema);
