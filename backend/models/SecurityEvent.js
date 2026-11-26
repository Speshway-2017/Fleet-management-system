import mongoose from 'mongoose';

export const SECURITY_CATEGORIES = [
  'BRUTE_FORCE',
  'ACCOUNT_LOCKOUT',
  'AUTH_FAILURE',
  'NOSQL_INJECTION',
  'XSS_ATTEMPT',
  'COMMAND_INJECTION',
  'PATH_TRAVERSAL',
  'MALICIOUS_UPLOAD',
  'CSRF_VIOLATION',
  'CORS_VIOLATION',
  'CSP_VIOLATION',
  'RATE_LIMIT',
  'PRIVILEGE_ESCALATION',
  'UNUSUAL_API_ACTIVITY',
];

const securityEventSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: SECURITY_CATEGORIES,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Blocked', 'Allowed', 'Monitored'],
      required: true,
      default: 'Blocked',
      index: true,
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    method: {
      type: String,
      default: 'GET',
    },
    path: {
      type: String,
      default: '/',
    },
    actor: {
      type: String,
      default: 'Anonymous',
    },
    userAgent: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

securityEventSchema.index({ createdAt: -1 });
securityEventSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model('SecurityEvent', securityEventSchema);

