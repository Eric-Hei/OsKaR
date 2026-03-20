import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidHttpUrl(url?: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const hasEnv = Boolean(supabaseAnonKey && isValidHttpUrl(supabaseUrl));

if (!hasEnv) {
  console.warn('⚠️ Supabase non configuré (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants ou invalides).');
}

// Client Supabase avec typage TypeScript

// Mock pour quand Supabase n'est pas configuré
const createMockSupabase = () => {
  const notConfiguredError = { message: 'Supabase non configuré', code: 'NOT_CONFIGURED' };
  const mockAuthResponse = { data: { user: null, session: null }, error: notConfiguredError };

  return {
    auth: {
      signUp: async () => mockAuthResponse,
      signInWithPassword: async () => mockAuthResponse,
      signInWithOAuth: async () => ({ data: { url: null, provider: null }, error: notConfiguredError }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      resetPasswordForEmail: async () => ({ error: notConfiguredError }),
      updateUser: async () => ({ data: { user: null }, error: notConfiguredError }),
      refreshSession: async () => ({ data: { session: null }, error: notConfiguredError }),
      onAuthStateChange: (callback: any) => {
        // Appeler le callback avec INITIAL_SESSION et pas de session
        setTimeout(() => callback('INITIAL_SESSION', null), 0);
        return { data: { subscription: { unsubscribe: () => { } } } };
      },
    },
    from: () => ({
      select: () => ({ data: [], error: null, single: () => ({ data: null, error: notConfiguredError }) }),
      insert: () => ({ data: null, error: notConfiguredError, select: () => ({ single: () => ({ data: null, error: notConfiguredError }) }) }),
      update: () => ({ data: null, error: notConfiguredError, eq: () => ({ select: () => ({ single: () => ({ data: null, error: notConfiguredError }) }) }) }),
      delete: () => ({ error: notConfiguredError, eq: () => ({ error: notConfiguredError }) }),
    }),
    rpc: async () => ({ data: null, error: notConfiguredError }),
  } as any;
};

export const supabase = hasEnv
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string)
  : createMockSupabase();

// Helper pour vérifier si Supabase est configuré
export const isSupabaseConfigured = (): boolean => hasEnv;

// Helper pour obtenir l'utilisateur courant
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
  return user;
};

// Helper pour obtenir la session courante
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
  return session;
};

