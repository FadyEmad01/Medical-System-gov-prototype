import type { Metadata } from 'next';
import { QueryProvider } from '@/components/query-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Medical System',
  description: 'Medical clinic management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
