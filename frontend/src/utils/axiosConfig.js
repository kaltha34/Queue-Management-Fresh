import axios from 'axios';
import { toast } from 'react-toastify';

// Track backend connectivity to prevent repeated error notifications
let hasShownNetworkError = false;
let lastErrorTime = 0;
const ERROR_COOLDOWN = 30000; // 30 seconds between network error notifications

// Create a base axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Add a request interceptor to add auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Reset network error flag when we get a successful response
    hasShownNetworkError = false;
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      const currentTime = Date.now();
      console.error('Network Error:', error);
      
      // Only show network error toast once or after cooldown period
      if (!hasShownNetworkError || (currentTime - lastErrorTime > ERROR_COOLDOWN)) {
        // For initial page load, don't show toast for common API endpoints
        const isInitialLoad = !document.referrer || 
                             document.referrer.includes(window.location.origin);
        const isCommonEndpoint = error.config && 
                               (error.config.url.includes('/api/queues') || 
                                error.config.url.includes('/api/teams') ||
                                error.config.url.includes('/api/auth/user'));
        
        if (!(isInitialLoad && isCommonEndpoint)) {
          toast.error('Network error. Please check if the backend server is running.', {
            toastId: 'network-error', // Prevent duplicate toasts
            autoClose: 5000
          });
        }
        
        hasShownNetworkError = true;
        lastErrorTime = currentTime;
      }
      
      return Promise.reject(new Error('Network error. Please check if the backend server is running.'));
    }
    
    // Handle API errors based on status code
    const { status } = error.response;
    
    if (status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      // Only redirect if not already on login or register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
