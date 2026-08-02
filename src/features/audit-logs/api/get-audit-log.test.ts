import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditLogDetail } from '../types';
import { getAuditLog } from './get-audit-log';

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

describe('getAuditLog', () => {
  const mockResponse: AuditLogDetail = {
    auditId: '3b7c9e1a-0000-0000-0000-000000000001',
    timestampUtc: '2026-08-01T10:00:00Z',
    userId: 1,
    userName: 'admin',
    role: 'Admin',
    action: 'Patient.Viewed',
    category: 'Patient',
    patientId: 42,
    visitId: '3b7c9e1a-0000-0000-0000-000000000002',
    success: true,
    statusCode: 200,
    executionTimeMs: 12,
    riskLevel: 'Low',
    failureReason: 'Unknown',
    userNationalId: '05376658493657',
    resourceType: 'Patient',
    resourceId: '42',
    description: 'Viewed patient record',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    correlationId: '3b7c9e1a-0000-0000-0000-000000000003',
    requestPath: '/api/patients/42',
    httpMethod: 'GET',
    browser: 'Chrome',
    browserVersion: '120',
    operatingSystem: 'Windows',
    operatingSystemVersion: '11',
    deviceType: 'Desktop',
    platform: 'Windows',
    sessionId: '3b7c9e1a-0000-0000-0000-000000000004',
    oldValuesJson: null,
    newValuesJson: null,
    additionalDataJson: null,
    previousAuditId: null,
    nextAuditId: '3b7c9e1a-0000-0000-0000-000000000005',
    previousHash: null,
    currentHash: 'abc123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with the audit id path and bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getAuditLog(
      '3b7c9e1a-0000-0000-0000-000000000001',
      'valid-jwt-token',
    );

    expect(mockHttp).toHaveBeenCalledWith(
      '/api/audit/3b7c9e1a-0000-0000-0000-000000000001',
      {
        method: 'GET',
        token: 'valid-jwt-token',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      getAuditLog('3b7c9e1a-0000-0000-0000-000000000001', 'non-admin-token'),
    ).rejects.toThrow('Forbidden');
  });
});
