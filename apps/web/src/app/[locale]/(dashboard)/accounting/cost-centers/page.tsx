'use client';

import { useState } from 'react';
import { mockCostCenters, type CostCenter } from '@/lib/mock-data';
import { fNum } from '@/lib/format';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmt(n: number) {
  return fNum(n, 0);
}

function UtilBar({ pct }: { pct: number }) {
  const cls = pct >= 100 ? 'over-budget' : pct >= 85 ? 'near-budget' : '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div className="cc-budget-bar-track" style={{ flex: 1 }}>
        <div
          className={`cc-budget-bar-fill ${cls}`}
          style={{ inlineSize: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span style={{
        fontSize: 'var(--font-size-xs)',
        fontVariantNumeric: 'tabular-nums',
        minInlineSize: 36,
        textAlign: 'end',
        color: pct >= 100 ? '#dc2626' : pct >= 85 ? '#f59e0b' : 'var(--color-text-muted)',
        fontWeight: pct >= 85 ? 'var(--font-weight-semibold)' : undefined,
      }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function CostCenterRow({
  cc,
  children,
  hasChildren,
  expanded,
  onToggle,
}: {
  cc: CostCenter;
  children?: React.ReactNode;
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const variance = cc.budget - cc.actual;
  const pct      = cc.budget > 0 ? (cc.actual / cc.budget) * 100 : 0;
  const isRoot   = cc.level === 1;

  return (
    <>
      <tr
        style={{
          cursor: hasChildren ? 'pointer' : undefined,
          background: isRoot ? 'color-mix(in srgb, var(--color-primary) 4%, var(--color-surface))' : undefined,
        }}
        onClick={hasChildren ? onToggle : undefined}
      >
        {/* Name + expand */}
        <td style={{ paddingInlineStart: `calc(var(--space-4) + ${(cc.level - 1) * 20}px)` }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {hasChildren && (
              <span className={`coa-expand-icon${expanded ? ' open' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </span>
            )}
            {!hasChildren && <span style={{ width: 12, display: 'inline-block' }} />}
            <span className="coa-code-chip">{cc.code}</span>
            <span style={{ fontWeight: isRoot || cc.level === 2 ? 'var(--font-weight-semibold)' : undefined }}>
              {cc.nameAr}
            </span>
          </span>
        </td>

        {/* Manager */}
        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          {cc.manager ?? '—'}
        </td>

        {/* Budget */}
        <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>
          {fmtAmt(cc.budget)}
        </td>

        {/* Actual */}
        <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>
          {fmtAmt(cc.actual)}
        </td>

        {/* Variance */}
        <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>
          <span className={variance >= 0 ? 'balance-positive' : 'balance-negative'}>
            {variance >= 0 ? '+' : ''}{fmtAmt(variance)}
          </span>
        </td>

        {/* Utilisation bar */}
        <td style={{ minInlineSize: 160 }}>
          <UtilBar pct={pct} />
        </td>

        {/* Status */}
        <td style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            width: 8, height: 8,
            borderRadius: '50%',
            background: cc.isActive ? 'var(--color-status-active)' : 'var(--color-text-muted)',
          }} />
        </td>
      </tr>
      {expanded && children}
    </>
  );
}

// ── Recursive tree ────────────────────────────────────────────────────────────

function CostCenterTree({
  centers,
  parentId,
  expanded,
  onToggle,
}: {
  centers: CostCenter[];
  parentId: string | undefined;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const children = centers.filter(c => c.parentId === parentId);
  return (
    <>
      {children.map(cc => {
        const hasChildren = centers.some(c => c.parentId === cc.id);
        const isExpanded  = expanded.has(cc.id);
        return (
          <CostCenterRow
            key={cc.id}
            cc={cc}
            hasChildren={hasChildren}
            expanded={isExpanded}
            onToggle={() => onToggle(cc.id)}
          >
            {isExpanded && (
              <CostCenterTree
                centers={centers}
                parentId={cc.id}
                expanded={expanded}
                onToggle={onToggle}
              />
            )}
          </CostCenterRow>
        );
      })}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CostCentersPage() {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(mockCostCenters.map(c => c.id))
  );

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const root       = mockCostCenters.find(c => c.level === 1);
  const totalBudget = root?.budget ?? 0;
  const totalActual = root?.actual ?? 0;
  const totalVar    = totalBudget - totalActual;
  const overBudget  = mockCostCenters.filter(c => c.actual > c.budget).length;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">مراكز التكلفة</h2>
          <p className="page-subtitle">{mockCostCenters.length} مركز تكلفة — التتبع الهرمي للميزانية</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          مركز جديد
        </button>
      </div>

      {/* Stats */}
      <div className="acc-stat-grid ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>إجمالي الميزانية</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>
            {fmtAmt(totalBudget)} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>ر.س</span>
          </span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>إجمالي الفعلي</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>
            {fmtAmt(totalActual)} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>ر.س</span>
          </span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>الفائض / العجز</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: totalVar >= 0 ? 'var(--color-status-active)' : '#dc2626' }}>
            {totalVar >= 0 ? '+' : ''}{fmtAmt(totalVar)} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>ر.س</span>
          </span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>تجاوزت الميزانية</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: overBudget > 0 ? '#dc2626' : 'var(--color-status-active)', fontVariantNumeric: 'tabular-nums' }}>
            {overBudget} مراكز
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBlockEnd: 'var(--space-4)' }}>
        <button type="button" className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)' }}
          onClick={() => setExpanded(new Set(mockCostCenters.map(c => c.id)))}>
          توسيع الكل
        </button>
        <button type="button" className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)' }}
          onClick={() => setExpanded(new Set(mockCostCenters.filter(c => c.level === 1).map(c => c.id)))}>
          طي الكل
        </button>
      </div>

      {/* Tree table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 750 }}>
            <thead>
              <tr>
                <th style={{ minInlineSize: 260 }}>اسم المركز</th>
                <th>المسؤول</th>
                <th className="col-amount">الميزانية (ر.س)</th>
                <th className="col-amount">الفعلي (ر.س)</th>
                <th className="col-amount">الفرق (ر.س)</th>
                <th style={{ minInlineSize: 180 }}>نسبة الاستهلاك</th>
                <th style={{ textAlign: 'center' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <CostCenterTree
                centers={mockCostCenters}
                parentId={undefined}
                expanded={expanded}
                onToggle={toggleExpanded}
              />
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="totals-label">الإجمالي</td>
                <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>{fmtAmt(totalBudget)}</td>
                <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>{fmtAmt(totalActual)}</td>
                <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>
                  <span className={totalVar >= 0 ? 'balance-positive' : 'balance-negative'}>
                    {totalVar >= 0 ? '+' : ''}{fmtAmt(totalVar)}
                  </span>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
