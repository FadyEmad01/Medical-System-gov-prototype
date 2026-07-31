import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../auth-context';
import { useAuth } from './use-auth';

// Mock actions module — use vi.hoisted for Vitest v4 hoisting compatibility
const mockLoginAction = vi.hoisted(() => vi.fn());
const mockRegisterAction = vi.hoisted(() => vi.fn());
const mockLogoutAction = vi.hoisted(() => vi.fn());
const mockGetSessionAction = vi.hoisted(() => vi.fn());

vi.mock('../actions', () => ({
  loginAction: mockLoginAction,
  registerAction: mockRegisterAction,
  logoutAction: mockLogoutAction,
  getSessionAction: mockGetSessionAction,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// Test component that reads auth context
function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(auth.isLoading)}</div>
      <div data-testid="user">{auth.user?.fullName ?? 'null'}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="error">{auth.error ?? 'null'}</div>
      <button
        data-testid="login-btn"
        onClick={() => auth.login({ nationalId: '123', password: 'pw' })}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
}

describe('AuthProvider + useAuth', () => {
  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console error for expected throw
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an <AuthProvider>',
    );

    consoleError.mockRestore();
  });

  it('loads session on mount and provides user', async () => {
    mockGetSessionAction.mockResolvedValueOnce({
      id: 1,
      nationalId: '05376658493657',
      username: 'testuser',
      fullName: 'Test User',
      role: 'Patient',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Initially loading
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // After session resolves
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('Test User');
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('handles no session (user not logged in)', async () => {
    mockGetSessionAction.mockResolvedValueOnce(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('handles session fetch error gracefully', async () => {
    mockGetSessionAction.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('updates user state on successful login', async () => {
    mockGetSessionAction.mockResolvedValueOnce(null);
    mockLoginAction.mockResolvedValueOnce({
      success: true,
      data: {
        id: 1,
        nationalId: '05376658493657',
        username: 'testuser',
        fullName: 'Test User',
        role: 'Patient',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click login button
    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('user').textContent).toBe('Test User');
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('sets error state on failed login', async () => {
    mockGetSessionAction.mockResolvedValueOnce(null);
    mockLoginAction.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('clears user state on logout', async () => {
    mockGetSessionAction.mockResolvedValueOnce({
      id: 1,
      nationalId: '05376658493657',
      username: 'testuser',
      fullName: 'Test User',
      role: 'Patient',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Test User');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(mockLogoutAction).toHaveBeenCalledOnce();
  });
});
