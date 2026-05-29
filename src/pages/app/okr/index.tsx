import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Target,
  ListChecks,
  CheckSquare,
  LayoutDashboard,
  CalendarCheck,
  Repeat,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthModal } from '@/components/layout/AuthModal';
import { useAppStore } from '@/store/useAppStore';

/** Destination de l'espace de travail OKR (compte requis). */
const OKR_WORKSPACE = '/app/okr/dashboard';

/** Étapes de la méthode OKR (hiérarchie portée du PRD). */
const STEPS = [
  { icon: Target, t: 'Ambitions annuelles', d: 'Définissez 1 à 3 ambitions structurantes pour l’année.' },
  { icon: ListChecks, t: 'Key Results', d: 'Rendez chaque ambition mesurable avec des résultats clés.' },
  { icon: CalendarCheck, t: 'Objectifs trimestriels', d: 'Déclinez vos ambitions en objectifs par trimestre.' },
  { icon: CheckSquare, t: 'Actions & Kanban', d: 'Pilotez l’exécution au quotidien, du « à faire » au « terminé ».' },
];

/** Fonctionnalités du module (existantes dans l'app). */
const FEATURES = [
  { icon: Sparkles, t: 'Canvas guidé par l’IA', d: 'Créez vos ambitions, KR et actions avec des suggestions contextuelles.' },
  { icon: LayoutDashboard, t: 'Dashboard temps réel', d: 'Suivez la progression globale, par ambition et par trimestre.' },
  { icon: CheckSquare, t: 'Kanban des actions', d: 'Glissez-déposez vos actions entre À faire, En cours et Terminé.' },
  { icon: CalendarCheck, t: 'Check-in hebdomadaire', d: 'Une revue courte et guidée pour débloquer les KR en retard.' },
  { icon: Repeat, t: 'Rétrospective trimestrielle', d: 'Analysez réussites et blocages, préparez le trimestre suivant.' },
  { icon: Activity, t: 'Health score OKR', d: 'Repérez les résultats clés à risque avant qu’il ne soit trop tard.' },
];

const OkrHomePage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');

  const openAuth = (tab: 'login' | 'register' = 'register') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  /** « Aller plus loin » : espace OKR si connecté, sinon création de compte. */
  const goFurther = (tab: 'login' | 'register' = 'register') => {
    if (isAuthenticated) {
      router.push(OKR_WORKSPACE);
    } else {
      openAuth(tab);
    }
  };

  return (
    <AppShell
      title="OsKaR OKR"
      topbarTitle="OSKAR OKR"
      topbarSubtitle="Alignez stratégie et exécution"
      topbarActions={
        isAuthenticated ? (
          <button
            onClick={() => router.push(OKR_WORKSPACE)}
            className="px-5 py-2.5 bg-teal text-navy-dark text-sm font-bold rounded-lg shadow-sm hover:bg-teal-dark hover:-translate-y-0.5 transition-all"
          >
            Accéder à mon espace →
          </button>
        ) : (
          <>
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 text-sm font-semibold text-navy hover:text-navy-light transition-colors"
            >
              Connexion
            </button>
            <button
              onClick={() => openAuth('register')}
              className="px-5 py-2.5 bg-teal text-navy-dark text-sm font-bold rounded-lg shadow-sm hover:bg-teal-dark hover:-translate-y-0.5 transition-all"
            >
              Créer mon compte →
            </button>
          </>
        )
      }
    >
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-navy-dark rounded-[24px] mb-12 p-10 lg:p-16 text-white shadow-card"
        aria-labelledby="okr-hero-title"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase text-teal mb-4">
              Pilier 04 · Exécution
            </span>
            <h1 id="okr-hero-title" className="text-4xl lg:text-5xl font-extrabold leading-[1.15] mb-6">
              Transformez vos ambitions en <span className="text-teal">résultats mesurables.</span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              OSKAR OKR structure votre exécution : des ambitions claires, des résultats clés mesurables,
              des objectifs trimestriels et un plan d’actions piloté au quotidien.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => goFurther('register')}
                className="px-8 py-4 bg-teal text-navy-dark font-bold rounded-xl shadow-lg hover:bg-teal-dark hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                {isAuthenticated ? 'Accéder à mon espace OKR' : 'Créer mon compte pour démarrer'}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </button>
              <button
                onClick={() => router.push('/diagnostic')}
                className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all"
              >
                Refaire mon bilan
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-teal/10 rounded-full blur-[100px]" aria-hidden />
      </section>

      {/* Comment ça marche */}
      <section className="mb-20" aria-labelledby="okr-steps-title">
        <div className="flex items-center gap-3 mb-10">
          <Layers className="h-5 w-5 text-teal-dark" aria-hidden />
          <h2 id="okr-steps-title" className="text-xl font-bold text-navy uppercase tracking-wider">
            La méthode OSKAR OKR
          </h2>
        </div>
        <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <li key={step.t} className="bg-white p-7 rounded-2xl border border-line shadow-card relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 bg-navy text-white rounded-xl flex items-center justify-center">
                  <step.icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="text-2xl font-black text-line">{idx + 1}</span>
              </div>
              <h3 className="font-bold text-navy mb-1.5">{step.t}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Fonctionnalités */}
      <section className="mb-20" aria-labelledby="okr-features-title">
        <h2 id="okr-features-title" className="text-xl font-bold text-navy mb-10 text-center uppercase tracking-wider">
          Tout pour piloter votre exécution
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((item) => (
            <div key={item.t} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-line shadow-card">
              <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-teal-dark" aria-hidden />
              </div>
              <div>
                <h3 className="font-bold text-navy text-sm mb-1">{item.t}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-navy rounded-[32px] p-10 lg:p-16 text-center text-white shadow-card mb-12" aria-labelledby="okr-cta-title">
        <Target className="h-12 w-12 text-teal mx-auto mb-6 opacity-80" aria-hidden />
        <h2 id="okr-cta-title" className="text-3xl font-extrabold mb-4">
          {isAuthenticated ? 'Reprenez le pilotage de vos objectifs' : 'Pour aller plus loin, créez votre compte'}
        </h2>
        <p className="text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
          {isAuthenticated
            ? 'Accédez à votre espace OKR pour créer vos ambitions, suivre vos résultats clés et piloter vos actions.'
            : 'Le bilan reste gratuit et sans inscription. Pour construire et suivre vos OKR, un compte est nécessaire.'}
        </p>
        <button
          onClick={() => goFurther('register')}
          className="px-10 py-5 bg-teal text-navy-dark font-black rounded-xl shadow-lg hover:bg-teal-dark hover:-translate-y-1 transition-all text-sm uppercase tracking-wider"
        >
          {isAuthenticated ? 'Accéder à mon espace OKR →' : 'Créer mon compte →'}
        </button>
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} redirectTo={OKR_WORKSPACE} />
    </AppShell>
  );
};

export default OkrHomePage;
