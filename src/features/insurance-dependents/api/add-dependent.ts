import { http } from '@/lib/http';
import type { AddDependentRequest, DependentResponse } from '../types';

export async function addDependent(
  data: AddDependentRequest,
  token: string,
): Promise<DependentResponse> {
  return http<DependentResponse>('/api/insurance/dependents', {
    method: 'POST',
    body: data,
    token,
  });
}
