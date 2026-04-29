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
import { AppState } from 'react-native';
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
const ADMIN_DIRECTORY_KEY = 'adminDirectory:v1';
const DEV_FAKE_ADMIN_EMAIL = 'admin@fake.local';
const DEV_FAKE_ADMIN_PASSWORD = 'admin';
const DEV_FAKE_ADMIN_ID = 'dev-admin';

const DEV_FAKE_MEMBER_EMAIL = 'member@demo.local';
const DEV_FAKE_MEMBER_PASSWORD = 'demo';
const DEV_FAKE_MEMBER_ID = 'dev-member';

const DEV_FAKE_TRAINER_EMAIL = 'trainer@demo.local';
const DEV_FAKE_TRAINER_PASSWORD = 'demo';
const DEV_FAKE_TRAINER_ID = 'dev-trainer';

const DEV_FAKE_USER_IDS = new Set([DEV_FAKE_ADMIN_ID, DEV_FAKE_MEMBER_ID, DEV_FAKE_TRAINER_ID]);

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (args: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
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

  const isDevFakeUser = useCallback(
    (u: User | null) => (u ? DEV_FAKE_USER_IDS.has(u.id) : false),
    [],
  );

  const loadSupabaseUserAndProfile = useCallback(async () => {
    // `getSession()` can be stale right after sign-in; `getUser()` is authoritative.
    const { data, error } = await withTimeout(supabase.auth.getUser(), 10000, 'User fetch');
    if (error) throw error;
    const u = data.user ?? null;
    if (!u?.id || !u.email) {
      setProfile(null);
      return null;
    }

    const fetchById = () =>
      supabase
        .from('profiles')
        .select('id,email,full_name,role,created_at')
        .eq('id', u.id)
        .maybeSingle();

    const fetchByEmail = () =>
      supabase
        .from('profiles')
        .select('id,email,full_name,role,created_at')
        .eq('email', u.email)
        .maybeSingle();

    let { data: p, error: pErr } = await withTimeout(fetchById(), 10000, 'Profile fetch');

    // If the row exists but ids don't match for some reason, retry by email.
    if (!p && !pErr) {
      ({ data: p, error: pErr } = await withTimeout(fetchByEmail(), 10000, 'Profile fetch'));
    }

    if (pErr) {
      // Allow login even if profiles/RLS isn't set up yet.
      setProfile(null);
      const role = String((u.user_metadata as any)?.role ?? 'member') as UserRole;
      const name = String((u.user_metadata as any)?.full_name ?? u.email.split('@')[0] ?? 'User');
      return { id: u.id, email: u.email, name, role } satisfies User;
    }

    const role = (String((p as any)?.role ?? (u.user_metadata as any)?.role ?? 'member') as UserRole) ?? 'member';
    const name = String(
      (p as any)?.full_name ?? (u.user_metadata as any)?.full_name ?? u.email.split('@')[0] ?? 'User',
    );

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

  const refreshProfile = useCallback(async () => {
    // Dev-only fake demo session is local; don't let Supabase overwrite it.
    if (isDevFakeUser(user)) return;
    try {
      setLoading(true);
      const u = await loadSupabaseUserAndProfile();
      setUser(u);
      if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isDevFakeUser, loadSupabaseUserAndProfile, user]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        // Dev convenience: when you scan the Expo QR code, always start at Login
        // (prevents a previously persisted session from immediately skipping Login).
        if (__DEV__) {
          try {
            await withTimeout(supabase.auth.signOut(), 5000, 'Sign out');
          } catch {
            // ignore
          }
          await AsyncStorage.removeItem(STORAGE_KEY);
          setProfile(null);
          setUser(null);
          return;
        }

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
    // If an admin changes a user's role server-side, Supabase won't emit an auth event.
    // Refresh on app foreground so role changes take effect without reinstalling.
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') refreshProfile();
    });
    return () => sub.remove();
  }, [refreshProfile]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      try {
        // Dev-only fake demo session is local; ignore Supabase auth events.
        if (isDevFakeUser(user)) return;
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
  }, [isDevFakeUser, loadSupabaseUserAndProfile, user]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const e = email.trim().toLowerCase();
    try {
      setLoading(true);

      // Dev convenience: local fake demo logins (bypass Supabase).
      if (__DEV__ && e === DEV_FAKE_MEMBER_EMAIL && password === DEV_FAKE_MEMBER_PASSWORD) {
        const fake: User = {
          id: DEV_FAKE_MEMBER_ID,
          email: DEV_FAKE_MEMBER_EMAIL,
          name: 'Demo Member',
          role: 'member',
        };
        setProfile({
          id: fake.id,
          email: fake.email,
          full_name: fake.name,
          role: fake.role,
          created_at: null,
        });
        setUser(fake);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fake));
        return;
      }
      if (__DEV__ && e === DEV_FAKE_TRAINER_EMAIL && password === DEV_FAKE_TRAINER_PASSWORD) {
        try {
          const raw = await AsyncStorage.getItem(ADMIN_DIRECTORY_KEY);
          const parsed = raw ? (JSON.parse(raw) as any) : null;
          const active = parsed?.people?.[DEV_FAKE_TRAINER_ID]?.active;
          if (active === false) {
            setAuthError('This trainer account is inactive.');
            return;
          }
        } catch {
          // ignore
        }
        const fake: User = {
          id: DEV_FAKE_TRAINER_ID,
          email: DEV_FAKE_TRAINER_EMAIL,
          name: 'Demo Trainer',
          role: 'trainer',
        };
        setProfile({
          id: fake.id,
          email: fake.email,
          full_name: fake.name,
          role: fake.role,
          created_at: null,
        });
        setUser(fake);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fake));
        return;
      }
      if (__DEV__ && e === DEV_FAKE_ADMIN_EMAIL && password === DEV_FAKE_ADMIN_PASSWORD) {
        const fake: User = {
          id: DEV_FAKE_ADMIN_ID,
          email: DEV_FAKE_ADMIN_EMAIL,
          name: 'Dev Admin',
          role: 'admin',
        };
        setProfile({
          id: fake.id,
          email: fake.email,
          full_name: fake.name,
          role: fake.role,
          created_at: null,
        });
        setUser(fake);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fake));
        return;
      }

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
      refreshProfile,
      authError,
    }),
    [user, profile, isHydrated, loading, login, signUp, logout, refreshProfile, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
