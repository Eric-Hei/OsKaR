import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { useQuarterlyObjectives } from '@/hooks/useQuarterlyObjectives';
import { useQuarterlyKeyResultsByUser } from '@/hooks/useQuarterlyKeyResults';
import { useActions } from '@/hooks/useActions';
import { geminiService } from '@/services/gemini';
import { History, TrendingUp, TrendingDown, Target, CheckCircle, AlertCircle, Sparkles, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { ActionStatus, Quarter } from '@/types';

const RetrospectivePage: React.FC = () => {
  const { user } = useAppStore();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(Quarter.Q1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [retrospective, setRetrospective] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Récupérer les données
  const { data: objectives = [] } = useQuarterlyObjectives(user?.id);
  const { data: keyResults = [] } = useQuarterlyKeyResultsByUser(user?.id);
  const { data: actions = [] } = useActions(user?.id);

  // Filtrer par trimestre et année sélectionnés
  const filteredObjectives = useMemo(() => {
    return objectives.filter(obj => obj.quarter === selectedQuarter && obj.year === selectedYear);
  }, [objectives, selectedQuarter, selectedYear]);

  const filteredKeyResults = useMemo(() => {
    const objectiveIds = filteredObjectives.map(obj => obj.id);
    return keyResults.filter(kr => objectiveIds.includes(kr.quarterlyObjectiveId));
  }, [keyResults, filteredObjectives]);

  const filteredActions = useMemo(() => {
    const krIds = filteredKeyResults.map(kr => kr.id);
    return actions.filter(action => action.quarterlyKeyResultId && krIds.includes(action.quarterlyKeyResultId));
  }, [actions, filteredKeyResults]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalObjectives = filteredObjectives.length;
    const totalKeyResults = filteredKeyResults.length;
    const totalActions = filteredActions.length;
    const completedActions = filteredActions.filter(a => a.status === ActionStatus.DONE).length;
    
    const avgProgress = filteredKeyResults.length > 0
      ? filteredKeyResults.reduce((sum, kr) => {
          const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
          return sum + Math.min(progress, 100);
        }, 0) / filteredKeyResults.length
      : 0;

    const completedKRs = filteredKeyResults.filter(kr => {
      const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      return progress >= 100;
    }).length;

    return {
      totalObjectives,
      totalKeyResults,
      totalActions,
      completedActions,
      avgProgress,
      completedKRs,
      actionCompletionRate: totalActions > 0 ? (completedActions / totalActions) * 100 : 0,
    };
  }, [filteredObjectives, filteredKeyResults, filteredActions]);

  const handleGenerateRetrospective = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const quarterName = selectedQuarter;
      const year = selectedYear;

      const retrospectiveText = await geminiService.generateQuarterRetrospective({
        quarterName,
        year,
        keyResults: filteredKeyResults,
        actionsDone: stats.completedActions,
        actionsTotal: stats.totalActions,
        companyProfile: user?.companyProfile || undefined,
      });

      setRetrospective(retrospectiveText);
    } catch {
      alert("Erreur lors de la génération de la rétrospective. Réessayez dans quelques instants.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    // TODO: Implémenter l'export PDF
    alert('Export PDF à venir !');
  };

  const quarters: Quarter[] = [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (!user) {
    return (
      <Layout title="Rétrospective Trimestrielle" requireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Rétrospective Trimestrielle" requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <History className="h-8 w-8 mr-3 text-blue-600" />
                Rétrospective Trimestrielle
              </h1>
              <p className="mt-2 text-gray-600">
                Analysez vos performances et générez des insights avec l'IA
              </p>
            </div>
          </div>
        </div>

        {/* Sélection du trimestre */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sélectionner la période</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
                <div className="flex gap-2">
                  {quarters.map(q => (
                    <Button
                      key={q}
                      variant={selectedQuarter === q ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedQuarter(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Objectifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalObjectives}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Key Results</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedKRs}/{stats.totalKeyResults}</p>
                  <p className="text-xs text-gray-500">complétés</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progression Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgProgress.toFixed(1)}%</p>
                </div>
                {stats.avgProgress >= 70 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedActions}/{stats.totalActions}</p>
                  <p className="text-xs text-gray-500">{stats.actionCompletionRate.toFixed(0)}% complétées</p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Results du trimestre */}
        {filteredKeyResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Key Results du {selectedQuarter} {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredKeyResults.slice(0, 8).map(kr => {
                  const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
                  return (
                    <div key={kr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{kr.title}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                progress >= 100 ? 'bg-green-600' : progress >= 70 ? 'bg-blue-600' : 'bg-orange-600'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-[60px]">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={progress >= 100 ? 'success' : progress >= 70 ? 'info' : 'warning'}
                        size="sm"
                        className="ml-4"
                      >
                        {kr.current} / {kr.target} {kr.unit}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Génération de la rétrospective IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
              Rétrospective IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!retrospective ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Générez une analyse détaillée de votre trimestre avec l'IA
                </p>
                <Button
                  variant="primary"
                  onClick={handleGenerateRetrospective}
                  disabled={isGenerating || filteredKeyResults.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer la rétrospective
                    </>
                  )}
                </Button>
                {filteredKeyResults.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Aucun Key Result trouvé pour cette période
                  </p>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="prose max-w-none mb-4">
                  <div className="whitespace-pre-wrap text-gray-700">{retrospective}</div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleGenerateRetrospective}
                    disabled={isGenerating}
                  >
                    Régénérer
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleExportPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter en PDF
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RetrospectivePage;

