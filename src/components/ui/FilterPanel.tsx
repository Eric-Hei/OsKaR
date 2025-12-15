import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  ChevronDown, 
  Building2, 
  Calendar, 
  Target, 
  Tag,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Ambition, 
  QuarterlyObjective, 
  Quarter, 
  Priority, 
  ActionStatus 
} from '@/types';

export interface FilterState {
  ambitionIds: string[];
  quarters: Quarter[];
  years: number[];
  objectiveIds: string[];
  priorities: Priority[];
  statuses: ActionStatus[];
  labels: string[];
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  ambitions: Ambition[];
  quarterlyObjectives: QuarterlyObjective[];
  availableLabels: string[];
  availableYears: number[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  ambitions,
  quarterlyObjectives,
  availableLabels,
  availableYears,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['ambitions', 'time', 'objectives'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateFilters = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: any) => {
    const currentArray = filters[key] as any[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ambitionIds: [],
      quarters: [],
      years: [],
      objectiveIds: [],
      priorities: [],
      statuses: [],
      labels: [],
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterArray) => {
      return count + (Array.isArray(filterArray) ? filterArray.length : 0);
    }, 0);
  };

  const quarterLabels = {
    [Quarter.Q1]: 'T1 (Jan-Mar)',
    [Quarter.Q2]: 'T2 (Avr-Juin)',
    [Quarter.Q3]: 'T3 (Juil-Sep)',
    [Quarter.Q4]: 'T4 (Oct-Déc)',
  };

  const priorityLabels = {
    [Priority.LOW]: 'Faible',
    [Priority.MEDIUM]: 'Moyenne',
    [Priority.HIGH]: 'Haute',
    [Priority.CRITICAL]: 'Critique',
  };

  const statusLabels = {
    [ActionStatus.TODO]: 'À faire',
    [ActionStatus.IN_PROGRESS]: 'En cours',
    [ActionStatus.DONE]: 'Terminé',
  };

  const priorityColors = {
    [Priority.LOW]: 'bg-gray-100 text-gray-800',
    [Priority.MEDIUM]: 'bg-blue-100 text-blue-800',
    [Priority.HIGH]: 'bg-orange-100 text-orange-800',
    [Priority.CRITICAL]: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    [ActionStatus.TODO]: 'bg-gray-100 text-gray-800',
    [ActionStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [ActionStatus.DONE]: 'bg-green-100 text-green-800',
  };

  const FilterSection: React.FC<{
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ id, title, icon, children }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto"
          >
            <Card className="h-full rounded-none border-0">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Filtres</span>
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="info" size="sm">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getActiveFiltersCount() > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearAllFilters}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Effacer
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onClose}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Objectifs annuels */}
                <FilterSection
                  id="ambitions"
                  title="Objectifs annuels"
                  icon={<Building2 className="h-4 w-4 text-purple-600" />}
                >
                  <div className="space-y-2">
                    {ambitions.map((ambition) => (
                      <label key={ambition.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.ambitionIds.includes(ambition.id)}
                          onChange={() => toggleArrayFilter('ambitionIds', ambition.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{ambition.title}</span>
                          <Badge variant="secondary" size="sm" className="ml-2">
                            {ambition.category}
                          </Badge>
                        </div>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Période */}
                <FilterSection
                  id="time"
                  title="Période"
                  icon={<Calendar className="h-4 w-4 text-blue-600" />}
                >
                  <div className="space-y-4">
                    {/* Trimestres */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Trimestres</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(quarterLabels).map(([quarter, label]) => (
                          <label key={quarter} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.quarters.includes(quarter as Quarter)}
                              onChange={() => toggleArrayFilter('quarters', quarter as Quarter)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Années */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Années</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableYears.map((year) => (
                          <label key={year} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.years.includes(year)}
                              onChange={() => toggleArrayFilter('years', year)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{year}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </FilterSection>

                {/* Objectifs */}
                <FilterSection
                  id="objectives"
                  title="Objectifs Trimestriels"
                  icon={<Target className="h-4 w-4 text-green-600" />}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {quarterlyObjectives.map((objective) => (
                      <label key={objective.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.objectiveIds.includes(objective.id)}
                          onChange={() => toggleArrayFilter('objectiveIds', objective.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{objective.title}</span>
                          <div className="flex items-center space-x-1 mt-1">
                            <Badge variant="secondary" size="sm">
                              {quarterLabels[objective.quarter]} {objective.year}
                            </Badge>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Priorités */}
                <FilterSection
                  id="priorities"
                  title="Priorités"
                  icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
                >
                  <div className="space-y-2">
                    {Object.entries(priorityLabels).map(([priority, label]) => (
                      <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.priorities.includes(priority as Priority)}
                          onChange={() => toggleArrayFilter('priorities', priority as Priority)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <Badge className={priorityColors[priority as Priority]} size="sm">
                          {label}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Statuts */}
                <FilterSection
                  id="statuses"
                  title="Statuts"
                  icon={<Target className="h-4 w-4 text-indigo-600" />}
                >
                  <div className="space-y-2">
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <label key={status} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.statuses.includes(status as ActionStatus)}
                          onChange={() => toggleArrayFilter('statuses', status as ActionStatus)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Badge className={statusColors[status as ActionStatus]} size="sm">
                          {label}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Labels */}
                <FilterSection
                  id="labels"
                  title="Labels"
                  icon={<Tag className="h-4 w-4 text-pink-600" />}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableLabels.map((label) => (
                      <label key={label} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.labels.includes(label)}
                          onChange={() => toggleArrayFilter('labels', label)}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <Badge variant="secondary" size="sm">
                          {label}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
