'use client';

import { useLocale } from 'next-intl';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { redirect } from '@/i18n/navigation';
import type { UserRole } from '@/lib/api/enums';

const ROLE_HOME: Record<UserRole, string> = {
  Patient: '/dashboard',
  Doctor: '/doctor',
  Admin: '/admin',
};

export function AuthGate() {
  const { user, isLoading } = useAuth();
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  let home: string | undefined;
  if (user === null) {
    home = '/auth/login';
  } else {
    home = ROLE_HOME[user.role];
  }

  redirect({ href: home ?? '/auth/login', locale });
}
