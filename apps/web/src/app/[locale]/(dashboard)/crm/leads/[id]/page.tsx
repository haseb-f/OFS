'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockCrmLeads,
  mockCrmActivities,
  mockCrmTasks,
  STAGE_LABELS,
  SOURCE_LABELS,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '@/lib/crm-mock-data';
import { fNum } from '@/lib/format';

type TabId = 'overview' | 'activities' | 'tasks' | 'notes' | 'attachments' | 'timeline';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',    label: 'نظرة عامة' },
  { id: 'activities',  label: 'الأنشطة' },
  { id: 'tasks',       label: 'المهام' },
  { id: 'notes',       label: 'الملاحظات' },
  { id: 'attachments', label: 'المرفقات' },
  { id: 'timeline',    label: 'السجل الزمني' },
];

const STAGE_COLORS: Record<string, { color: string; bg: string }> = {
  new:           { color: '#475569', bg: '#f1f5f9' },
  contacted:     { color: '#1d4ed8', bg: '#dbeafe' },
  interested:    { color: '#6d28d9', bg: '#ede9fe' },
  qualified:     { color: '#b45309', bg: '#fef3c7' },
  proposal_sent: { color: '#c2410c', bg: '#fed7aa' },
  won:           { color: '#15803d', bg: '#dcfce7' },
  lost:          { color: '#b91c1c', bg: '#fee2e2' },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  low:      { bg: '#f1f5f9', color: '#64748b' },
  medium:   { bg: '#fffbeb', color: '#b45309' },
  high:     { bg: '#fff7ed', color: '#c2410c' },
  critical: { bg: '#fef2f2', color: '#b91c1c' },
};

function StageBadge({ stage }: { stage: string }) {
  const c = STAGE_COLORS[stage] ?? STAGE_COLORS.new;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-1)',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'var(--font-weight-semibold)',
      background: c.bg, color: c.color,
    }}>
      {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage}
    </span>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, React.ReactNode> = {
    call: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.82 19.79 19.79 0 0 1 .93 1.18 2 2 0 0 1 2.92 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6z"/></svg>,
    meeting: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    whatsapp: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    email: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    visit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    followup: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  };
  return <>{map[type] ?? map.call}</>;
}

export default function LeadDetailsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const leadId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const lead = mockCrmLeads.find(l => l.id === leadId) ?? mockCrmLeads[0];
  const activities = mockCrmActivities.filter(a => a.customerId === lead.id);
  const tasks = mockCrmTasks.filter(t => t.customerId === lead.id);

  const mockNotes = [
    { id: 'N1', author: 'سارة العتيبي', date: '22 May 2026', text: 'العميل مهتم جداً بالعرض، طلب جدولة اجتماع مع الإدارة الأسبوع القادم.' },
    { id: 'N2', author: 'محمد القحطاني', date: '18 May 2026', text: 'تم التواصل مع العميل وأبدى اهتمامه بالباقة المتقدمة. يحتاج إلى تفاصيل أكثر عن خدمة ما بعد البيع.' },
  ];

  const mockTimeline = [
    { id: 'TL1', date: lead.createdAt, action: 'تم إنشاء العميل المحتمل', user: 'النظام', icon: 'create' },
    { id: 'TL2', date: '22 May 2026', action: 'تحديث المرحلة إلى "مهتم"', user: 'سارة العتيبي', icon: 'stage' },
    { id: 'TL3', date: lead.lastActivity, action: 'آخر نشاط مسجّل', user: lead.assignedUser, icon: 'activity' },
  ];

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href={`/${locale}/crm/leads`} className="btn-ghost" style={{ padding: '8px', borderRadius: 'var(--radius-md)' }} title="رجوع">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
          <div>
            <h2 className="page-title">{lead.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBlockStart: 4 }}>
              <StageBadge stage={lead.stage} />
              {lead.company && (
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{lead.company}</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            نشاط جديد
          </button>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            تعديل
          </button>
          <button className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            تحويل إلى عميل
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* Left sidebar — summary card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Quick stats */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ textAlign: 'center', paddingBlockEnd: 'var(--space-4)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
              <div style={{
                inlineSize: 56, blockSize: 56, borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)',
                margin: '0 auto var(--space-3)',
              }}>
                {lead.name.charAt(0)}
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                {lead.name}
              </div>
              {lead.company && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockStart: 4 }}>
                  {lead.company}
                </div>
              )}
              <div style={{ marginBlockStart: 'var(--space-3)' }}>
                <StageBadge stage={lead.stage} />
              </div>
            </div>

            <div style={{ paddingBlockStart: 'var(--space-4)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', textAlign: 'center', marginBlockEnd: 4 }}>
                {fNum(lead.expectedValue, 0)} ر.س
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                القيمة المتوقعة
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-4)' }}>
              معلومات التواصل
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-text-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.82 19.79 19.79 0 0 1 .93 1.18 2 2 0 0 1 2.92 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>الهاتف</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', direction: 'ltr' }}>{lead.phone}</div>
                </div>
              </div>
              {lead.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-text-muted)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>البريد الإلكتروني</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', direction: 'ltr' }}>{lead.email}</div>
                  </div>
                </div>
              )}
              {lead.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-text-muted)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>المدينة</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{lead.city}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic info */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-4)' }}>
              معلومات أساسية
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'مصدر العميل', value: SOURCE_LABELS[lead.source] },
                { label: 'المسؤول', value: lead.assignedUser },
                { label: 'آخر نشاط', value: lead.lastActivity },
                { label: 'تاريخ الإنشاء', value: lead.createdAt },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>{row.label}</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right content — tabs */}
        <div>
          {/* Tab bar */}
          <div style={{
            display: 'flex',
            gap: 0,
            borderBlockEnd: '2px solid var(--color-border)',
            marginBlockEnd: 'var(--space-5)',
            overflowX: 'auto',
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  paddingInline: 'var(--space-4)',
                  paddingBlock: 'var(--space-3)',
                  background: 'none', border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: activeTab === tab.id ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  borderBlockEnd: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                  marginBlockEnd: -2,
                  whiteSpace: 'nowrap',
                  transition: 'color var(--transition-fast)',
                  fontFamily: 'inherit',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-4)' }}>
                  ملخص الصفقة
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                  {[
                    { label: 'المرحلة الحالية', value: STAGE_LABELS[lead.stage], highlight: true },
                    { label: 'القيمة المتوقعة', value: `${fNum(lead.expectedValue, 0)} ر.س` },
                    { label: 'مصدر العميل', value: SOURCE_LABELS[lead.source] },
                    { label: 'عدد الأنشطة', value: String(activities.length) },
                    { label: 'عدد المهام', value: String(tasks.length) },
                    { label: 'المسؤول', value: lead.assignedUser },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'var(--color-surface-raised)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      border: '1px solid var(--color-border-subtle)',
                    }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginBlockEnd: 4 }}>{item.label}</div>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: item.highlight ? 'var(--color-primary)' : 'var(--color-text)',
                      }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {lead.notes && (
                <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-3)' }}>
                    ملاحظات
                  </h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{lead.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                  الأنشطة ({activities.length})
                </h4>
                <button className="btn-cta" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  نشاط جديد
                </button>
              </div>
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', paddingBlock: 'var(--space-10)', color: 'var(--color-text-subtle)' }}>
                  لا توجد أنشطة مسجّلة لهذا العميل
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {activities.map(act => {
                    const statusColors = {
                      completed: { bg: '#f0fdf4', color: '#16a34a', iconBg: '#dcfce7' },
                      scheduled: { bg: '#eff6ff', color: '#1d4ed8', iconBg: '#dbeafe' },
                      cancelled: { bg: '#fef2f2', color: '#b91c1c', iconBg: '#fee2e2' },
                    };
                    const sc = statusColors[act.status];
                    return (
                      <div key={act.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                        padding: 'var(--space-4)',
                        background: 'var(--color-surface-raised)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border-subtle)',
                      }}>
                        <div style={{
                          inlineSize: 36, blockSize: 36, borderRadius: 'var(--radius-md)',
                          background: sc.iconBg, color: sc.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <ActivityIcon type={act.type} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 4 }}>
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                              {act.subject}
                            </span>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              paddingInline: 'var(--space-2)', paddingBlock: '2px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 'var(--font-weight-semibold)',
                              background: sc.bg, color: sc.color,
                            }}>
                              {ACTIVITY_STATUS_LABELS[act.status]}
                            </span>
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {ACTIVITY_TYPE_LABELS[act.type]}
                            {act.duration && ` · ${act.duration} دقيقة`}
                            {' · '}{act.date}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginBlockStart: 4 }}>
                            المسؤول: {act.assignedUser}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                  المهام ({tasks.length})
                </h4>
                <button className="btn-cta" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  مهمة جديدة
                </button>
              </div>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', paddingBlock: 'var(--space-10)', color: 'var(--color-text-subtle)' }}>
                  لا توجد مهام مرتبطة بهذا العميل
                </div>
              ) : (
                <div className="ofs-table-wrap">
                  <table className="ofs-table">
                    <thead>
                      <tr>
                        <th>المهمة</th>
                        <th>الأولوية</th>
                        <th>تاريخ الاستحقاق</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(task => {
                        const pc = PRIORITY_COLORS[task.priority];
                        return (
                          <tr key={task.id}>
                            <td>
                              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>{task.name}</div>
                              {task.description && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 2 }}>{task.description}</div>
                              )}
                            </td>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', paddingInline: 'var(--space-2)', paddingBlock: '2px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: pc.bg, color: pc.color }}>
                                {TASK_PRIORITY_LABELS[task.priority]}
                              </span>
                            </td>
                            <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{task.dueDate}</td>
                            <td>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                {TASK_STATUS_LABELS[task.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>الملاحظات</h4>
                  <button className="btn-cta" style={{ fontSize: 'var(--font-size-xs)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    إضافة ملاحظة
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {mockNotes.map(note => (
                    <div key={note.id} style={{
                      padding: 'var(--space-4)',
                      background: 'var(--color-surface-raised)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-subtle)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{note.author}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>{note.date}</span>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>المرفقات</h4>
                <button className="btn-outline" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  رفع ملف
                </button>
              </div>
              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-12)',
                textAlign: 'center',
                color: 'var(--color-text-subtle)',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-3)', display: 'block' }} aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>اسحب الملفات هنا أو انقر لرفع ملف</p>
                <p style={{ fontSize: 'var(--font-size-xs)', marginBlockStart: 4 }}>PDF، Word، Excel، صور — بحد أقصى 10 ميجابايت</p>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-4)' }}>
                السجل الزمني
              </h4>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  insetInlineStart: 16,
                  insetBlockStart: 0,
                  insetBlockEnd: 0,
                  inlineSize: 2,
                  background: 'var(--color-border)',
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  {mockTimeline.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', position: 'relative' }}>
                      <div style={{
                        inlineSize: 34, blockSize: 34, borderRadius: 'var(--radius-full)',
                        background: 'var(--color-primary-subtle)',
                        border: '3px solid var(--color-surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, zIndex: 1,
                        color: 'var(--color-primary)',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </div>
                      <div style={{ paddingBlockStart: 6 }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                          {item.action}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginBlockStart: 2 }}>
                          {item.user} · {item.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
