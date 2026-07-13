import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String, // Storing email or name for simplicity
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    default: '—',
  },
  ipAddress: {
    type: String,
    default: 'Unknown',
  },
  status: {
    type: String,
    enum: ['Success', 'Warning', 'Failed'],
    required: true,
    default: 'Success',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
