import axiosClient from './axiosClient';
import { securitySettingsSchema } from '@/validations';

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
  suspendOrganization: async (id, status = 'Suspended') => {
    return axiosClient.patch(`/admin/organizations/${id}/suspend`, { status });
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
  createManager: async (data) => {
    return axiosClient.post('/admin/fleet-managers', data);
  },
  updateFleetManager: async (id, data) => {
    return axiosClient.put(`/admin/fleet-managers/${id}`, data);
  },
  updateManager: async (id, data) => {
    return axiosClient.put(`/admin/fleet-managers/${id}`, data);
  },
  deleteFleetManager: async (id) => {
    return axiosClient.delete(`/admin/fleet-managers/${id}`);
  },
  deleteManager: async (id) => {
    return axiosClient.delete(`/admin/fleet-managers/${id}`);
  },

  // Settings
  getSettings: async () => {
    return axiosClient.get('/admin/settings');
  },
  updateSettings: async (data) => {
    return axiosClient.put('/admin/settings', data);
  },

  // Security Settings
  getSecuritySettings: async () => {
    return axiosClient.get('/admin/settings/security');
  },
  updateSecuritySettings: async (data) => {
    return axiosClient.put('/admin/settings/security', data);
  },

  // Notification Settings
  getNotificationSettings: async () => {
    return axiosClient.get('/admin/settings/notifications');
  },
  updateNotificationSettings: async (data) => {
    return axiosClient.put('/admin/settings/notifications', data);
  },

  // Analytics
  getAnalytics: async (filter) => {
    return axiosClient.get('/admin/analytics', { params: filter ? { filter } : {} });
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
    return axiosClient.get('/admin/audit-logs', { params });
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
