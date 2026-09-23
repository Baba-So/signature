export interface OverlayElementConfig {
  x: number; // 0 to 100 (% of page width, top-left or reference)
  y: number; // 0 to 100 (% of page height, top-left or reference)
  width: number; // % of page width (typically 10% to 50%)
  rotation: number; // -180 to 180 degrees
  opacity?: number; // 0.1 to 1.0 (defaults to 1.0 for 100% opaque)
}

export interface PageOverlaySettings {
  signature?: OverlayElementConfig;
  cachet?: OverlayElementConfig;
}

export type DocumentPagesSettings = Record<number, PageOverlaySettings>;

export interface ControlledVariations {
  enabled: boolean;
  positionAmplitude: number; // ± % (e.g. 0 to 10%)
  rotationAmplitude: number; // ± degrees (e.g. 0 to 15 deg)
  sizeAmplitude: number; // ± % (e.g. 0 to 15%)
}

export type PageSelectionMode = 'all' | 'manual';
export type HeaderLayerMode = 'behind' | 'in_front';

export type PresetProfileId = 'standard' | 'large_signature' | 'clear_stamp' | 'contract';

export interface PresetProfile {
  id: PresetProfileId;
  name: string;
  description: string;
  signature: OverlayElementConfig;
  cachet: OverlayElementConfig;
}

export interface LoadedFile {
  file?: File;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  arrayBuffer: ArrayBuffer;
  uint8Array: Uint8Array;
  pageCount?: number;
  width?: number; // for images
  height?: number; // for images
  aspectRatio?: number;
  sha256?: string;
}

export interface AuditRecord {
  event: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export interface ExportProgress {
  isExporting: boolean;
  currentPage: number;
  totalPages: number;
  percent: number;
  stepMessage: string;
  completed: boolean;
  error?: string;
  exportedBlob?: Blob;
  exportedFilename?: string;
  auditBlob?: Blob;
  auditFilename?: string;
  auditContent?: string;
}
