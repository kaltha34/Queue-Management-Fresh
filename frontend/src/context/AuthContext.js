import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      // Store token in localStorage - our axiosInstance will use it automatically
      localStorage.setItem('token', token);
    } else {
      // Remove token from localStorage
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    if (token) {
      setAuthToken(token);
      try {
        console.log('Loading user data...');
        const res = await axiosInstance.get('/api/auth/user');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error(err);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
      }
    }
    setLoading(false);
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axiosInstance.post('/api/auth/register', formData);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setAuthToken(res.data.token);
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      setError(err.response.data.message || 'Registration failed');
      toast.error(err.response.data.message || 'Registration failed');
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axiosInstance.post('/api/auth/login', formData);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setAuthToken(res.data.token);
      toast.success('Login successful!');
      return true;
    } catch (err) {
      setError(err.response.data.message || 'Login failed');
      toast.error(err.response.data.message || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    toast.info('You have been logged out');
  };

  // Check if token is expired
  const isTokenExpired = () => {
    if (!token) return true;
    try {
      const decoded = jwt_decode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  };

  // Check if user is mentor or admin
  const isMentorOrAdmin = () => {
    return user && (user.role === 'mentor' || user.role === 'admin');
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        isTokenExpired,
        isMentorOrAdmin,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
