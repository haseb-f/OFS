'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  crmKpiData,
  mockCrmActivities,
  mockCrmTasks,
  mockCrmLeads,
  STAGE_LABELS,
  ACTIVITY_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type CrmLeadStage,
} from '@/lib/crm-mock-data';
import { fNum } from '@/lib/format';

// ── Stage pipeline config ─────────────────────────────────────────────────────

const PIPELINE_STAGES: { id: CrmLeadStage; color: string }[] = [
  { id: 'new',           color: '#64748b' },
  { id: 'contacted',     color: '#3b82f6' },
  { id: 'interested',    color: '#8b5cf6' },
  { id: 'qualified',     color: '#f59e0b' },
  { id: 'proposal_sent', color: '#f97316' },
  { id: 'won',           color: '#16a34a' },
  { id: 'lost',          color: '#ef4444' },
];

// ── Activity type icon ────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    call: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.82 19.79 19.79 0 0 1 .93 1.18 2 2 0 0 1 2.92 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
      </svg>
    ),
    meeting: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    whatsapp: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    email: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    visit: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    followup: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  };
  return <>{icons[type] ?? icons.call}</>;
}

// ── Priority badge ────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  low:      { bg: '#f1f5f9', color: '#64748b' },
  medium:   { bg: '#fffbeb', color: '#b45309' },
  high:     { bg: '#fff7ed', color: '#c2410c' },
  critical: { bg: '#fef2f2', color: '#b91c1c' },
};

function PriorityBadge({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.low;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      paddingInline: 'var(--space-2)', paddingBlock: '2px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-semibold)',
      background: c.bg, color: c.color,
    }}>
      {TASK_PRIORITY_LABELS[priority as keyof typeof TASK_PRIORITY_LABELS]}
    </span>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function CrmKpiCard({
  label, value, iconBg, iconColor, trend, trendUp, icon,
}: {
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div>
          <div className="kpi-card-label">{label}</div>
          <div className="kpi-card-value">{typeof value === 'number' ? fNum(value, 0) : value}</div>
        </div>
        <div className="kpi-card-icon" style={{ backgroundColor: iconBg, color: iconColor }} aria-hidden="true">
          {icon}
        </div>
      </div>
      <div className={`kpi-card-trend ${trendUp ? 'up' : 'down'}`}>
        {trendUp
          ? <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          : <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        }
        <span>{trend}</span>
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-regular)' }}>مقارنة بالشهر الماضي</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CrmDashboardPage() {
  const params = useParams();
  const locale = params.locale as string;

  const recentActivities = mockCrmActivities.slice(0, 6);
  const urgentTasks = mockCrmTasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .slice(0, 5);

  const stageCounts = PIPELINE_STAGES.map(s => ({
    ...s,
    count: mockCrmLeads.filter(l => l.stage === s.id).length,
    value: mockCrmLeads.filter(l => l.stage === s.id).reduce((acc, l) => acc + l.expectedValue, 0),
  }));

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">لوحة إدارة علاقات العملاء</h2>
          <p className="page-subtitle">نظرة عامة على خط الصفقات والأنشطة والمهام</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Link href={`/${locale}/crm/activities`} className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            نشاط جديد
          </Link>
          <Link href={`/${locale}/crm/leads`} className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            عميل محتمل جديد
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <CrmKpiCard
          label="إجمالي العملاء المحتملين"
          value={crmKpiData.totalLeads}
          iconBg="#f0fdf4" iconColor="#16a34a"
          trend="+12.5%" trendUp={true}
          icon={<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>}
        />
        <CrmKpiCard
          label="عملاء محتملون جدد"
          value={crmKpiData.newLeads}
          iconBg="#eff6ff" iconColor="#3b82f6"
          trend="+4" trendUp={true}
          icon={<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"/><path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/></svg>}
        />
        <CrmKpiCard
          label="عملاء مؤهلون"
          value={crmKpiData.qualifiedLeads}
          iconBg="#fff7ed" iconColor="#f97316"
          trend="+2" trendUp={true}
          icon={<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
        />
        <CrmKpiCard
          label="العملاء"
          value={crmKpiData.customers}
          iconBg="#f5f3ff" iconColor="#8b5cf6"
          trend="+8.1%" trendUp={true}
          icon={<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>}
        />
        <CrmKpiCard
          label="المهام المفتوحة"
          value={crmKpiData.openTasks}
          iconBg="#fffbeb" iconColor="#b45309"
          trend="+5" trendUp={false}
          icon={<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>}
        />
        <CrmKpiCard
          label="المهام المكتملة"
          value={crmKpiData.completedTasks}
          iconBg="#f0fdf4" iconColor="#16a34a"
          trend="+22.4%" trendUp={true}
          icon={<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
        />
      </div>

      {/* Pipeline funnel + bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBlockStart: 'var(--space-6)' }}>

        {/* Pipeline Summary */}
        <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
              خط الصفقات
            </h3>
            <Link href={`/${locale}/crm/leads`} className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)' }}>
              عرض الكل
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {stageCounts.map(stage => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{
                  display: 'inline-block',
                  inlineSize: 10, blockSize: 10,
                  borderRadius: 'var(--radius-full)',
                  background: stage.color,
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                  {STAGE_LABELS[stage.id]}
                </span>
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-muted)',
                  minInlineSize: 20,
                  textAlign: 'center',
                }}>
                  {stage.count}
                </span>
                <div style={{ inlineSize: 120, blockSize: 6, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-overlay)', overflow: 'hidden' }}>
                  <div style={{
                    blockSize: '100%',
                    inlineSize: stage.count > 0 ? `${Math.max(8, (stage.count / mockCrmLeads.length) * 100)}%` : '0%',
                    background: stage.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'inline-size var(--transition-normal)',
                  }} />
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', minInlineSize: 72, textAlign: 'end' }}>
                  {fNum(stage.value, 0)} ر.س
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
              الأنشطة الأخيرة
            </h3>
            <Link href={`/${locale}/crm/activities`} className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)' }}>
              عرض الكل
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {recentActivities.map(act => (
              <div key={act.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                paddingBlock: 'var(--space-2)',
                borderBlockEnd: '1px solid var(--color-border-subtle)',
              }}>
                <div style={{
                  inlineSize: 30, blockSize: 30, borderRadius: 'var(--radius-md)',
                  background: act.status === 'completed' ? '#f0fdf4'
                    : act.status === 'scheduled' ? '#eff6ff' : '#fef2f2',
                  color: act.status === 'completed' ? '#16a34a'
                    : act.status === 'scheduled' ? '#3b82f6' : '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <ActivityIcon type={act.type} />
                </div>
                <div style={{ flex: 1, minInlineSize: 0 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {act.subject}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {act.customerName} · {ACTIVITY_TYPE_LABELS[act.type]}
                  </div>
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', whiteSpace: 'nowrap' }}>
                  {act.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Tasks */}
      <div className="ofs-card" style={{ padding: 'var(--space-5)', marginBlockStart: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
            المهام العاجلة
          </h3>
          <Link href={`/${locale}/crm/tasks`} className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)' }}>
            عرض الكل
          </Link>
        </div>
        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th>المهمة</th>
                <th>العميل</th>
                <th>المسؤول</th>
                <th>الأولوية</th>
                <th>تاريخ الاستحقاق</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {urgentTasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                      {task.name}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{task.customerName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{
                        inlineSize: 26, blockSize: 26, borderRadius: 'var(--radius-full)',
                        background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)',
                        flexShrink: 0,
                      }}>
                        {task.assignedUserInitials}
                      </span>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{task.assignedUser}</span>
                    </div>
                  </td>
                  <td><PriorityBadge priority={task.priority} /></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{task.dueDate}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      paddingInline: 'var(--space-2)', paddingBlock: '2px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      background: task.status === 'in_progress' ? '#eff6ff'
                        : task.status === 'waiting' ? '#fffbeb' : '#f1f5f9',
                      color: task.status === 'in_progress' ? '#1d4ed8'
                        : task.status === 'waiting' ? '#b45309' : '#64748b',
                    }}>
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
