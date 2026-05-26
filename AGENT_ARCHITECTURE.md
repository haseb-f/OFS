# OFS Agent Architecture

## Agent Roles

| Agent | Responsibility |
|---|---|
| Product Manager Agent | Defines scope, acceptance criteria, user stories per module |
| Chief Architect Agent | System-level design, cross-module contracts, data flow |
| Import Domain Agent | Import domain model: source configs, review records, smart matching, workflow states |
| Accounting Agent | Accounting impact of imports: posting rules, journal entry templates, inventory effects |
| UI/UX Agent | OFS Design System compliance, RTL/Arabic layout, component patterns |
| Frontend Agent | Next.js page/component implementation using OFS Design System only |
| Review | Mandatory cross-agent review before feature completion |

## Orchestration Rules

1. **Append Only** — Never rewrite existing modules
2. **Design System Only** — OFS CSS variables and class names exclusively; no Tailwind utility classes
3. **RTL First** — CSS logical properties only: `inset-inline-start/end`, `margin-inline`, `padding-inline`, `border-block-end`, etc. Never use physical `left`/`right`/`top`/`bottom` in layout rules.
4. **Mock First** — All new pages use local mock data; no backend calls until API is ready
5. **Review Gate** — Cross-agent review required before any feature is marked complete

## Import Module Workflow Contract

```
Connected Source → Refresh → Validation → Review Center → Approve → Post
```

- **Approval** marks records as `approved` — does NOT create accounting entries
- **Posting** creates accounting entries (separate step, not yet implemented)
- **Smart Matching** runs automatically on Collection & Deposit imports only

## Data Flow

```
ImportSourceConfigV2
  └─► ImportReviewRecordV2[]
        ├─ reviewStatus: ready | needs_review | duplicate | error
        ├─ approvalStatus: pending | approved | rejected
        └─ smartMatch?: SmartMatchSuggestion  (collections only)
```

## Module → Route Map

| Module | Route |
|---|---|
| Collection & Deposit Import | `/import/collections` |
| Payments Import | `/import/payments` |
| Payroll Import | `/import/payroll` |
| Customers Import | `/import/customers` |
| Vendors Import | `/import/vendors` |
| Products & Services Import | `/import/products` |
| Customer Opening Balances | `/import/customer-opening-balances` |
| Vendor Opening Balances | `/import/vendor-opening-balances` |
| Opening Journal Entries | `/import/opening-entries` |
| Import History | `/import/history` |

## Posting Rules (Future — Not Yet Implemented)

### Matched Collection
Order → Invoice → Accounting Entries → Inventory Effects

### Unmatched Collection
Collection Record → Manual Sales Invoice → Accounting Entries

### B2B Invoices
Manual Invoice → Accounting Entries

## UI Component Requirements

Every import module page MUST use:
- `OFS Page Header` (`page-header`, `page-title`, `page-subtitle`)
- `OFS Toolbar` (`TableToolbar`)
- `OFS Search Input` (`form-input`)
- `OFS Select` (`form-select`)
- `OFS Status Badge` (`ImportStatusBadge` or inline badge)
- `OFS Data Table` (`ofs-table`)
- `ImportSourceConfigCard` — source connection card
- `ImportReviewCenter` — review tabs and bulk actions

Collections module additionally uses:
- `ImportSmartMatchCard` — confidence score and match details

## Enterprise UI Components (v4)

| Component | File | Description |
|---|---|---|
| `OfsSelect` | `components/ui/OfsSelect.tsx` | Glassmorphism searchable dropdown; supports groups, loading, empty states, keyboard nav |
| `OfsDatePicker` | `components/ui/OfsDatePicker.tsx` | Enterprise calendar; RTL-aware; "24 May 2026" format; keyboard (arrows, Enter, Escape) |
| `OfsAccountSelect` | `components/ui/OfsAccountSelect.tsx` | Expandable account tree; code + name; quick search; selected indicator |
| `OfsPopover` | `components/ui/OfsPopover.tsx` | Glass popover; `radius-xl` (16px); `backdrop-filter` blur; elevated shadow; placement variants |

## Number & Date Formatting

**All** numbers and dates MUST use `lib/format.ts` utilities — **never** `toLocaleString('ar-SA')`.

| Function | Output |
|---|---|
| `fNum(125000)` | `125,000.00` |
| `fNum(5250.75)` | `5,250.75` |
| `fNum(42, 0)` | `42` |
| `fCurrency(8500)` | `8,500.00 SAR` |
| `fDate(new Date())` | `24 May 2026` |
| `fDate(d, true)` | `24 May 2026` (short form same) |
| `fMonthYear(d)` | `May 2026` |

## Design Tokens (v4)

```css
--glass-bg:          rgba(255, 255, 255, 0.88)
--glass-bg-strong:   rgba(255, 255, 255, 0.96)
--glass-border:      rgba(255, 255, 255, 0.55)
--glass-blur:        blur(20px) saturate(180%)
--glass-shadow:      layered 20px/8px/inner highlight
--glass-shadow-elevated: stronger version for popovers
```

## Status Colors

| Status | Color |
|---|---|
| ready | `#16a34a` (green) |
| needs_review | `#b45309` / `#f59e0b` (amber) |
| duplicate | `#1d4ed8` / `#3b82f6` (blue) |
| error | `#b91c1c` / `#ef4444` (red) |
| approved | `#16a34a` |
| rejected | `#b91c1c` |
| pending | `#6b7280` |
