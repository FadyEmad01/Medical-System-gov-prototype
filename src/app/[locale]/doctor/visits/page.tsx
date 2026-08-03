import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DoctorVisitsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('app-shell');

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-2xl font-semibold">{t('placeholder')}</h1>
      <p className="text-sm text-muted-foreground">{t('nav.visits')}</p>
    </div>
  );
}
