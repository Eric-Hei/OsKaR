# Tests de l'API Gemini

Ce document décrit la stratégie de test de l'intégration Gemini sécurisée d'OsKaR.

## Vue d'ensemble

L'application n'appelle plus Gemini directement depuis le navigateur.

Le flux testé est désormais :

1. `src/services/gemini.ts` appelle `/api/gemini`
2. `src/pages/api/gemini.ts` appelle Gemini côté serveur
3. la clé privée provient de `GEMINI_API_KEY`

## Configuration

Créer `.env.local` avec :

```bash
GEMINI_API_KEY=votre_cle_api_ici
GEMINI_MODEL=gemini-2.0-flash-exp
```

Vérifications rapides :

```bash
ls -la .env.local
cat .env.local | grep GEMINI_API_KEY
```

## Tests disponibles

### 1. Test rapide serveur

```bash
npm run test:gemini
```

Valide :
- la présence de la clé privée
- l'initialisation du modèle
- une génération réelle côté Node.js

### 2. Test unitaire du client

```bash
npm test -- src/__tests__/services/gemini.test.ts
```

Valide :
- le `POST /api/gemini`
- les actions et payloads envoyés
- les messages d'erreur assainis
- le fallback sur message par défaut si la réponse est invalide

### 3. Vérification dans l'application

```bash
npm run dev
```

Parcours recommandé :
- créer une ambition dans le canvas
- vérifier les conseils IA
- compléter / modifier un profil d'entreprise
- tester une rétrospective trimestrielle

## Interprétation des résultats

### Succès attendu
- `npm run test:gemini` termine sans erreur
- le test Jest Gemini passe
- l'UI affiche soit une réponse Gemini, soit un message de fallback propre

### Erreurs courantes

#### `503` - service non configuré
- `GEMINI_API_KEY` absent
- corriger `.env.local` ou les variables Netlify

#### `502` - erreur amont / modèle / auth
- clé invalide
- modèle indisponible
- erreur fournisseur Gemini

#### Message par défaut côté frontend
- la route a répondu avec un JSON invalide ou sans `result`
- vérifier les logs serveur locaux

## Dépannage

### L'IA ne répond pas dans l'application
1. vérifier que le serveur Next.js a été redémarré après modification de `.env.local`
2. vérifier `GEMINI_API_KEY`
3. exécuter `npm run test:gemini`
4. vérifier l'appel réseau `POST /api/gemini`

### Le test Jest échoue
1. relancer uniquement `src/__tests__/services/gemini.test.ts`
2. vérifier que `global.fetch` est mocké dans `jest.setup.js`
3. vérifier le contrat `{ action, payload }`

## Bonnes pratiques

- ne jamais réintroduire `NEXT_PUBLIC_GEMINI_API_KEY`
- ne jamais afficher la clé dans les logs
- garder les messages utilisateur assainis
- tester `jest` + `type-check` + `build` avant déploiement

