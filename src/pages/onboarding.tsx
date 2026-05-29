import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Building2, Sparkles, Layers, LogOut, User as UserIcon } from 'lucide-react';
import Head from 'next/head';
import { CompanyProfileForm } from '@/components/ui/CompanyProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import type { CompanyProfile } from '@/types';

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, authReady, profileReady, updateCompanyProfile, setUser, logout } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attendre la résolution auth/profil avant de décider quoi faire
  useEffect(() => {
    if (!authReady) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Rediriger vers l'espace OKR si l'utilisateur a déjà un profil d'entreprise
    if (profileReady && user?.companyProfile) {
      router.push('/app/okr/dashboard');
    }
  }, [authReady, isAuthenticated, profileReady, user, router]);

  if (!authReady || (isAuthenticated && (!user || !profileReady))) {
    return (
      <>
        <Head><title>Bienvenue dans OsKaR</title></Head>
        <div className="min-h-screen bg-surface flex items-center justify-center px-4 font-sans">
          <div className="text-center" role="status">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mx-auto mb-4"></div>
            <p className="text-muted">Préparation de votre espace...</p>
          </div>
        </div>
      </>
    );
  }

  const handleCompanyProfileSubmit = async (companyProfile: CompanyProfile) => {
    setIsSaving(true);
    setError(null);

    try {
      // Sauvegarder dans Supabase si configuré
      if (isSupabaseConfigured() && user?.id) {
        console.log('💾 Sauvegarde du profil d\'entreprise dans Supabase...');
        console.log('📊 Données à sauvegarder:', companyProfile);
        console.log('👤 User ID:', user.id);

        const updatedProfile = await AuthService.updateCompanyProfile(user.id, companyProfile);

        console.log('✅ Profil mis à jour:', updatedProfile);

        // Mettre à jour l'utilisateur avec le profil complet
        const updatedUser = AuthService.profileToUser(updatedProfile);
        setUser(updatedUser);

        console.log('✅ Profil d\'entreprise sauvegardé dans Supabase');
      } else {
        // Fallback localStorage si Supabase non configuré
        console.log('💾 Sauvegarde du profil d\'entreprise dans localStorage...');
        console.log('⚠️ User ID:', user?.id);
        console.log('⚠️ Supabase configuré:', isSupabaseConfigured());
        updateCompanyProfile(companyProfile);
      }

      console.log('🔄 Redirection vers /app/okr/dashboard...');
      router.push('/app/okr/dashboard');
    } catch (err: any) {
      console.error('❌ Erreur lors de la sauvegarde du profil:', err);
      console.error('❌ Message d\'erreur:', err.message);
      console.error('❌ Détails:', err);
      setError(`Erreur: ${err.message || 'Une erreur est survenue lors de la sauvegarde.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured()) await AuthService.signOut();
    } finally {
      logout();
      router.push('/');
    }
  };

  const topbarActions = (
    <>
      <span className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-navy">
        <span className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center">
          <UserIcon className="h-4 w-4" aria-hidden />
        </span>
        <span className="max-w-[140px] truncate">{user?.name ?? 'Mon compte'}</span>
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Déconnexion
      </button>
    </>
  );

  const footerItem = {
    href: '/auth/login',
    label: 'Déconnexion',
    icon: LogOut,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      handleLogout();
    },
  };

  return (
    <AppShell
      title="Profil entreprise"
      description="Configurez le profil de votre entreprise pour personnaliser OSKAR."
      topbarTitle="Bienvenue sur OSKAR"
      topbarSubtitle="Configuration de votre profil entreprise"
      topbarActions={topbarActions}
      sections={[]}
      footerItem={footerItem}
    >
      {/* En-tête de bienvenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center gap-4">
          <div className="bg-navy rounded-2xl p-3.5 shrink-0">
            <Building2 className="h-8 w-8 text-teal" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-navy">
              Configurons votre espace
            </h1>
            <p className="text-muted mt-1 max-w-2xl">
              Ce profil d'entreprise est utilisé par les{' '}
              <strong className="text-navy">5 piliers</strong> d'OSKAR pour personnaliser vos
              recommandations. Vous ne le renseignez qu'une seule fois.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Formulaire de profil d'entreprise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <CompanyProfileForm
          onSubmit={handleCompanyProfileSubmit}
          isLoading={isSaving}
          error={error}
        />
      </motion.div>

      {/* Avantages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center text-navy">
              <div className="bg-teal/10 rounded-lg p-2 mr-3">
                <Layers className="h-5 w-5 text-teal-dark" aria-hidden />
              </div>
              Une seule configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Renseigné ici, votre profil alimente l'ensemble des piliers : Vision, Fit, Business,
              OKR et Team.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center text-navy">
              <div className="bg-navy/10 rounded-lg p-2 mr-3">
                <Sparkles className="h-5 w-5 text-navy" aria-hidden />
              </div>
              Conseils personnalisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              L'IA adapte ses recommandations selon votre secteur, votre taille et vos défis
              spécifiques.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center text-navy">
              <div className="bg-teal/10 rounded-lg p-2 mr-3">
                <Building2 className="h-5 w-5 text-teal-dark" aria-hidden />
              </div>
              Prêt en quelques minutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Quelques informations suffisent pour démarrer. Vous pourrez modifier ce profil à tout
              moment.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
};

export default OnboardingPage;
