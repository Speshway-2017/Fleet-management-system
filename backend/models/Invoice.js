import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true },
    driver: { type: mongoose.Schema.Types.ObjectId },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pdfUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);
