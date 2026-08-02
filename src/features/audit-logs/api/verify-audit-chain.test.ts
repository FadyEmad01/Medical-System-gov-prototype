import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditChainVerificationResult } from '../types';
import { verifyAuditChain } from './verify-audit-chain';

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

describe('verifyAuditChain', () => {
  const mockResponse: AuditChainVerificationResult = {
    isValid: true,
    brokenRecordId: null,
    brokenTimestamp: null,
    totalRecordsChecked: 120,
    verificationDurationMs: 45,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with the verify path and bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await verifyAuditChain('valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/audit/verify', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(verifyAuditChain('non-admin-token')).rejects.toThrow(
      'Forbidden',
    );
  });
});
