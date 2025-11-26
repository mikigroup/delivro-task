import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'cs'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Don't use locale prefix in URL for default locale
  localePrefix: 'as-needed',
  
  // Vypnout automatickou detekci jazyka z prohlížeče
  localeDetection: false
});

