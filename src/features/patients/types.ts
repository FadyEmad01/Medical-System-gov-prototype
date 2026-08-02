import type { Gender, VisitType } from '@/lib/api/enums';

export interface PatientSearchResponse {
  id: number;
  nationalId: string | null;
  fullName: string | null;
  dateOfBirth: string;
  gender: Gender;
  mobileNumber: string | null;
}

export interface MedicalSummaryVisit {
  visitId: string;
  visitDate: string;
  doctorName: string | null;
  visitType: VisitType;
}

export interface MedicalSummaryMedication {
  medicationName: string | null;
  dosage: string | null;
}

export interface MedicalSummaryAttachment {
  attachmentId: string;
  fileName: string | null;
  fileType: string | null;
  uploadedAt: string;
}

export interface PatientMedicalSummary {
  patientId: number;
  fullName: string | null;
  nationalId: string | null;
  dateOfBirth: string;
  gender: Gender;
  lastVisit: MedicalSummaryVisit | null;
  latestDiagnosis: string | null;
  latestNotes: string | null;
  latestRequiredTests: string | null;
  latestMedications: MedicalSummaryMedication[] | null;
  latestAttachments: MedicalSummaryAttachment[] | null;
}

export interface PatientVisitHistoryItem {
  visitId: string;
  visitDate: string;
  doctorId: number;
  doctorName: string | null;
  visitType: VisitType;
  diagnosisSummary: string | null;
}
