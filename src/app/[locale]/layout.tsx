import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { AppProviders } from '@/components/providers';
import { locales, type Locale } from '@/i18n';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: {
      template: '%s | GST Compliance Dashboard',
      default: 'GST Compliance Dashboard'
    },
    description: 'Simplified GST compliance management for Indian SMEs - Supporting 8 regional languages',
    keywords: 'GST, compliance, dashboard, India, SME, tax, filing, Hindi, Tamil, Bengali, Gujarati, Marathi, Telugu, Kannada',
    authors: [{ name: 'GST Compliance Team' }],
    openGraph: {
      title: 'GST Compliance Dashboard',
      description: 'Simplified GST compliance management for Indian SMEs',
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}`;
        return acc;
      }, {} as Record<string, string>)
    }
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    // Handle invalid locale - could redirect to default locale
    return null;
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ur' ? 'rtl' : 'ltr'} // Future RTL support for Urdu
      className={`${inter.variable} ${notoSansDevanagari.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="alternate" hrefLang="x-default" href="/en" />
        {locales.map((loc) => (
          <link key={loc} rel="alternate" hrefLang={loc} href={`/${loc}`} />
        ))}
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            {children}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}