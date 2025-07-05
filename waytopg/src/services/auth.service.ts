import api from '../utils/api/axios';
import { User } from '../types';
import { AxiosError } from 'axios';

export const authService = {
  login: async (phoneNumber: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { phoneNumber, password });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  signup: async (userData: Partial<User>) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Signup failed');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  checkPhoneExists: async (phoneNumber: string): Promise<{ exists: boolean; message?: string }> => {
    try {
      const response = await api.post('/auth/check-phone', { phoneNumber });
      return { 
        exists: false,
        message: response.data.message 
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          // For password reset, 409 means success because the phone exists
          return { 
            exists: true,
            message: error.response.data.message 
          };
        }
        if (error.response?.status === 400) {
          throw new Error('Please enter a valid phone number');
        }
      }
      throw new Error('An unexpected error occurred while checking the phone number');
    }
  },

  resetPassword: async (phoneNumber: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password', { phoneNumber, newPassword });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Password reset failed');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }
};
