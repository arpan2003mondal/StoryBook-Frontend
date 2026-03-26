import axios from 'axios';
import { AuthService } from '../services/AuthService';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000'
});

export const setupAxiosInterceptors = () => {
  // Request interceptor - add token to every request
  axiosInstance.interceptors.request.use(
    config => {
      const token = AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      
      } else {
      
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor - handle 401 responses
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        
        // Token expired or invalid
        AuthService.logout();
        window.location.href = '/users/login';
      }
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
