import React, { useEffect } from 'react';
import { Armchair } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth/authService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isInitialized, setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((appUser) => {
      setUser(appUser);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [setUser, setInitialized]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="inline-flex p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-500/30">
            <Armchair size={36} strokeWidth={2.5} />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Manushri</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Restoring terminal session</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
