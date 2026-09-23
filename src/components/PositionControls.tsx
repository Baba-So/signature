import React from 'react';
import {
  PenTool,
  Award,
  RotateCw,
  Move,
  Maximize,
  Copy,
  RotateCcw,
  AlignRight,
  AlignCenter,
  AlignLeft,
} from 'lucide-react';
import { OverlayElementConfig } from '../types';

interface PositionControlsProps {
  activeTab: 'signature' | 'cachet';
  onSelectTab: (tab: 'signature' | 'cachet') => void;
  signatureConfig: OverlayElementConfig;
  cachetConfig: OverlayElementConfig;
  onUpdateSignature: (updates: Partial<OverlayElementConfig>) => void;
  onUpdateCachet: (updates: Partial<OverlayElementConfig>) => void;
  onApplyToAllPages: () => void;
  onResetCurrentPage: () => void;
  currentPage: number;
  hasSignature: boolean;
  hasCachet: boolean;
}

export const PositionControls: React.FC<PositionControlsProps> = ({
  activeTab,
  onSelectTab,
  signatureConfig,
  cachetConfig,
  onUpdateSignature,
  onUpdateCachet,
  onApplyToAllPages,
  onResetCurrentPage,
  currentPage,
  hasSignature,
  hasCachet,
}) => {
  const currentConfig = activeTab === 'signature' ? signatureConfig : cachetConfig;
  const updateCurrent = activeTab === 'signature' ? onUpdateSignature : onUpdateCachet;

  const handleQuickAlign = (type: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'center') => {
    switch (type) {
      case 'bottom-right':
        updateCurrent({ x: 65, y: 80, rotation: 0 });
        break;
      case 'bottom-center':
        updateCurrent({ x: 40, y: 80, rotation: 0 });
        break;
      case 'bottom-left':
        updateCurrent({ x: 10, y: 80, rotation: 0 });
        break;
      case 'center':
        updateCurrent({ x: 40, y: 45, rotation: 0 });
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
      {/* Header and Element Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Positionnement (Page {currentPage})
        </h4>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => onSelectTab('signature')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'signature'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Signature
            {!hasSignature && <span className="text-[10px] opacity-60">(non importée)</span>}
          </button>
          <button
            onClick={() => onSelectTab('cachet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'cachet'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Cachet
            {!hasCachet && <span className="text-[10px] opacity-60">(non importé)</span>}
          </button>
        </div>
      </div>

      {/* Sliders and Numerical Input Grid */}
      <div className="space-y-3.5 text-xs">
        {/* Horizontal Position X */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Move className="w-3.5 h-3.5 text-slate-400" />
              Position X (horizontale)
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={currentConfig.x}
                onChange={e => updateCurrent({ x: parseFloat(e.target.value) || 0 })}
                className="w-16 px-1.5 py-0.5 border border-slate-300 rounded-md text-right font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <span className="text-slate-400 text-[11px]">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={currentConfig.x}
            onChange={e => updateCurrent({ x: parseFloat(e.target.value) })}
            className={`w-full ${activeTab === 'signature' ? 'accent-blue-600' : 'accent-red-600'}`}
          />
        </div>

        {/* Vertical Position Y */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Move className="w-3.5 h-3.5 text-slate-400 rotate-90" />
              Position Y (verticale)
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={currentConfig.y}
                onChange={e => updateCurrent({ y: parseFloat(e.target.value) || 0 })}
                className="w-16 px-1.5 py-0.5 border border-slate-300 rounded-md text-right font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <span className="text-slate-400 text-[11px]">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={currentConfig.y}
            onChange={e => updateCurrent({ y: parseFloat(e.target.value) })}
            className={`w-full ${activeTab === 'signature' ? 'accent-blue-600' : 'accent-red-600'}`}
          />
        </div>

        {/* Width % */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Maximize className="w-3.5 h-3.5 text-slate-400" />
              Largeur relative
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="5"
                max="80"
                step="1"
                value={currentConfig.width}
                onChange={e => updateCurrent({ width: parseFloat(e.target.value) || 10 })}
                className="w-16 px-1.5 py-0.5 border border-slate-300 rounded-md text-right font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <span className="text-slate-400 text-[11px]">%</span>
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="70"
            step="1"
            value={currentConfig.width}
            onChange={e => updateCurrent({ width: parseFloat(e.target.value) })}
            className={`w-full ${activeTab === 'signature' ? 'accent-blue-600' : 'accent-red-600'}`}
          />
        </div>

        {/* Rotation in degrees (-180 to 180) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              Rotation
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="-180"
                max="180"
                step="1"
                value={currentConfig.rotation}
                onChange={e => updateCurrent({ rotation: parseFloat(e.target.value) || 0 })}
                className="w-16 px-1.5 py-0.5 border border-slate-300 rounded-md text-right font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <span className="text-slate-400 text-[11px]">°</span>
            </div>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={currentConfig.rotation}
            onChange={e => updateCurrent({ rotation: parseFloat(e.target.value) })}
            className={`w-full ${activeTab === 'signature' ? 'accent-blue-600' : 'accent-red-600'}`}
          />
        </div>
      </div>

      {/* Quick Alignments */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
        <span className="text-slate-500 font-medium">Alignement rapide :</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleQuickAlign('bottom-left')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            title="Bas gauche"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleQuickAlign('bottom-center')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            title="Bas centre"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleQuickAlign('bottom-right')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            title="Bas droite"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-page propagation & Reset */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={onApplyToAllPages}
          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 transition-colors"
          title="Copier les coordonnées actuelles vers toutes les pages du document"
        >
          <Copy className="w-3 h-3" />
          Appliquer à toutes les pages
        </button>
        <button
          onClick={onResetCurrentPage}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
          title="Réinitialiser la disposition pour cette page"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser page
        </button>
      </div>
    </div>
  );
};
