/**
 * Configuration Stripe (côté serveur)
 * 
 * Ce fichier sera utilisé dans les API routes Next.js
 * pour gérer les paiements et webhooks Stripe
 */

// import Stripe from 'stripe';

/**
 * Instance Stripe côté serveur
 * 
 * À décommenter une fois Stripe installé et configuré
 */
/*
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
*/

/**
 * Vérifier si Stripe est configuré côté serveur
 */
export const isStripeServerConfigured = (): boolean => {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET;
};

/**
 * Configuration des produits Stripe
 * 
 * Ces IDs seront générés après la création des produits dans Stripe Dashboard
 */
export const STRIPE_PRODUCTS = {
  pro: {
    name: 'OsKaR Pro',
    description: '5 utilisateurs, objectifs annuels illimités, IA coach illimitée',
    prices: {
      monthly: {
        amount: 1900, // en centimes (19€)
        currency: 'eur',
        interval: 'month' as const,
        priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
      },
      yearly: {
        amount: 19000, // en centimes (190€ = 15.83€/mois)
        currency: 'eur',
        interval: 'year' as const,
        priceId: process.env.STRIPE_PRICE_PRO_YEARLY || '',
      },
    },
  },
  team: {
    name: 'OsKaR Team',
    description: '20 utilisateurs, analytics avancés, support prioritaire',
    prices: {
      monthly: {
        amount: 4900, // en centimes (49€)
        currency: 'eur',
        interval: 'month' as const,
        priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY || '',
      },
      yearly: {
        amount: 49000, // en centimes (490€ = 40.83€/mois)
        currency: 'eur',
        interval: 'year' as const,
        priceId: process.env.STRIPE_PRICE_TEAM_YEARLY || '',
      },
    },
  },
};

/**
 * Créer une session de checkout Stripe
 * 
 * @param userId - ID de l'utilisateur
 * @param planType - Type de plan (pro ou team)
 * @param billingCycle - Cycle de facturation (monthly ou yearly)
 * @returns URL de la session de checkout
 */
export const createCheckoutSession = async (
  userId: string,
  planType: 'pro' | 'team',
  billingCycle: 'monthly' | 'yearly'
): Promise<string | null> => {
  if (!isStripeServerConfigured()) {
    console.warn('⚠️ Stripe non configuré côté serveur');
    return null;
  }

  // TODO: Implémenter la création de session Stripe
  // Une fois que stripe sera installé et configuré
  
  /*
  const product = STRIPE_PRODUCTS[planType];
  const price = product.prices[billingCycle];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: price.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription&success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    client_reference_id: userId,
    metadata: {
      userId,
      planType,
      billingCycle,
    },
  });

  return session.url;
  */

  return null;
};

/**
 * Créer un portail de gestion d'abonnement
 * 
 * @param customerId - ID client Stripe
 * @returns URL du portail
 */
export const createBillingPortalSession = async (
  customerId: string
): Promise<string | null> => {
  if (!isStripeServerConfigured()) {
    console.warn('⚠️ Stripe non configuré côté serveur');
    return null;
  }

  // TODO: Implémenter la création de portail Stripe
  
  /*
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription`,
  });

  return session.url;
  */

  return null;
};

/**
 * Vérifier la signature du webhook Stripe
 * 
 * @param payload - Corps de la requête
 * @param signature - Signature Stripe
 * @returns Événement Stripe vérifié
 */
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
): any | null => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET non configuré');
    return null;
  }

  // TODO: Implémenter la vérification de signature
  
  /*
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    console.error('❌ Erreur de vérification webhook:', err);
    return null;
  }
  */

  return null;
};

