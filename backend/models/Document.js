import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, default: 'Vehicle Docs' },
    vehicle: { type: String, default: '' },
    driver: { type: String, default: '' },
    trip: { type: String, default: '' },
    expiry: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Expiring Soon', 'Expired'], default: 'Active' },
    fileSize: { type: String, default: '1.0 MB' },
    fileType: { type: String, default: 'PDF' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    public_id: { type: String, default: '' },
    secure_url: { type: String, default: '' },
    originalName: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
