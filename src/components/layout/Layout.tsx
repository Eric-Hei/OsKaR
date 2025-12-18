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
  const { user } = useAppStore();

  // Note: L'authentification est gérée ici quand requireAuth est activé
  // Si après un délai il n'y a toujours pas d'utilisateur, rediriger vers login
  useEffect(() => {
    // Ne rien faire si requireAuth n'est pas activé
    if (!requireAuth) return;

    // Si l'utilisateur est connecté
    if (user) {
      // Vérifier l'onboarding
      if (!user.companyProfile && !skipOnboarding && router.pathname !== '/onboarding') {
        router.push('/onboarding');
      }
      return;
    }

    // Si pas d'utilisateur, attendre un peu pour l'initialisation de l'auth
    // puis rediriger vers login
    const timeoutId = setTimeout(() => {
      if (!user && requireAuth) {
        console.log('🔄 Redirection vers login (pas de session après timeout)');
        router.push('/auth/login');
      }
    }, 2000); // 2 secondes de grâce pour l'initialisation

    return () => clearTimeout(timeoutId);
  }, [requireAuth, user, skipOnboarding, router]);


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
