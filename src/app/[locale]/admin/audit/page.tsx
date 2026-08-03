import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuditLogsView } from '@/features/admin/components/audit-logs-view';
import { PageHeader } from '@/features/admin/components/page-header';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAuditPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  return (
    <div className="flex flex-col gap-6 px-4 lg:gap-2 lg:px-6 pt-5">
      <PageHeader
        title={t('pageTitles.audit')}
        description={t('audit.subtitle')}
      />
      <AuditLogsView />
    </div>
  );
}
