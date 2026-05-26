import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import HtmlAttributes from '@/components/HtmlAttributes';
import { OfsRouteLoader } from '@/components/ui/loaders/OfsRouteLoader';

const SUPPORTED_LOCALES = ['ar', 'en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// This layout does NOT render <html> or <body> — those are in app/layout.tsx.
// It updates the html element's lang and dir attributes via HtmlAttributes,
// and provides the next-intl message context.
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) notFound();

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      {/* Update html element lang/dir for this locale */}
      <HtmlAttributes lang={locale} dir={dir} />
      <OfsRouteLoader />
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
