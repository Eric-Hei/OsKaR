import type { Ambition, CompanyProfile, KeyResult } from '@/types';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash-exp';

export type GeminiAction =
  | 'generate-ambition-advice'
  | 'generate-key-result-advice'
  | 'generate-company-questions'
  | 'generate-quarter-retrospective';

export interface GenerateAmbitionAdvicePayload {
  ambition: Partial<Ambition>;
  companyProfile?: CompanyProfile;
}

export interface GenerateKeyResultAdvicePayload {
  keyResult: Partial<KeyResult>;
  companyProfile?: CompanyProfile;
}

export interface GenerateCompanyQuestionsPayload {
  existingProfile?: Partial<CompanyProfile>;
}

export interface QuarterRetrospectiveInput {
  quarterName: string;
  year: number;
  keyResults: Array<Partial<KeyResult>>;
  actionsDone: number;
  actionsTotal: number;
  companyProfile?: CompanyProfile;
}

export interface GeminiPayloadMap {
  'generate-ambition-advice': GenerateAmbitionAdvicePayload;
  'generate-key-result-advice': GenerateKeyResultAdvicePayload;
  'generate-company-questions': GenerateCompanyQuestionsPayload;
  'generate-quarter-retrospective': QuarterRetrospectiveInput;
}

export function buildQuarterRetrospectivePrompt(input: QuarterRetrospectiveInput): string {
  const { quarterName, year, keyResults, actionsDone, actionsTotal, companyProfile } = input;
  const krLines = (keyResults || []).slice(0, 8).map((kr, index) =>
    `- KR${index + 1}: ${kr.title || 'Sans titre'} | Cible: ${kr.target ?? '-'} ${kr.unit ?? ''} | Actuel: ${kr.current ?? '-'} | Échéance: ${kr.deadline ? new Date(kr.deadline).toLocaleDateString() : '-'}`
  );
  const execRate = actionsTotal > 0 ? Math.round((actionsDone / actionsTotal) * 100) : 0;

  let prompt = `En tant que coach OKR senior, rédige une rétrospective concise et actionnable du trimestre ${quarterName} ${year}.

Contexte:
- Taux d'exécution des actions: ${execRate}% (${actionsDone}/${actionsTotal})
- Résultats clés suivis:
${krLines.join('\n')}`;

  if (companyProfile) {
    prompt += `\n\nProfil entreprise (optionnel): ${companyProfile.industry || ''}, taille ${companyProfile.size || ''}, stade ${companyProfile.stage || ''}`;
  }

  prompt += `

FORMAT DE RÉPONSE:
1) Résumé exécutif (3-4 phrases max)
2) Réussites majeures (3 puces)
3) Blocages/risques (3 puces)
4) Priorités du prochain trimestre (3-5 puces, SMART et concrètes)

Style: clair, concret, sans jargon, en français. Pas d'introduction ni de conclusion hors sections.`;

  return prompt;
}

export function buildAmbitionPrompt(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): string {
  let prompt = `En tant qu'expert en stratégie d'entreprise et coach en OKR, analysez cette ambition et donnez EXACTEMENT 5 conseils concrets pour l'améliorer.

Ambition : "${ambition.title || 'Non définie'}"
Description : "${ambition.description || 'Non définie'}"
Catégorie : ${ambition.category || 'Non définie'}`;

  if (companyProfile) {
    prompt += `

Contexte entreprise :
- Nom : ${companyProfile.name}
- Secteur : ${companyProfile.industry}
- Taille : ${companyProfile.size}
- Stade : ${companyProfile.stage}
- Défis principaux : ${companyProfile.mainChallenges?.join(', ') || 'Non définis'}
- Marché cible : ${companyProfile.targetMarket || 'Non défini'}`;
  }

  prompt += `

FORMAT DE RÉPONSE OBLIGATOIRE :
Répondez UNIQUEMENT avec une liste numérotée de 5 conseils, sans introduction ni conclusion.
Chaque conseil doit suivre ce format exact :

1. **[Titre du conseil]** : [Action concrète en 1-2 phrases maximum]
2. **[Titre du conseil]** : [Action concrète en 1-2 phrases maximum]
...

Concentrez-vous sur :
- La clarté et la mesurabilité de l'ambition
- L'alignement avec le contexte business
- La faisabilité et les risques
- Les métriques de succès
- Les étapes clés pour l'atteindre

NE PAS inclure d'analyse préliminaire, de justification détaillée ou de conclusion. UNIQUEMENT les 5 conseils au format demandé.`;

  return prompt;
}

export function buildKeyResultPrompt(keyResult: Partial<KeyResult>, companyProfile?: CompanyProfile): string {
  let prompt = `En tant qu'expert en OKR, analysez ce résultat clé selon les critères SMART et donnez 3-5 conseils d'amélioration :

Résultat clé : "${keyResult.title || 'Non défini'}"
Description : "${keyResult.description || 'Non définie'}"
Valeur cible : ${keyResult.target || 'Non définie'}
Unité : ${keyResult.unit || 'Non définie'}
Échéance : ${keyResult.deadline ? new Date(keyResult.deadline).toLocaleDateString() : 'Non définie'}`;

  if (companyProfile) {
    prompt += `

Contexte entreprise :
- Secteur : ${companyProfile.industry}
- Taille : ${companyProfile.size}
- Stade : ${companyProfile.stage}`;
  }

  prompt += `

Évaluez selon les critères SMART et donnez des conseils pour :
1. Spécificité (Specific)
2. Mesurabilité (Measurable)
3. Atteignabilité (Achievable)
4. Pertinence (Relevant)
5. Temporalité (Time-bound)

Répondez sous forme de liste numérotée avec des conseils concrets.`;

  return prompt;
}

export function buildCompanyQuestionsPrompt(existingProfile?: Partial<CompanyProfile>): string {
  let prompt = `En tant qu'expert en stratégie d'entreprise, générez 5 questions pertinentes pour mieux comprendre le contexte business d'un entrepreneur.`;

  if (existingProfile) {
    prompt += `

Informations déjà connues :
- Nom : ${existingProfile.name || 'Non défini'}
- Secteur : ${existingProfile.industry || 'Non défini'}
- Taille : ${existingProfile.size || 'Non définie'}
- Stade : ${existingProfile.stage || 'Non défini'}
- Défis : ${existingProfile.mainChallenges?.join(', ') || 'Non définis'}

Générez des questions complémentaires qui ne répètent pas ces informations.`;
  }

  prompt += `

Les questions doivent être :
1. Ouvertes et engageantes
2. Orientées business et stratégie
3. Utiles pour personnaliser les conseils OKR
4. Adaptées au contexte entrepreneurial français
5. Formulées de manière professionnelle mais accessible

Répondez uniquement avec une liste numérotée de 5 questions, sans introduction ni conclusion.`;

  return prompt;
}

function cleanAdviceText(text: string): string {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  return normalizedText.length > 250 ? `${normalizedText.substring(0, 250)}...` : normalizedText;
}

export function parseAdviceResponse(text: string): string[] {
  const advice: string[] = [];
  const lines = text.split('\n');
  let currentAdvice = '';
  let currentTitle = '';

  const pushCurrentAdvice = () => {
    if (currentTitle && currentAdvice) {
      advice.push(`${currentTitle} : ${cleanAdviceText(currentAdvice)}`);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const adviceMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*:\s*(.*)$/);

    if (adviceMatch) {
      pushCurrentAdvice();
      currentTitle = adviceMatch[2].trim();
      currentAdvice = adviceMatch[3].trim();
    } else if (currentTitle && line && !line.match(/^\d+\./)) {
      currentAdvice += ` ${line}`;
    }
  }

  pushCurrentAdvice();

  if (advice.length === 0) {
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (/^\d+\./.test(line)) {
        const cleaned = line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
        advice.push(cleanAdviceText(cleaned));
      }
    }
  }

  return advice.length > 0 ? advice : [text.trim()];
}

export function parseQuestionsResponse(text: string): string[] {
  const lines = text.split('\n').filter((line) => line.trim());
  const questions: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^\d+\./.test(line) || line.includes('?')) {
      questions.push(line.replace(/^\d+\.\s*/, ''));
    }
  }

  return questions.length > 0 ? questions : [text.trim()];
}