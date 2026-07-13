import axiosClient from './axiosClient';

export const adminApi = {
  getDashboard: async () => {
    return axiosClient.get('/admin/dashboard');
  },
  getOrganizations: async () => {
    return axiosClient.get('/admin/organizations');
  },
  createOrganization: async (data) => {
    return axiosClient.post('/admin/organizations', data);
  },
  getOrganizationById: async (id) => {
    return axiosClient.get(`/admin/organizations/${id}`);
  },
  updateOrganization: async (id, data) => {
    return axiosClient.put(`/admin/organizations/${id}`, data);
  },
  deleteOrganization: async (id) => {
    return axiosClient.delete(`/admin/organizations/${id}`);
  },
  getFleetManagers: async () => {
    return axiosClient.get('/admin/fleet-managers');
  },
  createFleetManager: async (data) => {
    return axiosClient.post('/admin/fleet-managers', data);
  },
  getFleetManagerById: async (id) => {
    return axiosClient.get(`/admin/fleet-managers/${id}`);
  },
  updateFleetManager: async (id, data) => {
    return axiosClient.put(`/admin/fleet-managers/${id}`, data);
  },
  deleteFleetManager: async (id) => {
    return axiosClient.delete(`/admin/fleet-managers/${id}`);
  },
  getAnalytics: async (filter) => {
    return axiosClient.get('/admin/analytics', { params: { filter } });
  },
  getSystemHealth: async () => {
    return axiosClient.get('/admin/health');
  },
  getAuditLogs: async (params) => {
    return axiosClient.get('/admin/audit-logs', { params });
  },
  getNotifications: async () => {
    return axiosClient.get('/admin/notifications');
  },
  createNotification: async (data) => {
    return axiosClient.post('/admin/notifications', data);
  },
  markAllNotificationsRead: async () => {
    return axiosClient.patch('/admin/notifications/read-all');
  },
  markNotificationRead: async (id) => {
    return axiosClient.patch(`/admin/notifications/${id}/read`);
  },
  deleteNotification: async (id) => {
    return axiosClient.delete(`/admin/notifications/${id}`);
  },
  getSettings: async () => {
    return axiosClient.get('/admin/settings');
  },
  updateSettings: async (data) => {
    return axiosClient.put('/admin/settings', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getSecuritySettings: async () => {
    return axiosClient.get('/admin/settings/security');
  },
  updateSecuritySettings: async (data) => {
    return axiosClient.put('/admin/settings/security', data);
  },
  getNotificationSettings: async () => {
    return axiosClient.get('/admin/settings/notifications');
  },
  updateNotificationSettings: async (data) => {
    return axiosClient.put('/admin/settings/notifications', data);
  },
  getProfile: async () => {
    return axiosClient.get('/admin/profile');
  },
  updateProfile: async (data) => {
    return axiosClient.put('/admin/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
