import React from 'react';
import { ComingSoon } from '@/components/layout/ComingSoon';

export default function VisionPage() {
  return (
    <ComingSoon
      title="OsKaR Vision"
      tagline="Clarifiez la raison d'être, la mission et le cap à long terme de votre organisation pour aligner toutes vos décisions."
      features={[
        'Formalisation de la mission et des valeurs',
        'Définition de la vision à 3-5 ans',
        'Cartographie des parties prenantes',
        'Alignement avec vos objectifs OKR',
      ]}
    />
  );
}
