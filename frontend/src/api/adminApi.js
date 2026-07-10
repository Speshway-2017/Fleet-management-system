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
  getFleetManagers: async () => {
    return axiosClient.get('/admin/fleet-managers');
  },
  createFleetManager: async (data) => {
    return axiosClient.post('/admin/fleet-managers', data);
  },
};
