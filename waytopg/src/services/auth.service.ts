import api from '../utils/api/axios';
import { User } from '../types';

export const authService = {
  login: async (phoneNumber: string, password: string) => {
    const response = await api.post('/auth/login', { phoneNumber, password });
    return response.data;
  },

  signup: async (userData: Partial<User>) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  checkPhoneExists: async (phoneNumber: string) => {
    const response = await api.post('/auth/check-phone', { phoneNumber });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }
};
