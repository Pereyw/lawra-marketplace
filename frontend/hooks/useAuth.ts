'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AuthManager } from '@/lib/auth';
import { apiClient, authApi } from '@/lib/api';

export interface User {
  userId: number;
  email: string;
  role: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize auth from storage
  useEffect(() => {
    const initializeAuth = () => {
      const token = AuthManager.getToken();
      if (token && !AuthManager.isTokenExpired(token)) {
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser) {
          setUser({
            userId: currentUser.userId,
            email: currentUser.email,
            role: currentUser.role,
          });
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Setup automatic token refresh
  useEffect(() => {
    if (!user) return;

    const setupTokenRefresh = () => {
      const timeUntilExpiry = AuthManager.getTimeUntilExpiry();
      if (timeUntilExpiry > 0) {
        // Refresh 5 minutes before expiry
        const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
        if (refreshIntervalRef.current) {
          clearTimeout(refreshIntervalRef.current);
        }
        refreshIntervalRef.current = setTimeout(() => {
          refreshToken();
        }, refreshTime);
      }
    };

    setupTokenRefresh();

    return () => {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
    };
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.login({ email, password });
      const { token, refreshToken: refreshTokenValue } = response.data.data;

      AuthManager.setAuthTokens(token, refreshTokenValue);
      const currentUser = AuthManager.getCurrentUser();

      if (currentUser) {
        setUser({
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role,
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.register(data);
      const { token, refreshToken: refreshTokenValue } = response.data.data;

      AuthManager.setAuthTokens(token, refreshTokenValue);
      const currentUser = AuthManager.getCurrentUser();

      if (currentUser) {
        setUser({
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role,
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      AuthManager.clearAuthTokens();
      setUser(null);
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authApi.refreshToken();
      const { token, refreshToken: refreshTokenValue } = response.data.data;

      AuthManager.setAuthTokens(token, refreshTokenValue);
      const currentUser = AuthManager.getCurrentUser();

      if (currentUser) {
        setUser({
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role,
        });
      }
    } catch (err) {
      // Refresh failed, logout user
      await logout();
      throw err;
    }
  }, [logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !AuthManager.isTokenExpired(),
    isAdmin: user?.role === 'admin' || false,
    login,
    register,
    logout,
    refreshToken,
    error,
    clearError,
  };
};
