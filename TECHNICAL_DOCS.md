# Documentation Technique - OsKaR 🎯

Guide technique complet pour les développeurs travaillant sur OsKaR.

---

## 🏗️ Architecture Générale

### Stack Technologique
```
Frontend: Next.js 15.5.3 + React 19 + TypeScript
Styling: Tailwind CSS + Framer Motion
State: React Query + Zustand en mémoire (sans persistance auth)
Forms: React Hook Form + Zod validation
DnD: @dnd-kit (compatible React 19)
IA: Gemini via API interne Next.js
Export: jsPDF + SheetJS
Deploy: Netlify (mode serveur)
```

### Architecture des Données
```
Ambitions (multiples)
├── Key Results d'Ambition (multiples par ambition)
├── Objectifs Trimestriels (multiples par ambition)
│   ├── Key Results Trimestriels (multiples par objectif)
│   └── Actions (plan d'actions par objectif)
└── Kanban Unique (toutes les actions par statut)
```

---

## 📁 Structure du Projet

```
src/
├── components/
│   ├── ui/                 # Composants UI de base
│   │   ├── Button.tsx      # Bouton avec variants
│   │   ├── Card.tsx        # Conteneur principal
│   │   ├── Badge.tsx       # Étiquettes colorées
│   │   ├── HierarchicalTreeView.tsx  # Vue arborescente
│   │   ├── KanbanBoard.tsx           # Tableau Kanban
│   │   └── PyramidView.tsx           # Vue pyramidale
│   ├── canvas/             # Étapes du Canvas guidé
│   │   ├── AmbitionStep.tsx          # Multi-ambitions
│   │   ├── KeyResultsStep.tsx        # Multi-KR par ambition
│   │   ├── QuarterlyObjectivesStep.tsx # Objectifs trimestriels
│   │   └── ActionsStep.tsx           # Actions
│   ├── forms/              # Formulaires avec validation
│   └── layout/             # Mise en page
├── pages/                  # Pages Next.js
├── services/               # Logique métier
├── store/                  # State management Zustand
├── types/                  # Types TypeScript
├── utils/                  # Utilitaires
└── constants/              # Constantes et exemples
```

---

## 🔧 Services Principaux

### 1. App Store (`src/store/useAppStore.ts`)
État applicatif en mémoire pour l'UI et l'état de session courant.

```typescript
type AppStore = {
  user: User | null
  isAuthenticated: boolean
  setUser(user: User | null): void
}
```

### 2. AI Coach Service (`src/services/ai-coach.ts`)
Service d'IA pour validation et suggestions contextuelles.

```typescript
class AICoachService {
  validateAmbitionAsync(ambition: Partial<Ambition>): Promise<AIValidation>
  validateKeyResultAsync(keyResult: Partial<KeyResult>): Promise<AIValidation>
  validateQuarterlyObjectiveAsync(objective: Partial<QuarterlyObjective>): Promise<AIValidation>
}
```

### 3. Gemini Service (`src/services/gemini.ts`)
Client frontend vers l'API interne sécurisée.

```typescript
class GeminiService {
  isAvailable(): boolean
  generateAmbitionAdvice(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): Promise<string[]>
  generateKeyResultAdvice(keyResult: Partial<KeyResult>, companyProfile?: CompanyProfile): Promise<string[]>
  generateCompanyQuestions(existingProfile?: Partial<CompanyProfile>): Promise<string[]>
  generateQuarterRetrospective(input: QuarterRetrospectiveInput): Promise<string>
}
```

### 4. Analytics Service (`src/services/analytics.ts`)
Calculs de métriques et analytics.

```typescript
class AnalyticsService {
  calculateOverallProgress(): number
  calculateAmbitionProgress(ambitionId: string): number
  getProgressByCategory(): CategoryProgress[]
  generateInsights(): AnalyticsInsight[]
}
```

---

## 🗄️ State Management

### Store Principal (`src/store/useAppStore.ts`)
Store Zustand principal avec persistance.

```typescript
interface AppStore {
  // Données
  user: User | null
  ambitions: Ambition[]
  keyResults: KeyResult[]
  quarterlyObjectives: QuarterlyObjective[]
  quarterlyKeyResults: QuarterlyKeyResult[]
  actions: Action[]
  
  // Actions
  addAmbition: (ambition: Ambition) => void
  updateAmbition: (id: string, updates: Partial<Ambition>) => void
  deleteAmbition: (id: string) => void
  
  // Filtres
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
}
```

### Store Canvas (`src/store/useCanvasStore.ts`)
Store dédié au workflow du Canvas guidé.

```typescript
interface CanvasStore {
  currentStep: number
  completedSteps: number[]
  
  // Données temporaires du Canvas
  ambitionsData: AmbitionFormData[]
  keyResultsData: KeyResultFormData[]
  quarterlyObjectivesData: QuarterlyObjectiveFormData[]
  
  // Actions
  completeStep: (step: number) => void
  goToStep: (step: number) => void
  resetCanvas: () => void
}
```

---

## 🎨 Système de Design

### Couleurs Principales
```css
/* Tailwind CSS Custom Colors */
primary: {
  50: '#f0f9ff',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
}

success: {
  50: '#f0fdf4',
  500: '#10b981',
  600: '#059669',
}

warning: {
  50: '#fffbeb',
  500: '#f59e0b',
  600: '#d97706',
}

danger: {
  50: '#fef2f2',
  500: '#ef4444',
  600: '#dc2626',
}
```

### Composants UI

#### Button Component
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}
```

#### Badge Component
```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}
```

---

## 🔄 Workflow Canvas Guidé

### Étape 1 : Ambitions (`AmbitionStep.tsx`)
```typescript
// Gestion locale des ambitions multiples
const [ambitionsList, setAmbitionsList] = useState<AmbitionFormData[]>([])

// Alerte si > 3 ambitions
{ambitionsList.length > 3 && (
  <AlertMessage type="warning">
    Attention : Plus de 3 ambitions peuvent nuire au focus
  </AlertMessage>
)}

// Sauvegarde finale
const handleFinishStep = () => {
  ambitionsList.forEach(data => {
    const newAmbition = createAmbition(data)
    addAmbition(newAmbition)
  })
  completeStep(1)
}
```

### Étape 2 : Key Results (`KeyResultsStep.tsx`)
```typescript
// Sélection de l'ambition parente
const [selectedAmbitionId, setSelectedAmbitionId] = useState<string>('')

// Gestion des KR multiples par ambition
const [keyResultsList, setKeyResultsList] = useState<KeyResultFormData[]>([])

// Alerte si > 3 KR
{keyResultsList.length > 3 && (
  <AlertMessage type="warning">
    Recommandation : Maximum 3 KR par ambition
  </AlertMessage>
)}
```

### Étape 3 : Objectifs Trimestriels (`QuarterlyObjectivesStep.tsx`)
```typescript
// Objectifs multiples avec rattachement aux ambitions
const [quarterlyObjectivesData, setQuarterlyObjectivesData] = useState<QuarterlyObjectiveFormData[]>([])

// Système d'alerte intégré
{quarterlyObjectivesData.length > 3 && (
  <AlertMessage type="warning">
    Trop d'objectifs trimestriels (>{quarterlyObjectivesData.length})
  </AlertMessage>
)}
```

---

## 🎯 Intégration IA

### Configuration Gemini AI
```typescript
// .env.local
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

// Frontend -> API interne
await fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action, payload }),
})
```

### Profil d'Entreprise pour Contexte
```typescript
interface CompanyProfile {
  name: string
  industry: string
  size: CompanySize
  stage: CompanyStage
  mainChallenges: string[]
  currentGoals: string[]
  marketPosition: string
  targetMarket: string
  businessModel: string
}

// Utilisation dans les prompts IA
const buildContextualPrompt = (objective: any, profile: CompanyProfile) => {
  return `En tant qu'expert pour une ${profile.size} du secteur ${profile.industry}...`
}
```

### Fallback Gracieux
```typescript
const generateAdvice = async (ambition: Partial<Ambition>) => {
  try {
    return await geminiService.generateAmbitionAdvice(ambition)
  } catch (error) {
    return ['Clarifier la cible', 'Définir une métrique de succès']
  }
}
```

---

## 📊 Gestion des Données

### Types Principaux
```typescript
interface Ambition {
  id: string
  title: string
  description: string
  year: number
  category: AmbitionCategory
  priority: Priority
  status: Status
  createdAt: Date
  updatedAt: Date
}

interface KeyResult {
  id: string
  ambitionId: string
  title: string
  description: string
  target: number        // Nouvelle nomenclature
  current: number       // Nouvelle nomenclature
  unit: string
  deadline: Date
  priority: Priority
  status: Status
  createdAt: Date
  updatedAt: Date
}

interface QuarterlyObjective {
  id: string
  ambitionId: string
  title: string
  description: string
  quarter: Quarter
  year: number
  status: Status
  createdAt: Date
  updatedAt: Date
}

interface Action {
  id: string
  quarterlyObjectiveId: string
  title: string
  description?: string
  status: ActionStatus  // TODO | IN_PROGRESS | DONE
  priority: Priority
  labels: string[]
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}
```

### État applicatif et session
```typescript
// Source de vérité session : Supabase Auth
supabase.auth.onAuthStateChange((_event, session) => {
  useAppStore.getState().setUser(session?.user ?? null)
})

// Store UI en mémoire uniquement
const useAppStore = create<AppStore>()(
  devtools((set) => ({
    user: null,
    isAuthenticated: false,
  }))
)
```

---

## 🚀 Build et Déploiement

### Configuration Next.js
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### Scripts de Build
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Déploiement Netlify
```toml
# netlify.toml
[build]
  command = "echo 'Skipping build, using pre-built files'"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🧪 Tests et Qualité

### Configuration Jest
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Exemple de Test
```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')
  })
})
```

---

## 🔧 Outils de Développement

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📈 Performance et Optimisation

### Métriques Actuelles
- **First Load JS** : ~114 kB
- **Largest Page** : 554 kB (page rapports)
- **Build Time** : ~4 secondes
- **Deploy Time** : ~10 secondes

### Optimisations Appliquées
- **Code Splitting** : Automatique avec Next.js
- **Tree Shaking** : Suppression du code mort
- **Bundle Analysis** : Monitoring de la taille
- **Static Export** : Performance maximale

### Monitoring
```bash
# Analyse du bundle
npm run build
npx @next/bundle-analyzer

# Performance audit
npm run lighthouse
```

---

*Documentation mise à jour le : 26 décembre 2024*
