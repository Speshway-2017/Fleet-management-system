import mongoose from 'mongoose';

const contactRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    ticketId: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['New', 'Pending', 'Resolved'],
      default: 'New',
    },
    resolvedAt: {
      type: Date,
    },
    responseNotes: {
      type: String,
      trim: true,
    },
    history: [
      {
        replier: {
          type: String,
        },
        message: {
          type: String,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);

export default ContactRequest;
