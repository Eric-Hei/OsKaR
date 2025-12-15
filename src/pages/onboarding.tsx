import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Target, ArrowRight, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CompanyProfileForm } from '@/components/ui/CompanyProfileForm';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import type { CompanyProfile } from '@/types';

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const { user, updateCompanyProfile, setUser } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rediriger vers l'inscription si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      router.push('/auth/register');
      return;
    }
    // Rediriger vers le dashboard si l'utilisateur a déjà un profil d'entreprise
    if (user.companyProfile) {
      router.push('/dashboard');
    }
  }, [user, router]);

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

      console.log('🔄 Redirection vers /dashboard...');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Erreur lors de la sauvegarde du profil:', err);
      console.error('❌ Message d\'erreur:', err.message);
      console.error('❌ Détails:', err);
      setError(`Erreur: ${err.message || 'Une erreur est survenue lors de la sauvegarde.'}`);
    } finally {
      setIsSaving(false);
    }
  };



  const steps = [
    {
      number: 1,
      title: 'Profil Entreprise',
      description: 'Parlez-nous de votre entreprise',
      status: 'current' as 'current' | 'completed' | 'upcoming',
    },
    {
      number: 2,
      title: 'Première Ambition',
      description: 'Définissez votre premier objectif',
      status: 'upcoming' as 'current' | 'completed' | 'upcoming',
    },
    {
      number: 3,
      title: 'Découverte',
      description: 'Explorez toutes les fonctionnalités',
      status: 'upcoming' as 'current' | 'completed' | 'upcoming',
    },
  ];

  return (
    <Layout title="Bienvenue dans OsKaR" skipOnboarding>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête de bienvenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4">
                <Target className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue dans OsKaR ! 🎯
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformez vos ambitions en résultats concrets grâce à notre approche guidée 
              et à votre coach IA personnalisé.
            </p>
          </motion.div>

          {/* Étapes du processus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex justify-center">
              <div className="flex items-center space-x-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.status === 'current'
                            ? 'bg-blue-600 text-white'
                            : step.status === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium text-gray-900">{step.title}</p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-gray-400 mt-[-2rem]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Formulaire de profil d'entreprise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  Conseils Personnalisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Votre coach IA adapte ses conseils selon votre secteur, 
                  taille d'entreprise et défis spécifiques.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <div className="bg-green-100 rounded-lg p-2 mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  Méthode Éprouvée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Suivez notre processus en 5 étapes basé sur les meilleures 
                  pratiques des OKR et de la gestion d'objectifs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <div className="bg-purple-100 rounded-lg p-2 mr-3">
                    <ArrowRight className="h-5 w-5 text-purple-600" />
                  </div>
                  Résultats Concrets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Transformez vos ambitions en actions quotidiennes 
                  mesurables et atteignables.
                </p>
              </CardContent>
            </Card>
          </motion.div>


        </div>
      </div>
    </Layout>
  );
};

export default OnboardingPage;
