import mongoose from 'mongoose';

const proofOfDeliverySchema = new mongoose.Schema(
  {
    podNumber: { type: String, required: true, unique: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    customerName: { type: String, required: true },
    receiverName: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    rejectionReason: { type: String, default: '' },
    deliveryDate: { type: Date, required: true },
    customerSignatureUrl: { type: String, default: '' },
    deliveryPhotoUrl: { type: String, default: '' },
    podDocumentUrl: { type: String, default: '' },
    uploadedBy: { type: String, default: 'Driver' }
  },
  { timestamps: true }
);

export default mongoose.model('ProofOfDelivery', proofOfDeliverySchema);
