import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('honeychain_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('honeychain_token');
      const savedUser = localStorage.getItem('honeychain_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await client.post('/api/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('honeychain_token', access_token);
      localStorage.setItem('honeychain_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await client.post('/api/auth/register', userData);
      const { access_token, user: newUser } = response.data;

      localStorage.setItem('honeychain_token', access_token);
      localStorage.setItem('honeychain_user', JSON.stringify(newUser));

      setToken(access_token);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('honeychain_token');
    localStorage.removeItem('honeychain_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
