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
  const { user, setUser, logout } = useAppStore();
  const { toasts, removeToast } = useToastStore();

  // Nettoyer les sessions corrompues (migration v1.4.3)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const MIGRATION_KEY = 'oskar_migration_v1.4.3';
    const migrationDone = localStorage.getItem(MIGRATION_KEY);

    if (!migrationDone) {
      console.log('🔄 Migration v1.4.3 : Nettoyage des sessions corrompues...');

      // Nettoyer les anciennes clés de store
      localStorage.removeItem('oskar-app-store');
      localStorage.removeItem('app-store');
      localStorage.removeItem('okarina-store');

      // Marquer la migration comme effectuée
      localStorage.setItem(MIGRATION_KEY, 'done');
      console.log('✅ Migration v1.4.3 terminée');
    }
  }, []);

  // Initialiser l'authentification Supabase
  useEffect(() => {
    // Ne pas initialiser l'auth si Supabase n'est pas configuré
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase non configuré, authentification désactivée');
      return;
    }

    let mounted = true;

    const handleSession = async (session: any) => {
      if (!mounted) return;

      if (session?.user) {
        console.log('🔐 Session active trouvée pour:', session.user.email);
        try {
          // On récupère le profil complet via le service
          const result = await AuthService.getCurrentUser();
          if (mounted && result && result.profile) {
            const user = AuthService.profileToUser(result.profile);
            setUser(user);
            console.log('✅ Utilisateur chargé et défini dans le store');
          }
        } catch (error) {
          console.error('❌ Erreur lors du chargement du profil:', error);
        }
      } else {
        console.log('ℹ️ Aucune session active');
        // IMPORTANT: Nettoyer l'état utilisateur s'il y a des données périmées
        // Cela évite que le loader tourne indéfiniment sur les pages protégées
        // On utilise getState() pour éviter le problème de stale closure
        const currentUser = useAppStore.getState().user;
        if (currentUser) {
          console.log('🧹 Nettoyage de l\'état utilisateur périmé');
          logout();
        }
      }
    };



    // 1. Écouter les changements d'état (incluant INITIAL_SESSION)
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);

      if (event === 'INITIAL_SESSION') {
        // Géré par le listener, mais on peut aussi le traiter ici si besoin
        await handleSession(session);
      } else if (event === 'SIGNED_IN' && session) {
        await handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Déconnexion détectée');
        logout();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token rafraîchi');
      } else if (event === 'USER_UPDATED') {
        console.log('👤 Utilisateur mis à jour');
        await handleSession(session);
      }
    });

    // 2. Vérification initiale manuelle (au cas où le listener INITIAL_SESSION ne trigger pas assez vite)
    // C'est une sécurité supplémentaire
    AuthService.getSession().then(session => {
      if (mounted) {
        // Toujours appeler handleSession, même si session est null
        // Cela permet de nettoyer l'état utilisateur périmé
        handleSession(session);
      }
    });


    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, logout]);



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
