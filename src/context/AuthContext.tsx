import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types/crm';
import { api } from '../services/api';
import { INITIAL_USERS } from '../services/mockBackend';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole | null;
  isManager: boolean;
  isAssignee: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (user: UserProfile) => void;
  availableUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to get current user:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const switchUser = (user: UserProfile) => {
    localStorage.setItem('crm_current_user_id', user.id);
    setCurrentUser(user);
  };

  const isManager = currentUser?.role === 'manager';
  const isAssignee = currentUser?.role === 'assignee';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isManager,
        isAssignee,
        loading,
        login,
        logout,
        switchUser,
        availableUsers: INITIAL_USERS,
      }}
    >
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
