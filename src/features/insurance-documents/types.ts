import type { DocumentReviewStatus, DocumentType } from '@/lib/api/enums';

// Single source of truth for the upload form's selectable document types.
// Keep in sync with the DocumentType enum.
export const DOCUMENT_TYPES = [
  'NationalId',
  'BirthCertificate',
  'MarriageCertificate',
  'EmploymentLetter',
  'DisabilityCertificate',
  'DeathCertificate',
  'GuardianAuthorization',
  'FamilyRegistration',
] as const satisfies readonly DocumentType[];

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
