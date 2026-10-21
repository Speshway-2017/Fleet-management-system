import mongoose from 'mongoose';

const platformIssueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Open', 'Resolved', 'Reopened'],
      default: 'Open'
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const PlatformIssue = mongoose.model('PlatformIssue', platformIssueSchema);

export default PlatformIssue;
