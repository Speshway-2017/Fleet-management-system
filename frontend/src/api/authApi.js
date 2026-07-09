import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    return axiosClient.post('/auth/login', credentials);
  },
  logout: async () => {
    return axiosClient.post('/auth/logout');
  },
  getProfile: async () => {
    return axiosClient.get('/auth/profile');
  },
  forgotPassword: async (email) => {
    return axiosClient.post('/auth/forgot-password', { email });
  },
  verifyOtp: async (data) => {
    return axiosClient.post('/auth/verify-otp', data);
  },
  resetPassword: async (data) => {
    return axiosClient.post('/auth/reset-password', data);
  }
};
