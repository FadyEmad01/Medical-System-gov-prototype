import { http } from '@/lib/http';
import type { CreateVisitRequest, VisitResponse } from '../types';

export async function createVisit(
  data: CreateVisitRequest,
  token: string,
): Promise<VisitResponse> {
  return http<VisitResponse>('/api/visits', {
    method: 'POST',
    body: data,
    token,
  });
}
