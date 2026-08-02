import type {
  ApplicationStatus,
  EligibilityStatus,
  VerificationStatus,
} from '@/lib/api/enums';

export interface TimelineStage {
  stageName: string | null;
  isComplete: boolean;
  timestamp: string | null;
}

export interface InsuranceStatusResponse {
  patientId: number;
  currentApplicationNumber: string | null;
  currentApplicationId: string | null;
  currentApplicationStatus: ApplicationStatus;
  timeline: TimelineStage[] | null;
  eligibilityStatus: EligibilityStatus;
  verificationStatus: VerificationStatus;
  documentCount: number;
}
