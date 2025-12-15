import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { KeyResult, Priority } from '@/types';

interface KeyResultFormProps {
  initialData?: KeyResult | null;
  ambitionId: string | null;
  onSubmit: (data: KeyResultFormData) => void;
  onCancel: () => void;
}

export interface KeyResultFormData {
  title: string;
  description: string;
  ambitionId: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  priority: Priority;
}

export const KeyResultForm: React.FC<KeyResultFormProps> = ({
  initialData,
  ambitionId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<KeyResultFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    ambitionId: initialData?.ambitionId || ambitionId || '',
    target: initialData?.target || 100,
    current: initialData?.current || 0,
    unit: initialData?.unit || '%',
    deadline: initialData?.deadline || new Date(new Date().setMonth(new Date().getMonth() + 3)),
    priority: initialData?.priority || Priority.MEDIUM,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof KeyResultFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof KeyResultFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'L\'unité est requise';
    }

    if (formData.target <= 0) {
      newErrors.target = 'La cible doit être supérieure à 0';
    }

    if (formData.current < 0) {
      newErrors.current = 'La valeur actuelle ne peut pas être négative';
    }

    if (!formData.ambitionId) {
      console.error('❌ Erreur de validation : ambitionId manquant');
      alert('Erreur : Aucun objectif annuel sélectionné. Veuillez réessayer.');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof KeyResultFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                {initialData ? 'Modifier le Résultat Clé' : 'Nouveau Résultat Clé'}
              </CardTitle>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du résultat clé *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Atteindre 1M€ de CA"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Décrivez comment mesurer ce résultat..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Métriques */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur actuelle *
                  </label>
                  <input
                    type="number"
                    value={formData.current}
                    onChange={(e) => handleChange('current', parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.current ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.current && (
                    <p className="mt-1 text-sm text-red-600">{errors.current}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cible *
                  </label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => handleChange('target', parseFloat(e.target.value))}
                    min={0.01}
                    step={0.01}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.target ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.target && (
                    <p className="mt-1 text-sm text-red-600">{errors.target}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unité *
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.unit ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="€, %, clients..."
                  />
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                  )}
                </div>
              </div>

              {/* Échéance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Échéance *
                </label>
                <input
                  type="date"
                  value={formData.deadline instanceof Date ? formData.deadline.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('deadline', new Date(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value as Priority)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="critical">Critique</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  {initialData ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

