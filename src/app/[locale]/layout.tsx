import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Almarai, Geist, Geist_Mono, Inter } from "next/font/google";
import { AuthProvider } from '@/features/auth/auth-context';
import "@/styles/globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const almarai = Almarai({ subsets: ["arabic"], weight: ["300", "400", "700", "800"], variable: "--font-almarai" });

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const rtlLocales = ['ar'];

function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${almarai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}