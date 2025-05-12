import api from '../utils/api/axios';
import { User } from '../types';
import { AxiosError } from 'axios';

export const authService = {
  login: async (phoneNumber: string, password: string) => {
    const response = await api.post('/auth/login', { phoneNumber, password });
    return response.data;
  },

  signup: async (userData: Partial<User>) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  checkPhoneExists: async (phoneNumber: string): Promise<{ exists: boolean }> => {
    try {
      await api.post('/auth/check-phone', { phoneNumber });
      return { exists: true };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return { exists: false };
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }
};
