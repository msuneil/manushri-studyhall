import { create } from 'zustand';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  hallId: string | null;
  isInitialized: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  hallId: null,
  isInitialized: false,
  setUser: (user) => set({ 
    user, 
    hallId: user ? user.uid : null, 
    loading: false 
  }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
}));

export default useAuthStore;
