'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { TeamRole } from '@/lib/prisma';

interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    users: number;
  };
}

interface CreatedTeam {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count: {
    users: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  team?: Team & { teamRole: TeamRole } | null;
  createdTeams: CreatedTeam[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isCheckingAuth = useRef(false);

  const checkAuth = async () => {
    if (isCheckingAuth.current) {
      return;
    }
    
    isCheckingAuth.current = true;
    
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      setUser(data.user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
      isCheckingAuth.current = false;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    await checkAuth();
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    // Após o signup, não fazer login automático
    // O usuário será redirecionado para a página de signup para selecionar/criar time
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 