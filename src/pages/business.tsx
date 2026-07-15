import React from 'react';
import { ComingSoon } from '@/components/layout/ComingSoon';

export default function BusinessPage() {
  return (
    <ComingSoon
      title="OsKaR Business"
      tagline="Structurez votre modèle économique et vos leviers de rentabilité pour piloter une croissance durable."
      features={[
        'Business model canvas guidé',
        'Suivi des indicateurs financiers clés',
        'Modélisation des scénarios de revenus',
        'Connexion avec vos objectifs OKR',
      ]}
    />
  );
}
