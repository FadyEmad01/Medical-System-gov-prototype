import type { DocumentReviewStatus, DocumentType } from '@/lib/api/enums';

export interface CitizenDocumentResponse {
  id: string;
  patientId: number;
  dependentPersonId: string | null;
  documentType: DocumentType;
  documentNumber: string | null;
  fileName: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileSize: number;
  uploadedAt: string;
  expiresAt: string | null;
  reviewStatus: DocumentReviewStatus;
  reviewedBy: number | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  isCurrent: boolean;
  correlationId: string;
}
