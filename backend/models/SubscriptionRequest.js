import mongoose from 'mongoose';

const subscriptionRequestSchema = new mongoose.Schema(
  {
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    requestedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SubscriptionRequest = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);

export default SubscriptionRequest;
