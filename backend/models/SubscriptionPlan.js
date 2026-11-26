import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Plan name must not exceed 50 characters'],
      validate: {
        validator: function (v) {
          return !/\d/.test(v);
        },
        message: 'Plan name must not contain numbers.'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [100, 'Description must not exceed 100 characters'],
      validate: {
        validator: function (v) {
          return !/\d/.test(v);
        },
        message: 'Description must not contain numbers.'
      }
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in days
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    displayOrder: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    maxVehicles: {
      type: Number,
      default: 0,
      min: [0, 'Number of vehicles must be a whole number.'],
      validate: {
        validator: Number.isInteger,
        message: 'Number of vehicles must be a whole number.'
      }
    },
    maxDrivers: {
      type: Number,
      default: 0,
      min: [0, 'Number of drivers must be a whole number.'],
      validate: {
        validator: Number.isInteger,
        message: 'Number of drivers must be a whole number.'
      }
    },
    maxTrips: {
      type: Number,
      default: 0,
      min: [0, 'Number of trips must be a whole number.'],
      validate: {
        validator: Number.isInteger,
        message: 'Number of trips must be a whole number.'
      }
    },
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;
