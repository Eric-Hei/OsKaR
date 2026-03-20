import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface QueryProviderProps {
  children: ReactNode;
}

// Détection d'erreur d'authentification Supabase
function isAuthError(error: any): boolean {
  return (
    error?.message?.includes('JWT') ||
    error?.code === 'PGRST301' ||
    error?.message?.includes('Auth session missing')
  );
}

// Éviter les redirections multiples
let isRedirecting = false;

/** Réinitialiser le verrou de redirection (appelé quand l'utilisateur se reconnecte) */
export function resetAuthRedirectLock() {
  isRedirecting = false;
}

/**
 * Sur erreur de session → signOut + redirection login (pas de reload)
 */
function handleQueryError(error: any) {
  if (isAuthError(error) && !isRedirecting) {
    isRedirecting = true;
    console.warn('⚠️ Erreur de session détectée, redirection vers login...');
    supabase.auth.signOut().finally(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?error=session_expired';
      }
    });
  }
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleQueryError }),
        mutationCache: new MutationCache({ onError: handleQueryError }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              if (isAuthError(error)) return false;
              return failureCount < 1;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: (failureCount, error: any) => {
              if (isAuthError(error)) return false;
              return failureCount < 1;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

