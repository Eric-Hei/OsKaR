import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { AmbitionsService, QuarterlyObjectivesService, ActionsService } from '@/services/db';
import { checkSupabaseHealth } from '@/lib/supabaseHelpers';
import type { Ambition } from '@/types';
import { AmbitionCategory, Priority, Status, Quarter, ActionStatus } from '@/types';

/**
 * Page de test des services de base de données
 * 
 * Cette page permet de tester les opérations CRUD sur Supabase
 * Accessible uniquement en développement
 */
export default function TestDBPage() {
  const { user } = useAppStore();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [supabaseHealthy, setSupabaseHealthy] = useState<boolean | null>(null);

  // Vérifier la santé de Supabase au chargement
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await checkSupabaseHealth();
      setSupabaseHealthy(healthy);
    };
    checkHealth();
  }, []);

  const testCreateAmbition = async () => {
    if (!user) {
      setResult('❌ Aucun utilisateur connecté');
      return;
    }

    setLoading(true);
    setResult('⏳ Création d\'une ambition de test...\n\n💡 Si c\'est lent, c\'est normal : Supabase démarre (cold start).\nLe système va réessayer automatiquement.');

    try {
      const ambition: Partial<Ambition> = {
        title: 'Test Ambition ' + new Date().toLocaleTimeString(),
        description: 'Ceci est une ambition de test créée depuis la page de test',
        category: AmbitionCategory.GROWTH,
        year: new Date().getFullYear(),
        priority: Priority.HIGH,
        status: Status.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = await AmbitionsService.create(ambition, user.id);

      setResult(`✅ Ambition créée avec succès !\n\nID: ${created.id}\nTitre: ${created.title}\n\nVérifie dans Supabase > Table Editor > ambitions`);
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}\n\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetAmbitions = async () => {
    if (!user) {
      setResult('❌ Aucun utilisateur connecté');
      return;
    }

    setLoading(true);
    setResult('⏳ Récupération des ambitions...');

    try {
      const ambitions = await AmbitionsService.getAll(user.id);
      setResult(`✅ ${ambitions.length} ambition(s) trouvée(s) !\n\n${JSON.stringify(ambitions, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}\n\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateQuarterlyObjective = async () => {
    if (!user) {
      setResult('❌ Aucun utilisateur connecté');
      return;
    }

    setLoading(true);
    setResult('⏳ Création d\'un objectif trimestriel de test...');

    try {
      const objective = {
        title: 'Test Objectif Q1 ' + new Date().toLocaleTimeString(),
        description: 'Objectif de test pour Q1',
        quarter: Quarter.Q1,
        year: new Date().getFullYear(),
        status: Status.ACTIVE,
        ambitionId: '',
      };

      const created = await QuarterlyObjectivesService.create(objective, user.id);
      setResult(`✅ Objectif trimestriel créé !\n\nID: ${created.id}\nTitre: ${created.title}\n\nVérifie dans Supabase > Table Editor > quarterly_objectives`);
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}\n\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateAction = async () => {
    if (!user) {
      setResult('❌ Aucun utilisateur connecté');
      return;
    }

    setLoading(true);
    setResult('⏳ Création d\'une action de test...');

    try {
      const action = {
        title: 'Test Action ' + new Date().toLocaleTimeString(),
        description: 'Action de test pour le Kanban',
        quarterlyKeyResultId: '',
        status: ActionStatus.TODO,
        priority: Priority.MEDIUM,
        labels: ['test', 'demo'],
      };

      const created = await ActionsService.create(action, user.id);
      setResult(`✅ Action créée !\n\nID: ${created.id}\nTitre: ${created.title}\nStatut: ${created.status}\n\nVérifie dans Supabase > Table Editor > actions`);
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}\n\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Base de Données</h1>
          <p className="text-gray-600">
            ⚠️ Tu dois être connecté pour tester les services de base de données.
          </p>
          <a
            href="/auth/login"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Base de Données</h1>
          <p className="text-gray-600 mb-4">
            Utilisateur connecté : <strong>{user.email}</strong> ({user.id})
          </p>

          {/* Indicateur de santé Supabase */}
          {supabaseHealthy === null && (
            <div className="mb-6 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
              ⏳ Vérification de la connexion Supabase...
            </div>
          )}
          {supabaseHealthy === true && (
            <div className="mb-6 p-3 bg-green-100 rounded-lg text-sm text-green-800">
              ✅ Supabase est prêt et réactif
            </div>
          )}
          {supabaseHealthy === false && (
            <div className="mb-6 p-3 bg-yellow-100 rounded-lg text-sm text-yellow-800">
              ⚠️ Supabase est lent (cold start). Les requêtes peuvent prendre 10-30 secondes.
              <br />Le système réessayera automatiquement en cas de timeout.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={testCreateAmbition}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Chargement...' : '➕ Créer une Ambition'}
            </button>

            <button
              onClick={testGetAmbitions}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Chargement...' : '📋 Lister les Objectifs Annuels'}
            </button>

            <button
              onClick={testCreateQuarterlyObjective}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Chargement...' : '➕ Créer un Objectif Q1'}
            </button>

            <button
              onClick={testCreateAction}
              disabled={loading}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Chargement...' : '➕ Créer une Action'}
            </button>
          </div>

          {result && (
            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Résultat :</h2>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {result}
              </pre>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Clique sur un bouton pour tester une opération CRUD</li>
              <li>Vérifie le résultat affiché ci-dessus</li>
              <li>Va dans Supabase &gt; Table Editor pour vérifier que les données sont bien enregistrées</li>
              <li>Les données sont aussi sauvegardées en localStorage comme fallback</li>
            </ol>
          </div>

          <div className="mt-6">
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              ← Retour au Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

