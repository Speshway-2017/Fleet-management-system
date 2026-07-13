import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      required: true,
      default: 'FleetCommand',
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },
    language: {
      type: String,
      required: true,
      default: 'English',
    },
    logoUrl: {
      type: String,
      required: true,
      default: '/logo.png', // Default path to a static placeholder
    },
    security: {
      twoFactorAdmin: { type: Boolean, default: true },
      twoFactorManager: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 60 },
      maxLoginAttempts: { type: Number, default: 5 },
      accountLockDuration: { type: Number, default: 30 }, // Minutes
      passwordPolicy: {
        requireUppercase: { type: Boolean, default: true },
        requireNumber: { type: Boolean, default: true },
        requireSpecial: { type: Boolean, default: true },
      },
      ipAllowlistEnabled: { type: Boolean, default: false },
      allowedIps: { type: String, default: "" },
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      primaryEmailAddress: { type: String, default: "admin@fleetcommand.io" },
      smsNotifications: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: false },
      systemAlerts: { type: Boolean, default: true },
      systemAlertsSeverity: { type: String, default: "warning" },
      maintenanceAlerts: { type: Boolean, default: true },
      maintenanceAlert48h: { type: Boolean, default: true },
      maintenanceAlert1h: { type: Boolean, default: true },
      inviteNotifications: { type: Boolean, default: true },
      inviteSent: { type: Boolean, default: true },
      inviteAccepted: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      weeklyReportDay: { type: String, default: "monday" },
      newOrganizationAlerts: { type: Boolean, default: true },
      requireAdminReview: { type: Boolean, default: true },
    }
  },
  {
    timestamps: true,
  }
);

// We want to ensure there is only ever one document for Settings.
// One common way is to force an explicit _id or a singleton flag, but the controller
// will just use findOne() and update that document.

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
