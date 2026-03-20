import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { QueryProvider, resetAuthRedirectLock } from '@/providers/QueryProvider';
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

      const store = useAppStore.getState();

      if (event === 'SIGNED_OUT') {
        store.logout();
        // Marquer authReady même en déconnexion
        if (!store.authReady) store.setAuthReady();
        return;
      }

      // INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
      if (event === 'SIGNED_IN') {
        // L'utilisateur vient de se (re)connecter → réinitialiser le verrou de redirection
        resetAuthRedirectLock();
      }

      if (session?.user) {
        try {
          const result = await AuthService.getCurrentUser();
          if (mounted && result?.profile) {
            const user = AuthService.profileToUser(result.profile);
            useAppStore.getState().setUser(user);
          } else if (mounted) {
            // Session présente mais profil introuvable → marquer authReady quand même
            useAppStore.getState().setAuthReady();
          }
        } catch (error) {
          console.error('❌ Erreur lors du chargement du profil:', error);
          if (mounted) useAppStore.getState().setAuthReady();
        }
      } else if (event === 'INITIAL_SESSION') {
        // Pas de session au démarrage → nettoyer l'état si nécessaire
        if (store.user) {
          store.logout();
        }
        // Signaler que l'initialisation auth est terminée
        store.setAuthReady();
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
