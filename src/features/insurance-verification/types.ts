import type {
  VerificationContext,
  VerificationSource,
  VerificationStatus,
} from '@/lib/api/enums';

export interface VerifyInsuranceRequest {
  patientId: number;
  status: VerificationStatus;
  context: VerificationContext;
  reason: string;
  remarks?: string;
}

export interface InsuranceVerificationResponse {
  id: string;
  patientId: number;
  patientFullName: string | null;
  patientNationalId: string | null;
  status: VerificationStatus;
  context: VerificationContext;
  source: VerificationSource;
  reason: string | null;
  remarks: string | null;
  verifiedAt: string;
  expiresAt: string | null;
  verifiedBy: number;
  correlationId: string;
  isCurrentlyValid: boolean;
}
