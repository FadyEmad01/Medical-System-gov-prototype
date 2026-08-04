'use client';

import { useLocale } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleValueChange(next: string) {
    if (next === locale) return;
    // next-intl v4: navigation usePathname returns the path WITHOUT the
    // locale prefix, so replace with { locale } re-renders the same route
    router.replace(pathname, { locale: next as 'en' | 'ar' });
    router.refresh();
  }

  return (
    <Select value={locale} onValueChange={handleValueChange}>
      <SelectTrigger size="sm" aria-label="Language">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
      </SelectContent>
    </Select>
  );
}
