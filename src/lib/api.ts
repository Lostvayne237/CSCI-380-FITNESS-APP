import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from './env';
import type { UserRole } from '../context/AuthContext';

const TOKEN_KEY = 'auth:token';

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  access_token?: string;
  user?: Partial<ApiUser>;
  data?: { user?: Partial<ApiUser> };
};

function baseUrl() {
  return (ENV.API_BASE_URL || '').replace(/\/+$/, '');
}

async function request(path: string, opts: RequestInit & { json?: any } = {}) {
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers as any),
  };
  if (opts.json !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: any = opts.body;
  if (opts.json !== undefined) body = JSON.stringify(opts.json);

  const res = await fetch(url, { ...opts, headers, body });

  const text = await res.text();
  const json = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = formatErrorMessage(json, text, res.status);
    throw new Error(`${msg} (HTTP ${res.status} on ${path})`);
  }
  return json;
}

function formatErrorMessage(json: any, text: string, status: number): string {
  if (json) {
    const raw = json.error ?? json.message ?? json.detail ?? json;
    // FastAPI 422 often returns detail: [{loc: [...], msg: "...", type: "..."}]
    if (Array.isArray(json.detail)) {
      const first = json.detail[0];
      if (first?.loc && first?.msg) {
        const loc = Array.isArray(first.loc) ? first.loc.join('.') : String(first.loc);
        return `${loc}: ${first.msg}`;
      }
      return JSON.stringify(json.detail);
    }
    if (typeof raw === 'string') return raw;
    try {
      return JSON.stringify(raw);
    } catch {
      return String(raw);
    }
  }
  return text || `Request failed (${status})`;
}

async function requestForm(
  path: string,
  form: Record<string, string>,
  opts: Omit<RequestInit, 'body' | 'headers'> & { method: string } = { method: 'POST' },
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(form)) params.append(k, v);
  return request(path, {
    ...opts,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
}

async function requestWithFallback(paths: string[], opts: RequestInit & { json?: any } = {}) {
  let lastErr: unknown = null;
  for (const p of paths) {
    try {
      return await request(p, opts);
    } catch (e) {
      lastErr = e;
      // If it's not a 404-ish error, don't keep guessing.
      const msg = e instanceof Error ? e.message : '';
      const isNotFound = msg.toLowerCase().includes('not found') || msg.includes('404');
      if (!isNotFound) break;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Request failed');
}

async function requestWithFallbackBodies(
  path: string,
  bodies: any[],
  opts: Omit<RequestInit, 'body'> & { method: string },
) {
  let lastErr: unknown = null;
  for (const body of bodies) {
    try {
      return await request(path, { ...opts, json: body });
    } catch (e) {
      lastErr = e;
      // Keep trying on validation errors (422), stop on anything else (like 500)
      const msg = e instanceof Error ? e.message : '';
      const keepGoing = msg.includes('HTTP 422');
      if (!keepGoing) break;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Request failed');
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function pickToken(r: AuthResponse): string | null {
  return r.token || r.accessToken || r.jwt || r.access_token || null;
}

function normalizeUser(u: any): ApiUser | null {
  if (!u) return null;
  const id = String(u.id ?? u.userId ?? u._id ?? '');
  const email = String(u.email ?? '');
  const name = String(u.name ?? u.fullName ?? u.username ?? '');
  const role = (u.role ?? 'member') as UserRole;
  if (!id || !email) return null;
  return { id, email, name: name || email.split('@')[0] || 'User', role };
}

export const api = {
  hasBaseUrl() {
    return !!baseUrl();
  },

  async login(args: { email: string; password: string }) {
    // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded with "username" + "password"
    const username = args.email.trim();
    const password = args.password;

    // Prefer the known FastAPI paths first.
    try {
      const r = (await requestForm('/users/login', { username, password }, { method: 'POST' })) as AuthResponse;
      const token = pickToken(r);
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
      // Some backends only return a token here; fetch /me if needed.
      const user = normalizeUser((r as any).user ?? (r as any).data?.user) ?? (token ? await api.me() : null);
      if (token && user) return { token, user };
    } catch (e) {
      // fall through to other guesses
    }

    try {
      const r = (await requestForm('/api/users/login', { username, password }, { method: 'POST' })) as AuthResponse;
      const token = pickToken(r);
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
      const user = normalizeUser((r as any).user ?? (r as any).data?.user) ?? (token ? await api.me() : null);
      if (token && user) return { token, user };
    } catch (e) {
      // fall through
    }

    // Generic JSON login fallback for other backends.
    const r = (await requestWithFallback(
      [
        '/auth/login',
        '/auth/signin',
        '/auth/sign-in',
        '/login',
        '/signin',
        '/sign-in',
        '/api/auth/login',
        '/api/auth/signin',
        '/api/login',
        '/api/signin',
        '/api/v1/auth/login',
        '/api/v1/login',
      ],
      { method: 'POST', json: { email: args.email, password: args.password } },
    )) as AuthResponse;
    const token = pickToken(r);
    const user = normalizeUser((r as any).user ?? (r as any).data?.user);
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    if (token && user) return { token, user };

    // Fallback: fetch /me if server returns only a token
    if (token) {
      const me = await api.me();
      return { token, user: me };
    }
    throw new Error('Login failed (missing token/user)');
  },

  async register(args: { name: string; email: string; password: string; role: Exclude<UserRole, 'admin'> }) {
    const registerPaths = [
      '/users/register',
      '/api/users/register',
      '/auth/register',
      '/auth/signup',
      '/auth/sign-up',
      '/register',
      '/signup',
      '/sign-up',
      '/users',
      '/users/signup',
      '/api/auth/register',
      '/api/auth/signup',
      '/api/register',
      '/api/signup',
      '/api/users',
      '/api/users/signup',
      '/api/v1/auth/register',
      '/api/v1/auth/signup',
      '/api/v1/register',
    ];

    const usernameFromEmail = args.email.split('@')[0] || args.email;

    // Try common request-body shapes (FastAPI often uses snake_case).
    const bodies = [
      args,
      { email: args.email, username: usernameFromEmail, password: args.password },
      { email: args.email, username: args.email, password: args.password },
      { name: args.name, email: args.email, password: args.password },
      { full_name: args.name, email: args.email, password: args.password, role: args.role },
      { full_name: args.name, email: args.email, password: args.password },
      { username: args.email, password: args.password, name: args.name, role: args.role },
      { username: args.email, password: args.password, full_name: args.name, role: args.role },
    ];

    // First: find the correct route (404 fallbacks). Then: try body fallbacks on that route.
    const r = (await (async () => {
      let lastErr: unknown = null;
      for (const p of registerPaths) {
        try {
          return (await requestWithFallbackBodies(p, bodies, { method: 'POST' })) as AuthResponse;
        } catch (e) {
          lastErr = e;
          const msg = e instanceof Error ? e.message : '';
          const isNotFound = msg.toLowerCase().includes('not found') || msg.includes('404');
          if (!isNotFound) throw e;
        }
      }
      throw lastErr instanceof Error ? lastErr : new Error('Register failed');
    })()) as AuthResponse;

    const token = pickToken(r);
    const user = normalizeUser(r.user ?? r.data?.user);
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    if (user) return { token, user };
    if (token) {
      const me = await api.me();
      return { token, user: me };
    }
    // Some APIs return 201 with no body; treat as success but require login
    return { token: null, user: null };
  },

  async me(): Promise<ApiUser> {
    const r = (await requestWithFallback(
      ['/auth/me', '/me', '/api/auth/me', '/api/me', '/api/v1/auth/me', '/api/v1/me'],
      { method: 'GET' },
    )) as any;
    const user = normalizeUser(r.user ?? r.data?.user ?? r);
    if (!user) throw new Error('Failed to load user profile');
    return user;
  },

  async logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};

