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
  timeout: 15000 // 15 seconds timeout to allow for slower connections
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
    
    // Log outgoing requests in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Reset network error flag when we get a successful response
    hasShownNetworkError = false;
    
    // Log successful responses in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      const currentTime = Date.now();
      console.error('Network Error:', error.message, 'URL:', error.config?.url);
      
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
    const { status, data } = error.response;
    const errorMessage = data?.message || 'An error occurred';
    
    // Log detailed error information
    console.error(`API Error ${status}:`, {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status,
      message: errorMessage,
      data: data
    });
    
    // Handle specific status codes
    switch (status) {
      case 400: // Bad Request
        // Don't show toast for validation errors as they're typically handled by the components
        break;
        
      case 401: // Unauthorized
        // Clear token and redirect to login
        localStorage.removeItem('token');
        // Only redirect if not already on login or register page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          toast.error('Session expired. Please log in again.', {
            toastId: 'session-expired'
          });
          window.location.href = '/login';
        }
        break;
        
      case 403: // Forbidden
        toast.error('You do not have permission to perform this action.', {
          toastId: 'permission-denied'
        });
        break;
        
      case 404: // Not Found
        // Don't show toast for 404s on initial page load or common endpoints
        // These are often just checking if resources exist
        break;
        
      case 500: // Server Error
      case 502: // Bad Gateway
      case 503: // Service Unavailable
      case 504: // Gateway Timeout
        toast.error('Server error. Please try again later or contact support.', {
          toastId: 'server-error'
        });
        break;
        
      default:
        // Don't show generic error toasts here, let components handle specific error messages
        break;
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
