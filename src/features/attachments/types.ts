export interface UploadAttachmentResponse {
  id: string;
  fileName: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileSize: number;
  uploadedAt: string;
}

export interface AttachmentResponse {
  id: string;
  visitId: string;
  fileName: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileSize: number;
  uploadedBy: number;
  uploadedAt: string;
}
