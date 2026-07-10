import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g. Operational, Financial, Compliance, Safety
    frequency: { type: String, default: 'Weekly' },
    day: { type: String, default: 'Monday' },
    time: { type: String, default: '09:00' },
    format: { type: String, default: 'PDF' },
    recipients: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Paused'], default: 'Active' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
