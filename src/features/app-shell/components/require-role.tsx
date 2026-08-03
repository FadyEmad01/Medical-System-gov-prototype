'use client';

import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { redirect } from '@/i18n/navigation';
import type { UserRole } from '@/lib/api/enums';

type RequireRoleProps = {
  allowedRole: UserRole;
  children: ReactNode;
};

export function RequireRole({ allowedRole, children }: RequireRoleProps) {
  const { user, isLoading } = useAuth();
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (user === null) {
    redirect({ href: '/auth/login', locale });
  } else if (user.role !== allowedRole) {
    redirect({ href: '/', locale });
  }

  return children;
}
