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
  // Backend returns null when the patient has no application yet.
  currentApplicationStatus: ApplicationStatus | null;
  timeline: TimelineStage[] | null;
  eligibilityStatus: EligibilityStatus | null;
  verificationStatus: VerificationStatus | null;
  documentCount: number;
}
