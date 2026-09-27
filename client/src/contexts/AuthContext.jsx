import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const isBrowser = typeof window !== 'undefined';
const isLocalHostRuntime =
  isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const localDefaultApiOrigin = 'http://localhost:5000';
const productionDefaultApiOrigin = 'https://namaste-messenger.onrender.com';
const configuredApiOrigin = import.meta.env.VITE_API_URL || productionDefaultApiOrigin;
const localApiOrigin = import.meta.env.VITE_API_URL_LOCAL || localDefaultApiOrigin;

// Prefer local backend when app runs on localhost, even if remote env vars exist.
const apiOrigin = isLocalHostRuntime ? localApiOrigin : configuredApiOrigin;
const API_BASE_URL = `${apiOrigin.replace(/\/$/, '')}/api`;

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Request interceptor to add token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Start as false for public pages
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [initialized, setInitialized] = useState(false);

  // Lazy initialization - only verify token when actually needed
  const initializeAuth = async () => {
    if (initialized) return;
    
    setLoading(true);
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Verify token is still valid with timeout
        const response = await axios.get('/auth/verify', {
          headers: { Authorization: `Bearer ${storedToken}` },
          timeout: 5000 // 5 second timeout
        });
        
        if (response.data.success) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.warn('Token verification failed (server might be offline):', error.message);
        // Don't clear storage if it's just a network error - user might be offline
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        } else {
          // If it's a network error, keep the stored user for offline access
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
    }
    setLoading(false);
    setInitialized(true);
  };

  // Only initialize on first render if there's a token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // If we have stored credentials, load them but don't verify yet
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update state
        setToken(token);
        setUser(user);
        
        return { success: true, user };
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update state
        setToken(token);
        setUser(user);
        
        return { success: true, user };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if user is logged in
      if (token) {
        await axios.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear storage and state regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error(error.response?.data?.error || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await axios.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/users/profile', profileData);
      if (response.data.success) {
        updateUser(response.data.user);
        return response.data;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    updateProfile,
    initializeAuth,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};