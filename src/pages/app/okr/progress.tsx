import React, { useState, useMemo } from 'react';
import { OkrShell } from '@/components/layout/OkrShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { useQuarterlyObjectives } from '@/hooks/useQuarterlyObjectives';
import { useQuarterlyKeyResultsByUser } from '@/hooks/useQuarterlyKeyResults';
import { useActions } from '@/hooks/useActions';
import { useProgressByType } from '@/hooks/useProgress';
import { Calendar, TrendingUp, TrendingDown, Target, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { EntityType } from '@/types';
import { ActionStatus, Quarter } from '@/types';

const ProgressPage: React.FC = () => {
  const { user } = useAppStore();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(Quarter.Q1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Récupérer les données
  const { data: objectives = [] } = useQuarterlyObjectives(user?.id);
  const { data: keyResults = [] } = useQuarterlyKeyResultsByUser(user?.id);
  const { data: actions = [] } = useActions(user?.id);
  const { data: progressHistory = [] } = useProgressByType('quarterly_key_result' as EntityType, user?.id);

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
    const inProgressActions = filteredActions.filter(a => a.status === ActionStatus.IN_PROGRESS).length;

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

    const atRiskKRs = filteredKeyResults.filter(kr => {
      const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      const daysUntilDeadline = kr.deadline ? Math.ceil((new Date(kr.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
      return progress < 50 && daysUntilDeadline < 30 && daysUntilDeadline > 0;
    }).length;

    return {
      totalObjectives,
      totalKeyResults,
      totalActions,
      completedActions,
      inProgressActions,
      avgProgress,
      completedKRs,
      atRiskKRs,
      actionCompletionRate: totalActions > 0 ? (completedActions / totalActions) * 100 : 0,
    };
  }, [filteredObjectives, filteredKeyResults, filteredActions]);

  const quarters: Quarter[] = [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (!user) {
    return (
      <OkrShell title="Suivi des Progrès" topbarTitle="Suivi des progrès" topbarSubtitle="Visualisez l'évolution de vos objectifs">
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal"></div>
        </div>
      </OkrShell>
    );
  }

  return (
    <OkrShell title="Suivi des Progrès" topbarTitle="Suivi des progrès" topbarSubtitle="Visualisez l'évolution de vos objectifs">
      <div>
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-teal-dark" aria-hidden />
                Suivi des Progrès
              </h1>
              <p className="mt-2 text-muted">
                Visualisez l'évolution de vos objectifs et Key Results
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
                  <p className="text-sm font-medium text-gray-600">Progression Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgProgress.toFixed(1)}%</p>
                </div>
                {stats.avgProgress >= 70 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                )}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.avgProgress >= 70 ? 'bg-green-600' : stats.avgProgress >= 40 ? 'bg-blue-600' : 'bg-orange-600'
                  }`}
                  style={{ width: `${Math.min(stats.avgProgress, 100)}%` }}
                />
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
                  <p className="text-sm font-medium text-gray-600">Actions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedActions}/{stats.totalActions}</p>
                  <p className="text-xs text-gray-500">{stats.actionCompletionRate.toFixed(0)}% complétées</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">KRs à Risque</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.atRiskKRs}</p>
                  <p className="text-xs text-gray-500">nécessitent attention</p>
                </div>
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des Key Results avec progression */}
        {filteredKeyResults.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Key Results du {selectedQuarter} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredKeyResults.map(kr => {
                  const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
                  const daysUntilDeadline = kr.deadline
                    ? Math.ceil((new Date(kr.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isAtRisk = progress < 50 && daysUntilDeadline !== null && daysUntilDeadline < 30 && daysUntilDeadline > 0;

                  return (
                    <motion.div
                      key={kr.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        isAtRisk ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{kr.title}</h3>
                          {kr.deadline && (
                            <p className="text-sm text-gray-500 mt-1">
                              Échéance : {new Date(kr.deadline).toLocaleDateString('fr-FR')}
                              {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                                <span className={`ml-2 ${isAtRisk ? 'text-red-600 font-medium' : ''}`}>
                                  ({daysUntilDeadline} jours restants)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isAtRisk && (
                            <Badge variant="danger" size="sm">
                              À risque
                            </Badge>
                          )}
                          <Badge
                            variant={progress >= 100 ? 'success' : progress >= 70 ? 'info' : progress >= 40 ? 'warning' : 'danger'}
                            size="sm"
                          >
                            {progress.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              progress >= 100 ? 'bg-green-600' : progress >= 70 ? 'bg-blue-600' : progress >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[100px] text-right">
                          {kr.current} / {kr.target} {kr.unit}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Aucun Key Result trouvé pour cette période</p>
                <p className="text-sm mt-2">Créez des objectifs dans la page Gestion</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OkrShell>
  );
};

export default ProgressPage;
