import type { Metadata } from 'next';
import Link from 'next/link';
import CustomerForm from '@/components/customers/CustomerForm';

export const metadata: Metadata = { title: 'عميل جديد' };

interface Props { params: Promise<{ locale: string }> }

export default async function NewCustomerPage({ params }: Props) {
  const { locale } = await params;
  const backHref = `/${locale}/sales/customers`;

  return (
    <>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href={backHref} className="btn-ghost" style={{ padding: '6px 8px', gap: 4, marginBlockStart: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            رجوع
          </Link>
          <div>
            <h2 className="page-title">عميل جديد</h2>
            <p className="page-subtitle">أدخل بيانات العميل الأساسية والمعلومات المالية</p>
          </div>
        </div>
      </div>
      <CustomerForm mode="create" backHref={backHref} />
    </>
  );
}
