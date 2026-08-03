import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/features/app-shell/components/states';
import { PageHeader } from '@/features/doctor/components/page-header';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DoctorVisitsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('doctor');

  return (
    <div className="flex flex-col gap-6 px-4 lg:gap-2 lg:px-6 pt-5">
      <PageHeader
        title={t('pageTitles.visits')}
        description={t('pageSubtitles.visits')}
      />
      <EmptyState
        title={t('pageTitles.visits')}
        description={t('visitsPage.emptyDescription')}
        action={
          <Button asChild>
            <Link href="/doctor">{t('visitsPage.backToWorkspace')}</Link>
          </Button>
        }
      />
    </div>
  );
}
