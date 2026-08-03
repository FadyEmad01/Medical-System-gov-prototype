import { setRequestLocale } from 'next-intl/server';
import { AuthGate } from '@/features/auth/components/auth-gate';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AuthGate />;
}
