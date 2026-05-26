import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? 'ar';

  // Dynamic import of message file — Arabic is the source of truth.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    messages,
  };
});
