import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../navigation/navigationRef';

export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  status: 'active' | 'suspended' | 'pending';
}

const STORAGE_KEY = 'fitpro_user';

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@fitpro.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@fitpro.com',
      role: 'admin',
      name: 'Sarah Admin',
      status: 'active',
    },
  },
  'trainer@fitpro.com': {
    password: 'trainer123',
    user: {
      id: '2',
      email: 'trainer@fitpro.com',
      role: 'trainer',
      name: 'Mike Johnson',
      status: 'active',
    },
  },
  'member@fitpro.com': {
    password: 'member123',
    user: {
      id: '3',
      email: 'member@fitpro.com',
      role: 'member',
      name: 'Alex Smith',
      status: 'active',
    },
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    await new Promise<void>(resolve => setTimeout(resolve, 400));

    const userData = MOCK_USERS[email.toLowerCase()];
    if (!userData || userData.password !== password) {
      setAuthError('Invalid email or password');
      throw new Error('Invalid credentials');
    }
    if (userData.user.status === 'suspended') {
      setAuthError('Account suspended. Contact support.');
      throw new Error('Account suspended');
    }
    if (userData.user.status === 'pending') {
      setAuthError('Account pending verification.');
      throw new Error('Account pending');
    }

    setUser(userData.user);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData.user));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    if (navigationRef.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }),
      );
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isHydrated,
      login,
      logout,
      authError,
    }),
    [user, isHydrated, login, logout, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
