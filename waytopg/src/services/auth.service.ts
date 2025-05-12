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
      console.log('Checking phone number:', phoneNumber);
      const response = await api.post('/auth/check-phone', { phoneNumber });
      console.log('Server response:', response.data);
      
      // When response is 200 but phone exists (shouldn't happen with current server code)
      if (response.data.exists) {
        console.log('Phone exists from 200 response');
        return {
          exists: true,
          message: response.data.message || 'This phone number is already registered. Please login instead.'
        };
      }
      
      return { 
        exists: false,
        message: response.data.message 
      };
    } catch (error: unknown) {
      console.error('Error checking phone:', error);
      if (error instanceof AxiosError) {
        console.log('Axios error status:', error.response?.status);
        console.log('Axios error data:', error.response?.data);
        
        if (error.response?.status === 409) {
          return { 
            exists: true,
            message: error.response.data.message 
          };
        }
        if (error.response?.status === 400) {
          throw new Error('Please enter a valid phone number');
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }
};
