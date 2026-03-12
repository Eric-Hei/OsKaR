import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { QueryProvider } from '@/providers/QueryProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
import { useToastStore } from '@/hooks/useToast';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { toasts, removeToast } = useToastStore();

  // Initialiser l'authentification Supabase
  // Source unique de vérité : onAuthStateChange (émet INITIAL_SESSION au montage)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let mounted = true;

    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        useAppStore.getState().logout();
        return;
      }

      // INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
      if (session?.user) {
        try {
          const result = await AuthService.getCurrentUser();
          if (mounted && result?.profile) {
            const user = AuthService.profileToUser(result.profile);
            useAppStore.getState().setUser(user);
          }
        } catch (error) {
          console.error('❌ Erreur lors du chargement du profil:', error);
        }
      } else if (event === 'INITIAL_SESSION') {
        // Pas de session au démarrage → nettoyer l'état si nécessaire
        if (useAppStore.getState().user) {
          useAppStore.getState().logout();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </QueryProvider>
    </ErrorBoundary>
  );
}
