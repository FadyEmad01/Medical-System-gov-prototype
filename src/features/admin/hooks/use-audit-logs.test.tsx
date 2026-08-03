import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BffError } from '@/lib/bff';
import { useAuditDashboard } from './use-audit-logs';

// Mocks — must be at top level (before any imports) for Vitest hoisting.
const mockBffFetch = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockRouter = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock('@/lib/bff', async () => {
  const actual = await vi.importActual<typeof import('@/lib/bff')>('@/lib/bff');
  return { BffError: actual.BffError, bffFetch: mockBffFetch };
});

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => mockRouter,
  Link: 'a',
}));

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.has = () => true;
    return t;
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useAuditDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs out and redirects to login when the query returns 401', async () => {
    mockBffFetch.mockRejectedValueOnce(new BffError(401, 'Unauthorized'));

    renderHook(() => useAuditDashboard(), { wrapper });

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
  });
});
