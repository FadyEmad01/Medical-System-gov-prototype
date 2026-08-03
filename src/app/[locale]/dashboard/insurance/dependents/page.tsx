import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/features/dashboard/components/page-header';
import { InsuranceDependentsView } from '@/features/insurance-dependents/components/insurance-dependents-view';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function InsuranceDependentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  return (
    <div className="flex flex-col gap-6 px-4 lg:gap-2 lg:px-6 pt-5">
      <PageHeader
        title={t('pageTitles.insuranceDependents')}
        description={t('pageSubtitles.insuranceDependents')}
      />
      <InsuranceDependentsView />
    </div>
  );
}
