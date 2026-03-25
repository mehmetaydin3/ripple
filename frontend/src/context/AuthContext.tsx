import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  isPublic: boolean;
  streak: number;
  longestStreak: number;
  totalGiven: number;
  totalActions: number;
  joinedAt: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (returnTo?: string) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  showSignInModal: boolean;
  setShowSignInModal: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    api.getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signInWithGoogle = (returnTo?: string) => {
    if (returnTo) {
      sessionStorage.setItem('returnTo', returnTo);
    }
    window.location.href = '/auth/google';
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, refresh, showSignInModal, setShowSignInModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
