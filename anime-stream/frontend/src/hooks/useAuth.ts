'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { User } from '@/types';
import Cookies from 'js-cookie';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient.get<User>('/auth/me')
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
        Cookies.remove('accessToken');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, user } = response.data;
    
    Cookies.set('accessToken', accessToken, { expires: 1 });
    setUser(user);
    
    return user;
  };

  const register = async (email: string, password: string, name?: string) => {
    await apiClient.post('/auth/register', { email, password, name });
    // После регистрации нужно войти
    return login(email, password);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      Cookies.remove('accessToken');
      setUser(null);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
