import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('gdm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Verify token is still valid on mount
  useEffect(() => {
    const token = localStorage.getItem('gdm_token');
    if (token) {
      authService.getMe()
        .then((res) => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const { token, user: userData } = res.data.data;
      localStorage.setItem('gdm_token', token);
      localStorage.setItem('gdm_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gdm_token');
    localStorage.removeItem('gdm_user');
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isTeacher = user?.role === 'SUNDAY_SCHOOL_TEACHER';
  const canManageSundaySchool = isAdmin || isTeacher;

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, logout, isAdmin, isTeacher, canManageSundaySchool }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
