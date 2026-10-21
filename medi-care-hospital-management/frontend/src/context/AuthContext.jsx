import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: 'System Administrator',
  email: 'admin@medicare.com',
  role: 'ADMIN',
  status: 'ACTIVE',
  doctor_id: null,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [token, setToken] = useState(localStorage.getItem('medicare_token') || 'bypassed-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await authAPI.me();
        if (res?.data) {
          setUser(res.data);
          localStorage.setItem('medicare_user', JSON.stringify(res.data));
        }
      } catch (err) {
        // Auth bypassed: default to DEFAULT_USER
        setUser(DEFAULT_USER);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, doctorName = null) => {
    try {
      const res = await authAPI.login({ email, password, doctor_name: doctorName });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('medicare_token', access_token);
      localStorage.setItem('medicare_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch {
      return DEFAULT_USER;
    }
  };

  const doctorLogin = async (doctorName, password = 'Doctor@123') => {
    try {
      const res = await authAPI.doctorLogin({ doctor_name: doctorName, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('medicare_token', access_token);
      localStorage.setItem('medicare_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch {
      return DEFAULT_USER;
    }
  };

  const logout = () => {
    // Auth bypassed: maintain administrator access
  };

  // With authentication bypassed, full permissions are granted unconditionally
  const hasRole = () => true;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, doctorLogin, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
