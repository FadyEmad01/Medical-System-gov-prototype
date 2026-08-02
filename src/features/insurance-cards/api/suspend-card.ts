import { http } from '@/lib/http';
import type { CardResponse, ChangeCardStatusRequest } from '../types';

export async function suspendCard(
  cardId: string,
  data: ChangeCardStatusRequest,
  token: string,
): Promise<CardResponse> {
  return http<CardResponse>(`/api/insurance/cards/${cardId}/suspend`, {
    method: 'PATCH',
    body: data,
    token,
  });
}
