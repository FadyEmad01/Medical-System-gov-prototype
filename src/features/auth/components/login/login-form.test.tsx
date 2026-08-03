// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './login-form';

const mockLogin = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());
const mockRefresh = vi.hoisted(() => vi.fn());
const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      loginSuccess: 'Login successful',
      submit: 'Submit',
      nationalId: 'National ID',
      password: 'Password',
      noAccount: "Don't have an account?",
      register: 'Register',
      'errors.passwordRequired': 'Password is required',
    };
    const t = (key: string) => translations[key] ?? key;
    t.has = (key: string) => key in translations;
    return t;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('sonner', () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function fillCredentials() {
  fireEvent.change(screen.getByLabelText(/national id/i), {
    target: { value: '05376658493657' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret123' },
  });
}

describe('LoginForm', () => {
  it('logs in successfully, shows a success toast, and navigates home', async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      data: {
        id: 1,
        nationalId: '05376658493657',
        username: 'testuser',
        fullName: 'Test User',
        role: 'Patient',
      },
    });

    render(<LoginForm />);
    fillCredentials();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Login successful');
    });
    expect(mockLogin).toHaveBeenCalledWith({
      nationalId: '05376658493657',
      password: 'secret123',
    });
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('shows an error toast when login fails', async () => {
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials',
    });

    render(<LoginForm />);
    fillCredentials();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Invalid credentials');
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to the register page from the back link', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(mockPush).toHaveBeenCalledWith('/auth/register');
  });
});
