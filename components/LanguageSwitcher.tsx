'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <div className="relative">
      <button
        onClick={() => switchLanguage(locale === 'en' ? 'cs' : 'en')}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={locale === 'en' ? 'Switch to Czech' : 'Přepnout na angličtinu'}
      >
        <Globe size={18} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700 uppercase">
          {locale === 'en' ? 'CS' : 'EN'}
        </span>
      </button>
    </div>
  );
}

