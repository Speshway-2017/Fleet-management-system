import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'FLEET_MANAGER'],
      required: true,
    },
    phone: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    jobTitle: { type: String, default: 'Fleet Manager' },
    primaryHub: { type: String, default: '' },
    officeName: { type: String, default: '' },
    dispatchName: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    dispatchPhone: { type: String, default: '' },
    dispatchEmail: { type: String, default: '' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    isActive: { type: Boolean, default: true },
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },
    resetPasswordAttempts: { type: Number, default: 0 },
    resetPasswordLastSent: { type: Date },
    subscriptionStatus: { type: String, enum: ['INACTIVE', 'ACTIVE', 'EXPIRED'], default: 'INACTIVE' },
    subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', default: null },
    subscriptionExpiry: { type: Date, default: null },
    subscriptionRequestedPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', default: null },
    fcmToken: { type: String, default: '' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
