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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../navigation/navigationRef';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

const STORAGE_KEY = 'auth:user';

type DemoAccount = { email: string; password: string; role: UserRole; name: string };

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'admin@fitcheck.com', password: 'admin123', role: 'admin', name: 'Admin' },
  { email: 'trainer@fitcheck.com', password: 'trainer123', role: 'trainer', name: 'Trainer' },
  { email: 'member@fitcheck.com', password: 'member123', role: 'member', name: 'Member' },
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (args: { name: string; email: string; password: string; role: Exclude<UserRole, 'admin'> }) => Promise<void>;
  logout: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (!raw) {
          setUser(null);
          return;
        }
        setUser(JSON.parse(raw) as User);
      } finally {
        if (mounted) setIsHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const e = email.trim().toLowerCase();

    // Always allow demo accounts, even when Supabase/API is configured.
    const match = DEMO_ACCOUNTS.find(a => a.email === e && a.password === password);
    if (match) {
      try {
        // If a Supabase session exists from a previous run, clear it so demo mode is unambiguous.
        if (supabase) await supabase.auth.signOut();
      } catch {
        // ignore
      }
      const u: User = { id: match.email, email: match.email, role: match.role, name: match.name };
      setUser(u);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return;
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: e, password });
        if (error) throw error;
        const u = data.user;
        if (!u?.id || !u.email) throw new Error('Login failed');
        const name = String((u.user_metadata as any)?.name ?? u.email.split('@')[0] ?? 'User');
        const role = String((u.user_metadata as any)?.role ?? 'member') as UserRole;
        const user: User = { id: u.id, email: u.email, name, role };
        setUser(user);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        setAuthError(msg);
        throw err instanceof Error ? err : new Error(msg);
      }
    }
    if (api.hasBaseUrl()) {
      try {
        const { user } = await api.login({ email: e, password });
        setUser(user);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        setAuthError(msg);
        throw err instanceof Error ? err : new Error(msg);
      }
    }

    setAuthError('Invalid email or password');
    throw new Error('Invalid email or password');
  }, []);

  const signUp = useCallback(async (args: { name: string; email: string; password: string; role: Exclude<UserRole, 'admin'> }) => {
    setAuthError(null);
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    if (!name) throw new Error('Please enter your name');
    if (args.password.length < 6) throw new Error('Password must be at least 6 characters');

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: args.password,
          options: { data: { name, role: args.role } },
        });
        if (error) throw error;
        const u = data.user;
        // If email confirmation is enabled, Supabase may not create a session yet.
        if (u?.id && u.email) {
          const user: User = { id: u.id, email: u.email, name, role: args.role };
          setUser(user);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Sign up failed';
        setAuthError(msg);
        throw err instanceof Error ? err : new Error(msg);
      }
    }
    if (api.hasBaseUrl()) {
      try {
        const res = await api.register({ name, email, password: args.password, role: args.role });
        // Some APIs may not return a user until login; handle both.
        if (res.user) {
          setUser(res.user);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
        }
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Sign up failed';
        setAuthError(msg);
        throw err instanceof Error ? err : new Error(msg);
      }
    }

    const u: User = {
      id: `local-${Date.now()}`,
      email,
      role: args.role,
      name,
    };
    setUser(u);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    await api.logout();
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
      signUp,
      logout,
      authError,
    }),
    [user, isHydrated, login, signUp, logout, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
