import mongoose from 'mongoose';

const callHistorySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    callerRole: {
      type: String,
      enum: ['Manager', 'Driver'],
      required: true
    },
    callerName: {
      type: String,
      default: ''
    },
    receiverName: {
      type: String,
      default: ''
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date
    },
    duration: {
      type: Number,
      default: 0 // Duration in seconds
    },
    status: {
      type: String,
      enum: ['completed', 'missed', 'rejected', 'busy', 'ongoing'],
      default: 'ongoing'
    }
  },
  { timestamps: true }
);

export default mongoose.model('CallHistory', callHistorySchema);
