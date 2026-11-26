import axiosClient from './axiosClient';

export const contactApi = {
  sendContactRequest: async (data) => {
    const response = await axiosClient.post('/contact', data);
    return response.data;
  }
};
