import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Check,
  X,
  RefreshCw,
  Download,
  Sparkles,
  Circle,
  Square,
  ShieldCheck,
  Scale,
  Star,
  CheckCircle2,
  Building,
  Calendar,
  Layers,
  Palette,
  Type,
} from 'lucide-react';
import { createLoadedImageFromDataUrl } from '../services/sampleData';
import { LoadedFile } from '../types';

export type StampShape = 'circle' | 'rectangle' | 'oval' | 'badge';
export type StampFontFamily = 'sans' | 'serif' | 'mono';
export type StampCenterIcon = 'none' | 'star' | 'shield' | 'check' | 'scale' | 'building';

interface StampPreset {
  id: string;
  name: string;
  shape: StampShape;
  topText: string;
  centerText: string;
  bottomText: string;
  subText: string;
  color: string;
  fontFamily: StampFontFamily;
  centerIcon: StampCenterIcon;
  borderWidth: number;
  grunge: number;
}

const STAMP_PRESETS: StampPreset[] = [
  {
    id: 'direction_generale',
    name: 'Direction Générale',
    shape: 'circle',
    topText: 'DIRECTION GÉNÉRALE • PARIS',
    centerText: 'VU ET APPROUVÉ',
    bottomText: '★ R.C.S. PARIS B 892 410 321 ★',
    subText: 'FRANCE',
    color: '#b91c1c', // Rouge officiel
    fontFamily: 'sans',
    centerIcon: 'star',
    borderWidth: 5,
    grunge: 15,
  },
  {
    id: 'societe_sarl',
    name: 'Société / SIRET',
    shape: 'rectangle',
    topText: 'GROUPE DUPONT & ASSOCIÉS',
    centerText: 'BON POUR ACCORD',
    bottomText: 'SIRET 493 820 194 00028 • APE 7022Z',
    subText: 'SAS au capital de 50 000 €',
    color: '#1e3a8a', // Bleu marine
    fontFamily: 'sans',
    centerIcon: 'building',
    borderWidth: 4,
    grunge: 10,
  },
  {
    id: 'facture_payee',
    name: 'Facture Payée',
    shape: 'badge',
    topText: 'SERVICE COMPTABILITÉ',
    centerText: 'PAYÉ',
    bottomText: 'RÈGLEMENT EFFECTUÉ PAR VIREMENT',
    subText: 'ACQUITTÉ',
    color: '#047857', // Vert émeraude
    fontFamily: 'sans',
    centerIcon: 'check',
    borderWidth: 6,
    grunge: 25,
  },
  {
    id: 'copie_conforme',
    name: 'Copie Conforme',
    shape: 'circle',
    topText: 'CERTIFICATION ADMINISTRATIVE',
    centerText: 'COPIE CONFORME',
    bottomText: '★ DOCUMENT ORIGINAL PRÉSENTÉ ★',
    subText: 'POUR VALOIR CE QUE DE DROIT',
    color: '#1d4ed8', // Bleu royal
    fontFamily: 'serif',
    centerIcon: 'shield',
    borderWidth: 5,
    grunge: 20,
  },
  {
    id: 'notariat_legal',
    name: 'Visa Notarial / Juridique',
    shape: 'oval',
    topText: 'ÉTUDE NOTARIALE ET JURIDIQUE',
    centerText: 'LU ET APPROUVÉ',
    bottomText: 'ENREGISTRÉ AU REGISTRE OFFICIEL',
    subText: 'MENTION LÉGALE',
    color: '#6b21a8', // Pourpre notarial
    fontFamily: 'serif',
    centerIcon: 'scale',
    borderWidth: 4,
    grunge: 12,
  },
  {
    id: 'confidentiel',
    name: 'Strictement Confidentiel',
    shape: 'badge',
    topText: 'DIFFUSION RESTREINTE',
    centerText: 'CONFIDENTIEL',
    bottomText: 'REPRODUCTION STRICTEMENT INTERDITE',
    subText: 'SECRET PROFESSIONNEL',
    color: '#b91c1c', // Rouge
    fontFamily: 'mono',
    centerIcon: 'shield',
    borderWidth: 6,
    grunge: 30,
  },
];

const PRESET_COLORS = [
  { color: '#b91c1c', name: 'Rouge officiel' },
  { color: '#1e3a8a', name: 'Bleu marine' },
  { color: '#1d4ed8', name: 'Bleu cachet' },
  { color: '#047857', name: 'Vert visa' },
  { color: '#6b21a8', name: 'Pourpre notarial' },
  { color: '#0f172a', name: 'Noir d’archive' },
  { color: '#c2410c', name: 'Brique / Rouille' },
];

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

  // Active configuration states
  const [shape, setShape] = useState<StampShape>('circle');
  const [topText, setTopText] = useState('DIRECTION GÉNÉRALE • PARIS');
  const [centerText, setCenterText] = useState('VU ET APPROUVÉ');
  const [dateText, setDateText] = useState(
    new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [bottomText, setBottomText] = useState('★ R.C.S. PARIS B 892 410 321 ★');
  const [subText, setSubText] = useState('');
  const [color, setColor] = useState('#b91c1c');
  const [fontFamily, setFontFamily] = useState<StampFontFamily>('sans');
  const [centerIcon, setCenterIcon] = useState<StampCenterIcon>('star');
  const [borderWidth, setBorderWidth] = useState<number>(5);
  const [grunge, setGrunge] = useState<number>(15); // 0 (net) to 50 (authentique usé)
  const [showDate, setShowDate] = useState<boolean>(true);

  // UI tabs
  const [activeTab, setActiveTab] = useState<'presets' | 'content' | 'style'>('presets');
  const [previewBg, setPreviewBg] = useState<'grid' | 'white' | 'paper'>('grid');

  // Load a preset
  const applyPreset = (preset: StampPreset) => {
    setShape(preset.shape);
    setTopText(preset.topText);
    setCenterText(preset.centerText);
    setBottomText(preset.bottomText);
    setSubText(preset.subText);
    setColor(preset.color);
    setFontFamily(preset.fontFamily);
    setCenterIcon(preset.centerIcon);
    setBorderWidth(preset.borderWidth);
    setGrunge(preset.grunge);
  };

  // Redraw canvas whenever parameters change
  useEffect(() => {
    if (isOpen) {
      setTimeout(renderStamp, 30);
    }
  }, [
    isOpen,
    shape,
    topText,
    centerText,
    dateText,
    bottomText,
    subText,
    color,
    fontFamily,
    centerIcon,
    borderWidth,
    grunge,
    showDate,
  ]);

  // Main canvas renderer
  const renderStamp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 500;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    const getFont = (weight: string, px: number) => {
      switch (fontFamily) {
        case 'serif':
          return `${weight} ${px}px "Times New Roman", Times, Georgia, serif`;
        case 'mono':
          return `${weight} ${px}px "Courier New", Courier, monospace`;
        case 'sans':
        default:
          return `${weight} ${px}px system-ui, -apple-system, sans-serif`;
      }
    };

    if (shape === 'circle') {
      renderCircleStamp(ctx, cx, cy, getFont);
    } else if (shape === 'rectangle') {
      renderRectangleStamp(ctx, cx, cy, getFont);
    } else if (shape === 'oval') {
      renderOvalStamp(ctx, cx, cy, getFont);
    } else if (shape === 'badge') {
      renderBadgeStamp(ctx, cx, cy, getFont);
    }

    // Apply authentic grunge weathering effect if requested
    if (grunge > 0) {
      applyGrungeEffect(ctx, size, size, grunge);
    }
  };

  // 1. Circle Stamp Renderer
  const renderCircleStamp = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    getFont: (w: string, px: number) => string
  ) => {
    // Outer thick circle
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    ctx.stroke();

    // Inner thin circle
    ctx.lineWidth = Math.max(1.5, borderWidth * 0.4);
    ctx.beginPath();
    ctx.arc(cx, cy, 206, 0, Math.PI * 2);
    ctx.stroke();

    // Center divider circle
    ctx.lineWidth = Math.max(1.5, borderWidth * 0.35);
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.stroke();

    // Center icon
    if (centerIcon !== 'none') {
      drawIcon(ctx, centerIcon, cx, cy - 42, 20);
    }

    // Center main text
    ctx.font = getFont('bold', 24);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(centerText, cx, centerIcon !== 'none' ? cy - 12 : cy - 16);

    // Date
    if (showDate && dateText.trim()) {
      ctx.font = getFont('600', 16);
      ctx.fillText(`LE ${dateText.trim()}`, cx, cy + 20);
    }

    // Optional subtext
    if (subText.trim()) {
      ctx.font = getFont('500', 12);
      ctx.fillText(subText.trim(), cx, cy + 44);
    }

    // Top curved text (along arc)
    drawCurvedText(ctx, topText, cx, cy, 175, Math.PI * 1.5, true, getFont('bold', 17));

    // Bottom curved text (along arc)
    drawCurvedText(ctx, bottomText, cx, cy, 175, Math.PI * 0.5, false, getFont('bold', 15));
  };

  // 2. Rectangle Stamp Renderer
  const renderRectangleStamp = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    getFont: (w: string, px: number) => string
  ) => {
    const rx = 25;
    const ry = 60;
    const rw = 450;
    const rh = 380;

    // Outer double border
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(rx, ry, rw, rh);

    ctx.lineWidth = Math.max(1.5, borderWidth * 0.4);
    ctx.strokeRect(rx + 8, ry + 8, rw - 16, rh - 16);

    // Inner decorative framing line
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx + 20, ry + 95);
    ctx.lineTo(rx + rw - 20, ry + 95);
    ctx.moveTo(rx + 20, ry + rh - 85);
    ctx.lineTo(rx + rw - 20, ry + rh - 85);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top: Company Name
    ctx.font = getFont('bold', 22);
    ctx.fillText(topText, cx, ry + 42);

    // Top Sub: Legal form & capital
    if (subText.trim()) {
      ctx.font = getFont('500', 13);
      ctx.fillText(subText.trim(), cx, ry + 70);
    }

    // Center icon
    if (centerIcon !== 'none') {
      drawIcon(ctx, centerIcon, cx, cy - 25, 22);
    }

    // Center Box Mention
    ctx.font = getFont('bold', 28);
    ctx.fillText(centerText, cx, centerIcon !== 'none' ? cy + 10 : cy - 5);

    // Date
    if (showDate && dateText.trim()) {
      ctx.font = getFont('600', 17);
      ctx.fillText(`Date : ${dateText.trim()}`, cx, cy + 48);
    }

    // Bottom: Legal mentions (SIRET / RCS)
    ctx.font = getFont('bold', 13);
    ctx.fillText(bottomText, cx, ry + rh - 45);
  };

  // 3. Oval Stamp Renderer
  const renderOvalStamp = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    getFont: (w: string, px: number) => string
  ) => {
    const rxOuter = 225;
    const ryOuter = 165;

    // Outer ellipse
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rxOuter, ryOuter, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner thin ellipse
    ctx.lineWidth = Math.max(1.5, borderWidth * 0.4);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rxOuter - 12, ryOuter - 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Center ellipse
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 140, 85, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (centerIcon !== 'none') {
      drawIcon(ctx, centerIcon, cx, cy - 35, 18);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = getFont('bold', 23);
    ctx.fillText(centerText, cx, centerIcon !== 'none' ? cy - 8 : cy - 12);

    if (showDate && dateText.trim()) {
      ctx.font = getFont('600', 15);
      ctx.fillText(`LE ${dateText.trim()}`, cx, cy + 22);
    }

    if (subText.trim()) {
      ctx.font = getFont('500', 11);
      ctx.fillText(subText.trim(), cx, cy + 42);
    }

    // Curved texts
    drawCurvedText(ctx, topText, cx, cy, 140, Math.PI * 1.5, true, getFont('bold', 15));
    drawCurvedText(ctx, bottomText, cx, cy, 140, Math.PI * 0.5, false, getFont('bold', 13));
  };

  // 4. Badge / Validation Stamp Renderer
  const renderBadgeStamp = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    getFont: (w: string, px: number) => string
  ) => {
    const w = 440;
    const h = 260;
    const x = cx - w / 2;
    const y = cy - h / 2;
    const cut = 25; // chamfer corner

    // Outer chamfered badge
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + w - cut, y);
    ctx.lineTo(x + w, y + cut);
    ctx.lineTo(x + w, y + h - cut);
    ctx.lineTo(x + w - cut, y + h);
    ctx.lineTo(x + cut, y + h);
    ctx.lineTo(x, y + h - cut);
    ctx.lineTo(x, y + cut);
    ctx.closePath();
    ctx.stroke();

    // Inner chamfered frame
    const inPad = 8;
    ctx.lineWidth = Math.max(1.5, borderWidth * 0.4);
    ctx.beginPath();
    ctx.moveTo(x + inPad + cut, y + inPad);
    ctx.lineTo(x + w - inPad - cut, y + inPad);
    ctx.lineTo(x + w - inPad, y + inPad + cut);
    ctx.lineTo(x + w - inPad, y + h - inPad - cut);
    ctx.lineTo(x + w - inPad - cut, y + h - inPad);
    ctx.lineTo(x + inPad + cut, y + h - inPad);
    ctx.lineTo(x + inPad, y + h - inPad - cut);
    ctx.lineTo(x + inPad, y + inPad + cut);
    ctx.closePath();
    ctx.stroke();

    // Top banner text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = getFont('bold', 15);
    ctx.fillText(topText, cx, y + 36);

    // Decorative horizontal separator lines
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 58);
    ctx.lineTo(x + w - 30, y + 58);
    ctx.moveTo(x + 30, y + h - 55);
    ctx.lineTo(x + w - 30, y + h - 55);
    ctx.stroke();

    // Big central impact word
    ctx.font = getFont('900', 36);
    ctx.fillText(centerText, cx, cy - 5);

    // Date & subtext
    if (showDate && dateText.trim()) {
      ctx.font = getFont('bold', 15);
      ctx.fillText(`LE ${dateText.trim()}`, cx, cy + 34);
    }

    // Bottom banner
    ctx.font = getFont('600', 12);
    ctx.fillText(bottomText, cx, y + h - 28);
  };

  // Helper: Draw curved text along circle/ellipse
  const drawCurvedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    cx: number,
    cy: number,
    radius: number,
    centerAngle: number,
    top: boolean,
    fontString: string
  ) => {
    if (!text) return;
    ctx.save();
    ctx.font = fontString;
    const letterSpacing = 8.5;
    const totalAngle = (text.length * letterSpacing * Math.PI) / 180;
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

  // Helper: Simple crisp vector icons on canvas
  const drawIcon = (
    ctx: CanvasRenderingContext2D,
    icon: StampCenterIcon,
    x: number,
    y: number,
    size: number
  ) => {
    ctx.save();
    ctx.translate(x, y);

    if (icon === 'star') {
      // Draw 5-pointed star
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const ix = Math.cos(outerAngle) * size;
        const iy = Math.sin(outerAngle) * size;
        if (i === 0) ctx.moveTo(ix, iy);
        else ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
    } else if (icon === 'check') {
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-size * 0.6, 0);
      ctx.lineTo(-size * 0.1, size * 0.5);
      ctx.lineTo(size * 0.7, -size * 0.5);
      ctx.stroke();
    } else if (icon === 'shield') {
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-size * 0.7, -size * 0.6);
      ctx.lineTo(size * 0.7, -size * 0.6);
      ctx.lineTo(size * 0.7, 0);
      ctx.bezierCurveTo(size * 0.7, size * 0.7, 0, size * 0.9, 0, size);
      ctx.bezierCurveTo(0, size * 0.9, -size * 0.7, size * 0.7, -size * 0.7, 0);
      ctx.closePath();
      ctx.stroke();
    } else if (icon === 'scale') {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.moveTo(-size, -size * 0.4);
      ctx.lineTo(size, -size * 0.4);
      ctx.stroke();
    } else if (icon === 'building') {
      ctx.lineWidth = 2;
      ctx.strokeRect(-size * 0.6, -size * 0.6, size * 1.2, size * 1.4);
      ctx.strokeRect(-size * 0.2, size * 0.2, size * 0.4, size * 0.6);
    }

    ctx.restore();
  };

  // Helper: Authentic ink grunge & weathering
  const applyGrungeEffect = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number
  ) => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    // Deterministic pseudo-random spots
    const numSpots = Math.round(intensity * 15);
    let seed = 42;
    const pseudoRand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < numSpots; i++) {
      const rx = pseudoRand() * width;
      const ry = pseudoRand() * height;
      const r = pseudoRand() * 2.2 + 0.4;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${pseudoRand() * 0.85 + 0.15})`;
      ctx.fill();
    }

    // Micro grain scratches
    const numScratches = Math.round(intensity * 1.5);
    for (let j = 0; j < numScratches; j++) {
      const sx = pseudoRand() * width;
      const sy = pseudoRand() * height;
      const len = pseudoRand() * 14 + 3;
      const ang = pseudoRand() * Math.PI * 2;
      ctx.lineWidth = pseudoRand() * 1.2 + 0.4;
      ctx.strokeStyle = `rgba(0, 0, 0, ${pseudoRand() * 0.7 + 0.2})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Export & save to app
  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const filename = `cachet_${shape}_${Date.now()}.png`;
    const loadedFile = await createLoadedImageFromDataUrl(
      dataUrl,
      filename,
      canvas.width,
      canvas.height
    );
    onSave(loadedFile);
    onClose();
  };

  // Direct PNG download
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `cachet_officiel_${shape}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Atelier Générateur de Cachet Pro</h3>
              <p className="text-xs text-slate-500">
                Créez des tampons officiels : ronds, rectangulaires, ovales et badges d’authentification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Live Canvas Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            {/* Background switcher */}
            <div className="w-full flex items-center justify-between text-[11px] text-slate-500 pb-1">
              <span className="font-semibold text-slate-700">Aperçu en direct :</span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewBg('grid')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    previewBg === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Fond damier transparent"
                >
                  Damier
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('white')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    previewBg === 'white' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Fond blanc papier"
                >
                  Blanc
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('paper')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    previewBg === 'paper' ? 'bg-amber-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Fond document crème"
                >
                  Document
                </button>
              </div>
            </div>

            {/* Canvas Box */}
            <div
              className={`w-64 h-64 sm:w-72 sm:h-72 rounded-xl flex items-center justify-center p-3 shadow-inner border transition-all ${
                previewBg === 'grid'
                  ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100/80 border-slate-300'
                  : previewBg === 'white'
                  ? 'bg-white border-slate-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <canvas ref={canvasRef} className="max-w-full max-h-full object-contain drop-shadow-xs" />
            </div>

            {/* Quick stats / Download button */}
            <div className="w-full flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-mono">
                500 × 500 px • PNG 32-bit
              </span>
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Enregistrer le fichier image PNG sur votre ordinateur"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Télécharger PNG</span>
              </button>
            </div>
          </div>

          {/* Right Column: Configuration Tabs */}
          <div className="lg:col-span-7 flex flex-col space-y-3.5">
            {/* Navigation Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-white text-red-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modèles & Formes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'content'
                    ? 'bg-white text-red-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Mentions & Textes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'style'
                    ? 'bg-white text-red-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Encre & Style</span>
              </button>
            </div>

            {/* TAB 1: PRESETS & SHAPES */}
            {activeTab === 'presets' && (
              <div className="space-y-4 text-xs">
                {/* Shapes Selector */}
                <div>
                  <span className="font-semibold text-slate-800 block mb-1.5">
                    Géométrie du cachet :
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'circle', label: 'Rond', icon: <Circle className="w-4 h-4" /> },
                      { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
                      { id: 'oval', label: 'Ovale', icon: <Layers className="w-4 h-4" /> },
                      { id: 'badge', label: 'Badge', icon: <Award className="w-4 h-4" /> },
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setShape(s.id as StampShape)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          shape === s.id
                            ? 'border-red-500 bg-red-50 text-red-800 font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className={shape === s.id ? 'text-red-600' : 'text-slate-500'}>
                          {s.icon}
                        </span>
                        <span className="mt-1 text-[11px]">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ready-to-use Presets */}
                <div>
                  <span className="font-semibold text-slate-800 block mb-1.5">
                    Modèles prêts à l’emploi en 1 clic :
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {STAMP_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="flex flex-col p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-red-300 text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-slate-800 text-[11px] group-hover:text-red-700">
                            {preset.name}
                          </span>
                          <span
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: preset.color }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 font-mono line-clamp-1">
                          « {preset.centerText} » • {preset.shape}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEXTS & CONTENT */}
            {activeTab === 'content' && (
              <div className="space-y-3 text-xs">
                {/* Mention Centrale */}
                <div className="p-2.5 bg-red-50/40 rounded-xl border border-red-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-red-950">Mention centrale principale</label>
                    <span className="text-[10px] text-slate-400">Texte fort</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {[
                      'VU ET APPROUVÉ',
                      'BON POUR ACCORD',
                      'PAYÉ',
                      'CERTIFIÉ CONFORME',
                      'ACQUITTÉ',
                      'CONFIDENTIEL',
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCenterText(preset)}
                        className="px-2 py-0.5 text-[10px] bg-white hover:bg-red-100 hover:text-red-800 text-slate-700 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={centerText}
                    onChange={e => setCenterText(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold tracking-wide"
                  />
                </div>

                {/* Top Text */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Texte supérieur (Société, Organisme ou Service)
                  </label>
                  <input
                    type="text"
                    value={topText}
                    onChange={e => setTopText(e.target.value)}
                    placeholder="DIRECTION GÉNÉRALE • PARIS"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>

                {/* Date Setting */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 font-semibold">Date d’apposition</label>
                      <button
                        type="button"
                        onClick={() =>
                          setDateText(
                            new Date().toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          )
                        }
                        className="text-[10px] text-red-600 hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        Aujourd'hui
                      </button>
                    </div>
                    <input
                      type="text"
                      value={dateText}
                      disabled={!showDate}
                      onChange={e => setDateText(e.target.value)}
                      placeholder="23/09/2026"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                  <div className="pt-4 flex items-center">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showDate}
                        onChange={e => setShowDate(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>Afficher la date</span>
                    </label>
                  </div>
                </div>

                {/* Bottom Legal Text */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Texte inférieur (R.C.S., SIRET, TVA ou Ville)
                  </label>
                  <input
                    type="text"
                    value={bottomText}
                    onChange={e => setBottomText(e.target.value)}
                    placeholder="★ R.C.S. PARIS B 892 410 321 ★"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>

                {/* Subtext */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ligne d’information secondaire (optionnel)
                  </label>
                  <input
                    type="text"
                    value={subText}
                    onChange={e => setSubText(e.target.value)}
                    placeholder="SAS au capital de 50 000 € / France"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: STYLE, INK & WEATHERING */}
            {activeTab === 'style' && (
              <div className="space-y-3.5 text-xs">
                {/* Ink Color Selector */}
                <div>
                  <span className="font-semibold text-slate-800 block mb-1.5">
                    Couleur de l’encre de tampon :
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_COLORS.map(item => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => setColor(item.color)}
                        title={item.name}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                          color.toLowerCase() === item.color.toLowerCase()
                            ? 'scale-115 border-slate-900 ring-2 ring-slate-400'
                            : 'border-white hover:scale-105'
                        }`}
                        style={{ backgroundColor: item.color }}
                      />
                    ))}
                    {/* Custom Color Input */}
                    <label
                      title="Couleur personnalisée"
                      className="relative w-7 h-7 rounded-full border-2 border-slate-300 overflow-hidden cursor-pointer flex items-center justify-center bg-conic-gradient hover:scale-105 transition-transform"
                    >
                      <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Palette className="w-3.5 h-3.5 text-slate-600" />
                    </label>
                  </div>
                </div>

                {/* Typography Choice */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">
                      Style typographique :
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'sans', label: 'Moderne' },
                        { id: 'serif', label: 'Juridique' },
                        { id: 'mono', label: 'Machine' },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFontFamily(f.id as StampFontFamily)}
                          className={`py-1.5 text-[11px] rounded-lg border text-center transition-colors cursor-pointer ${
                            fontFamily === f.id
                              ? 'bg-slate-800 text-white border-slate-800 font-bold'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Center Icon */}
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">
                      Motif / Emblème central :
                    </span>
                    <div className="grid grid-cols-6 gap-1">
                      {[
                        { id: 'none', label: '—', icon: null },
                        { id: 'star', label: '★', icon: <Star className="w-3.5 h-3.5" /> },
                        { id: 'shield', label: '🛡', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                        { id: 'check', label: '✓', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                        { id: 'scale', label: '⚖', icon: <Scale className="w-3.5 h-3.5" /> },
                        { id: 'building', label: '🏛', icon: <Building className="w-3.5 h-3.5" /> },
                      ].map(ic => (
                        <button
                          key={ic.id}
                          type="button"
                          onClick={() => setCenterIcon(ic.id as StampCenterIcon)}
                          title={ic.label}
                          className={`p-1 text-center rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                            centerIcon === ic.id
                              ? 'bg-red-600 text-white border-red-600 font-bold'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {ic.icon || <span className="text-[10px]">Ø</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Border Width Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-700 font-medium">Épaisseur des cercles / cadres :</span>
                    <span className="font-mono font-bold text-slate-800">{borderWidth} px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={borderWidth}
                    onChange={e => setBorderWidth(parseInt(e.target.value))}
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                </div>

                {/* Grunge / Weathering Slider */}
                <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-amber-950 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Effet d’encre réaliste & usure de tampon (Grunge)
                    </span>
                    <span className="font-mono font-bold text-amber-800 bg-white px-1.5 py-0.2 rounded border border-amber-200">
                      {grunge === 0 ? 'Net / Vectoriel' : `${grunge}% d'aspérités`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    step="5"
                    value={grunge}
                    onChange={e => setGrunge(parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-amber-700/80">
                    <span>0% (Parfaitement net)</span>
                    <span>15% (Tampon neuf réaliste)</span>
                    <span>45% (Tampon vintage usé)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger PNG
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs shadow-red-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Appliquer ce cachet au document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
