/**
 * Composant de carte de pricing
 */

import React from 'react';
import type { SubscriptionPlan } from '@/types';

interface PricingCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string;
  onSelect: (planType: string) => void;
  isLoading?: boolean;
  highlighted?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  currentPlan,
  onSelect,
  isLoading = false,
  highlighted = false,
}) => {
  const isCurrent = currentPlan === plan.planType;
  const isUnlimited = plan.planType === 'unlimited';

  // Extraire les features principales
  const features = plan.features;
  const featuresList = [
    {
      label: 'Utilisateurs',
      value: plan.maxUsers === -1 ? 'Illimité' : `${plan.maxUsers} utilisateur${plan.maxUsers > 1 ? 's' : ''}`,
    },
    {
      label: 'Objectifs annuels',
      value: plan.maxAmbitions === -1 ? 'Illimités' : `${plan.maxAmbitions} max`,
    },
    {
      label: 'Export PDF',
      value: features.export_pdf === 'basic' ? 'Basique' : 'Avancé',
    },
    {
      label: 'Support',
      value: features.support === 'community' ? 'Communautaire' : 
             features.support === 'email' ? 'Email' : 'Prioritaire',
    },
  ];

  // Features additionnelles
  const additionalFeatures: string[] = [];
  
  if (features.ai_coach_suggestions === -1) {
    additionalFeatures.push('IA coach illimitée');
  } else if (features.ai_coach_suggestions > 0) {
    additionalFeatures.push(`${features.ai_coach_suggestions} suggestions IA/mois`);
  }

  if (features.analytics === 'advanced') {
    additionalFeatures.push('Analytics avancés');
  } else if (features.analytics === 'basic') {
    additionalFeatures.push('Analytics basiques');
  }

  if (features.integrations === 'advanced') {
    additionalFeatures.push('Intégrations avancées');
  } else if (features.integrations === 'basic') {
    additionalFeatures.push('Intégrations basiques');
  }

  if (features.priority_support) {
    additionalFeatures.push('Support prioritaire');
  }

  if (features.roles_permissions) {
    additionalFeatures.push('Rôles & permissions');
  }

  if (features.quarterly_objectives_per_ambition === -1) {
    additionalFeatures.push('Objectifs trimestriels illimités');
  } else if (features.quarterly_objectives_per_ambition) {
    additionalFeatures.push(`${features.quarterly_objectives_per_ambition} objectif trimestriel/ambition`);
  }

  return (
    <div
      className={`
        relative rounded-2xl border-2 p-8 transition-all duration-300
        ${highlighted 
          ? 'border-blue-500 shadow-xl scale-105 bg-gradient-to-br from-blue-50 to-white' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white'
        }
        ${isCurrent ? 'ring-2 ring-green-500' : ''}
      `}
    >
      {/* Badge "Plan actuel" */}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Plan actuel
          </span>
        </div>
      )}

      {/* Badge "Populaire" */}
      {highlighted && !isCurrent && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Populaire
          </span>
        </div>
      )}

      {/* Nom du plan */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {plan.displayName}
        </h3>
        {plan.description && (
          <p className="text-sm text-gray-600">
            {plan.description}
          </p>
        )}
      </div>

      {/* Prix */}
      <div className="text-center mb-8">
        {plan.priceMonthly === 0 ? (
          <div className="text-4xl font-bold text-gray-900">
            Gratuit
          </div>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-900">
              {plan.priceMonthly}€
              <span className="text-lg font-normal text-gray-600">/mois</span>
            </div>
            {plan.priceYearly && (
              <div className="text-sm text-gray-600 mt-2">
                ou {plan.priceYearly}€/an
                <span className="text-green-600 font-semibold ml-1">
                  (économisez {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Features principales */}
      <div className="space-y-3 mb-6">
        {featuresList.map((feature, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{feature.label}</span>
            <span className="font-semibold text-gray-900">{feature.value}</span>
          </div>
        ))}
      </div>

      {/* Features additionnelles */}
      {additionalFeatures.length > 0 && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <ul className="space-y-2">
            {additionalFeatures.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bouton CTA */}
      {!isUnlimited && (
        <button
          onClick={() => onSelect(plan.planType)}
          disabled={isCurrent || isLoading}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
            ${isCurrent
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : highlighted
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-900 text-white hover:bg-gray-800'
            }
            ${isLoading ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Chargement...
            </span>
          ) : isCurrent ? (
            'Plan actuel'
          ) : currentPlan === 'free' ? (
            'Passer à ce plan'
          ) : (
            'Changer de plan'
          )}
        </button>
      )}

      {/* Note pour le plan Unlimited */}
      {isUnlimited && (
        <div className="text-center text-sm text-gray-600 italic">
          Plan spécial - Contactez-nous
        </div>
      )}
    </div>
  );
};

