import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { Building2, ArrowLeft } from 'lucide-react';
import { CompanyProfileForm } from '@/components/ui/CompanyProfileForm';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import type { CompanyProfile } from '@/types';

const CompanyProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, authReady, isAuthenticated, updateCompanyProfile } = useAppStore();

  useEffect(() => {
    if (authReady && !isAuthenticated) router.push('/auth/login');
  }, [authReady, isAuthenticated, router]);

  const handleCompanyProfileSubmit = (companyProfile: CompanyProfile) => {
    updateCompanyProfile(companyProfile);
    router.push('/app/okr/dashboard');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head><title>Profil d'Entreprise — OsKaR</title></Head>
      <div className="min-h-screen bg-surface py-8 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Retour
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="bg-teal/10 rounded-lg p-3">
                    <Building2 className="h-6 w-6 text-teal-dark" aria-hidden />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-navy">
                      Profil d'Entreprise
                    </h1>
                    <p className="text-muted">
                      Modifiez les informations de votre entreprise
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <CompanyProfileForm
              initialData={user?.companyProfile}
              onSubmit={handleCompanyProfileSubmit}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CompanyProfilePage;
