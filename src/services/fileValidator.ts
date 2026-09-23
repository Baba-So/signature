import { LoadedFile } from '../types';
import { calculateSha256 } from './auditLogger';
import { getPdfDocument } from './pdfRenderer';

export class FileValidationError extends Error {
  constructor(message: string, public userFriendlyMessage: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * Validates and loads a PDF file.
 */
export async function validateAndLoadPdf(file: File): Promise<LoadedFile> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    throw new FileValidationError(
      'Invalid file type',
      `Le fichier « ${file.name} » n'est pas un document PDF valide. Veuillez sélectionner un fichier au format .pdf.`
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Check magic bytes: %PDF-
  if (uint8Array.length < 5) {
    throw new FileValidationError(
      'File too small',
      `Le fichier « ${file.name} » est vide ou corrompu.`
    );
  }

  const header = String.fromCharCode(...uint8Array.slice(0, 5));
  if (!header.startsWith('%PDF')) {
    throw new FileValidationError(
      'Invalid PDF header',
      `Le fichier « ${file.name} » n'est pas reconnu comme un PDF valide (signature de fichier incorrecte).`
    );
  }

  try {
    const doc = await getPdfDocument(uint8Array, `validate-${file.name}-${file.size}`);
    const pageCount = doc.numPages;
    const sha256 = await calculateSha256(uint8Array);

    return {
      file,
      name: file.name,
      size: file.size,
      type: 'application/pdf',
      arrayBuffer,
      uint8Array,
      pageCount,
      sha256,
    };
  } catch (err: any) {
    throw new FileValidationError(
      err?.message || 'PDF parse error',
      `Impossible d'ouvrir le document PDF « ${file.name} ». Le fichier est peut-être protégé par mot de passe ou endommagé.`
    );
  }
}

/**
 * Validates and loads a signature or cachet image file (PNG, JPG, JPEG, WebP).
 * Automatically converts WebP to PNG so pdf-lib can embed it losslessly.
 */
export async function validateAndLoadImage(
  file: File,
  expectedKind: 'signature' | 'cachet'
): Promise<LoadedFile> {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  const nameLower = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some(ext => nameLower.endsWith(ext));

  if (!hasValidExt && !file.type.startsWith('image/')) {
    throw new FileValidationError(
      'Invalid image format',
      `Le fichier « ${file.name} » n'est pas un format d'image supporté pour la ${expectedKind}. Formats acceptés : PNG, JPG, JPEG, WebP.`
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const dataUrl = await fileToDataUrl(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        let finalDataUrl = dataUrl;
        let finalUint8Array = uint8Array;
        let finalType = file.type || 'image/png';

        // If WebP, convert to transparent PNG for pdf-lib compatibility
        if (nameLower.endsWith('.webp') || file.type === 'image/webp') {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            finalDataUrl = canvas.toDataURL('image/png');
            const res = await fetch(finalDataUrl);
            const blob = await res.blob();
            const convBuffer = await blob.arrayBuffer();
            finalUint8Array = new Uint8Array(convBuffer);
            finalType = 'image/png';
          }
        }

        const sha256 = await calculateSha256(finalUint8Array);

        resolve({
          file,
          name: file.name,
          size: finalUint8Array.length,
          type: finalType,
          dataUrl: finalDataUrl,
          arrayBuffer: finalUint8Array.buffer as ArrayBuffer,
          uint8Array: finalUint8Array,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          sha256,
        });
      } catch (e: any) {
        reject(
          new FileValidationError(
            e?.message || 'Image processing error',
            `Erreur lors du traitement de l'image « ${file.name} ».`
          )
        );
      }
    };

    img.onerror = () => {
      reject(
        new FileValidationError(
          'Image decode failure',
          `Le fichier « ${file.name} » semble être endommagé ou n'est pas une image lisible.`
        )
      );
    };

    img.src = dataUrl;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsDataURL(file);
  });
}
