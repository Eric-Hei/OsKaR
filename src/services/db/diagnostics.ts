import { supabase } from '@/lib/supabaseClient';
import type { Database, Json } from '@/types/supabase';
import type { AnalysisResult, DiagnosticState } from '@/lib/diagnostic';

type DiagnosticRow = Database['public']['Tables']['diagnostics']['Row'];
type DiagnosticInsert = Database['public']['Tables']['diagnostics']['Insert'];

/** Diagnostic persisté (mapping de la row Supabase vers le domaine) */
export interface DiagnosticRecord {
  id: string;
  userId: string | null;
  email: string | null;
  scores: AnalysisResult;
  responses: DiagnosticState;
  createdAt: Date;
}

/** Données nécessaires pour enregistrer un diagnostic */
export interface DiagnosticPayload {
  /** Identifiant de l'utilisateur connecté, ou null pour un invité */
  userId: string | null;
  /** Email de l'invité (requis si userId est null) */
  email: string | null;
  /** Résultat structuré de l'analyse */
  scores: AnalysisResult;
  /** État brut du questionnaire (sliders, cases, touched) */
  responses: DiagnosticState;
}

/**
 * Service de persistance des diagnostics de maturité OSKAR.
 */
export class DiagnosticsService {
  /** Convertir une row Supabase en DiagnosticRecord */
  private static rowToRecord(row: DiagnosticRow): DiagnosticRecord {
    return {
      id: row.id,
      userId: row.user_id,
      email: row.email,
      scores: row.scores as unknown as AnalysisResult,
      responses: row.responses as unknown as DiagnosticState,
      createdAt: new Date(row.created_at),
    };
  }

  /**
   * Enregistrer un nouveau diagnostic.
   */
  static async create(payload: DiagnosticPayload): Promise<DiagnosticRecord> {
    // Le user_id doit correspondre à auth.uid() côté serveur (policy RLS).
    // On le dérive de la session live, et non du store (qui peut être périmé) :
    // - session valide  → enregistrement rattaché au compte ;
    // - aucune session   → enregistrement invité (user_id NULL), nécessite un email.
    const { data: { session } } = await supabase.auth.getSession();
    const authUserId = session?.user?.id ?? null;
    const email = payload.email ?? session?.user?.email ?? null;

    if (!authUserId && !email) {
      throw new Error('Un email est requis pour enregistrer un diagnostic invité.');
    }

    const insertData: DiagnosticInsert = {
      user_id: authUserId,
      email,
      scores: payload.scores as unknown as Json,
      responses: payload.responses as unknown as Json,
    };

    // Invité : la policy SELECT (user_id = auth.uid()) ne permet pas de relire la ligne
    // (NULL = NULL n'est pas vrai), donc on n'enchaîne pas .select().single() qui échouerait.
    if (!authUserId) {
      const { error } = await supabase.from('diagnostics').insert(insertData);
      if (error) {
        console.error('❌ Erreur lors de l\'enregistrement du diagnostic (invité):', error);
        throw error;
      }
      console.log('✅ Diagnostic invité enregistré');
      return {
        id: '',
        userId: null,
        email,
        scores: payload.scores,
        responses: payload.responses,
        createdAt: new Date(),
      };
    }

    const { data, error } = await supabase
      .from('diagnostics')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de l\'enregistrement du diagnostic:', error);
      throw error;
    }

    console.log('✅ Diagnostic enregistré:', data.id);
    return this.rowToRecord(data);
  }

  /**
   * Récupérer tous les diagnostics d'un utilisateur (du plus récent au plus ancien).
   */
  static async getByUser(userId: string): Promise<DiagnosticRecord[]> {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération des diagnostics:', error);
      throw error;
    }

    return (data || []).map((row: DiagnosticRow) => this.rowToRecord(row));
  }

  /**
   * Récupérer le dernier diagnostic d'un utilisateur, ou null s'il n'en a aucun.
   */
  static async getLatestByUser(userId: string): Promise<DiagnosticRecord | null> {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Erreur lors de la récupération du dernier diagnostic:', error);
      throw error;
    }

    return data ? this.rowToRecord(data) : null;
  }

  /**
   * Récupérer le dernier diagnostic associé à un email (restauration invité, sans compte).
   * Passe par la fonction SQL `get_latest_diagnostic_by_email` (SECURITY DEFINER) car la
   * policy SELECT (user_id = auth.uid()) interdit toute lecture anonyme directe.
   */
  static async getLatestByEmail(email: string): Promise<DiagnosticRecord | null> {
    const { data, error } = await (supabase as any).rpc('get_latest_diagnostic_by_email', {
      p_email: email,
    });

    if (error) {
      console.error('❌ Erreur lors de la restauration du bilan par email:', error);
      throw error;
    }

    const row = (Array.isArray(data) ? data[0] : data) as DiagnosticRow | undefined;
    return row ? this.rowToRecord(row) : null;
  }

  /**
   * Supprimer un diagnostic.
   */
  static async delete(diagnosticId: string): Promise<void> {
    const { error } = await supabase
      .from('diagnostics')
      .delete()
      .eq('id', diagnosticId);

    if (error) {
      console.error('❌ Erreur lors de la suppression du diagnostic:', error);
      throw error;
    }

    console.log('✅ Diagnostic supprimé:', diagnosticId);
  }
}
