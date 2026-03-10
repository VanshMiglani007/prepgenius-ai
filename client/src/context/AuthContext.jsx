import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          // On network error, keep the cached user so the app doesn't break
          if (error.code === 'ERR_NETWORK') {
            const cached = localStorage.getItem('user');
            if (cached) {
              try { setUser(JSON.parse(cached)); } catch(e) {}
            }
          } else {
            localStorage.removeItem('token');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        setUser(res.data.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Make sure the backend is running.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        setUser(res.data.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Make sure the backend is running.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
