import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { importService, type CSVRow, type ColumnMapping, type ImportResult } from '@/services/import';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function ImportPage() {
  const { user } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    try {
      const parsedRows = await importService.parseCSV(selectedFile);
      setRows(parsedRows);
      
      if (parsedRows.length > 0) {
        const detectedHeaders = Object.keys(parsedRows[0]);
        setHeaders(detectedHeaders);
        
        const autoMapping = importService.autoDetectMapping(detectedHeaders);
        setMapping(autoMapping);
      }
    } catch (error) {
      alert(`Erreur lors de la lecture du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleImport = async () => {
    if (!user || rows.length === 0) return;

    setIsProcessing(true);
    try {
      const importResult = await importService.importData(rows, mapping, user.id);
      setResult(importResult);
    } catch (error) {
      alert(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `Ambition Titre,Ambition Description,Ambition Catégorie,Ambition Priorité,Ambition Année,Objectif Titre,Objectif Description,Objectif Trimestre,Objectif Année,KR Titre,KR Description,KR Cible,KR Actuel,KR Unité,KR Échéance,Action Titre,Action Description,Action Priorité,Action Échéance,Action Labels
Doubler le CA,Passer de 500K€ à 1M€,revenue,high,2025,Augmenter les ventes,Développer de nouveaux canaux,Q1,2025,Atteindre 200 MQL/mois,Mettre en place 3 canaux,200,100,MQL,2025-03-31,Lancer campagne LinkedIn,Créer 10 posts sponsorisés,high,2025-02-15,marketing;acquisition
Lancer nouveau produit,Développer une nouvelle gamme,product,critical,2025,Finaliser le MVP,Livrer la v1.0 du produit,Q2,2025,Obtenir 50 beta testeurs,Recruter des early adopters,50,10,utilisateurs,2025-06-30,Créer landing page,Page de capture avec formulaire,medium,2025-04-10,product;dev`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'oskar_template.csv';
    link.click();
  };

  const mappedCount = useMemo(() => {
    return Object.values(mapping).filter(v => v).length;
  }, [mapping]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import CSV / Google Sheets</h1>
          <p className="text-gray-600 mt-2">
            Importez vos ambitions, objectifs, KR et actions depuis un fichier CSV
          </p>
        </div>

        {/* Template download */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary-600" />
                  Modèle CSV
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Téléchargez un modèle pré-rempli pour voir le format attendu
                </p>
              </div>
              <Button onClick={handleDownloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Télécharger le modèle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File upload */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">1. Sélectionner un fichier CSV</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-primary-600 hover:text-primary-700 font-medium">
                  Cliquez pour sélectionner un fichier
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="mt-4 text-sm text-gray-600">
                  Fichier sélectionné: <span className="font-medium">{file.name}</span>
                  <br />
                  {rows.length} ligne(s) détectée(s)
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mapping preview */}
        {headers.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                2. Vérifier le mapping automatique
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {mappedCount} colonne(s) mappée(s) automatiquement
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(mapping).map(([key, value]) => 
                  value ? (
                    <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <Badge variant="secondary" size="sm">{key}</Badge>
                      <span className="text-gray-600">→</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ) : null
                )}
              </div>
              {mappedCount === 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                  Aucune colonne n'a été détectée automatiquement. Vérifiez que vos en-têtes correspondent au modèle.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Import button */}
        {rows.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">3. Lancer l'import</h3>
              <Button
                onClick={handleImport}
                disabled={isProcessing || mappedCount === 0}
                className="w-full"
              >
                {isProcessing ? 'Import en cours...' : `Importer ${rows.length} ligne(s)`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
                <h3 className="font-semibold text-gray-900">
                  {result.success ? 'Import réussi !' : 'Import terminé avec des erreurs'}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{result.ambitionsCreated}</div>
                  <div className="text-xs text-blue-700">Objectifs annuels</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{result.objectivesCreated}</div>
                  <div className="text-xs text-green-700">Objectifs</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-2xl font-bold text-purple-600">{result.keyResultsCreated}</div>
                  <div className="text-xs text-purple-700">Key Results</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-2xl font-bold text-orange-600">{result.actionsCreated}</div>
                  <div className="text-xs text-orange-700">Actions</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h4 className="font-medium text-red-900 mb-2">Erreurs ({result.errors.length})</h4>
                  <ul className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                    {result.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button onClick={() => window.location.href = '/management'} variant="outline">
                  Voir dans Gestion
                </Button>
                <Button onClick={() => { setFile(null); setRows([]); setHeaders([]); setMapping({}); setResult(null); }}>
                  Nouvel import
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

