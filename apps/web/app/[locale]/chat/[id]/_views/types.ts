export interface Message {
  id: string;
  content: string;
  createdAt: string;
}

export type UploadStatus =
  | "idle"
  | "uploading"
  | "success"
  | "error"
  | "sizeError";

export const MAX_CHARS = 2048;
export const FIVE_MB = 5 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
