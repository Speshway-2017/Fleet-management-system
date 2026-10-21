import mongoose from 'mongoose';

const fastagTransactionSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    previousBalance: { type: Number, required: true },
    amountDeducted: { type: Number, required: true },
    updatedBalance: { type: Number, required: true },
    dateTime: { type: Date, default: Date.now },
    status: { type: String, enum: ['Success', 'Failed'], required: true }
  },
  { timestamps: true }
);

export default mongoose.model('FastagTransaction', fastagTransactionSchema);
