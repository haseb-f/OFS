import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockOrders } from '@/lib/mock-data';
import OrderForm from '@/components/orders/OrderForm';

interface Props { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const o = mockOrders.find(x => x.id === id);
  return { title: o ? `تعديل · ${o.orderNumber}` : 'تعديل الطلب' };
}

export default async function EditOrderPage({ params }: Props) {
  const { locale, id } = await params;
  const o = mockOrders.find(x => x.id === id);
  if (!o) notFound();

  const backHref = `/${locale}/sales/orders/${id}`;

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
            <h2 className="page-title">تعديل: {o.orderNumber}</h2>
            <p className="page-subtitle">{o.customerName}{o.city ? ` · ${o.city}` : ''}</p>
          </div>
        </div>
      </div>
      <OrderForm mode="edit" initialData={o} backHref={backHref} />
    </>
  );
}
