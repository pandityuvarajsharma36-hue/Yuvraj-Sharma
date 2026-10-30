import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/index.js';

interface AuthContextType {
  token: string | null;
  admin: AdminUser | null;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  updateUser: (user: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sharma_admin_token'));
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sharma_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setAdmin(data.user);
          localStorage.setItem('sharma_admin_user', JSON.stringify(data.user));
        } else {
          // Token expired or invalid
          setToken(null);
          setAdmin(null);
          localStorage.removeItem('sharma_admin_token');
          localStorage.removeItem('sharma_admin_user');
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, [token]);

  const login = (newToken: string, user: AdminUser) => {
    setToken(newToken);
    setAdmin(user);
    localStorage.setItem('sharma_admin_token', newToken);
    localStorage.setItem('sharma_admin_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('sharma_admin_token');
    localStorage.removeItem('sharma_admin_user');
  };

  const updateUser = (updated: Partial<AdminUser>) => {
    if (admin) {
      const merged = { ...admin, ...updated };
      setAdmin(merged);
      localStorage.setItem('sharma_admin_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider value={{ token, admin, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
