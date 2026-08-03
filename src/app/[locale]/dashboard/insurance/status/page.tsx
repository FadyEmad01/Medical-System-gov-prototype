import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/features/dashboard/components/page-header';
import { InsuranceStatusView } from '@/features/insurance-status/components/insurance-status-view';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function InsuranceStatusPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('pageTitles.insuranceStatus')}
        description={t('pageSubtitles.insuranceStatus')}
      />
      <InsuranceStatusView />
    </div>
  );
}
