import type { VisitStatus, VisitType } from '@/lib/api/enums';

export interface VisitMedicationResponse {
  id: number;
  medicineName: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
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

export interface VisitResponse {
  id: string;
  patientId: number;
  patientFullName: string | null;
  patientNationalId: string | null;
  doctorId: number;
  doctorFullName: string | null;
  visitDate: string;
  visitType: VisitType;
  status: VisitStatus;
  notes: string | null;
  diagnosis: string | null;
  requiredTests: string | null;
  createdAt: string;
  medications: VisitMedicationResponse[] | null;
  attachments: AttachmentResponse[] | null;
}

export interface CreateVisitMedication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface CreateVisitRequest {
  patientId: number;
  doctorId: number;
  visitDate: string;
  visitType: VisitType;
  notes?: string;
  diagnosis?: string;
  requiredTests?: string;
  medications?: CreateVisitMedication[];
}

export interface UpdateVisitRequest {
  diagnosis?: string | null;
  notes?: string | null;
  requiredTests?: string | null;
}

export interface UpdateVisitStatusRequest {
  status: VisitStatus;
}

export interface AddMedicationsRequest {
  medications: CreateVisitMedication[];
}
