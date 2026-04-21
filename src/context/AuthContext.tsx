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
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string | null;
};

const STORAGE_KEY = 'auth:user';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (args: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  let id: any;
  const timeout = new Promise<T>((_resolve, reject) => {
    id = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([Promise.resolve(p), timeout]).finally(() => clearTimeout(id));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadSupabaseUserAndProfile = useCallback(async () => {
    const { data, error } = await withTimeout(supabase.auth.getSession(), 10000, 'Session check');
    if (error) throw error;
    const u = data.session?.user ?? null;
    if (!u?.id || !u.email) {
      setProfile(null);
      return null;
    }

    const { data: p, error: pErr } = await withTimeout(
      supabase
        .from('profiles')
        .select('id,email,full_name,role,created_at')
        .eq('id', u.id)
        .maybeSingle(),
      10000,
      'Profile fetch',
    );
    if (pErr) {
      // Allow login even if profiles/RLS isn't set up yet.
      setProfile(null);
      const role = String((u.user_metadata as any)?.role ?? 'member') as UserRole;
      const name = String((u.user_metadata as any)?.full_name ?? u.email.split('@')[0] ?? 'User');
      return { id: u.id, email: u.email, name, role } satisfies User;
    }

    const role = (String((p as any)?.role ?? (u.user_metadata as any)?.role ?? 'member') as UserRole) ?? 'member';
    const name = String((p as any)?.full_name ?? (u.user_metadata as any)?.full_name ?? u.email.split('@')[0] ?? 'User');

    setProfile(
      p
        ? ({
            id: String((p as any).id),
            email: String((p as any).email),
            full_name: (p as any).full_name ?? null,
            role,
            created_at: (p as any).created_at ?? null,
          } satisfies Profile)
        : null,
    );

    return { id: u.id, email: u.email, name, role } satisfies User;
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const u = await loadSupabaseUserAndProfile();
        if (!mounted) return;
        setUser(u);
        if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        else await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        if (mounted) setLoading(false);
        if (mounted) setIsHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadSupabaseUserAndProfile]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      try {
        setLoading(true);
        const u = await loadSupabaseUserAndProfile();
        setUser(u);
        if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        else await AsyncStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadSupabaseUserAndProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const e = email.trim().toLowerCase();
    try {
      setLoading(true);
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email: e, password }),
        10000,
        'Login',
      );
      if (error) throw error;
      const u = await loadSupabaseUserAndProfile();
      setUser(u);
      if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setAuthError(msg);
      throw err instanceof Error ? err : new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [loadSupabaseUserAndProfile]);

  const signUp = useCallback(async (args: { fullName: string; email: string; password: string }) => {
    setAuthError(null);
    const fullName = args.fullName.trim();
    const email = args.email.trim().toLowerCase();
    if (!fullName) throw new Error('Please enter your name');
    if (args.password.length < 6) throw new Error('Password must be at least 6 characters');
    try {
      setLoading(true);
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password: args.password,
          options: { data: { full_name: fullName, role: 'member' } },
        }),
        10000,
        'Sign up',
      );
      if (error) throw error;
      if (data.session) {
        const u = await loadSupabaseUserAndProfile();
        setUser(u);
        if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setAuthError(msg);
      throw err instanceof Error ? err : new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [loadSupabaseUserAndProfile]);

  const logout = useCallback(async () => {
    setUser(null);
    setProfile(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
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
      profile,
      isAuthenticated: !!user,
      isHydrated,
      loading,
      login,
      signUp,
      logout,
      authError,
    }),
    [user, profile, isHydrated, loading, login, signUp, logout, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
