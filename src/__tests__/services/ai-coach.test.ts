import { aiCoachService } from '@/services/ai-coach';
import type { Ambition, KeyResult, OKR, Action } from '@/types';
import { AmbitionCategory } from '@/types';

describe('AICoachService', () => {
  describe('validateAmbition', () => {
    it('should validate a good ambition', () => {
      const ambition: Partial<Ambition> = {
        title: 'Doubler le chiffre d\'affaires de mon entreprise',
        description: 'Passer de 500K€ à 1M€ de CA annuel en développant de nouveaux marchés et en optimisant nos processus de vente',
      };

      const result = aiCoachService.validateAmbition(ambition);

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBeGreaterThan(70);
      expect(result.category).toBe('ambition');
      expect(result.validatedAt).toBeInstanceOf(Date);
    });

    it('should flag ambition with short title', () => {
      const ambition: Partial<Ambition> = {
        title: 'Vendre',
        description: 'Vendre plus de produits cette année pour augmenter les revenus',
      };

      const result = aiCoachService.validateAmbition(ambition);

      expect(result.confidence).toBeLessThan(100);
      expect(result.suggestions).toContain(
        expect.stringContaining('titre de l\'ambition devrait être plus descriptif')
      );
    });

    it('should flag ambition with short description', () => {
      const ambition: Partial<Ambition> = {
        title: 'Augmenter les ventes de produits',
        description: 'Vendre plus',
      };

      const result = aiCoachService.validateAmbition(ambition);

      expect(result.confidence).toBeLessThan(100);
      expect(result.suggestions).toContain(
        expect.stringContaining('description plus détaillée')
      );
    });

    it('should suggest action verbs when missing', () => {
      const ambition: Partial<Ambition> = {
        title: 'Chiffre d\'affaires de 1 million d\'euros',
        description: 'Avoir un chiffre d\'affaires de 1 million d\'euros cette année',
      };

      const result = aiCoachService.validateAmbition(ambition);

      expect(result.suggestions).toContain(
        expect.stringContaining('verbe d\'action')
      );
    });

    it('should suggest quantifiable elements when missing', () => {
      const ambition: Partial<Ambition> = {
        title: 'Améliorer la satisfaction client',
        description: 'Rendre nos clients plus heureux avec nos services',
      };

      const result = aiCoachService.validateAmbition(ambition);

      expect(result.suggestions).toContain(
        expect.stringContaining('élément quantifiable')
      );
    });
  });

  describe('validateKeyResult', () => {
    it('should validate a SMART key result', () => {
      const keyResult: Partial<KeyResult> = {
        title: 'Atteindre 1 million d\'euros de chiffre d\'affaires',
        description: 'Augmenter le CA de 500K€ à 1M€ en développant 3 nouveaux canaux de vente',
        target: 1000000,
        unit: '€',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Dans 1 an
      };

      const result = aiCoachService.validateKeyResult(keyResult);

      expect(result.isValid).toBe(true);
      expect(result.smartAnalysis.specific).toBe(true);
      expect(result.smartAnalysis.measurable).toBe(true);
      expect(result.smartAnalysis.timeBound).toBe(true);
      expect(result.smartAnalysis.score).toBeGreaterThan(60);
    });

    it('should flag non-specific key result', () => {
      const keyResult: Partial<KeyResult> = {
        title: 'Vendre',
        description: 'Plus',
        target: 100,
        unit: '€',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };

      const result = aiCoachService.validateKeyResult(keyResult);

      expect(result.smartAnalysis.specific).toBe(false);
      expect(result.suggestions).toContain(
        expect.stringContaining('spécifique')
      );
    });

    it('should flag non-measurable key result', () => {
      const keyResult: Partial<KeyResult> = {
        title: 'Améliorer la satisfaction client',
        description: 'Rendre les clients plus heureux avec nos services',
        target: 0,
        unit: '',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };

      const result = aiCoachService.validateKeyResult(keyResult);

      expect(result.smartAnalysis.measurable).toBe(false);
      expect(result.suggestions).toContain(
        expect.stringContaining('métriques précises')
      );
    });

    it('should flag key result without deadline', () => {
      const keyResult: Partial<KeyResult> = {
        title: 'Atteindre 1 million d\'euros de chiffre d\'affaires',
        description: 'Augmenter le CA significativement',
        target: 1000000,
        unit: '€',
      };

      const result = aiCoachService.validateKeyResult(keyResult);

      expect(result.smartAnalysis.timeBound).toBe(false);
      expect(result.suggestions).toContain(
        expect.stringContaining('date limite')
      );
    });

    it('should warn about unrealistic targets', () => {
      const keyResult: Partial<KeyResult> = {
        title: 'Atteindre 100 millions d\'euros de chiffre d\'affaires',
        description: 'Objectif très ambitieux pour cette année',
        target: 100000000,
        unit: '€',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };

      const result = aiCoachService.validateKeyResult(keyResult);

      expect(result.smartAnalysis.achievable).toBe(false);
      expect(result.warnings).toContain(
        expect.stringContaining('très ambitieux')
      );
    });
  });

  describe('validateOKR', () => {
    it('should validate a well-structured OKR', () => {
      const okr: Partial<OKR> = {
        objective: 'Accélérer la croissance du chiffre d\'affaires au T1',
        keyResults: [
          {
            id: '1',
            title: 'Atteindre 250K€ de CA',
            target: 250000,
            current: 0,
            unit: '€',
            weight: 50,
          },
          {
            id: '2',
            title: 'Acquérir 100 nouveaux clients',
            target: 100,
            current: 0,
            unit: 'clients',
            weight: 50,
          },
        ],
      };

      const result = aiCoachService.validateOKR(okr);

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBeGreaterThan(70);
    });

    it('should flag OKR with vague objective', () => {
      const okr: Partial<OKR> = {
        objective: 'Vendre',
        keyResults: [
          {
            id: '1',
            title: 'CA',
            target: 100,
            current: 0,
            unit: '€',
            weight: 100,
          },
        ],
      };

      const result = aiCoachService.validateOKR(okr);

      expect(result.suggestions).toContain(
        expect.stringContaining('objectif devrait être plus détaillé')
      );
    });

    it('should flag OKR without key results', () => {
      const okr: Partial<OKR> = {
        objective: 'Accélérer la croissance du chiffre d\'affaires',
        keyResults: [],
      };

      const result = aiCoachService.validateOKR(okr);

      expect(result.suggestions).toContain(
        expect.stringContaining('au moins un résultat clé')
      );
    });

    it('should warn about too many key results', () => {
      const okr: Partial<OKR> = {
        objective: 'Accélérer la croissance',
        keyResults: Array.from({ length: 7 }, (_, i) => ({
          id: i.toString(),
          title: `KR ${i + 1}`,
          target: 100,
          current: 0,
          unit: 'unités',
          weight: Math.round(100 / 7),
        })),
      };

      const result = aiCoachService.validateOKR(okr);

      expect(result.warnings).toContain(
        expect.stringContaining('3-5 résultats clés')
      );
    });

    it('should check weight consistency', () => {
      const okr: Partial<OKR> = {
        objective: 'Accélérer la croissance',
        keyResults: [
          {
            id: '1',
            title: 'KR 1',
            target: 100,
            current: 0,
            unit: 'unités',
            weight: 30,
          },
          {
            id: '2',
            title: 'KR 2',
            target: 100,
            current: 0,
            unit: 'unités',
            weight: 30,
          },
        ],
      };

      const result = aiCoachService.validateOKR(okr);

      expect(result.suggestions).toContain(
        expect.stringContaining('somme des poids')
      );
    });
  });

  describe('validateAction', () => {
    it('should validate a well-defined action', () => {
      const action: Partial<Action> = {
        title: 'Lancer une campagne marketing digitale',
        description: 'Créer et déployer une campagne sur les réseaux sociaux pour augmenter la notoriété',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
      };

      const result = aiCoachService.validateAction(action);

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBeGreaterThan(70);
    });

    it('should flag action with short title', () => {
      const action: Partial<Action> = {
        title: 'Faire',
        description: 'Faire quelque chose d\'important',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const result = aiCoachService.validateAction(action);

      expect(result.suggestions).toContain(
        expect.stringContaining('titre de l\'action devrait être plus descriptif')
      );
    });

    it('should flag action without deadline', () => {
      const action: Partial<Action> = {
        title: 'Lancer une campagne marketing',
        description: 'Créer une campagne pour promouvoir nos produits',
      };

      const result = aiCoachService.validateAction(action);

      expect(result.suggestions).toContain(
        expect.stringContaining('date limite')
      );
    });

    it('should warn about past deadline', () => {
      const action: Partial<Action> = {
        title: 'Lancer une campagne marketing',
        description: 'Créer une campagne pour promouvoir nos produits',
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
      };

      const result = aiCoachService.validateAction(action);

      expect(result.warnings).toContain(
        expect.stringContaining('date limite est dans le passé')
      );
    });
  });

  describe('generateSuggestions', () => {
    it('should generate revenue-specific suggestions', () => {
      const suggestions = aiCoachService.generateSuggestions(AmbitionCategory.REVENUE, 'chiffre d\'affaires');

      expect(suggestions).toContain(
        expect.stringContaining('sources de revenus')
      );
      expect(suggestions).toContain(
        expect.stringContaining('pricing')
      );
    });

    it('should generate growth-specific suggestions', () => {
      const suggestions = aiCoachService.generateSuggestions(AmbitionCategory.GROWTH, 'croissance');

      expect(suggestions).toContain(
        expect.stringContaining('métriques de croissance')
      );
      expect(suggestions).toContain(
        expect.stringContaining('acquisition client')
      );
    });

    it('should generate product-specific suggestions', () => {
      const suggestions = aiCoachService.generateSuggestions(AmbitionCategory.PRODUCT, 'produit');

      expect(suggestions).toContain(
        expect.stringContaining('feedbacks utilisateurs')
      );
      expect(suggestions).toContain(
        expect.stringContaining('MVP')
      );
    });
  });

  describe('getProgressMessage', () => {
    it('should return encouraging message for high progress', () => {
      const message = aiCoachService.getProgressMessage(95);

      expect(message).toContain('Excellent');
    });

    it('should return motivating message for medium progress', () => {
      const message = aiCoachService.getProgressMessage(60);

      expect(message).toContain('bonne voie');
    });

    it('should return concerning message for low progress', () => {
      const message = aiCoachService.getProgressMessage(25);

      expect(message).toContain('ralentissement');
    });
  });

  describe('analyzeSentiment', () => {
    it('should detect positive sentiment', () => {
      const sentiment = aiCoachService.analyzeSentiment('Excellent travail, parfait résultat !');

      expect(sentiment).toBe('positive');
    });

    it('should detect negative sentiment', () => {
      const sentiment = aiCoachService.analyzeSentiment('C\'est difficile, beaucoup de problèmes');

      expect(sentiment).toBe('negative');
    });

    it('should detect neutral sentiment', () => {
      const sentiment = aiCoachService.analyzeSentiment('Voici le rapport mensuel');

      expect(sentiment).toBe('neutral');
    });
  });
});
