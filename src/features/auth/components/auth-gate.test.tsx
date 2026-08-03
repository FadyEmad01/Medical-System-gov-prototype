// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGate } from './auth-gate';

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
);

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/i18n/navigation', () => ({
  redirect: mockRedirect,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// redirect() throws during render (like the real next/navigation redirect), so
// render() must be wrapped and the console noise suppressed.
function renderRedirectingAuthGate() {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<AuthGate />)).toThrow('NEXT_REDIRECT');
  consoleError.mockRestore();
}

describe('AuthGate', () => {
  it('shows a spinner while the session is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });

    render(<AuthGate />);

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to /auth/login when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });

    renderRedirectingAuthGate();

    expect(mockRedirect).toHaveBeenCalledWith({
      href: '/auth/login',
      locale: 'en',
    });
  });

  it('redirects patient users to /dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'Patient' },
      isLoading: false,
    });

    renderRedirectingAuthGate();

    expect(mockRedirect).toHaveBeenCalledWith({
      href: '/dashboard',
      locale: 'en',
    });
  });

  it('redirects doctor users to /doctor', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'Doctor' },
      isLoading: false,
    });

    renderRedirectingAuthGate();

    expect(mockRedirect).toHaveBeenCalledWith({
      href: '/doctor',
      locale: 'en',
    });
  });

  it('redirects admin users to /admin', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'Admin' },
      isLoading: false,
    });

    renderRedirectingAuthGate();

    expect(mockRedirect).toHaveBeenCalledWith({
      href: '/admin',
      locale: 'en',
    });
  });
});
