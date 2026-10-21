import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true },
    driver: { type: mongoose.Schema.Types.ObjectId },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pdfUrl: { type: String, default: '' },
    charges: {
      freightCharges: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      loadingCharges: { type: Number, default: 2500 },
      unloadingCharges: { type: Number, default: 2500 },
      fuelCharges: { type: Number, default: 0 },
      tollCharges: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      gstTax: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 }
    },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, default: 'Pending' }
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);
