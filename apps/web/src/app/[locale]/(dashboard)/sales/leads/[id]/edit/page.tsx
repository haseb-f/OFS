import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockLeads } from '@/lib/mock-data';
import LeadForm from '@/components/leads/LeadForm';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lead = mockLeads.find(l => l.id === id);
  return { title: lead ? `تعديل · ${lead.customerName}` : 'تعديل العميل' };
}

export default async function EditLeadPage({ params }: Props) {
  const { locale, id } = await params;
  const lead = mockLeads.find(l => l.id === id);
  if (!lead) notFound();

  const backHref = `/${locale}/sales/leads/${id}`;

  return (
    <>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href={backHref} className="btn-ghost"
            style={{ padding: '6px 8px', gap: 'var(--space-1)', marginBlockStart: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            رجوع
          </Link>
          <div>
            <h2 className="page-title">تعديل: {lead.customerName}</h2>
            <p className="page-subtitle">
              {lead.externalOrderId && <>طلب # {lead.externalOrderId} · </>}
              {lead.orderDate}
            </p>
          </div>
        </div>
      </div>

      <LeadForm mode="edit" initialData={lead} backHref={backHref} />
    </>
  );
}
