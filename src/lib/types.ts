export type ToolId =
  | 'merge'
  | 'split'
  | 'compress'
  | 'pdf_to_word'
  | 'word_to_pdf'
  | 'pdf_to_jpg'
  | 'jpg_to_pdf'
  | 'rotate'
  | 'page_numbers'
  | 'watermark'
  | 'protect'
  | 'unlock'
  | 'organize'
  | 'edit'
  | 'ocr'
  | 'workflow';

export interface ToolMetadata {
  id: ToolId;
  name: string;
  category: 'organize' | 'optimize' | 'convert' | 'edit' | 'security';
  description: string;
  icon: string;
  badge?: 'New' | 'Popular' | 'OCR';
  href: string;
}

export interface StagedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  rotation: number; // 0, 90, 180, 270
  previewUrl?: string;
}

export interface TaskRecord {
  id: string;
  taskToken: string;
  tool: ToolId;
  status: 'opened' | 'uploading' | 'processing' | 'completed' | 'failed' | 'deleted';
  inputFileCount: number;
  outputFileCount: number;
  downloadFilename: string;
  downloadUrl?: string;
  expiresAt: string;
  createdAt: string;
}
