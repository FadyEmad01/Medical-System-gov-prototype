import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardResponse, ChangeCardStatusRequest } from '../types';
import { revokeCard } from './revoke-card';

const mockHttp = vi.hoisted(() => vi.fn());

vi.mock('@/lib/http', () => ({
  http: mockHttp,
  HttpError: class HttpError extends Error {
    constructor(
      public status: number,
      message: string,
      public body?: unknown,
    ) {
      super(message);
      this.name = 'HttpError';
    }
  },
}));

describe('revokeCard', () => {
  const token = 'valid-jwt-token';
  const cardId = '11111111-1111-4111-8111-111111111111';
  const mockResponse: CardResponse = {
    cardNumber: 'INS-2026-00000015',
    id: cardId,
    patientId: 1,
    dependentPersonId: null,
    holderFullName: 'Test Patient',
    status: 'Revoked',
    isCurrentlyValid: false,
    issueReason: 'Initial',
    version: 1,
    cardTemplate: null,
    tokenVersion: 1,
    replacementReason: 'Other',
    reasonNote: null,
    predecessorCardId: null,
    successorCardId: null,
    isLatestCard: true,
    issuedAt: '2026-08-02T10:00:00Z',
    expiresAt: '2027-08-02T10:00:00Z',
    applicationId: '11111111-1111-4111-8111-111111111112',
    createdAt: '2026-08-02T10:00:00Z',
    correlationId: '11111111-1111-4111-8111-111111111113',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, body, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const data: ChangeCardStatusRequest = { reason: 'Beneficiary deceased' };

    const result = await revokeCard(cardId, data, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/cards/${cardId}/revoke`,
      {
        method: 'PATCH',
        body: data,
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      revokeCard(cardId, { reason: 'Beneficiary deceased' }, token),
    ).rejects.toThrow('Forbidden');
  });
});
