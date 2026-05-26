import PlatformShell from '@/components/layout/PlatformShell';

interface PlatformAdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PlatformAdminLayout({
  children,
  params,
}: PlatformAdminLayoutProps) {
  const { locale } = await params;
  return <PlatformShell locale={locale}>{children}</PlatformShell>;
}
