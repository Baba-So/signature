import React, { useState } from 'react';
import {
  Sliders,
  PenTool,
  Award,
  Move,
  RotateCw,
  Sparkles,
  Link,
  Unlink,
  Layers,
  Copy,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Check,
} from 'lucide-react';
import { OverlayElementConfig, ControlledVariations } from '../types';

export type RelativePlacement =
  | 'overlap-classic' // Standard French administrative overlap
  | 'left'            // Signature on the left of stamp
  | 'right'           // Signature on the right of stamp
  | 'above'           // Signature above stamp
  | 'below'           // Signature below stamp
  | 'centered';       // Signature centered over stamp

interface SettingsPanelProps {
  currentPage: number;
  totalPages: number;
  signatureConfig: OverlayElementConfig;
  cachetConfig: OverlayElementConfig;
  onUpdateSignature: (updates: Partial<OverlayElementConfig>) => void;
  onUpdateCachet: (updates: Partial<OverlayElementConfig>) => void;
  onApplyToAllPages: () => void;
  onResetCurrentPage: () => void;
  hasSignature: boolean;
  hasCachet: boolean;
  isLinked: boolean;
  onToggleLinked: () => void;
  variations: ControlledVariations;
  onChangeVariations: (variations: ControlledVariations) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  currentPage,
  totalPages,
  signatureConfig,
  cachetConfig,
  onUpdateSignature,
  onUpdateCachet,
  onApplyToAllPages,
  onResetCurrentPage,
  hasSignature,
  hasCachet,
  isLinked,
  onToggleLinked,
  variations,
  onChangeVariations,
}) => {
  const [activeTab, setActiveTab] = useState<'sizes' | 'relative' | 'variations'>('relative');

  // Relative offsets between Signature and Cachet (Tampon)
  // relX: signature.x - cachet.x
  // relY: signature.y - cachet.y
  const relX = Math.round((signatureConfig.x - cachetConfig.x) * 10) / 10;
  const relY = Math.round((signatureConfig.y - cachetConfig.y) * 10) / 10;

  // Apply a relative preset between signature and cachet
  const applyRelativePlacement = (mode: RelativePlacement) => {
    const stampW = cachetConfig.width;
    const sigW = signatureConfig.width;
    const stampH = stampW * 1.0; // Stamp is typically square/circular (aspect ratio ~ 1)
    const sigH = sigW * 0.42;    // Signature is typically elongated (aspect ratio ~ 2.4)

    let newSigX = signatureConfig.x;
    let newSigY = signatureConfig.y;
    let newSigRot = signatureConfig.rotation;

    switch (mode) {
      case 'overlap-classic':
        // Standard official overlap: Signature slightly overlaps bottom-left or right of stamp
        newSigX = Math.max(2, Math.min(98 - sigW, cachetConfig.x + stampW * 0.35));
        newSigY = Math.max(2, Math.min(98 - sigH, cachetConfig.y + stampH * 0.25));
        newSigRot = -3; // Slight natural handwriting slant
        break;

      case 'left':
        // Signature to the left of stamp
        newSigX = Math.max(2, cachetConfig.x - sigW - 2);
        newSigY = Math.max(2, Math.min(98 - sigH, cachetConfig.y + (stampH - sigH) / 2));
        newSigRot = 0;
        break;

      case 'right':
        // Signature to the right of stamp
        newSigX = Math.min(98 - sigW, cachetConfig.x + stampW + 2);
        newSigY = Math.max(2, Math.min(98 - sigH, cachetConfig.y + (stampH - sigH) / 2));
        newSigRot = 0;
        break;

      case 'above':
        // Signature directly above stamp
        newSigX = Math.max(2, Math.min(98 - sigW, cachetConfig.x + (stampW - sigW) / 2));
        newSigY = Math.max(2, cachetConfig.y - sigH - 2);
        newSigRot = 0;
        break;

      case 'below':
        // Signature directly below stamp
        newSigX = Math.max(2, Math.min(98 - sigW, cachetConfig.x + (stampW - sigW) / 2));
        newSigY = Math.min(98 - sigH, cachetConfig.y + stampH + 2);
        newSigRot = 0;
        break;

      case 'centered':
        // Signature centered over stamp
        newSigX = Math.max(2, Math.min(98 - sigW, cachetConfig.x + (stampW - sigW) / 2));
        newSigY = Math.max(2, Math.min(98 - sigH, cachetConfig.y + (stampH - sigH) / 2));
        newSigRot = 0;
        break;
    }

    onUpdateSignature({
      x: Math.round(newSigX * 10) / 10,
      y: Math.round(newSigY * 10) / 10,
      rotation: newSigRot,
    });
  };

  // Adjust relative delta between signature and cachet
  const handleRelativeDeltaX = (deltaX: number) => {
    const newX = Math.max(0, Math.min(100 - signatureConfig.width, cachetConfig.x + deltaX));
    onUpdateSignature({ x: Math.round(newX * 10) / 10 });
  };

  const handleRelativeDeltaY = (deltaY: number) => {
    const newY = Math.max(0, Math.min(100 - signatureConfig.width * 0.45, cachetConfig.y + deltaY));
    onUpdateSignature({ y: Math.round(newY * 10) / 10 });
  };

  // Move both signature and stamp together to standard page positions
  const handlePositionBlockOnPage = (position: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center') => {
    const currentDeltaX = signatureConfig.x - cachetConfig.x;
    const currentDeltaY = signatureConfig.y - cachetConfig.y;

    let targetStampX = 62;
    let targetStampY = 78;

    switch (position) {
      case 'bottom-right':
        targetStampX = 62;
        targetStampY = 78;
        break;
      case 'bottom-left':
        targetStampX = 12;
        targetStampY = 78;
        break;
      case 'bottom-center':
        targetStampX = 40;
        targetStampY = 78;
        break;
      case 'center':
        targetStampX = 40;
        targetStampY = 45;
        break;
    }

    const targetSigX = Math.max(2, Math.min(96 - signatureConfig.width, targetStampX + currentDeltaX));
    const targetSigY = Math.max(2, Math.min(96 - signatureConfig.width * 0.45, targetStampY + currentDeltaY));

    onUpdateCachet({ x: targetStampX, y: targetStampY });
    onUpdateSignature({ x: targetSigX, y: targetSigY });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Main Panel Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Paramètres
            </h3>
            <p className="text-[11px] text-slate-500">
              Tailles, position relative signature/tampon & variations (p. {currentPage}/{totalPages})
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onApplyToAllPages}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
            title="Appliquer ces réglages à toutes les pages du document"
          >
            <Copy className="w-3 h-3" />
            <span>Toutes les pages</span>
          </button>
          <button
            onClick={onResetCurrentPage}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition-colors cursor-pointer"
            title="Réinitialiser la page courante"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('relative')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'relative'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Position Signature / Tampon</span>
        </button>

        <button
          onClick={() => setActiveTab('sizes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'sizes'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tailles des éléments</span>
        </button>

        <button
          onClick={() => setActiveTab('variations')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'variations'
              ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Variations</span>
          {variations.enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 ml-0.5" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {/* ========================================================================= */}
        {/* TAB 1: RELATIVE POSITIONING (SIGNATURE PAR RAPPORT AU CACHET / TAMPON)     */}
        {/* ========================================================================= */}
        {activeTab === 'relative' && (
          <div className="space-y-4 text-xs">
            {/* Quick Relative Placement Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Disposition de la signature par rapport au cachet / tampon :
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ΔX: {relX > 0 ? `+${relX}` : relX}% • ΔY: {relY > 0 ? `+${relY}` : relY}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => applyRelativePlacement('overlap-classic')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 text-left transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-[11px] flex items-center gap-1 text-blue-700">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Superposé officiel
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 text-center">
                    Chevauchement classique (Visa légal)
                  </span>
                </button>

                <button
                  onClick={() => applyRelativePlacement('left')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-[11px] flex items-center gap-1 text-slate-700">
                    <AlignLeft className="w-3.5 h-3.5 text-slate-600" />
                    Signature à gauche
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 text-center">
                    Côte à côte (Tampon à droite)
                  </span>
                </button>

                <button
                  onClick={() => applyRelativePlacement('right')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-[11px] flex items-center gap-1 text-slate-700">
                    <AlignRight className="w-3.5 h-3.5 text-slate-600" />
                    Signature à droite
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 text-center">
                    Côte à côte (Tampon à gauche)
                  </span>
                </button>

                <button
                  onClick={() => applyRelativePlacement('above')}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-[11px] text-slate-700">
                    Signature au-dessus
                  </span>
                  <span className="text-[10px] text-slate-500">Tampon en dessous</span>
                </button>

                <button
                  onClick={() => applyRelativePlacement('below')}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-[11px] text-slate-700">
                    Signature en dessous
                  </span>
                  <span className="text-[10px] text-slate-500">Tampon au-dessus</span>
                </button>

                <button
                  onClick={() => applyRelativePlacement('centered')}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-[11px] text-slate-700">
                    Centré sur le tampon
                  </span>
                  <span className="text-[10px] text-slate-500">Superposition axiale</span>
                </button>
              </div>
            </div>

            {/* Fine-Tuning Relative Sliders */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Ajustement fin du décalage (Signature ↔ Tampon)
                </span>
                <span className="text-[10px] text-slate-500">En pourcentage de la page</span>
              </div>

              {/* Horizontal Offset relative to Stamp */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600">Décalage horizontal (ΔX Signature/Tampon)</span>
                  <span className="font-mono font-semibold text-blue-700">
                    {relX > 0 ? `+${relX}% (Droite)` : relX < 0 ? `${relX}% (Gauche)` : '0% (Aligné)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="0.5"
                    value={relX}
                    onChange={e => handleRelativeDeltaX(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <button
                    onClick={() => handleRelativeDeltaX(0)}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Remettre à 0"
                  >
                    0
                  </button>
                </div>
              </div>

              {/* Vertical Offset relative to Stamp */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600">Décalage vertical (ΔY Signature/Tampon)</span>
                  <span className="font-mono font-semibold text-blue-700">
                    {relY > 0 ? `+${relY}% (Bas)` : relY < 0 ? `${relY}% (Haut)` : '0% (Aligné)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    step="0.5"
                    value={relY}
                    onChange={e => handleRelativeDeltaY(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <button
                    onClick={() => handleRelativeDeltaY(0)}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Remettre à 0"
                  >
                    0
                  </button>
                </div>
              </div>

              {/* Link elements toggle */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isLinked ? (
                    <Link className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Unlink className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-800">
                      Lier la signature au cachet
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Déplacer l’un entraîne l’autre en conservant l’écartement relatif
                    </p>
                  </div>
                </div>

                <button
                  onClick={onToggleLinked}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isLinked ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isLinked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Global Block Positioning on Document */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-700">
                Position globale du bloc (Signature + Tampon) sur la page :
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handlePositionBlockOnPage('bottom-right')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium text-center transition-colors cursor-pointer"
                  title="Placer en bas à droite (recommandé devis/factures)"
                >
                  Bas Droite
                </button>
                <button
                  onClick={() => handlePositionBlockOnPage('bottom-center')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium text-center transition-colors cursor-pointer"
                  title="Placer en bas au centre"
                >
                  Bas Centre
                </button>
                <button
                  onClick={() => handlePositionBlockOnPage('bottom-left')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium text-center transition-colors cursor-pointer"
                  title="Placer en bas à gauche"
                >
                  Bas Gauche
                </button>
                <button
                  onClick={() => handlePositionBlockOnPage('center')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium text-center transition-colors cursor-pointer"
                  title="Placer au centre de la page"
                >
                  Centre
                </button>
              </div>
            </div>

            {/* Rotations */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-blue-600" />
                    Inclinaison Signature
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{signatureConfig.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={signatureConfig.rotation}
                  onChange={e => onUpdateSignature({ rotation: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Award className="w-3 h-3 text-red-600" />
                    Rotation Cachet
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{cachetConfig.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={cachetConfig.rotation}
                  onChange={e => onUpdateCachet({ rotation: parseInt(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SIZES (GESTION DES TAILLES SIGNATURE ET CACHET / TAMPON)           */}
        {/* ========================================================================= */}
        {activeTab === 'sizes' && (
          <div className="space-y-4 text-xs">
            {/* Quick Size Presets */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-800">
                Profils de tailles rapides :
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onUpdateSignature({ width: 22 });
                    onUpdateCachet({ width: 18 });
                  }}
                  className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-center transition-colors cursor-pointer"
                >
                  <span className="font-bold text-slate-700 block">Compact</span>
                  <span className="text-[10px] text-slate-500">Sig: 22% • Tampon: 18%</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateSignature({ width: 28 });
                    onUpdateCachet({ width: 22 });
                  }}
                  className="p-2 border border-blue-200 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 text-center transition-colors cursor-pointer"
                >
                  <span className="font-bold text-blue-700 block">Standard (Idéal)</span>
                  <span className="text-[10px] text-slate-500">Sig: 28% • Tampon: 22%</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateSignature({ width: 36 });
                    onUpdateCachet({ width: 28 });
                  }}
                  className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-center transition-colors cursor-pointer"
                >
                  <span className="font-bold text-slate-700 block">Grand format</span>
                  <span className="text-[10px] text-slate-500">Sig: 36% • Tampon: 28%</span>
                </button>
              </div>
            </div>

            {/* 1. Signature Size Control */}
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-blue-900">Taille de la signature</span>
                </div>
                <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {signatureConfig.width}% de la largeur
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateSignature({ width: Math.max(10, signatureConfig.width - 2) })}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 cursor-pointer"
                  title="Diminuer la taille"
                >
                  -
                </button>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={signatureConfig.width}
                  onChange={e => onUpdateSignature({ width: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
                <button
                  onClick={() => onUpdateSignature({ width: Math.min(50, signatureConfig.width + 2) })}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 cursor-pointer"
                  title="Augmenter la taille"
                >
                  +
                </button>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10% (Discret)</span>
                <span>28% (Format facture recommandé)</span>
                <span>50% (Très imposant)</span>
              </div>
            </div>

            {/* 2. Cachet / Tampon Size Control */}
            <div className="p-3 bg-red-50/40 rounded-lg border border-red-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-red-600" />
                  <span className="font-bold text-red-900">Taille du cachet / tampon</span>
                </div>
                <span className="font-mono font-bold text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
                  {cachetConfig.width}% de la largeur
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateCachet({ width: Math.max(10, cachetConfig.width - 2) })}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 cursor-pointer"
                  title="Diminuer la taille"
                >
                  -
                </button>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="1"
                  value={cachetConfig.width}
                  onChange={e => onUpdateCachet({ width: parseInt(e.target.value) })}
                  className="w-full accent-red-600"
                />
                <button
                  onClick={() => onUpdateCachet({ width: Math.min(45, cachetConfig.width + 2) })}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 cursor-pointer"
                  title="Augmenter la taille"
                >
                  +
                </button>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10% (Mini cachet)</span>
                <span>22% (Diamètre officiel standard)</span>
                <span>45% (Grand sceau d'entreprise)</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: VARIATIONS (VARIATIONS CONTRÔLÉES NATURELLES)                      */}
        {/* ========================================================================= */}
        {activeTab === 'variations' && (
          <div className="space-y-4 text-xs">
            {/* Header and Toggle */}
            <div className="flex items-center justify-between p-3 bg-purple-50/70 border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">
                    Variations naturelles (Tampon & Signature)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Simule la frappe manuelle du tampon et le tracé vivant d'une plume
                  </p>
                </div>
              </div>

              <button
                onClick={() => onChangeVariations({ ...variations, enabled: !variations.enabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
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
              <div className="space-y-3.5 pt-1">
                {/* 1. Position Variation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Amplitude de position (décalage aléatoire)</span>
                    <span className="font-mono text-purple-700 font-semibold">
                      ± {variations.positionAmplitude}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={variations.positionAmplitude}
                    onChange={e =>
                      onChangeVariations({
                        ...variations,
                        positionAmplitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0% (Fixe)</span>
                    <span>± 2.5% (Réaliste)</span>
                    <span>± 12% (Marqué)</span>
                  </div>
                </div>

                {/* 2. Rotation Variation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Amplitude de rotation (inclinaison naturelle)</span>
                    <span className="font-mono text-purple-700 font-semibold">
                      ± {variations.rotationAmplitude}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={variations.rotationAmplitude}
                    onChange={e =>
                      onChangeVariations({
                        ...variations,
                        rotationAmplitude: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0° (Droit)</span>
                    <span>± 4° (Frappe humaine)</span>
                    <span>± 15° (Très incliné)</span>
                  </div>
                </div>

                {/* 3. Size Variation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Amplitude de taille (pression d’encrage)</span>
                    <span className="font-mono text-purple-700 font-semibold">
                      ± {variations.sizeAmplitude}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={variations.sizeAmplitude}
                    onChange={e =>
                      onChangeVariations({
                        ...variations,
                        sizeAmplitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0%</span>
                    <span>± 3% (Subtil)</span>
                    <span>± 10%</span>
                  </div>
                </div>

                {/* Note */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                  <p>
                    <span className="font-semibold text-purple-700">Graine déterministe :</span>{' '}
                    Les variations sont générées de manière reproductible pour chaque numéro de page.
                    Ce que vous visualisez sur la page {currentPage} sera strictement identique dans le PDF exporté.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                <p>Les micro-variations sont désactivées.</p>
                <p className="text-[11px] mt-0.5">
                  Activez le commutateur ci-dessus pour donner un rendu naturel et authentique de coup de tampon à vos pages.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
