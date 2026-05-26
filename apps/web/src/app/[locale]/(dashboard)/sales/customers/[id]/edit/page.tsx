import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockCustomers } from '@/lib/mock-data';
import CustomerForm from '@/components/customers/CustomerForm';

interface Props { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = mockCustomers.find(x => x.id === id);
  return { title: c ? `تعديل · ${c.nameAr}` : 'تعديل العميل' };
}

export default async function EditCustomerPage({ params }: Props) {
  const { locale, id } = await params;
  const c = mockCustomers.find(x => x.id === id);
  if (!c) notFound();

  const backHref = `/${locale}/sales/customers/${id}`;

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
            <h2 className="page-title">تعديل: {c.nameAr}</h2>
            <p className="page-subtitle">{c.code}{c.city ? ` · ${c.city}` : ''}</p>
          </div>
        </div>
      </div>
      <CustomerForm mode="edit" initialData={c} backHref={backHref} />
    </>
  );
}
