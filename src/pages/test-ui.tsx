import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import {
  useAmbitions,
  useCreateAmbition,
  useUpdateAmbition,
  useDeleteAmbition
} from '@/hooks/useAmbitions';
import {
  useQuarterlyObjectives,
  useCreateQuarterlyObjective,
  useUpdateQuarterlyObjective,
  useDeleteQuarterlyObjective
} from '@/hooks/useQuarterlyObjectives';
import {
  useQuarterlyKeyResults,
  useCreateQuarterlyKeyResult,
  useUpdateQuarterlyKeyResult,
  useDeleteQuarterlyKeyResult
} from '@/hooks/useQuarterlyKeyResults';
import {
  useActions,
  useCreateAction,
  useUpdateAction,
  useDeleteAction,
  useUpdateActionStatus
} from '@/hooks/useActions';
import { Loader2, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';
import type { Ambition, QuarterlyObjective, QuarterlyKeyResult, Action } from '@/types';
import { ActionStatus, Priority, Quarter, AmbitionCategory, Status } from '@/types';

export default function TestUIPage() {
  const { user } = useAppStore();
  const [selectedAmbition, setSelectedAmbition] = useState<string | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [selectedKeyResult, setSelectedKeyResult] = useState<string | null>(null);

  // Queries
  const { data: ambitions, isLoading: ambitionsLoading, error: ambitionsError } = useAmbitions(user?.id);
  const { data: objectives, isLoading: objectivesLoading } = useQuarterlyObjectives(user?.id);
  const { data: keyResults, isLoading: keyResultsLoading } = useQuarterlyKeyResults(selectedObjective || undefined);
  const { data: actions, isLoading: actionsLoading } = useActions(user?.id);

  // Mutations
  const createAmbition = useCreateAmbition();
  const updateAmbition = useUpdateAmbition();
  const deleteAmbition = useDeleteAmbition();

  const createObjective = useCreateQuarterlyObjective();
  const updateObjective = useUpdateQuarterlyObjective();
  const deleteObjective = useDeleteQuarterlyObjective();

  const createKeyResult = useCreateQuarterlyKeyResult();
  const updateKeyResult = useUpdateQuarterlyKeyResult();
  const deleteKeyResult = useDeleteQuarterlyKeyResult();

  const createAction = useCreateAction();
  const updateAction = useUpdateAction(user?.id);
  const deleteAction = useDeleteAction(user?.id);
  const updateActionStatus = useUpdateActionStatus(user?.id);

  // Handlers
  const handleCreateAmbition = async () => {
    if (!user) return;
    try {
      await createAmbition.mutateAsync({
        ambition: {
          title: `Ambition Test ${Date.now()}`,
          description: 'Description de test',
          category: AmbitionCategory.GROWTH,
          priority: Priority.HIGH,
          status: Status.ACTIVE,
          year: new Date().getFullYear(),
        },
        userId: user.id
      });
      alert('✅ Ambition créée !');
    } catch (error) {
      alert('❌ Erreur : ' + (error as Error).message);
    }
  };

  const handleCreateObjective = async () => {
    if (!user || !selectedAmbition) {
      alert('⚠️ Sélectionnez d\'abord une ambition');
      return;
    }
    try {
      await createObjective.mutateAsync({
        objective: {
          title: `Objectif Q1 ${Date.now()}`,
          description: 'Description de test',
          ambitionId: selectedAmbition,
          quarter: Quarter.Q1,
          year: new Date().getFullYear(),
          status: Status.ACTIVE,
        },
        userId: user.id
      });
      alert('✅ Objectif créé !');
    } catch (error) {
      alert('❌ Erreur : ' + (error as Error).message);
    }
  };

  const handleCreateKeyResult = async () => {
    if (!user || !selectedObjective) {
      alert('⚠️ Sélectionnez d\'abord un objectif');
      return;
    }
    try {
      await createKeyResult.mutateAsync({
        keyResult: {
          title: `KR Test ${Date.now()}`,
          description: 'Description de test',
          quarterlyObjectiveId: selectedObjective,
          target: 100,
          current: 0,
          unit: 'unités',
        },
        userId: user.id
      });
      alert('✅ KR créé !');
    } catch (error) {
      alert('❌ Erreur : ' + (error as Error).message);
    }
  };

  const handleCreateAction = async () => {
    if (!user || !selectedKeyResult) {
      alert('⚠️ Sélectionnez d\'abord un Key Result');
      return;
    }
    try {
      await createAction.mutateAsync({
        action: {
          title: `Action Test ${Date.now()}`,
          description: 'Description de test',
          quarterlyKeyResultId: selectedKeyResult,
          status: ActionStatus.TODO,
          priority: Priority.MEDIUM,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        userId: user.id
      });
      alert('✅ Action créée !');
    } catch (error) {
      alert('❌ Erreur : ' + (error as Error).message);
    }
  };

  const handleDeleteAmbition = async (id: string) => {
    if (!user || !confirm('Supprimer cette ambition ?')) return;
    try {
      await deleteAmbition.mutateAsync({ id, userId: user.id });
      alert('✅ Ambition supprimée !');
    } catch (error) {
      alert('❌ Erreur : ' + (error as Error).message);
    }
  };

  const handleUpdateActionStatus = async (id: string, status: ActionStatus) => {
    try {
      await updateActionStatus.mutateAsync({ id, status });
      alert('✅ Statut mis à jour !');
    } catch (error) {
      alert('❌ Erreur : ' + (error as Error).message);
    }
  };

  if (!user) {
    return (
      <Layout title="Test UI - React Query" requireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Test UI - React Query" requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test UI - React Query
          </h1>
          <p className="text-gray-600">
            Page de test pour valider l'intégration React Query avec Supabase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Objectifs annuels */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Objectifs annuels</CardTitle>
                <Button
                  size="sm"
                  onClick={handleCreateAmbition}
                  leftIcon={<Plus className="h-4 w-4" />}
                  disabled={createAmbition.isPending}
                >
                  {createAmbition.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ambitionsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              )}
              {ambitionsError && (
                <div className="text-red-600 py-4">
                  Erreur : {ambitionsError.message}
                </div>
              )}
              {ambitions && ambitions.length === 0 && (
                <p className="text-gray-500 py-4">Aucun objectif annuel</p>
              )}
              {ambitions && ambitions.length > 0 && (
                <div className="space-y-2">
                  {ambitions.map((ambition) => (
                    <div
                      key={ambition.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAmbition === ambition.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAmbition(ambition.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{ambition.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{ambition.description}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAmbition(ambition.id);
                          }}
                          className="text-red-600 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objectifs Trimestriels */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Objectifs Trimestriels</CardTitle>
                <Button
                  size="sm"
                  onClick={handleCreateObjective}
                  leftIcon={<Plus className="h-4 w-4" />}
                  disabled={createObjective.isPending || !selectedAmbition}
                >
                  {createObjective.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {objectivesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              )}
              {objectives && objectives.length === 0 && (
                <p className="text-gray-500 py-4">Aucun objectif</p>
              )}
              {objectives && objectives.length > 0 && (
                <div className="space-y-2">
                  {objectives.map((objective) => (
                    <div
                      key={objective.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedObjective === objective.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedObjective(objective.id)}
                    >
                      <h4 className="font-medium text-gray-900">{objective.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {objective.quarter} {objective.year}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Results */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Key Results</CardTitle>
                <Button
                  size="sm"
                  onClick={handleCreateKeyResult}
                  leftIcon={<Plus className="h-4 w-4" />}
                  disabled={createKeyResult.isPending || !selectedObjective}
                >
                  {createKeyResult.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {keyResultsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              )}
              {keyResults && keyResults.length === 0 && (
                <p className="text-gray-500 py-4">Aucun KR</p>
              )}
              {keyResults && keyResults.length > 0 && (
                <div className="space-y-2">
                  {keyResults.map((kr) => (
                    <div
                      key={kr.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedKeyResult === kr.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedKeyResult(kr.id)}
                    >
                      <h4 className="font-medium text-gray-900">{kr.title}</h4>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${(kr.current / kr.target) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {kr.current} / {kr.target} {kr.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Actions</CardTitle>
                <Button
                  size="sm"
                  onClick={handleCreateAction}
                  leftIcon={<Plus className="h-4 w-4" />}
                  disabled={createAction.isPending || !selectedKeyResult}
                >
                  {createAction.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {actionsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              )}
              {actions && actions.length === 0 && (
                <p className="text-gray-500 py-4">Aucune action</p>
              )}
              {actions && actions.length > 0 && (
                <div className="space-y-2">
                  {actions.map((action) => (
                    <div key={action.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Statut : {action.status} | Priorité : {action.priority}
                          </p>
                        </div>
                        {action.status !== ActionStatus.DONE && (
                          <button
                            onClick={() => handleUpdateActionStatus(action.id, ActionStatus.DONE)}
                            className="text-green-600 hover:text-green-700 ml-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

