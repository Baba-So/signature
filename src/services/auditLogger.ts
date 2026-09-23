import { ControlledVariations, HeaderLayerMode, PageSelectionMode, PresetProfileId } from '../types';

/**
 * Calculates SHA-256 hex digest for ArrayBuffer or Uint8Array
 */
export async function calculateSha256(data: Uint8Array | ArrayBuffer): Promise<string> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface AuditExportPayload {
  sourcePdfName: string;
  sourcePdfSha256: string;
  sourcePdfSize: number;
  sourceTotalPages: number;

  headerPdfName?: string;
  headerPdfSha256?: string;
  headerLayerMode?: HeaderLayerMode;
  headerSelectionMode: PageSelectionMode;
  headerTargetPages: number[];

  signatureName?: string;
  signatureSha256?: string;
  signatureSelectionMode: PageSelectionMode;
  signatureTargetPages: number[];

  cachetName?: string;
  cachetSha256?: string;
  cachetSelectionMode: PageSelectionMode;
  cachetTargetPages: number[];

  activeProfile: PresetProfileId;
  variations: ControlledVariations;

  appliedPagesLog: Array<{
    pageNumber: number;
    hasHeader: boolean;
    headerPageIndex?: number;
    signatureApplied?: {
      base: { x: number; y: number; width: number; rotation: number };
      effective: { x: number; y: number; width: number; rotation: number };
      variations: { deltaX: number; deltaY: number; deltaRot: number; deltaScale: number };
    };
    cachetApplied?: {
      base: { x: number; y: number; width: number; rotation: number };
      effective: { x: number; y: number; width: number; rotation: number };
      variations: { deltaX: number; deltaY: number; deltaRot: number; deltaScale: number };
    };
  }>;

  outputFilename: string;
  outputPdfSha256: string;
  outputPdfSize: number;
  durationMs: number;
}

/**
 * Formats an audit trail session as standard JSON Lines (.jsonl)
 */
export function generateAuditJsonLines(payload: AuditExportPayload): string {
  const now = new Date().toISOString();
  const sessionId = 'SES-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const lines: object[] = [
    {
      session_id: sessionId,
      record_type: 'EXPORT_SESSION_INIT',
      timestamp: now,
      application: 'Signature & Cachet Manager',
      version: '1.0.0',
      compliance_disclaimer: 'Superposition graphique d’éléments d’authentification. Ne se substitue pas à une signature cryptographique eIDAS qualifiée.',
      source_document: {
        filename: payload.sourcePdfName,
        size_bytes: payload.sourcePdfSize,
        sha256: payload.sourcePdfSha256,
        total_pages: payload.sourceTotalPages,
      },
    },
    {
      session_id: sessionId,
      record_type: 'ASSETS_MANIFEST',
      timestamp: now,
      assets: {
        header_pdf: payload.headerPdfName
          ? {
              filename: payload.headerPdfName,
              sha256: payload.headerPdfSha256,
              layer_mode: payload.headerLayerMode,
              selection_mode: payload.headerSelectionMode,
              target_pages: payload.headerTargetPages,
            }
          : null,
        signature_image: payload.signatureName
          ? {
              filename: payload.signatureName,
              sha256: payload.signatureSha256,
              selection_mode: payload.signatureSelectionMode,
              target_pages: payload.signatureTargetPages,
            }
          : null,
        cachet_image: payload.cachetName
          ? {
              filename: payload.cachetName,
              sha256: payload.cachetSha256,
              selection_mode: payload.cachetSelectionMode,
              target_pages: payload.cachetTargetPages,
            }
          : null,
      },
    },
    {
      session_id: sessionId,
      record_type: 'CONFIGURATION_AND_VARIATIONS',
      timestamp: now,
      active_profile: payload.activeProfile,
      controlled_variations: {
        enabled: payload.variations.enabled,
        position_amplitude_pct: payload.variations.positionAmplitude,
        rotation_amplitude_deg: payload.variations.rotationAmplitude,
        size_amplitude_pct: payload.variations.sizeAmplitude,
        seed_mode: 'deterministic_per_page_mulberry32',
      },
    },
    {
      session_id: sessionId,
      record_type: 'PAGE_OPERATIONS_DETAILS',
      timestamp: now,
      total_pages_processed: payload.appliedPagesLog.length,
      pages: payload.appliedPagesLog,
    },
    {
      session_id: sessionId,
      record_type: 'EXPORT_SESSION_COMPLETE',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      processing_duration_ms: payload.durationMs,
      output_document: {
        filename: payload.outputFilename,
        size_bytes: payload.outputPdfSize,
        sha256: payload.outputPdfSha256,
      },
    },
  ];

  return lines.map(obj => JSON.stringify(obj)).join('\n') + '\n';
}
