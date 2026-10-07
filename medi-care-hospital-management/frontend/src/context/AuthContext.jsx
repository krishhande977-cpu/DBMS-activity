import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medicare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('medicare_token');
      const storedUser = localStorage.getItem('medicare_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await authAPI.me();
          setUser(res.data);
          localStorage.setItem('medicare_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token invalid or expired", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, doctorName = null) => {
    const res = await authAPI.login({ email, password, doctor_name: doctorName });
    const { access_token, user: userData } = res.data;

    localStorage.setItem('medicare_token', access_token);
    localStorage.setItem('medicare_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const doctorLogin = async (doctorName, password = 'Doctor@123') => {
    const res = await authAPI.doctorLogin({ doctor_name: doctorName, password });
    const { access_token, user: userData } = res.data;

    localStorage.setItem('medicare_token', access_token);
    localStorage.setItem('medicare_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

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
