/**
 * Contexte d'authentification avec persistance de session
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from '../services/database';
import { simpleHash } from '../utils/auth';
import type { User } from '../types';

const SESSION_KEY = 'strive_session_user_id';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: {
    name?: string;
    email?: string;
    photo?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const u = await getUserById(user.id);
    if (u) setUser(u);
  }, [user?.id]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if (stored) {
          const u = await getUserById(stored);
          setUser(u);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const u = await getUserByEmail(email);
      if (!u || u.passwordHash !== simpleHash(password)) return false;
      await SecureStore.setItemAsync(SESSION_KEY, u.id);
      setUser(u);
      return true;
    },
    []
  );

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      const existing = await getUserByEmail(email);
      if (existing) return false;
      const id = generateId();
      await createUser(id, name.trim(), email.trim(), simpleHash(password));
      await SecureStore.setItemAsync(SESSION_KEY, id);
      const u = await getUserById(id);
      if (u) setUser(u);
      return true;
    },
    []
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: { name?: string; email?: string; photo?: string }) => {
      if (!user) return;
      await updateUser(user.id, updates);
      const u = await getUserById(user.id);
      if (u) setUser(u);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
