import axiosClient from './axiosClient';

export const adminApi = {
  getDashboard: async () => {
    return axiosClient.get('/admin/dashboard');
  },
  
  // Organizations
  getOrganizations: async () => {
    return axiosClient.get('/admin/organizations');
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

  // Analytics
  getAnalytics: async () => {
    return axiosClient.get('/admin/analytics');
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
  }
};
