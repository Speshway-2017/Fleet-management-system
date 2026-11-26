import mongoose from 'mongoose';

const tripChatSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    senderRole: {
      type: String,
      enum: ['Manager', 'Driver', 'System'],
      required: true
    },
    senderName: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    messageType: {
      type: String,
      enum: ['text', 'system', 'call_log'],
      default: 'text'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    },
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    }
  },
  { timestamps: true }
);

export default mongoose.model('TripChat', tripChatSchema);
