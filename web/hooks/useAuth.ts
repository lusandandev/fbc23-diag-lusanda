'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

type LoginResponse = {
  success: true;
  token: string;
};

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
    setIsReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('token', result.token);
    setToken(result.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
  }, []);

  return { token, isReady, login, logout };
};
