import React, { useState } from 'react';
import {
  Download,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCode,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  Layers,
  Award,
  PenTool,
} from 'lucide-react';
import {
  ControlledVariations,
  ExportProgress,
  HeaderLayerMode,
  LoadedFile,
  PageSelectionMode,
  PresetProfileId,
} from '../types';
import { PRESET_PROFILES } from '../services/profiles';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainPdf: LoadedFile;
  headerPdf: LoadedFile | null;
  headerLayerMode: HeaderLayerMode;
  headerSelectionMode: PageSelectionMode;
  headerTargetPages: number[];
  signatureImage: LoadedFile | null;
  signatureSelectionMode: PageSelectionMode;
  signatureTargetPages: number[];
  cachetImage: LoadedFile | null;
  cachetSelectionMode: PageSelectionMode;
  cachetTargetPages: number[];
  activeProfile: PresetProfileId;
  variations: ControlledVariations;
  exportProgress: ExportProgress;
  onConfirmExport: () => void;
  onViewAuditLog: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  mainPdf,
  headerPdf,
  headerLayerMode,
  headerSelectionMode,
  headerTargetPages,
  signatureImage,
  signatureSelectionMode,
  signatureTargetPages,
  cachetImage,
  cachetSelectionMode,
  cachetTargetPages,
  activeProfile,
  variations,
  exportProgress,
  onConfirmExport,
  onViewAuditLog,
}) => {
  if (!isOpen) return null;

  // Keyboard shortcut listener for Enter and Escape inside the modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!exportProgress.isExporting) {
          e.preventDefault();
          onClose();
        }
      } else if (e.key === 'Enter' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's')) {
        if (!exportProgress.isExporting && !exportProgress.completed) {
          e.preventDefault();
          onConfirmExport();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exportProgress.isExporting, exportProgress.completed, onClose, onConfirmExport]);

  const totalPages = mainPdf.pageCount || 1;
  const profileName = PRESET_PROFILES[activeProfile]?.name || activeProfile;

  const formatPagesText = (mode: PageSelectionMode, list: number[]) => {
    if (mode === 'all') return `Toutes les pages (1 à ${totalPages})`;
    if (list.length === 0) return 'Aucune page (non appliqué)';
    return `${list.length} page(s) : [${list.join(', ')}]`;
  };

  const handleDownloadPdf = () => {
    if (!exportProgress.exportedBlob || !exportProgress.exportedFilename) return;
    const url = URL.createObjectURL(exportProgress.exportedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportProgress.exportedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudit = () => {
    if (!exportProgress.auditBlob || !exportProgress.auditFilename) return;
    const url = URL.createObjectURL(exportProgress.auditBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportProgress.auditFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBoth = () => {
    handleDownloadPdf();
    setTimeout(handleDownloadAudit, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                {exportProgress.completed
                  ? 'Exportation terminée avec succès'
                  : exportProgress.isExporting
                  ? 'Génération du document en cours...'
                  : 'Résumé et confirmation d’export'}
              </h3>
              <p className="text-xs text-slate-500">
                {exportProgress.completed
                  ? 'Le document et sa piste d’audit sont prêts'
                  : 'Vérifiez les paramètres avant l’assemblage final'}
              </p>
            </div>
          </div>

          {!exportProgress.isExporting && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Ongoing Export Progress Bar */}
          {exportProgress.isExporting && (
            <div className="space-y-3 py-4 text-center">
              <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="font-semibold text-slate-800 text-sm">{exportProgress.stepMessage}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Veuillez patienter sans fermer la fenêtre...
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>
              <div className="text-xs font-mono text-slate-500 text-right">
                {exportProgress.percent}%
              </div>
            </div>
          )}

          {/* Success Screen */}
          {exportProgress.completed && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-900 text-sm">
                    Document PDF assemblé et sécurisé !
                  </p>
                  <p className="text-emerald-800">
                    Fichier : <span className="font-mono font-bold">{exportProgress.exportedFilename}</span>
                  </p>
                  <p className="text-emerald-700">
                    La piste d'audit cryptographique <span className="font-mono font-semibold">{exportProgress.auditFilename}</span> a été générée avec l’empreinte SHA-256 de chaque ressource.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Downloads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le PDF signé
                </button>

                <button
                  onClick={handleDownloadAudit}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  Télécharger l'audit (.jsonl)
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={onViewAuditLog}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Consulter le journal d’audit dans l’application
                </button>

                <button
                  onClick={handleDownloadBoth}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tout télécharger (PDF + Audit)
                </button>
              </div>
            </div>
          )}

          {/* Pre-export Confirmation Summary */}
          {!exportProgress.isExporting && !exportProgress.completed && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Document PDF source</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[260px]">
                    {mainPdf.name} ({totalPages} page{totalPages > 1 ? 's' : ''})
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    Signature
                  </span>
                  <span className="font-semibold text-slate-800">
                    {signatureImage ? (
                      <span className="text-blue-700">
                        Oui • {formatPagesText(signatureSelectionMode, signatureTargetPages)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Non importée</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-red-600" />
                    Cachet / Tampon
                  </span>
                  <span className="font-semibold text-slate-800">
                    {cachetImage ? (
                      <span className="text-red-700">
                        Oui • {formatPagesText(cachetSelectionMode, cachetTargetPages)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Non importé</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    En-tête PDF
                  </span>
                  <span className="font-semibold text-slate-800">
                    {headerPdf ? (
                      <span className="text-indigo-700">
                        {headerLayerMode === 'behind' ? 'Arrière-plan (Derrière)' : 'Premier plan (Devant)'} •{' '}
                        {formatPagesText(headerSelectionMode, headerTargetPages)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Aucun en-tête</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Profil actif & Variations
                  </span>
                  <span className="font-semibold text-slate-800">
                    Profil « {profileName} » •{' '}
                    {variations.enabled ? (
                      <span className="text-purple-700 font-bold">Variations actives</span>
                    ) : (
                      <span className="text-slate-400">Sans variation</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Text Preservation Guarantee Notice */}
              <div className="flex items-start gap-2.5 p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-blue-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Préservation intégrale du document :</span> Le texte et les vecteurs de votre PDF original restent 100% vectoriels, sélectionnables et intacts. Seuls les calques demandés y sont superposés.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {exportProgress.completed ? (
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Fermer
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={exportProgress.isExporting}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                title="Annuler (Échap)"
              >
                <span>Annuler</span>
                <kbd className="px-1.5 py-0.2 text-[10px] font-mono bg-slate-200/80 text-slate-600 rounded">
                  Échap
                </kbd>
              </button>
              <button
                onClick={onConfirmExport}
                disabled={exportProgress.isExporting}
                className="flex items-center gap-2 px-5 py-2 text-sm text-white font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs shadow-emerald-500/20 transition-all cursor-pointer"
                title="Lancer l'exportation (Entrée ou Ctrl+S)"
              >
                <Download className="w-4 h-4" />
                <span>Lancer l'exportation</span>
                <kbd className="px-1.5 py-0.2 text-[10px] font-mono bg-emerald-700/80 text-emerald-100 rounded border border-emerald-500/40">
                  Entrée
                </kbd>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
