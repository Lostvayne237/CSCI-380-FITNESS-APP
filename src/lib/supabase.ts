import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

export const supabase =
  ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY
    ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

