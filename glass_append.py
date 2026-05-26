import pathlib

css = r"""

/* ═══════════════════════════════════════════════════════════
   GLASSMORPHISM DESIGN SYSTEM — High-End UI Override
   ═══════════════════════════════════════════════════════════ */

/* ── Design tokens ────────────────────────────────────────── */
:root {
  /* Font */
  --font-family-base: var(--font-ibm-plex-arabic, 'IBM Plex Sans Arabic'), sans-serif;

  /* Radius */
  --radius-card:    24px;
  --radius-control: 12px;

  /* Glass surfaces */
  --glass-bg:           rgba(255, 255, 255, 0.60);
  --glass-bg-strong:    rgba(255, 255, 255, 0.75);
  --glass-bg-modal:     rgba(255, 255, 255, 0.82);
  --glass-border:       1px solid rgba(255, 255, 255, 0.30);
  --glass-blur:         blur(20px) saturate(1.8);
  --glass-blur-modal:   blur(25px) saturate(1.9);
  --glass-shadow:       0 8px 32px -4px rgba(0, 0, 0, 0.10), 0 2px 8px -2px rgba(0, 0, 0, 0.06);
  --glass-shadow-hover: 0 16px 40px -6px rgba(0, 0, 0, 0.14), 0 4px 12px -3px rgba(0, 0, 0, 0.08);

  /* Lift animation */
  --lift-curve:    cubic-bezier(0.4, 0, 0.2, 1);
  --lift-duration: 220ms;

  /* Glow — brand primary #16a34a */
  --glow-primary:    0 0 0 3px rgba(22, 163, 74, 0.18);
  --glow-primary-lg: 0 0 20px -4px rgba(22, 163, 74, 0.28);
}

/* ── App background — subtle gradient for glass to render against ── */
body {
  background:
    radial-gradient(ellipse at 15% 20%, rgba(22, 163, 74, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 75%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
    #f0f4f8;
  background-attachment: fixed;
}

/* ── Global font numeric variant for financial data ─────────────── */
.ofs-table td,
.ofs-table th,
.kpi-card,
.statement-summary-value,
.customer-stat-value,
.pagination-info,
.lead-order-link,
.lead-customer-phone,
.contact-phone {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
.ofs-sidebar {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-inline-end: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* ── Header ──────────────────────────────────────────────────────── */
.ofs-header {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-block-end: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* ── Header search box ───────────────────────────────────────────── */
.header-search {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.40);
  border-radius: var(--radius-control);
  transition:
    border-color var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    background var(--lift-duration) var(--lift-curve);
}

.header-search:focus-within {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(22, 163, 74, 0.40);
  box-shadow: var(--glow-primary);
}

.header-search input {
  background: transparent;
  border-radius: var(--radius-control);
}

/* ── KPI cards — glass + lift ────────────────────────────────────── */
.kpi-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
  transition:
    transform var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    border-color var(--lift-duration) var(--lift-curve);
  will-change: transform;
}

.kpi-card:hover {
  transform: scale(1.015) translateY(-2px);
  box-shadow: var(--glass-shadow-hover), var(--glow-primary-lg);
  border-color: rgba(22, 163, 74, 0.22);
}

/* ── ofs-card ────────────────────────────────────────────────────── */
.ofs-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
}

/* ── Table rows — glass highlight + accent border ────────────────── */
.ofs-table {
  background: transparent;
}

.ofs-table thead tr th {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.ofs-table tbody tr {
  transition:
    background-color var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve);
}

.ofs-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* RTL: 4px accent border on the visual right edge on row hover */
.ofs-table tbody tr:hover td:last-child {
  box-shadow: inset -4px 0 0 var(--color-primary);
}

[dir="ltr"] .ofs-table tbody tr:hover td:last-child {
  box-shadow: inset 4px 0 0 var(--color-primary);
}

.ofs-table tbody tr:hover td:first-child {
  box-shadow: none;
}

/* ── Quick action buttons ────────────────────────────────────────── */
.quick-action-btn {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
  transition:
    transform var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    border-color var(--lift-duration) var(--lift-curve),
    color var(--lift-duration) var(--lift-curve);
}

.quick-action-btn:hover {
  transform: scale(1.015) translateY(-2px);
  box-shadow: var(--glass-shadow-hover), var(--glow-primary-lg);
  border-color: rgba(22, 163, 74, 0.30);
  background: rgba(255, 255, 255, 0.80);
}

.quick-action-btn:active {
  transform: scale(0.99) translateY(0);
  box-shadow: var(--glass-shadow);
}

/* ── Primary button — lift + glow + radial gradient ─────────────── */
.btn-primary {
  border-radius: var(--radius-control);
  background-image: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.18) 0%, transparent 60%);
  transition:
    background-color var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    transform var(--lift-duration) var(--lift-curve);
}

.btn-primary:hover:not(:disabled) {
  transform: scale(1.015) translateY(-2px);
  box-shadow:
    0 10px 24px -4px rgba(22, 163, 74, 0.35),
    0 4px 10px -3px rgba(22, 163, 74, 0.18),
    var(--glow-primary);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98) translateY(0);
  background-color: var(--color-primary-active);
  box-shadow: 0 1px 4px rgba(22, 163, 74, 0.18);
}

/* ── CTA button ──────────────────────────────────────────────────── */
.btn-cta {
  border-radius: var(--radius-control);
  background-image: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.16) 0%, transparent 60%);
  transition:
    background-color var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    transform var(--lift-duration) var(--lift-curve);
}

.btn-cta:hover:not(:disabled) {
  transform: scale(1.015) translateY(-2px);
  box-shadow:
    0 8px 20px -3px rgba(22, 163, 74, 0.32),
    0 3px 8px -2px rgba(22, 163, 74, 0.16),
    var(--glow-primary);
}

.btn-cta:active:not(:disabled) {
  transform: scale(0.98) translateY(0);
  background-color: var(--color-primary-active);
}

/* ── Outline button — glass ──────────────────────────────────────── */
.btn-outline {
  border-radius: var(--radius-control);
  background: rgba(255, 255, 255, 0.50);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-color: rgba(255, 255, 255, 0.40);
  transition:
    border-color var(--lift-duration) var(--lift-curve),
    color var(--lift-duration) var(--lift-curve),
    background var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    transform var(--lift-duration) var(--lift-curve);
}

.btn-outline:hover:not(:disabled) {
  transform: scale(1.015) translateY(-1px);
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(22, 163, 74, 0.40);
  box-shadow: var(--glass-shadow), var(--glow-primary);
}

.btn-outline:active:not(:disabled) {
  transform: scale(0.98) translateY(0);
}

/* ── Form inputs, selects, textareas — glass + 12px radius ──────── */
.form-input,
.form-select,
.form-textarea {
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--radius-control);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) inset;
  transition:
    border-color var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    background var(--lift-duration) var(--lift-curve);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  background: rgba(255, 255, 255, 0.90);
  border-color: rgba(22, 163, 74, 0.50);
  box-shadow: var(--glow-primary);
}

/* ── Leads toolbar search ────────────────────────────────────────── */
.leads-search input {
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--radius-control);
  transition:
    border-color var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    background var(--lift-duration) var(--lift-curve);
}

.leads-search input:focus {
  background: rgba(255, 255, 255, 0.90);
  border-color: rgba(22, 163, 74, 0.45);
  box-shadow: var(--glow-primary);
}

/* ── Filter chips — glass ────────────────────────────────────────── */
.filter-chip {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-color: rgba(255, 255, 255, 0.35);
  transition:
    background var(--lift-duration) var(--lift-curve),
    border-color var(--lift-duration) var(--lift-curve),
    color var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.80);
  box-shadow: var(--glow-primary);
}

/* ── Auth card ───────────────────────────────────────────────────── */
.auth-card {
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow-hover);
}

.auth-shell {
  background:
    radial-gradient(ellipse at 30% 30%, rgba(22, 163, 74, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 70%, rgba(16, 185, 129, 0.18) 0%, transparent 45%),
    linear-gradient(135deg, #0b1d10 0%, #14532d 50%, #166534 100%);
}

/* ── Registration wizard card ────────────────────────────────────── */
.reg-card {
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow-hover);
}

/* ── Pagination buttons ──────────────────────────────────────────── */
.pagination-page {
  background: rgba(255, 255, 255, 0.50);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-color: rgba(255, 255, 255, 0.35);
  border-radius: var(--radius-md);
}

.pagination-page:hover {
  background: rgba(255, 255, 255, 0.80);
  border-color: rgba(22, 163, 74, 0.25);
}

/* ── Popups / Modals ─────────────────────────────────────────────── */
[role="dialog"],
.modal-panel,
.ofs-modal-panel {
  background: var(--glass-bg-modal);
  backdrop-filter: var(--glass-blur-modal);
  -webkit-backdrop-filter: var(--glass-blur-modal);
  border: var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow-hover);
}

/* ── Dropdown menus ──────────────────────────────────────────────── */
[role="listbox"],
[role="menu"],
.ofs-dropdown-menu {
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-control);
  box-shadow: var(--glass-shadow-hover);
}

[role="option"],
[role="menuitem"] {
  border-radius: 8px;
  transition:
    background var(--lift-duration) var(--lift-curve),
    color var(--lift-duration) var(--lift-curve);
}

[role="option"]:hover,
[role="menuitem"]:hover {
  background: rgba(22, 163, 74, 0.08);
}

/* ── OFS Select component ────────────────────────────────────────── */
.ofs-select-trigger {
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--radius-control);
  transition:
    border-color var(--lift-duration) var(--lift-curve),
    box-shadow var(--lift-duration) var(--lift-curve),
    background var(--lift-duration) var(--lift-curve);
}

.ofs-select-trigger:focus,
.ofs-select-trigger[aria-expanded="true"] {
  background: rgba(255, 255, 255, 0.90);
  border-color: rgba(22, 163, 74, 0.45);
  box-shadow: var(--glow-primary);
}

.ofs-select-dropdown {
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-control);
  box-shadow: var(--glass-shadow-hover);
}

/* ── Wizard step bar ─────────────────────────────────────────────── */
.wizard-step-bar {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-block-end: var(--glass-border);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
}

/* ── Reduce-motion: strip glass animations ───────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .kpi-card,
  .ofs-card,
  .quick-action-btn,
  .btn-primary,
  .btn-cta,
  .btn-outline,
  .filter-chip,
  .ofs-table tbody tr {
    transition: none;
    transform: none !important;
  }
}
"""

target = pathlib.Path(r"D:\Systems\ofs\apps\web\src\styles\globals.css")
with target.open("a", encoding="utf-8") as f:
    f.write(css)

print("Done — appended", len(css), "chars")
