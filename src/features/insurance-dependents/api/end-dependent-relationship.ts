import { http } from '@/lib/http';
import type { DependentResponse } from '../types';

export async function endDependentRelationship(
  relationshipId: string,
  token: string,
): Promise<DependentResponse> {
  return http<DependentResponse>(
    `/api/insurance/dependents/${relationshipId}/end`,
    {
      method: 'PATCH',
      token,
    },
  );
}
