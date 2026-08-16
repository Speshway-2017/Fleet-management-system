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
    footerDescription: { type: String, default: 'Next-generation intelligent fleet management platform. Streamlining nationwide transport operations, vehicle tracking, driver allocation, and logistics workflows with enterprise-grade reliability.' },
    contactPhone: { type: String, default: '+91 1800 200 4567' },
    contactEmail: { type: String, default: 'support@fleetmanagement.io' },
    contactAddress: { type: String, default: 'Logistics Hub Tower, Tech City, Bengaluru 560001, Karnataka, India' },
    facebookUrl: { type: String, default: 'https://facebook.com' },
    linkedinUrl: { type: String, default: 'https://linkedin.com' },
    twitterUrl: { type: String, default: 'https://twitter.com' },
    youtubeUrl: { type: String, default: 'https://youtube.com' },
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
