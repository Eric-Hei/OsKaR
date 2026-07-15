import React from 'react';
import { ComingSoon } from '@/components/layout/ComingSoon';

export default function FitPage() {
  return (
    <ComingSoon
      title="OsKaR Fit"
      tagline="Évaluez l'adéquation entre votre offre et votre marché pour accélérer votre croissance en toute confiance."
      features={[
        'Analyse du product-market fit',
        'Segmentation et personas clients',
        'Indicateurs de traction',
        'Recommandations IA personnalisées',
      ]}
    />
  );
}
