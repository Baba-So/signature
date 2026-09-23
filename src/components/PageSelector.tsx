import React, { useState } from 'react';
import { Plus, Minus, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { PageSelectionMode } from '../types';

interface PageSelectorProps {
  title: string;
  badgeColor?: 'blue' | 'indigo' | 'red';
  totalPages: number;
  selectionMode: PageSelectionMode;
  onModeChange: (mode: PageSelectionMode) => void;
  selectedPages: number[];
  onSelectedPagesChange: (pages: number[]) => void;
  currentPage: number;
  onPageClick?: (page: number) => void;
  isItemLoaded: boolean;
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  title,
  badgeColor = 'blue',
  totalPages,
  selectionMode,
  onModeChange,
  selectedPages,
  onSelectedPagesChange,
  currentPage,
  onPageClick,
  isItemLoaded,
}) => {
  const [inputPage, setInputPage] = useState<number>(currentPage);

  const handleAddPage = () => {
    if (inputPage >= 1 && inputPage <= totalPages && !selectedPages.includes(inputPage)) {
      const updated = [...selectedPages, inputPage].sort((a, b) => a - b);
      onSelectedPagesChange(updated);
    }
  };

  const handleRemovePage = () => {
    if (selectedPages.includes(inputPage)) {
      onSelectedPagesChange(selectedPages.filter(p => p !== inputPage));
    }
  };

  const handleSelectAll = () => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    onSelectedPagesChange(all);
  };

  const handleClearAll = () => {
    onSelectedPagesChange([]);
  };

  const togglePage = (page: number) => {
    if (selectedPages.includes(page)) {
      onSelectedPagesChange(selectedPages.filter(p => p !== page));
    } else {
      onSelectedPagesChange([...selectedPages, page].sort((a, b) => a - b));
    }
  };

  const formatPageRanges = (pages: number[]): string => {
    if (pages.length === 0) return 'Aucune page';
    if (pages.length === totalPages) return `Toutes les pages (1-${totalPages})`;

    const sorted = [...pages].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = sorted[i];
        end = sorted[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
  };

  const isInvalidManualEmpty = isItemLoaded && selectionMode === 'manual' && selectedPages.length === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </h4>

        {/* Mode Selector Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => onModeChange('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              selectionMode === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes les pages
          </button>
          <button
            onClick={() => onModeChange('manual')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              selectionMode === 'manual'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sélection manuelle
          </button>
        </div>
      </div>

      {selectionMode === 'manual' ? (
        <div className="space-y-3 pt-1">
          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Page N° :</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={inputPage}
                onChange={e => setInputPage(parseInt(e.target.value) || 1)}
                className="w-14 px-2 py-1 border border-slate-300 rounded-md font-mono text-center focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleAddPage}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-md border border-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
            <button
              onClick={handleRemovePage}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-md border border-rose-200 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
              Retirer
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Tout
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Vider
              </button>
            </div>
          </div>

          {/* Quick Page Badges List */}
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-lg border border-slate-200">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              const isSelected = selectedPages.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => {
                    togglePage(p);
                    if (onPageClick) onPageClick(p);
                  }}
                  className={`w-7 h-7 text-xs font-semibold rounded-md border transition-all ${
                    isSelected
                      ? badgeColor === 'red'
                        ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                        : badgeColor === 'indigo'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                        : 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  } ${currentPage === p ? 'ring-2 ring-slate-800' : ''}`}
                  title={`Cliquer pour activer/désactiver page ${p}`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Range summary */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-500">Pages ciblées :</span>
            <span className="font-semibold text-slate-800">{formatPageRanges(selectedPages)}</span>
          </div>

          {/* Empty Warning */}
          {isInvalidManualEmpty && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Attention : aucune page sélectionnée. Cet élément ne sera pas exporté tant qu’une page n’est pas cochée.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          L'élément sera appliqué automatiquement sur les <span className="font-semibold text-slate-800">{totalPages} pages</span> du document.
        </div>
      )}
    </div>
  );
};
