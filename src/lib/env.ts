import Constants from 'expo-constants';

type Extra = {
  API_BASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

function extra(): Extra {
  const cfg = Constants.expoConfig ?? Constants.manifest;
  return (cfg as any)?.extra ?? {};
}

export const ENV = {
  API_BASE_URL: extra().API_BASE_URL ?? '',
  SUPABASE_URL: extra().SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: extra().SUPABASE_ANON_KEY ?? '',
} as const;

