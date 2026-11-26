import mongoose from 'mongoose';

const tollTransactionSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    vehiclePlate: { type: String, default: '' },
    tollPlazaName: { type: String, required: true },
    location: { type: String, required: true },
    dateTime: { type: Date, required: true },
    amountPaid: { type: Number, required: true },
    paymentMethod: { type: String, default: 'FASTag' },
    fastagTransactionId: { type: String, required: true },
    receiptStatus: { type: String, enum: ['Paid', 'Pending', 'Settled'], default: 'Paid' },
    receiptUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('TollTransaction', tollTransactionSchema);
