import { http } from '@/lib/http';
import type { CardResponse, ChangeCardStatusRequest } from '../types';

export async function renewCard(
  cardId: string,
  data: ChangeCardStatusRequest,
  token: string,
): Promise<CardResponse> {
  return http<CardResponse>(`/api/insurance/cards/${cardId}/renew`, {
    method: 'POST',
    body: data,
    token,
  });
}
