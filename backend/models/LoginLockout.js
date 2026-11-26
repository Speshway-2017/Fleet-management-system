import mongoose from 'mongoose';

const loginLockoutSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    identifier: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    firstAttemptAt: {
      type: Date,
      default: Date.now,
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('LoginLockout', loginLockoutSchema);

