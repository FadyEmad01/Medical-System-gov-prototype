import type {
  DependentStatus,
  Gender,
  RelationshipType,
} from '@/lib/api/enums';

// Single source of truth for the dependent form's selectable values. Keep in
// sync with the Gender / RelationshipType enums.
export const DEPENDENT_GENDERS = [
  'Male',
  'Female',
] as const satisfies readonly Gender[];

export const DEPENDENT_RELATIONSHIP_TYPES = [
  'Spouse',
  'Child',
  'Parent',
  'Guardian',
] as const satisfies readonly RelationshipType[];

export interface AddDependentRequest {
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  dateOfBirth: string;
  gender: Gender;
  relationshipType: RelationshipType;
  nationalId?: string | null;
}

export interface DependentResponse {
  dependentPersonId: string;
  fullName: string | null;
  dateOfBirth: string;
  gender: Gender;
  nationalId: string | null;
  status: DependentStatus;
  relationshipId: string;
  relationshipType: RelationshipType;
  isPrimarySponsor: boolean;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  correlationId: string;
}
