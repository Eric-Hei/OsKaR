import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Target, Calendar, Building2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Quarter, QuarterlyObjectiveFormData, Ambition } from '@/types';

// Schéma de validation
const quarterlyObjectiveSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  ambitionId: z.string().min(1, 'Veuillez sélectionner une ambition'),
  quarter: z.nativeEnum(Quarter, { required_error: 'Veuillez sélectionner un trimestre' }),
  year: z.number().min(2024).max(2030, 'Année invalide'),
});

interface QuarterlyObjectiveFormProps {
  initialData?: Partial<QuarterlyObjectiveFormData>;
  onSubmit: (data: QuarterlyObjectiveFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  ambitions?: Ambition[];
}

export const QuarterlyObjectiveForm: React.FC<QuarterlyObjectiveFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  ambitions = [],
}) => {
  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<QuarterlyObjectiveFormData>({
    resolver: zodResolver(quarterlyObjectiveSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      ambitionId: initialData?.ambitionId || '',
      quarter: initialData?.quarter || Quarter.Q1,
      year: initialData?.year || currentYear,
    },
    mode: 'onChange',
  });

  const selectedAmbition = ambitions.find(a => a.id === watch('ambitionId'));

  const quarterLabels = {
    [Quarter.Q1]: 'T1 (Jan-Mar)',
    [Quarter.Q2]: 'T2 (Avr-Juin)',
    [Quarter.Q3]: 'T3 (Juil-Sep)',
    [Quarter.Q4]: 'T4 (Oct-Déc)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>
              {initialData ? 'Modifier l\'objectif trimestriel' : 'Nouvel objectif trimestriel'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Sélection de l'objectif annuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline h-4 w-4 mr-1" />
                Objectif annuel rattaché *
              </label>
              <select
                {...register('ambitionId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Sélectionner un objectif annuel</option>
                {ambitions.map((ambition) => (
                  <option key={ambition.id} value={ambition.id}>
                    {ambition.title}
                  </option>
                ))}
              </select>
              {errors.ambitionId && (
                <p className="mt-1 text-sm text-red-600">{errors.ambitionId.message}</p>
              )}
              {selectedAmbition && (
                <div className="mt-2">
                  <Badge variant="info" size="sm">
                    {selectedAmbition.category}
                  </Badge>
                </div>
              )}
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'objectif *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="Ex: Augmenter les ventes de 25%"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Décrivez précisément cet objectif trimestriel et comment il contribue à votre ambition..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Trimestre et Année */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Trimestre *
                </label>
                <select
                  {...register('quarter')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(quarterLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.quarter && (
                  <p className="mt-1 text-sm text-red-600">{errors.quarter.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année *
                </label>
                <input
                  type="number"
                  {...register('year', { valueAsNumber: true })}
                  min={2024}
                  max={2030}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>
            </div>

            {/* Aperçu */}
            {selectedAmbition && watch('title') && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Aperçu</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Objectif annuel:</strong> {selectedAmbition.title}</p>
                  <p><strong>Objectif:</strong> {watch('title')}</p>
                  <p><strong>Période:</strong> {quarterLabels[watch('quarter')]} {watch('year')}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                isLoading={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {initialData ? 'Mettre à jour' : 'Créer l\'objectif'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
