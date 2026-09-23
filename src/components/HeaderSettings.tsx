import React from 'react';
import { Layers, FileText } from 'lucide-react';
import { HeaderLayerMode, LoadedFile, PageSelectionMode } from '../types';
import { PageSelector } from './PageSelector';

interface HeaderSettingsProps {
  headerPdf: LoadedFile | null;
  layerMode: HeaderLayerMode;
  onLayerModeChange: (mode: HeaderLayerMode) => void;
  selectionMode: PageSelectionMode;
  onSelectionModeChange: (mode: PageSelectionMode) => void;
  selectedPages: number[];
  onSelectedPagesChange: (pages: number[]) => void;
  totalPages: number;
  currentPage: number;
  onPageClick: (page: number) => void;
}

export const HeaderSettings: React.FC<HeaderSettingsProps> = ({
  headerPdf,
  layerMode,
  onLayerModeChange,
  selectionMode,
  onSelectionModeChange,
  selectedPages,
  onSelectedPagesChange,
  totalPages,
  currentPage,
  onPageClick,
}) => {
  if (!headerPdf) {
    return (
      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 text-center">
        <FileText className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
        <p className="font-medium text-slate-700">Aucun en-tête importé</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Chargez un PDF d'en-tête pour configurer la superposition papier à lettres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Layer Placement (Behind vs In Front) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Calque d'en-tête (Superposition)
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onLayerModeChange('behind')}
            className={`p-3 rounded-xl border text-left transition-all ${
              layerMode === 'behind'
                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-200'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="font-semibold mb-0.5">Derrière le contenu</div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Recommandé : agit comme un fond de page / papier à lettres d'entreprise sous votre texte.
            </p>
          </button>

          <button
            onClick={() => onLayerModeChange('in_front')}
            className={`p-3 rounded-xl border text-left transition-all ${
              layerMode === 'in_front'
                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-200'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="font-semibold mb-0.5">Devant le contenu</div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Surimpression : les éléments de l'en-tête recouvrent le document original.
            </p>
          </button>
        </div>

        {headerPdf.pageCount && headerPdf.pageCount > 1 && (
          <div className="text-[11px] text-indigo-700 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-200/60">
            ℹ️ En-tête multi-pages ({headerPdf.pageCount} pages) : chaque page N du document recevra la page N de l’en-tête. La dernière page ({headerPdf.pageCount}) sera réutilisée pour les pages suivantes.
          </div>
        )}
      </div>

      {/* Page Selection for Header */}
      <PageSelector
        title="Pages avec en-tête"
        badgeColor="indigo"
        totalPages={totalPages}
        selectionMode={selectionMode}
        onModeChange={onSelectionModeChange}
        selectedPages={selectedPages}
        onSelectedPagesChange={onSelectedPagesChange}
        currentPage={currentPage}
        onPageClick={onPageClick}
        isItemLoaded={true}
      />
    </div>
  );
};
