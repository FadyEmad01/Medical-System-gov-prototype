import type {
  DependentStatus,
  Gender,
  RelationshipType,
} from '@/lib/api/enums';

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
