import type {
  ApplicationStatus,
  EligibilityStatus,
  ReviewOutcome,
  SubmissionChannel,
  VerificationStatus,
} from '@/lib/api/enums';

export interface ApplicationResponse {
  applicationNumber: string | null;
  id: string;
  patientId: number;
  status: ApplicationStatus;
  submissionChannel: SubmissionChannel;
  submittedAt: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  decisionReason: string | null;
  eligibilityStatusSnapshot: EligibilityStatus;
  verificationStatusSnapshot: VerificationStatus;
  documentCount: number;
  dependentCount: number;
  createdAt: string;
  correlationId: string;
}

export interface ApplicationReview {
  id: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  reviewOutcome: ReviewOutcome;
  reviewedBy: number;
  reviewedAt: string;
  citizenVisibleReason: string | null;
  internalNotes: string | null;
}

export interface ApplicationDetailResponse extends ApplicationResponse {
  reviewHistory: ApplicationReview[] | null;
}

export interface ReviewApplicationRequest {
  newStatus: ApplicationStatus;
  citizenVisibleReason?: string;
  internalNotes?: string;
}
