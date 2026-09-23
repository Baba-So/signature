import React, { useRef, useState, useEffect } from 'react';
import { Pen, RotateCcw, Check, X } from 'lucide-react';
import { createLoadedImageFromDataUrl } from '../services/sampleData';
import { LoadedFile } from '../types';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: LoadedFile) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState('#1e3a8a'); // Blue ink
  const [lineWidth, setLineWidth] = useState(3.5);

  useEffect(() => {
    if (isOpen) {
      setTimeout(initCanvas, 50);
    }
  }, [isOpen]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL('image/png');
    const loadedFile = await createLoadedImageFromDataUrl(
      dataUrl,
      'signature_manuscrite.png',
      canvas.width,
      canvas.height
    );
    onSave(loadedFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Pen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Dessiner une signature</h3>
              <p className="text-xs text-slate-500">Signez directement à la souris ou sur écran tactile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={640}
              height={260}
              className="w-full h-48 cursor-crosshair touch-none bg-transparent"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm select-none">
                Tracez votre signature manuscrite ici...
              </div>
            )}
            <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Fond transparent
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-medium">Encre :</span>
              <div className="flex items-center gap-1.5">
                {[
                  { color: '#1e3a8a', label: 'Bleu nuit' },
                  { color: '#0f172a', label: 'Noir' },
                  { color: '#15803d', label: 'Vert' },
                ].map(item => (
                  <button
                    key={item.color}
                    onClick={() => setInkColor(item.color)}
                    title={item.label}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      inkColor === item.color ? 'scale-110 border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Épaisseur :</span>
              <input
                type="range"
                min="1.5"
                max="6"
                step="0.5"
                value={lineWidth}
                onChange={e => setLineWidth(parseFloat(e.target.value))}
                className="w-24 accent-blue-600"
              />
            </div>

            <button
              onClick={initCanvas}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Effacer
            </button>
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
            disabled={!hasDrawn}
            className="flex items-center gap-2 px-5 py-2 text-sm text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-lg shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Valider la signature
          </button>
        </div>
      </div>
    </div>
  );
};
