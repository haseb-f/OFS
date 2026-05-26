import ImportWizard from '@/components/import/ImportWizard';

export default async function NewImportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ImportWizard backHref={`/${locale}/import`} />;
}
