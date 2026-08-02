'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  type ActionResult,
  getSessionAction,
  loginAction,
  logoutAction,
  registerAction,
} from './actions';
import type { LoginRequest, RegisterRequest, User } from './types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<ActionResult<User>>;
  register: (data: RegisterRequest) => Promise<ActionResult<User>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSessionAction()
      .then((sessionUser) => {
        setUser(sessionUser);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (data: LoginRequest): Promise<ActionResult<User>> => {
      setError(null);
      const result = await loginAction(data);

      if (result.success) {
        setUser(result.data);
      } else {
        setError(result.error);
      }

      return result;
    },
    [],
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<ActionResult<User>> => {
      setError(null);
      const result = await registerAction(data);

      if (result.success) {
        setUser(result.data);
      } else {
        setError(result.error);
      }

      return result;
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
