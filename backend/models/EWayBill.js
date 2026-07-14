import mongoose from 'mongoose';

const eWayBillSchema = new mongoose.Schema(
  {
    ewayBillNo: { type: String, required: true, unique: true },
    invoiceNo: { type: String, required: true },
    vehicleNo: { type: String, required: true },
    transporterName: { type: String, required: true },
    fromLoc: { type: String, required: true },
    toLoc: { type: String, required: true },
    goodsValue: { type: String, required: true },
    status: { type: String, default: 'GENERATED' }, // GENERATED, EXPIRING, PENDING
    validity: { type: String },
    validityProgress: { type: Number, default: 100 },
    progressColor: { type: String, default: 'bg-green-600' },
    canExtend: { type: Boolean, default: false },
    generationDate: { type: Date, default: Date.now },
    validityDays: { type: Number, default: 1 },
    expiryDate: { type: Date },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('EWayBill', eWayBillSchema);
