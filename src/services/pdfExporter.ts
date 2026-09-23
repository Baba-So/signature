import { PDFDocument, degrees } from 'pdf-lib';
import {
  ControlledVariations,
  DocumentPagesSettings,
  HeaderLayerMode,
  LoadedFile,
  OverlayElementConfig,
  PageSelectionMode,
  PresetProfileId,
} from '../types';
import { calculateSha256, generateAuditJsonLines } from './auditLogger';
import { computeEffectiveGeometry } from './variationEngine';

export interface ExportPdfOptions {
  mainPdf: LoadedFile;
  headerPdf?: LoadedFile;
  headerLayerMode: HeaderLayerMode;
  headerSelectionMode: PageSelectionMode;
  headerTargetPages: number[];

  signatureImage?: LoadedFile;
  signatureSelectionMode: PageSelectionMode;
  signatureTargetPages: number[];

  cachetImage?: LoadedFile;
  cachetSelectionMode: PageSelectionMode;
  cachetTargetPages: number[];

  pageSettings: DocumentPagesSettings;
  defaultSignature: OverlayElementConfig;
  defaultCachet: OverlayElementConfig;

  variations: ControlledVariations;
  activeProfile: PresetProfileId;

  onProgress: (current: number, total: number, message: string) => void;
}

export interface ExportResult {
  pdfBytes: Uint8Array;
  pdfBlob: Blob;
  pdfFilename: string;
  auditContent: string;
  auditBlob: Blob;
  auditFilename: string;
  sha256: string;
}

export async function exportSignedPdf(options: ExportPdfOptions): Promise<ExportResult> {
  const startTime = Date.now();
  const {
    mainPdf,
    headerPdf,
    headerLayerMode,
    headerSelectionMode,
    headerTargetPages,
    signatureImage,
    signatureSelectionMode,
    signatureTargetPages,
    cachetImage,
    cachetSelectionMode,
    cachetTargetPages,
    pageSettings,
    defaultSignature,
    defaultCachet,
    variations,
    activeProfile,
    onProgress,
  } = options;

  onProgress(0, 100, 'Calcul des empreintes cryptographiques SHA-256...');

  // Compute SHA-256 hashes if missing
  const mainPdfSha256 = mainPdf.sha256 || (await calculateSha256(mainPdf.uint8Array));
  const headerPdfSha256 = headerPdf
    ? headerPdf.sha256 || (await calculateSha256(headerPdf.uint8Array))
    : undefined;
  const signatureSha256 = signatureImage
    ? signatureImage.sha256 || (await calculateSha256(signatureImage.uint8Array))
    : undefined;
  const cachetSha256 = cachetImage
    ? cachetImage.sha256 || (await calculateSha256(cachetImage.uint8Array))
    : undefined;

  onProgress(5, 100, 'Initialisation du document de composition...');

  // Target document
  const outDoc = await PDFDocument.create();

  // Load source document
  const sourceDoc = await PDFDocument.load(mainPdf.uint8Array);
  const totalPages = sourceDoc.getPageCount();

  // Embed source pages into outDoc
  const sourcePageIndices = Array.from({ length: totalPages }, (_, i) => i);
  const embeddedSourcePages = await outDoc.embedPdf(sourceDoc, sourcePageIndices);

  // If header exists, load and embed header pages
  let embeddedHeaderPages: any[] = [];
  let headerTotalPages = 0;
  if (headerPdf) {
    onProgress(10, 100, 'Intégration de l’en-tête vectoriel...');
    const headerDoc = await PDFDocument.load(headerPdf.uint8Array);
    headerTotalPages = headerDoc.getPageCount();
    const headerIndices = Array.from({ length: headerTotalPages }, (_, i) => i);
    embeddedHeaderPages = await outDoc.embedPdf(headerDoc, headerIndices);
  }

  // Embed signature image if provided
  let embeddedSignatureImage: any = null;
  if (signatureImage) {
    onProgress(15, 100, 'Encapsulation de la signature haute définition...');
    const isPng =
      signatureImage.type.includes('png') ||
      signatureImage.name.toLowerCase().endsWith('.png') ||
      (signatureImage.dataUrl && signatureImage.dataUrl.startsWith('data:image/png'));
    if (isPng) {
      embeddedSignatureImage = await outDoc.embedPng(signatureImage.uint8Array);
    } else {
      embeddedSignatureImage = await outDoc.embedJpg(signatureImage.uint8Array);
    }
  }

  // Embed cachet image if provided
  let embeddedCachetImage: any = null;
  if (cachetImage) {
    onProgress(20, 100, 'Encapsulation du cachet officiel...');
    const isPng =
      cachetImage.type.includes('png') ||
      cachetImage.name.toLowerCase().endsWith('.png') ||
      (cachetImage.dataUrl && cachetImage.dataUrl.startsWith('data:image/png'));
    if (isPng) {
      embeddedCachetImage = await outDoc.embedPng(cachetImage.uint8Array);
    } else {
      embeddedCachetImage = await outDoc.embedJpg(cachetImage.uint8Array);
    }
  }

  const appliedPagesLog: any[] = [];

  // Process page by page
  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageNum = pageIdx + 1;
    const progressPct = 20 + Math.round(((pageIdx + 1) / totalPages) * 70);
    onProgress(progressPct, 100, `Traitement de la page ${pageNum} sur ${totalPages}...`);

    const embeddedSrc = embeddedSourcePages[pageIdx];
    const pageWidth = embeddedSrc.width;
    const pageHeight = embeddedSrc.height;

    const newPage = outDoc.addPage([pageWidth, pageHeight]);

    // Check if header applies to this page
    const applyHeader =
      Boolean(headerPdf) &&
      (headerSelectionMode === 'all' || headerTargetPages.includes(pageNum));

    let currentHeaderEmbedded: any = null;
    let headerPageUsedIndex = 0;
    if (applyHeader && embeddedHeaderPages.length > 0) {
      headerPageUsedIndex = Math.min(pageIdx, headerTotalPages - 1);
      currentHeaderEmbedded = embeddedHeaderPages[headerPageUsedIndex];
    }

    // 1. If header behind: draw header first
    if (applyHeader && currentHeaderEmbedded && headerLayerMode === 'behind') {
      newPage.drawPage(currentHeaderEmbedded, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    }

    // 2. Draw original page
    newPage.drawPage(embeddedSrc, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    // 3. If header in front: draw header on top
    if (applyHeader && currentHeaderEmbedded && headerLayerMode === 'in_front') {
      newPage.drawPage(currentHeaderEmbedded, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    }

    // Determine config for this page
    const pSettings = pageSettings[pageNum] || {};
    const sigConfig = pSettings.signature || defaultSignature;
    const cachetConfig = pSettings.cachet || defaultCachet;

    // Apply Cachet (draw cachet first so signature is on top if they overlap)
    const applyCachet =
      Boolean(cachetImage && embeddedCachetImage) &&
      (cachetSelectionMode === 'all' || cachetTargetPages.includes(pageNum));

    let cachetLog: any = undefined;
    if (applyCachet && embeddedCachetImage) {
      const geo = computeEffectiveGeometry(pageNum, 'cachet', cachetConfig, variations);
      drawRotatedImage(newPage, embeddedCachetImage, geo, pageWidth, pageHeight);
      cachetLog = {
        base: { x: cachetConfig.x, y: cachetConfig.y, width: cachetConfig.width, rotation: cachetConfig.rotation, opacity: cachetConfig.opacity ?? 1 },
        effective: { x: geo.effectiveX, y: geo.effectiveY, width: geo.effectiveWidth, rotation: geo.effectiveRotation, opacity: geo.opacity ?? 1 },
        variations: { deltaX: geo.deltaX, deltaY: geo.deltaY, deltaRot: geo.deltaRot, deltaScale: geo.deltaScale },
      };
    }

    // Apply Signature
    const applySignature =
      Boolean(signatureImage && embeddedSignatureImage) &&
      (signatureSelectionMode === 'all' || signatureTargetPages.includes(pageNum));

    let signatureLog: any = undefined;
    if (applySignature && embeddedSignatureImage) {
      const geo = computeEffectiveGeometry(pageNum, 'signature', sigConfig, variations);
      drawRotatedImage(newPage, embeddedSignatureImage, geo, pageWidth, pageHeight);
      signatureLog = {
        base: { x: sigConfig.x, y: sigConfig.y, width: sigConfig.width, rotation: sigConfig.rotation },
        effective: { x: geo.effectiveX, y: geo.effectiveY, width: geo.effectiveWidth, rotation: geo.effectiveRotation },
        variations: { deltaX: geo.deltaX, deltaY: geo.deltaY, deltaRot: geo.deltaRot, deltaScale: geo.deltaScale },
      };
    }

    appliedPagesLog.push({
      pageNumber: pageNum,
      hasHeader: applyHeader,
      headerPageIndex: applyHeader ? headerPageUsedIndex + 1 : undefined,
      signatureApplied: signatureLog,
      cachetApplied: cachetLog,
    });
  }

  onProgress(92, 100, 'Assemblage final et compression du PDF...');
  const outBytes = await outDoc.save();
  const outSha256 = await calculateSha256(outBytes);

  onProgress(96, 100, 'Génération du journal d’audit cryptographique (.jsonl)...');

  // Build clean filenames
  const baseName = mainPdf.name.replace(/\.[^/.]+$/, '');
  const outPdfFilename = `${baseName}_signe.pdf`;
  const auditFilename = `${baseName}_audit.jsonl`;

  const auditContent = generateAuditJsonLines({
    sourcePdfName: mainPdf.name,
    sourcePdfSha256: mainPdfSha256,
    sourcePdfSize: mainPdf.size,
    sourceTotalPages: totalPages,
    headerPdfName: headerPdf?.name,
    headerPdfSha256,
    headerLayerMode,
    headerSelectionMode,
    headerTargetPages,
    signatureName: signatureImage?.name,
    signatureSha256,
    signatureSelectionMode,
    signatureTargetPages,
    cachetName: cachetImage?.name,
    cachetSha256,
    cachetSelectionMode,
    cachetTargetPages,
    activeProfile,
    variations,
    appliedPagesLog,
    outputFilename: outPdfFilename,
    outputPdfSha256: outSha256,
    outputPdfSize: outBytes.length,
    durationMs: Date.now() - startTime,
  });

  const pdfBlob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const auditBlob = new Blob([auditContent], { type: 'application/x-ndjson;charset=utf-8' });

  onProgress(100, 100, 'Exportation réussie !');

  return {
    pdfBytes: outBytes,
    pdfBlob,
    pdfFilename: outPdfFilename,
    auditContent,
    auditBlob,
    auditFilename,
    sha256: outSha256,
  };
}

/**
 * Draws an embedded image onto a PDFPage with exact center-based rotation and aspect ratio.
 */
function drawRotatedImage(
  page: any,
  img: any,
  geo: any,
  pageWidth: number,
  pageHeight: number
) {
  const elemWidthPt = (geo.effectiveWidth / 100) * pageWidth;
  const aspectRatio = img.width / img.height;
  const elemHeightPt = elemWidthPt / aspectRatio;

  // In HTML preview:
  // x% and y% are top-left relative to page width and height
  const xLeftPt = (geo.effectiveX / 100) * pageWidth;
  const yTopPt = pageHeight - (geo.effectiveY / 100) * pageHeight;

  // Center of element in PDF coordinate space
  const cx = xLeftPt + elemWidthPt / 2;
  const cy = yTopPt - elemHeightPt / 2;

  // CSS clockwise degrees -> PDF counter-clockwise degrees
  const cssRot = geo.effectiveRotation || 0;
  const pdfAngle = -cssRot;
  const rad = (pdfAngle * Math.PI) / 180;

  // Vector from center to bottom-left corner
  const rx = -elemWidthPt / 2;
  const ry = -elemHeightPt / 2;

  const drawX = cx + rx * Math.cos(rad) - ry * Math.sin(rad);
  const drawY = cy + rx * Math.sin(rad) + ry * Math.cos(rad);

  const opacityVal = typeof geo.opacity === 'number' ? Math.max(0.05, Math.min(1, geo.opacity)) : 1;

  page.drawImage(img, {
    x: drawX,
    y: drawY,
    width: elemWidthPt,
    height: elemHeightPt,
    rotate: degrees(pdfAngle),
    opacity: opacityVal,
  });
}
