import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Fleet HQ' },
    logoUrl: { type: String, default: '/logo.png' },
    platformName: { type: String, default: 'FleetManagement' },
    supportEmail: { type: String, default: 'support@fleetmanagement.io' },
    supportPhone: { type: String, default: '+1 (555) 000-0000' },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'English' },
    theme: { type: String, default: 'Light' },
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      maintenanceAlerts: { type: Boolean, default: true },
      inviteNotifications: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      newOrganizationAlerts: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
