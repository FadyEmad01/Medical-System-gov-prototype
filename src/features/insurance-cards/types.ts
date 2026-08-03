import type {
  CardStatus,
  IssueReason,
  ReplacementReason,
} from '@/lib/api/enums';

// Single source of truth for the card loss/replacement reasons offered in the
// UI. Keep in sync with the ReplacementReason enum.
export const CARD_LOSS_REASONS = [
  'Lost',
  'Damaged',
  'Stolen',
  'Other',
] as const satisfies readonly ReplacementReason[];

export interface CardResponse {
  cardNumber: string | null;
  id: string;
  patientId: number;
  dependentPersonId: string | null;
  holderFullName: string | null;
  status: CardStatus;
  isCurrentlyValid: boolean;
  issueReason: IssueReason;
  version: number;
  cardTemplate: string | null;
  tokenVersion: number;
  replacementReason: ReplacementReason;
  reasonNote: string | null;
  predecessorCardId: string | null;
  successorCardId: string | null;
  isLatestCard: boolean;
  issuedAt: string;
  expiresAt: string;
  applicationId: string;
  createdAt: string;
  correlationId: string;
}

export interface CardStatusChange {
  id: string;
  previousStatus: CardStatus;
  newStatus: CardStatus;
  reason: string | null;
  changedBy: number;
  changedAt: string;
}

export interface CardDetailResponse extends CardResponse {
  statusHistory: CardStatusChange[] | null;
}

export interface ChangeCardStatusRequest {
  reason?: string | null;
}

export interface ReplaceCardRequest {
  replacementReason: ReplacementReason;
  reasonNote?: string;
}

export interface VerifyCardRequest {
  verificationToken: string;
}

export interface CardVerificationResult {
  cardNumber: string | null;
  holderFullName: string | null;
  isCurrentlyValid: boolean;
  expiresAt: string;
  status: CardStatus;
}
