import React, { useState, useEffect, useRef } from 'react';
import { Award, Check, X, RefreshCw } from 'lucide-react';
import { createLoadedImageFromDataUrl } from '../services/sampleData';
import { LoadedFile } from '../types';

interface StampGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: LoadedFile) => void;
}

export const StampGeneratorModal: React.FC<StampGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [topText, setTopText] = useState('DIRECTION GÉNÉRALE • PARIS');
  const [centerText, setCenterText] = useState('VU ET APPROUVÉ');
  const [dateText, setDateText] = useState(
    new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [bottomText, setBottomText] = useState('★ R.C.S. PARIS B 892 410 321 ★');
  const [color, setColor] = useState('#b91c1c'); // Red stamp

  useEffect(() => {
    if (isOpen) {
      setTimeout(renderStamp, 50);
    }
  }, [isOpen, topText, centerText, dateText, bottomText, color]);

  const renderStamp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 420;
    const h = 420;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // Outer thick circle
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 190, 0, Math.PI * 2);
    ctx.stroke();

    // Inner thin circle
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 178, 0, Math.PI * 2);
    ctx.stroke();

    // Center circle
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Center text
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(centerText, cx, cy - 14);

    if (dateText.trim()) {
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(`LE ${dateText}`, cx, cy + 18);
    }

    // Top arc
    drawCurved(ctx, topText, cx, cy, 150, Math.PI * 1.5, true);

    // Bottom arc
    drawCurved(ctx, bottomText, cx, cy, 150, Math.PI * 0.5, false);
  };

  const drawCurved = (
    ctx: CanvasRenderingContext2D,
    text: string,
    cx: number,
    cy: number,
    radius: number,
    centerAngle: number,
    top: boolean
  ) => {
    if (!text) return;
    ctx.save();
    ctx.font = 'bold 15px monospace, sans-serif';
    const totalAngle = (text.length * 8.5 * Math.PI) / 180;
    const startAngle = centerAngle - totalAngle / 2;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charAngle = startAngle + (i / (text.length - 1 || 1)) * totalAngle;
      ctx.save();
      if (top) {
        ctx.translate(cx + Math.cos(charAngle) * radius, cy + Math.sin(charAngle) * radius);
        ctx.rotate(charAngle + Math.PI / 2);
      } else {
        ctx.translate(cx + Math.cos(charAngle) * radius, cy + Math.sin(charAngle) * radius);
        ctx.rotate(charAngle - Math.PI / 2);
      }
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const loadedFile = await createLoadedImageFromDataUrl(
      dataUrl,
      'cachet_entreprise.png',
      canvas.width,
      canvas.height
    );
    onSave(loadedFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Générateur de cachet officiel</h3>
              <p className="text-xs text-slate-500">Personnalisez votre tampon encreur d’entreprise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-200">
            <canvas ref={canvasRef} className="w-56 h-56 bg-transparent" />
            <div className="mt-2 text-[11px] text-slate-400 font-medium">
              Aperçu transparent haute résolution
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Texte supérieur (Société / Ville)</label>
              <input
                type="text"
                value={topText}
                onChange={e => setTopText(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Mention centrale</label>
              <div className="flex gap-1 mb-1.5 flex-wrap">
                {['VU ET APPROUVÉ', 'BON POUR ACCORD', 'PAYÉ', 'CERTIFIÉ'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setCenterText(preset)}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={centerText}
                onChange={e => setCenterText(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Date</label>
              <input
                type="text"
                value={dateText}
                onChange={e => setDateText(e.target.value)}
                placeholder="23/09/2026"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Texte inférieur (R.C.S. / N° TVA)</label>
              <input
                type="text"
                value={bottomText}
                onChange={e => setBottomText(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Couleur d’encre</label>
              <div className="flex items-center gap-2">
                {[
                  { color: '#b91c1c', name: 'Rouge officiel' },
                  { color: '#1e3a8a', name: 'Bleu officiel' },
                  { color: '#0f172a', name: 'Noir intense' },
                  { color: '#047857', name: 'Vert émeraude' },
                ].map(item => (
                  <button
                    key={item.color}
                    onClick={() => setColor(item.color)}
                    title={item.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      color === item.color ? 'scale-110 border-slate-900 ring-2 ring-slate-300' : 'border-white'
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-sm text-white font-medium bg-red-600 hover:bg-red-700 rounded-lg shadow-xs shadow-red-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Utiliser ce cachet
          </button>
        </div>
      </div>
    </div>
  );
};
