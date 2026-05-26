'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  mockAssignmentHistory,
  mockDistributionAgents,
  distributionMetrics,
  DIST_METHOD_LABELS,
  DIST_METHOD_COLORS,
} from '@/lib/lead-distribution-mock-data';
import { fNum } from '@/lib/format';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoAssign() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  );
}

function IcoChange() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  );
}

function IcoReassign() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  );
}

function IcoBulk() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IcoUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IcoClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IcoTrend() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}

function IcoInbox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  );
}

// ── Method Badge ──────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: keyof typeof DIST_METHOD_COLORS }) {
  const c = DIST_METHOD_COLORS[method];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      paddingInline: 'var(--space-2)', paddingBlock: '2px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-medium)',
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {DIST_METHOD_LABELS[method]}
    </span>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function MetricCard({ label, value, sub, icon, iconBg, iconColor }: MetricCardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div>
          <div className="kpi-card-label">{label}</div>
          <div className="kpi-card-value">{value}</div>
        </div>
        <div className="kpi-card-icon" style={{ backgroundColor: iconBg, color: iconColor }} aria-hidden="true">
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 'var(--space-2)' }}>
        {sub}
      </div>
    </div>
  );
}

// ── Quick Action Button ───────────────────────────────────────────────────────

function QuickAction({ icon, label, description, onClick }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        textAlign: 'start',
        transition: 'all var(--transition-fast)',
        flex: '1 1 0',
        minInlineSize: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
      }}
    >
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        inlineSize: 36, blockSize: 36, borderRadius: 'var(--radius-md)',
        background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
        flexShrink: 0,
      }} aria-hidden="true">
        {icon}
      </span>
      <div>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {description}
        </div>
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeadDistributionPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [_toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const recentHistory = mockAssignmentHistory.slice(0, 8);

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">مركز توزيع العملاء المحتملين</h2>
          <p className="page-subtitle">
            {fNum(distributionMetrics.totalAssigned, 0)} مُعيَّن · {fNum(distributionMetrics.pendingQueue, 0)} في الانتظار · اليوم: {fNum(distributionMetrics.assignedToday, 0)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Link href={`/${locale}/crm/lead-distribution/queue`} className="btn-outline">
            <IcoInbox />
            طابور التوزيع
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minInlineSize: 18, blockSize: 18, borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)', color: '#fff',
              fontSize: '0.65rem', fontWeight: 'var(--font-weight-bold)',
              paddingInline: 4,
            }}>
              {distributionMetrics.pendingQueue}
            </span>
          </Link>
          <Link href={`/${locale}/crm/lead-distribution/rules`} className="btn-cta">
            قواعد التوزيع
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="kpi-grid" style={{ marginBlockEnd: 'var(--space-6)' }}>
        <MetricCard
          label="إجمالي المُعيَّنين"
          value={fNum(distributionMetrics.totalAssigned, 0)}
          sub={`+${distributionMetrics.assignedToday} اليوم`}
          icon={<IcoUsers />}
          iconBg="#dcfce7"
          iconColor="#15803d"
        />
        <MetricCard
          label="في الانتظار"
          value={fNum(distributionMetrics.pendingQueue, 0)}
          sub="يحتاجون تعيين فوري"
          icon={<IcoInbox />}
          iconBg="#fef3c7"
          iconColor="#b45309"
        />
        <MetricCard
          label="متوسط وقت الاستجابة"
          value={`${distributionMetrics.avgResponseHours} ساعة`}
          sub="من وقت الإنشاء للتواصل"
          icon={<IcoClock />}
          iconBg="#eff6ff"
          iconColor="#1d4ed8"
        />
        <MetricCard
          label="معدل التحويل"
          value={`${distributionMetrics.conversionRate}%`}
          sub="من المعيَّن إلى فوز"
          icon={<IcoTrend />}
          iconBg="#faf5ff"
          iconColor="#7c3aed"
        />
      </div>

      {/* Manual Distribution Quick Actions */}
      <div className="ofs-card" style={{ padding: 'var(--space-5)', marginBlockEnd: 'var(--space-6)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBlockEnd: 'var(--space-4)',
          paddingBlockEnd: 'var(--space-3)',
          borderBlockEnd: '1px solid var(--color-border)',
        }}>
          <h3 className="ofs-card-title" style={{ marginBlockEnd: 0 }}>التوزيع اليدوي</h3>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            إجراءات سريعة لإدارة التعيينات
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <QuickAction
            icon={<IcoAssign />}
            label="تعيين عميل"
            description="اختر عميلاً وعيِّنه لمندوب"
            onClick={() => showToast('تعيين عميل — قريباً')}
          />
          <QuickAction
            icon={<IcoChange />}
            label="تغيير المالك"
            description="نقل ملكية عميل لمندوب آخر"
            onClick={() => showToast('تغيير المالك — قريباً')}
          />
          <QuickAction
            icon={<IcoReassign />}
            label="إعادة تعيين"
            description="إعادة توزيع عميل محدد"
            onClick={() => showToast('إعادة التعيين — قريباً')}
          />
          <QuickAction
            icon={<IcoBulk />}
            label="تعيين جماعي"
            description="توزيع متعدد العملاء دفعةً واحدة"
            onClick={() => showToast('التعيين الجماعي — قريباً')}
          />
        </div>
      </div>

      {/* Two-column: Recent Assignments + Agent Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-5)', alignItems: 'start' }}>

        {/* Recent Assignments */}
        <div className="ofs-card">
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">آخر التعيينات</h3>
            <Link href={`/${locale}/crm/lead-distribution/history`} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>
              عرض الكل
            </Link>
          </div>
          <div className="ofs-table-wrap">
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>طريقة التوزيع</th>
                  <th>المُعيَّن إليه</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                        {record.leadName}
                      </div>
                      {record.fromAgent && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          من: {record.fromAgent}
                        </div>
                      )}
                    </td>
                    <td>
                      <MethodBadge method={record.method} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{
                          inlineSize: 26, blockSize: 26, borderRadius: 'var(--radius-full)',
                          background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.625rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
                        }}>
                          {record.toAgentInitials}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                          {record.toAgent}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {record.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Leaderboard */}
        <div className="ofs-card">
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">أداء المندوبين</h3>
            <Link href={`/${locale}/crm/lead-distribution/ownership`} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>
              ملكية العملاء
            </Link>
          </div>
          <div style={{ padding: 'var(--space-3)' }}>
            {mockDistributionAgents.map((agent, idx) => (
              <div key={agent.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                paddingBlock: 'var(--space-3)',
                borderBlockEnd: idx < mockDistributionAgents.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              }}>
                {/* Rank */}
                <span style={{
                  inlineSize: 22, blockSize: 22, borderRadius: 'var(--radius-full)',
                  background: idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : 'var(--color-surface-overlay)',
                  color: idx === 0 ? '#b45309' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
                }}>
                  {idx + 1}
                </span>
                {/* Avatar */}
                <span style={{
                  inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
                }}>
                  {agent.initials}
                </span>
                {/* Info */}
                <div style={{ flex: 1, minInlineSize: 0 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 2 }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {agent.branch}
                  </div>
                </div>
                {/* Stats */}
                <div style={{ textAlign: 'end' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                    {agent.assignedCount}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: '#15803d', fontWeight: 'var(--font-weight-medium)' }}>
                    {agent.conversionRate}%
                  </div>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div style={{
              marginBlockStart: 'var(--space-3)',
              paddingBlockStart: 'var(--space-3)',
              borderBlockStart: '1px solid var(--color-border-subtle)',
              display: 'flex', justifyContent: 'space-between',
              fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
            }}>
              <span>المندوب</span>
              <span>المُعيَّن · التحويل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {_toast && (
        <div style={{
          position: 'fixed', insetBlockEnd: 'var(--space-6)', insetInlineEnd: 'var(--space-6)',
          background: 'var(--color-text)', color: '#fff',
          paddingInline: 'var(--space-4)', paddingBlock: 'var(--space-3)',
          borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)',
          boxShadow: 'var(--shadow-elevated)', zIndex: 1000,
        }}>
          {_toast}
        </div>
      )}
    </>
  );
}
