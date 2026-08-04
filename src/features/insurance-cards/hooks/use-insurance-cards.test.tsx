import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BffError } from '@/lib/bff';
import { useCurrentCard } from './use-insurance-cards';

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

describe('useCurrentCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps a 404 from bffFetch to null data instead of an error', async () => {
    mockBffFetch.mockRejectedValueOnce(
      new BffError(404, 'No currently active card found for this patient.'),
    );

    const { result } = renderHook(() => useCurrentCard(1), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeNull();
    });
    expect(result.current.isError).toBe(false);
  });

  it('surfaces non-404 BffError failures as query errors', async () => {
    mockBffFetch.mockRejectedValueOnce(new BffError(500, 'Upstream failure'));

    const { result } = renderHook(() => useCurrentCard(1), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('keeps the query disabled when patientId is undefined', () => {
    const { result } = renderHook(() => useCurrentCard(undefined), { wrapper });

    expect(result.current.isFetching).toBe(false);
    expect(mockBffFetch).not.toHaveBeenCalled();
  });
});
