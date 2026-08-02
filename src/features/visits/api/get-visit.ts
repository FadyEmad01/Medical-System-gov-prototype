import { http } from '@/lib/http';
import type { VisitResponse } from '../types';

export async function getVisit(
  id: string,
  token: string,
): Promise<VisitResponse> {
  return http<VisitResponse>(`/api/visits/${id}`, {
    method: 'GET',
    token,
  });
}
