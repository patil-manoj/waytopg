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

  verifyPhone: async (phoneNumber: string, code: string) => {
    const response = await api.post('/auth/verify-phone', { phoneNumber, code });
    return response.data;
  },

  verifyEmail: async (email: string, code: string) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }
};
