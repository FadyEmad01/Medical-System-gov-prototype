'use client';

import {
  type UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  useBffError,
  useBffQueryError,
} from '@/features/app-shell/hooks/use-bff-error';
import { BffError, bffFetch } from '@/lib/bff';
import type {
  CardDetailResponse,
  CardResponse,
  ChangeCardStatusRequest,
  ReplaceCardRequest,
} from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/insurance-cards/api/* exactly.
export const INSURANCE_CARDS_PATH = '/api/insurance/cards';

export const cardKeys = {
  all: ['insurance-cards'] as const,
  patient: (patientId: number) => [...cardKeys.all, 'patient', patientId],
  current: (patientId: number) => [...cardKeys.all, 'current', patientId],
  detail: (cardId: string) => [...cardKeys.all, 'detail', cardId],
};

function invalidateCardQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  patientId: number,
) {
  void queryClient.invalidateQueries({ queryKey: cardKeys.patient(patientId) });
  void queryClient.invalidateQueries({
    queryKey: cardKeys.current(patientId),
  });
}

export function usePatientCards(patientId: number | undefined) {
  const query = useQuery({
    queryKey: cardKeys.patient(patientId ?? 0),
    queryFn: () =>
      bffFetch<CardResponse[]>(`${INSURANCE_CARDS_PATH}/${patientId}`),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

// A 404 means the patient has no current card — a state (rendered as an empty
// section), not an error. TanStack Query v5 treats an undefined queryFn return
// as an error, so 404 maps to null (valid data) — the UI renders an empty
// section.
export function useCurrentCard(patientId: number | undefined) {
  const query = useQuery({
    queryKey: cardKeys.current(patientId ?? 0),
    queryFn: async () => {
      try {
        return await bffFetch<CardResponse>(
          `${INSURANCE_CARDS_PATH}/current/${patientId}`,
        );
      } catch (error) {
        if (error instanceof BffError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

export function useCardDetail(cardId: string | null) {
  const query = useQuery({
    queryKey: cardKeys.detail(cardId ?? ''),
    queryFn: () =>
      bffFetch<CardDetailResponse>(`${INSURANCE_CARDS_PATH}/detail/${cardId}`),
    enabled: cardId !== null,
  });

  useBffQueryError(query);

  return query;
}

type CardActionInput = { cardId: string } & Partial<
  ChangeCardStatusRequest & ReplaceCardRequest
>;

// Shared shape for the six card-lifecycle mutations. Each maps to one api-layer
// verb; every success invalidates the patient's card list + current card.
function useCardMutation(
  patientId: number,
  buildPath: (cardId: string) => string,
  method: string,
): UseMutationResult<CardResponse, unknown, CardActionInput> {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, ...rest }) => {
      const body = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== undefined),
      );
      return bffFetch<CardResponse>(buildPath(cardId), {
        method,
        ...(Object.keys(body).length > 0 ? { body } : {}),
      });
    },
    onError: handleError,
    onSuccess: () => invalidateCardQueries(queryClient, patientId),
  });
}

export function useSuspendCard(patientId: number) {
  return useCardMutation(
    patientId,
    (cardId) => `${INSURANCE_CARDS_PATH}/${cardId}/suspend`,
    'PATCH',
  );
}

export function useReactivateCard(patientId: number) {
  return useCardMutation(
    patientId,
    (cardId) => `${INSURANCE_CARDS_PATH}/${cardId}/reactivate`,
    'PATCH',
  );
}

export function useRevokeCard(patientId: number) {
  return useCardMutation(
    patientId,
    (cardId) => `${INSURANCE_CARDS_PATH}/${cardId}/revoke`,
    'PATCH',
  );
}

export function useRenewCard(patientId: number) {
  return useCardMutation(
    patientId,
    (cardId) => `${INSURANCE_CARDS_PATH}/${cardId}/renew`,
    'POST',
  );
}

export function useReplaceCard(patientId: number) {
  return useCardMutation(
    patientId,
    (cardId) => `${INSURANCE_CARDS_PATH}/${cardId}/replace`,
    'POST',
  );
}

export function useRotateCardToken(patientId: number) {
  return useCardMutation(
    patientId,
    (cardId) => `${INSURANCE_CARDS_PATH}/${cardId}/rotate-token`,
    'PATCH',
  );
}

export type CardAction =
  | 'suspend'
  | 'reactivate'
  | 'revoke'
  | 'renew'
  | 'replace'
  | 'rotateToken';

export type { CardActionInput };

// Which lifecycle actions make sense for a given card status. Superseded and
// revoked cards have no further actions — a new card must be issued instead.
export function getCardActions(status: CardResponse['status']): CardAction[] {
  switch (status) {
    case 'Active':
      return ['suspend', 'revoke', 'renew', 'replace', 'rotateToken'];
    case 'Suspended':
      return ['reactivate', 'revoke', 'renew', 'replace'];
    case 'Revoked':
    case 'Superseded':
      return [];
  }
}
