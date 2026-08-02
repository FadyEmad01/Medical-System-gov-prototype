import type { EligibilityStatus } from '@/lib/api/enums';

export interface CheckEligibilityRequest {
  patientId: number;
  status: EligibilityStatus;
  reason: string;
  remarks?: string;
}

export interface InsuranceEligibilityResponse {
  id: string;
  patientId: number;
  patientFullName: string | null;
  patientNationalId: string | null;
  status: EligibilityStatus;
  reason: string | null;
  checkedAt: string;
  checkedBy: number;
  remarks: string | null;
  createdAt: string;
  updatedAt: string | null;
}
