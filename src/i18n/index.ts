import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// Core 8 Indian regional languages for maximum market coverage
export const locales = ['en', 'hi', 'ta', 'bn', 'gu', 'mr', 'te', 'kn'] as const;
export type Locale = typeof locales[number];

// Language metadata for UI display
export const languageNames: Record<Locale, { native: string; english: string; flag: string }> = {
  en: { native: 'English', english: 'English', flag: '🇬🇧' },
  hi: { native: 'हिंदी', english: 'Hindi', flag: '🇮🇳' },
  ta: { native: 'தமிழ்', english: 'Tamil', flag: '🇮🇳' },
  bn: { native: 'বাংলা', english: 'Bengali', flag: '🇮🇳' },
  gu: { native: 'ગુજરાતી', english: 'Gujarati', flag: '🇮🇳' },
  mr: { native: 'मराठी', english: 'Marathi', flag: '🇮🇳' },
  te: { native: 'తెలుగు', english: 'Telugu', flag: '🇮🇳' },
  kn: { native: 'ಕನ್ನಡ', english: 'Kannada', flag: '🇮🇳' }
};

// Market coverage data for business intelligence
export const languageCoverage: Record<Locale, { speakers: number; states: string[] }> = {
  en: { speakers: 125000000, states: ['All States'] },
  hi: { speakers: 600000000, states: ['UP', 'MP', 'Bihar', 'Rajasthan', 'Haryana', 'Delhi'] },
  ta: { speakers: 80000000, states: ['Tamil Nadu', 'Puducherry'] },
  bn: { speakers: 100000000, states: ['West Bengal', 'Tripura'] },
  gu: { speakers: 60000000, states: ['Gujarat', 'Dadra and Nagar Haveli'] },
  mr: { speakers: 85000000, states: ['Maharashtra', 'Goa'] },
  te: { speakers: 95000000, states: ['Telangana', 'Andhra Pradesh'] },
  kn: { speakers: 45000000, states: ['Karnataka'] }
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/dashboard': '/dashboard',
    '/filing': '/filing',
    '/filing/gstr-1': '/filing/gstr-1',
    '/filing/gstr-3b': '/filing/gstr-3b',
    '/filing/gstr-9': '/filing/gstr-9',
    '/reconciliation': '/reconciliation',
    '/invoices': '/invoices',
    '/e-invoice': '/e-invoice',
    '/e-way-bill': '/e-way-bill',
    '/analytics': '/analytics',
    '/ai-assistant': '/ai-assistant',
    '/settings': '/settings',
    '/notifications': '/notifications'
  }
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

// Utility to get user's preferred locale from browser/storage
export function detectUserLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  // Check localStorage first
  const stored = localStorage.getItem('preferred-locale') as Locale;
  if (stored && locales.includes(stored)) return stored;

  // Check browser language
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (locales.includes(browserLang)) return browserLang;

  // Fallback to English
  return 'en';
}

// Utility to save user's language preference
export function saveUserLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-locale', locale);
  }
}

// Number formatting for Indian numbering system
export function formatIndianNumber(num: number, locale: Locale = 'en'): string {
  // Indian numbering system: 12,34,567 instead of 1,234,567
  const formatter = new Intl.NumberFormat(locale === 'en' ? 'en-IN' : 'hi-IN');
  return formatter.format(num);
}

// Currency formatting for INR
export function formatCurrency(amount: number, locale: Locale = 'en'): string {
  const formatter = new Intl.NumberFormat(locale === 'en' ? 'en-IN' : 'hi-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
}

// Indian financial units (Lakh, Crore)
export function formatIndianUnits(amount: number, locale: Locale = 'en'): string {
  if (amount >= 10000000) { // 1 Crore
    return `${formatCurrency(amount / 10000000, locale)} ${locale === 'hi' ? 'करोड़' : 'Cr'}`;
  } else if (amount >= 100000) { // 1 Lakh
    return `${formatCurrency(amount / 100000, locale)} ${locale === 'hi' ? 'लाख' : 'L'}`;
  }
  return formatCurrency(amount, locale);
}