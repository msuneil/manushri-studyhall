import React, { createContext, useContext } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth/authService';
import { AuthProvider as CustomAuthProvider } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  hallId: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, hallName: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, hallId } = useAuthStore();
  const { showToast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      const appUser = await authService.login(email, password);
      showToast('Logged in successfully!', 'success');
      return appUser;
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      showToast('Logged out successfully!', 'success');
    } catch (error: any) {
      showToast('Failed to log out.', 'error');
      throw error;
    }
  };

  const signup = async (email: string, password: string, hallName: string) => {
    try {
      const appUser = await authService.signup(email, password, hallName);
      showToast('Account created successfully!', 'success');
      return appUser;
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  return (
    <CustomAuthProvider>
      <AuthContext.Provider value={{ user, loading, hallId, login, logout, signup }}>
        {children}
      </AuthContext.Provider>
    </CustomAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const { user, loading, hallId } = useAuthStore();
    return {
      user,
      loading,
      hallId,
      login: authService.login,
      logout: authService.logout,
      signup: authService.signup
    };
  }
  return context;
};

export default AuthContext;
