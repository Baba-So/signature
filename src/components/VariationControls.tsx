import React from 'react';
import { Sparkles, Dices, Info, Sliders } from 'lucide-react';
import { ControlledVariations } from '../types';

interface VariationControlsProps {
  variations: ControlledVariations;
  onChange: (updated: ControlledVariations) => void;
  currentPage: number;
}

export const VariationControls: React.FC<VariationControlsProps> = ({
  variations,
  onChange,
  currentPage,
}) => {
  const toggleEnabled = () => {
    onChange({
      ...variations,
      enabled: !variations.enabled,
    });
  };

  const updateField = (field: keyof ControlledVariations, value: any) => {
    onChange({
      ...variations,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Variations contrôlées
            </h4>
            <p className="text-[11px] text-slate-500">
              Micro-variations naturelles (aspect tampon/signature humaine)
            </p>
          </div>
        </div>

        <button
          onClick={toggleEnabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            variations.enabled ? 'bg-purple-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              variations.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {variations.enabled ? (
        <div className="space-y-4 pt-1 text-xs">
          {/* 1. Position Variation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium">Amplitude de position (décalage)</span>
              <span className="font-mono text-purple-700 font-semibold">
                ± {variations.positionAmplitude}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={variations.positionAmplitude}
              onChange={e => updateField('positionAmplitude', parseFloat(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Fixe)</span>
              <span>± 5% (Subtil)</span>
              <span>± 15% (Marqué)</span>
            </div>
          </div>

          {/* 2. Rotation Variation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium">Amplitude de rotation (inclinaison)</span>
              <span className="font-mono text-purple-700 font-semibold">
                ± {variations.rotationAmplitude}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={variations.rotationAmplitude}
              onChange={e => updateField('rotationAmplitude', parseFloat(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0° (Parfait)</span>
              <span>± 6° (Naturel)</span>
              <span>± 20° (Aléatoire fort)</span>
            </div>
          </div>

          {/* 3. Size Variation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium">Amplitude de taille (échelle)</span>
              <span className="font-mono text-purple-700 font-semibold">
                ± {variations.sizeAmplitude}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={variations.sizeAmplitude}
              onChange={e => updateField('sizeAmplitude', parseFloat(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Identique)</span>
              <span>± 5% (Léger)</span>
              <span>± 25% (Important)</span>
            </div>
          </div>

          {/* Determinism explanation badge */}
          <div className="flex items-start gap-2 bg-purple-50/70 border border-purple-200/70 p-2.5 rounded-lg text-purple-900 text-[11px] leading-relaxed">
            <Dices className="w-4 h-4 shrink-0 text-purple-600 mt-0.5" />
            <div>
              <p className="font-semibold">Reproductibilité garantie par page</p>
              <p className="text-purple-700 mt-0.5">
                La page {currentPage} donnera toujours exactement les mêmes valeurs entre l'aperçu et l'export final (graine PRNG fixée par numéro de page).
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          Les variations sont actuellement désactivées. La signature et le cachet seront apposés avec une géométrie strictement identique sur chaque page.
        </div>
      )}
    </div>
  );
};
