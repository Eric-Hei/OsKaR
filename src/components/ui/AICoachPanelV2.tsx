import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { aiCoachService } from '@/services/ai-coach';
import { AISuggestionsPanel } from '@/components/canvas/AISuggestionsPanel';
import { useAppStore } from '@/store/useAppStore';
import type { AIValidation, Ambition, KeyResult, CompanyProfile } from '@/types';

interface AICoachPanelV2Props {
  type: 'ambition' | 'keyResult' | 'okr' | 'action';
  data: any;
  onValidationChange?: (validation: AIValidation) => void;
  className?: string;
}

export const AICoachPanelV2: React.FC<AICoachPanelV2Props> = ({
  type,
  data,
  onValidationChange,
  className = '',
}) => {
  const [validation, setValidation] = useState<AIValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastValidatedData, setLastValidatedData] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoValidate, setAutoValidate] = useState(true);
  const { user } = useAppStore();

  // Fonction pour valider les données avec l'IA
  const validateWithAI = async () => {
    if (!data || isLoading) return;

    setIsLoading(true);
    try {
      let result: AIValidation;

      switch (type) {
        case 'ambition':
          result = await aiCoachService.validateAmbitionAsync(data, user?.companyProfile);
          break;
        case 'keyResult':
          result = await aiCoachService.validateKeyResultAsync(data, user?.companyProfile);
          break;
        default:
          result = {
            isValid: true,
            confidence: 80,
            suggestions: ['Validation non implémentée pour ce type'],
            warnings: [],
            category: type as any,
            validatedAt: new Date(),
          };
      }

      setValidation(result);
      onValidationChange?.(result);
      setLastValidatedData(JSON.stringify(data));
      setIsExpanded(true); // Ouvrir automatiquement après validation
    } catch (error) {
      console.error('Erreur lors de la validation IA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-validation quand les données changent (avec debounce)
  useEffect(() => {
    if (!autoValidate) return;
    
    const currentDataString = JSON.stringify(data);
    if (currentDataString !== lastValidatedData && data?.title?.length > 5) {
      const timer = setTimeout(() => {
        validateWithAI();
      }, 3000); // Attendre 3 secondes après la dernière modification

      return () => clearTimeout(timer);
    }
  }, [data, lastValidatedData, autoValidate]);

  // Déterminer si les données ont suffisamment changé pour une nouvelle validation
  const hasDataChanged = JSON.stringify(data) !== lastValidatedData;
  const canValidate = data?.title?.length > 5;

  const getTypeLabel = () => {
    switch (type) {
      case 'ambition': return 'Objectif annuel';
      case 'keyResult': return 'Résultat Clé';
      case 'okr': return 'OKR';
      case 'action': return 'Action';
      default: return 'Élément';
    }
  };

  return (
    <Card className={`${className} border-2 ${
      validation?.isValid 
        ? 'border-green-200 bg-green-50/30' 
        : validation 
        ? 'border-orange-200 bg-orange-50/30'
        : 'border-blue-200 bg-blue-50/30'
    }`}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              validation?.isValid 
                ? 'bg-green-100' 
                : validation 
                ? 'bg-orange-100'
                : 'bg-blue-100'
            }`}>
              <Brain className={`h-5 w-5 ${
                validation?.isValid 
                  ? 'text-green-600' 
                  : validation 
                  ? 'text-orange-600'
                  : 'text-blue-600'
              }`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Coach IA - {getTypeLabel()}
              </CardTitle>
              {validation && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Analysé il y a {Math.floor((Date.now() - validation.validatedAt.getTime()) / 1000)}s
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {validation && (
              <Badge 
                variant={validation.isValid ? 'success' : 'warning'}
                size="sm"
                className="text-sm font-bold"
              >
                {validation.confidence}%
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 space-y-4">
              {/* Contrôles */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant={isLoading ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={validateWithAI}
                  disabled={isLoading || !canValidate}
                  leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  className="flex-1"
                >
                  {isLoading ? 'Analyse en cours...' : hasDataChanged ? 'Réanalyser' : 'Analyser'}
                </Button>
                
                <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoValidate}
                    onChange={(e) => setAutoValidate(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Auto</span>
                </label>
              </div>

              {/* Indicateur de changement */}
              {hasDataChanged && canValidate && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 p-2 bg-blue-100 rounded-lg border border-blue-200"
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    Données modifiées - Nouvelle analyse recommandée
                  </span>
                </motion.div>
              )}

              {/* Résultats de validation */}
              {validation && (
                <div className="space-y-3">
                  {/* Statut global */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    validation.isValid 
                      ? 'bg-green-100 border border-green-200' 
                      : 'bg-orange-100 border border-orange-200'
                  }`}>
                    {validation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${
                        validation.isValid ? 'text-green-900' : 'text-orange-900'
                      }`}>
                        {validation.isValid 
                          ? `Excellent ! Votre ${getTypeLabel().toLowerCase()} est bien structuré${type === 'ambition' ? 'e' : ''}.`
                          : `Quelques améliorations sont possibles pour votre ${getTypeLabel().toLowerCase()}.`
                        }
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Niveau de confiance : {validation.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {validation.suggestions.length > 0 && (
                    <AISuggestionsPanel
                      suggestions={validation.suggestions}
                      enableCopy
                      showToggleAll
                      className="shadow-none"
                    />
                  )}

                  {/* Avertissements */}
                  {validation.warnings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Points d'attention ({validation.warnings.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {validation.warnings.map((warning, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                          >
                            <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-800 flex-1 leading-relaxed">
                              {warning}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message d'encouragement si pas encore de validation */}
              {!validation && !isLoading && canValidate && (
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                  <Brain className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Coach IA prêt à vous aider
                  </p>
                  <p className="text-xs text-blue-700">
                    Cliquez sur "Analyser" pour obtenir des conseils personnalisés
                    {user?.companyProfile && ' basés sur votre profil d\'entreprise'}
                  </p>
                </div>
              )}

              {/* Message si données insuffisantes */}
              {!canValidate && (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">
                    Saisissez au moins un titre pour obtenir des conseils de l'IA
                  </p>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

