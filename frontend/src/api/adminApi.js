import axiosClient from './axiosClient';

export const adminApi = {
  getDashboard: async () => {
    return axiosClient.get('/admin/dashboard');
  },
  
  // Organizations
  getOrganizations: async () => {
    return axiosClient.get('/admin/organizations');
  },
  getOrganizationDetails: async (id) => {
    return axiosClient.get(`/admin/organizations/${id}`);
  },
  createOrganization: async (data) => {
    return axiosClient.post('/admin/organizations', data);
  },
  updateOrganization: async (id, data) => {
    return axiosClient.put(`/admin/organizations/${id}`, data);
  },
  deleteOrganization: async (id) => {
    return axiosClient.delete(`/admin/organizations/${id}`);
  },

  // Fleet Managers
  getFleetManagers: async () => {
    return axiosClient.get('/admin/fleet-managers');
  },
  getManagerDetails: async (id) => {
    return axiosClient.get(`/admin/fleet-managers/${id}`);
  },
  createFleetManager: async (data) => {
    return axiosClient.post('/admin/fleet-managers', data);
  },
  updateFleetManager: async (id, data) => {
    return axiosClient.put(`/admin/fleet-managers/${id}`, data);
  },
  deleteFleetManager: async (id) => {
    return axiosClient.delete(`/admin/fleet-managers/${id}`);
  },

  // Settings
  getSettings: async () => {
    return axiosClient.get('/admin/settings');
  },
  updateSettings: async (data) => {
    return axiosClient.put('/admin/settings', data);
  },

  // Security Settings (Mocked via localStorage)
  getSecuritySettings: async () => {
    const saved = localStorage.getItem('mockSecuritySettings');
    if (saved) {
      return { data: JSON.parse(saved) };
    }
    return { data: {
      twoFactorAdmin: true,
      twoFactorManager: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordPolicy: { requireUppercase: true, requireNumber: true, requireSpecial: true },
      ipAllowlistEnabled: false,
      allowedIps: ""
    } };
  },
  updateSecuritySettings: async (data) => {
    localStorage.setItem('mockSecuritySettings', JSON.stringify(data));
    return { data };
  },

  // Notification Settings (Mocked via localStorage)
  getNotificationSettings: async () => {
    const saved = localStorage.getItem('mockNotificationSettings');
    if (saved) {
      return { data: JSON.parse(saved) };
    }
    return { data: {
      emailNotifications: true,
      primaryEmailAddress: "admin@fleetcommand.io",
      systemAlerts: true,
      systemAlertsSeverity: "warning",
      maintenanceAlerts: true,
      maintenanceAlert48h: true,
      maintenanceAlert1h: true,
      inviteNotifications: true,
      inviteSent: true,
      inviteAccepted: true,
      weeklyReports: true,
      weeklyReportDay: "monday",
      newOrganizationAlerts: true,
      requireAdminReview: true
    } };
  },
  updateNotificationSettings: async (data) => {
    localStorage.setItem('mockNotificationSettings', JSON.stringify(data));
    return { data };
  },

  // Analytics
  getAnalytics: async () => {
    return axiosClient.get('/admin/analytics');
  },
  getSystemHealth: async () => {
    // Mock system health data since backend doesn't have this endpoint yet
    return {
      data: {
        api: { status: 'Operational', value: '99.9%' },
        database: { status: 'Healthy', value: '12ms' },
        server: { status: 'Normal', value: '4 Nodes' },
        responseTime: { status: 'Fast', value: '45ms' },
        storage: { status: 'Normal', value: '45% Used' },
        cpu: { status: 'Normal', value: '32%' },
        memory: { status: 'Normal', value: '4GB/16GB' },
        uptime: { status: 'Operational', value: '99.99%' }
      }
    };
  },
  getAuditLogs: async (params) => {
    // Mock audit logs
    const logs = [
      { id: 1, timestamp: new Date().toISOString(), user: "Super Admin", action: "Updated Organization", organization: "ARC Logistics", ip: "192.168.1.1", status: "Success" },
      { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), user: "System", action: "Daily Backup", organization: "System", ip: "localhost", status: "Success" },
      { id: 3, timestamp: new Date(Date.now() - 7200000).toISOString(), user: "Super Admin", action: "Created Fleet Manager", organization: "XYZ Transport", ip: "192.168.1.1", status: "Success" }
    ];
    return {
      data: {
        data: {
          logs,
          pagination: { page: 1, limit: 15, totalPages: 1, total: logs.length }
        }
      }
    };
  },

  // Platform Issues
  getIssues: async () => {
    return axiosClient.get('/admin/issues');
  },
  createIssue: async (data) => {
    return axiosClient.post('/admin/issues', data);
  },
  updateIssue: async (id, data) => {
    return axiosClient.patch(`/admin/issues/${id}`, data);
  },

  // Notifications
  getNotifications: async () => {
    return axiosClient.get('/admin/notifications');
  },
  markNotificationRead: async (id) => {
    return axiosClient.patch(`/admin/notifications/${id}/read`);
  },
  markAllNotificationsRead: async () => {
    return axiosClient.patch('/admin/notifications/read-all');
  },
  deleteNotification: async (id) => {
    return axiosClient.delete(`/admin/notifications/${id}`);
  },

  // Profile Details
  // Profile Details
  getProfile: async () => {
    return axiosClient.get('/admin/profile');
  },
  updateProfile: async (data) => {
    return axiosClient.put('/admin/profile', data);
  },
  
  // Contact Requests Management
  getContactRequests: async (params) => {
    return axiosClient.get('/admin/contacts', { params });
  },
  getContactAnalytics: async () => {
    return axiosClient.get('/admin/contacts/analytics');
  },
  updateContactStatus: async (id, data) => {
    return axiosClient.patch(`/admin/contacts/${id}/status`, data);
  },
  replyToContact: async (id, data) => {
    return axiosClient.post(`/admin/contacts/${id}/reply`, data);
  },
  deleteContact: async (id) => {
    return axiosClient.delete(`/admin/contacts/${id}`);
  },

  // Milestone Reviews
  getReviews: async () => {
    return axiosClient.get('/admin/reviews');
  },
  toggleReviewPublic: async (id, showPublic) => {
    return axiosClient.patch(`/admin/reviews/${id}/public`, { showPublic });
  },
  // Blogs Management
  getBlogs: async () => {
    return axiosClient.get('/admin/blogs');
  },
  createBlog: async (data) => {
    return axiosClient.post('/admin/blogs', data);
  },
  updateBlog: async (id, data) => {
    return axiosClient.put(`/admin/blogs/${id}`, data);
  },
  deleteBlog: async (id) => {
    return axiosClient.delete(`/admin/blogs/${id}`);
  },

  // About Management
  getAbout: async () => {
    return axiosClient.get('/admin/about');
  },
  updateAbout: async (data) => {
    return axiosClient.put('/admin/about', data);
  }
};
