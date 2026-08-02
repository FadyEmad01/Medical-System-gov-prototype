import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PagedResultDto } from '@/lib/api/shared';
import type { AuditLogListItem, AuditLogQuery } from '../types';
import { getAuditLogs } from './get-audit-logs';

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

describe('getAuditLogs', () => {
  const mockResponse: PagedResultDto<AuditLogListItem> = {
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with query and bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const query: AuditLogQuery = {
      userId: 1,
      category: 'Patient',
      success: true,
      page: 1,
      pageSize: 20,
      sortBy: 'TimestampUtc',
      sortDescending: true,
    };

    const result = await getAuditLogs(query, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/audit', {
      method: 'GET',
      query,
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Unauthorized'));

    await expect(getAuditLogs({}, 'invalid-token')).rejects.toThrow(
      'Unauthorized',
    );
  });
});
