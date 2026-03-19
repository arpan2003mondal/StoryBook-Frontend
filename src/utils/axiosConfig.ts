import axios from 'axios';
import { AuthService } from '../services/AuthService';

export const setupAxiosInterceptors = () => {
  // Request interceptor - add token to every request
  axios.interceptors.request.use(
    config => {
      const token = AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor - handle 401 responses
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        AuthService.logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};
