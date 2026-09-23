import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export interface RenderResult {
  width: number;
  height: number;
  aspectRatio: number;
}

// In-memory cache for loaded PDF documents to avoid re-parsing on every page change
const pdfDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

export async function getPdfDocument(data: Uint8Array, cacheKey?: string): Promise<pdfjsLib.PDFDocumentProxy> {
  if (cacheKey && pdfDocCache.has(cacheKey)) {
    return pdfDocCache.get(cacheKey)!;
  }
  // Create copy of buffer to prevent detached ArrayBuffer issues
  const copy = new Uint8Array(data);
  const loadingTask = pdfjsLib.getDocument({
    data: copy,
    cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
    cMapPacked: true,
  });
  const doc = await loadingTask.promise;
  if (cacheKey) {
    pdfDocCache.set(cacheKey, doc);
  }
  return doc;
}

export function clearPdfCache(): void {
  pdfDocCache.clear();
}

/**
 * Renders a specific PDF page onto a canvas element.
 */
export async function renderPdfPage(
  pdfData: Uint8Array,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.5,
  cacheKey?: string
): Promise<RenderResult> {
  const doc = await getPdfDocument(pdfData, cacheKey);
  const numPages = doc.numPages;
  const safePageNum = Math.max(1, Math.min(pageNumber, numPages));
  const page = await doc.getPage(safePageNum);

  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Impossible d’initialiser le contexte 2D du canevas');
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  const renderContext: any = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;

  return {
    width: viewport.width,
    height: viewport.height,
    aspectRatio: viewport.width / viewport.height,
  };
}
