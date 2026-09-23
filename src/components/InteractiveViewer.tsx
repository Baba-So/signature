import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  PenTool,
  Award,
  Download,
  Pin,
  PinOff,
  ArrowLeftRight,
  Scan,
  FileText,
  Trash2,
  Check,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ControlledVariations,
  HeaderLayerMode,
  LoadedFile,
  OverlayElementConfig,
} from '../types';
import { renderPdfPage } from '../services/pdfRenderer';
import { computeEffectiveGeometry } from '../services/variationEngine';

interface InteractiveViewerProps {
  mainPdf: LoadedFile | null;
  headerPdf: LoadedFile | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  headerLayerMode: HeaderLayerMode;
  isHeaderActiveOnPage: boolean;
  isSignatureActiveOnPage: boolean;
  isCachetActiveOnPage: boolean;
  signatureImage: LoadedFile | null;
  cachetImage: LoadedFile | null;
  signatureConfig: OverlayElementConfig;
  cachetConfig: OverlayElementConfig;
  onUpdateSignature: (updates: Partial<OverlayElementConfig>) => void;
  onUpdateCachet: (updates: Partial<OverlayElementConfig>) => void;
  activeElementTab: 'signature' | 'cachet';
  onSelectElementTab: (tab: 'signature' | 'cachet') => void;
  variations: ControlledVariations;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToScreen?: () => void;
  onSetZoomLevel?: (zoom: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenExport?: () => void;
  isSticky?: boolean;
  onToggleSticky?: () => void;
  isWide?: boolean;
  onToggleWide?: () => void;
  onToggleCachetOnPage?: () => void;
  onToggleHeaderOnPage?: () => void;
  isStampAndSignatureActiveOnPage?: boolean;
  onToggleStampAndSignatureOnPage?: () => void;
  onToggleHeaderLayerMode?: () => void;
  isLinked?: boolean;
}

export const InteractiveViewer: React.FC<InteractiveViewerProps> = ({
  mainPdf,
  headerPdf,
  currentPage,
  totalPages,
  onPageChange,
  headerLayerMode,
  isHeaderActiveOnPage,
  isSignatureActiveOnPage,
  isCachetActiveOnPage,
  isStampAndSignatureActiveOnPage,
  onToggleStampAndSignatureOnPage,
  onToggleHeaderLayerMode,
  signatureImage,
  cachetImage,
  signatureConfig,
  cachetConfig,
  onUpdateSignature,
  onUpdateCachet,
  activeElementTab,
  onSelectElementTab,
  variations,
  zoomLevel: propZoomLevel,
  onZoomIn: propZoomIn,
  onZoomOut: propZoomOut,
  onFitToScreen: propFitToScreen,
  onSetZoomLevel,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenExport,
  isSticky = true,
  onToggleSticky,
  isWide = false,
  onToggleWide,
  onToggleCachetOnPage,
  onToggleHeaderOnPage,
  isLinked = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [internalZoomLevel, setInternalZoomLevel] = useState<number>(1.0);
  const zoomLevel = propZoomLevel !== undefined ? propZoomLevel : internalZoomLevel;

  const handleZoomIn = propZoomIn || (() => setInternalZoomLevel(prev => Math.min(2.0, prev + 0.15)));
  const handleZoomOut = propZoomOut || (() => setInternalZoomLevel(prev => Math.max(0.4, prev - 0.15)));
  const handleFit100 = propFitToScreen || (() => setInternalZoomLevel(1.0));

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(0.707); // Default A4 ratio

  // Dragging state
  const [draggingItem, setDraggingItem] = useState<'signature' | 'cachet' | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-fit to page height
  const handleFitToPage = useCallback(() => {
    if (!containerRef.current || !aspectRatio) {
      handleFit100();
      return;
    }
    const containerHeight = containerRef.current.clientHeight - 48;
    const baseWidth = isFullscreen ? 1080 : (isWide ? 880 : 720);
    const baseHeight = baseWidth / aspectRatio;
    const computedZoom = Math.min(2.0, Math.max(0.4, Math.round((containerHeight / baseHeight) * 100) / 100));
    if (onSetZoomLevel) {
      onSetZoomLevel(computedZoom);
    } else {
      setInternalZoomLevel(computedZoom);
    }
  }, [aspectRatio, isFullscreen, isWide, handleFit100, onSetZoomLevel]);

  // Auto-fit to width
  const handleFitToWidth = useCallback(() => {
    if (!containerRef.current || !aspectRatio) {
      handleFit100();
      return;
    }
    const containerWidth = containerRef.current.clientWidth - 48;
    const baseWidth = isFullscreen ? 1080 : (isWide ? 880 : 720);
    const computedZoom = Math.min(2.0, Math.max(0.4, Math.round((containerWidth / baseWidth) * 100) / 100));
    if (onSetZoomLevel) {
      onSetZoomLevel(computedZoom);
    } else {
      setInternalZoomLevel(computedZoom);
    }
  }, [aspectRatio, isFullscreen, isWide, handleFit100, onSetZoomLevel]);

  // Smooth mouse wheel zoom (Ctrl + wheel) inside viewer container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleZoomIn, handleZoomOut]);

  // Compute effective geometries with variations
  const effectiveSig = computeEffectiveGeometry(
    currentPage,
    'signature',
    signatureConfig,
    variations
  );
  const effectiveCachet = computeEffectiveGeometry(
    currentPage,
    'cachet',
    cachetConfig,
    variations
  );

  // Render main page and header
  const renderCurrentPages = useCallback(async () => {
    if (!mainPdf || !mainCanvasRef.current) return;

    setIsRendering(true);
    setRenderError(null);

    try {
      const renderRes = await renderPdfPage(
        mainPdf.uint8Array,
        currentPage,
        mainCanvasRef.current,
        1.6,
        `main-${mainPdf.name}-${mainPdf.size}`
      );
      setAspectRatio(renderRes.aspectRatio);

      // Render header if active on this page
      if (headerCanvasRef.current) {
        if (headerPdf && isHeaderActiveOnPage) {
          const headerPageNum = Math.min(currentPage, headerPdf.pageCount || 1);
          await renderPdfPage(
            headerPdf.uint8Array,
            headerPageNum,
            headerCanvasRef.current,
            1.6,
            `header-${headerPdf.name}-${headerPdf.size}-p${headerPageNum}`
          );
        } else {
          // Clear header canvas cleanly if inactive on this page
          const ctx = headerCanvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, headerCanvasRef.current.width, headerCanvasRef.current.height);
          }
        }
      }
    } catch (err: any) {
      console.error('Render error:', err);
      setRenderError("Échec de l'affichage de cette page. Veuillez vérifier le fichier.");
    } finally {
      setIsRendering(false);
    }
  }, [mainPdf, headerPdf, currentPage, isHeaderActiveOnPage, headerLayerMode]);

  useEffect(() => {
    renderCurrentPages();
  }, [renderCurrentPages]);

  // Fit to screen
  const handleFitToScreen = () => {
    handleFit100();
  };

  // Drag start
  const handleMouseDown = (
    e: React.MouseEvent,
    type: 'signature' | 'cachet',
    config: OverlayElementConfig
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElementTab(type);

    if (!pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const elemLeftPx = (config.x / 100) * rect.width;
    const elemTopPx = (config.y / 100) * rect.height;

    setDragOffset({
      x: e.clientX - rect.left - elemLeftPx,
      y: e.clientY - rect.top - elemTopPx,
    });
    setDraggingItem(type);
  };

  // Drag move & end
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingItem || !pageContainerRef.current) return;
      const rect = pageContainerRef.current.getBoundingClientRect();

      const newLeftPx = e.clientX - rect.left - dragOffset.x;
      const newTopPx = e.clientY - rect.top - dragOffset.y;

      const newXPct = Math.min(95, Math.max(0, (newLeftPx / rect.width) * 100));
      const newYPct = Math.min(95, Math.max(0, (newTopPx / rect.height) * 100));

      const roundedX = Math.round(newXPct * 10) / 10;
      const roundedY = Math.round(newYPct * 10) / 10;

      if (draggingItem === 'signature') {
        const deltaX = roundedX - signatureConfig.x;
        const deltaY = roundedY - signatureConfig.y;
        onUpdateSignature({ x: roundedX, y: roundedY });
        if (isLinked) {
          const linkedX = Math.min(95, Math.max(0, Math.round((cachetConfig.x + deltaX) * 10) / 10));
          const linkedY = Math.min(95, Math.max(0, Math.round((cachetConfig.y + deltaY) * 10) / 10));
          onUpdateCachet({ x: linkedX, y: linkedY });
        }
      } else {
        const deltaX = roundedX - cachetConfig.x;
        const deltaY = roundedY - cachetConfig.y;
        onUpdateCachet({ x: roundedX, y: roundedY });
        if (isLinked) {
          const linkedX = Math.min(95, Math.max(0, Math.round((signatureConfig.x + deltaX) * 10) / 10));
          const linkedY = Math.min(95, Math.max(0, Math.round((signatureConfig.y + deltaY) * 10) / 10));
          onUpdateSignature({ x: linkedX, y: linkedY });
        }
      }
    };

    const handleMouseUp = () => {
      if (draggingItem) {
        setDraggingItem(null);
      }
    };

    if (draggingItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingItem, dragOffset, onUpdateSignature, onUpdateCachet]);

  if (!mainPdf) {
    return (
      <div className="h-full min-h-[520px] flex flex-col items-center justify-center p-8 bg-slate-100/60 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400">
        <Layers className="w-12 h-12 text-slate-300 mb-3" />
        <p className="font-semibold text-slate-700 text-base mb-1">Aucun document chargé</p>
        <p className="text-xs text-slate-500 max-w-sm text-center mb-4">
          Importez un document PDF principal ci-contre ou chargez l’exemple complet pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden transition-all duration-150 ${
      isFullscreen
        ? 'bg-slate-900 rounded-xl shadow-2xl border border-slate-700/80 ring-1 ring-white/10'
        : 'bg-slate-900/5 rounded-2xl border border-slate-200/80 shadow-xs'
    }`}>
      {/* Top Toolbar */}
      <div className={`flex flex-wrap items-center justify-between px-4 py-2.5 border-b gap-2 z-20 ${
        isFullscreen ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
      }`}>
        {/* Document Information */}
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${isFullscreen ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold truncate max-w-[220px] sm:max-w-[320px] ${isFullscreen ? 'text-slate-100' : 'text-slate-800'}`}
                title={mainPdf.name}
              >
                {mainPdf.name}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                isFullscreen
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {totalPages} {totalPages > 1 ? 'pages' : 'page'}
              </span>
            </div>
          </div>
        </div>

        {/* In Fullscreen mode: Quick Layer Switcher */}
        {isFullscreen && (
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => onSelectElementTab('signature')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeElementTab === 'signature'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Sélectionner la Signature (1 ou S)"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Signature</span>
            </button>
            <button
              onClick={() => onSelectElementTab('cachet')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeElementTab === 'cachet'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Sélectionner le Cachet (2 ou C)"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Cachet</span>
            </button>
          </div>
        )}

        {/* Tip Badge (in normal mode) */}
        {!isFullscreen && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/70 rounded-full text-[11px] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Le cachet et la signature se suivent toujours au déplacement</span>
          </div>
        )}

        {/* Right side controls: Zoom + Viewport Pin / Wide + Export + Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className={`flex items-center rounded-lg p-0.5 border ${
            isFullscreen ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={handleZoomOut}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isFullscreen
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              title="Dézoomer (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span
              className={`text-xs font-medium px-1.5 min-w-[42px] text-center ${
                isFullscreen ? 'text-slate-200' : 'text-slate-600'
              }`}
              title="Niveau de zoom actuel"
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isFullscreen
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              title="Zoomer (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className={`w-[1px] h-4 my-auto mx-0.5 ${isFullscreen ? 'bg-slate-700' : 'bg-slate-300'}`} />
            <button
              onClick={handleFitToPage}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                isFullscreen
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              title="Ajuster à la hauteur de la page"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Page</span>
            </button>
            <button
              onClick={handleFitToWidth}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                isFullscreen
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              title="Ajuster à la largeur de la fenêtre"
            >
              <Scan className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Largeur</span>
            </button>
            <button
              onClick={handleFit100}
              className={`px-1.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                isFullscreen
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              title="Taille réelle 100% (Touche 0)"
            >
              1:1
            </button>
          </div>

          {/* Quick Export Button (fullscreen only) */}
          {isFullscreen && onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Lancer l'exportation du document (Ctrl+S)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
          )}

          {/* Sticky Pin Toggle (only in normal mode) */}
          {!isFullscreen && onToggleSticky && (
            <button
              onClick={onToggleSticky}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isSticky
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
              title={isSticky ? "Visualiseur fixé à l'écran (P) - Cliquez pour détacher" : "Fixer le visualiseur à l'écran pendant le défilement (P)"}
            >
              {isSticky ? (
                <>
                  <Pin className="w-3.5 h-3.5 text-blue-600 rotate-45" />
                  <span className="hidden xl:inline">Vue fixée</span>
                </>
              ) : (
                <>
                  <PinOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden xl:inline">Détaché</span>
                </>
              )}
            </button>
          )}

          {/* Wide View Toggle (only in normal mode) */}
          {!isFullscreen && onToggleWide && (
            <button
              onClick={onToggleWide}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isWide
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
              title={isWide ? "Revenir à la largeur standard (W)" : "Élargir l'espace de visualisation (W)"}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{isWide ? 'Large' : 'Élargir'}</span>
            </button>
          )}

          {/* Fullscreen Toggle Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isFullscreen
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
              }`}
              title={isFullscreen ? 'Quitter le mode plein écran (Échap ou F)' : 'Mode plein écran : maximiser l’espace de travail (F)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5 text-blue-200" />
                  <span className="hidden sm:inline">Quitter</span>
                  <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-blue-800 text-blue-100 rounded border border-blue-500/50">
                    Échap
                  </kbd>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Plein écran</span>
                  <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-300 shadow-2xs">
                    F
                  </kbd>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Viewer Canvas Area */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto p-4 sm:p-6 select-none relative ${
          isFullscreen ? 'bg-slate-950 min-h-0' : 'bg-slate-800/5 min-h-[460px]'
        }`}
      >
        {isRendering && (
          <div className="absolute top-4 right-4 z-40 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Rendu en cours...</span>
          </div>
        )}

        {renderError && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 p-6">
            <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl max-w-md text-center text-xs">
              <p className="font-semibold mb-1">Erreur d'affichage</p>
              <p>{renderError}</p>
            </div>
          </div>
        )}

        {/* Scaled Page Container centered in dynamic flex wrapper */}
        <div className="min-w-full min-h-full flex items-center justify-center m-auto py-2">
          <div
            ref={pageContainerRef}
            className="relative bg-white shadow-2xl rounded-sm transition-transform duration-75 origin-top"
            style={{
              transform: `scale(${zoomLevel})`,
              width: '100%',
              maxWidth: isFullscreen ? '1080px' : isWide ? '880px' : '720px',
              aspectRatio: `${aspectRatio}`,
            }}
          >
          {/* Layer: Letterhead Canvas (Always mounted so ref is permanently available) */}
          <canvas
            ref={headerCanvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-150 ${
              headerPdf && isHeaderActiveOnPage ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              zIndex: headerLayerMode === 'behind' ? 5 : 20,
              mixBlendMode: 'multiply',
            }}
          />

          {/* Layer: Main Document Canvas */}
          <canvas
            ref={mainCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              zIndex: 10,
              // When header is behind, multiply blend mode ensures the main document's white page background
              // reveals the header graphics seamlessly while keeping the text completely crisp!
              mixBlendMode: headerPdf && isHeaderActiveOnPage && headerLayerMode === 'behind' ? 'multiply' : 'normal',
            }}
          />

          {/* Interactive On-Canvas Header Overlay Status Badge */}
          {headerPdf && isHeaderActiveOnPage && (
            <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg border border-indigo-200 shadow-md text-xs pointer-events-auto">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-semibold text-indigo-950">En-tête</span>
              <span className="text-slate-300">•</span>
              {onToggleHeaderLayerMode && (
                <button
                  onClick={onToggleHeaderLayerMode}
                  className="px-2 py-0.5 font-bold text-[10px] rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200 cursor-pointer flex items-center gap-1"
                  title="Basculer entre Arrière-plan (sous texte) et Premier plan (par-dessus)"
                >
                  <Layers className="w-2.5 h-2.5" />
                  <span>{headerLayerMode === 'behind' ? 'Arrière-plan (sous texte)' : 'Premier plan (par-dessus)'}</span>
                </button>
              )}
              {onToggleHeaderOnPage && (
                <button
                  onClick={onToggleHeaderOnPage}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Retirer l'en-tête de cette page (E)"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Layer 4: Interactive Overlays */}
          {/* Cachet Element */}
          {cachetImage && isCachetActiveOnPage && (
            <div
              onMouseDown={e => handleMouseDown(e, 'cachet', cachetConfig)}
              style={{
                left: `${effectiveCachet.effectiveX}%`,
                top: `${effectiveCachet.effectiveY}%`,
                width: `${effectiveCachet.effectiveWidth}%`,
                transform: `rotate(${effectiveCachet.effectiveRotation}deg)`,
                opacity: effectiveCachet.opacity ?? 1,
                zIndex: 25,
              }}
              className={`absolute select-none transition-shadow ${
                draggingItem === 'cachet'
                  ? 'cursor-grabbing ring-2 ring-red-500 shadow-xl'
                  : 'cursor-grab hover:ring-2 hover:ring-red-400'
              } ${activeElementTab === 'cachet' ? 'ring-2 ring-red-500' : ''}`}
            >
              <img
                src={cachetImage.dataUrl}
                alt="Cachet"
                className="w-full h-auto pointer-events-none drop-shadow-xs"
                draggable={false}
              />
              {/* Overlay Badge for coordinates, rotation & opacity */}
              {(draggingItem === 'cachet' || activeElementTab === 'cachet') && (
                <div className="absolute -top-6 left-0 whitespace-nowrap bg-red-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-sm shadow-xs pointer-events-none">
                  Cachet {effectiveCachet.effectiveX.toFixed(1)}%, {effectiveCachet.effectiveY.toFixed(1)}% | {effectiveCachet.effectiveRotation.toFixed(0)}°
                  {typeof effectiveCachet.opacity === 'number' && effectiveCachet.opacity < 1 && (
                    <span> | {Math.round(effectiveCachet.opacity * 100)}%</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Signature Element - Has priority over cachet (z-index 35 vs 25) */}
          {signatureImage && isSignatureActiveOnPage && (
            <div
              onMouseDown={e => handleMouseDown(e, 'signature', signatureConfig)}
              style={{
                left: `${effectiveSig.effectiveX}%`,
                top: `${effectiveSig.effectiveY}%`,
                width: `${effectiveSig.effectiveWidth}%`,
                transform: `rotate(${effectiveSig.effectiveRotation}deg)`,
                zIndex: 35, // Priority over cachet on overlap!
              }}
              className={`absolute select-none transition-shadow ${
                draggingItem === 'signature'
                  ? 'cursor-grabbing ring-2 ring-blue-500 shadow-xl'
                  : 'cursor-grab hover:ring-2 hover:ring-blue-400'
              } ${activeElementTab === 'signature' ? 'ring-2 ring-blue-500' : ''}`}
            >
              <img
                src={signatureImage.dataUrl}
                alt="Signature"
                className="w-full h-auto pointer-events-none drop-shadow-xs"
                draggable={false}
              />
              {/* Overlay Badge for coordinates & rotation */}
              {(draggingItem === 'signature' || activeElementTab === 'signature') && (
                <div className="absolute -top-6 left-0 whitespace-nowrap bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-sm shadow-xs pointer-events-none">
                  Signature {effectiveSig.effectiveX.toFixed(1)}%, {effectiveSig.effectiveY.toFixed(1)}% | {effectiveSig.effectiveRotation.toFixed(0)}°
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating status pill in fullscreen mode */}
        {isFullscreen && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/90 text-white rounded-full shadow-2xl backdrop-blur-md border border-slate-700/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Mode Plein Écran</span>
                <span className="text-slate-500">•</span>
                <span>Panneaux masqués</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700" />
              <span className="text-slate-400 hidden md:inline">
                Glissez les éléments sur le document • <kbd className="px-1.5 py-0.2 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">F</kbd> ou <kbd className="px-1.5 py-0.2 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">Échap</kbd> pour quitter
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Controls Bar (Pagination + Action Buttons + Header Display Management) */}
      <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-30 shadow-lg ${
        isFullscreen
          ? 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-700'
      }`}>
        {/* Left Side: Fixed Document Pagination Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isFullscreen
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Première page (Début / Home)"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold ${
              isFullscreen
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Page précédente (← ou Page Haut)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Précédent</span>
          </button>

          {/* Page Indicator & Quick Jump */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-bold ${
            isFullscreen ? 'bg-slate-800/90 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <span>Page</span>
            <select
              value={currentPage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              className={`bg-transparent font-bold cursor-pointer outline-hidden text-center ${
                isFullscreen ? 'text-blue-400' : 'text-blue-600'
              }`}
              title="Aller directement à une page"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <option key={pg} value={pg} className={isFullscreen ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}>
                  {pg}
                </option>
              ))}
            </select>
            <span className={isFullscreen ? 'text-slate-500' : 'text-slate-400'}>/</span>
            <span>{totalPages}</span>
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold ${
              isFullscreen
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Page suivante (→ ou Page Bas)"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isFullscreen
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Dernière page (Fin / End)"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Fixed Action Buttons (Icons Only: Cachet & Signature, Header, Layer Toggle) */}
        <div className="flex items-center gap-2">
          {/* 1. Unified Cachet & Signature Toggle Button (Icon Only) */}
          {onToggleStampAndSignatureOnPage && (
            <button
              onClick={onToggleStampAndSignatureOnPage}
              className={`relative p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer shadow-xs border flex items-center justify-center ${
                isStampAndSignatureActiveOnPage
                  ? 'bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100 hover:text-rose-700 ring-1 ring-rose-200'
                  : isFullscreen
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm'
              }`}
              title={
                isStampAndSignatureActiveOnPage
                  ? `Cachet & Signature actifs sur la page ${currentPage}. Cliquez pour les supprimer (T)`
                  : `Ajouter Cachet & Signature sur la page ${currentPage} (T)`
              }
              aria-label={
                isStampAndSignatureActiveOnPage
                  ? 'Supprimer Cachet et Signature'
                  : 'Ajouter Cachet et Signature'
              }
            >
              {isStampAndSignatureActiveOnPage ? (
                <Trash2 className="w-4.5 h-4.5" />
              ) : (
                <Award className="w-4.5 h-4.5" />
              )}
              {isStampAndSignatureActiveOnPage && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
              )}
            </button>
          )}

          {/* 2. Header Toggle Button (Icon Only) */}
          {onToggleHeaderOnPage && (
            <button
              onClick={onToggleHeaderOnPage}
              className={`relative p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer shadow-xs border flex items-center justify-center ${
                isHeaderActiveOnPage
                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 hover:text-amber-800 ring-1 ring-amber-200'
                  : isFullscreen
                  ? 'bg-sky-950/90 text-sky-300 border-sky-700 hover:bg-sky-900'
                  : 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100 hover:text-sky-800'
              }`}
              title={
                isHeaderActiveOnPage
                  ? `En-tête active sur la page ${currentPage}. Cliquez pour la supprimer (E)`
                  : `Ajouter l’en-tête sur la page ${currentPage} (E)`
              }
              aria-label={
                isHeaderActiveOnPage
                  ? 'Supprimer l’en-tête'
                  : 'Ajouter l’en-tête'
              }
            >
              {isHeaderActiveOnPage ? (
                <Trash2 className="w-4.5 h-4.5" />
              ) : (
                <FileText className="w-4.5 h-4.5" />
              )}
              {isHeaderActiveOnPage && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white animate-pulse" />
              )}
            </button>
          )}

          {/* 3. Header Display Layer Mode (Icon Only) */}
          {headerPdf && onToggleHeaderLayerMode && (
            <button
              onClick={onToggleHeaderLayerMode}
              className={`relative p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
                headerLayerMode === 'behind'
                  ? isFullscreen
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : isFullscreen
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700 hover:bg-indigo-900 ring-1 ring-indigo-500'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 ring-1 ring-indigo-200'
              }`}
              title={
                headerLayerMode === 'behind'
                  ? 'Affichage actuel de l’en-tête : Arrière-plan (sous le texte). Cliquez pour Premier plan (L)'
                  : 'Affichage actuel de l’en-tête : Premier plan (par-dessus). Cliquez pour Arrière-plan (L)'
              }
              aria-label="Gérer l’affichage du calque d’en-tête"
            >
              <Layers className="w-4.5 h-4.5" />
              <span
                className={`absolute -bottom-1 -right-1 text-[8px] font-mono px-1 py-0.2 rounded-xs font-bold leading-tight ${
                  headerLayerMode === 'behind'
                    ? 'bg-slate-700 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {headerLayerMode === 'behind' ? 'ARR' : 'DEV'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
