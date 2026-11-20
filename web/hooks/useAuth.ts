'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { apiRequest } from '../lib/api';

type LoginResponse = {
  success: true;
  token: string;
};

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

const getTokenSnapshot = (): string | null => localStorage.getItem('token');
const getServerTokenSnapshot = (): string | null => null;
const getReadySnapshot = (): boolean => true;
const getServerReadySnapshot = (): boolean => false;

const notifyTokenChange = () => {
  listeners.forEach((listener) => listener());
};

export const useAuth = () => {
  // useSyncExternalStore keeps localStorage access out of server rendering and avoids
  // synchronous state updates inside an effect during client hydration.
  const token = useSyncExternalStore(subscribe, getTokenSnapshot, getServerTokenSnapshot);
  const isReady = useSyncExternalStore(subscribe, getReadySnapshot, getServerReadySnapshot);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('token', result.token);
    notifyTokenChange();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    notifyTokenChange();
  }, []);

  return { token, isReady, login, logout };
};
