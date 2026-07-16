import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    managerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    tripMilestone: { type: Number, required: true, enum: [10, 50, 100] },
    showPublic: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
