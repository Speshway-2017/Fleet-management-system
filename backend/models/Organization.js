import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: '' },
    industry: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    plan: {
      type: String,
      enum: ['Enterprise', 'Professional', 'Standard', ''],
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Suspended', ''],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
