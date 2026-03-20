import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieBanner } from '@/components/ui/CookieBanner';
import { NotificationContainer } from '@/components/ui/Notification';
import { useAppStore } from '@/store/useAppStore';
import { APP_CONFIG } from '@/constants';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
  skipOnboarding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  requireAuth = false,
  skipOnboarding = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, authReady } = useAppStore();

  // Authentification : attendre que Supabase ait terminé l'initialisation
  // (INITIAL_SESSION reçu) avant de décider de rediriger
  useEffect(() => {
    if (!requireAuth) return;

    // Tant que l'auth n'est pas prête, ne rien faire
    if (!authReady) return;

    // Auth prête : vérifier l'utilisateur
    if (user) {
      // Vérifier l'onboarding
      if (!user.companyProfile && !skipOnboarding && router.pathname !== '/onboarding') {
        router.push('/onboarding');
      }
      return;
    }

    // Auth prête mais pas d'utilisateur → rediriger vers login
    console.log('🔄 Redirection vers login (pas de session après initialisation auth)');
    router.push('/auth/login');
  }, [requireAuth, user, authReady, skipOnboarding, router]);


  const pageTitle = title ? `${title} - ${APP_CONFIG.name}` : APP_CONFIG.name;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description || APP_CONFIG.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
        <CookieBanner />
        <NotificationContainer />
      </div>
    </>
  );
};

export { Layout };
export default Layout;
