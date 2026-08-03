import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppShell } from '@/features/app-shell/components/app-shell';
import { RequireRole } from '@/features/app-shell/components/require-role';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations('app-shell');

  return (
    <RequireRole allowedRole="Patient">
      <AppShell allowedRole="Patient">{children}</AppShell>
    </RequireRole>
  );
}
