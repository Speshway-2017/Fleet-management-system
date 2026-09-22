import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [20, 'Organization name must not exceed 20 characters'],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'Organization name must contain alphabets only.'
      }
    },
    logoUrl: { type: String, default: '' },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      maxlength: [20, 'Industry must not exceed 20 characters'],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'Industry must contain alphabets only.'
      }
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [30, 'Email address must not exceed 30 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: 'Phone number must be a valid 10-digit number.'
      }
    },
    address: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Street address must not exceed 100 characters']
    },
    city: {
      type: String,
      default: '',
      trim: true,
      maxlength: [20, 'City must not exceed 20 characters'],
      validate: {
        validator: function (v) {
          return !v || /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'City must contain alphabets only.'
      }
    },
    state: {
      type: String,
      default: '',
      trim: true,
      maxlength: [20, 'State must not exceed 20 characters'],
      validate: {
        validator: function (v) {
          return !v || /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'State must contain alphabets only.'
      }
    },
    country: {
      type: String,
      default: '',
      trim: true,
      maxlength: [20, 'Country must not exceed 20 characters'],
      validate: {
        validator: function (v) {
          return !v || /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'Country must contain alphabets only.'
      }
    },
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
