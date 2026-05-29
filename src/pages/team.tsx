import React from 'react';
import { ComingSoon } from '@/components/layout/ComingSoon';

export default function TeamPillarPage() {
  return (
    <ComingSoon
      title="OsKaR Team"
      tagline="Alignez, animez et faites grandir vos équipes autour de vos objectifs communs."
      features={[
        'Cartographie des rôles et responsabilités',
        'Rituels d\u2019équipe et feedback continu',
        'Suivi de l\u2019engagement collaborateur',
        'Alignement individuel sur les OKR',
      ]}
    />
  );
}
