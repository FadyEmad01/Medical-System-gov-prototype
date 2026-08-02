import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditDashboard } from '../types';
import { getAuditDashboard } from './get-audit-dashboard';

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

describe('getAuditDashboard', () => {
  const mockResponse: AuditDashboard = {
    totalRecords: 120,
    successfulOperations: 100,
    failedOperations: 20,
    criticalEvents: 2,
    topActiveUsers: [{ userId: 1, userName: 'admin', actionCount: 50 }],
    topAccessedPatients: [{ patientId: 42, accessCount: 10 }],
    mostCommonActions: [{ action: 'Patient.Viewed', count: 30 }],
    actionsToday: 5,
    averageExecutionTimeMs: 12.5,
    lastAuditTimestamp: '2026-08-02T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with the dashboard path and bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getAuditDashboard('valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/audit/dashboard', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(getAuditDashboard('non-admin-token')).rejects.toThrow(
      'Forbidden',
    );
  });
});
