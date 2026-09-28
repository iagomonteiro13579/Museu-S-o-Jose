'use client';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
interface AdminUser {
  id: number;
  nome: string;
  email: string;
  role: string;
  canManageUsers?: boolean;
}
interface Context {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}
const AdminContext = createContext<Context | undefined>(undefined);
export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/profile', { cache: 'no-store' });
      setUser(r.ok ? (await r.json()).user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    localStorage.removeItem('adminToken');
    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => clearInterval(timer);
  }, [refresh]);
  const login = (_token: string, user: AdminUser) => setUser(user);
  const logout = async () => {
    const r = await fetch('/api/auth/logout', { method: 'POST' });
    if (r.ok) setUser(null);
  };
  return (
    <AdminContext.Provider
      value={{
        isAdmin: !!adminUser,
        adminUser,
        token: adminUser ? 'cookie-session' : null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('AdminProvider necessário');
  return value;
}
