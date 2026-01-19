import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type UserRole = 'admin' | 'demo-admin' | 'user';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isDemoAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials check
const getRole = (email: string | null): UserRole => {
  if (!email) return 'user';
  
  const lowerEmail = email.toLowerCase();
  if (lowerEmail === 'dashboard1@gmail.com') return 'admin';
  if (lowerEmail === 'demo.admin@gmail.com') return 'demo-admin';
  return 'user';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setRole(getRole(user?.email || null));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setRole(getRole(result.user.email));
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setRole('user');
  };

  const value = {
    user,
    role,
    loading,
    signIn,
    signUp,
    logout,
    isAdmin: role === 'admin',
    isDemoAdmin: role === 'demo-admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
