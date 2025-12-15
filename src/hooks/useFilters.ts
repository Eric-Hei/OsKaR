import { useMemo } from 'react';
import { 
  Action, 
  Ambition, 
  QuarterlyObjective, 
  QuarterlyKeyResult,
  Quarter,
  Priority,
  ActionStatus 
} from '@/types';
import { FilterState } from '@/components/ui/FilterPanel';

interface UseFiltersProps {
  actions: Action[];
  ambitions: Ambition[];
  quarterlyObjectives: QuarterlyObjective[];
  quarterlyKeyResults: QuarterlyKeyResult[];
  filters: FilterState;
}

interface UseFiltersReturn {
  filteredActions: Action[];
  filteredAmbitions: Ambition[];
  filteredQuarterlyObjectives: QuarterlyObjective[];
  availableLabels: string[];
  availableYears: number[];
  filterStats: {
    totalActions: number;
    filteredActions: number;
    ambitionsCount: number;
    objectivesCount: number;
  };
}

export const useFilters = ({
  actions = [],
  ambitions = [],
  quarterlyObjectives = [],
  quarterlyKeyResults = [],
  filters,
}: UseFiltersProps): UseFiltersReturn => {
  // Calculer les labels disponibles
  const availableLabels = useMemo(() => {
    if (!actions || actions.length === 0) return [];
    const allLabels = actions.flatMap(action => action.labels || []);
    return Array.from(new Set(allLabels)).sort();
  }, [actions]);

  // Calculer les années disponibles
  const availableYears = useMemo(() => {
    if (!quarterlyObjectives || quarterlyObjectives.length === 0) return [];
    const years = quarterlyObjectives.map(obj => obj.year);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [quarterlyObjectives]);

  // Filtrer les actions (via leur KR trimestriel → objectif)
  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      // Retrouver le KR lié à cette action (nouveau schéma)
      const relatedKR = quarterlyKeyResults.find(kr => kr.id === action.quarterlyKeyResultId);

      // Filtre par objectif trimestriel (via le KR)
      if (filters.objectiveIds.length > 0) {
        if (!relatedKR) return false;
        if (!filters.objectiveIds.includes(relatedKR.quarterlyObjectiveId)) {
          return false;
        }
      }

      // Récupérer l'objectif trimestriel lié pour les filtres ambition/trimestre/année
      const relatedObjective = relatedKR
        ? quarterlyObjectives.find(obj => obj.id === relatedKR.quarterlyObjectiveId)
        : undefined;

      // Filtre par ambition (via l'objectif trimestriel)
      if (filters.ambitionIds.length > 0) {
        if (!relatedObjective || !filters.ambitionIds.includes(relatedObjective.ambitionId)) {
          return false;
        }
      }

      // Filtre par trimestre (via l'objectif trimestriel)
      if (filters.quarters.length > 0) {
        if (!relatedObjective || !filters.quarters.includes(relatedObjective.quarter)) {
          return false;
        }
      }

      // Filtre par année (via l'objectif trimestriel)
      if (filters.years.length > 0) {
        if (!relatedObjective || !filters.years.includes(relatedObjective.year)) {
          return false;
        }
      }

      // Filtre par priorité
      if (filters.priorities.length > 0) {
        if (!filters.priorities.includes(action.priority)) {
          return false;
        }
      }

      // Filtre par statut
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(action.status)) {
          return false;
        }
      }

      // Filtre par labels
      if (filters.labels.length > 0) {
        const hasMatchingLabel = filters.labels.some(label =>
          action.labels.includes(label)
        );
        if (!hasMatchingLabel) {
          return false;
        }
      }

      return true;
    });
  }, [actions, quarterlyObjectives, quarterlyKeyResults, filters]);

  // Filtrer les ambitions
  const filteredAmbitions = useMemo(() => {
    if (!ambitions || ambitions.length === 0) return [];

    return ambitions.filter(ambition => {
      // Si des filtres d'ambition sont actifs, les appliquer
      if (filters.ambitionIds && filters.ambitionIds.length > 0) {
        return filters.ambitionIds.includes(ambition.id);
      }

      // Si des filtres de trimestre/année/objectif sont actifs, vérifier si l'ambition a des objectifs correspondants
      const hasQuarterFilter = filters.quarters && filters.quarters.length > 0;
      const hasYearFilter = filters.years && filters.years.length > 0;
      const hasObjectiveFilter = filters.objectiveIds && filters.objectiveIds.length > 0;

      if (hasQuarterFilter || hasYearFilter || hasObjectiveFilter) {
        // Vérifier si l'ambition a au moins un objectif qui correspond aux filtres
        const hasRelevantObjectives = quarterlyObjectives.some(obj => {
          if (obj.ambitionId !== ambition.id) return false;

          // Vérifier les filtres de trimestre et année
          if (hasQuarterFilter && !filters.quarters.includes(obj.quarter)) {
            return false;
          }
          if (hasYearFilter && !filters.years.includes(obj.year)) {
            return false;
          }
          if (hasObjectiveFilter && !filters.objectiveIds.includes(obj.id)) {
            return false;
          }

          return true;
        });

        return hasRelevantObjectives;
      }

      // Aucun filtre actif : afficher toutes les ambitions
      return true;
    });
  }, [ambitions, quarterlyObjectives, filters]);

  // Filtrer les objectifs trimestriels
  const filteredQuarterlyObjectives = useMemo(() => {
    if (!quarterlyObjectives || quarterlyObjectives.length === 0) return [];

    return quarterlyObjectives.filter(obj => {
      // Filtre par ambition
      if (filters.ambitionIds && filters.ambitionIds.length > 0) {
        if (!filters.ambitionIds.includes(obj.ambitionId)) {
          return false;
        }
      }

      // Filtre par trimestre
      if (filters.quarters && filters.quarters.length > 0) {
        if (!filters.quarters.includes(obj.quarter)) {
          return false;
        }
      }

      // Filtre par année
      if (filters.years && filters.years.length > 0) {
        if (!filters.years.includes(obj.year)) {
          return false;
        }
      }

      // Filtre par objectif spécifique
      if (filters.objectiveIds && filters.objectiveIds.length > 0) {
        if (!filters.objectiveIds.includes(obj.id)) {
          return false;
        }
      }

      return true;
    });
  }, [quarterlyObjectives, filters]);

  // Statistiques de filtrage
  const filterStats = useMemo(() => {
    return {
      totalActions: actions?.length || 0,
      filteredActions: filteredActions?.length || 0,
      ambitionsCount: filteredAmbitions?.length || 0,
      objectivesCount: filteredQuarterlyObjectives?.length || 0,
    };
  }, [actions?.length, filteredActions?.length, filteredAmbitions?.length, filteredQuarterlyObjectives?.length]);

  return {
    filteredActions,
    filteredAmbitions,
    filteredQuarterlyObjectives,
    availableLabels,
    availableYears,
    filterStats,
  };
};

// Hook pour vérifier si des filtres sont actifs
export const useHasActiveFilters = (filters: FilterState): boolean => {
  return useMemo(() => {
    return Object.values(filters).some(filterArray => 
      Array.isArray(filterArray) && filterArray.length > 0
    );
  }, [filters]);
};

// Hook pour obtenir un résumé des filtres actifs
export const useActiveFiltersDescription = (
  filters: FilterState,
  ambitions: Ambition[],
  quarterlyObjectives: QuarterlyObjective[]
): string => {
  return useMemo(() => {
    const descriptions: string[] = [];

    if (filters.ambitionIds.length > 0) {
      const ambitionNames = filters.ambitionIds
        .map(id => ambitions.find(a => a.id === id)?.title)
        .filter(Boolean);
      descriptions.push(`Objectifs annuels: ${ambitionNames.join(', ')}`);
    }

    if (filters.quarters.length > 0) {
      const quarterLabels = {
        [Quarter.Q1]: 'T1',
        [Quarter.Q2]: 'T2',
        [Quarter.Q3]: 'T3',
        [Quarter.Q4]: 'T4',
      };
      const quarterNames = filters.quarters.map(q => quarterLabels[q]);
      descriptions.push(`Trimestres: ${quarterNames.join(', ')}`);
    }

    if (filters.years.length > 0) {
      descriptions.push(`Années: ${filters.years.join(', ')}`);
    }

    if (filters.objectiveIds.length > 0) {
      const objectiveNames = filters.objectiveIds
        .map(id => quarterlyObjectives.find(o => o.id === id)?.title)
        .filter(Boolean);
      descriptions.push(`Objectifs: ${objectiveNames.join(', ')}`);
    }

    if (filters.priorities.length > 0) {
      const priorityLabels = {
        [Priority.LOW]: 'Faible',
        [Priority.MEDIUM]: 'Moyenne',
        [Priority.HIGH]: 'Haute',
        [Priority.CRITICAL]: 'Critique',
      };
      const priorityNames = filters.priorities.map(p => priorityLabels[p]);
      descriptions.push(`Priorités: ${priorityNames.join(', ')}`);
    }

    if (filters.statuses.length > 0) {
      const statusLabels = {
        [ActionStatus.TODO]: 'À faire',
        [ActionStatus.IN_PROGRESS]: 'En cours',
        [ActionStatus.DONE]: 'Terminé',
      };
      const statusNames = filters.statuses.map(s => statusLabels[s]);
      descriptions.push(`Statuts: ${statusNames.join(', ')}`);
    }

    if (filters.labels.length > 0) {
      descriptions.push(`Labels: ${filters.labels.join(', ')}`);
    }

    return descriptions.length > 0 
      ? descriptions.join(' • ') 
      : 'Aucun filtre actif';
  }, [filters, ambitions, quarterlyObjectives]);
};
