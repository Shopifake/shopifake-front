import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { API_BASE_URL } from '../hooks/api-config';
import { authFetch } from '../utils/authFetch';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      // Utilise authFetch qui gère automatiquement le refresh
      const res = await authFetch(`${API_BASE_URL}/api/auth-b2e/me`);
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // En cas d'échec, nettoyer les cookies potentiellement corrompus
        document.cookie = "b2e_accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "b2e_refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUser(null);
      }
    } catch {
      // En cas d'erreur, nettoyer les cookies
      document.cookie = "b2e_accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "b2e_refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setLoading(false);
  };

  // Chargement initial de l'utilisateur
  useEffect(() => {
    refreshUser();
  }, []);

  // Refresh périodique toutes les 14 minutes si user connecté
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        clearUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}