import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import '@/styles/globals.css';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-arabic',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'OFS — نظام إدارة الطلبات',
    template: '%s · OFS',
  },
  description: 'نظام إدارة الطلبات متعدد المستأجرين | Multi-Tenant Order Fulfillment System',
};

// Root layout: RTL-first defaults — dir="rtl" lang="ar".
// The [locale] layout updates these via HtmlAttributes when locale changes.
// No component may override dir to "ltr" without Architecture Agent approval.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexSansArabic.variable} suppressHydrationWarning>
      <body className={ibmPlexSansArabic.className}>{children}</body>
    </html>
  );
}
