import { getRequestConfig } from 'next-intl/server';
import { routing } from './index';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      // Load messages for the current locale
      // Dynamically import only the needed translation files
      common: (await import(`./locales/${locale}/common.json`)).default,
      dashboard: (await import(`./locales/${locale}/dashboard.json`)).default,
      filing: (await import(`./locales/${locale}/filing.json`)).default,
      reconciliation: (await import(`./locales/${locale}/reconciliation.json`)).default,
      invoices: (await import(`./locales/${locale}/invoices.json`)).default,
      analytics: (await import(`./locales/${locale}/analytics.json`)).default,
      ai_assistant: (await import(`./locales/${locale}/ai-assistant.json`)).default,
      errors: (await import(`./locales/${locale}/errors.json`)).default,
      validation: (await import(`./locales/${locale}/validation.json`)).default
    },
    // Configure formatters for consistent number/date formatting across locales
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'INR'
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        }
      }
    },
    // Time zone for Indian Standard Time
    timeZone: 'Asia/Kolkata'
  };
});