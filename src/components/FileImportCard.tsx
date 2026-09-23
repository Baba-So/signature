import React, { useRef } from 'react';
import {
  FileText,
  PenTool,
  Award,
  Layers,
  Upload,
  Trash2,
  CheckCircle2,
  Pen,
  Stamp,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { LoadedFile } from '../types';

interface FileImportCardProps {
  mainPdf: LoadedFile | null;
  signatureImage: LoadedFile | null;
  cachetImage: LoadedFile | null;
  headerPdf: LoadedFile | null;
  onUploadMainPdf: (file: File) => void;
  onUploadSignature: (file: File) => void;
  onUploadCachet: (file: File) => void;
  onUploadHeaderPdf: (file: File) => void;
  onRemoveMainPdf: () => void;
  onRemoveSignature: () => void;
  onRemoveCachet: () => void;
  onRemoveHeaderPdf: () => void;
  onOpenSignaturePad: () => void;
  onOpenStampGenerator: () => void;
  onLoadFullSample: () => void;
  isLoadingSample: boolean;
}

export const FileImportCard: React.FC<FileImportCardProps> = ({
  mainPdf,
  signatureImage,
  cachetImage,
  headerPdf,
  onUploadMainPdf,
  onUploadSignature,
  onUploadCachet,
  onUploadHeaderPdf,
  onRemoveMainPdf,
  onRemoveSignature,
  onRemoveCachet,
  onRemoveHeaderPdf,
  onOpenSignaturePad,
  onOpenStampGenerator,
  onLoadFullSample,
  isLoadingSample,
}) => {
  const mainPdfInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);
  const cachetInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Gestion des fichiers</h3>
          <p className="text-[11px] text-slate-500">Documents, signatures et éléments graphiques</p>
        </div>

        {/* Load Complete Demo Button */}
        <button
          onClick={onLoadFullSample}
          disabled={isLoadingSample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all shadow-2xs cursor-pointer"
          title="Charge un contrat 3 pages, une signature, un cachet et un en-tête d'exemple"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>{isLoadingSample ? 'Chargement exemple...' : 'Exemple complet'}</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {/* 1. Main PDF */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <input
            ref={mainPdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) onUploadMainPdf(e.target.files[0]);
              e.target.value = '';
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">PDF Principal</span>
                  <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">
                    Requis
                  </span>
                </div>
                {mainPdf ? (
                  <p className="text-xs text-slate-600 truncate font-medium" title={mainPdf.name}>
                    {mainPdf.name} ({formatSize(mainPdf.size)} • {mainPdf.pageCount} p.)
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">Aucun PDF sélectionné</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {mainPdf ? (
                <>
                  <button
                    onClick={() => mainPdfInputRef.current?.click()}
                    className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    Remplacer
                  </button>
                  <button
                    onClick={onRemoveMainPdf}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Retirer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => mainPdfInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Importer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Signature Image */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <input
            ref={sigInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/*"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) onUploadSignature(e.target.files[0]);
              e.target.value = '';
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <PenTool className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Signature</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG / WebP / JPG</span>
                </div>
                {signatureImage ? (
                  <p className="text-xs text-slate-600 truncate font-medium" title={signatureImage.name}>
                    {signatureImage.name} ({formatSize(signatureImage.size)})
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">Fond transparent conseillé</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {signatureImage ? (
                <>
                  <button
                    onClick={() => sigInputRef.current?.click()}
                    className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    Remplacer
                  </button>
                  <button
                    onClick={onRemoveSignature}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Retirer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onOpenSignaturePad}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Dessiner une signature manuscrite à l'écran"
                  >
                    <Pen className="w-3.5 h-3.5 text-blue-600" />
                    Dessiner
                  </button>
                  <button
                    onClick={() => sigInputRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Fichier
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. Cachet Image */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <input
            ref={cachetInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/*"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) onUploadCachet(e.target.files[0]);
              e.target.value = '';
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Cachet / Tampon</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG / WebP / JPG</span>
                </div>
                {cachetImage ? (
                  <p className="text-xs text-slate-600 truncate font-medium" title={cachetImage.name}>
                    {cachetImage.name} ({formatSize(cachetImage.size)})
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">Tampon circulaire ou carré</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {cachetImage ? (
                <>
                  <button
                    onClick={() => cachetInputRef.current?.click()}
                    className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    Remplacer
                  </button>
                  <button
                    onClick={onRemoveCachet}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Retirer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onOpenStampGenerator}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Générer un cachet d'entreprise officiel"
                  >
                    <Stamp className="w-3.5 h-3.5 text-red-600" />
                    Créer
                  </button>
                  <button
                    onClick={() => cachetInputRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Fichier
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4. Header PDF */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <input
            ref={headerInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) onUploadHeaderPdf(e.target.files[0]);
              e.target.value = '';
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">PDF En-tête</span>
                  <span className="text-[10px] text-slate-400 font-normal">Papier à lettres</span>
                </div>
                {headerPdf ? (
                  <p className="text-xs text-slate-600 truncate font-medium" title={headerPdf.name}>
                    {headerPdf.name} ({formatSize(headerPdf.size)} • {headerPdf.pageCount} p.)
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">Optionnel (fond ou surimpression)</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {headerPdf ? (
                <>
                  <button
                    onClick={() => headerInputRef.current?.click()}
                    className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    Remplacer
                  </button>
                  <button
                    onClick={onRemoveHeaderPdf}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Retirer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => headerInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Importer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
