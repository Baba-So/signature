/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck,
  Download,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Layers,
  Settings2,
  FileCode,
  BookOpen,
  Keyboard,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Award,
  Move,
  Pin,
  PinOff,
  ArrowLeftRight,
  Scan,
  FileText,
} from 'lucide-react';

import {
  ControlledVariations,
  DocumentPagesSettings,
  ExportProgress,
  HeaderLayerMode,
  LoadedFile,
  OverlayElementConfig,
  PageSelectionMode,
  PresetProfileId,
} from './types';
import { DEFAULT_PROFILE_ID, PRESET_PROFILES } from './services/profiles';
import {
  createLoadedImageFromDataUrl,
  createSampleDocument,
  createSampleLetterhead,
  createSampleSignatureDataUrl,
  createSampleStampDataUrl,
} from './services/sampleData';
import { validateAndLoadImage, validateAndLoadPdf, FileValidationError } from './services/fileValidator';
import { exportSignedPdf } from './services/pdfExporter';

import { FileImportCard } from './components/FileImportCard';
import { InteractiveViewer } from './components/InteractiveViewer';
import { SettingsPanel } from './components/SettingsPanel';
import { PageSelector } from './components/PageSelector';
import { HeaderSettings } from './components/HeaderSettings';
import { ExportModal } from './components/ExportModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SignaturePadModal } from './components/SignaturePadModal';
import { StampGeneratorModal } from './components/StampGeneratorModal';
import { ErrorDialog } from './components/ErrorDialog';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ShortcutToast, ShortcutToastMessage } from './components/ShortcutToast';

export default function App() {
  // Loaded Files
  const [mainPdf, setMainPdf] = useState<LoadedFile | null>(null);
  const [signatureImage, setSignatureImage] = useState<LoadedFile | null>(null);
  const [cachetImage, setCachetImage] = useState<LoadedFile | null>(null);
  const [headerPdf, setHeaderPdf] = useState<LoadedFile | null>(null);

  // Navigation
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = mainPdf?.pageCount || 1;

  // Active element tab in controls
  const [activeElementTab, setActiveElementTab] = useState<'signature' | 'cachet'>('signature');

  // Preset Profile
  const [activeProfile, setActiveProfile] = useState<PresetProfileId>(DEFAULT_PROFILE_ID);

  // Default Element Configurations (from active profile)
  const [defaultSignatureConfig, setDefaultSignatureConfig] = useState<OverlayElementConfig>(
    PRESET_PROFILES[DEFAULT_PROFILE_ID].signature
  );
  const [defaultCachetConfig, setDefaultCachetConfig] = useState<OverlayElementConfig>(
    PRESET_PROFILES[DEFAULT_PROFILE_ID].cachet
  );

  // Page-by-page settings override
  // pageSettings[pageNum] holds distinct coordinates for pageNum
  const [pageSettings, setPageSettings] = useState<DocumentPagesSettings>({});

  // Controlled Variations
  const [variations, setVariations] = useState<ControlledVariations>({
    enabled: false,
    positionAmplitude: 2.5, // ± 2.5%
    rotationAmplitude: 4, // ± 4 deg
    sizeAmplitude: 3, // ± 3%
  });

  // Page Selection Modes
  const [signatureSelectionMode, setSignatureSelectionMode] = useState<PageSelectionMode>('all');
  const [signatureTargetPages, setSignatureTargetPages] = useState<number[]>([]);

  const [cachetSelectionMode, setCachetSelectionMode] = useState<PageSelectionMode>('all');
  const [cachetTargetPages, setCachetTargetPages] = useState<number[]>([]);

  const [headerSelectionMode, setHeaderSelectionMode] = useState<PageSelectionMode>('all');
  const [headerTargetPages, setHeaderTargetPages] = useState<number[]>([]);
  const [headerLayerMode, setHeaderLayerMode] = useState<HeaderLayerMode>('behind');
  const [isLinked, setIsLinked] = useState<boolean>(true); // Link signature and stamp movement

  // Modals & UI States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const [isStampGeneratorOpen, setIsStampGeneratorOpen] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Error Dialog
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    suggestion?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Export progress
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    currentPage: 0,
    totalPages: 0,
    percent: 0,
    stepMessage: '',
    completed: false,
  });

  // Zoom & Viewer State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isViewerSticky, setIsViewerSticky] = useState<boolean>(true);
  const [isViewerWide, setIsViewerWide] = useState<boolean>(false);

  // Keyboard Shortcuts Modal & Toast HUD
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [shortcutToast, setShortcutToast] = useState<ShortcutToastMessage | null>(null);

  const showShortcutToast = useCallback((icon: React.ReactNode, badge: string, message: string) => {
    setShortcutToast({
      id: Date.now(),
      icon,
      badge,
      message,
    });
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev;
      try {
        if (next && !document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else if (!next && document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      } catch {
        // Fallback gracefully in restricted iframe environments
      }
      showShortcutToast(
        next ? <Maximize className="w-3.5 h-3.5" /> : <Minimize className="w-3.5 h-3.5" />,
        'F',
        next ? 'Mode Plein Écran (panneaux masqués)' : 'Affichage standard rétabli'
      );
      return next;
    });
  }, [showShortcutToast]);

  const handleToggleSticky = useCallback(() => {
    setIsViewerSticky(prev => {
      const next = !prev;
      showShortcutToast(
        next ? <Pin className="w-3.5 h-3.5 rotate-45" /> : <PinOff className="w-3.5 h-3.5" />,
        'P',
        next ? 'Visualiseur fixé à l’écran (sticky)' : 'Défilement naturel du visualiseur'
      );
      return next;
    });
  }, [showShortcutToast]);

  const handleToggleWide = useCallback(() => {
    setIsViewerWide(prev => {
      const next = !prev;
      showShortcutToast(
        <ArrowLeftRight className="w-3.5 h-3.5" />,
        'W',
        next ? 'Espace de visualisation élargi' : 'Largeur standard rétablie'
      );
      return next;
    });
  }, [showShortcutToast]);

  const handleSetZoomLevel = useCallback((newZoom: number) => {
    const clamped = Math.min(2.0, Math.max(0.4, Math.round(newZoom * 100) / 100));
    setZoomLevel(clamped);
    showShortcutToast(<Maximize2 className="w-3.5 h-3.5" />, `${Math.round(clamped * 100)}%`, `Zoom ajusté : ${Math.round(clamped * 100)}%`);
  }, [showShortcutToast]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const next = Math.min(2.0, Math.round((prev + 0.15) * 100) / 100);
      showShortcutToast(<ZoomIn className="w-3.5 h-3.5" />, '+', `Zoom : ${Math.round(next * 100)}%`);
      return next;
    });
  }, [showShortcutToast]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const next = Math.max(0.5, Math.round((prev - 0.15) * 100) / 100);
      showShortcutToast(<ZoomOut className="w-3.5 h-3.5" />, '-', `Zoom : ${Math.round(next * 100)}%`);
      return next;
    });
  }, [showShortcutToast]);

  const handleFitToScreen = useCallback(() => {
    setZoomLevel(1.0);
    showShortcutToast(<Maximize2 className="w-3.5 h-3.5" />, '0', 'Ajusté à 100%');
  }, [showShortcutToast]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => {
      if (prev > 1) {
        const next = prev - 1;
        showShortcutToast(<ChevronLeft className="w-3.5 h-3.5" />, '←', `Page ${next} / ${totalPages}`);
        return next;
      }
      return prev;
    });
  }, [totalPages, showShortcutToast]);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => {
      if (prev < totalPages) {
        const next = prev + 1;
        showShortcutToast(<ChevronRight className="w-3.5 h-3.5" />, '→', `Page ${next} / ${totalPages}`);
        return next;
      }
      return prev;
    });
  }, [totalPages, showShortcutToast]);

  const handleFirstPage = useCallback(() => {
    setCurrentPage(1);
    showShortcutToast(<Move className="w-3.5 h-3.5" />, 'Home', `Première page (1 / ${totalPages})`);
  }, [totalPages, showShortcutToast]);

  const handleLastPage = useCallback(() => {
    setCurrentPage(totalPages);
    showShortcutToast(<Move className="w-3.5 h-3.5" />, 'End', `Dernière page (${totalPages} / ${totalPages})`);
  }, [totalPages, showShortcutToast]);

  const handleSelectSignature = useCallback(() => {
    setActiveElementTab('signature');
    showShortcutToast(<PenTool className="w-3.5 h-3.5" />, '1', 'Mode actif : Signature');
  }, [showShortcutToast]);

  const handleSelectCachet = useCallback(() => {
    setActiveElementTab('cachet');
    showShortcutToast(<Award className="w-3.5 h-3.5" />, '2', 'Mode actif : Cachet');
  }, [showShortcutToast]);

  // Active configs for current page (memoized or retrieved from pageSettings)
  const currentSigConfig = pageSettings[currentPage]?.signature || defaultSignatureConfig;
  const currentCachetConfig = pageSettings[currentPage]?.cachet || defaultCachetConfig;

  // When total pages changes, reset target pages or clamp current page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  // Update signature config for current page
  const handleUpdateSignature = useCallback(
    (updates: Partial<OverlayElementConfig>) => {
      setPageSettings(prev => {
        const pageEntry = prev[currentPage] || {};
        const base = pageEntry.signature || defaultSignatureConfig;
        return {
          ...prev,
          [currentPage]: {
            ...pageEntry,
            signature: { ...base, ...updates },
          },
        };
      });
    },
    [currentPage, defaultSignatureConfig]
  );

  // Update cachet config for current page
  const handleUpdateCachet = useCallback(
    (updates: Partial<OverlayElementConfig>) => {
      setPageSettings(prev => {
        const pageEntry = prev[currentPage] || {};
        const base = pageEntry.cachet || defaultCachetConfig;
        return {
          ...prev,
          [currentPage]: {
            ...pageEntry,
            cachet: { ...base, ...updates },
          },
        };
      });
    },
    [currentPage, defaultCachetConfig]
  );

  // Propagate current page disposition to all pages
  const handleApplyToAllPages = () => {
    const updated: DocumentPagesSettings = {};
    for (let p = 1; p <= totalPages; p++) {
      updated[p] = {
        signature: { ...currentSigConfig },
        cachet: { ...currentCachetConfig },
      };
    }
    setPageSettings(updated);
    setDefaultSignatureConfig({ ...currentSigConfig });
    setDefaultCachetConfig({ ...currentCachetConfig });
  };

  // Reset current page to default profile disposition
  const handleResetCurrentPage = () => {
    setPageSettings(prev => {
      const copy = { ...prev };
      delete copy[currentPage];
      return copy;
    });
  };

  // Apply a preset profile
  const handleSelectProfile = (profileId: PresetProfileId) => {
    setActiveProfile(profileId);
    const profile = PRESET_PROFILES[profileId];
    setDefaultSignatureConfig(profile.signature);
    setDefaultCachetConfig(profile.cachet);

    // Apply to current page
    setPageSettings(prev => ({
      ...prev,
      [currentPage]: {
        signature: { ...profile.signature },
        cachet: { ...profile.cachet },
      },
    }));
  };

  // Reset all to standard default
  const handleResetDefaults = () => {
    handleSelectProfile('standard');
    setPageSettings({});
    setVariations({
      enabled: false,
      positionAmplitude: 2.5,
      rotationAmplitude: 4,
      sizeAmplitude: 3,
    });
  };

  // Upload handlers with validation
  const handleUploadMainPdf = async (file: File) => {
    try {
      const loaded = await validateAndLoadPdf(file);
      setMainPdf(loaded);
      setCurrentPage(1);
      // Initialize target pages to all
      const allPages = Array.from({ length: loaded.pageCount || 1 }, (_, i) => i + 1);
      setSignatureTargetPages(allPages);
      setCachetTargetPages(allPages);
      setHeaderTargetPages(allPages);
    } catch (err: any) {
      showError('Validation du PDF principal échouée', err.userFriendlyMessage || err.message, 'Assurez-vous qu’il s’agit d’un PDF non protégé par mot de passe.');
    }
  };

  const handleUploadSignature = async (file: File) => {
    try {
      const loaded = await validateAndLoadImage(file, 'signature');
      setSignatureImage(loaded);
    } catch (err: any) {
      showError('Validation de la signature échouée', err.userFriendlyMessage || err.message, 'Utilisez un fichier image PNG ou WebP avec fond transparent.');
    }
  };

  const handleUploadCachet = async (file: File) => {
    try {
      const loaded = await validateAndLoadImage(file, 'cachet');
      setCachetImage(loaded);
    } catch (err: any) {
      showError('Validation du cachet échouée', err.userFriendlyMessage || err.message, 'Utilisez un fichier image PNG ou WebP transparent.');
    }
  };

  const handleUploadHeaderPdf = async (file: File) => {
    try {
      const loaded = await validateAndLoadPdf(file);
      setHeaderPdf(loaded);
    } catch (err: any) {
      showError("Validation de l'en-tête échouée", err.userFriendlyMessage || err.message, 'Vérifiez que le papier à lettres est au format PDF standard.');
    }
  };

  // Load complete sample
  const handleLoadFullSample = async () => {
    setIsLoadingSample(true);
    try {
      // 1. Generate 3-page contract
      const docBytes = await createSampleDocument();
      const docBlob = new Blob([docBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const mainFile: LoadedFile = {
        name: 'Contrat_Prestation_Alpha_Beta.pdf',
        size: docBlob.size,
        type: 'application/pdf',
        arrayBuffer: docBytes.buffer as ArrayBuffer,
        uint8Array: docBytes,
        pageCount: 3,
      };
      setMainPdf(mainFile);
      setCurrentPage(3); // Start on signature page to see immediate effect!

      // 2. Signature
      const sampleSig = createSampleSignatureDataUrl();
      const sigLoaded = await createLoadedImageFromDataUrl(
        sampleSig.dataUrl,
        'signature_direction.png',
        sampleSig.width,
        sampleSig.height
      );
      setSignatureImage(sigLoaded);

      // 3. Stamp
      const sampleStamp = createSampleStampDataUrl();
      const stampLoaded = await createLoadedImageFromDataUrl(
        sampleStamp.dataUrl,
        'cachet_officiel_paris.png',
        sampleStamp.width,
        sampleStamp.height
      );
      setCachetImage(stampLoaded);

      // 4. Letterhead
      const letterheadBytes = await createSampleLetterhead();
      const letterheadBlob = new Blob([letterheadBytes.buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      const headerLoaded: LoadedFile = {
        name: 'Papier_Entete_AcmeCorp.pdf',
        size: letterheadBlob.size,
        type: 'application/pdf',
        arrayBuffer: letterheadBytes.buffer as ArrayBuffer,
        uint8Array: letterheadBytes,
        pageCount: 1,
      };
      setHeaderPdf(headerLoaded);
      setHeaderLayerMode('behind');

      // Initialize page targets
      setSignatureTargetPages([3]); // Usually on page 3
      setCachetTargetPages([3]);
      setHeaderTargetPages([1, 2, 3]);

      // Set nice contract positions
      handleSelectProfile('contract');
    } catch (err: any) {
      showError("Erreur de chargement de l'exemple", err.message);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const showError = (title: string, message: string, suggestion?: string) => {
    setErrorDialog({
      isOpen: true,
      title,
      message,
      suggestion,
    });
  };

  // Determine if elements are active on current page
  const isHeaderActiveOnPage =
    Boolean(headerPdf) &&
    (headerSelectionMode === 'all' || headerTargetPages.includes(currentPage));

  const isSignatureActiveOnPage =
    Boolean(signatureImage) &&
    (signatureSelectionMode === 'all' || signatureTargetPages.includes(currentPage));

  const isCachetActiveOnPage =
    Boolean(cachetImage) &&
    (cachetSelectionMode === 'all' || cachetTargetPages.includes(currentPage));

  // Determine if cachet & signature are active on current page (unified state)
  const isStampAndSignatureActiveOnPage = isCachetActiveOnPage || isSignatureActiveOnPage;

  // Toggle Stamp & Signature simultaneously on current page (they always follow each other)
  const handleToggleStampAndSignatureOnCurrentPage = useCallback(async () => {
    // 1. Ensure sample signature and sample stamp are loaded if absent
    if (!signatureImage) {
      try {
        const sampleSig = createSampleSignatureDataUrl();
        const sigLoaded = await createLoadedImageFromDataUrl(
          sampleSig.dataUrl,
          'signature_direction.png',
          sampleSig.width,
          sampleSig.height
        );
        setSignatureImage(sigLoaded);
      } catch (err: any) {
        showError('Impossible de charger la signature par défaut', err.message);
        return;
      }
    }

    if (!cachetImage) {
      try {
        const sampleStamp = createSampleStampDataUrl();
        const stampLoaded = await createLoadedImageFromDataUrl(
          sampleStamp.dataUrl,
          'cachet_officiel_paris.png',
          sampleStamp.width,
          sampleStamp.height
        );
        setCachetImage(stampLoaded);
      } catch (err: any) {
        showError('Impossible de charger le cachet par défaut', err.message);
        return;
      }
    }

    // 2. If already active on current page -> REMOVE BOTH FROM CURRENT PAGE
    if (isStampAndSignatureActiveOnPage) {
      if (cachetSelectionMode === 'all') {
        const allPagesExceptCurrent = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
          p => p !== currentPage
        );
        setCachetSelectionMode('manual');
        setCachetTargetPages(allPagesExceptCurrent);
      } else {
        setCachetTargetPages(prev => prev.filter(p => p !== currentPage));
      }

      if (signatureSelectionMode === 'all') {
        const allPagesExceptCurrent = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
          p => p !== currentPage
        );
        setSignatureSelectionMode('manual');
        setSignatureTargetPages(allPagesExceptCurrent);
      } else {
        setSignatureTargetPages(prev => prev.filter(p => p !== currentPage));
      }

      showShortcutToast(
        <Award className="w-3.5 h-3.5" />,
        '✕',
        `Cachet et signature retirés de la page ${currentPage}`
      );
    } else {
      // 3. Not active -> ADD BOTH TO CURRENT PAGE
      setCachetSelectionMode('manual');
      setCachetTargetPages(prev => (prev.includes(currentPage) ? prev : [...prev, currentPage].sort((a, b) => a - b)));

      setSignatureSelectionMode('manual');
      setSignatureTargetPages(prev => (prev.includes(currentPage) ? prev : [...prev, currentPage].sort((a, b) => a - b)));

      showShortcutToast(
        <Award className="w-3.5 h-3.5" />,
        '✓',
        `Cachet et signature ajoutés sur la page ${currentPage}`
      );
    }
  }, [
    signatureImage,
    cachetImage,
    isStampAndSignatureActiveOnPage,
    cachetSelectionMode,
    signatureSelectionMode,
    totalPages,
    currentPage,
    showShortcutToast,
  ]);

  // Toggle Cachet on the current page: add if absent, remove if already present
  const handleToggleCachetOnCurrentPage = useCallback(async () => {
    // If no stamp loaded yet in the app, load default authentic sample stamp
    if (!cachetImage) {
      try {
        const sampleStamp = createSampleStampDataUrl();
        const stampLoaded = await createLoadedImageFromDataUrl(
          sampleStamp.dataUrl,
          'cachet_officiel_paris.png',
          sampleStamp.width,
          sampleStamp.height
        );
        setCachetImage(stampLoaded);
        setCachetSelectionMode('manual');
        setCachetTargetPages([currentPage]);
        showShortcutToast(<Award className="w-3.5 h-3.5" />, '+', `Cachet officiel ajouté à la page ${currentPage}`);
        return;
      } catch (err: any) {
        showError('Impossible de charger le cachet par défaut', err.message);
        return;
      }
    }

    if (isCachetActiveOnPage) {
      // Already active on this page -> REMOVE it from current page
      if (cachetSelectionMode === 'all') {
        const allPagesExceptCurrent = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
          p => p !== currentPage
        );
        setCachetSelectionMode('manual');
        setCachetTargetPages(allPagesExceptCurrent);
      } else {
        setCachetTargetPages(prev => prev.filter(p => p !== currentPage));
      }
      showShortcutToast(<Award className="w-3.5 h-3.5" />, '✕', `Cachet retiré de la page ${currentPage}`);
    } else {
      // Not active on this page -> ADD it to current page
      setCachetSelectionMode('manual');
      setCachetTargetPages(prev => (prev.includes(currentPage) ? prev : [...prev, currentPage].sort((a, b) => a - b)));
      showShortcutToast(<Award className="w-3.5 h-3.5" />, '✓', `Cachet ajouté sur la page ${currentPage}`);
    }
  }, [cachetImage, isCachetActiveOnPage, cachetSelectionMode, totalPages, currentPage, showShortcutToast]);

  // Toggle Letterhead on the current page: add if absent, remove if already present
  const handleToggleHeaderOnCurrentPage = useCallback(async () => {
    // If no header PDF loaded yet in the app, load default authentic sample letterhead
    if (!headerPdf) {
      try {
        const letterheadBytes = await createSampleLetterhead();
        const letterheadBlob = new Blob([letterheadBytes.buffer as ArrayBuffer], {
          type: 'application/pdf',
        });
        const headerLoaded: LoadedFile = {
          name: 'Papier_Entete_AcmeCorp.pdf',
          size: letterheadBlob.size,
          type: 'application/pdf',
          arrayBuffer: letterheadBytes.buffer as ArrayBuffer,
          uint8Array: letterheadBytes,
          pageCount: 1,
        };
        setHeaderPdf(headerLoaded);
        setHeaderSelectionMode('manual');
        setHeaderTargetPages([currentPage]);
        setHeaderLayerMode('behind');
        showShortcutToast(<FileText className="w-3.5 h-3.5" />, '+', `En-tête ajoutée à la page ${currentPage}`);
        return;
      } catch (err: any) {
        showError("Impossible de charger l'en-tête par défaut", err.message);
        return;
      }
    }

    if (isHeaderActiveOnPage) {
      // Already active on this page -> REMOVE it from current page
      if (headerSelectionMode === 'all') {
        const allPagesExceptCurrent = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
          p => p !== currentPage
        );
        setHeaderSelectionMode('manual');
        setHeaderTargetPages(allPagesExceptCurrent);
      } else {
        setHeaderTargetPages(prev => prev.filter(p => p !== currentPage));
      }
      showShortcutToast(<FileText className="w-3.5 h-3.5" />, '✕', `En-tête retirée de la page ${currentPage}`);
    } else {
      // Not active on this page -> ADD it to current page
      setHeaderSelectionMode('manual');
      setHeaderTargetPages(prev => (prev.includes(currentPage) ? prev : [...prev, currentPage].sort((a, b) => a - b)));
      showShortcutToast(<FileText className="w-3.5 h-3.5" />, '✓', `En-tête ajoutée sur la page ${currentPage}`);
    }
  }, [headerPdf, isHeaderActiveOnPage, headerSelectionMode, totalPages, currentPage, showShortcutToast]);

  // Toggle Header Layer Mode: Arrière-plan (behind) <-> Premier plan (in_front)
  const handleToggleHeaderLayerMode = useCallback(() => {
    setHeaderLayerMode(prev => {
      const next = prev === 'behind' ? 'in_front' : 'behind';
      showShortcutToast(
        <Layers className="w-3.5 h-3.5" />,
        next === 'behind' ? 'Arrière' : 'Avant',
        next === 'behind'
          ? 'En-tête placée en arrière-plan (sous le texte)'
          : 'En-tête placée au premier plan (par-dessus le texte)'
      );
      return next;
    });
  }, [showShortcutToast]);

  // Validate before opening Export modal
  const handleOpenExportModal = useCallback(() => {
    if (!mainPdf) {
      showError('Aucun document principal', 'Veuillez importer un document PDF avant de lancer l’export.');
      return;
    }

    // Check manual selection validation rule (Requirement 6):
    // "empêcher l'export si une sélection manuelle est vide alors qu'un élément correspondant est importé."
    if (signatureImage && signatureSelectionMode === 'manual' && signatureTargetPages.length === 0) {
      showError(
        'Sélection manuelle vide',
        'Une signature est importée en mode « Sélection manuelle », mais aucune page n’est sélectionnée.',
        'Ajoutez au moins une page dans la liste des pages à signer ou basculez en mode « Toutes les pages ».'
      );
      return;
    }

    if (cachetImage && cachetSelectionMode === 'manual' && cachetTargetPages.length === 0) {
      showError(
        'Sélection manuelle vide',
        'Un cachet est importé en mode « Sélection manuelle », mais aucune page n’est sélectionnée.',
        'Sélectionnez au moins une page ou basculez sur « Toutes les pages ».'
      );
      return;
    }

    if (headerPdf && headerSelectionMode === 'manual' && headerTargetPages.length === 0) {
      showError(
        'Sélection manuelle vide',
        'Un en-tête est importé en mode « Sélection manuelle », mais aucune page n’est sélectionnée.',
        'Sélectionnez les pages qui doivent recevoir le papier à lettres.'
      );
      return;
    }

    // Reset progress state
    setExportProgress({
      isExporting: false,
      currentPage: 0,
      totalPages: mainPdf.pageCount || 1,
      percent: 0,
      stepMessage: '',
      completed: false,
    });

    setIsExportModalOpen(true);
  }, [
    mainPdf,
    signatureImage,
    signatureSelectionMode,
    signatureTargetPages,
    cachetImage,
    cachetSelectionMode,
    cachetTargetPages,
    headerPdf,
    headerSelectionMode,
    headerTargetPages,
    showError,
  ]);

  // Execute Export
  const handleExecuteExport = async () => {
    if (!mainPdf) return;

    setExportProgress(prev => ({
      ...prev,
      isExporting: true,
      completed: false,
      percent: 0,
      stepMessage: 'Démarrage du traitement...',
    }));

    try {
      const result = await exportSignedPdf({
        mainPdf,
        headerPdf: headerPdf || undefined,
        headerLayerMode,
        headerSelectionMode,
        headerTargetPages,
        signatureImage: signatureImage || undefined,
        signatureSelectionMode,
        signatureTargetPages,
        cachetImage: cachetImage || undefined,
        cachetSelectionMode,
        cachetTargetPages,
        pageSettings,
        defaultSignature: defaultSignatureConfig,
        defaultCachet: defaultCachetConfig,
        variations,
        activeProfile,
        onProgress: (pct, total, message) => {
          setExportProgress(p => ({
            ...p,
            percent: pct,
            stepMessage: message,
          }));
        },
      });

      setExportProgress(prev => ({
        ...prev,
        isExporting: false,
        completed: true,
        percent: 100,
        stepMessage: 'Document exporté avec succès !',
        exportedBlob: result.pdfBlob,
        exportedFilename: result.pdfFilename,
        auditBlob: result.auditBlob,
        auditFilename: result.auditFilename,
        auditContent: result.auditContent,
      }));
    } catch (err: any) {
      console.error('Export failed:', err);
      setExportProgress(prev => ({
        ...prev,
        isExporting: false,
        error: err.message,
      }));
      showError(
        'Échec de l’exportation',
        `Une erreur est survenue lors de la génération du document : ${err.message}`,
        'Vérifiez la validité de vos fichiers sources ou essayez sans les variations.'
      );
    }
  };

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      // 1. Global Ctrl+S / Cmd+S export trigger (Always intercept to prevent browser "Save Page" HTML)
      if (isCtrlOrMeta && (e.key.toLowerCase() === 's' || e.code === 'KeyS')) {
        e.preventDefault();
        if (isExportModalOpen) {
          // If modal is open and not exporting or completed, trigger export!
          if (!exportProgress.isExporting && !exportProgress.completed) {
            handleExecuteExport();
          }
        } else {
          showShortcutToast(<Download className="w-3.5 h-3.5" />, `${modKey}+S`, 'Exportation du document');
          handleOpenExportModal();
        }
        return;
      }

      // 2. Global Escape closes modals
      if (e.key === 'Escape') {
        if (errorDialog.isOpen) {
          e.preventDefault();
          setErrorDialog(prev => ({ ...prev, isOpen: false }));
          return;
        }
        if (isShortcutsModalOpen) {
          e.preventDefault();
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isSignaturePadOpen) {
          e.preventDefault();
          setIsSignaturePadOpen(false);
          return;
        }
        if (isStampGeneratorOpen) {
          e.preventDefault();
          setIsStampGeneratorOpen(false);
          return;
        }
        if (isAuditModalOpen) {
          e.preventDefault();
          setIsAuditModalOpen(false);
          return;
        }
        if (isExportModalOpen && !exportProgress.isExporting) {
          e.preventDefault();
          setIsExportModalOpen(false);
          return;
        }
        if (isFullscreen) {
          e.preventDefault();
          setIsFullscreen(false);
          try {
            if (document.fullscreenElement) {
              document.exitFullscreen?.().catch(() => {});
            }
          } catch {}
          showShortcutToast(<Minimize className="w-3.5 h-3.5" />, 'Échap', 'Plein écran désactivé');
          return;
        }
      }

      // 3. Open shortcuts guide with '?' or 'F1'
      if (!isInputActive && (e.key === '?' || (e.key === '/' && e.shiftKey) || e.key === 'F1')) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
        return;
      }

      // If an input is actively focused, do not intercept normal typing navigation or zoom
      if (isInputActive) {
        return;
      }

      // If a modal is open, let the modal handle its own keys
      if (
        isExportModalOpen ||
        isAuditModalOpen ||
        isSignaturePadOpen ||
        isStampGeneratorOpen ||
        errorDialog.isOpen ||
        isShortcutsModalOpen
      ) {
        return;
      }

      // 4. Page navigation with Arrow keys & PageUp/PageDown / Home / End
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextPage();
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        handleFirstPage();
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        handleLastPage();
        return;
      }

      // 5. Zoom controls (+ / - / 0)
      const isZoomInKey =
        e.key === '+' ||
        e.key === '=' ||
        e.code === 'NumpadAdd' ||
        (isCtrlOrMeta && (e.key === '+' || e.key === '=' || e.code === 'Equal' || e.code === 'NumpadAdd'));

      if (isZoomInKey) {
        e.preventDefault();
        handleZoomIn();
        return;
      }

      const isZoomOutKey =
        e.key === '-' ||
        e.key === '_' ||
        e.code === 'NumpadSubtract' ||
        (isCtrlOrMeta && (e.key === '-' || e.key === '_' || e.code === 'Minus' || e.code === 'NumpadSubtract'));

      if (isZoomOutKey) {
        e.preventDefault();
        handleZoomOut();
        return;
      }

      const isZoomResetKey =
        e.key === '0' ||
        e.code === 'Numpad0' ||
        (isCtrlOrMeta && (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0'));

      if (isZoomResetKey) {
        e.preventDefault();
        handleFitToScreen();
        return;
      }

      // 6. Element switcher (1 / S for Signature, 2 / C for Cachet)
      if (!isCtrlOrMeta && !e.altKey) {
        if (e.key === '1' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleSelectSignature();
          return;
        }
        if (e.key === '2' || e.key.toLowerCase() === 'c') {
          e.preventDefault();
          handleSelectCachet();
          return;
        }
      }

      // 7. Fullscreen toggle (F or F11)
      if (!isCtrlOrMeta && !e.altKey && (e.key.toLowerCase() === 'f' || e.key === 'F11')) {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }

      // 8. Sticky pin toggle (P)
      if (!isCtrlOrMeta && !e.altKey && !isFullscreen && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleToggleSticky();
        return;
      }

      // 9. Wide view toggle (W)
      if (!isCtrlOrMeta && !e.altKey && !isFullscreen && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleToggleWide();
        return;
      }

      // 10. Toggle Cachet & Signature together on current page (T)
      if (!isCtrlOrMeta && !e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleToggleStampAndSignatureOnCurrentPage();
        return;
      }

      // 11. Toggle En-tête on current page (E)
      if (!isCtrlOrMeta && !e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleToggleHeaderOnCurrentPage();
        return;
      }

      // 12. Toggle Header Layer Mode: Arrière-plan / Premier plan (L)
      if (!isCtrlOrMeta && !e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleToggleHeaderLayerMode();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isMac,
    modKey,
    handlePrevPage,
    handleNextPage,
    handleFirstPage,
    handleLastPage,
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
    handleSelectSignature,
    handleSelectCachet,
    handleToggleFullscreen,
    handleToggleSticky,
    handleToggleWide,
    handleToggleStampAndSignatureOnCurrentPage,
    handleToggleCachetOnCurrentPage,
    handleToggleHeaderOnCurrentPage,
    handleToggleHeaderLayerMode,
    isFullscreen,
    handleOpenExportModal,
    isExportModalOpen,
    exportProgress.isExporting,
    exportProgress.completed,
    isAuditModalOpen,
    isSignaturePadOpen,
    isStampGeneratorOpen,
    isShortcutsModalOpen,
    errorDialog.isOpen,
    showShortcutToast,
  ]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-sm shadow-blue-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  Signature &amp; Cachet Manager
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 rounded-md">
                  Pro v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Apposez signatures, cachets d’entreprise et papiers à lettres en toute précision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleFullscreen}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isFullscreen
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
              title={isFullscreen ? 'Quitter le mode plein écran (Échap ou F)' : 'Basculer en mode plein écran (F)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quitter plein écran</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Plein écran</span>
                  <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-white text-slate-500 border border-slate-300 rounded shadow-2xs">
                    F
                  </kbd>
                </>
              )}
            </button>

            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Guide des raccourcis clavier (? ou F1)"
            >
              <Keyboard className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Raccourcis</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-white text-slate-500 border border-slate-300 rounded shadow-2xs">
                ?
              </kbd>
            </button>

            {exportProgress.completed && exportProgress.auditContent && (
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Consulter le journal d'audit JSON Lines"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Piste d'audit</span>
              </button>
            )}

            <button
              onClick={handleOpenExportModal}
              disabled={!mainPdf}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 rounded-xl shadow-xs shadow-blue-500/25 transition-all cursor-pointer"
              title={`Exporter le document (${modKey}+S)`}
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium bg-blue-700 text-blue-100 rounded border border-blue-500/40">
                {modKey}+S
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Legal & Out-of-Scope Notice Banner */}
      {!isFullscreen && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <p className="leading-tight">
              <span className="font-semibold">Notice d’usage :</span> La superposition graphique de signature et cachet ne constitue pas une signature électronique cryptographique qualifiée (règlement eIDAS). Elle est destinée aux factures, devis, bons de commande et documents internes d'entreprise.
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main
        className={`flex-1 w-full transition-all duration-150 ${
          isFullscreen
            ? 'fixed inset-0 z-40 bg-slate-950 p-2 sm:p-4 h-screen w-screen overflow-hidden flex flex-col'
            : isViewerWide
            ? 'max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
        }`}
      >
        <div className={isFullscreen ? 'flex-1 h-full w-full flex flex-col' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'}>
          {/* Left Column: Interactive Viewer (sticky and responsive) */}
          <section
            className={
              isFullscreen
                ? 'h-full flex-1 flex flex-col'
                : `${isViewerWide ? 'lg:col-span-8' : 'lg:col-span-7'} flex flex-col ${
                    isViewerSticky ? 'lg:sticky lg:top-3 lg:self-start' : ''
                  }`
            }
          >
            <div
              className={
                isFullscreen
                  ? 'h-full flex-1 flex flex-col'
                  : isViewerSticky
                  ? 'lg:h-[calc(100vh-4.5rem)] min-h-[580px] flex flex-col'
                  : 'h-[700px] sm:h-[780px] flex flex-col'
              }
            >
              <InteractiveViewer
                mainPdf={mainPdf}
                headerPdf={headerPdf}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                headerLayerMode={headerLayerMode}
                isHeaderActiveOnPage={isHeaderActiveOnPage}
                isSignatureActiveOnPage={isSignatureActiveOnPage}
                isCachetActiveOnPage={isCachetActiveOnPage}
                signatureImage={signatureImage}
                cachetImage={cachetImage}
                signatureConfig={currentSigConfig}
                cachetConfig={currentCachetConfig}
                onUpdateSignature={handleUpdateSignature}
                onUpdateCachet={handleUpdateCachet}
                activeElementTab={activeElementTab}
                onSelectElementTab={setActiveElementTab}
                variations={variations}
                zoomLevel={zoomLevel}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitToScreen={handleFitToScreen}
                onSetZoomLevel={handleSetZoomLevel}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                onOpenExport={handleOpenExportModal}
                isSticky={isViewerSticky}
                onToggleSticky={handleToggleSticky}
                isWide={isViewerWide}
                onToggleWide={handleToggleWide}
                onToggleCachetOnPage={handleToggleCachetOnCurrentPage}
                onToggleHeaderOnPage={handleToggleHeaderOnCurrentPage}
                isStampAndSignatureActiveOnPage={isStampAndSignatureActiveOnPage}
                onToggleStampAndSignatureOnPage={handleToggleStampAndSignatureOnCurrentPage}
                onToggleHeaderLayerMode={handleToggleHeaderLayerMode}
                isLinked={isLinked}
              />
            </div>
          </section>

          {/* Right Column: Controls & Configuration Panels (hidden when isFullscreen is true) */}
          {!isFullscreen && (
            <section className={`${isViewerWide ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-5`}>
            {/* 1. File Import and Management */}
            <FileImportCard
              mainPdf={mainPdf}
              signatureImage={signatureImage}
              cachetImage={cachetImage}
              headerPdf={headerPdf}
              onUploadMainPdf={handleUploadMainPdf}
              onUploadSignature={handleUploadSignature}
              onUploadCachet={handleUploadCachet}
              onUploadHeaderPdf={handleUploadHeaderPdf}
              onRemoveMainPdf={() => {
                setMainPdf(null);
                setCurrentPage(1);
              }}
              onRemoveSignature={() => setSignatureImage(null)}
              onRemoveCachet={() => setCachetImage(null)}
              onRemoveHeaderPdf={() => setHeaderPdf(null)}
              onOpenSignaturePad={() => setIsSignaturePadOpen(true)}
              onOpenStampGenerator={() => setIsStampGeneratorOpen(true)}
              onLoadFullSample={handleLoadFullSample}
              isLoadingSample={isLoadingSample}
            />

            {/* 2. Section Paramètres : Tailles, Position relative Signature/Tampon & Variations */}
            <SettingsPanel
              currentPage={currentPage}
              totalPages={totalPages}
              signatureConfig={currentSigConfig}
              cachetConfig={currentCachetConfig}
              onUpdateSignature={handleUpdateSignature}
              onUpdateCachet={handleUpdateCachet}
              onApplyToAllPages={handleApplyToAllPages}
              onResetCurrentPage={handleResetCurrentPage}
              hasSignature={Boolean(signatureImage)}
              hasCachet={Boolean(cachetImage)}
              isLinked={isLinked}
              onToggleLinked={() => setIsLinked(prev => !prev)}
              variations={variations}
              onChangeVariations={setVariations}
            />

            {/* 3. Page Selection for Signature & Cachet */}
            {mainPdf && (
              <div className="space-y-4">
                <PageSelector
                  title="Pages avec signature"
                  badgeColor="blue"
                  totalPages={totalPages}
                  selectionMode={signatureSelectionMode}
                  onModeChange={setSignatureSelectionMode}
                  selectedPages={signatureTargetPages}
                  onSelectedPagesChange={setSignatureTargetPages}
                  currentPage={currentPage}
                  onPageClick={setCurrentPage}
                  isItemLoaded={Boolean(signatureImage)}
                />

                <PageSelector
                  title="Pages avec cachet"
                  badgeColor="red"
                  totalPages={totalPages}
                  selectionMode={cachetSelectionMode}
                  onModeChange={setCachetSelectionMode}
                  selectedPages={cachetTargetPages}
                  onSelectedPagesChange={setCachetTargetPages}
                  currentPage={currentPage}
                  onPageClick={setCurrentPage}
                  isItemLoaded={Boolean(cachetImage)}
                />
              </div>
            )}

            {/* 4. Header Configuration (Layer & Multi-page mapping) */}
            {mainPdf && (
              <HeaderSettings
                headerPdf={headerPdf}
                layerMode={headerLayerMode}
                onLayerModeChange={setHeaderLayerMode}
                selectionMode={headerSelectionMode}
                onSelectionModeChange={setHeaderSelectionMode}
                selectedPages={headerTargetPages}
                onSelectedPagesChange={setHeaderTargetPages}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageClick={setCurrentPage}
              />
            )}
          </section>
        )}
      </div>
    </main>

      {/* Modals */}
      {/* 1. Export Confirmation & Progress Modal */}
      {mainPdf && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          mainPdf={mainPdf}
          headerPdf={headerPdf}
          headerLayerMode={headerLayerMode}
          headerSelectionMode={headerSelectionMode}
          headerTargetPages={headerTargetPages}
          signatureImage={signatureImage}
          signatureSelectionMode={signatureSelectionMode}
          signatureTargetPages={signatureTargetPages}
          cachetImage={cachetImage}
          cachetSelectionMode={cachetSelectionMode}
          cachetTargetPages={cachetTargetPages}
          activeProfile={activeProfile}
          variations={variations}
          exportProgress={exportProgress}
          onConfirmExport={handleExecuteExport}
          onViewAuditLog={() => {
            setIsExportModalOpen(false);
            setIsAuditModalOpen(true);
          }}
        />
      )}

      {/* 2. Audit Trail JSONL Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditContent={exportProgress.auditContent}
        filename={exportProgress.auditFilename}
      />

      {/* 3. Interactive Signature Pad Modal */}
      <SignaturePadModal
        isOpen={isSignaturePadOpen}
        onClose={() => setIsSignaturePadOpen(false)}
        onSave={setSignatureImage}
      />

      {/* 4. Stamp / Rubber Stamp Generator Modal */}
      <StampGeneratorModal
        isOpen={isStampGeneratorOpen}
        onClose={() => setIsStampGeneratorOpen(false)}
        onSave={setCachetImage}
      />

      {/* 5. Robust Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}
        title={errorDialog.title}
        message={errorDialog.message}
        suggestion={errorDialog.suggestion}
      />

      {/* 6. Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* 7. Non-intrusive Shortcut Toast HUD */}
      <ShortcutToast toast={shortcutToast} />
    </div>
  );
}
