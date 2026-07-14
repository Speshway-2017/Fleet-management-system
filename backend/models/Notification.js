import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, default: 'info' }, // alert, warning, info, success, system
    title: { type: String, required: true },
    description: { type: String },
    message: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String },
    priority: { type: String, default: 'low' }, // high, medium, low
    iconName: { type: String, default: 'mdi:information' },
    bgClass: { type: String, default: 'bg-blue-100 text-blue-700' },
    coords: { type: [Number], default: [19.0760, 72.8777] },
    locationName: { type: String, default: '' },
    stats: { type: Array, default: [] }, // Array of { label, value, isCritical }
    driver: { type: Object, default: null }, // Object with driver info
    vehicle: { type: String, default: '' },
    vehicleModel: { type: String, default: '' },
    recentAlerts: { type: Array, default: [] },
    actions: { type: Array, default: [] },
    isRead: { type: Boolean, default: false },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  },
  { timestamps: true }
);

notificationSchema.pre('save', function (next) {
  if (this.message && !this.description) {
    this.description = this.message;
  } else if (this.description && !this.message) {
    this.message = this.description;
  }
  next();
});

export default mongoose.model('Notification', notificationSchema);
