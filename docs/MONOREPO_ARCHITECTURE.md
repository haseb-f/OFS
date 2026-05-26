# OFS Monorepo Architecture

**Status:** Active — Single Source of Truth for Repository Organisation  
**Scope:** Repository structure, package boundaries, application architecture, scalability  
**Constraints:** Arabic-first · RTL-first · Rubik font · Professional green theme · Multi-tenant SaaS · No hardcoded business logic · Audit everything · Performance first · Security first · Accounting accuracy first · Date format: DD MMM YYYY

---

## 1. Monorepo Philosophy

### Why a Monorepo

OFS is a multi-domain SaaS platform spanning a Next.js frontend, a NestJS backend, a background worker runtime, and a shared database layer. A monorepo is the correct choice because:

- **Type safety across boundaries.** The `@ofs/types` package is the single source of truth for every interface, DTO, and enum. The frontend and backend reference the same type definitions with no duplication and no drift.
- **Atomic commits.** A database schema change, the backend service that consumes it, and the frontend component that renders it are committed together. Reviewers see the full impact of a change in one diff.
- **Shared tooling without repetition.** ESLint configuration, TypeScript base config, Prettier, and test setup are defined once in `packages/config` and extended by every application and package.
- **Enforced package boundaries.** Turborepo's dependency graph makes implicit coupling visible. A frontend component cannot accidentally import a NestJS decorator; a validation schema cannot silently diverge from the API contract.
- **Coordinated releases.** All applications ship from the same commit SHA. There are no version-skew bugs between a deployed frontend and a deployed backend.

### Guiding Principles

| Principle | Application |
|---|---|
| **Single source of truth** | Types, validation schemas, and API contracts live in shared packages — never duplicated per application |
| **Strict package boundaries** | Applications import from packages; packages never import from applications |
| **Arabic-first, RTL-first** | All UI packages default to `dir="rtl"` and `lang="ar"`. LTR is an opt-in override, never the default |
| **No hardcoded business logic** | Statuses, workflow transitions, feature flags, and configuration are data-driven. No `if status === 'APPROVED'` strings in application code |
| **Audit by convention** | Every mutation that crosses a package boundary emits an audit event. Silence is a bug |
| **Performance by default** | Read replicas, lazy imports, streaming, and edge caching are the default path — not added later |

### Toolchain

| Tool | Role |
|---|---|
| **Turborepo** | Task orchestration, build caching, dependency graph enforcement |
| **pnpm workspaces** | Package manager and workspace linking |
| **TypeScript** | Strict mode enabled globally; no `any` in shared packages |
| **ESLint + Prettier** | Unified code style enforced in CI |
| **Vitest** | Unit and integration testing across all packages |
| **Playwright** | End-to-end testing from `apps/web` |

---

## 2. Repository Structure

### Top-Level Layout

```
ofs/
├── apps/
│   ├── web/                  # Next.js App Router frontend (port 3007)
│   ├── api/                  # NestJS backend
│   └── worker/               # Background job processor
├── packages/
│   ├── database/             # Prisma schema, client, migrations, seed
│   ├── types/                # Shared TypeScript types, interfaces, enums
│   ├── validation/           # Zod schemas shared across frontend and backend
│   ├── utils/                # Pure utility functions (dates, money, slugs)
│   ├── ui/                   # Design system: Rubik, RTL, green theme
│   ├── api-contracts/        # API contract types and endpoint definitions
│   ├── logger/               # Structured logging abstraction
│   ├── audit/                # Audit trail helpers and event emitters
│   └── config/               # Shared ESLint, TypeScript, Prettier configs
├── infra/
│   ├── supabase/             # Supabase project config, storage rules, RLS notes
│   └── scripts/              # Database seed runners, migration helpers
├── docs/
│   ├── MONOREPO_ARCHITECTURE.md
│   ├── SYSTEM_BLUEPRINT.md
│   ├── PRISMA_SCHEMA_BLUEPRINT.md
│   └── AGENT_ARCHITECTURE.md
├── .github/
│   └── workflows/            # CI/CD pipeline definitions
├── turbo.json                # Turborepo pipeline configuration
├── pnpm-workspace.yaml       # pnpm workspace package globs
├── package.json              # Root scripts and devDependencies
└── .env.example              # Environment variable template
```

### Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| App folders | `kebab-case` | `apps/web`, `apps/api` |
| Package folders | `kebab-case` | `packages/api-contracts` |
| Package names | `@ofs/<name>` | `@ofs/types`, `@ofs/ui` |
| Source files | `kebab-case` | `leave-request.service.ts` |
| Test files | `*.spec.ts` (unit), `*.e2e.ts` (e2e) | `employee.service.spec.ts` |
| Environment files | `.env.<environment>` | `.env.local`, `.env.production` |

### Dependency Direction

```
apps/web        ──▶  packages/ui
apps/web        ──▶  packages/types
apps/web        ──▶  packages/validation
apps/web        ──▶  packages/utils
apps/web        ──▶  packages/api-contracts

apps/api        ──▶  packages/database
apps/api        ──▶  packages/types
apps/api        ──▶  packages/validation
apps/api        ──▶  packages/utils
apps/api        ──▶  packages/logger
apps/api        ──▶  packages/audit

apps/worker     ──▶  packages/database
apps/worker     ──▶  packages/types
apps/worker     ──▶  packages/logger
apps/worker     ──▶  packages/audit

packages/*      ──▶  packages/config   (dev tooling only)
packages/audit  ──▶  packages/logger
packages/validation ──▶ packages/types
```

**Rule:** No circular dependencies. No application importing from another application. No package importing from an application.

---

## 3. Application Boundaries

### apps/web — Next.js Frontend

**Purpose:** The tenant-facing SaaS UI. Serves all user-facing pages using Next.js App Router with React Server Components.

**Responsibilities:**
- All user interface rendering (Arabic-first, RTL layout)
- Client-side state management scoped to UI concerns only
- API communication via the `@ofs/api-contracts` typed client
- Authentication state via Supabase Auth client
- File uploads to Supabase Storage directly from the browser

**Does not own:**
- Business logic — no workflow rules, status transitions, or validation logic defined here
- Data fetching outside of RSC server actions and the typed API client
- Database access of any kind

**Local port:** `3007`

**Deployment target:** Vercel (Edge + Serverless Functions)

---

### apps/api — NestJS Backend

**Purpose:** The authoritative business logic server. All mutations and sensitive reads pass through this application.

**Responsibilities:**
- REST API serving the frontend and any external integrations
- Domain business logic: workflow enforcement, status transitions, rule evaluation
- Prisma database access (primary write connection)
- Background job queuing (BullMQ producers)
- Outbox event publishing
- Audit event emission
- Multi-tenant request scoping

**Does not own:**
- UI concerns
- Background job execution (owned by `apps/worker`)
- Long-running file processing (delegated to worker via job queue)

**Deployment target:** Vercel Serverless Functions or a Node.js container (determined by load requirements)

---

### apps/worker — Background Job Processor

**Purpose:** Executes long-running, asynchronous, and scheduled tasks outside the HTTP request cycle.

**Responsibilities:**
- BullMQ job consumers (import processing, email dispatch, stock movement posting, outbox relay)
- Scheduled cron jobs (period close, balance recompute, leave balance rollover)
- Retry and failure handling with dead-letter queue routing
- Outbox event relay to external systems

**Does not own:**
- HTTP request handling
- Direct API responses
- UI concerns

**Deployment target:** A long-running Node.js process (not serverless); hosted on a container platform alongside Supabase infrastructure.

---

### Boundary Enforcement Rules

| Rule | Enforcement |
|---|---|
| Frontend never queries the database directly | No `@ofs/database` in `apps/web` dependencies |
| Worker never accepts HTTP requests | No HTTP listener; no NestJS HTTP adapter in `apps/worker` |
| Business logic never lives in the frontend | Validation in `@ofs/validation`; workflow rules in `apps/api` domain modules |
| Tenant context is always verified at the API boundary | Middleware in `apps/api` sets tenant scope before any resolver executes |

---

## 4. Shared Package Strategy

All packages reside under `packages/` and are published internally via the pnpm workspace under the `@ofs/` namespace. No package is published to npm.

### @ofs/database

**Owner:** Database Agent  
**Reviewer:** Backend Agent  
**Quality Gate:** Schema Agent

**Contents:**
- The Prisma schema file (`schema.prisma`)
- Generated Prisma Client (committed to source after generation)
- Database migration files (`prisma/migrations/`)
- Seed scripts and seed utilities
- The two Prisma client instances: `db` (OLTP, primary) and `dbRead` (reporting, read replica)
- Type re-exports from Prisma generated types

**Consumers:** `apps/api`, `apps/worker` only. Never `apps/web`.

**Rules:**
- Schema changes require a migration file — no schema drift without a migration
- The generated client is re-generated in CI before the build step
- Seed data is tenant-aware and uses the same `cuid()` ID strategy as production data

---

### @ofs/types

**Owner:** Types Agent  
**Reviewer:** Backend Agent, Frontend Agent  
**Quality Gate:** Types Agent

**Contents:**
- All TypeScript interfaces for domain entities (mirroring Prisma models but framework-agnostic)
- All DTOs: request bodies, response shapes, pagination wrappers
- All enums (re-exported from Prisma where applicable; extended with UI-facing display metadata)
- Shared constants: supported locales, currency codes, date format tokens
- Utility types: `Paginated<T>`, `TenantScoped<T>`, `AuditedEntity`, `SoftDeletable`

**Consumers:** All apps and all other packages.

**Rules:**
- No runtime logic — types only; this package must have zero runtime cost
- All domain enums defined here are the canonical source; Prisma enums are imported from `@ofs/database` and re-exported with display metadata attached
- No framework imports (`react`, `@nestjs/*`, `zod` are all forbidden in this package)

---

### @ofs/validation

**Owner:** Validation Agent  
**Reviewer:** Backend Agent, Frontend Agent  
**Quality Gate:** Validation Agent

**Contents:**
- Zod schemas for every request body and form input
- Schema factories for dynamic tenant-configured validation rules
- Shared refinements: IBAN format, VAT number patterns, phone number normalisation, date range coherence
- `DD MMM YYYY` date parsing and formatting utilities built on top of date-fns

**Consumers:** `apps/web` (form validation), `apps/api` (request body parsing), `packages/audit` (payload shape verification).

**Rules:**
- Every Zod schema in this package must have a corresponding TypeScript type in `@ofs/types`
- No hardcoded lists of statuses or workflow states — schema factories accept configuration objects
- Schemas are locale-aware; error messages default to Arabic and accept a locale override

---

### @ofs/utils

**Owner:** Utilities Agent  
**Reviewer:** Frontend Agent, Backend Agent  
**Quality Gate:** Utilities Agent

**Contents:**
- Date utilities: format (`DD MMM YYYY`), parse, compare, fiscal period resolution
- Money utilities: minor-unit arithmetic, formatting with locale and currency, BigInt safe-math
- String utilities: slug generation, truncation, transliteration (Arabic ↔ Latin)
- Pagination utilities: cursor and offset helpers
- Tenant utilities: tenant context extraction, tenant-scoped ID generation helpers
- RTL utilities: bidi character detection, text direction resolution

**Consumers:** All apps and packages.

**Rules:**
- Pure functions only — no side effects, no I/O, no framework dependencies
- All money functions operate on `BigInt`; no `number` or `float` money arguments accepted
- All date functions output `DD MMM YYYY` format by default; format overrides are explicit

---

### @ofs/ui

**Owner:** Frontend Agent  
**Reviewer:** Design Agent  
**Quality Gate:** Frontend Agent

**Contents:**
- Base component library: buttons, inputs, selects, tables, modals, toasts, badges
- Layout primitives: page shell, sidebar, topbar, content area — all RTL by default
- Data display components: status badges (dynamic, config-driven), date displays (`DD MMM YYYY`), money displays
- Form components wired to `@ofs/validation` Zod schemas via React Hook Form
- Theme tokens: Rubik font definition, professional green colour scale, spacing and radius tokens
- RTL/LTR context provider wrapping the Next.js root layout

**Consumers:** `apps/web` only.

**Rules:**
- All components render RTL by default; `dir="ltr"` must be explicitly applied
- Rubik font is loaded once at the root layout level and referenced via CSS variable
- No business logic in any component — status labels and workflow labels come from configuration props
- All status badge colours are driven by a configuration map, never hardcoded per status value
- Components are headless-first where applicable; Radix UI primitives are the accessibility foundation

---

### @ofs/api-contracts

**Owner:** Backend Agent  
**Reviewer:** Frontend Agent  
**Quality Gate:** Types Agent

**Contents:**
- Typed endpoint definitions: HTTP method, path pattern, request type, response type
- Pagination response wrapper types
- Error response shapes
- Webhook payload types
- The typed API client factory used by `apps/web` to call `apps/api`

**Consumers:** `apps/web` (client), `apps/api` (server-side shape verification).

**Rules:**
- Contract types are derived exclusively from `@ofs/types` — no inline type definitions
- Breaking contract changes require a version increment in the endpoint path (`/v2/...`)
- The typed client never makes direct database calls and carries no secrets

---

### @ofs/logger

**Owner:** Infrastructure Agent  
**Reviewer:** Backend Agent  
**Quality Gate:** Infrastructure Agent

**Contents:**
- Structured logging interface (wraps Pino in production, console in development)
- Log level hierarchy: `debug`, `info`, `warn`, `error`, `fatal`
- Tenant context injection: every log line emitted within a request context automatically includes `tenantId` and `requestId`
- Redaction configuration: PII fields, token fields, and secret fields are stripped before any log is written

**Consumers:** `apps/api`, `apps/worker`, `packages/audit`.

**Rules:**
- No `console.log` anywhere in the codebase — all logging goes through this package
- Log format is JSON in all environments; human-readable pretty-print is a development-only flag
- Sensitive fields are never logged: passwords, tokens, national IDs, bank account numbers

---

### @ofs/audit

**Owner:** Audit Agent  
**Reviewer:** Backend Agent  
**Quality Gate:** Audit Agent

**Contents:**
- `AuditEmitter`: the service that writes `AuditLog` rows via `@ofs/database`
- Decorator and interceptor for NestJS to auto-emit audit events on annotated service methods
- Audit context builder: assembles `actorId`, `tenantId`, `ipAddress`, `userAgent`, `resourceType`, `resourceId`, `diff` from the current request context
- Diff utilities: computes before/after JSON diff for mutation audit events

**Consumers:** `apps/api`, `apps/worker`.

**Rules:**
- Every state-changing operation on any domain entity emits an audit event — no exceptions
- Audit writes go to the OLTP primary and are never batched or deferred; they are part of the same transaction as the mutation
- The `diff` field stores only changed fields, not the full entity — reduces storage and exposes only what changed

---

### @ofs/config

**Owner:** Infrastructure Agent  
**Reviewer:** All Agents  
**Quality Gate:** Infrastructure Agent

**Contents:**
- Base `tsconfig.json` extended by all apps and packages
- ESLint flat config base extended by all apps and packages
- Prettier configuration
- Vitest shared setup
- Import sort order rules (enforcing `@ofs/*` imports are grouped after external deps)

**Consumers:** All apps and packages (dev dependency only; zero runtime footprint).

---

## 5. Frontend Architecture Structure

### App Router Layout Strategy

`apps/web` uses the Next.js App Router exclusively. Pages Router is not used. The folder structure under `app/` maps to route segments and layout nesting.

```
apps/web/
├── app/
│   ├── [locale]/                    # Locale segment (ar, en)
│   │   ├── layout.tsx               # Root RTL/LTR provider, Rubik font, theme
│   │   ├── (auth)/                  # Auth group: login, register, reset
│   │   │   ├── login/
│   │   │   └── reset-password/
│   │   └── (dashboard)/             # Authenticated app shell
│   │       ├── layout.tsx           # Sidebar, topbar, tenant context
│   │       ├── dashboard/
│   │       ├── crm/
│   │       ├── customers/
│   │       ├── orders/
│   │       ├── inventory/
│   │       ├── purchasing/
│   │       ├── accounting/
│   │       ├── hr/
│   │       ├── expenses/
│   │       ├── settings/
│   │       └── reports/
├── components/
│   ├── ui/                          # Local wrappers around @ofs/ui primitives
│   ├── forms/                       # Domain-specific form compositions
│   ├── tables/                      # Domain-specific data table compositions
│   └── layouts/                     # Page-level layout compositions
├── lib/
│   ├── api/                         # Typed API client instance (from @ofs/api-contracts)
│   ├── auth/                        # Supabase Auth client helpers
│   ├── i18n/                        # next-intl configuration, Arabic/English messages
│   └── hooks/                       # Shared React hooks
├── public/
│   └── fonts/                       # Rubik font files (self-hosted)
└── middleware.ts                    # Locale detection, auth redirect, tenant resolution
```

### Locale and RTL Strategy

- The `[locale]` segment supports `ar` (default) and `en`. Additional locales are additive.
- `app/[locale]/layout.tsx` sets `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>`.
- All CSS uses logical properties (`margin-inline-start`, `padding-inline-end`) — no `left`/`right` properties in component styles.
- `next-intl` handles all string translations. Message files live in `apps/web/messages/`.
- The `@ofs/ui` RTL context provider is mounted at the root layout and consumed by all design system components.

### Server vs Client Component Strategy

| Pattern | When to use |
|---|---|
| React Server Component (default) | All data-fetching pages, static layouts, non-interactive displays |
| Client Component (`"use client"`) | Forms, interactive state, real-time updates, browser APIs |
| Server Action | Form mutations, simple write operations from RSC pages |
| Route Handler | Webhook receivers, file upload endpoints, OAuth callbacks |

The rule: **push interactivity to the leaves**. Top-level page components are server components. Client components are small, focused, and mounted at the bottom of the component tree.

### Data Fetching Strategy

- Server components fetch data by calling the `apps/api` backend via the typed `@ofs/api-contracts` client using the internal service URL (not the public URL).
- Client components use SWR for data that requires real-time updates or optimistic mutations.
- No raw `fetch` calls with hardcoded URL strings anywhere in the frontend — all API calls go through the typed client.
- Pagination follows the cursor pattern for infinite scroll lists and the offset pattern for paginated tables.

### Feature Module Boundary

Each domain section under `(dashboard)/` is self-contained:

```
orders/
├── page.tsx                  # List page (RSC)
├── [id]/
│   ├── page.tsx              # Detail page (RSC)
│   └── edit/
│       └── page.tsx          # Edit page (RSC + client form)
├── _components/              # Private components for this route only
├── _actions/                 # Server actions for this route only
└── _hooks/                   # Client hooks for this route only
```

Underscore-prefixed folders are route-private and cannot be imported by other domain folders. Cross-domain shared components go to `components/`.

### Dynamic Status and Workflow Rendering

Status badges, workflow step indicators, and action buttons are **never hardcoded per domain**. They accept a configuration object:

- `status`: the current value
- `statusConfig`: a map of value → `{ label, colour, allowedTransitions }`
- `onTransition`: callback when the user triggers a transition

The configuration is fetched from the backend at runtime per tenant. No frontend code contains a `switch` or `if` statement that branches on a specific status string value.

---

## 6. Backend Architecture Structure

### NestJS Module Organisation

`apps/api` is organised as a NestJS application with strict module boundaries. Each domain from the Prisma schema blueprint maps to one NestJS feature module.

```
apps/api/
├── src/
│   ├── main.ts                       # Bootstrap: port, global pipes, guards, interceptors
│   ├── app.module.ts                 # Root module: imports all feature modules
│   │
│   ├── core/                         # Cross-cutting infrastructure modules
│   │   ├── auth/                     # Supabase JWT verification, session extraction
│   │   ├── tenant/                   # Tenant resolution middleware, TenantContext service
│   │   ├── database/                 # Prisma service wrappers (db + dbRead)
│   │   ├── audit/                    # AuditInterceptor, AuditModule (wraps @ofs/audit)
│   │   ├── logger/                   # NestJS Logger adapter over @ofs/logger
│   │   ├── config/                   # ConfigModule with environment schema validation
│   │   ├── guards/                   # AuthGuard, TenantGuard, PermissionGuard
│   │   ├── interceptors/             # ResponseTransformInterceptor, AuditInterceptor
│   │   ├── filters/                  # GlobalExceptionFilter
│   │   └── pipes/                    # ZodValidationPipe using @ofs/validation schemas
│   │
│   ├── modules/                      # Domain feature modules
│   │   ├── platform/                 # Plans, PlanFeatures, TenantSettings
│   │   ├── identity/                 # Users, Roles, Permissions, Sessions
│   │   ├── crm/                      # Leads, Activities, Pipelines, Deals
│   │   ├── customers/                # Customers, Contacts, Addresses, Tags
│   │   ├── orders/                   # Orders, Lines, Shipments, Payments
│   │   ├── products/                 # Products, Variants, Categories, PriceLists
│   │   ├── purchasing/               # Suppliers, PurchaseOrders, Receipts
│   │   ├── inventory/                # Warehouses, Locations, StockLevels, Movements
│   │   ├── financial/                # Invoices, TaxRates, CreditNotes
│   │   ├── accounting/               # ChartOfAccounts, JournalEntries, FiscalPeriods
│   │   ├── expenses/                 # ExpensePolicies, ExpenseReports
│   │   ├── hr/                       # Departments, Employees, Contracts, Leave
│   │   ├── notifications/            # Templates, Delivery, Preferences
│   │   ├── attachments/              # Upload handling, Attachment records
│   │   ├── import/                   # ImportJobs, ImportRows, processing
│   │   └── system/                   # AuditLogs, BackgroundJobs, OutboxEvents
│   │
│   └── workers/                      # BullMQ producer services (job enqueuers only)
│       ├── import.producer.ts
│       ├── notification.producer.ts
│       └── outbox.producer.ts
│
└── test/
    ├── unit/                         # Per-module unit tests
    ├── integration/                  # Module integration tests against real DB
    └── e2e/                          # Full HTTP request/response tests
```

### Feature Module Internal Structure

Every domain module follows an identical internal layout:

```
orders/
├── orders.module.ts              # NestJS module declaration
├── orders.controller.ts          # HTTP route handlers (thin — no logic)
├── orders.service.ts             # Business logic, transaction orchestration
├── orders.repository.ts          # Prisma queries (data access only — no logic)
├── dto/
│   ├── create-order.dto.ts       # Zod-validated input shape (from @ofs/validation)
│   ├── update-order.dto.ts
│   └── order-response.dto.ts     # Response shape (from @ofs/types)
└── orders.service.spec.ts        # Unit tests for the service
```

**Controller** — receives the HTTP request, calls the service, returns the response. No business logic.  
**Service** — owns all business rules, transaction boundaries, event emission, and audit calls.  
**Repository** — owns all Prisma queries. Returns domain entities. No business logic.

### Request Lifecycle

```
HTTP Request
  → GlobalExceptionFilter (wraps all errors into standard shape)
  → AuthGuard (verifies Supabase JWT, extracts userId)
  → TenantGuard (resolves tenantId from subdomain/header, injects TenantContext)
  → PermissionGuard (evaluates user's roles and permissions for the endpoint)
  → ZodValidationPipe (parses and validates request body via @ofs/validation)
  → Controller method
  → Service method
  → Repository (Prisma query with tenantId scope enforced)
  → AuditInterceptor (emits audit event on mutation endpoints)
  → ResponseTransformInterceptor (wraps response in standard envelope)
  → HTTP Response
```

Every step in this pipeline is applied globally. Individual controllers opt out of specific guards only via explicit decorator overrides (`@Public()`, `@SkipAudit()`), and such overrides require a code review justification comment.

### Tenant Isolation Enforcement

- `TenantContext` is an injectable request-scoped service. It carries `tenantId` for the lifetime of the request.
- All repository methods receive `tenantId` as a required parameter — not an optional one.
- The `TenantGuard` sets `TenantContext` before any controller method executes. A request with no resolvable tenant is rejected with `403` before reaching the controller.
- Cross-tenant data access is architecturally impossible: repository methods only ever query `WHERE tenant_id = :tenantId`.

### Dynamic Workflow Engine

Business workflows (order approval, leave approval, purchase order lifecycle, expense report review) are not implemented as hardcoded state machines. Each workflow is described by a configuration record stored in the database:

- Allowed transitions per status are fetched at runtime
- Permission requirements per transition are evaluated against the current user's roles
- Transition hooks (audit events, notifications, downstream effects) are registered by the domain service and invoked generically by the workflow engine

The `WorkflowService` in `core/` is the single entry point for all status transitions. No domain service directly mutates a status field — it calls `WorkflowService.transition(entity, targetStatus, context)`.

### API Response Envelope

All API responses follow a consistent shape defined in `@ofs/types`:

```
{
  success: boolean,
  data: T | null,
  error: { code, message, details } | null,
  meta: { requestId, timestamp, pagination? } | null
}
```

`ResponseTransformInterceptor` wraps all successful responses in this envelope automatically. Error responses are produced by `GlobalExceptionFilter` in the same shape.

### Background Job Interface

`apps/api` never executes long-running work synchronously. It enqueues jobs via BullMQ producer services in `src/workers/`. The worker application (`apps/worker`) defines the consumer counterparts. Producers and consumers share the same job payload types via `@ofs/types`.

---

## 7. Database Layer Structure

### Package Responsibility

`@ofs/database` is the single point of contact between application code and PostgreSQL. No application or package constructs a Prisma client independently. The package exports two pre-configured client instances and the full Prisma generated type surface.

**Responsible Agent:** Database Agent  
**Reviewing Agent:** Backend Agent  
**Quality Gate Owner:** Schema Agent

---

### Internal Layout

```
packages/database/
├── prisma/
│   ├── schema.prisma             # Canonical Prisma schema (all 24 domain sections)
│   ├── migrations/               # Sequential migration files managed by Prisma Migrate
│   │   ├── 20240101000000_init/
│   │   └── ...
│   └── seed/
│       ├── index.ts              # Seed entry point — calls domain seeders in order
│       ├── platform.seed.ts      # Plans, features, default tenant
│       ├── identity.seed.ts      # Roles, permissions, admin user
│       └── reference.seed.ts     # Tax rates, account types, leave types
├── src/
│   ├── client.ts                 # Exports: db (OLTP primary), dbRead (read replica)
│   ├── transaction.ts            # Transaction helper utilities
│   └── index.ts                  # Public surface: clients + all Prisma generated types
└── package.json
```

---

### Client Strategy

Two Prisma client instances are exported and consumed by different call sites:

| Instance | Connection | Used for |
|---|---|---|
| `db` | `DATABASE_URL` (primary) | All mutations, latency-sensitive reads, transactional reads |
| `dbRead` | `DATABASE_READ_URL` (read replica) | Reporting queries, aggregations, exports, dashboard counts |

**Rule:** Repository methods that read for a mutation (e.g. `findById` before `update`) use `db`. Repository methods called from reporting or list endpoints use `dbRead`. The choice is explicit — no automatic routing.

Both clients are singleton instances initialised once at process start. They are never instantiated inside a request handler or service method.

---

### Connection Pooling via Supabase

Supabase provides PgBouncer as the connection pooler. The application connects to PgBouncer, not directly to PostgreSQL.

- `DATABASE_URL` points to the PgBouncer transaction-mode endpoint (port `6543`)
- `DATABASE_READ_URL` points to the Supabase read-replica PgBouncer endpoint
- Prisma's `directUrl` is set to the direct PostgreSQL URL (port `5432`) for migration execution only — migrations bypass PgBouncer

Connection pool sizing is configured at the Supabase project level, not in Prisma schema. Prisma's `connection_limit` parameter in the datasource URL is set to `1` per serverless function instance to prevent pool exhaustion.

---

### Migration Strategy

| Rule | Detail |
|---|---|
| Migration tool | Prisma Migrate (development) + `prisma migrate deploy` (production) |
| Migration authorship | Every schema change generates a migration file via `prisma migrate dev` — no manual SQL edits to migration files |
| Post-migration SQL | Materialised views, full-text search indexes, partition definitions, and trigger functions are applied via separate raw SQL files in `prisma/migrations/<timestamp>_extras/` run by a migration script after `prisma migrate deploy` |
| Rollback policy | Prisma Migrate does not support automatic rollback. Each migration is designed to be forward-compatible; rollback requires a new forward migration |
| Zero-downtime changes | Additive changes (new columns, new tables) are deployed before application code that uses them. Destructive changes (column removal) are deployed after all application code referencing the column is removed |
| Migration CI gate | CI runs `prisma migrate diff` to confirm no schema drift between `schema.prisma` and the migration history |

---

### Transaction Pattern

All multi-step mutations that touch more than one table use `db.$transaction()`. The pattern applied across all domain services:

- Read the current state within the transaction to prevent race conditions
- Apply all writes within the same transaction
- Emit the `AuditLog` write as the final operation within the transaction — if the audit write fails, the entire transaction rolls back
- Enqueue the `OutboxEvent` write within the same transaction — the outbox relay guarantees at-least-once delivery to external systems

Nested transactions are not used. Long-running transactions are prohibited — if a business operation requires more than five table writes, it is decomposed into a job-queue workflow.

---

### Seed Strategy

Seeds are environment-aware and idempotent. Running the seed against a database that already contains seed data does not create duplicates.

- Seeds use `upsert` with the natural unique key of each entity
- Seed data follows the same `cuid()` ID convention as production data — no integer seed IDs
- The default tenant created by the seed is `tenantId = 'ofs_default_tenant'` — a stable ID used by local development and integration tests
- Reference data (tax rates, account types, leave types, notification templates) is always seeded and treated as platform-managed data

---

### Prisma Schema Organisation

The schema file is the output of the Prisma Schema Blueprint (§1–26 of `PRISMA_SCHEMA_BLUEPRINT.md`). It is not split across multiple files — Prisma does not support multi-file schemas without a preview feature, and the single-file approach is the stable default.

Sections within `schema.prisma` are delimited by comments matching the blueprint section numbers. The order of model definitions follows the section order: Platform → Identity → System → CRM → Customer → Orders → Import → Financial → Accounting → Product → Purchasing → Inventory → Expenses → HR → Notifications → Attachments.

---

## 8. Shared Types Strategy

### Package Responsibility

`@ofs/types` is the lingua franca of the monorepo. Every TypeScript type that crosses a package boundary — whether between frontend and backend, between a service and a repository, or between a producer and a consumer — is defined here.

**Responsible Agent:** Types Agent  
**Reviewing Agent:** Backend Agent, Frontend Agent  
**Quality Gate Owner:** Types Agent

---

### Internal Layout

```
packages/types/
├── src/
│   ├── entities/                 # Domain entity interfaces (one file per domain section)
│   │   ├── platform.types.ts
│   │   ├── identity.types.ts
│   │   ├── crm.types.ts
│   │   ├── orders.types.ts
│   │   ├── products.types.ts
│   │   ├── purchasing.types.ts
│   │   ├── inventory.types.ts
│   │   ├── financial.types.ts
│   │   ├── accounting.types.ts
│   │   ├── expenses.types.ts
│   │   ├── hr.types.ts
│   │   ├── notifications.types.ts
│   │   └── attachments.types.ts
│   ├── dto/                      # Request and response DTOs
│   │   ├── common.dto.ts         # Pagination, sort, filter, envelope
│   │   └── <domain>.dto.ts       # Per-domain request/response shapes
│   ├── enums/                    # All application enums with display metadata
│   │   └── index.ts
│   ├── utility/                  # Utility and helper types
│   │   └── index.ts
│   └── index.ts                  # Re-exports everything
└── package.json
```

---

### Entity Interface Convention

Entity interfaces mirror the Prisma schema structure but are framework-agnostic. They describe the data shape the application works with after any database-level transformations.

| Rule | Detail |
|---|---|
| Name pattern | `I<ModelName>` — e.g. `IOrder`, `IEmployee`, `ILeaveRequest` |
| Money fields | Typed as `bigint` matching Prisma's `BigInt` mapping |
| Date fields | Typed as `Date` for `DateTime`; `string` in `YYYY-MM-DD` format for `@db.Date` fields |
| Nullable fields | Typed as `T \| null` — never `T \| undefined` for database-backed nullables |
| Soft delete fields | All soft-deletable entities include `deletedAt: Date \| null` and `deletedById: string \| null` |
| Audit fields | All audited entities include the `AuditedEntity` utility type intersection |

---

### Utility Types

A set of generic utility types eliminates repetition across the entity and DTO files:

| Type | Purpose |
|---|---|
| `TenantScoped<T>` | Intersection adding `tenantId: string` — applied to all tenant-owned entities |
| `AuditedEntity` | Intersection adding `createdAt`, `updatedAt`, `createdById`, `updatedById` |
| `SoftDeletable` | Intersection adding `deletedAt`, `deletedById` |
| `Paginated<T>` | Wraps `T[]` with `total`, `page`, `pageSize`, `hasNext`, `hasPrevious` |
| `CursorPaginated<T>` | Wraps `T[]` with `nextCursor`, `previousCursor`, `hasMore` |
| `ApiResponse<T>` | Standard envelope: `success`, `data`, `error`, `meta` |
| `StatusConfig<TStatus>` | Maps status enum values to `{ label, labelAr, colour, allowedTransitions }` |

---

### Enum Extension Pattern

Prisma generates plain TypeScript enums. `@ofs/types` re-exports each Prisma enum extended with display metadata that the UI needs but the database does not store:

Each enum value maps to a `StatusConfig` entry containing:
- `label` — English display string
- `labelAr` — Arabic display string (the primary label, Arabic-first)
- `colour` — design token key from the `@ofs/ui` green theme palette
- `allowedTransitions` — array of enum values the workflow engine permits from this state

This configuration object is the only place in the codebase where a specific status value is named alongside its display properties. Application and UI code reads from this map — they never branch on raw enum strings.

---

### DTO Convention

Request DTOs and response DTOs are separate types even when their shapes are similar. This separation prevents accidental exposure of internal fields in API responses and allows the request shape to evolve independently of the response shape.

| Pattern | Convention |
|---|---|
| Create request | `Create<Entity>Dto` — e.g. `CreateOrderDto` |
| Update request | `Update<Entity>Dto` — Partial create with `id` omitted (id comes from the URL) |
| Response | `<Entity>ResponseDto` — flattened, safe, display-ready shape |
| List response | `<Entity>ListResponseDto` — array of response DTOs inside a `Paginated<T>` wrapper |
| Filter params | `<Entity>FilterParams` — query string shape for list endpoints |

All DTO types in `@ofs/types` are plain TypeScript interfaces. The corresponding Zod schemas that validate runtime values are defined in `@ofs/validation` and reference the DTO types via `z.infer`.

---

### Versioning Policy

Types are versioned implicitly with the monorepo. Because all apps and packages share the same version of `@ofs/types`, there is no independent versioning of this package. Breaking type changes are made atomically — the type change, the backend change, and the frontend change ship in the same commit.

---

## 9. Shared Utilities Strategy

### Package Responsibility

`@ofs/utils` provides pure, side-effect-free utility functions used across the monorepo. It has no framework dependencies, no database access, and no network I/O. It is safe to import in any context: server, client, worker, or test.

**Responsible Agent:** Utilities Agent  
**Reviewing Agent:** Frontend Agent, Backend Agent  
**Quality Gate Owner:** Utilities Agent

---

### Internal Layout

```
packages/utils/
├── src/
│   ├── date/
│   │   ├── format.ts             # DD MMM YYYY formatting and variants
│   │   ├── parse.ts              # String → Date parsing with locale support
│   │   ├── fiscal.ts             # Fiscal year and period resolution utilities
│   │   └── index.ts
│   ├── money/
│   │   ├── arithmetic.ts         # BigInt safe-math: add, subtract, multiply, divide
│   │   ├── format.ts             # Minor-unit → display string with locale and currency
│   │   └── index.ts
│   ├── string/
│   │   ├── slug.ts               # URL slug generation (Arabic-aware)
│   │   ├── truncate.ts           # String truncation with RTL ellipsis placement
│   │   ├── transliterate.ts      # Arabic ↔ Latin transliteration
│   │   └── index.ts
│   ├── rtl/
│   │   ├── direction.ts          # Text direction detection and resolution
│   │   ├── bidi.ts               # Bidirectional character utilities
│   │   └── index.ts
│   ├── pagination/
│   │   ├── cursor.ts             # Cursor encode/decode helpers
│   │   ├── offset.ts             # Offset/limit calculation helpers
│   │   └── index.ts
│   ├── tenant/
│   │   ├── context.ts            # Tenant ID extraction from request context shapes
│   │   └── index.ts
│   └── index.ts
└── package.json
```

---

### Date Utilities

All date output across the entire platform uses `DD MMM YYYY` as the canonical display format. No component, service, or template produces a date in any other format without an explicit override.

| Function | Behaviour |
|---|---|
| `formatDate(date, locale?)` | Returns `DD MMM YYYY` string. Month abbreviations are Arabic by default (`يناير`, `فبراير`, …); English when `locale = 'en'` |
| `formatDateTime(date, locale?)` | Returns `DD MMM YYYY HH:mm` in 24-hour format |
| `parseDate(str)` | Parses `DD MMM YYYY` strings in both locales; returns `Date` |
| `toCalendarString(date)` | Returns `YYYY-MM-DD` for database `@db.Date` fields |
| `fiscalPeriodOf(date, fiscalYearStart)` | Returns the fiscal period label for a given calendar date |
| `isWithinFiscalYear(date, year)` | Boolean check for fiscal year membership |

The underlying date library is `date-fns`. `dayjs` and `moment` are forbidden in the monorepo.

---

### Money Utilities

All monetary values are stored and computed as `BigInt` in minor units. Utilities in this section operate exclusively on `BigInt` — no `number` arguments are accepted for monetary inputs.

| Function | Behaviour |
|---|---|
| `addMoney(a, b)` | `BigInt` addition with overflow guard |
| `subtractMoney(a, b)` | `BigInt` subtraction; throws if result is negative and `allowNegative` is false |
| `multiplyMoney(amount, factor)` | Multiplies a `BigInt` minor-unit amount by a `Decimal` factor; rounds using banker's rounding |
| `divideMoney(amount, divisor)` | Integer division with remainder allocation (used for tax splitting across lines) |
| `formatMoney(amount, currency, locale?)` | Converts minor units to display string with currency symbol; Arabic locale places currency symbol on the right |
| `parseMoney(str, currency)` | Parses a display string back to `BigInt` minor units |
| `percentOf(amount, rate)` | Applies a `Decimal(10,4)` rate to a `BigInt` amount; returns `BigInt` |

**Rule:** `formatMoney` is the only function permitted to produce a human-readable monetary string. No inline template literals like `${amount / 100}` are allowed anywhere in the codebase.

---

### RTL Utilities

| Function | Behaviour |
|---|---|
| `detectDirection(str)` | Returns `'rtl'` or `'ltr'` based on the dominant script of the string |
| `resolveDirection(locale)` | Returns `'rtl'` for `ar` and any RTL locale; `'ltr'` otherwise |
| `wrapBidi(str, direction)` | Wraps a string in Unicode bidi isolation marks for safe embedding in mixed-direction contexts |
| `logicalToPhysical(property, direction)` | Maps CSS logical properties to physical equivalents for environments that do not support logical properties |

---

### Pagination Utilities

| Function | Behaviour |
|---|---|
| `encodeCursor(id, field)` | Base64-encodes a cursor from a record ID and sort field value |
| `decodeCursor(cursor)` | Decodes and validates a cursor string; throws `InvalidCursorError` on tampered input |
| `offsetFromPage(page, pageSize)` | Converts 1-based page number and page size to a Prisma `skip` value |
| `buildPaginatedResponse(items, total, params)` | Assembles a `Paginated<T>` response object from a Prisma result set |

---

## 10. Shared Validation Strategy

### Package Responsibility

`@ofs/validation` owns all runtime validation logic. It is the boundary between untrusted external input and trusted application data. Every API request body, every form submission, and every job payload is validated through a Zod schema defined in this package before any business logic executes.

**Responsible Agent:** Validation Agent  
**Reviewing Agent:** Backend Agent, Frontend Agent  
**Quality Gate Owner:** Validation Agent

---

### Internal Layout

```
packages/validation/
├── src/
│   ├── schemas/                   # Domain Zod schemas (one file per domain)
│   │   ├── platform.schema.ts
│   │   ├── identity.schema.ts
│   │   ├── crm.schema.ts
│   │   ├── customers.schema.ts
│   │   ├── orders.schema.ts
│   │   ├── products.schema.ts
│   │   ├── purchasing.schema.ts
│   │   ├── inventory.schema.ts
│   │   ├── financial.schema.ts
│   │   ├── accounting.schema.ts
│   │   ├── expenses.schema.ts
│   │   ├── hr.schema.ts
│   │   ├── notifications.schema.ts
│   │   └── attachments.schema.ts
│   ├── primitives/                # Reusable Zod primitive definitions
│   │   ├── money.primitive.ts     # BigInt coercion, min-zero guard
│   │   ├── date.primitive.ts      # DD MMM YYYY parse → Date coercion
│   │   ├── cuid.primitive.ts      # CUID format validation
│   │   ├── currency.primitive.ts  # ISO 4217 three-character code
│   │   ├── locale.primitive.ts    # Supported locale enum
│   │   └── index.ts
│   ├── factories/                 # Schema factories for dynamic tenant rules
│   │   ├── workflow.factory.ts    # Builds transition validation schemas at runtime
│   │   └── custom-field.factory.ts # Builds schemas for tenant-configured custom fields
│   ├── refinements/               # Cross-field and format refinements
│   │   ├── date-range.ts          # start ≤ end checks
│   │   ├── iban.ts                # IBAN format and checksum
│   │   ├── vat-number.ts          # Country-aware VAT number format
│   │   └── phone.ts               # E.164 normalisation
│   ├── messages/                  # Locale-aware error message maps
│   │   ├── ar.messages.ts         # Arabic error strings (default)
│   │   └── en.messages.ts         # English error strings
│   └── index.ts
└── package.json
```

---

### Schema Design Rules

**One schema per DTO.** Every `Create<Entity>Dto` and `Update<Entity>Dto` in `@ofs/types` has a corresponding Zod schema in this package. The schema is the runtime contract; the TypeScript type is inferred from it via `z.infer`.

**No hardcoded enum lists.** Status enums are imported from `@ofs/types`. Permitted transition targets are not hardcoded in validation schemas — they are validated by the workflow engine at the service layer after basic shape validation passes.

**Primitives over inline rules.** All monetary fields use the `moneyPrimitive` (BigInt coercion with non-negative guard). All date display inputs use the `datePrimitive` (DD MMM YYYY → Date coercion). All ID fields use the `cuidPrimitive`. Inline `.min(0)` on money fields and inline date regex on date fields are forbidden.

**Locale-aware error messages.** The Zod `errorMap` is configured globally in this package to resolve error messages from the locale-specific message map. Arabic error messages are the default. The locale is passed to the validation pipe by the request context.

---

### Primitive Definitions

| Primitive | Accepts | Produces | Rules |
|---|---|---|---|
| `moneyPrimitive` | `bigint` or numeric string | `bigint` | Rejects negative values unless `allowNegative` option is set |
| `datePrimitive` | `string` in DD MMM YYYY | `Date` | Rejects unparseable strings; validates day/month/year ranges |
| `cuidPrimitive` | `string` | `string` | Validates CUID format regex |
| `currencyPrimitive` | `string` | `string` | Must be a known ISO 4217 code from the supported currency list |
| `localePrimitive` | `string` | `'ar' \| 'en'` | Restricts to the supported locale set |

---

### Schema Factories

Some validation rules are tenant-configured and cannot be hardcoded at build time. Schema factories produce Zod schemas from a runtime configuration object:

**`workflowTransitionSchema(config)`** — produces a schema that validates a status transition request. `config` contains the list of allowed target statuses for the current user's role and the current entity status. The schema rejects any target status not in the allowed list.

**`customFieldSchema(fieldDefinitions)`** — produces a schema for the `metadata` JSON field when a tenant has configured custom fields. `fieldDefinitions` is an array of `{ key, type, required, options }` records. The factory assembles a Zod object schema that validates only the keys declared by the tenant.

---

### Backend Integration

In `apps/api`, the `ZodValidationPipe` is registered globally. It intercepts every incoming request body, resolves the matching schema from `@ofs/validation` by endpoint route and HTTP method, and calls `schema.parseAsync(body)`. Validation errors are caught by `GlobalExceptionFilter` and returned in the standard error envelope with field-level detail.

### Frontend Integration

In `apps/web`, form components use React Hook Form with the `zodResolver` adapter. The resolver references the same schema from `@ofs/validation` that the backend validates against. The same error messages and the same field rules apply in both layers — no duplication, no drift.

---

## 11. Design System Package Strategy

### Package Responsibility

`@ofs/ui` is the visual identity of the OFS platform. It encodes the non-negotiable UI constraints — Arabic-first, RTL-first, Rubik font, professional green theme — into reusable components that `apps/web` consumes. No component in `apps/web` implements its own styling primitives; it either uses a component from `@ofs/ui` or composes from it.

**Responsible Agent:** Frontend Agent  
**Reviewing Agent:** Design Agent  
**Quality Gate Owner:** Frontend Agent

---

### Internal Layout

```
packages/ui/
├── src/
│   ├── tokens/                    # Design token definitions
│   │   ├── colours.ts             # Green theme colour scale + semantic aliases
│   │   ├── typography.ts          # Rubik font definition, scale, weights
│   │   ├── spacing.ts             # Spacing scale (4px base unit)
│   │   ├── radius.ts              # Border radius tokens
│   │   └── index.ts
│   ├── providers/
│   │   ├── rtl-provider.tsx       # RTL/LTR context + CSS logical property enforcement
│   │   ├── theme-provider.tsx     # CSS variable injection for token values
│   │   └── index.ts
│   ├── primitives/                # Headless Radix UI wrappers
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   ├── tabs.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   └── index.ts
│   ├── components/                # Composed, styled components
│   │   ├── status-badge.tsx       # Dynamic status badge (config-driven)
│   │   ├── data-table.tsx         # Sortable, paginated table
│   │   ├── date-display.tsx       # DD MMM YYYY formatted date
│   │   ├── money-display.tsx      # Minor-unit → formatted currency
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── toast.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── pagination.tsx
│   │   └── index.ts
│   ├── layout/                    # Page-shell layout components
│   │   ├── page-shell.tsx         # Full-page authenticated layout
│   │   ├── sidebar.tsx            # RTL-aware collapsible sidebar
│   │   ├── topbar.tsx             # Tenant name, user menu, locale switcher
│   │   ├── content-area.tsx       # Main content wrapper
│   │   └── index.ts
│   ├── forms/                     # Form scaffold components
│   │   ├── form-field.tsx         # Label + input + error message wrapper
│   │   ├── form-section.tsx       # Grouped form fields with heading
│   │   └── index.ts
│   └── index.ts
└── package.json
```

---

### Rubik Font

Rubik is the sole typeface across the entire platform. It is self-hosted under `apps/web/public/fonts/` and declared in the root CSS layer. The font definition in `packages/ui/src/tokens/typography.ts` exports the CSS variable name (`--font-rubik`) that all components reference.

Rubik is selected for its full Arabic and Latin script support, its legibility at small sizes in RTL layouts, and its professional character that fits the green theme.

- **Weights loaded:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Subsets:** Arabic, Latin, Latin-Extended
- **Format:** WOFF2 only (modern browser targets)
- **Display strategy:** `font-display: swap` — text is visible immediately with the fallback font while Rubik loads

No other typeface is introduced without a design decision documented in this file.

---

### Professional Green Theme

The colour system is built around a professional green as the primary brand colour. The palette is defined as CSS custom properties injected by `ThemeProvider` at the document root.

| Token group | Purpose |
|---|---|
| `--colour-primary-*` (50→950) | Green scale: backgrounds, borders, fills, text |
| `--colour-surface-*` | Page background, card background, sidebar background |
| `--colour-text-*` | Primary text, secondary text, disabled, inverse |
| `--colour-border-*` | Dividers, input borders, focus rings |
| `--colour-status-*` | Semantic colours: success (green), warning (amber), error (red), info (blue), neutral (grey) |
| `--colour-overlay-*` | Modal backdrops, tooltips |

Status colours (`--colour-status-*`) are the palette used by `StatusBadge`. They are semantic tokens, not hardcoded hex values. The mapping from a status enum value to a status colour token is defined in `@ofs/types` `StatusConfig` entries.

---

### RTL-First Component Rules

Every component in `@ofs/ui` is built RTL-first:

| Rule | Implementation |
|---|---|
| No `left`/`right` CSS properties | All directional CSS uses logical properties: `margin-inline-start`, `padding-inline-end`, `border-inline-start`, `inset-inline-*` |
| Icon placement | Icons that flank text are placed using `gap` in a flex row; they flip automatically in RTL via logical placement |
| Text alignment | Default is `start` (maps to right in RTL); `end` maps to left. Never use `text-align: right` directly |
| Animations | Slide animations reference `translateX` with a sign that respects the `dir` attribute |
| Sidebar | Opens from the right in RTL (default); from the left in LTR |
| Table columns | Column order in RTL starts from the right; the `DataTable` component reads `dir` from the nearest ancestor |

The `RtlProvider` context exposes `direction: 'rtl' | 'ltr'` and `isRtl: boolean` to all descendant components.

---

### Dynamic Status Badge

`StatusBadge` is the primary mechanism for rendering any status value in the UI. It accepts:

- `status` — the raw enum value string
- `config` — a `StatusConfig` map (from `@ofs/types`) keyed by enum value
- `size` — `sm | md | lg`
- `variant` — `filled | outlined | subtle`

The badge reads `config[status].labelAr` (or `config[status].label` in English mode), resolves `config[status].colour` to the appropriate `--colour-status-*` token, and renders the pill. No `switch` statement. No `if status === 'APPROVED'`. Any new status value added to an enum is automatically displayable once a `StatusConfig` entry is added to `@ofs/types`.

---

### Component Governance

| Rule | Detail |
|---|---|
| No business logic in components | Components are pure display. They receive data as props and call callbacks — they never fetch, mutate, or evaluate workflow rules |
| No hardcoded strings | All visible text comes from props or from the i18n message system via `next-intl` |
| Accessibility baseline | Every interactive component meets WCAG 2.1 AA; Radix primitives provide the ARIA foundation |
| Dark mode | Not in scope for the initial release. The token system is designed to support it additively |

---

## 12. API Contract Strategy

### Package Responsibility

`@ofs/api-contracts` defines the typed interface between `apps/web` and `apps/api`. It is the boundary where the frontend's expectations of the backend are made explicit and machine-checked. Any mismatch between what the frontend sends and what the backend expects surfaces as a TypeScript error at build time, not a runtime failure in production.

**Responsible Agent:** Backend Agent  
**Reviewing Agent:** Frontend Agent  
**Quality Gate Owner:** Types Agent

---

### Internal Layout

```
packages/api-contracts/
├── src/
│   ├── endpoints/                 # Typed endpoint definitions (one file per domain)
│   │   ├── platform.endpoints.ts
│   │   ├── identity.endpoints.ts
│   │   ├── crm.endpoints.ts
│   │   ├── customers.endpoints.ts
│   │   ├── orders.endpoints.ts
│   │   ├── products.endpoints.ts
│   │   ├── purchasing.endpoints.ts
│   │   ├── inventory.endpoints.ts
│   │   ├── financial.endpoints.ts
│   │   ├── accounting.endpoints.ts
│   │   ├── expenses.endpoints.ts
│   │   ├── hr.endpoints.ts
│   │   ├── notifications.endpoints.ts
│   │   └── attachments.endpoints.ts
│   ├── client/
│   │   ├── factory.ts             # Typed API client factory
│   │   ├── middleware.ts          # Auth token injection, tenant header injection
│   │   └── index.ts
│   ├── webhooks/
│   │   └── payload.types.ts       # Webhook event payload shapes
│   └── index.ts
└── package.json
```

---

### Endpoint Definition Model

Each endpoint is described by a typed contract object that specifies its method, path, request type, and response type. All types are imported from `@ofs/types` — no inline type definitions in this package.

An endpoint contract carries:

| Field | Purpose |
|---|---|
| `method` | HTTP method literal: `'GET'`, `'POST'`, `'PATCH'`, `'DELETE'` |
| `path` | Path template: `'/v1/orders/:id'` |
| `pathParams` | TypeScript type for URL parameters |
| `queryParams` | TypeScript type for query string parameters |
| `requestBody` | TypeScript type for the request body (undefined for GET/DELETE) |
| `response` | TypeScript type for the successful response body |
| `auth` | `'required'` or `'public'` |
| `tenant` | `'required'` or `'none'` |

The typed client factory reads this contract and produces a callable function that TypeScript type-checks at the call site — wrong body shape, wrong query params, or wrong response handling surface as compiler errors.

---

### Versioning Strategy

All endpoints are versioned at the path level: `/v1/`, `/v2/`, etc.

| Rule | Detail |
|---|---|
| New endpoints | Always start at `/v1/` |
| Additive changes | Adding optional request fields or optional response fields does not require a version increment |
| Breaking changes | Removing fields, changing field types, or changing the response envelope shape requires a new version path `/v2/` |
| Deprecation | A deprecated endpoint is kept alive for two release cycles before removal; its contract is marked `deprecated: true` and a `Deprecation` response header is set by the backend |
| Internal routes | Routes used only by `apps/web` server-side RSC fetching use an `/internal/` prefix and carry no external version contract obligation |

---

### Typed Client

The typed client factory in `packages/api-contracts/src/client/factory.ts` produces a client object whose method names mirror the endpoint keys. The client:

- Injects the Supabase JWT from the current session as the `Authorization: Bearer` header
- Injects the resolved `tenantId` as the `X-Tenant-ID` header
- Serialises `BigInt` fields to string before JSON serialisation (JSON.stringify does not handle BigInt natively)
- Deserialises `BigInt` string fields back to `bigint` after JSON parsing
- Deserialises date strings to `Date` objects for fields typed as `Date` in `@ofs/types`
- Throws typed `ApiError` instances on non-2xx responses, carrying the standard error envelope payload

The client instance is created once per application lifetime in `apps/web/lib/api/` and shared across all server components and client components.

---

### Webhook Payload Types

`packages/api-contracts/src/webhooks/payload.types.ts` defines the shapes of event payloads that `apps/api` delivers to external webhook subscribers. These payloads mirror the `OutboxEvent.payload` structure. Defining them here allows external integration partners to import the types if they consume the monorepo as a library, and ensures the outbox event schema never drifts from the documented webhook contract.

---

### Contract Governance

| Rule | Detail |
|---|---|
| No inline types | All types in endpoint definitions come from `@ofs/types`; no `{ id: string; name: string }` inline objects |
| No optional request fields used as discriminators | If a field's presence changes the behaviour of an endpoint, it belongs in a separate endpoint or a required discriminator field |
| Error shapes are fixed | The error envelope from `@ofs/types ApiResponse` is the only permitted error shape; no endpoint returns a custom error structure |
| All mutations return the updated entity | POST, PATCH, and DELETE endpoints always return the affected entity in the response body — no empty 204 responses for tenant-facing mutations |

---

## 13. Environment Configuration Strategy

### Philosophy

Environment configuration is centralised, validated at startup, and never accessed via raw `process.env` strings in application code. Every variable consumed by an app or package is declared in a typed configuration schema. A missing or malformed variable causes the process to exit at boot — not at runtime when a request hits the failing code path.

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Backend Agent, Frontend Agent  
**Quality Gate Owner:** Infrastructure Agent

---

### Environment File Hierarchy

| File | Committed | Purpose |
|---|---|---|
| `.env.example` | Yes | Template documenting every variable. No real values. Updated whenever a variable is added or removed |
| `.env.local` | No | Local developer overrides. Takes highest precedence in local development |
| `.env.development` | No | Shared development defaults for the team. Values are non-sensitive |
| `.env.test` | No | Overrides for the test runner environment. Points to test database and mock services |
| `.env.production` | Never | Production values are injected by Vercel and the container runtime — never stored in files |

pnpm workspace loads environment files from the repository root. Each app and the worker process inherit root-level variables and may declare app-specific overrides in their own directory.

---

### Variable Namespacing

All variables are prefixed by the system that owns them:

| Prefix | Owned by | Example |
|---|---|---|
| `DATABASE_` | Database layer | `DATABASE_URL`, `DATABASE_READ_URL` |
| `SUPABASE_` | Supabase integration | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| `NEXT_PUBLIC_` | Browser-safe frontend | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL` |
| `API_` | Backend application | `API_PORT`, `API_JWT_SECRET` |
| `WORKER_` | Worker process | `WORKER_CONCURRENCY`, `WORKER_REDIS_URL` |
| `REDIS_` | BullMQ / cache | `REDIS_URL`, `REDIS_TLS` |
| `SMTP_` | Email delivery | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| `STORAGE_` | Object storage | `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_REGION` |

`NEXT_PUBLIC_` variables are the only variables that reach the browser bundle. All secret values — service role keys, JWT secrets, SMTP credentials — are server-side only and never prefixed with `NEXT_PUBLIC_`.

---

### Configuration Validation

Each application declares a Zod schema for its required environment variables. This schema is evaluated at process startup inside the application's `ConfigModule` (NestJS) or `instrumentation.ts` (Next.js). If validation fails the process exits immediately with a descriptive error listing every missing or invalid variable.

Variables consumed by `@ofs/database` are validated by the database package's own initialisation — the package throws at import time if `DATABASE_URL` is absent.

---

### Variable Catalogue

#### apps/api

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PgBouncer transaction-mode URL (port 6543) |
| `DATABASE_READ_URL` | Yes | Read-replica PgBouncer URL |
| `DATABASE_DIRECT_URL` | Yes | Direct PostgreSQL URL for migration execution |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service-role key for server-side Supabase operations |
| `API_PORT` | No (default 3000) | HTTP listen port |
| `API_JWT_SECRET` | Yes | Secret for verifying Supabase JWTs |
| `REDIS_URL` | Yes | BullMQ queue connection |
| `SMTP_HOST` | Yes | SMTP relay hostname |
| `SMTP_PORT` | Yes | SMTP relay port |
| `SMTP_USER` | Yes | SMTP authentication user |
| `SMTP_PASS` | Yes | SMTP authentication password |
| `STORAGE_PROVIDER` | Yes | `S3 \| AZURE_BLOB \| GCS \| LOCAL` |
| `STORAGE_BUCKET` | Yes | Default storage bucket name |
| `LOG_LEVEL` | No (default `info`) | Minimum log level |

#### apps/web

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (browser-safe) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (browser-safe) |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only; used in RSC server actions |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | No (default `ar`) | Default UI locale |

#### apps/worker

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Primary database connection |
| `DATABASE_READ_URL` | Yes | Read replica connection |
| `REDIS_URL` | Yes | BullMQ consumer connection |
| `WORKER_CONCURRENCY` | No (default 5) | Concurrent job slots per queue |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | For storage and auth operations within jobs |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Yes | Email dispatch from notification jobs |
| `LOG_LEVEL` | No (default `info`) | Minimum log level |

---

### Secrets Management in Production

Production secrets are never committed to the repository and never stored in `.env` files. They are injected at deployment time:

- **Vercel** (apps/web, apps/api on serverless): Environment variables are configured in the Vercel project dashboard per environment (Preview, Production). Vercel encrypts secrets at rest.
- **Container runtime** (apps/worker): Secrets are injected as environment variables by the container orchestration platform. The worker process reads them on startup.
- **Local development**: Developers copy `.env.example` to `.env.local` and fill in values from the team password manager. `.env.local` is git-ignored.

The `SUPABASE_SERVICE_ROLE_KEY` is the highest-privilege secret in the system. It bypasses row-level security and all tenant scoping at the database level. Its use is restricted to `apps/api` server-side RSC actions and `apps/worker`. It is never exposed to the browser.

---

## 14. Feature Module Organization

### Philosophy

Each business domain in `apps/api` is a self-contained NestJS feature module. Feature modules own their routes, their business logic, their data access, and their tests. They do not reach into other modules' services — cross-module communication goes through well-defined service interfaces or through the job queue.

**Responsible Agent:** Backend Agent  
**Reviewing Agent:** Architecture Agent  
**Quality Gate Owner:** Backend Agent

---

### Module Anatomy

Every feature module follows an identical internal structure. No module invents its own pattern.

```
modules/<domain>/
├── <domain>.module.ts          # NestJS @Module decorator; declares providers and exports
├── <domain>.controller.ts      # Route handlers only; no business logic
├── <domain>.service.ts         # All business rules and transaction orchestration
├── <domain>.repository.ts      # All Prisma queries; no business logic
├── dto/
│   ├── create-<entity>.dto.ts  # Validated input shape (re-exports Zod schema type)
│   ├── update-<entity>.dto.ts
│   └── <entity>-response.dto.ts
├── events/
│   └── <entity>.events.ts      # Typed event payloads emitted by this module
└── <domain>.service.spec.ts    # Unit tests for the service layer
```

**Controller layer** receives the HTTP request, extracts validated body and path/query params, calls the service, and returns the response. Zero conditional logic lives here.

**Service layer** is the authority on business rules. It reads from the repository, applies rules, writes back via the repository, emits audit events, enqueues jobs, and publishes outbox events. A service method that spans multiple repositories uses `db.$transaction()`.

**Repository layer** owns every Prisma query. It accepts plain typed arguments and returns typed entity objects. It applies `tenantId` scoping on every query without exception. It never applies business logic — no `if`, no workflow evaluation, no status checking.

---

### Cross-Module Communication

Modules communicate with each other through two mechanisms only:

**Service injection** — a module may declare another module in its `imports` array and inject the exported service. This is permitted only when the dependency direction is clean (no circular imports). The dependency graph is: Platform → Identity → all other modules. CRM may depend on Customer. Orders may depend on Product and Inventory. No domain module depends on a higher-level domain module.

**Job queue** — when an operation in one domain triggers work in another domain and the dependency direction is wrong or the work is long-running, the triggering service enqueues a BullMQ job. The worker process executes the job independently. Example: confirming an order enqueues a stock reservation job; the order module does not call the inventory module directly.

Cross-module direct database access is forbidden. Module A's repository only queries Module A's tables.

---

### Dynamic Workflow Registration

Each feature module that owns a workflow entity (Order, PurchaseOrder, LeaveRequest, ExpenseReport, etc.) registers its workflow configuration with the central `WorkflowModule` at application boot.

The registration provides:
- The entity name (matches the `resourceType` string used in `AuditLog`)
- The status enum values and their allowed transitions
- The permission requirement per transition
- The side-effect hooks per transition (audit, notification, job enqueue)

The `WorkflowService` stores this configuration and applies it generically when `WorkflowService.transition()` is called. No business-rule branching exists outside of each module's own registration.

---

### Feature Flag Integration

Feature availability per tenant is evaluated by a `FeatureFlagService` in the Platform module. Every controller method that exposes a plan-gated feature calls `featureFlagService.assertEnabled(tenantId, 'FEATURE_KEY')` before executing. The feature key is a constant defined in `@ofs/types` — not a hardcoded string in the controller.

Disabled features return `403 Feature not available on your current plan` via `GlobalExceptionFilter`. No partial UI state is returned.

---

### Module Dependency Map

```
PlatformModule       ← no domain dependencies
IdentityModule       ← PlatformModule
SystemModule         ← IdentityModule
CrmModule            ← IdentityModule, CustomerModule
CustomerModule       ← IdentityModule
ProductModule        ← IdentityModule
OrderModule          ← CustomerModule, ProductModule, InventoryModule (via queue)
PurchasingModule     ← SupplierModule, ProductModule
InventoryModule      ← ProductModule, PurchasingModule (via queue)
FinancialModule      ← CustomerModule, OrderModule, TaxModule
AccountingModule     ← FinancialModule
ExpensesModule       ← IdentityModule, AccountingModule
HrModule             ← IdentityModule
NotificationModule   ← IdentityModule (all other modules enqueue notification jobs)
AttachmentModule     ← IdentityModule
ImportModule         ← all domain modules (via job queue only)
```

---

## 15. Testing Architecture

### Philosophy

Every layer of the system has a defined test type with a defined scope. Tests closest to the code (unit) run on every commit. Tests that touch infrastructure (integration) run on every pull request. Tests that exercise the full system (E2E) run before every production deployment.

**Responsible Agent:** QA Agent  
**Reviewing Agent:** Backend Agent, Frontend Agent  
**Quality Gate Owner:** QA Agent

---

### Test Types and Scope

| Type | Tool | Scope | When it runs |
|---|---|---|---|
| Unit | Vitest | Single service or utility function, all dependencies mocked | Every commit (pre-push hook + CI) |
| Integration | Vitest + Prisma | Service + repository + real test database, external services mocked | Every pull request in CI |
| E2E | Playwright | Full browser → Next.js → NestJS → PostgreSQL | Pre-production deployment in CI |
| Contract | Vitest | API client types match backend response shapes | Every pull request in CI |

---

### Unit Test Strategy

Unit tests target the **service layer** of each domain module. The repository is mocked using `vi.mock`. The database client is never instantiated.

Rules:
- One spec file per service file: `<domain>.service.spec.ts`
- Test file lives adjacent to the source file, not in a separate `__tests__` directory
- Every public service method has at least one happy-path test and one failure-path test
- Workflow transition tests cover every valid and every invalid transition for each status enum
- Money arithmetic utilities in `@ofs/utils` have property-based tests using `fast-check`

---

### Integration Test Strategy

Integration tests target **repository + service + real database**. A dedicated test PostgreSQL database is provisioned by the CI runner. The database is migrated to the current schema state before the test run using `prisma migrate deploy`.

Rules:
- Integration tests live in `apps/api/test/integration/`
- Each test file manages its own data setup and teardown — no shared global state
- Tests run against the `ofs_default_tenant` seed tenant created by the seed script
- The `dbRead` client is not used in integration tests — the read replica is the primary in test mode
- Supabase Auth is mocked at the `AuthGuard` level; integration tests provide a pre-signed test JWT

---

### E2E Test Strategy

E2E tests use Playwright to drive a real browser against a running instance of `apps/web` connected to a staging backend and staging database.

Rules:
- E2E tests live in `apps/web/test/e2e/`
- Tests are organised by domain: `orders.e2e.ts`, `hr.e2e.ts`, etc.
- Each test authenticates as a named test persona (admin, manager, employee) created by the staging seed
- RTL layout is tested: key journeys are run with `ar` locale and the direction is asserted via DOM `dir` attribute checks
- Date display is asserted in `DD MMM YYYY` format — tests fail if a date renders in any other format
- Visual regression snapshots are captured for status badge rendering across all status values

---

### Test Database Management

| Concern | Approach |
|---|---|
| Schema state | `prisma migrate deploy` runs at the start of each integration test CI job |
| Data isolation | Each test creates its own records under unique IDs; no test depends on another test's data |
| Teardown | Each test cleans up its own records in `afterEach`; the test database is reset fully between CI runs |
| Tenant isolation | All test data is scoped to a dedicated `tenantId = 'test_tenant'` that does not exist in production |
| Seeding | Reference data (tax rates, leave types, roles, permissions) is seeded once per CI run via the seed script |

---

### Coverage Requirements

| Layer | Minimum coverage |
|---|---|
| `packages/utils` | 95% line coverage |
| `packages/validation` | 90% line coverage |
| `apps/api` services | 85% line coverage |
| `apps/api` repositories | 70% line coverage (covered by integration tests) |
| `apps/web` components in `@ofs/ui` | 80% line coverage |

Coverage is measured by Vitest's built-in V8 provider. Coverage reports are uploaded to CI as artefacts. A pull request that drops coverage below the threshold fails the CI gate.

---

## 16. Logging Architecture

### Philosophy

Every log line in the system is structured JSON. Log lines carry enough context to reconstruct the causal chain of any event without querying the database. No `console.log`. No unstructured strings. No log lines without a `tenantId` when one is available.

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Backend Agent  
**Quality Gate Owner:** Infrastructure Agent

---

### Log Levels

| Level | When to use |
|---|---|
| `fatal` | Process is about to exit due to an unrecoverable condition |
| `error` | An operation failed and requires human attention (failed job, unhandled exception, payment failure) |
| `warn` | An operation succeeded but in a degraded or unexpected way (retry succeeded, deprecated API used, rate limit approaching) |
| `info` | Normal significant events: request received, job started, job completed, migration applied |
| `debug` | Detailed diagnostic information useful during development and incident investigation. Disabled in production by default |
| `trace` | Extremely detailed per-statement tracing. Never enabled in production |

The active log level is set by the `LOG_LEVEL` environment variable. Production default is `info`. Raising to `debug` during an incident is a supported operational procedure.

---

### Structured Log Schema

Every log line emitted by `@ofs/logger` conforms to this schema:

| Field | Type | Always present | Description |
|---|---|---|---|
| `timestamp` | ISO 8601 string | Yes | Log emission time in UTC |
| `level` | string | Yes | Log level |
| `message` | string | Yes | Human-readable description |
| `service` | string | Yes | Emitting application: `api`, `web`, `worker` |
| `requestId` | string | When in a request context | UUID generated per HTTP request |
| `tenantId` | string | When available | Tenant scope of the operation |
| `userId` | string | When available | Authenticated user |
| `module` | string | When available | NestJS module name |
| `method` | string | When available | Service method or HTTP method |
| `durationMs` | number | On completion logs | Operation duration |
| `error` | object | On error logs | `{ message, stack, code }` |
| `meta` | object | Optional | Arbitrary structured context |

---

### Request Lifecycle Logging

The `LoggingInterceptor` in `apps/api/core/` emits two log lines per HTTP request:

1. **Request received** (`info`): `requestId`, `method`, `path`, `tenantId`, `userId`, `contentLength`
2. **Request completed** (`info`) or **Request failed** (`error`): all of the above plus `statusCode`, `durationMs`

These two lines enable reconstructing every API call's timeline from the log stream alone.

---

### PII Redaction

The logger's redaction configuration strips sensitive field values before serialisation. Redacted fields are replaced with `[REDACTED]`. The redaction list:

- `password`, `passwordHash`, `currentPassword`, `newPassword`
- `token`, `accessToken`, `refreshToken`, `resetToken`
- `nationalId`, `dateOfBirth`, `taxId`
- `cardNumber`, `cvv`, `bankAccountNumber`, `iban`
- `Authorization` (HTTP header value)
- `SUPABASE_SERVICE_ROLE_KEY` (environment variable name pattern)

Redaction is applied at the logger level — not by the application code. Application code never needs to manually strip fields before logging.

---

### Log Transport

| Environment | Transport |
|---|---|
| Local development | Pretty-print to stdout via `pino-pretty` |
| CI | JSON to stdout; captured by the CI runner |
| Production (Vercel) | JSON to stdout; ingested by Vercel Log Drains → external log aggregator |
| Production (worker container) | JSON to stdout; ingested by container log driver → external log aggregator |

The external log aggregator (Datadog, Logtail, or Grafana Loki — selected at infrastructure provisioning time) receives all log streams. Dashboards and alert rules are defined on the aggregator, not in application code.

---

### Worker Job Logging

Every BullMQ job execution produces a structured log envelope:

- **Job started** (`info`): `jobId`, `jobName`, `queue`, `attempt`, `tenantId`
- **Job completed** (`info`): above plus `durationMs`, `result` summary
- **Job failed** (`error`): above plus `error`, `willRetry`, `nextAttemptAt`
- **Job exhausted** (`error`): above plus `totalAttempts`, `movedToDeadLetter`

The `jobId` is propagated through all log lines emitted during job execution, making it trivial to find all logs for a specific job run.

---

## 17. Audit Architecture

### Philosophy

Audit is not optional and not additive. Every state-changing operation on a domain entity that has business or compliance significance emits an `AuditLog` record in the same database transaction as the mutation. If the audit write fails, the mutation rolls back. Silence is a bug.

**Responsible Agent:** Audit Agent  
**Reviewing Agent:** Backend Agent, Compliance Agent  
**Quality Gate Owner:** Audit Agent

---

### What Is Audited

The following operations always produce an audit record:

| Operation type | Examples |
|---|---|
| Entity creation | New order, new employee, new invoice, new role assignment |
| Entity mutation | Status change, field update, workflow transition |
| Entity soft delete | Deleting a customer, archiving a product |
| Entity restoration | Reversing a soft delete |
| Security events | Login, logout, failed login, password reset, role change, permission grant/revoke |
| Financial events | Payment posted, invoice finalised, journal entry posted, period closed |
| System events | Import job started, background job failed, outbox event published |

The following operations do not produce audit records:

- Read-only queries
- `NotificationPreference` updates (high-frequency, low-significance)
- `StockLevel` balance updates (covered by the immutable `StockMovement` ledger)
- `LeaveBalance` updates (covered by the `LeaveRequest` approval event)
- Internal cache invalidation

---

### AuditLog Record Structure

The `AuditLog` model (defined in `@ofs/database` schema §11) stores:

| Field | Purpose |
|---|---|
| `tenantId` | Tenant scope of the audited operation |
| `actorId` | The `userId` of the human or service account that performed the action |
| `actorType` | `USER`, `SYSTEM`, `API_KEY`, `WORKER` |
| `action` | Verb in `SCREAMING_SNAKE_CASE`: `ORDER_CONFIRMED`, `EMPLOYEE_TERMINATED`, `ROLE_ASSIGNED` |
| `resourceType` | Entity name string matching the Prisma model name: `Order`, `Employee` |
| `resourceId` | The `id` of the affected entity |
| `before` | JSON snapshot of changed fields before the operation (null for creation) |
| `after` | JSON snapshot of changed fields after the operation (null for deletion) |
| `ipAddress` | Client IP extracted from the request |
| `userAgent` | Browser or API client user-agent string |
| `requestId` | Correlation ID linking this audit record to the request log lines |
| `occurredAt` | Timestamp of the operation (not the insert time; always equal or before `createdAt`) |

---

### Diff Strategy

The `before` and `after` fields store only the **changed fields** — not the full entity. This minimises storage and makes the diff immediately readable.

The diff computation in `@ofs/audit`:
1. Accepts the entity state before and after the mutation
2. Identifies keys where the value changed
3. Strips any key present in the PII redaction list (same list as the logger)
4. Strips `updatedAt` and `updatedById` (these change on every mutation and add no information)
5. Serialises BigInt fields to strings for JSON storage
6. Returns `{ before: changedKeysOnly, after: changedKeysOnly }`

---

### Emission Mechanism

`@ofs/audit` provides two emission mechanisms:

**Decorator-based (automatic)** — the `@Auditable({ action, resourceType })` decorator is applied to a service method. The `AuditInterceptor` wraps the method call, captures the return value (which must be the mutated entity), assembles the audit context from the request scope, and writes the `AuditLog` row within the same transaction.

**Manual emission** — the `AuditEmitter.emit(payload)` method is called explicitly inside a service method when the mutation has complex context that the decorator cannot capture automatically (multi-entity mutations, conditional action strings, worker-context operations without an HTTP request).

Manual emission is always preferred in worker jobs and in service methods that perform multi-step transactions, because the decorator does not have access to the intermediate state.

---

### Audit Query API

The `SystemModule` exposes a read-only `AuditLog` endpoint accessible only to tenant administrators. It supports:

- Filter by `resourceType` and `resourceId` (to see full history of a specific entity)
- Filter by `actorId` (to see all actions taken by a specific user)
- Filter by `action` (to see all occurrences of a specific event type)
- Filter by date range on `occurredAt`
- Full-text search on `action` and `resourceType`
- Pagination via cursor

Audit records are never modified or deleted by application code. Retention policy (e.g. 7-year retention for financial audit events) is enforced by a database-level archival job, not by the application.

---

### Worker Audit Context

Background jobs do not have an HTTP request context. They provide audit context differently:

- `actorType` is set to `WORKER`
- `actorId` is the job name or the system service account ID
- `ipAddress` and `userAgent` are null
- `requestId` is the BullMQ `jobId`
- `occurredAt` is the moment the job processed the operation

The `AuditEmitter` accepts this alternative context shape without requiring the HTTP request scope.

---

## 18. CI/CD Architecture

### Philosophy

Every change to the repository is validated by an automated pipeline before it can be merged or deployed. The pipeline is the enforcer of all quality gates. No deployment happens without a passing pipeline. No manual deployment steps exist.

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** All Agents  
**Quality Gate Owner:** Infrastructure Agent

---

### Pipeline Overview

```
Push to branch
  └─▶ Lint & Type Check
        └─▶ Unit Tests
              └─▶ Build (all apps and packages)
                    └─▶ Integration Tests          ← PR only
                          └─▶ E2E Tests            ← main branch only
                                └─▶ Deploy Preview ← PR only
                                      └─▶ Deploy Production ← main branch only
```

Each stage depends on the previous stage passing. A failure at any stage stops the pipeline and blocks merge or deployment.

---

### Pipeline Stages

#### Stage 1 — Lint and Type Check

Runs on every push to every branch.

| Step | Command | Failure condition |
|---|---|---|
| ESLint | `turbo lint` | Any lint error across all packages and apps |
| TypeScript | `turbo typecheck` | Any type error across all packages and apps |
| Import order | ESLint import-sort rule | `@ofs/*` imports in wrong group |
| Dependency direction | Custom ESLint rule | App importing from another app; package importing from an app |
| Circular dependency check | `madge --circular` | Any circular dependency in the package graph |

#### Stage 2 — Unit Tests

Runs on every push.

| Step | Details |
|---|---|
| Test runner | Vitest in parallel across all packages |
| Coverage check | Per-package thresholds enforced (see §15) |
| Money arithmetic | Property-based tests via `fast-check` |
| Validation schemas | Schema factory tests with representative inputs |

#### Stage 3 — Build

Runs on every push. Turborepo caches build outputs keyed by source hash — unchanged packages are not rebuilt.

| App / Package | Build output |
|---|---|
| `@ofs/database` | Prisma client generation, TypeScript compilation |
| `@ofs/types`, `@ofs/utils`, `@ofs/validation`, `@ofs/audit`, `@ofs/logger` | TypeScript compilation |
| `@ofs/ui` | TypeScript compilation; CSS token extraction |
| `@ofs/api-contracts` | TypeScript compilation |
| `apps/api` | NestJS production build |
| `apps/web` | Next.js production build |
| `apps/worker` | TypeScript compilation |

A build failure blocks all subsequent stages.

#### Stage 4 — Integration Tests (PR only)

Runs on pull requests targeting `main` or `develop`.

| Step | Details |
|---|---|
| Database provisioning | CI runner starts a PostgreSQL container |
| Migration | `prisma migrate deploy` against the test database |
| Seed | Reference data seed via `packages/database/prisma/seed` |
| Test execution | Vitest integration suites in `apps/api/test/integration/` |
| Teardown | PostgreSQL container stopped; no data persists between runs |

#### Stage 5 — E2E Tests (main branch only)

Runs after a merge to `main` before production deployment.

| Step | Details |
|---|---|
| Environment | Playwright against the staging deployment |
| Locale coverage | Each critical journey tested in `ar` and `en` |
| RTL assertion | `dir` attribute checked on root `<html>` element |
| Date format assertion | All date displays verified as `DD MMM YYYY` |
| Status badge assertion | Visual snapshots of all status values per domain |

#### Stage 6 — Deploy Preview (PR only)

Vercel automatically creates a Preview deployment for every pull request. The preview URL is posted as a pull request comment by the Vercel GitHub integration. Preview deployments use the staging database and staging Supabase project.

#### Stage 7 — Deploy Production (main branch only)

Triggered by a merge to `main` after all previous stages pass.

| Step | Order | Detail |
|---|---|---|
| Database migration | First | `prisma migrate deploy` against the production database. If migration fails, deployment is aborted |
| Deploy apps/api | Second | After migration completes successfully |
| Deploy apps/web | Third | After API deployment is healthy |
| Deploy apps/worker | Concurrent with web | Worker is restarted with the new build |
| Health check | Final | Smoke tests hit `/health` on the API and the frontend home page |

The migration-before-deployment order ensures the database is always ahead of or equal to the application schema. Application code never runs against a schema older than itself.

---

### Quality Gate Summary

| Gate | Blocks |
|---|---|
| Lint failure | Merge |
| Type error | Merge |
| Unit test failure | Merge |
| Coverage drop below threshold | Merge |
| Build failure | Merge and deployment |
| Integration test failure | Merge |
| E2E test failure | Production deployment |
| Migration failure | Production deployment |
| Health check failure | Traffic switch to new deployment |

---

### Turborepo Caching Strategy

Turborepo's remote cache is enabled for CI. Cache keys are computed from source file hashes. A package whose source has not changed since the last run restores its build output from cache rather than rebuilding.

Cache hit expectations:
- `@ofs/config`, `@ofs/types`, `@ofs/utils` — high cache hit rate (change infrequently)
- `@ofs/ui` — medium hit rate (changes with design system updates)
- `apps/web`, `apps/api` — lower hit rate (change with every feature PR)

Turborepo's cache is scoped to the branch. Merging to `main` populates the cache for the production build path.

---

## 19. Deployment Architecture

### Philosophy

Every application in the monorepo deploys to a target that matches its runtime characteristics. The frontend and API are serverless — they scale to zero when idle and scale out instantly under load. The worker is a persistent process — it must maintain queue connections and cannot cold-start on job arrival. Infrastructure is managed by Supabase and Vercel; no team-managed Kubernetes cluster is required for the initial scale tier.

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Backend Agent  
**Quality Gate Owner:** Infrastructure Agent

---

### Deployment Targets

| Application | Platform | Runtime model | Region |
|---|---|---|---|
| `apps/web` | Vercel | Edge + Serverless Functions | Global edge network |
| `apps/api` | Vercel | Serverless Functions | Primary region co-located with Supabase |
| `apps/worker` | Container (Fly.io / Railway / Render) | Persistent Node.js process | Same region as Supabase |
| PostgreSQL | Supabase | Managed PostgreSQL | Primary + read replica |
| Object Storage | Supabase Storage | Managed S3-compatible | Same Supabase region |
| Auth | Supabase Auth | Managed | Same Supabase region |
| Job Queue | Upstash Redis | Managed Redis | Same region as worker |

---

### apps/web Deployment

`apps/web` deploys to Vercel with the following configuration:

- **Framework preset:** Next.js (Vercel auto-detects)
- **Root directory:** `apps/web`
- **Build command:** `turbo build --filter=web`
- **Output:** `.next/` directory
- **Static assets:** Served from Vercel's global CDN automatically
- **Server components and route handlers:** Deployed as Serverless Functions in the primary region
- **Edge middleware:** `middleware.ts` (locale detection, auth redirect, tenant resolution) runs on the Edge Runtime — no cold start, executes in every region before the request reaches the origin

Vercel Preview deployments are created automatically for every pull request branch. Each preview connects to the staging Supabase project.

---

### apps/api Deployment

`apps/api` deploys to Vercel as a Node.js Serverless Function application:

- **Root directory:** `apps/api`
- **Build command:** `turbo build --filter=api`
- **Region:** Single region co-located with the Supabase primary database to minimise latency between the API and the database
- **Concurrency:** Vercel scales function instances automatically; `connection_limit=1` in `DATABASE_URL` ensures each function instance holds a single PgBouncer connection
- **Cold start mitigation:** The NestJS bootstrap is wrapped in a handler that reuses the application instance across warm invocations within the same function container

The API does not use Vercel Edge Functions — NestJS requires the Node.js runtime for dependency injection and Prisma.

---

### apps/worker Deployment

The worker is a long-running Node.js process. It cannot be serverless because BullMQ consumers must maintain a persistent Redis connection.

- **Platform:** A container hosting platform (Fly.io, Railway, or Render — selection based on regional availability relative to Supabase)
- **Process:** Single `node dist/main.js` entry point; no HTTP server
- **Scaling:** Vertical (larger container) for initial scale tier. Horizontal (multiple worker instances) is possible because BullMQ distributes jobs across competing consumers; each queue can be consumed by multiple worker instances simultaneously
- **Health probe:** The worker exposes a minimal `/health` HTTP endpoint solely for the container platform's health check — not for application traffic
- **Restart policy:** Always restart on non-zero exit; exponential backoff managed by the container platform

---

### Supabase Infrastructure

Supabase provides the data layer without requiring direct database server management:

| Component | Configuration |
|---|---|
| PostgreSQL | Single primary + one read replica in the same region |
| PgBouncer | Transaction mode on port 6543; session mode on port 5432 for migrations only |
| Supabase Auth | Manages JWTs, sessions, password reset flows. The API verifies JWTs but does not issue them |
| Supabase Storage | One bucket per tenant, enforced by Storage RLS policies. Direct browser-to-storage uploads bypass the API for file data |
| Supabase Edge Functions | Not used by this architecture — all server logic is in `apps/api` |

Supabase row-level security (RLS) is **not** the primary tenant isolation mechanism — application-layer `tenantId` scoping is. RLS is an additional safety layer applied to the `attachment` and `user_session` tables where direct Supabase client access occurs.

---

### Environment Promotion

```
Developer machine → Preview (per PR) → Staging (develop branch) → Production (main branch)
```

| Environment | Database | Supabase project | Deployed by |
|---|---|---|---|
| Local | Local Docker PostgreSQL | Supabase CLI local | Developer |
| Preview | Staging database (read/write) | Staging Supabase project | Vercel auto-deploy on PR push |
| Staging | Staging database | Staging Supabase project | CI on merge to `develop` |
| Production | Production database | Production Supabase project | CI on merge to `main` |

Staging and production are entirely separate Supabase projects with separate credentials. A production secret never appears in a staging environment.

---

### Zero-Downtime Deployment

The deployment order in §18 (migration → API → web → worker) ensures zero downtime:

1. Database migrations are additive (new columns are nullable or have defaults). The old application code continues to function against the new schema.
2. The new API is deployed. Both old and new API instances are live briefly during Vercel's traffic shift.
3. The new frontend is deployed. It communicates only with the new API.
4. The worker is restarted. In-flight jobs complete on the old worker before the new worker takes over the queue.

Destructive schema changes (column removal) follow a two-deploy strategy: deploy the code that stops using the column first, then deploy the migration that removes it.

---

### Rollback Strategy

| Layer | Rollback mechanism |
|---|---|
| `apps/web` | Vercel instant rollback to any previous deployment via dashboard or CLI |
| `apps/api` | Vercel instant rollback |
| `apps/worker` | Container platform redeploy of previous image tag |
| Database migration | A new forward migration is written to reverse the change — no `prisma migrate rollback` |

A rollback of the application without a corresponding database rollback is safe because migrations are always additive at the point of deployment. The previous application code works against the new schema.

---

## 20. Scalability Architecture

### Philosophy

Performance and scalability are designed in from the start, not added later. The primary bottleneck in a multi-tenant SaaS is the database. Every architectural decision that reduces the number of queries, reduces query complexity, or moves work away from the primary database is preferred.

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Backend Agent  
**Quality Gate Owner:** Infrastructure Agent

---

### Database Scalability

| Technique | Implementation |
|---|---|
| Read replica routing | All reporting, list, and dashboard queries route to `dbRead`. Mutations and transactional reads use `db` |
| Pre-computed aggregates | `AccountBalance`, `StockLevel`, `LeaveBalance`, `OrderLine.totalAmount` are stored — not computed at query time |
| Connection pooling | PgBouncer transaction mode limits the number of concurrent PostgreSQL connections regardless of application instance count |
| Index coverage | Every `WHERE` clause in a repository method is covered by an index declared in the Prisma schema (see §8 of `PRISMA_SCHEMA_BLUEPRINT.md`) |
| Pagination | All list endpoints paginate. No endpoint returns an unbounded result set. Default page size is 25; maximum is 100 |
| Soft-delete filter | All queries include `WHERE deleted_at IS NULL` by default. A partial index on `deleted_at` ensures this filter is applied without a full scan |
| Tenant partition pressure | `tenantId` is the leading column on every composite index. PostgreSQL can satisfy a tenant-scoped query by scanning only the index entries for that tenant |

---

### Application Scalability

| Technique | Implementation |
|---|---|
| Serverless horizontal scaling | `apps/web` and `apps/api` scale to zero and out automatically on Vercel; no manual capacity planning |
| Stateless API | No in-process session state. All session data is in Supabase Auth. Any API instance can handle any request |
| Worker horizontal scaling | Multiple worker instances compete for jobs on the same BullMQ queues. Adding instances increases throughput linearly |
| Job queue back-pressure | BullMQ rate-limiters and concurrency caps prevent a spike in import jobs or notification jobs from overwhelming the database |
| Long-running work offloaded | Import processing, bulk notification dispatch, stock movement posting, and period-close are always executed in `apps/worker` — never in the HTTP request cycle |
| Streaming responses | Large list exports use Next.js streaming (`ReadableStream`) so the first byte reaches the client before the full dataset is assembled |

---

### Caching Strategy

| Cache layer | What is cached | TTL | Invalidation |
|---|---|---|---|
| Vercel Edge Cache | Static pages, public assets, `Cache-Control` responses | Per-asset; configurable per route | Automatic on deploy; on-demand via Vercel API |
| Next.js Data Cache | RSC fetch results tagged by `tenantId` and resource | 60 seconds for list pages; no cache for detail pages with mutations | `revalidateTag(tenantId)` called by server actions on mutation |
| In-process LRU (API) | Workflow configuration per tenant, feature flag state per tenant | 5 minutes; evicted on tenant settings mutation | TTL expiry; explicit eviction on `TenantSetting` update |
| Redis cache (future tier) | Not implemented in the initial scale tier. Redis is available via the worker's Upstash connection if response caching becomes necessary | — | — |

No cache stores a full entity with sensitive fields. Cached data is always read-safe (no credentials, no PII beyond what the authenticated user already has access to).

---

### Multi-Tenant Scalability

| Concern | Approach |
|---|---|
| Noisy neighbour | BullMQ per-tenant rate limiting prevents one tenant's bulk import from blocking another tenant's notification jobs |
| Tenant data volume | `tenantId` as the leading index column means large tenants do not degrade queries for small tenants |
| Plan-based limits | `PlanFeature` records define per-tenant resource limits (e.g. maximum active users, maximum warehouses). The `FeatureFlagService` enforces these limits at the service layer before writes execute |
| Schema isolation | All tenants share the same schema. Row-level isolation via `tenantId` is the model for the initial scale tier. Schema-per-tenant is a migration path if regulatory isolation becomes required |

---

### Queue Scalability

BullMQ queues are segmented by job type and by tenant priority:

| Queue | Workers | Purpose |
|---|---|---|
| `import` | 2 concurrent | CSV/Excel import processing |
| `notification` | 5 concurrent | Email, SMS, push dispatch |
| `outbox` | 3 concurrent | Outbox event relay to external systems |
| `stock` | 3 concurrent | Stock movement posting, balance recompute |
| `accounting` | 2 concurrent | Journal entry posting, period close |
| `reporting` | 1 concurrent | Materialized view refresh, report generation |

Queue concurrency is set by `WORKER_CONCURRENCY` per queue and tuned against database connection limits. The total concurrent database connections across all queues must not exceed the PgBouncer pool size.

Failed jobs move to a dead-letter queue after the maximum retry count. The dead-letter queue is monitored by the `BackgroundJob` model in the database and surfaced in the system administration UI.

---

### Performance Budgets

| Metric | Target |
|---|---|
| API response time (p95) | < 300ms for single-entity reads and writes |
| API response time (p95) | < 800ms for paginated list queries |
| Next.js TTFB (p95) | < 200ms for cached RSC pages |
| Next.js LCP | < 2.5s on a mid-range device on a 4G connection |
| Background job processing | Import row processing < 100ms per row; notification dispatch < 2s per message |
| Database query time (p95) | < 50ms for indexed single-tenant queries |

These budgets are measured by the CI E2E suite and by production monitoring. A deployment that regresses any budget by more than 20% triggers an alert.

---

## 21. Agent Ownership Matrix

### Overview

Every package, application, and architectural concern is owned by a named agent. Ownership means the agent is accountable for quality gate decisions, breaking-change approvals, and design reviews within that scope. A change touching multiple ownership zones requires sign-off from all affected owners before merge.

**Meta-owner:** Architecture Agent (owns this document and resolves ownership disputes)

---

### Package Ownership

| Package | Owner Agent | Reviewing Agent | Quality Gate |
|---|---|---|---|
| `@ofs/database` | Database Agent | Backend Agent | Schema Agent |
| `@ofs/types` | Types Agent | Backend Agent, Frontend Agent | Types Agent |
| `@ofs/validation` | Validation Agent | Backend Agent, Frontend Agent | Validation Agent |
| `@ofs/utils` | Utilities Agent | Frontend Agent, Backend Agent | Utilities Agent |
| `@ofs/ui` | Frontend Agent | Design Agent | Frontend Agent |
| `@ofs/api-contracts` | Backend Agent | Frontend Agent | Types Agent |
| `@ofs/logger` | Infrastructure Agent | Backend Agent | Infrastructure Agent |
| `@ofs/audit` | Audit Agent | Backend Agent | Audit Agent |
| `@ofs/config` | Infrastructure Agent | All Agents | Infrastructure Agent |

---

### Application Ownership

| Application | Owner Agent | Reviewing Agent | Quality Gate |
|---|---|---|---|
| `apps/web` | Frontend Agent | Design Agent, Backend Agent | Frontend Agent |
| `apps/api` | Backend Agent | Architecture Agent | Backend Agent |
| `apps/worker` | Backend Agent | Infrastructure Agent | Backend Agent |

---

### Domain Module Ownership (apps/api/modules/)

| Module | Owner Agent | Reviewing Agent |
|---|---|---|
| `platform` | Backend Agent | Architecture Agent |
| `identity` | Backend Agent | Security Agent |
| `system` (AuditLog, BackgroundJob, OutboxEvent) | Audit Agent | Backend Agent |
| `crm` | Backend Agent | CRM Agent |
| `customers` | Backend Agent | CRM Agent |
| `orders` | Backend Agent | Orders Agent |
| `products` | Backend Agent | Orders Agent |
| `purchasing` | Backend Agent | Procurement Agent |
| `inventory` | Backend Agent | Procurement Agent |
| `financial` | Accounting Agent | Backend Agent |
| `accounting` | Accounting Agent | Backend Agent |
| `expenses` | Accounting Agent | Backend Agent |
| `hr` | HR Agent | Backend Agent |
| `notifications` | Infrastructure Agent | Backend Agent |
| `attachments` | Infrastructure Agent | Backend Agent |
| `import` | Backend Agent | QA Agent |

---

### Infrastructure Ownership

| Concern | Owner Agent | Reviewing Agent |
|---|---|---|
| CI/CD pipelines (`.github/workflows/`) | Infrastructure Agent | Architecture Agent |
| Supabase project configuration (`infra/supabase/`) | Infrastructure Agent | Backend Agent |
| Environment variable catalogue | Infrastructure Agent | Backend Agent |
| Turborepo configuration (`turbo.json`) | Infrastructure Agent | All Agents |
| Database migrations | Database Agent | Backend Agent |
| Seed scripts | Database Agent | Backend Agent |

---

### Cross-Cutting Concern Ownership

| Concern | Owner Agent | Scope |
|---|---|---|
| RTL / Arabic-first compliance | Frontend Agent | All UI components in `@ofs/ui` and `apps/web` |
| Date format enforcement (DD MMM YYYY) | Utilities Agent | `@ofs/utils` date module; enforced via E2E tests |
| Money arithmetic safety (BigInt) | Utilities Agent | `@ofs/utils` money module; enforced via TypeScript types |
| Audit completeness | Audit Agent | Approves any `@SkipAudit()` override before merge |
| Security review | Security Agent | Reviews all `AuthGuard`, `PermissionGuard`, tenant-scoping changes |
| Workflow engine changes | Architecture Agent | Approves any change to `WorkflowService` or workflow registration |
| Breaking API contract changes | Backend Agent | Approves with Frontend Agent co-sign |
| Performance budget regressions | Infrastructure Agent | Reviews any change that degrades a §20 budget metric |

---

### Governance Rules

**Fix → Explain → Continue** applies to all agents. When an agent identifies a violation of an established rule, it applies the safe correction immediately, documents the reason in the pull request or commit message, and does not block progress. If no safe correction exists, the agent raises the issue to the owning agent before merging.

**No agent bypasses another agent's quality gate.** A change that touches `@ofs/audit` without Audit Agent approval does not merge. A change that introduces a hardcoded status string without Validation Agent approval does not merge.

**Ownership does not mean exclusivity.** Any agent may contribute to any area. Ownership means accountability for quality gate decisions, not a prohibition on contributions.

---

## 22. Development Workflow

### Philosophy

The development workflow is optimised for a small, high-output team working on a complex multi-domain system. Local development is fast, predictable, and mirrors production as closely as practical. Every developer has a complete, isolated environment without depending on shared infrastructure.

**Responsible Agent:** Architecture Agent  
**Reviewing Agent:** Infrastructure Agent  
**Quality Gate Owner:** Architecture Agent

---

### Local Environment Setup

| Step | Tool | Detail |
|---|---|---|
| 1. Clone repository | git | Single monorepo clone |
| 2. Install dependencies | `pnpm install` | pnpm workspace resolves all package links automatically |
| 3. Start local database | Supabase CLI (`supabase start`) | Starts PostgreSQL, PgBouncer, Auth, and Storage locally via Docker |
| 4. Apply migrations | `pnpm db:migrate` | Runs `prisma migrate deploy` against the local Supabase database |
| 5. Seed reference data | `pnpm db:seed` | Populates plans, roles, permissions, tax rates, leave types |
| 6. Copy env template | `cp .env.example .env.local` | Developer fills in Supabase local keys from `supabase status` output |
| 7. Start development servers | `pnpm dev` | Turborepo starts `apps/web` on port 3007, `apps/api` on port 3000, `apps/worker` in watch mode concurrently |

The single command `pnpm dev` starts the entire system. No manual service coordination.

---

### Daily Development Cycle

```
1. Pull latest from develop
2. Create feature branch (see §23)
3. Make changes
4. Run: pnpm lint && pnpm typecheck (pre-push hook runs this automatically)
5. Run: pnpm test (unit tests only — fast)
6. Push branch → CI runs full pipeline
7. Open pull request when CI passes
8. Request review from owning agent(s)
9. Address review feedback
10. Merge after approval and CI green
```

---

### Turborepo Development Commands

| Command | Effect |
|---|---|
| `pnpm dev` | Start all apps in watch mode concurrently |
| `pnpm dev --filter=web` | Start only `apps/web` |
| `pnpm dev --filter=api` | Start only `apps/api` |
| `pnpm build` | Build all apps and packages |
| `pnpm build --filter=web...` | Build `apps/web` and all its dependencies |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run unit tests across all packages |
| `pnpm test:integration` | Run integration tests (requires local database) |
| `pnpm db:migrate` | Apply pending migrations to local database |
| `pnpm db:generate` | Regenerate Prisma client after schema change |
| `pnpm db:seed` | Run seed script against local database |
| `pnpm db:studio` | Open Prisma Studio for local database inspection |

---

### Making a Schema Change

Schema changes follow a strict sequence to prevent drift:

1. Edit `packages/database/prisma/schema.prisma`
2. Run `pnpm db:generate` — regenerates the Prisma client
3. Run `pnpm db:migrate` in development mode — creates a new migration file and applies it to the local database
4. Update affected types in `@ofs/types` to reflect the schema change
5. Update affected validation schemas in `@ofs/validation`
6. Update affected repository methods in the relevant `apps/api` module
7. Run `pnpm typecheck` — confirms no type errors across the dependency chain
8. Commit all changes atomically: schema, migration, types, validation, services, tests

A schema change commit that does not include the migration file is rejected by the CI migration-diff gate.

---

### Adding a New Domain Module

When a new business domain is introduced:

1. Create the domain type interfaces in `@ofs/types/src/entities/<domain>.types.ts`
2. Create the domain Zod schemas in `@ofs/validation/src/schemas/<domain>.schema.ts`
3. Create the endpoint contracts in `@ofs/api-contracts/src/endpoints/<domain>.endpoints.ts`
4. Add the Prisma models to `packages/database/prisma/schema.prisma` and generate a migration
5. Scaffold the NestJS module in `apps/api/src/modules/<domain>/` following the standard anatomy (§14)
6. Register the new module in `apps/api/src/app.module.ts`
7. Register workflow configuration with `WorkflowModule` if the domain has a workflow entity
8. Scaffold the frontend route under `apps/web/app/[locale]/(dashboard)/<domain>/`
9. Write unit tests for the service layer
10. Write integration tests for the repository layer

This sequence is the same for every domain. No domain invents its own scaffolding pattern.

---

### Code Review Standards

| Category | Requirement |
|---|---|
| Hardcoded status strings | Any `if (status === '...')` or `switch (status)` in application code blocks merge |
| Missing audit emission | Any state-changing service method without `@Auditable` or `AuditEmitter.emit` blocks merge |
| Raw `process.env` access | Any `process.env.X` outside the config schema validation layer blocks merge |
| Untyped API calls | Any `fetch()` call not going through the typed `@ofs/api-contracts` client blocks merge |
| Missing `tenantId` scope | Any repository query without a `tenantId` parameter blocks merge |
| `console.log` | Any `console.log` outside test files blocks merge |
| Non-BigInt money | Any monetary value typed as `number` or `float` blocks merge |
| Wrong date format | Any date rendered outside `formatDate()` blocks merge |
| RTL violation | Any CSS using `left`/`right` directional properties instead of logical properties blocks merge |

---

## 23. Branching Strategy

### Branch Model

OFS uses a trunk-based development model with short-lived feature branches. The trunk is `main`. A `develop` integration branch serves as the staging target.

```
main          ← production; always deployable; protected
  └── develop ← staging integration; always green; protected
        ├── feature/<ticket>-<slug>
        ├── fix/<ticket>-<slug>
        ├── chore/<ticket>-<slug>
        └── hotfix/<ticket>-<slug>   ← branches from main directly
```

---

### Branch Types and Naming

| Branch type | Branches from | Merges into | Naming pattern | Example |
|---|---|---|---|---|
| Feature | `develop` | `develop` | `feature/<ticket>-<slug>` | `feature/OFS-142-order-workflow` |
| Bug fix | `develop` | `develop` | `fix/<ticket>-<slug>` | `fix/OFS-201-invoice-total` |
| Chore | `develop` | `develop` | `chore/<ticket>-<slug>` | `chore/OFS-155-upgrade-prisma` |
| Hotfix | `main` | `main` and `develop` | `hotfix/<ticket>-<slug>` | `hotfix/OFS-330-stock-underflow` |
| Release | `develop` | `main` | `release/<version>` | `release/1.4.0` |

The ticket prefix (`OFS-XXX`) links the branch to the project management system. It is required on all branches except developer-local experiment branches that are never pushed to origin.

---

### Branch Lifetime

| Branch type | Maximum lifetime |
|---|---|
| Feature / fix / chore | 3 working days. Branches open longer than 3 days are considered at risk of merge conflict accumulation and the author is flagged for a rebase or split |
| Hotfix | 4 hours from branch creation to production merge |
| Release | 1 working day — only exists while final staging validation is in progress |

Short-lived branches are the primary defence against merge conflicts and integration surprises. If a feature takes longer than 3 days, it is broken into smaller branches that each merge independently.

---

### Branch Protection Rules

| Branch | Rules |
|---|---|
| `main` | Require pull request; require 1 approval; require CI pass (all stages including E2E); no force push; no deletion; require linear history |
| `develop` | Require pull request; require 1 approval; require CI pass (stages 1–4); no force push; no deletion |

All other branches are unprotected. Developers manage their own feature branches freely.

---

### Merge Strategy

| Target | Strategy | Reason |
|---|---|---|
| `develop` | Squash merge | One commit per feature/fix in the integration branch history; clean linear log |
| `main` from `develop` (release) | Merge commit | Preserves the release boundary as a named commit; enables `git log --first-parent` to show only releases |
| `main` from `hotfix` | Squash merge | Hotfix stays atomic in the production history |

Rebase-and-merge is not used. It rewrites commit hashes, which breaks the traceability link between branch commits and the PR that reviewed them.

---

### Hotfix Process

A hotfix is the only path for a change to reach production without passing through `develop` first.

```
1. Branch from main: git checkout -b hotfix/OFS-XXX-description main
2. Apply the minimal fix
3. Run: pnpm lint && pnpm typecheck && pnpm test (locally)
4. Open PR targeting main
5. Require 1 approval (same rules as normal PR)
6. CI runs all stages including E2E against staging
7. Merge to main → production deployment
8. Immediately open a second PR merging main back into develop
9. Merge back-port to develop within 1 hour of production merge
```

The back-port to `develop` is mandatory. A hotfix that is not back-ported will be reverted the next time `develop` is promoted to production via a release.

---

### Commit Message Convention

All commits follow Conventional Commits format:

```
<type>(<scope>): <subject>

[optional body]
```

| Type | When to use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `chore` | Tooling, dependencies, configuration |
| `refactor` | Code change with no behaviour change |
| `test` | Adding or updating tests only |
| `docs` | Documentation only |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

Scope is the affected package or module name: `feat(orders):`, `fix(accounting):`, `chore(database):`.

The subject line is lowercase, imperative mood, no trailing period. Maximum 72 characters. The body explains *why*, not *what* — the diff shows what changed.

Breaking changes include `BREAKING CHANGE:` in the commit body and trigger a major version consideration for the API contract.

---

## 24. Release Strategy

### Philosophy

A release is a deliberate, named, and auditable event — not an automatic consequence of merging to `main`. Every production deployment is traceable to a release record that documents what changed, who approved it, and when it went live. Release timing is predictable. Release scope is bounded. No release contains a surprise.

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Architecture Agent  
**Quality Gate Owner:** Infrastructure Agent

---

### Versioning Scheme

OFS follows Semantic Versioning (`MAJOR.MINOR.PATCH`):

| Increment | Trigger |
|---|---|
| `MAJOR` | A breaking change in the public API contract (`/v1/` → `/v2/`), a breaking change in the `@ofs/types` public surface, or a fundamental architectural shift |
| `MINOR` | A new domain module, a new API endpoint, a new plan feature, or a new UI domain section that is backward-compatible |
| `PATCH` | A bug fix, a performance improvement, a dependency upgrade, or a documentation update that does not change any API contract |

Version numbers are recorded in the root `package.json`. All apps and packages share the same monorepo version — there are no independently versioned packages.

---

### Release Cadence

| Release type | Frequency | Scope |
|---|---|---|
| Patch release | As needed — same day for critical fixes | Bug fixes, hotfixes promoted from `main` |
| Minor release | Every 2 weeks | Feature work accumulated on `develop` |
| Major release | Planned — announced 4 weeks in advance | Breaking API changes, major architectural shifts |

The 2-week minor release cadence is the heartbeat of the product. Feature branches that miss a release cycle wait for the next one. No release is delayed to include a late feature.

---

### Release Process

#### Step 1 — Release Branch Cut

On the release day, a `release/<version>` branch is cut from `develop`:

```
develop → release/1.5.0
```

The release branch is a stabilisation period — only bug fixes discovered during staging validation are committed directly to the release branch. No new features.

---

#### Step 2 — Staging Validation

The release branch deploys automatically to the staging environment. The QA Agent performs:

| Check | Detail |
|---|---|
| Smoke test | All primary routes load; authentication works; tenant switching works |
| RTL validation | Arabic locale renders correctly; all text directions are `rtl` on root `<html>` |
| Date format check | All dates render as `DD MMM YYYY` (e.g. `01 Jan 2026`, `15 Feb 2026`) |
| Status badge check | All dynamic status badges render with correct labels and colours |
| Workflow check | At least one workflow transition per domain is exercised |
| Migration check | `prisma migrate status` confirms all migrations applied cleanly |
| Performance check | p95 response times are within the §20 budget targets |

Staging validation runs for a minimum of 4 hours. A release that fails any check is patched on the release branch and re-validated before promotion.

---

#### Step 3 — Release Notes

Release notes are written before the production merge. They document:

- **Version:** `1.5.0`
- **Release date:** in `DD MMM YYYY` format — e.g. `15 Jan 2026`
- **What's new:** new features and modules, listed by domain
- **What's fixed:** bug fixes with ticket references
- **Breaking changes:** explicit list; empty for minor and patch releases
- **Migration notes:** any manual steps required after deployment (reference data updates, tenant configuration changes)
- **Agent sign-offs:** the owning agent for each change confirms the change is production-ready

Release notes are committed to `docs/releases/<version>.md` as part of the release branch.

---

#### Step 4 — Production Merge

After staging validation passes and release notes are committed:

```
release/1.5.0 → main   (merge commit — preserves release boundary)
```

The merge to `main` triggers the production CI pipeline: migration → API deploy → web deploy → worker deploy → health check (§18 Stage 7).

---

#### Step 5 — Tag and Back-Port

Immediately after the production merge:

1. Tag the merge commit: `git tag v1.5.0`
2. Push the tag: this is the permanent production release marker
3. Open a PR merging `main` back into `develop` to carry forward any release-branch fixes

The back-port PR must merge within 4 hours of the production deployment. A `develop` branch that does not contain all production commits is considered out of sync and blocks the next release.

---

### Hotfix Release Process

Hotfixes bypass the release branch entirely (§23). After a hotfix merges to `main`:

1. Tag the commit: `v1.4.1` (patch increment)
2. Write abbreviated release notes documenting the fix, the root cause, and the impact
3. Back-port to `develop` within 1 hour

Hotfix release notes use the same `DD MMM YYYY` date format and follow the same agent sign-off requirement.

---

### Release Communication

| Audience | Communication | Timing |
|---|---|---|
| Internal team | Slack release announcement with release notes link | At production deploy start |
| Tenant administrators | In-app notification (via `NotificationTemplate` code `PLATFORM_RELEASE`) | After health check passes |
| External API consumers | Release notes email for MINOR+ releases with breaking change sections highlighted | 48 hours before production for MAJOR; same-day for MINOR/PATCH |

The `PLATFORM_RELEASE` notification is delivered to `actorType = SYSTEM` via the `Notification` model. It is not hardcoded — it uses the same dynamic notification system as all other notifications in the platform. The template is tenant-localised: Arabic tenants receive the notification body in Arabic.

---

### Rollback Decision Matrix

A rollback is considered when a production release causes a measurable regression within the first 30 minutes of deployment:

| Condition | Action |
|---|---|
| p95 API response time > 2× baseline | Rollback `apps/api` and `apps/web` via Vercel instant rollback |
| Error rate > 1% of requests | Rollback immediately; do not wait for root cause |
| Financial calculation produces incorrect results | Rollback immediately; flag all affected records for audit review |
| Authentication broken for any tenant | Rollback immediately |
| Database migration caused data loss | Rollback application; write compensating forward migration; consult Audit Agent and Accounting Agent before proceeding |
| UI renders LTR for Arabic locale | Rollback `apps/web`; this violates a non-negotiable rule |
| Dates rendering in wrong format | Rollback `apps/web`; this violates a non-negotiable rule |

A rollback does not require a full release process. The Infrastructure Agent executes it immediately and files a post-mortem within 24 hours.

---

### Post-Mortem Process

Every production incident that required a rollback or that caused user-visible data errors triggers a post-mortem:

- Written within 24 hours of resolution
- Stored in `docs/post-mortems/<date>-<slug>.md` using `DD MMM YYYY` date format in the filename prefix (`26-May-2026-stock-underflow.md`)
- Sections: Timeline, Root Cause, Impact, Fix Applied, Prevention Measures, Agent Accountability
- Fix → Explain → Continue: the post-mortem documents what was fixed, explains why it happened, and proposes the architectural change that prevents recurrence
- Reviewed by the owning agent and the Architecture Agent before closing

---

## 25. Final Monorepo Summary

This section is the canonical quick-reference for the OFS monorepo. Every architectural decision documented in §1–24 is distilled here. When in doubt, return to the relevant section for the full rationale.

---

### The Non-Negotiable Rules

These rules are not preferences. They are enforced by code review gates, CI checks, and agent governance. A pull request that violates any of these rules does not merge.

| Rule | Enforcement |
|---|---|
| **Arabic First** | Default locale is `ar`. All user-facing strings have an Arabic translation. Arabic translations are the primary label in `StatusConfig.labelAr` |
| **RTL First** | Root `<html dir="rtl">` for Arabic locale. All CSS uses logical properties. LTR is an explicit opt-in, never the default |
| **Rubik Font** | Rubik is the only typeface. Self-hosted in `apps/web/public/fonts/`. Loaded via CSS variable `--font-rubik` |
| **Professional Green Theme** | All colour decisions reference the `--colour-primary-*` green token scale. No ad-hoc hex values in component styles |
| **Multi-Tenant SaaS** | Every database query includes `WHERE tenant_id = :tenantId`. No cross-tenant data access is architecturally possible |
| **Dynamic Statuses** | No `if (status === '...')` in application code. All status display and allowed transitions come from `StatusConfig` maps in `@ofs/types` |
| **Dynamic Workflows** | All workflow transitions go through `WorkflowService`. No domain service directly mutates a status field |
| **No Hardcoded Business Logic** | No magic strings, no hardcoded limits, no inline workflow rules. All business configuration is data-driven |
| **Audit Everything Important** | Every state-changing operation on a significant entity emits an `AuditLog` row in the same transaction |
| **Performance First** | Read replicas for reporting. Pre-computed aggregates. Indexed every `WHERE` clause. Paginated every list. Never return unbounded result sets |
| **Security First** | Tenant isolation on every query. `SUPABASE_SERVICE_ROLE_KEY` never in browser. All inputs validated via `@ofs/validation` before any business logic |
| **Accounting Accuracy First** | All money in `BigInt` minor units. No `float` or `number` for currency. Banker's rounding on multiplication. Immutable journal entries |
| **Date Format: DD MMM YYYY** | All date output goes through `formatDate()` from `@ofs/utils`. Examples: `01 Jan 2026`, `15 Feb 2026`. No other format is permitted in UI or release notes |

---

### Directory Quick-Reference

```
ofs/
├── apps/
│   ├── web/          Next.js App Router · Port 3007 · Vercel Edge + Serverless
│   ├── api/          NestJS REST API · Vercel Serverless · Primary region
│   └── worker/       BullMQ consumers · Persistent container · Same region as DB
├── packages/
│   ├── database/     Prisma schema · Migrations · db + dbRead clients · Seed
│   ├── types/        IEntity interfaces · DTOs · Enums · StatusConfig · Utility types
│   ├── validation/   Zod schemas · Schema factories · Primitives · Arabic error messages
│   ├── utils/        Date (DD MMM YYYY) · Money (BigInt) · RTL · Pagination · Slug
│   ├── ui/           Rubik · RTL-first · Green tokens · StatusBadge · DataTable
│   ├── api-contracts/Typed endpoint definitions · Client factory · Webhook payloads
│   ├── logger/       Pino structured JSON · PII redaction · Request correlation
│   ├── audit/        AuditEmitter · @Auditable decorator · Diff utility
│   └── config/       tsconfig · ESLint · Prettier · Vitest setup
├── infra/
│   └── supabase/     Project config · Storage rules · RLS notes
├── docs/
│   ├── MONOREPO_ARCHITECTURE.md   ← this document
│   ├── SYSTEM_BLUEPRINT.md
│   ├── PRISMA_SCHEMA_BLUEPRINT.md
│   └── AGENT_ARCHITECTURE.md
└── .github/workflows/ CI/CD pipeline definitions
```

---

### Technology Decisions Summary

| Concern | Decision | Rationale |
|---|---|---|
| Monorepo orchestration | Turborepo + pnpm workspaces | Remote caching; dependency graph enforcement; parallel task execution |
| Frontend framework | Next.js App Router | RSC for server-side data fetching; Edge middleware for RTL/locale; Vercel-native |
| Backend framework | NestJS | Dependency injection for clean module boundaries; decorator-based interceptors for audit and validation |
| ORM | Prisma | Type-safe queries; migration management; dual-client (OLTP + read replica) |
| Database | PostgreSQL via Supabase | Managed; PgBouncer included; read replica; integrated Auth and Storage |
| Auth | Supabase Auth | JWT issuance managed; no custom auth server to maintain |
| Job queue | BullMQ + Upstash Redis | Persistent queue; retry; dead-letter; competing consumers for horizontal scaling |
| Validation | Zod | Shared schemas across frontend (react-hook-form) and backend (NestJS pipe); `z.infer` for type derivation |
| Testing | Vitest + Playwright | Vitest for unit/integration (fast, Vite-native); Playwright for E2E (real browser, RTL assertions) |
| Deployment | Vercel + container | Serverless for request-driven apps; persistent container for queue-driven worker |

---

### Architectural Principles Summary

| Principle | Expression in the codebase |
|---|---|
| Single source of truth | `@ofs/types` for types; `@ofs/validation` for schemas; `@ofs/api-contracts` for API shapes; `PRISMA_SCHEMA_BLUEPRINT.md` for data model |
| Strict dependency direction | Apps → Packages → Config. No app imports from another app. No package imports from an app |
| Package boundaries enforced by TypeScript | Wrong imports surface as compiler errors before they reach CI |
| Data integrity by convention | Every money value is `BigInt`. Every date output is `DD MMM YYYY`. Every list is paginated. These are compile-time and test-time guarantees |
| Immutable audit trail | `AuditLog` and `StockMovement` and `JournalEntryLine` are never modified after creation |
| Configuration over code | Statuses, transitions, plan features, notification templates, validation rules, and workflow steps are database records — not source code |
| Failure isolation | Long-running work is in `apps/worker`. A failed job does not fail a user request. A dead worker does not take down the API |
| Observability by default | Every request produces structured logs. Every mutation produces an audit record. Every job produces start/complete/fail log lines |

---

### Release and Governance Summary

| Concern | Rule |
|---|---|
| Release cadence | Patch as needed · Minor every 2 weeks · Major with 4 weeks notice |
| Release date format | DD MMM YYYY in all release notes and communications |
| Version tagging | `vMAJOR.MINOR.PATCH` git tag on every production merge |
| Hotfix lifetime | Branch to production in under 4 hours; back-port to `develop` within 1 hour |
| Branch lifetime | Feature/fix/chore branches: 3 working days maximum |
| Post-mortem | Required within 24 hours for any production rollback or data error |
| Agent governance | Fix → Explain → Continue. Every owning agent approves changes in their zone. No agent bypasses another agent's quality gate |

---

### Agent Responsibility Summary

| Agent | Primary zone |
|---|---|
| Architecture Agent | This document; `WorkflowService`; module dependency map; ownership disputes |
| Database Agent | `@ofs/database`; Prisma schema; migrations; seed |
| Types Agent | `@ofs/types`; `@ofs/api-contracts` quality gate |
| Validation Agent | `@ofs/validation`; `ZodValidationPipe`; dynamic schema factories |
| Utilities Agent | `@ofs/utils`; date format enforcement; money arithmetic safety |
| Frontend Agent | `apps/web`; `@ofs/ui`; RTL compliance; Rubik font |
| Backend Agent | `apps/api`; all domain modules; `apps/worker` |
| Audit Agent | `@ofs/audit`; `AuditLog` completeness; `@SkipAudit` approvals |
| Infrastructure Agent | `@ofs/logger`; `@ofs/config`; CI/CD pipelines; deployment; environment config |
| Security Agent | `AuthGuard`; `PermissionGuard`; tenant scoping changes |
| Accounting Agent | `financial`, `accounting`, `expenses` modules; `BigInt` money accuracy |
| QA Agent | Testing architecture; coverage thresholds; E2E suite; staging validation |

---

*Document complete. This is the single source of truth for OFS monorepo organisation and project structure.*  
*Last section appended: 25 — Final Monorepo Summary.*  
*All 25 sections authored and approved.*
