# Configuration et Tests de l'API Gemini

## Architecture actuelle

L'intégration Gemini est désormais sécurisée selon le schéma suivant :

1. le **frontend** appelle `POST /api/gemini`
2. la route `src/pages/api/gemini.ts` exécute le SDK Gemini **côté serveur uniquement**
3. la clé privée est lue via `GEMINI_API_KEY`
4. le navigateur ne voit jamais la clé réelle

## Variables d'environnement

Dans `.env.local` :

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

## Contrat applicatif

### Route API interne
- **URL** : `/api/gemini`
- **Méthode** : `POST`
- **Body** : `{ action, payload }`
- **Actions supportées** :
  - `generate-ambition-advice`
  - `generate-key-result-advice`
  - `generate-company-questions`
  - `generate-quarter-retrospective`

### Réponses attendues
- `200` : `{ result: ... }`
- `400` : requête invalide
- `503` : Gemini non configuré
- `502` : erreur amont / modèle / authentification, avec message assaini

## Tests disponibles

### 1. Test serveur direct

```bash
npm run test:gemini
```

Ce script vérifie :
- la présence de `GEMINI_API_KEY`
- l'accès au modèle configuré
- la capacité à générer une réponse réelle

### 2. Test unitaire du client frontend

```bash
npm test -- src/__tests__/services/gemini.test.ts
```

Ce test valide :
- le contrat `fetch('/api/gemini')`
- les payloads envoyés
- la propagation des erreurs assainies
- le fallback sur message par défaut en cas de réponse invalide

### 3. Validation applicative

```bash
npm run dev
```

Puis vérifier dans l'application :
- création / édition d'ambition avec suggestions IA
- conseils sur les key results
- questions de profil d'entreprise
- rétrospective trimestrielle

## Configuration production

### Netlify

Variables à définir :

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

## Sécurité

- ne jamais utiliser `NEXT_PUBLIC_GEMINI_API_KEY`
- ne jamais journaliser la clé
- rotater la clé si elle a déjà été exposée
- purger les artefacts locaux générés après incident (`out/`, `.netlify/`)

## Commandes utiles

```bash
npm run test:gemini
npm test -- src/__tests__/services/gemini.test.ts
npm run type-check
npm run build
```

