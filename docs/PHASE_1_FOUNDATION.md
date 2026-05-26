# OFS Phase 1 — Foundation

**Status:** Implementation Ready  
**Scope:** Monorepo bootstrap, toolchain configuration, shared package scaffolding  
**Prerequisites:** All architecture decisions finalised (`MONOREPO_ARCHITECTURE.md` complete)  
**Non-Negotiables:** Arabic First · RTL First · Rubik Font · Professional Green Theme · Multi-Tenant SaaS · Dynamic Statuses · Dynamic Workflows · No Hardcoded Business Logic · Audit Everything · Performance First · Security First · Accounting Accuracy First · Date Format: DD MMM YYYY

---

## 1. Phase Objectives

**Responsible Agent:** Architecture Agent  
**Reviewing Agent:** Infrastructure Agent  
**Quality Gate:** Architecture Agent

---

### What Phase 1 Delivers

Phase 1 establishes the structural foundation that every subsequent phase builds upon. It does not deliver user-facing features. It delivers the infrastructure that makes features possible: a working monorepo, a passing CI pipeline, and nine initialised shared packages with their public contracts defined.

At the end of Phase 1, a developer who clones the repository and runs `pnpm install && pnpm dev` has a running system on port `3007` with a health-checked frontend, a health-checked API, and a connected local database. Nothing more, nothing less.

---

### Objectives

| ID | Objective | Outcome |
|---|---|---|
| O-1 | Initialise the monorepo toolchain | Turborepo + pnpm workspaces operational; all packages linked |
| O-2 | Establish shared tooling configuration | ESLint, TypeScript, Prettier, Vitest configured once and extended by all apps and packages |
| O-3 | Scaffold all nine shared packages | `@ofs/config`, `@ofs/types`, `@ofs/utils`, `@ofs/validation`, `@ofs/database`, `@ofs/logger`, `@ofs/audit`, `@ofs/api-contracts`, `@ofs/ui` created with correct `package.json`, `tsconfig.json`, and public `index.ts` stubs |
| O-4 | Scaffold all three applications | `apps/web`, `apps/api`, `apps/worker` created with framework skeletons and health endpoints |
| O-5 | Configure the CI pipeline | Stages 1–3 (lint, type-check, build) pass on an empty push to `develop` |
| O-6 | Connect the local database | Supabase CLI configured; Prisma schema committed; migration baseline applied; seed runs cleanly |
| O-7 | Establish the development workflow | `pnpm dev` starts all three apps; `pnpm test` runs all (empty) test suites; `pnpm lint` passes |

---

### What Phase 1 Explicitly Does Not Deliver

- No business domain modules (CRM, Orders, Inventory, etc.)
- No authentication flow beyond a stub guard
- No UI pages beyond a health check root route
- No real Prisma models beyond the schema baseline commit
- No Supabase Storage configuration
- No BullMQ queues beyond a worker process that starts and stays alive

Everything listed above belongs to Phase 2 and later phases. Any work item that is not in the objective table above is out of scope and must not be implemented during Phase 1.

---

## 2. Foundation Success Criteria

**Responsible Agent:** QA Agent  
**Reviewing Agent:** Architecture Agent  
**Quality Gate:** QA Agent

---

### CI Gates (all must pass on the `develop` branch before Phase 1 is closed)

| Gate | Check | Pass condition |
|---|---|---|
| G-1 | ESLint | Zero lint errors across all packages and apps |
| G-2 | TypeScript | Zero type errors across all packages and apps |
| G-3 | Circular dependency | `madge --circular` reports no cycles |
| G-4 | Dependency direction | No app imports from another app; no package imports from an app |
| G-5 | Unit tests | All test suites pass (suites may be empty stubs; they must not error) |
| G-6 | Build | All packages and apps build to their output directories without error |
| G-7 | Turbo cache | A second `pnpm build` run with no changes results in 100% cache hits |

---

### Local Developer Gates (verified manually before Phase 1 is closed)

| Gate | Check | Pass condition |
|---|---|---|
| G-8 | `pnpm install` | Completes without error on a clean clone |
| G-9 | `supabase start` | Local Supabase stack starts; PostgreSQL, Auth, and Storage are reachable |
| G-10 | `pnpm db:migrate` | Prisma migration applies cleanly to the local database |
| G-11 | `pnpm db:seed` | Seed script runs and reports success |
| G-12 | `pnpm dev` | All three apps start; no process exits within 30 seconds |
| G-13 | Web health check | `GET http://localhost:3007/` returns HTTP 200 |
| G-14 | API health check | `GET http://localhost:3000/health` returns `{ status: 'ok' }` |
| G-15 | Worker health check | Worker process logs `Worker started` and remains alive |
| G-16 | RTL root | `apps/web` root HTML element has `dir="rtl"` and `lang="ar"` by default |
| G-17 | Rubik font | Network tab confirms Rubik WOFF2 files are served from `localhost:3007/fonts/` |

---

### Package Contract Gates (verified by TypeScript compilation)

| Gate | Check | Pass condition |
|---|---|---|
| G-18 | `@ofs/types` exports | All utility types (`TenantScoped`, `AuditedEntity`, `SoftDeletable`, `Paginated`, `ApiResponse`, `StatusConfig`) are exported from the package root |
| G-19 | `@ofs/utils` exports | `formatDate`, `formatMoney`, `detectDirection`, `encodeCursor`, `decodeCursor` are exported and callable |
| G-20 | `@ofs/validation` exports | At least one Zod primitive (`cuidPrimitive`, `moneyPrimitive`, `datePrimitive`) is exported and valid |
| G-21 | `@ofs/database` exports | `db` and `dbRead` Prisma client instances are exported; Prisma client generation completes without error |
| G-22 | `@ofs/logger` exports | `createLogger` factory is exported; a logger instance can be created without error |
| G-23 | `@ofs/audit` exports | `AuditEmitter` class is exported and instantiable |
| G-24 | `@ofs/ui` exports | `RtlProvider`, `ThemeProvider`, and `StatusBadge` component stubs are exported |
| G-25 | `@ofs/api-contracts` exports | The typed client factory stub is exported |

---

### Fix → Explain → Continue Policy for Phase 1

If any gate fails during Phase 1 implementation:

1. **Fix** — apply the minimal correction that resolves the gate failure without introducing scope beyond Phase 1
2. **Explain** — document the root cause in the pull request description or commit message body
3. **Continue** — do not block progress on unrelated gates; a failing G-17 (Rubik font) does not block G-14 (API health check)

No gate failure blocks the entire phase. Each gate is resolved independently as it is encountered.

---

## 3. Monorepo Initialization Plan

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Architecture Agent  
**Quality Gate:** Infrastructure Agent

---

### Initialization Order

The monorepo must be initialised in a strict order. Each step depends on the previous completing without error. Steps within the same group are independent and may be executed in parallel.

---

### Group A — Repository Bootstrap

These steps establish the repository before any package or application is created. They must be completed first and committed together in the initial commit.

| Step | Action | Output |
|---|---|---|
| A-1 | Initialise git repository | `.git/` directory; initial commit with `.gitignore` |
| A-2 | Create root `package.json` | Workspace root manifest declaring `pnpm` as the package manager; `"workspaces"` field pointing to `apps/*` and `packages/*`; root-level scripts: `dev`, `build`, `lint`, `typecheck`, `test` |
| A-3 | Create `pnpm-workspace.yaml` | Declares `apps/*` and `packages/*` as workspace members |
| A-4 | Create `.npmrc` | `shamefully-hoist=false`; `strict-peer-dependencies=false`; `auto-install-peers=true` |
| A-5 | Create `.gitignore` | Standard Node.js ignores; plus `dist/`, `.turbo/`, `.next/`, `prisma/generated/`, `.env.local`, `.env.*.local` |
| A-6 | Create `.env.example` | All environment variables catalogued in §13 of `MONOREPO_ARCHITECTURE.md`, with placeholder values and inline comments |

---

### Group B — Turborepo Configuration

Executed after Group A. Establishes the task pipeline that all subsequent commands depend on.

| Step | Action | Output |
|---|---|---|
| B-1 | Install Turborepo as root dev dependency | `turbo` in root `devDependencies` |
| B-2 | Create `turbo.json` | Pipeline definitions for `build`, `dev`, `lint`, `typecheck`, `test`; correct dependency chains (`build` depends on upstream `build`; `dev` does not); remote cache configuration placeholder |
| B-3 | Add Turbo scripts to root `package.json` | All root scripts delegate to `turbo run <task>` |
| B-4 | Verify pipeline graph | `turbo run build --dry` reports the expected package build order without executing |

---

### Group C — Shared Tooling Package

Executed after Group B. `@ofs/config` must exist before any other package or app can extend it.

| Step | Action | Output |
|---|---|---|
| C-1 | Create `packages/config/` directory structure | `package.json`, `tsconfig/`, `eslint/`, `prettier/` subdirectories |
| C-2 | Define base TypeScript config | `packages/config/tsconfig/base.json`: strict mode, no implicit any, ES2022 target, module resolution bundler |
| C-3 | Define library TypeScript config | `packages/config/tsconfig/library.json`: extends base; declaration files enabled; composite enabled |
| C-4 | Define Next.js TypeScript config | `packages/config/tsconfig/nextjs.json`: extends base; JSX preserve; Next.js plugin types included |
| C-5 | Define ESLint base config | `packages/config/eslint/base.js`: TypeScript ESLint, import ordering, no-console rule, dependency direction rule |
| C-6 | Define Prettier config | `packages/config/prettier/index.js`: single quotes, trailing commas, 100-char print width, arrow parens always |
| C-7 | Publish internal package | `packages/config/package.json`: name `@ofs/config`; all config files listed in `exports`; marked as `private: true` |

---

### Group D — Dependency Installation

Executed after Group C.

| Step | Action | Output |
|---|---|---|
| D-1 | Install shared dev dependencies at root | TypeScript, ESLint, Prettier, Vitest, `@types/node`, `tsx` |
| D-2 | Install framework dependencies in `apps/web` | Next.js, React, React DOM, `next-intl` |
| D-3 | Install framework dependencies in `apps/api` | NestJS core, NestJS platform-express, `class-transformer`, `class-validator`, `@nestjs/config` |
| D-4 | Install worker dependencies in `apps/worker` | BullMQ, `@nestjs/bullmq`, `ioredis` |
| D-5 | Install Prisma | `prisma` CLI at root dev; `@prisma/client` in `packages/database`; `prisma` in `packages/database` dev |
| D-6 | Install Zod | `zod` in `packages/validation` and as a peer in consuming packages |
| D-7 | Install Pino | `pino` and `pino-pretty` in `packages/logger` |
| D-8 | Install Radix UI primitives | `@radix-ui/react-*` components in `@ofs/ui` |
| D-9 | Install testing libraries | `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, Playwright in their respective locations |

---

## 4. Workspace Structure Creation

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Backend Agent, Frontend Agent  
**Quality Gate:** Infrastructure Agent

---

### Creation Order

The directory structure is created from the inside out: shared packages first, then applications that depend on them. This order means TypeScript can resolve all imports at the moment each app's `tsconfig.json` is created.

---

### Step 1 — Create Package Directories

Create all nine package directories before populating them. Each directory receives only its `package.json` and `tsconfig.json` at this step — no source files yet.

| Package | Directory | `name` field | Depends on |
|---|---|---|---|
| Config | `packages/config/` | `@ofs/config` | — |
| Types | `packages/types/` | `@ofs/types` | `@ofs/config` |
| Utils | `packages/utils/` | `@ofs/utils` | `@ofs/config`, `@ofs/types` |
| Validation | `packages/validation/` | `@ofs/validation` | `@ofs/config`, `@ofs/types` |
| Database | `packages/database/` | `@ofs/database` | `@ofs/config`, `@ofs/types` |
| Logger | `packages/logger/` | `@ofs/logger` | `@ofs/config` |
| Audit | `packages/audit/` | `@ofs/audit` | `@ofs/config`, `@ofs/types`, `@ofs/logger`, `@ofs/database` |
| API Contracts | `packages/api-contracts/` | `@ofs/api-contracts` | `@ofs/config`, `@ofs/types` |
| UI | `packages/ui/` | `@ofs/ui` | `@ofs/config`, `@ofs/types`, `@ofs/utils` |

Every `package.json` is marked `"private": true`. No package is published to npm.

Every `tsconfig.json` extends `@ofs/config/tsconfig/library.json` and declares `paths` for any `@ofs/*` workspace imports it references.

---

### Step 2 — Create Application Directories

After all packages have their `package.json` and `tsconfig.json`, create the three application directories.

| Application | Directory | Framework | Port | `tsconfig` base |
|---|---|---|---|---|
| Web | `apps/web/` | Next.js App Router | 3007 | `@ofs/config/tsconfig/nextjs.json` |
| API | `apps/api/` | NestJS | 3000 | `@ofs/config/tsconfig/base.json` |
| Worker | `apps/worker/` | Node.js + BullMQ | — (no HTTP) | `@ofs/config/tsconfig/base.json` |

Each application's `package.json` declares its workspace dependencies using the `workspace:*` protocol:

```
"@ofs/types": "workspace:*"
"@ofs/validation": "workspace:*"
```

`workspace:*` is a pnpm-native protocol that links the local package. No version numbers. No npm registry lookups.

---

### Step 3 — Create Infrastructure Directories

| Directory | Contents |
|---|---|
| `infra/supabase/` | Supabase CLI configuration (`config.toml`); `migrations/` directory for Supabase-managed SQL (storage policies, RLS rules — separate from Prisma migrations) |
| `infra/scripts/` | Shell scripts for CI tasks: `migrate.sh`, `seed.sh`, `health-check.sh` |
| `docs/releases/` | Empty directory; placeholder for release note files |
| `docs/post-mortems/` | Empty directory; placeholder for post-mortem files |
| `.github/workflows/` | CI pipeline YAML files |

---

### Step 4 — Verify Workspace Linkage

After all directories and `package.json` files exist, run `pnpm install` from the repository root. This step:

1. Resolves all workspace packages
2. Links `@ofs/*` packages into each consumer's `node_modules` via symlinks
3. Generates `pnpm-lock.yaml`
4. Reports any missing peer dependencies

The `pnpm-lock.yaml` file is committed to the repository and is the authoritative dependency lock for all environments. It is never manually edited.

**Fix → Explain → Continue:** If `pnpm install` reports peer dependency warnings, each warning is evaluated individually. Warnings from framework packages with known peer tolerance mismatches (e.g. React version ranges) are added to `.npmrc` as `peerDependencyRules`. Warnings that indicate a genuine incompatibility are resolved before continuing.

---

### Step 5 — Verify Turborepo Graph

Run `turbo run build --dry --graph` to produce the dependency graph. Confirm:

- `@ofs/config` has no upstream dependencies
- `@ofs/types` depends only on `@ofs/config`
- `apps/web` depends on `@ofs/ui`, `@ofs/types`, `@ofs/validation`, `@ofs/utils`, `@ofs/api-contracts`
- `apps/api` depends on `@ofs/database`, `@ofs/types`, `@ofs/validation`, `@ofs/logger`, `@ofs/audit`
- `apps/worker` depends on `@ofs/database`, `@ofs/types`, `@ofs/logger`, `@ofs/audit`
- No circular edges exist

If the graph contains an unexpected edge, the offending dependency is removed from the `package.json` and the graph is re-verified before continuing.

---

## 5. Shared Package Initialization

**Responsible Agent:** Infrastructure Agent (tooling packages) · Types Agent (`@ofs/types`) · Database Agent (`@ofs/database`)  
**Reviewing Agent:** Architecture Agent  
**Quality Gate:** Each package's designated Quality Gate owner (see §21 of `MONOREPO_ARCHITECTURE.md`)

---

### Initialization Sequence

Packages are initialised in dependency order. A package's source files are created only after all packages it depends on are initialised. The sequence is:

```
1. @ofs/config        (no dependencies — already done in §3 Group C)
2. @ofs/types         (depends on @ofs/config)
3. @ofs/utils         (depends on @ofs/config, @ofs/types)
4. @ofs/validation    (depends on @ofs/config, @ofs/types)
5. @ofs/logger        (depends on @ofs/config)
6. @ofs/database      (depends on @ofs/config, @ofs/types)
7. @ofs/audit         (depends on @ofs/config, @ofs/types, @ofs/logger, @ofs/database)
8. @ofs/api-contracts (depends on @ofs/config, @ofs/types)
9. @ofs/ui            (depends on @ofs/config, @ofs/types, @ofs/utils)
```

Steps 5 and 6 (`@ofs/logger` and `@ofs/database`) are independent of each other and may be initialised in parallel.

Steps 7, 8, and 9 (`@ofs/audit`, `@ofs/api-contracts`, `@ofs/ui`) are independent of each other and may be initialised in parallel after steps 1–6 are complete.

---

### @ofs/types — Initialization

**Owner:** Types Agent

Create the directory structure and export stubs in the following order:

| File | Contents at Phase 1 |
|---|---|
| `src/utility/index.ts` | `TenantScoped<T>`, `AuditedEntity`, `SoftDeletable`, `Paginated<T>`, `CursorPaginated<T>`, `ApiResponse<T>`, `StatusConfig<TStatus>` type definitions |
| `src/enums/index.ts` | Empty — domain enums are added in Phase 2 per domain module |
| `src/entities/` | Empty directory with a `.gitkeep` — domain entity interfaces added in Phase 2 |
| `src/dto/common.dto.ts` | `PaginationParams`, `SortParams`, `FilterParams`, `ApiErrorDetail` DTO types |
| `src/dto/` | All other DTO files are stubs — empty re-exports — added in Phase 2 |
| `src/index.ts` | Re-exports all of the above |

The utility types are the only content required in Phase 1. All domain types are Phase 2 work.

**Quality gate:** `pnpm typecheck --filter=@ofs/types` passes with zero errors. G-18 passes.

---

### @ofs/utils — Initialization

**Owner:** Utilities Agent

| File | Contents at Phase 1 |
|---|---|
| `src/date/format.ts` | `formatDate(date: Date, locale?: string): string` — implements `DD MMM YYYY` output; Arabic month abbreviations as default; English month abbreviations when `locale = 'en'` |
| `src/date/parse.ts` | `parseDate(str: string): Date` — parses `DD MMM YYYY` strings in both locales |
| `src/date/index.ts` | Re-exports date functions |
| `src/money/arithmetic.ts` | `addMoney`, `subtractMoney` — `BigInt` only; no `number` arguments accepted |
| `src/money/format.ts` | `formatMoney(amount: bigint, currency: string, locale?: string): string` — stub; returns `"${amount} ${currency}"` at Phase 1; full implementation in Phase 2 |
| `src/money/index.ts` | Re-exports money functions |
| `src/rtl/direction.ts` | `resolveDirection(locale: string): 'rtl' \| 'ltr'` — returns `'rtl'` for `ar`; `'ltr'` otherwise |
| `src/rtl/index.ts` | Re-exports RTL functions |
| `src/pagination/offset.ts` | `offsetFromPage(page: number, pageSize: number): number` |
| `src/pagination/cursor.ts` | `encodeCursor`, `decodeCursor` — base64 encode/decode stubs |
| `src/pagination/index.ts` | Re-exports pagination functions |
| `src/string/slug.ts` | `toSlug(str: string): string` — stub implementation |
| `src/string/index.ts` | Re-exports string functions |
| `src/index.ts` | Re-exports all modules |

`formatDate` and `resolveDirection` are fully implemented in Phase 1 — they underpin the RTL and date-format non-negotiable rules and are tested from the first commit.

**Quality gate:** `pnpm typecheck --filter=@ofs/utils` passes. `formatDate(new Date('2026-01-15'), 'ar')` returns `'15 يناير 2026'`. `formatDate(new Date('2026-01-15'), 'en')` returns `'15 Jan 2026'`. G-19 passes.

---

### @ofs/validation — Initialization

**Owner:** Validation Agent

| File | Contents at Phase 1 |
|---|---|
| `src/primitives/cuid.primitive.ts` | `cuidPrimitive` — `z.string().regex(/^c[a-z0-9]{24}$/)` |
| `src/primitives/money.primitive.ts` | `moneyPrimitive` — `z.bigint().nonnegative()` with `allowNegative` option |
| `src/primitives/date.primitive.ts` | `datePrimitive` — `z.string()` with a `DD MMM YYYY` parse refinement; transforms to `Date` |
| `src/primitives/currency.primitive.ts` | `currencyPrimitive` — `z.string().length(3).toUpperCase()` |
| `src/primitives/locale.primitive.ts` | `localePrimitive` — `z.enum(['ar', 'en'])` |
| `src/primitives/index.ts` | Re-exports all primitives |
| `src/messages/ar.messages.ts` | Arabic Zod error message map stub |
| `src/messages/en.messages.ts` | English Zod error message map stub |
| `src/schemas/` | Empty directory — domain schemas added per module in Phase 2 |
| `src/factories/` | Empty directory — workflow and custom-field factories added in Phase 3 |
| `src/index.ts` | Re-exports primitives and messages |

**Quality gate:** `pnpm typecheck --filter=@ofs/validation` passes. G-20 passes.

---

### @ofs/logger — Initialization

**Owner:** Infrastructure Agent

| File | Contents at Phase 1 |
|---|---|
| `src/logger.ts` | `createLogger(service: string, level?: string): Logger` factory wrapping Pino; accepts `service` name (`'api'`, `'web'`, `'worker'`); sets JSON format in production, pretty-print in development |
| `src/redaction.ts` | Exports the redaction path list (all PII and secret field names catalogued in §16 of `MONOREPO_ARCHITECTURE.md`) |
| `src/types.ts` | `Logger` interface with `debug`, `info`, `warn`, `error`, `fatal` methods and a `child(bindings)` method |
| `src/index.ts` | Re-exports `createLogger`, `Logger` type, redaction config |

The logger is fully functional at Phase 1 — it is required by both `@ofs/audit` and all three applications.

**Quality gate:** `pnpm typecheck --filter=@ofs/logger` passes. G-22 passes.

---

### @ofs/database — Initialization

**Owner:** Database Agent

| Step | Action |
|---|---|
| D-1 | Create `prisma/schema.prisma` with the datasource block (`postgresql`), generator block, and the `db` + `directUrl` environment variable references |
| D-2 | Create the baseline migration — an empty migration that marks the starting point of the migration history |
| D-3 | Run `prisma generate` to produce the Prisma Client in `node_modules/.prisma/client` |
| D-4 | Create `src/client.ts` exporting `db` (OLTP primary) and `dbRead` (read replica) singleton instances |
| D-5 | Create `src/index.ts` re-exporting `db`, `dbRead`, and the full Prisma generated type surface |
| D-6 | Create `prisma/seed/index.ts` as an empty seed entry point that logs `'Seed complete'` without inserting any data |

The Prisma schema at Phase 1 contains only the datasource and generator blocks. No models. Domain models are added in Phase 2 per domain section of `PRISMA_SCHEMA_BLUEPRINT.md`.

The generated Prisma Client is added to `.gitignore`. It is regenerated by the `pnpm db:generate` command during development and by CI before the build step.

**Quality gate:** `pnpm db:generate` completes without error. `pnpm db:migrate` applies the baseline migration to the local database. `pnpm db:seed` logs `'Seed complete'`. G-21 passes.

---

### @ofs/audit — Initialization

**Owner:** Audit Agent

| File | Contents at Phase 1 |
|---|---|
| `src/emitter.ts` | `AuditEmitter` class with a single `emit(payload: AuditPayload): Promise<void>` method; at Phase 1, the method logs the payload via `@ofs/logger` and returns — no database write yet (the `AuditLog` model does not exist until Phase 2) |
| `src/types.ts` | `AuditPayload` interface: `tenantId`, `actorId`, `actorType`, `action`, `resourceType`, `resourceId`, `before`, `after`, `requestId`, `occurredAt` |
| `src/decorator.ts` | `@Auditable` decorator stub — applies metadata; interceptor implementation added in Phase 2 when NestJS modules are wired |
| `src/index.ts` | Re-exports `AuditEmitter`, `AuditPayload`, `Auditable` |

**Fix → Explain → Continue:** The `AuditEmitter.emit()` method writes to the logger only at Phase 1. This is intentional — the database model does not exist yet. The stub ensures consuming code compiles and imports resolve. When the `AuditLog` model is added in Phase 2, the emit method is updated to write to the database in the same transaction as the mutation. This is documented here so the Phase 2 implementer knows the expected change.

**Quality gate:** `pnpm typecheck --filter=@ofs/audit` passes. G-23 passes.

---

### @ofs/api-contracts — Initialization

**Owner:** Backend Agent

| File | Contents at Phase 1 |
|---|---|
| `src/client/factory.ts` | `createApiClient(baseUrl: string, getToken: () => Promise<string>): ApiClient` stub — returns an object with no methods at Phase 1; endpoint methods are added in Phase 2 per domain |
| `src/client/index.ts` | Re-exports `createApiClient` |
| `src/endpoints/` | Empty directory — endpoint files added per domain in Phase 2 |
| `src/webhooks/payload.types.ts` | Empty stub — webhook payload types added in Phase 2 |
| `src/index.ts` | Re-exports client factory |

**Quality gate:** `pnpm typecheck --filter=@ofs/api-contracts` passes. G-25 passes.

---

### @ofs/ui — Initialization

**Owner:** Frontend Agent

This is the most critical Phase 1 package for the non-negotiable rules. RTL-first rendering, Rubik font, and the green theme must be operational from the first working commit.

| File | Contents at Phase 1 |
|---|---|
| `src/tokens/colours.ts` | Full professional green token scale: `--colour-primary-50` through `--colour-primary-950`; semantic aliases: `--colour-surface-page`, `--colour-text-primary`, `--colour-border-default`, `--colour-status-success/warning/error/info/neutral` |
| `src/tokens/typography.ts` | `--font-rubik` CSS variable declaration; font stack fallback: `'Rubik', 'Helvetica Neue', Arial, sans-serif` |
| `src/tokens/spacing.ts` | 4px base-unit spacing scale: `--space-1` (4px) through `--space-16` (64px) |
| `src/tokens/index.ts` | Re-exports all token definitions |
| `src/providers/rtl-provider.tsx` | `RtlProvider` React context; reads `locale` prop; sets `direction` and `isRtl` context values; applies `dir` attribute to its wrapper element |
| `src/providers/theme-provider.tsx` | `ThemeProvider` React component; injects all CSS custom properties from the token definitions into the document root via a `<style>` tag |
| `src/providers/index.ts` | Re-exports `RtlProvider`, `ThemeProvider` |
| `src/components/status-badge.tsx` | `StatusBadge` component stub — accepts `status: string`, `config: Record<string, { labelAr: string; label: string; colour: string }>`, `locale?: string`; renders the Arabic label by default using `labelAr`; applies `--colour-status-{colour}` token |
| `src/components/date-display.tsx` | `DateDisplay` component — accepts `date: Date`, `locale?: string`; renders via `formatDate` from `@ofs/utils`; always outputs `DD MMM YYYY` |
| `src/components/index.ts` | Re-exports `StatusBadge`, `DateDisplay` |
| `src/index.ts` | Re-exports providers, components, tokens |

The Rubik font WOFF2 files are placed in `apps/web/public/fonts/` (not in this package — the package only declares the CSS variable). Font loading is the responsibility of `apps/web`'s root layout.

**Quality gate:** `pnpm typecheck --filter=@ofs/ui` passes. `RtlProvider` and `ThemeProvider` export without error. `StatusBadge` renders the `labelAr` field when no locale override is provided. G-24 passes.

---

### Phase 1 Completion Checklist

Before Phase 1 is closed and Phase 2 is started, every item in this list must be checked:

- [ ] All 25 CI gates (G-1 through G-25) pass
- [ ] `pnpm dev` starts all three apps with no console errors
- [ ] `apps/web` root renders with `dir="rtl"` and `lang="ar"`
- [ ] Rubik font loads from `localhost:3007/fonts/`
- [ ] `formatDate` returns `DD MMM YYYY` in both locales
- [ ] `StatusBadge` renders Arabic label by default
- [ ] `AuditEmitter.emit()` logs to the logger without throwing
- [ ] `db` and `dbRead` Prisma clients connect to the local database
- [ ] Prisma baseline migration is applied and `prisma migrate status` reports no pending migrations
- [ ] All nine `@ofs/*` packages compile to `dist/` without errors
- [ ] `pnpm build --filter=web` succeeds
- [ ] `pnpm build --filter=api` succeeds
- [ ] CI pipeline passes on a push to `develop`
- [ ] A second build run with no source changes shows 100% Turborepo cache hits
- [ ] The Phase 1 PR is reviewed and approved by the Architecture Agent and Infrastructure Agent before merge

---

## 6. Frontend Foundation Setup

**Responsible Agent:** Frontend Agent  
**Reviewing Agent:** Infrastructure Agent, Design Agent  
**Quality Gate:** Frontend Agent

---

### Objective

Establish a running Next.js App Router application on port `3007` that satisfies the three non-negotiable UI rules from the first commit: Arabic-first locale, RTL root layout, and Rubik font. No business UI is built in Phase 1. The frontend delivers a root health page, a locale-routing middleware, and a fully wired design system provider tree.

---

### Setup Sequence

#### Step 1 — Next.js Scaffold

Initialise `apps/web` as a Next.js App Router application. The scaffold must use:

- App Router only — no `pages/` directory is created
- TypeScript strict mode extending `@ofs/config/tsconfig/nextjs.json`
- No default sample pages — the scaffold is cleared down to the minimum required files immediately after generation

Minimum required files after clearing the scaffold:

| File | Purpose |
|---|---|
| `next.config.ts` | Next.js configuration; sets `output`, internationalization stub, and custom port `3007` |
| `tsconfig.json` | Extends `@ofs/config/tsconfig/nextjs.json`; adds path aliases for `@/*` pointing to `src/` |
| `postcss.config.js` | Tailwind CSS PostCSS pipeline (Tailwind is the CSS utility layer for `apps/web`) |
| `tailwind.config.ts` | References `--colour-*`, `--space-*`, `--font-rubik` tokens from `@ofs/ui`; extends the default theme with OFS token values; adds `dir` variant for RTL-specific utilities |
| `package.json` | Declares `@ofs/ui`, `@ofs/types`, `@ofs/utils`, `@ofs/validation`, `@ofs/api-contracts` as workspace dependencies |

---

#### Step 2 — Rubik Font Loading

Rubik WOFF2 files are placed in `apps/web/public/fonts/`. Four weights are required: 400, 500, 600, 700. Both Arabic and Latin subsets for each weight.

File naming convention:

```
public/fonts/
  rubik-arabic-400.woff2
  rubik-arabic-500.woff2
  rubik-arabic-600.woff2
  rubik-arabic-700.woff2
  rubik-latin-400.woff2
  rubik-latin-500.woff2
  rubik-latin-600.woff2
  rubik-latin-700.woff2
```

The root CSS file declares the `@font-face` rules and assigns the `--font-rubik` CSS variable. `font-display: swap` is required on every `@font-face` declaration.

---

#### Step 3 — Locale Routing Middleware

`apps/web/middleware.ts` handles three concerns on every request, in this order:

| Priority | Concern | Action |
|---|---|---|
| 1 | Locale detection | Reads `Accept-Language` header and `NEXT_LOCALE` cookie; resolves to `ar` (default) or `en`; redirects to `/<locale>/...` if the locale prefix is missing |
| 2 | Auth check | Reads the Supabase session cookie; if absent on a protected route, redirects to `/<locale>/login` |
| 3 | Tenant resolution | Reads the subdomain from the `Host` header; stores the resolved `tenantId` in a request header (`x-tenant-id`) for downstream RSC fetch calls |

At Phase 1, the auth check always passes (stub) and the tenant resolution sets a hardcoded development `tenantId`. Both stubs are replaced in Phase 2 when the identity module is built.

**Fix → Explain → Continue:** The middleware stubs are intentional. Running without real auth in Phase 1 allows the frontend to be developed and tested without a complete identity system. Each stub is marked with a `// TODO(Phase 2):` comment specifying the replacement action. The stub is not a security gap in Phase 1 because Phase 1 produces no user-facing deployment.

---

#### Step 4 — App Router Directory Structure

Create the following directory structure under `apps/web/app/`. Files are stubs only — no business content.

```
app/
├── [locale]/
│   ├── layout.tsx          # Root layout: injects RtlProvider, ThemeProvider, Rubik font class
│   ├── page.tsx            # Root redirect: sends / → /ar automatically
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx    # Login page stub: renders "Login — Phase 2"
│   └── (dashboard)/
│       ├── layout.tsx      # Dashboard shell stub: renders children only
│       └── dashboard/
│           └── page.tsx    # Dashboard stub: renders "Dashboard — Phase 2"
└── api/
    └── health/
        └── route.ts        # Health check route handler: returns { status: 'ok', app: 'web' }
```

---

#### Step 5 — Root Layout Requirements

`app/[locale]/layout.tsx` is the most important file in Phase 1 for the non-negotiable rules. It must:

| Requirement | Implementation |
|---|---|
| Set `lang` attribute | `<html lang={locale}>` — resolves to `ar` or `en` |
| Set `dir` attribute | `<html dir={locale === 'ar' ? 'rtl' : 'ltr'}>` — `rtl` is the default |
| Mount `ThemeProvider` | Injects all `--colour-*`, `--space-*`, `--font-rubik` CSS variables |
| Mount `RtlProvider` | Provides `direction` and `isRtl` context to all descendant components |
| Apply Rubik font class | Applies the font CSS variable to the `<body>` element |
| Set page metadata | Default `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">` |

The `dir="rtl"` attribute on the root `<html>` element is gate G-16. This file is the single place where that attribute is set. It must never be overridden by child layouts without an explicit documented justification.

---

#### Step 6 — next-intl Configuration

`next-intl` is configured with two message catalogues: Arabic (`ar`) and English (`en`).

| File | Contents at Phase 1 |
|---|---|
| `messages/ar.json` | `{ "common": { "loading": "جاري التحميل", "error": "حدث خطأ", "health": "النظام يعمل" } }` |
| `messages/en.json` | `{ "common": { "loading": "Loading", "error": "An error occurred", "health": "System healthy" } }` |
| `lib/i18n/config.ts` | `next-intl` configuration; defines supported locales `['ar', 'en']`; sets `ar` as default |
| `lib/i18n/request.ts` | Server-side message loader for RSC components |

All message keys added in Phase 2 and beyond follow the `"<domain>.<key>"` pattern. No flat keys. No inline strings in components.

---

#### Step 7 — Typed API Client Instance

`apps/web/lib/api/index.ts` creates and exports the singleton `apiClient` instance from `@ofs/api-contracts`. At Phase 1, the client has no endpoint methods — it is a typed stub. Its presence here ensures the import resolves correctly and the token injection middleware is wired.

---

#### Phase 1 Frontend Verification

| Check | Expected result |
|---|---|
| `GET http://localhost:3007/` | Redirects to `http://localhost:3007/ar` |
| `GET http://localhost:3007/ar` | Returns HTTP 200; HTML `<html dir="rtl" lang="ar">` |
| `GET http://localhost:3007/en` | Returns HTTP 200; HTML `<html dir="ltr" lang="en">` |
| `GET http://localhost:3007/api/health` | Returns `{ "status": "ok", "app": "web" }` |
| Network tab — fonts | `rubik-arabic-400.woff2` and `rubik-latin-400.woff2` are fetched on first load |
| CSS variables in DevTools | `--colour-primary-500`, `--font-rubik`, `--space-4` are visible on `:root` |

---

## 7. Backend Foundation Setup

**Responsible Agent:** Backend Agent  
**Reviewing Agent:** Infrastructure Agent, Architecture Agent  
**Quality Gate:** Backend Agent

---

### Objective

Establish a running NestJS application that accepts HTTP requests, applies the global middleware chain, and responds to a health check endpoint. No domain modules exist at Phase 1. The backend delivers the core infrastructure — guards, pipes, interceptors, exception filter, and the tenant context service — all as operational stubs that will be filled in as domain modules are added in Phase 2.

---

### Setup Sequence

#### Step 1 — NestJS Scaffold

Initialise `apps/api` as a NestJS application using the Nest CLI or a manual scaffold. The scaffold must use:

- Express adapter (not Fastify — Vercel's Serverless Function integration is better tested with Express)
- TypeScript strict mode extending `@ofs/config/tsconfig/base.json`
- `src/` as the source root
- No sample controller or service from the CLI — cleared immediately after generation

Minimum required files after clearing the scaffold:

| File | Purpose |
|---|---|
| `src/main.ts` | Bootstrap: creates the NestJS app; applies global configuration; listens on `API_PORT` (default 3000) |
| `src/app.module.ts` | Root module: imports `CoreModule` only at Phase 1 |
| `tsconfig.json` | Extends `@ofs/config/tsconfig/base.json`; enables `emitDecoratorMetadata` and `experimentalDecorators` |
| `tsconfig.build.json` | Excludes `test/` and `**/*.spec.ts` from the production build |
| `package.json` | Declares `@ofs/database`, `@ofs/types`, `@ofs/validation`, `@ofs/logger`, `@ofs/audit` as workspace dependencies |

---

#### Step 2 — Global Bootstrap Configuration

`src/main.ts` applies the following configuration at startup, in this order:

| Order | Configuration | Detail |
|---|---|---|
| 1 | `enableCors()` | Restrict to allowed origins from `API_ALLOWED_ORIGINS` environment variable |
| 2 | `useGlobalPipes` | `ZodValidationPipe` from `core/pipes/` — validates all request bodies |
| 3 | `useGlobalFilters` | `GlobalExceptionFilter` from `core/filters/` — wraps all errors in the standard `ApiResponse` envelope |
| 4 | `useGlobalInterceptors` | `ResponseTransformInterceptor` — wraps all successful responses in `ApiResponse` envelope |
| 5 | `useGlobalInterceptors` | `LoggingInterceptor` — emits request-received and request-completed log lines |
| 6 | `setGlobalPrefix` | All routes prefixed with `/v1` |

At Phase 1, `ZodValidationPipe` passes all bodies through without validation (no schemas exist yet). The pipe is wired and operational — domain schemas are registered in Phase 2.

---

#### Step 3 — Core Module

`src/core/` contains all cross-cutting infrastructure. At Phase 1, each sub-module is a functional stub:

| Sub-module | Phase 1 state | What it does now |
|---|---|---|
| `core/config/` | Operational | Loads and validates environment variables via Zod schema; exports `ConfigService` |
| `core/database/` | Operational | Imports `db` and `dbRead` from `@ofs/database`; exports `DatabaseModule` with both clients as providers |
| `core/logger/` | Operational | Creates a Pino logger instance via `@ofs/logger`; exports `LoggerModule` and `AppLogger` injectable |
| `core/tenant/` | Stub | `TenantContext` request-scoped service; at Phase 1 always returns `tenantId = 'ofs_dev_tenant'`; replaced in Phase 2 |
| `core/auth/` | Stub | `AuthGuard` always returns `true` at Phase 1; replaced in Phase 2 with Supabase JWT verification |
| `core/guards/` | Stub | `TenantGuard` always passes at Phase 1; `PermissionGuard` always passes at Phase 1 |
| `core/pipes/` | Operational | `ZodValidationPipe` wired but passes through until domain schemas exist |
| `core/filters/` | Operational | `GlobalExceptionFilter` catches all exceptions; formats them into the `ApiResponse` error envelope |
| `core/interceptors/` | Operational | `ResponseTransformInterceptor` wraps successful responses; `LoggingInterceptor` logs all requests |
| `core/audit/` | Operational | `AuditModule` wraps `@ofs/audit`; provides `AuditEmitter` as an injectable NestJS provider |

**Fix → Explain → Continue:** All stubs are marked with `// TODO(Phase 2):` comments and the specific replacement action. The stubs allow the application to start and accept requests before the identity system exists. They are not deployed to a production environment — Phase 1 produces only a local development environment.

---

#### Step 4 — Health Check Endpoint

A standalone `HealthController` is registered in `AppModule` (not inside `CoreModule`). It is the only controller in Phase 1.

| Route | Method | Response | Auth required |
|---|---|---|---|
| `/health` | GET | `{ "status": "ok", "timestamp": "<ISO 8601>", "database": "connected \| disconnected" }` | No — `@Public()` decorator bypasses `AuthGuard` |

The health check verifies the database connection by executing `db.$queryRaw\`SELECT 1\`` and reports `"connected"` or `"disconnected"` in the response. A disconnected database returns HTTP 200 with `"database": "disconnected"` — the application is alive even when the database is unreachable. HTTP 500 is reserved for unhandled exceptions, not for dependency failures.

---

#### Step 5 — Request Lifecycle Wiring

The complete request lifecycle from §14 of `MONOREPO_ARCHITECTURE.md` is wired at Phase 1 with stubs in place of real implementations:

```
HTTP Request
  → GlobalExceptionFilter         (operational)
  → AuthGuard                     (stub: always passes)
  → TenantGuard                   (stub: always passes)
  → PermissionGuard               (stub: always passes)
  → ZodValidationPipe             (stub: passes all bodies through)
  → Controller method
  → LoggingInterceptor            (operational)
  → ResponseTransformInterceptor  (operational)
  → HTTP Response
```

The operational pieces are fully implemented and tested. Replacing a stub in Phase 2 means implementing the guard or pipe — the wiring does not change.

---

#### Step 6 — Worker Application

`apps/worker/src/main.ts` bootstraps a minimal NestJS application with:

- No HTTP adapter — the worker never accepts external requests
- A `WorkerHealthModule` that opens a minimal HTTP listener on an internal port for the container health probe only
- `BullMQ` module wired to the Redis URL from environment
- A `WorkerLogger` instance for structured job logging

At Phase 1, no queues and no job consumers exist. The worker starts, connects to Redis, logs `Worker started — awaiting jobs`, and stays alive. Queues and consumers are registered in Phase 2 per domain.

---

#### Phase 1 Backend Verification

| Check | Expected result |
|---|---|
| `GET http://localhost:3000/v1/health` | `{ "status": "ok", "database": "connected", "timestamp": "..." }` |
| `POST http://localhost:3000/v1/health` | HTTP 404 — route does not exist |
| `GET http://localhost:3000/v1/nonexistent` | HTTP 404 wrapped in `ApiResponse` error envelope |
| Worker process | Logs `Worker started — awaiting jobs`; does not exit |
| `apps/api` startup log | Logs `Application listening on port 3000` with structured JSON |
| Database health | `db.$queryRaw\`SELECT 1\`` returns without error |

---

## 8. Database Foundation Setup

**Responsible Agent:** Database Agent  
**Reviewing Agent:** Backend Agent  
**Quality Gate:** Database Agent

---

### Objective

Establish the `@ofs/database` package as the sole point of database access in the monorepo. At Phase 1, the package delivers two working Prisma client instances, a baseline migration, and a runnable seed entry point. No domain models exist yet. The database layer must be production-ready in its structure so that adding models in Phase 2 requires only schema changes — no restructuring of the package.

---

### Setup Sequence

#### Step 1 — Package Structure Finalisation

Confirm the following structure is in place after §5 (Package Initialization):

```
packages/database/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   └── 0000_baseline/
│   │       └── migration.sql    # Empty migration establishing the baseline
│   └── seed/
│       └── index.ts             # Entry point — logs 'Seed complete'
├── src/
│   ├── client.ts                # Exports db and dbRead
│   └── index.ts                 # Public surface
└── package.json
```

---

#### Step 2 — Client Configuration

`src/client.ts` exports two Prisma client instances. Each instance is a singleton created once at module load time and reused across all imports.

**`db` — OLTP Primary**

Configuration requirements:
- Connects to `DATABASE_URL` (PgBouncer transaction mode, port 6543)
- `log` levels set to `['warn', 'error']` in production; `['query', 'info', 'warn', 'error']` in development
- `errorFormat` set to `'minimal'` in production; `'pretty'` in development

**`dbRead` — Read Replica**

Configuration requirements:
- Connects to `DATABASE_READ_URL`
- Same log and error format settings as `db`
- If `DATABASE_READ_URL` is not set (e.g. in local development with a single database), falls back to `DATABASE_URL` with a startup warning logged via `@ofs/logger`

The fallback to `DATABASE_URL` when `DATABASE_READ_URL` is absent is the correct behaviour for local development. Developers do not run a read replica locally. The warning ensures this fallback is never silently active in production.

---

#### Step 3 — Connection Validation

On first import of `@ofs/database`, the package does not eagerly connect. Prisma uses lazy connection — the first query establishes the connection.

A `validateConnection()` exported function performs `db.$queryRaw\`SELECT 1\`` and returns `true` or `false`. This function is called by:
- `apps/api` health check controller (to report database status)
- The `pnpm db:validate` script (for CI verification)

---

#### Step 4 — Script Registration

The following scripts are registered in `packages/database/package.json` and called by root-level pnpm scripts:

| Script | Command | Called by |
|---|---|---|
| `generate` | `prisma generate` | `pnpm db:generate` at root |
| `migrate:dev` | `prisma migrate dev` | `pnpm db:migrate:dev` at root (development only) |
| `migrate:deploy` | `prisma migrate deploy` | `pnpm db:migrate` at root (CI and production) |
| `migrate:status` | `prisma migrate status` | `pnpm db:status` at root |
| `seed` | `tsx prisma/seed/index.ts` | `pnpm db:seed` at root |
| `studio` | `prisma studio` | `pnpm db:studio` at root |
| `validate` | `tsx src/validate.ts` | `pnpm db:validate` at root |

All database scripts are run from `packages/database/` as the working directory so that Prisma resolves `schema.prisma` correctly. The root `package.json` scripts use `turbo run <script> --filter=@ofs/database` to delegate to the package.

---

#### Step 5 — Prisma Client Gitignore

The generated Prisma Client output (`node_modules/.prisma/client/`) is excluded from git. Regeneration happens:
- Locally: any developer running `pnpm db:generate` or `pnpm install` (postinstall hook)
- CI: the `build` pipeline task runs `prisma generate` before compiling TypeScript

A `postinstall` script in `packages/database/package.json` triggers `prisma generate` automatically after every `pnpm install`. This ensures new developers never encounter a missing generated client.

---

## 9. Prisma Foundation Setup

**Responsible Agent:** Database Agent  
**Reviewing Agent:** Backend Agent, Architecture Agent  
**Quality Gate:** Schema Agent

---

### Objective

Establish `schema.prisma` as the correctly structured foundation that all 24 domain sections of `PRISMA_SCHEMA_BLUEPRINT.md` will be appended to incrementally. At Phase 1, the schema contains only the datasource and generator blocks and zero models. Every structural decision made here cannot be changed without a migration.

---

### schema.prisma Baseline Structure

The baseline schema file has four sections, in this order:

**Section 1 — Generator**

One generator block:
- Provider: `prisma-client-js`
- Output: default (generates into `node_modules/.prisma/client`)
- `previewFeatures`: none at Phase 1

**Section 2 — Datasource**

One datasource block:
- Provider: `postgresql`
- URL: reads from `DATABASE_URL` environment variable
- `directUrl`: reads from `DATABASE_DIRECT_URL` environment variable — used by Prisma Migrate to bypass PgBouncer

The `directUrl` is mandatory. Without it, `prisma migrate deploy` fails against a PgBouncer transaction-mode connection because migrations require session-mode semantics.

**Section 3 — Enums**

Empty at Phase 1. Domain enums are appended here as each domain module is implemented. Comments delimit each domain section:

```
// ─── §9 Platform ──────────────────────────────────────
// ─── §10 Identity & Access ────────────────────────────
// ... etc
```

**Section 4 — Models**

Empty at Phase 1. Models are appended in the same domain section order as `PRISMA_SCHEMA_BLUEPRINT.md`.

---

### Migration Strategy at Phase 1

**Baseline migration**

The baseline migration (`0000_baseline/migration.sql`) is an empty SQL file. Its sole purpose is to establish the migration history table in the database so that subsequent `prisma migrate deploy` calls have a reference point.

| File | Contents |
|---|---|
| `prisma/migrations/0000_baseline/migration.sql` | Empty file (zero bytes is valid) |
| `prisma/migrations/migration_lock.toml` | Auto-generated by Prisma; specifies `provider = "postgresql"`; committed to the repository |

The `migration_lock.toml` file is committed. It prevents Prisma from applying migrations against a database with a different provider than the one used to generate them.

**Migration naming convention**

All migrations after the baseline follow this naming pattern:

```
<timestamp>_<domain>_<description>/migration.sql
```

Examples:
```
20260115000001_platform_plans_and_features/migration.sql
20260115000002_identity_users_and_roles/migration.sql
20260115000003_crm_leads_and_activities/migration.sql
```

The timestamp prefix ensures chronological ordering. The domain prefix makes the migration's scope visible without opening the file. The description is a brief snake_case summary of what the migration creates or changes.

---

### Post-Migration SQL Strategy

Some database objects cannot be expressed in Prisma schema syntax:

| Object type | Examples | Delivery mechanism |
|---|---|---|
| Materialized views | `mv_revenue_by_tenant_month` | Separate raw SQL file run after `prisma migrate deploy` |
| Full-text search indexes | `CREATE INDEX ... USING GIN` | Appended to the domain migration that creates the parent table |
| Table partitioning | `audit_log`, `stock_movement` range partitions | Applied in a follow-up migration after the table exists |
| Trigger functions | None at Phase 1 | Added only when a specific requirement arises in later phases |

Raw SQL extensions are stored in `prisma/migrations/<timestamp>_<name>_extras/extras.sql`. The `infra/scripts/migrate.sh` script runs `prisma migrate deploy` followed by each pending `extras.sql` file.

---

### Seed Architecture

`prisma/seed/index.ts` is the entry point for all seed operations. At Phase 1 it is an empty runner. As domain modules are added in Phase 2 and beyond, domain-specific seed files are imported and called in dependency order:

| Execution order | Seed file | When added |
|---|---|---|
| 1 | `platform.seed.ts` | Phase 2 — with Plan and Tenant models |
| 2 | `identity.seed.ts` | Phase 2 — with User, Role, Permission models |
| 3 | `reference.seed.ts` | Phase 2 — with TaxRate, AccountType, LeaveType models |

Each seed file uses `upsert` operations keyed on the natural unique constraint of each entity. Running the seed twice produces no duplicate records. Seed files never use `create` for data that has a unique constraint.

---

### Prisma Studio Configuration

`prisma studio` is available via `pnpm db:studio` for local database inspection. It connects to the local Supabase PostgreSQL instance using `DATABASE_URL`.

Prisma Studio is a development tool only. It has no production equivalent and is not included in any deployment pipeline.

---

### Phase 1 Prisma Verification

| Check | Expected result |
|---|---|
| `pnpm db:generate` | Generates Prisma Client without errors; output includes `PrismaClient` class with no model methods (schema has no models yet) |
| `pnpm db:migrate` | Applies baseline migration; `prisma migrate status` reports `Database schema is up to date` |
| `pnpm db:seed` | Logs `Seed complete`; exits with code 0 |
| `pnpm db:validate` | `validateConnection()` returns `true`; logs `Database connection verified` |
| `pnpm db:studio` | Opens Prisma Studio at `http://localhost:5555` with an empty model list |
| TypeScript import | `import { db } from '@ofs/database'` resolves without error in `apps/api` |

---

## 10. Supabase Foundation Setup

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Database Agent, Backend Agent  
**Quality Gate:** Infrastructure Agent

---

### Objective

Configure the Supabase local development stack using the Supabase CLI. At Phase 1, local Supabase provides the PostgreSQL database that Prisma connects to, the Auth service that will be integrated in Phase 2, and the Storage service for later phases. The production Supabase project is created and its credentials are documented but no production data is written during Phase 1.

---

### Local Supabase Setup Sequence

#### Step 1 — Supabase CLI Installation

The Supabase CLI is installed as a root dev dependency. All developers on the team access it via pnpm scripts — no global installation is required.

Scripts registered at the root `package.json` level:

| Script | Command | Purpose |
|---|---|---|
| `supabase:start` | `supabase start` | Starts the full local Supabase stack via Docker |
| `supabase:stop` | `supabase stop` | Stops the local stack and persists data |
| `supabase:status` | `supabase status` | Prints all local service URLs and API keys |
| `supabase:reset` | `supabase db reset` | Resets the local database to a clean state and re-applies migrations |

---

#### Step 2 — Supabase Project Initialisation

`infra/supabase/` is the Supabase project root. The Supabase CLI is initialised here, producing `config.toml`.

Key `config.toml` settings at Phase 1:

| Setting | Value | Reason |
|---|---|---|
| `project_id` | `ofs` | Local project identifier |
| `api.port` | `54321` | Supabase API gateway (Kong) port |
| `db.port` | `54322` | PostgreSQL direct port for migrations |
| `studio.port` | `54323` | Supabase Studio local port |
| `auth.enabled` | `true` | Auth service starts with the stack |
| `storage.enabled` | `true` | Storage service starts with the stack |
| `auth.site_url` | `http://localhost:3007` | Redirect URL for auth callbacks |
| `auth.email.enable_signup` | `true` | Allow email signup in local development |
| `inbucket.port` | `54324` | Local email capture for password reset testing |

---

#### Step 3 — Prisma Datasource Alignment

Prisma connects to the Supabase local PostgreSQL via PgBouncer. The local environment variable values come from the output of `supabase status`:

| Environment variable | Source | Value pattern |
|---|---|---|
| `DATABASE_URL` | `supabase status` → `DB URL` with PgBouncer port | `postgresql://postgres:postgres@127.0.0.1:54322/postgres?pgbouncer=true` |
| `DATABASE_DIRECT_URL` | `supabase status` → `DB URL` (direct) | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| `DATABASE_READ_URL` | Same as `DATABASE_URL` in local dev | Falls back to primary; warning is expected |
| `SUPABASE_URL` | `supabase status` → `API URL` | `http://127.0.0.1:54321` |
| `SUPABASE_ANON_KEY` | `supabase status` → `anon key` | Long JWT string |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase status` → `service_role key` | Long JWT string — never committed |

These values are placed in `.env.local` by each developer after running `supabase status`. They are never committed to the repository.

---

#### Step 4 — Supabase Migrations Directory

Supabase maintains its own migrations directory for SQL that lives outside Prisma schema management. These are SQL objects that Prisma cannot express and that must be applied to the Supabase-managed database.

```
infra/supabase/migrations/
  0000_storage_policies.sql    # Phase 3 — Storage bucket policies
  0000_rls_attachments.sql     # Phase 3 — RLS on attachment table
```

At Phase 1, this directory contains only a `.gitkeep`. Supabase migrations are applied via `supabase db push` after Prisma migrations have run.

The relationship between Prisma migrations and Supabase migrations:

| Migration type | Tool | Applies | Contains |
|---|---|---|---|
| Schema migrations | Prisma Migrate | Tables, indexes, enums, constraints | All Prisma models |
| Platform migrations | Supabase CLI | Supabase-specific SQL | Storage policies, RLS rules, pg_cron jobs |

The two migration systems are independent. A developer applies Prisma migrations first, then Supabase migrations. The CI `migrate.sh` script enforces this order.

---

#### Step 5 — Auth Configuration

At Phase 1, Supabase Auth runs locally but is not connected to `apps/api`. The connection is made in Phase 2 when the identity module is built.

Phase 1 Auth configuration tasks:

| Task | Detail |
|---|---|
| Confirm Auth service starts | `supabase start` output includes `Auth service ready` |
| Confirm email capture | Inbucket email capture is reachable at `http://localhost:54324` |
| Document JWT secret | The local `JWT_SECRET` from `supabase status` is recorded in `.env.local`; it is used by the Phase 2 `AuthGuard` to verify tokens |
| Confirm Auth Studio | Supabase Studio at `http://localhost:54323` shows the Authentication panel with zero users |

---

#### Step 6 — Production Supabase Project

The production Supabase project is created via the Supabase dashboard. At Phase 1, the following are completed:

| Task | Detail |
|---|---|
| Project creation | Project named `ofs-production`; region selected to minimise latency to the primary deployment region |
| Credentials documented | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` recorded in the team password manager and in the Vercel project environment variables |
| Read replica enabled | Supabase read replica enabled in the project settings; `DATABASE_READ_URL` recorded |
| PgBouncer confirmed | Transaction-mode PgBouncer URL (port 6543) confirmed and recorded as `DATABASE_URL` for production |
| Direct URL confirmed | Direct PostgreSQL URL (port 5432) confirmed and recorded as `DATABASE_DIRECT_URL` for migration execution |

No schema migrations are applied to the production database during Phase 1. The production database is empty at the end of Phase 1. Migrations are applied during the first Phase 2 deployment.

---

### Phase 1 Supabase Verification

| Check | Expected result |
|---|---|
| `supabase start` | All services start without error; no Docker port conflicts |
| `supabase status` | Prints `API URL`, `DB URL`, `Studio URL`, `anon key`, `service_role key` |
| `http://localhost:54321` | Supabase API gateway responds |
| `http://localhost:54323` | Supabase Studio loads with the local project |
| `http://localhost:54324` | Inbucket email capture loads |
| `pnpm db:migrate` (after supabase start) | Prisma baseline migration applies to the local Supabase PostgreSQL |
| `pnpm db:validate` | Reports `Database connection verified` against the Supabase local database |

---

## 11. Authentication Foundation

**Responsible Agent:** Backend Agent  
**Reviewing Agent:** Security Agent  
**Quality Gate:** Security Agent

---

### Objective

Replace the Phase 1 `AuthGuard` stub with a real Supabase JWT verification implementation. Authentication is the outer boundary of the entire API — every request that carries a token is verified here before reaching any controller. No domain-specific logic lives in the auth layer; it only answers the question: *is this token valid, and who does it belong to?*

Phase 1 delivers a fully operational `AuthGuard`. It is not a stub. Security is non-negotiable from the moment the API accepts real requests.

---

### Supabase JWT Model

Supabase Auth issues signed JWTs. Each token carries:

| Claim | Field | Description |
|---|---|---|
| Subject | `sub` | The user's UUID — maps to `User.id` in the application database |
| Email | `email` | The user's verified email address |
| Role | `role` | Supabase role string — `authenticated` for regular users, `anon` for public |
| App metadata | `app_metadata` | Tenant assignments and plan metadata injected by the application at sign-up |
| User metadata | `user_metadata` | User-facing profile data |
| Issued at | `iat` | Token issue timestamp |
| Expiry | `exp` | Token expiry timestamp — Supabase default is 1 hour |

The JWT secret for verification is the `JWT_SECRET` from Supabase project settings. In local development this comes from `supabase status`. In production it is stored as `API_JWT_SECRET` in Vercel environment variables.

---

### Setup Sequence

#### Step 1 — JWT Verification

`src/core/auth/jwt.service.ts` is responsible for one operation: accept a raw JWT string, verify its signature against `API_JWT_SECRET`, check the expiry, and return the decoded payload or throw an `UnauthorizedException`.

This service has no external I/O beyond the cryptographic verification. It never calls Supabase's API during normal request handling. The signature verification is entirely local using the shared secret.

---

#### Step 2 — AuthGuard Implementation

`src/core/auth/auth.guard.ts` replaces the Phase 1 stub. The guard:

| Step | Action |
|---|---|
| 1 | Extracts the `Authorization: Bearer <token>` header from the request |
| 2 | Passes the token to `JwtService.verify()` |
| 3 | Attaches the decoded payload to `request.user` |
| 4 | Allows the request to continue |

If no `Authorization` header is present, or the token is invalid or expired, the guard throws `UnauthorizedException`. The `GlobalExceptionFilter` catches this and returns HTTP 401 in the standard `ApiResponse` error envelope.

The `@Public()` decorator bypasses the guard. It is applied only to routes that are explicitly designed for unauthenticated access: the health check endpoint, the login endpoint (Phase 2), and password reset flow endpoints (Phase 2). All other routes require a valid token.

---

#### Step 3 — User Context Extraction

After `AuthGuard` sets `request.user`, a `CurrentUser` parameter decorator extracts the authenticated user from the request context. Controllers use this decorator to receive the verified user identity without accessing the raw request object.

The extracted user object at this stage contains only what is in the JWT: `userId` (`sub`), `email`, and `role`. The full `User` database record is fetched by the service layer on demand — not eagerly on every request.

---

#### Step 4 — Session Handling Strategy

Supabase Auth manages token lifecycle — issuance, refresh, and revocation. The API does not issue or refresh tokens. Its only responsibility is verification.

| Concern | Owner | Detail |
|---|---|---|
| Token issuance | Supabase Auth | Triggered by login form in `apps/web` via the Supabase client library |
| Token refresh | Supabase Auth client (`apps/web`) | The browser-side Supabase client refreshes the access token silently before expiry |
| Token revocation | Supabase Auth | Triggered by logout; the API does not maintain a token denylist in Phase 1 |
| Server-side session | `apps/web` RSC | RSC components use the Supabase server client with cookie-based session; no token is passed in URL parameters |

Token revocation via a denylist is a Phase 3 concern. Phase 1 and Phase 2 rely on short-lived tokens (1-hour expiry) and Supabase's built-in revocation.

---

#### Step 5 — Password Reset Flow Stub

The password reset flow is owned by Supabase Auth. The API does not implement a custom reset flow in Phase 1. The Supabase-generated reset email contains a link back to `apps/web/[locale]/(auth)/reset-password/` which uses the Supabase client to process the reset token and set a new password.

A `PasswordResetToken` model exists in the Prisma schema blueprint (§10) for application-layer audit of reset events. This model is added in Phase 2 alongside the identity module.

---

#### Phase 1 Auth Verification

| Check | Expected result |
|---|---|
| Request with no `Authorization` header | HTTP 401, `ApiResponse` error envelope, `code: 'UNAUTHORIZED'` |
| Request with malformed token | HTTP 401, `ApiResponse` error envelope |
| Request with expired token | HTTP 401, `ApiResponse` error envelope, `code: 'TOKEN_EXPIRED'` |
| Request with valid token | Request proceeds; `request.user.userId` equals the JWT `sub` claim |
| `GET /v1/health` with no token | HTTP 200 — `@Public()` route bypasses guard |

---

## 12. Authorization Foundation (RBAC)

**Responsible Agent:** Backend Agent  
**Reviewing Agent:** Security Agent  
**Quality Gate:** Security Agent

---

### Objective

Establish the Role-Based Access Control foundation. Authorization answers a different question from authentication: *is this verified user allowed to perform this action?* At Phase 1, the RBAC system is structurally complete — the guard, the decorator, and the permission evaluation service exist and are wired — but it operates against a hardcoded bootstrap permission set because the database models for `Role`, `Permission`, and `UserRole` do not exist until Phase 2. The Phase 2 identity module replaces the bootstrap set with live database lookups without changing any guard wiring.

---

### RBAC Model

The permission model follows the pattern established in `PRISMA_SCHEMA_BLUEPRINT.md` §10:

| Concept | Description |
|---|---|
| `Permission` | A named capability string in `DOMAIN:ACTION` format — e.g. `orders:create`, `hr:approve_leave`, `accounting:post_journal` |
| `Role` | A named collection of permissions assigned at the tenant level |
| `UserRole` | The assignment of a role to a user within a specific tenant |

Authorization evaluation: a request is permitted if the authenticated user has at least one `UserRole` assignment within the current tenant that includes the required `Permission`.

---

### Setup Sequence

#### Step 1 — Permission String Convention

All permission strings follow `DOMAIN:ACTION` in snake_case. They are defined as constants in `@ofs/types/src/enums/permissions.ts`. No permission string is invented inline in a guard or controller — all permissions are declared in this central catalogue.

At Phase 1, the constants file is created with an empty export. Domain-specific permission constants are added in Phase 2 alongside each domain module.

The `DOMAIN:ACTION` pattern is enforced by an ESLint rule that rejects any string literal matching the `\w+:\w+` pattern in guard or controller files unless it references a constant from `@ofs/types`.

---

#### Step 2 — PermissionGuard Implementation

`src/core/guards/permission.guard.ts` replaces the Phase 1 stub.

The guard reads the required permission from route metadata set by the `@RequirePermission('domain:action')` decorator. It then:

| Step | Action |
|---|---|
| 1 | Reads `tenantId` from `TenantContext` (set by `TenantGuard`) |
| 2 | Reads `userId` from `request.user` (set by `AuthGuard`) |
| 3 | Calls `PermissionService.hasPermission(userId, tenantId, requiredPermission)` |
| 4 | Allows or throws `ForbiddenException` |

If a route has no `@RequirePermission` decorator, the guard allows the request. This is correct — not all authenticated routes require a specific permission beyond authentication itself.

---

#### Step 3 — PermissionService Bootstrap

`src/core/auth/permission.service.ts` at Phase 1 operates against a hardcoded bootstrap permission set:

| Bootstrap user | Permissions |
|---|---|
| Any authenticated user with `role = 'authenticated'` in the JWT | `*:read` on all domains — read-only access |
| System service account (`actorType = SYSTEM`) | All permissions |

This bootstrap set is replaced in Phase 2 when `Role`, `Permission`, and `UserRole` models exist in the database. The `hasPermission()` method signature does not change — only its implementation changes from reading the bootstrap map to querying the database.

**Fix → Explain → Continue:** The bootstrap permission set grants all authenticated users read-only access. This is intentional — Phase 1 produces no production deployment and no real user data. The bootstrap is documented here so Phase 2 implementers know it must be replaced before the identity module is considered complete.

---

#### Step 4 — Super-Admin Bypass

A `SUPER_ADMIN` role bypasses all permission checks. This role is assigned only to tenant owner accounts created at tenant registration time (Phase 2). At Phase 1 the super-admin bypass is wired but never triggered because no real user accounts exist.

The bypass is implemented by checking for a `superAdmin: true` flag on the `TenantUser` record — not by checking user IDs or email addresses. Hardcoded user ID checks in permission logic are forbidden.

---

#### Step 5 — `@RequirePermission` Decorator

`src/core/guards/require-permission.decorator.ts` is a NestJS metadata decorator that attaches a permission string to a controller method. It is defined at Phase 1 and used throughout Phase 2 and beyond as domain controllers are built.

Usage pattern for Phase 2 reference:

```
@Get(':id')
@RequirePermission('orders:read')
findOne(@Param('id') id: string) { ... }
```

No controller method that mutates data is permitted without a `@RequirePermission` decorator. This is enforced by an ESLint custom rule that flags `@Post`, `@Patch`, `@Delete` handler methods missing the decorator.

---

#### Phase 1 RBAC Verification

| Check | Expected result |
|---|---|
| Authenticated request to `GET /v1/health` | HTTP 200 — no permission required |
| `PermissionGuard` with no `@RequirePermission` decorator | Guard allows request |
| `PermissionGuard` with `@RequirePermission('orders:read')` and bootstrap user | Guard allows (bootstrap grants `*:read`) |
| `PermissionGuard` with `@RequirePermission('orders:create')` and bootstrap user | Guard blocks — `create` is not in the bootstrap read-only set |
| Request with valid token but no tenant context | `TenantGuard` rejects before `PermissionGuard` runs |

---

## 13. Tenant Isolation Foundation

**Responsible Agent:** Backend Agent  
**Reviewing Agent:** Security Agent, Architecture Agent  
**Quality Gate:** Architecture Agent

---

### Objective

Establish tenant isolation as an architectural guarantee, not a convention. By the end of this section, it is structurally impossible for a request to reach a repository method without a verified `tenantId` in scope. Every database query that touches tenant-owned data will carry a `tenantId` parameter enforced by TypeScript types — not by developer discipline.

---

### Tenant Resolution Model

The `tenantId` for each request is resolved from one of two sources, in priority order:

| Priority | Source | Detail |
|---|---|---|
| 1 | Subdomain | `acme.ofs.app` → tenant with `slug = 'acme'` |
| 2 | `X-Tenant-ID` header | Explicit tenant ID passed by the frontend for API calls from non-subdomain contexts (local development, integration tests) |

If neither source yields a valid tenant, the request is rejected with HTTP 403 before reaching any controller.

---

### Setup Sequence

#### Step 1 — TenantContext Service

`src/core/tenant/tenant.context.ts` is a **request-scoped** NestJS provider. Request-scoped means a new instance is created for every incoming HTTP request. This scope is mandatory — a singleton would leak tenant context between concurrent requests.

The service exposes:

| Method / Property | Description |
|---|---|
| `tenantId: string` | The verified tenant ID for this request; throws if accessed before resolution |
| `set(tenantId: string)` | Called once by `TenantGuard` during resolution; throws if called a second time |
| `isSet(): boolean` | Returns `true` if tenant resolution has been completed |

Once set, `tenantId` is immutable for the lifetime of the request. No service method can change it mid-request.

---

#### Step 2 — TenantGuard Implementation

`src/core/guards/tenant.guard.ts` replaces the Phase 1 stub. It runs after `AuthGuard` in the guard execution chain.

| Step | Action |
|---|---|
| 1 | Extract the `Host` header; parse the subdomain segment |
| 2 | If a subdomain is present, look up the tenant by `slug` in the database via `TenantRepository` |
| 3 | If no subdomain, read the `X-Tenant-ID` header and validate it is a known CUID |
| 4 | Confirm the authenticated user (`request.user.userId`) has an active `TenantUser` record for this tenant |
| 5 | Call `TenantContext.set(tenantId)` |
| 6 | Allow the request to continue |

If the tenant cannot be resolved, or the user has no `TenantUser` record for that tenant, the guard throws `ForbiddenException` with `code: 'TENANT_ACCESS_DENIED'`.

**Fix → Explain → Continue:** At Phase 1, Step 4 (TenantUser verification) cannot run because the `TenantUser` model does not exist yet. The guard skips Step 4 and logs a warning. The skip is clearly commented with `// TODO(Phase 2): re-enable TenantUser verification when identity module is complete`. This is documented here so the Phase 2 implementer knows exactly what to enable.

---

#### Step 3 — Repository Enforcement Pattern

Every repository method that accesses tenant-owned data must accept `tenantId` as its first parameter — typed as `string`, not optional. This is enforced at the TypeScript level.

The pattern is established at Phase 1 via a `BaseTenantRepository` abstract class:

- Declares `protected readonly tenantId: string` as an abstract property
- Every concrete repository method signature requires `tenantId` as the first argument
- The abstract class is imported from `@ofs/database` and extended by all domain repositories in Phase 2

A TypeScript compiler error is the enforcement mechanism. A repository method compiled without a `tenantId` parameter will not compile because the abstract contract is violated. This is stronger than a linting rule.

---

#### Step 4 — TenantId Injection Into Prisma Queries

The pattern for every Prisma query in every repository is:

```
WHERE tenant_id = :tenantId AND ...
```

This is achieved by including `{ tenantId }` as the first condition in every `where` clause. There is no Prisma middleware or plugin that auto-injects `tenantId` — explicit inclusion is required so that missing tenant scoping surfaces as a compile-time error when using the typed repository pattern, not as a runtime data leak.

Prisma middleware for `tenantId` injection is explicitly rejected as an approach. Middleware is transparent and cannot be verified by TypeScript's type system. Explicit parameters can be verified.

---

#### Step 5 — Cross-Tenant Access Prevention

The following rules are enforced by the repository base class, TypeScript types, and ESLint rules:

| Rule | Enforcement |
|---|---|
| No repository method omits `tenantId` | TypeScript abstract contract |
| No raw `db.modelName.findMany()` without `where.tenantId` | ESLint rule flagging Prisma calls without a tenantId filter |
| No `db` query in a controller method | ESLint rule prohibiting Prisma imports in controller files |
| No cross-tenant join | Architecture rule — models do not have cross-tenant foreign keys; enforced by schema design |

---

#### Step 6 — Tenant Isolation in Tests

Integration tests operate against a dedicated `tenantId = 'test_tenant'` that is seeded before the test suite runs. Test data created by integration tests is always created under this tenant ID. Tests that attempt to query data created by another test's tenant ID return empty results — this is the expected isolation behaviour and is asserted in a dedicated `tenant-isolation.spec.ts` integration test file.

---

#### Phase 1 Tenant Isolation Verification

| Check | Expected result |
|---|---|
| Request with no subdomain and no `X-Tenant-ID` header | HTTP 403, `code: 'TENANT_ACCESS_DENIED'` |
| Request with `X-Tenant-ID` that is not a valid CUID | HTTP 403 |
| `TenantContext.tenantId` accessed before `TenantGuard` runs | Throws `TenantContextNotInitialisedException` |
| `TenantContext.set()` called twice in the same request | Throws `TenantContextAlreadySetException` |
| `BaseTenantRepository` subclass without `tenantId` in method signature | TypeScript compile error |

---

## 14. Audit Foundation

**Responsible Agent:** Audit Agent  
**Reviewing Agent:** Backend Agent  
**Quality Gate:** Audit Agent

---

### Objective

Upgrade `@ofs/audit` from its Phase 1 logger-only stub to a fully wired NestJS subsystem. By the end of this section, the `@Auditable` decorator causes audit records to be written to the database whenever an annotated service method completes successfully. The `AuditLog` Prisma model must be added to the schema before this section can be completed — that migration is the entry point for this section's work.

---

### Dependency on Schema

The audit foundation requires the `AuditLog` model from `PRISMA_SCHEMA_BLUEPRINT.md` §11 to be added to `schema.prisma` and migrated before `AuditEmitter.emit()` can write to the database. This is the first Prisma model added to the schema after the Phase 1 baseline.

Migration sequence:
1. Add `AuditLog` model to `schema.prisma`
2. Run `pnpm db:migrate:dev` to generate and apply the migration
3. Run `pnpm db:generate` to regenerate the Prisma Client with the new model
4. Implement `AuditEmitter.emit()` to write to `db.auditLog.create()`

---

### Setup Sequence

#### Step 1 — AuditEmitter Full Implementation

`packages/audit/src/emitter.ts` is upgraded from the Phase 1 stub:

| Before (Phase 1) | After (Audit Foundation) |
|---|---|
| Logs payload via `@ofs/logger` | Writes a row to `audit_log` via `db.$transaction` |
| Returns immediately | Awaits the database write before returning |
| No `before`/`after` diff | Accepts `before` and `after` objects; computes diff via `computeDiff()` |

The write is always performed in a transaction. If the caller provides a Prisma `TransactionClient`, the audit write joins that transaction. If no transaction is provided, the emitter opens its own. This ensures audit records are atomically tied to their mutations — if the audit write fails, the mutation rolls back.

---

#### Step 2 — Diff Computation

`packages/audit/src/diff.ts` implements `computeDiff(before: object, after: object): { before: object; after: object }`.

Rules:

| Rule | Detail |
|---|---|
| Only changed fields | Keys where `before[k] === after[k]` are excluded from both output objects |
| PII redaction | Keys on the redaction list (from `@ofs/logger`) are replaced with `'[REDACTED]'` in both `before` and `after` |
| BigInt serialisation | `BigInt` values are converted to strings before inclusion in the diff output |
| Timestamp exclusion | `updatedAt` and `updatedById` are always excluded — they change on every mutation and carry no informational value in a diff |
| Null equivalence | `undefined` and `null` are treated as equivalent — no spurious diff is generated for a field that transitions from `undefined` to `null` |

---

#### Step 3 — @Auditable Decorator Wiring

`packages/audit/src/decorator.ts` upgrades from a metadata-only stub to a full method decorator that works in conjunction with the NestJS `AuditInterceptor`.

The decorator attaches two pieces of metadata to the decorated service method:
- `action: string` — the audit action string in `SCREAMING_SNAKE_CASE`
- `resourceType: string` — the entity name matching the Prisma model name

The `AuditInterceptor` reads this metadata and:
1. Calls the service method
2. Captures the return value (the mutated entity)
3. Assembles the audit payload from the NestJS execution context
4. Calls `AuditEmitter.emit()` with the assembled payload and the return value

The interceptor only fires for methods decorated with `@Auditable`. Methods without the decorator are not audited. Missing the decorator on a mutation method is a code review gate violation.

---

#### Step 4 — AuditInterceptor

`src/core/audit/audit.interceptor.ts` is a NestJS `NestInterceptor` registered globally in `AppModule`. It:

| Step | Detail |
|---|---|
| Reads metadata | Checks whether the executing handler has `@Auditable` metadata |
| Skips | If no `@Auditable` metadata, passes through immediately with no overhead |
| Pre-call snapshot | Calls a `before` hook if provided by the decorator — used for update operations to capture the pre-mutation state |
| Executes handler | Calls `next.handle()` to execute the service method |
| Post-call emission | On success, emits the audit event with `before` snapshot and the method return value as `after` |
| On error | Does not emit an audit event for failed operations — a failed mutation has no state change to record |

---

#### Step 5 — Audit Context Assembly

The interceptor assembles the audit payload from these sources:

| Field | Source |
|---|---|
| `tenantId` | `TenantContext` (injected into the interceptor) |
| `actorId` | `request.user.userId` (set by `AuthGuard`) |
| `actorType` | `'USER'` for HTTP requests; `'SYSTEM'` when no user is in context |
| `requestId` | `request.headers['x-request-id']` — generated by `LoggingInterceptor` on arrival |
| `ipAddress` | `request.ip` with proxy header awareness (`X-Forwarded-For`) |
| `userAgent` | `request.headers['user-agent']` |
| `occurredAt` | `new Date()` at the moment of emission |

---

#### Step 6 — Worker Audit Context

Background jobs have no HTTP request context. The `AuditEmitter` accepts an `AuditContext` object as a direct parameter for worker-originated emissions:

| Field | Worker value |
|---|---|
| `actorType` | `'WORKER'` |
| `actorId` | The job name or system service account ID |
| `requestId` | The BullMQ `jobId` |
| `ipAddress` | `null` |
| `userAgent` | `null` |

This context shape is defined in `@ofs/audit/src/types.ts` at Phase 1. Worker jobs calling `AuditEmitter.emit()` pass this context explicitly.

---

#### Phase 1 Audit Verification

| Check | Expected result |
|---|---|
| `AuditEmitter.emit()` with database connected | Inserts a row in `audit_log`; returns without error |
| `computeDiff({ a: 1, b: 2 }, { a: 1, b: 3 })` | Returns `{ before: { b: 2 }, after: { b: 3 } }` |
| `computeDiff` with `password` field | `password` appears as `'[REDACTED]'` in both before and after |
| `@Auditable` on a service method | After method execution, an `audit_log` row exists with the correct `action` and `resourceType` |
| Service method throwing an error | No `audit_log` row is created |
| `AuditInterceptor` on a method without `@Auditable` | Interceptor passes through with zero overhead |

---

## 15. Logging Foundation

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Backend Agent  
**Quality Gate:** Infrastructure Agent

---

### Objective

Deliver a fully operational structured logging system across all three applications. Every log line from this point forward is structured JSON in production and human-readable in development. The `@ofs/logger` package is complete after this section — no further changes to the logging layer are expected in subsequent phases.

---

### Setup Sequence

#### Step 1 — @ofs/logger Full Implementation

`packages/logger/src/logger.ts` completes the `createLogger` factory with production-ready configuration:

| Config key | Development | Production |
|---|---|---|
| `transport` | `pino-pretty` with colour and timestamp | JSON to `stdout` — no pretty-printing |
| `level` | `debug` | Value of `LOG_LEVEL` env var, default `info` |
| `timestamp` | Human-readable | `pino.stdTimeFunctions.isoTime` — ISO 8601 UTC |
| `redact` | Redaction path list from `src/redaction.ts` | Same |
| `base` | `{ service, pid, hostname }` | `{ service }` only — no pid or hostname in serverless |
| `serializers` | Error serialiser, request serialiser | Same |

The `createLogger` factory returns a `Logger` interface instance that is identical in API whether called in development or production. Callers never branch on the environment.

---

#### Step 2 — Child Logger Pattern

The `Logger` interface exposes a `child(bindings: Record<string, unknown>): Logger` method. Child loggers inherit the parent's configuration and append the `bindings` to every log line they emit.

The child logger pattern is how context is propagated:

| Scope | Binding added |
|---|---|
| Application boot | `{ service: 'api' }` |
| Per-request | `{ requestId, tenantId, userId }` |
| Per-module | `{ module: 'OrdersService' }` |
| Per-job (worker) | `{ jobId, jobName, queue }` |

Each NestJS service creates a child logger bound to its module name. The child is created in the constructor and stored as a private field. All log calls within the service go through this child logger, ensuring every line carries the module name without the developer needing to include it in every message.

---

#### Step 3 — LoggingInterceptor

`src/core/interceptors/logging.interceptor.ts` is responsible for:

**On request arrival:**
- Generate a `requestId` UUID (or read from `X-Request-ID` header if provided by a load balancer)
- Set the `requestId` on the request object for downstream use
- Create a request-scoped child logger bound to `{ requestId, tenantId, userId, method, path }`
- Log at `info` level: request received

**On request completion:**
- Log at `info` level: request completed with `statusCode` and `durationMs`

**On request error:**
- Log at `error` level: request failed with `statusCode`, `durationMs`, and the serialised error

`durationMs` is computed using `process.hrtime.bigint()` for sub-millisecond precision. It is rounded to two decimal places in the log output.

---

#### Step 4 — NestJS Logger Adapter

NestJS uses its own internal `Logger` class for framework-level messages (module initialisation, route registration, application startup). These messages must route through `@ofs/logger` so that all log output — including framework messages — is in the same structured format.

`src/core/logger/nest-logger.adapter.ts` implements NestJS's `LoggerService` interface. It wraps a `@ofs/logger` instance and maps NestJS log levels to Pino log levels:

| NestJS level | Pino level |
|---|---|
| `log` | `info` |
| `error` | `error` |
| `warn` | `warn` |
| `debug` | `debug` |
| `verbose` | `trace` |

The adapter is passed to `NestFactory.create()` as the logger option in `main.ts`. From the first line of NestJS startup output, all logs are structured JSON in production.

---

#### Step 5 — Worker Logging

`apps/worker/src/main.ts` creates a logger via `createLogger('worker')`. Every BullMQ job consumer receives a job-scoped child logger at the start of each job execution:

| Event | Log level | Fields |
|---|---|---|
| Job started | `info` | `jobId`, `jobName`, `queue`, `attempt`, `tenantId` |
| Job completed | `info` | Above + `durationMs`, brief result summary |
| Job failed (will retry) | `warn` | Above + `error.message`, `nextAttemptDelayMs` |
| Job failed (exhausted) | `error` | Above + full `error`, `totalAttempts`, `movedToDeadLetter: true` |

The job-scoped child logger is created by a `JobLoggingWrapper` utility in `apps/worker/src/core/`. Job consumers call this wrapper instead of accessing BullMQ's `process()` method directly. The wrapper handles the start/complete/fail log lines automatically so individual consumer implementations do not need to remember to log them.

---

#### Step 6 — Frontend Logging

`apps/web` does not use `@ofs/logger` directly. Server-side RSC and Route Handler logging uses `console` in development and a lightweight `server-log` wrapper in production that formats output as structured JSON compatible with Vercel Log Drains.

Client-side error logging uses a browser-safe error capture utility (Phase 3 concern). At Phase 1 and Phase 2, unhandled client errors surface in the browser DevTools console only.

---

#### Step 7 — Log Correlation Across Services

The `requestId` generated by `LoggingInterceptor` is propagated through the system:

| Hop | How `requestId` travels |
|---|---|
| Frontend → API | `X-Request-ID` header set by the `@ofs/api-contracts` typed client |
| API → BullMQ job | Stored in the job's `data` payload as `originRequestId` |
| API → AuditLog | Stored in `AuditLog.requestId` |
| BullMQ job → worker log | Extracted from `job.data.originRequestId` and bound to the job child logger |

This chain means a single user action in the frontend can be traced end-to-end across the API log, the audit log, and the worker log using a single `requestId` value.

---

#### Phase 1 Logging Verification

| Check | Expected result |
|---|---|
| `pnpm dev` startup (`apps/api`) | First log line is structured JSON with `service: 'api'`, `level: 'info'`, `message: 'Application listening on port 3000'` |
| `GET /v1/health` | Two log lines emitted: request received and request completed, both with `requestId` |
| Request with auth error | One log line at `error` level with `statusCode: 401` and the error details |
| `console.log` anywhere in `apps/api` | ESLint error — `no-console` rule blocks merge |
| Log line with `password` field | Field value is `'[REDACTED]'` |
| Log line with `Authorization` header | Header value is `'[REDACTED]'` |
| Worker `pnpm dev` startup | Logs `Worker started — awaiting jobs` in structured JSON with `service: 'worker'` |

---

## 16. Validation Foundation

**Responsible Agent:** Validation Agent  
**Reviewing Agent:** Backend Agent, Frontend Agent  
**Quality Gate:** Validation Agent

---

### Objective

Wire `@ofs/validation` into both the backend request pipeline and the frontend form layer so that the same Zod schemas enforce the same rules in both places. At Phase 1, the primitive library is complete and the pipe is globally registered. Domain schemas are added in Phase 2 per module. The validation architecture must be in place before any domain module is built.

---

### Setup Sequence

#### Step 1 — ZodValidationPipe Full Implementation

`src/core/pipes/zod-validation.pipe.ts` replaces the Phase 1 pass-through stub with a fully operational implementation.

The pipe's responsibilities:

| Responsibility | Detail |
|---|---|
| Schema resolution | The pipe looks up the Zod schema for the current route by reading metadata set by a `@UseSchema(SchemaName)` decorator on the controller method |
| Parse and validate | Calls `schema.parseAsync(body)` with the request body |
| Transform | Returns the parsed, typed, and coerced value — not the raw body. `BigInt` coercion, date coercion, and string trimming are applied by the schema primitives |
| Error formatting | On `ZodError`, extracts all field-level errors and passes them to `GlobalExceptionFilter` in a structured shape |
| Locale awareness | Reads the `Accept-Language` header to resolve the error message locale before calling `parseAsync` |

If no schema is registered for a route, the pipe passes the body through unchanged. This is the correct behaviour for routes that have no request body (GET, DELETE) and for Phase 1 routes before domain schemas are registered.

---

#### Step 2 — @UseSchema Decorator

`src/core/pipes/use-schema.decorator.ts` attaches a schema identifier to a controller method. The `ZodValidationPipe` reads this identifier to resolve the correct schema.

The identifier is a string key that maps to a schema registered in the `SchemaRegistry` service. Domain modules register their schemas with the registry at module initialisation time in Phase 2.

At Phase 1, the registry is empty. The pipe passes all bodies through. No domain-specific validation errors are possible until a schema is registered.

---

#### Step 3 — Schema Registry

`src/core/pipes/schema.registry.ts` is a NestJS injectable singleton that maps string keys to Zod schemas.

| Method | Description |
|---|---|
| `register(key: string, schema: ZodSchema)` | Called by domain modules at initialisation to register their schemas |
| `resolve(key: string): ZodSchema \| undefined` | Called by `ZodValidationPipe` to look up the schema for the current route |

Domain modules register schemas in their `onModuleInit()` lifecycle hook. If a schema key is registered twice, the registry logs a warning and keeps the first registration. Duplicate registrations are a Phase 2 development-time error that surfaces immediately.

---

#### Step 4 — Error Shape from ZodError

When `schema.parseAsync()` throws a `ZodError`, the pipe transforms it into a structured error object passed to `GlobalExceptionFilter`:

| Field | Source |
|---|---|
| `code` | `'VALIDATION_ERROR'` — fixed string |
| `message` | Locale-resolved top-level error message: `'البيانات المدخلة غير صحيحة'` (Arabic default) |
| `details` | Array of `{ field: string, message: string }` — one entry per failed field |
| `httpStatus` | `422 Unprocessable Entity` |

The `field` path uses dot notation for nested fields: `address.city`, `lines.0.amount`. This matches the Zod error path format directly.

---

#### Step 5 — Frontend Form Validation Wiring

`apps/web` uses React Hook Form with the `zodResolver` adapter. The resolver references the same schema from `@ofs/validation` that the backend validates against.

The wiring pattern for every domain form in Phase 2:

| Layer | What happens |
|---|---|
| User submits form | React Hook Form calls `zodResolver(schema)` |
| Resolver runs | Same Zod schema as the backend; same primitives; same error messages |
| Field errors | Displayed in Arabic by default via the `ar.messages.ts` error map |
| Server validation | If the form submission reaches the API, the backend re-validates with the same schema |
| API error response | Field-level errors from the backend are merged into the React Hook Form error state |

The merge of backend field errors into the React Hook Form state is handled by a shared `useApiForm` hook in `apps/web/lib/hooks/`. This hook is defined at Phase 1 as a stub and fully implemented when the first domain form is built in Phase 2.

---

#### Step 6 — Locale-Aware Error Messages

The Zod global `errorMap` is configured in `packages/validation/src/messages/index.ts`. It selects error strings from the Arabic or English message map based on the current locale context.

In the backend: locale is read from the `Accept-Language` request header and passed to the pipe before `parseAsync` is called.

In the frontend: locale is read from the `next-intl` locale context and passed to the `zodResolver` configuration.

Both use the same message maps from `@ofs/validation`. Arabic is the default in both contexts. English messages are returned only when an explicit `en` locale override is provided.

---

#### Phase 1 Validation Verification

| Check | Expected result |
|---|---|
| POST with a valid body to any route | Pipe passes body through (no schema registered yet) |
| POST with an invalid CUID to any route | Once a schema using `cuidPrimitive` is registered, pipe returns HTTP 422 with Arabic field error |
| `moneyPrimitive` with a negative value | Returns Arabic error: `'يجب أن تكون القيمة موجبة'` |
| `datePrimitive` with `'15 Jan 2026'` | Parses successfully to `Date` object |
| `datePrimitive` with `'2026-01-15'` | Returns error — `YYYY-MM-DD` is not the accepted input format |
| Frontend form with invalid data | Field-level Arabic error messages render adjacent to each invalid input |

---

## 17. Error Handling Foundation

**Responsible Agent:** Backend Agent  
**Reviewing Agent:** Security Agent  
**Quality Gate:** Backend Agent

---

### Objective

Deliver a consistent, predictable error surface across the entire API. Every error — whether a validation failure, a business rule violation, an unhandled exception, or a missing route — produces a response in the same `ApiResponse` error envelope. No stack traces reach the client in production. No error reveals internal implementation details.

---

### Setup Sequence

#### Step 1 — GlobalExceptionFilter Full Implementation

`src/core/filters/global-exception.filter.ts` handles every exception thrown anywhere in the NestJS application. It is registered in `main.ts` via `useGlobalFilters()`.

The filter maps exception types to HTTP status codes and error codes:

| Exception type | HTTP status | `code` |
|---|---|---|
| `UnauthorizedException` | 401 | `UNAUTHORIZED` |
| `ForbiddenException` (no tenant) | 403 | `TENANT_ACCESS_DENIED` |
| `ForbiddenException` (no permission) | 403 | `PERMISSION_DENIED` |
| `NotFoundException` | 404 | `NOT_FOUND` |
| Validation error (from pipe) | 422 | `VALIDATION_ERROR` |
| `ConflictException` | 409 | `CONFLICT` |
| `BadRequestException` | 400 | `BAD_REQUEST` |
| `BusinessRuleException` (custom) | 422 | Domain-specific code set by thrower |
| `Prisma.PrismaClientKnownRequestError` P2002 | 409 | `DUPLICATE_RECORD` |
| `Prisma.PrismaClientKnownRequestError` P2025 | 404 | `NOT_FOUND` |
| Any unhandled `Error` | 500 | `INTERNAL_SERVER_ERROR` |

All `500` responses in production return only `code: 'INTERNAL_SERVER_ERROR'` and a generic Arabic message. The stack trace and internal error message are logged at `error` level via `@ofs/logger` but never sent to the client.

---

#### Step 2 — Error Response Envelope

Every error response body conforms to `ApiResponse<null>` from `@ofs/types`:

```
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "البيانات المدخلة غير صحيحة",
    "details": [
      { "field": "email", "message": "البريد الإلكتروني غير صالح" }
    ]
  },
  "meta": {
    "requestId": "cm9x...",
    "timestamp": "2026-05-24T09:00:00.000Z"
  }
}
```

`details` is present only for validation errors (`VALIDATION_ERROR`). All other error types return `"details": null`. The `meta.requestId` is always included — it links the response to the structured log lines emitted during that request.

---

#### Step 3 — BusinessRuleException

`src/core/filters/business-rule.exception.ts` is a custom NestJS exception used by domain services to signal that an operation was rejected by a business rule, not by a technical failure.

It accepts:
- `code` — a domain-specific error code string, e.g. `'ORDER_ALREADY_CONFIRMED'`, `'INSUFFICIENT_STOCK'`
- `messageAr` — Arabic error message shown to the user
- `messageEn` — English error message shown to the user
- `details` — optional structured detail object

The filter maps `BusinessRuleException` to HTTP 422 with the domain-specific `code`. The `messageAr` or `messageEn` is selected based on the request locale.

Domain services throw `BusinessRuleException` for all business rejections. They never throw raw `Error` or NestJS `BadRequestException` for business logic failures. This separation keeps the exception handler clean: a `BadRequestException` always means a protocol-level bad request; a `BusinessRuleException` always means the request was valid but the business rejected the operation.

---

#### Step 4 — Unhandled Rejection and Uncaught Exception Handlers

`apps/api/src/main.ts` registers Node.js process-level handlers for uncaught exceptions and unhandled promise rejections:

| Event | Action |
|---|---|
| `uncaughtException` | Log at `fatal` level with full error; call `process.exit(1)` after a 500ms drain delay |
| `unhandledRejection` | Log at `error` level with full rejection reason; do not exit (serverless functions cannot exit reliably) |

These handlers are the last line of defence for errors that escape the NestJS exception handling layer. They should never fire in normal operation. Any occurrence is a bug that requires immediate investigation.

---

#### Step 5 — 404 Handler

NestJS does not apply the global exception filter to unmatched routes by default — it returns its own 404 format. The NestJS exception layer is configured to route unmatched requests through `GlobalExceptionFilter` by registering a wildcard route at the application level:

- Unmatched routes return HTTP 404 in the standard `ApiResponse` error envelope
- The `code` is `'NOT_FOUND'` and the `message` is `'المسار غير موجود'` (Arabic default)

---

#### Step 6 — Prisma Error Mapping

Prisma throws typed errors for known database constraint violations. The filter handles two critical cases:

| Prisma error code | Meaning | Response |
|---|---|---|
| `P2002` | Unique constraint violation | HTTP 409, `code: 'DUPLICATE_RECORD'`, `details` includes the constraint field name |
| `P2025` | Record not found during update or delete | HTTP 404, `code: 'NOT_FOUND'` |
| `P2003` | Foreign key constraint failure | HTTP 422, `code: 'REFERENCE_VIOLATION'` |
| All other Prisma errors | Unexpected database error | HTTP 500, `code: 'DATABASE_ERROR'` (logged with full Prisma error; not sent to client) |

The field name extracted from `P2002` errors is sanitised before being returned — only the field name is returned, not the full constraint name, to avoid leaking internal naming conventions.

---

#### Phase 1 Error Handling Verification

| Check | Expected result |
|---|---|
| `GET /v1/nonexistent-route` | HTTP 404, `ApiResponse` envelope, `code: 'NOT_FOUND'` |
| `POST /v1/health` | HTTP 404 (route not registered) |
| Unauthenticated request to a protected route | HTTP 401, `code: 'UNAUTHORIZED'` |
| Service throws `BusinessRuleException` | HTTP 422, domain-specific code, Arabic message |
| Unhandled `throw new Error('boom')` in a service | HTTP 500, `code: 'INTERNAL_SERVER_ERROR'`; stack trace in log only |
| Prisma `P2002` unique violation | HTTP 409, `code: 'DUPLICATE_RECORD'`, constraint field name in details |

---

## 18. Testing Foundation

**Responsible Agent:** QA Agent  
**Reviewing Agent:** Backend Agent, Frontend Agent  
**Quality Gate:** QA Agent

---

### Objective

Establish the testing infrastructure that all domain module tests will use from Phase 2 onward. At Phase 1, the testing framework is fully configured, shared test utilities exist, and the first cross-cutting tests (tenant isolation, auth guard, error filter) are written and passing. No domain tests exist yet — those are written alongside each domain module.

---

### Setup Sequence

#### Step 1 — Vitest Configuration

Each application and package has its own `vitest.config.ts` that extends a shared base configuration from `@ofs/config/vitest/base.config.ts`.

The shared base configuration sets:

| Setting | Value | Reason |
|---|---|---|
| `globals` | `true` | `describe`, `it`, `expect` are available without import in all test files |
| `environment` | `node` | Backend and package tests; `apps/web` overrides to `jsdom` |
| `coverage.provider` | `v8` | Built-in V8 coverage — no additional instrumentation |
| `coverage.reporter` | `['text', 'json', 'html']` | Text for CI logs; JSON for coverage upload; HTML for local inspection |
| `coverage.exclude` | `['**/*.spec.ts', '**/index.ts', '**/*.dto.ts', '**/*.types.ts']` | Exclude test files, barrel files, and type-only files from coverage metrics |
| `setupFiles` | `['@ofs/config/vitest/setup.ts']` | Shared global setup: BigInt serialiser, date mock reset, PII redaction verification |

The shared setup file (`@ofs/config/vitest/setup.ts`) adds one global `beforeEach`: resets all `vi.mock` state and restores any mocked dates. This prevents test pollution across test files without requiring manual cleanup in each file.

---

#### Step 2 — Test Utilities Package

`packages/config/vitest/` contains shared test utilities available to all test files via the setup file:

| Utility | Purpose |
|---|---|
| `createMockTenantContext(tenantId?)` | Returns a mock `TenantContext` with a stable `tenantId` (default: `'test_tenant'`) |
| `createMockUser(overrides?)` | Returns a mock authenticated user payload matching the JWT shape |
| `createMockRequest(overrides?)` | Returns a mock NestJS `ExecutionContext` with tenant context and user pre-set |
| `createMockAuditEmitter()` | Returns a `vi.fn()` mock of `AuditEmitter.emit` that captures calls for assertion |
| `createMockLogger()` | Returns a mock logger with all methods as `vi.fn()` — prevents log output in tests |
| `expectAuditEmitted(mock, action, resourceType)` | Assertion helper: verifies `AuditEmitter.emit` was called with the specified action and resource type |
| `expectNoAuditEmitted(mock)` | Assertion helper: verifies no audit event was emitted |

These utilities are the only mechanism for constructing test doubles of cross-cutting concerns. Domain tests never manually mock `TenantContext` or `AuditEmitter` — they use these factories.

---

#### Step 3 — Integration Test Database Helper

`apps/api/test/helpers/database.helper.ts` provides utilities for integration tests that interact with the real test database:

| Utility | Purpose |
|---|---|
| `getTestDb()` | Returns the `db` Prisma client configured with `DATABASE_TEST_URL` |
| `cleanTable(model, tenantId)` | Deletes all rows for `tenantId` in the specified Prisma model after a test |
| `runInTransaction(fn)` | Wraps a test in a Prisma transaction that is rolled back after the test — prevents test data accumulation without explicit cleanup |
| `seedTestTenant()` | Creates the `test_tenant` reference data required by integration tests: roles, permissions, plan, and tenant settings |
| `teardownTestTenant()` | Removes all `test_tenant` data; called in `afterAll` by integration test suites |

The `runInTransaction` pattern is preferred over `cleanTable` for integration tests because it guarantees cleanup even if the test throws. `cleanTable` is used only for tests that cannot run inside a transaction (e.g. tests that verify rollback behaviour).

---

#### Step 4 — Foundation Tests

The following tests are written in Phase 1 as part of the testing foundation. They test the cross-cutting infrastructure, not domain logic:

| Test file | Tests |
|---|---|
| `apps/api/test/unit/auth/auth.guard.spec.ts` | Valid token passes; expired token blocked; missing token blocked; `@Public()` bypasses guard |
| `apps/api/test/unit/tenant/tenant.guard.spec.ts` | Valid subdomain resolves tenant; missing subdomain and header rejected; double-set throws |
| `apps/api/test/unit/tenant/tenant.context.spec.ts` | `tenantId` immutable after set; access before set throws |
| `apps/api/test/unit/filters/exception.filter.spec.ts` | Each exception type maps to correct HTTP status and `code`; stack trace absent from 500 response |
| `apps/api/test/unit/audit/audit.emitter.spec.ts` | `emit` writes to database; failed call does not suppress caller error; diff computed correctly |
| `apps/api/test/unit/utils/diff.spec.ts` | Changed fields included; unchanged excluded; PII redacted; BigInt serialised; `updatedAt` excluded |
| `packages/utils/src/date/format.spec.ts` | Arabic output for `ar` locale; English output for `en` locale; all twelve months verified |
| `packages/validation/src/primitives/money.spec.ts` | Negative rejected; zero accepted; `BigInt` coercion from string; `allowNegative` option |
| `apps/api/test/integration/tenant-isolation.spec.ts` | Data created under `test_tenant` is not visible when queried under `other_tenant` |

These tests must all pass before Phase 1 is considered complete. They provide the confidence baseline that all cross-cutting infrastructure functions correctly before any domain module is built on top of it.

---

#### Step 5 — Coverage Baseline

At Phase 1, coverage measurements are established for the packages and modules that have source code:

| Package / Module | Phase 1 coverage target |
|---|---|
| `packages/utils/src/date/` | 100% — critical non-negotiable rule implementation |
| `packages/utils/src/money/` | 100% — accounting accuracy non-negotiable |
| `packages/validation/src/primitives/` | 95% |
| `apps/api/src/core/filters/` | 90% |
| `apps/api/src/core/auth/` | 90% |
| `apps/api/src/core/tenant/` | 90% |
| `packages/audit/src/` | 85% |

Coverage thresholds are enforced in `vitest.config.ts` per package. A CI run that drops below threshold fails the coverage gate and blocks merge.

---

#### Step 6 — Playwright Baseline

`apps/web/test/e2e/foundation.e2e.ts` contains the Phase 1 E2E baseline tests:

| Test | Assertion |
|---|---|
| Navigate to `http://localhost:3007/` | Redirects to `/ar`; response is HTTP 200 |
| Root `<html>` element | `dir` attribute is `rtl`; `lang` attribute is `ar` |
| Navigate to `http://localhost:3007/en` | `<html dir="ltr" lang="en">` |
| Rubik font loaded | Network request for `rubik-arabic-400.woff2` completes with status 200 |
| CSS variable present | `--colour-primary-500` is defined on `document.documentElement` |
| `--font-rubik` variable | Defined on `document.documentElement` |
| Navigate to `/ar/dashboard` | Redirects to `/ar/login` (auth stub redirects all protected routes) |

These tests run against the locally running `apps/web` instance. They must pass before any frontend domain work begins in Phase 2.

---

## 19. Performance Foundation

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Backend Agent, Frontend Agent  
**Quality Gate:** Infrastructure Agent

---

### Objective

Establish the performance infrastructure that prevents regressions as domain modules are added. At Phase 1, this means: read replica routing is verified, database connection limits are confirmed, Next.js build output is measured, and the Turborepo remote cache is operational. No domain-specific optimisations are possible at Phase 1 — the concern here is the baseline platform performance that all domain work inherits.

---

### Setup Sequence

#### Step 1 — Read Replica Routing Verification

`@ofs/database` exports both `db` (OLTP primary) and `dbRead` (read replica). Phase 1 verifies that:

- `db` and `dbRead` connect to separate endpoints (or the same endpoint with a logged warning in local dev)
- A write operation on `dbRead` throws a Prisma error (`ReadOnlyError`) — confirming the read replica is truly read-only
- The health check endpoint reports both connections independently

The `validateConnection()` function from §8 is extended to accept a `target: 'primary' | 'replica'` parameter and reports both connection statuses in the health check response:

```json
{
  "status": "ok",
  "database": {
    "primary": "connected",
    "replica": "connected"
  }
}
```

---

#### Step 2 — Connection Pool Verification

PgBouncer transaction-mode pooling is verified against the local Supabase stack at Phase 1. The verification confirms:

| Check | Method | Expected result |
|---|---|---|
| Multiple concurrent connections do not exhaust the pool | Open 10 simultaneous `db.$queryRaw\`SELECT 1\`` calls | All complete without `connection pool timeout` error |
| `connection_limit` in `DATABASE_URL` is set | Parse the URL | `connection_limit=1` is present for serverless function instances |
| `pgbouncer=true` in `DATABASE_URL` | Parse the URL | Present — required for Prisma to disable prepared statements, which PgBouncer transaction mode does not support |
| Direct URL bypasses PgBouncer | `DATABASE_DIRECT_URL` connects on port 5432 | Migration commands use this URL; application never uses this URL at runtime |

The `pgbouncer=true` parameter in `DATABASE_URL` is non-negotiable. Prisma uses prepared statements by default, which are not compatible with PgBouncer transaction mode. Missing this parameter causes subtle, intermittent query failures that are difficult to diagnose.

---

#### Step 3 — Next.js Bundle Analysis

After the first successful `pnpm build --filter=web`, Next.js bundle analysis is run to establish the Phase 1 baseline:

| Metric | Phase 1 target | Measurement |
|---|---|---|
| Initial JS bundle (first load) | < 150 kB gzip | `next build` output — First Load JS |
| Largest page bundle | < 80 kB gzip per route | `next build` output — per-route sizes |
| Font loading | WOFF2 only; no legacy formats | Network tab in Lighthouse |
| Unused CSS | < 5% unused rules | Coverage tab in Chrome DevTools |

If the initial bundle exceeds the target at Phase 1 (before any domain code exists), the cause is identified and resolved before Phase 2 begins. Common causes: a heavy dependency imported at the root layout level; a `ThemeProvider` importing an entire icon library; unnecessary `'use client'` on a layout component.

---

#### Step 4 — Turborepo Remote Cache Setup

The Turborepo remote cache is configured in `turbo.json` to use Vercel's Remote Cache (free for Vercel-deployed projects). The cache is enabled for CI from the first pipeline run.

Cache key composition:

| Input | Affects cache key |
|---|---|
| Source files in the package/app | Yes |
| `package.json` and lock file | Yes |
| Environment variable names (not values) | Yes — configured in `turbo.json` `env` array |
| Node.js version | Yes — from `.nvmrc` |
| Operating system | Yes — different CI runner OS breaks cache |

A pull request that modifies only `docs/` files hits 100% cache for all apps and packages. This is a CI performance gate — documentation-only PRs must not trigger full rebuilds.

---

#### Step 5 — API Response Time Baseline

The health check endpoint establishes the response time baseline for `apps/api`:

| Measurement | Tool | Target |
|---|---|---|
| Cold start (first request after deploy) | Vercel function logs | < 3 seconds (acceptable for serverless cold start) |
| Warm response time (subsequent requests) | `wrk` or `autocannon` | p95 < 50ms for `/v1/health` |
| Database query time | Prisma query log | `SELECT 1` < 5ms from PgBouncer |

These baselines are recorded in a `docs/performance/baselines.md` file created at Phase 1. Phase 2 and later phases append domain-specific measurements. A measurement that regresses a baseline by more than 20% triggers an alert.

---

#### Step 6 — Next.js Performance Configuration

`apps/web/next.config.ts` is configured with performance defaults at Phase 1:

| Configuration | Setting | Reason |
|---|---|---|
| Image optimisation | `images.formats: ['image/webp', 'image/avif']` | Modern format serving where supported |
| Compression | `compress: true` | Gzip compression for all serverless function responses |
| Strict mode | `reactStrictMode: true` | Detects accidental side effects in development; catches RTL rendering issues |
| Experimental | `optimizePackageImports: ['@ofs/ui', '@radix-ui/*']` | Tree-shakes large packages to reduce initial bundle |
| Headers | Security headers via `headers()` function | Applied at the edge; see §20 |
| Powered-by header | Removed | Does not reveal implementation details to attackers |

---

#### Phase 1 Performance Verification

| Check | Expected result |
|---|---|
| `pnpm build --filter=web` twice | Second build shows 100% Turbo cache hits |
| `GET /v1/health` warm response | p95 < 50ms over 100 requests |
| `db.$queryRaw\`SELECT 1\`` | Completes in < 5ms from local Supabase |
| `apps/web` First Load JS | < 150 kB gzip reported by `next build` |
| 10 concurrent DB connections | All complete without pool timeout |
| `DATABASE_URL` parsed | Contains `pgbouncer=true` and `connection_limit=1` |

---

## 20. Security Foundation

**Responsible Agent:** Security Agent  
**Reviewing Agent:** Backend Agent, Infrastructure Agent  
**Quality Gate:** Security Agent

---

### Objective

Establish the security baseline that all domain modules inherit. Security is applied at the infrastructure layer — HTTP headers, CORS, rate limiting, input constraints — so that domain modules do not need to implement security individually. A domain module that follows the standard anatomy (§14 of `MONOREPO_ARCHITECTURE.md`) is secure by default.

---

### Setup Sequence

#### Step 1 — Security HTTP Headers

`apps/web/next.config.ts` applies security headers to all responses via the `headers()` configuration function. These headers are applied at the Vercel Edge before any request reaches the application:

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | Strict policy: `default-src 'self'`; explicit allowlists for Supabase domain, font sources | Prevents XSS and data injection |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information |
| `Permissions-Policy` | Disables camera, microphone, geolocation | Restricts browser API access |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS for one year |
| `X-Request-ID` | Set by `LoggingInterceptor` | Enables request tracing in the browser |

The CSP is the most important header. It is configured strictly at Phase 1 and relaxed only with documented justification. A `script-src 'unsafe-inline'` directive is never permitted.

---

#### Step 2 — CORS Configuration

`apps/api/src/main.ts` configures CORS with an explicit allowlist:

| Setting | Value | Reason |
|---|---|---|
| `origin` | Array of allowed origins from `API_ALLOWED_ORIGINS` env var | Prevents requests from unauthorised domains |
| `methods` | `['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']` | Only methods the API uses; `PUT` excluded |
| `allowedHeaders` | `['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID', 'Accept-Language']` | Only headers the application uses |
| `credentials` | `true` | Required for cookie-based Supabase Auth sessions |
| `maxAge` | `86400` (24 hours) | Reduces preflight request frequency |

`API_ALLOWED_ORIGINS` in local development includes `http://localhost:3007`. In production it includes the Vercel production domain and all tenant subdomain patterns. Wildcard `*` is never used.

---

#### Step 3 — Rate Limiting

Rate limiting is applied at two layers:

**Layer 1 — Vercel Edge (apps/web)**

Vercel's built-in rate limiting is configured via `vercel.json`. Limits:

| Route pattern | Limit | Window |
|---|---|---|
| `/(auth)/login` | 5 requests | Per minute, per IP |
| `/(auth)/reset-password` | 3 requests | Per minute, per IP |
| All other routes | 120 requests | Per minute, per IP |

**Layer 2 — NestJS (apps/api)**

A `RateLimitGuard` using an in-process token bucket limits API requests per authenticated user:

| Route category | Limit | Window |
|---|---|---|
| Auth endpoints (login, reset) | 5 requests | Per minute, per IP |
| Mutation endpoints (POST, PATCH, DELETE) | 60 requests | Per minute, per user |
| Read endpoints (GET) | 300 requests | Per minute, per user |
| Import endpoints | 5 requests | Per minute, per tenant |

Rate limit exceeded responses return HTTP 429 in the standard `ApiResponse` error envelope with `code: 'RATE_LIMIT_EXCEEDED'` and a `Retry-After` header.

---

#### Step 4 — Input Constraints

Beyond Zod schema validation, the following input constraints are applied globally:

| Constraint | Enforcement | Value |
|---|---|---|
| Maximum request body size | NestJS `BodyParser` configuration | 10 MB — sufficient for JSON payloads; file uploads bypass the API body parser and go directly to Supabase Storage |
| Maximum URL length | Vercel Edge configuration | 8 KB |
| Maximum header count | NestJS configuration | 30 headers per request |
| JSON nesting depth | Custom middleware | Maximum 10 levels deep — prevents prototype pollution via deeply nested JSON |

The JSON nesting depth limit is implemented as a NestJS middleware that rejects requests with a body containing more than 10 levels of nesting before the body reaches any controller. This is a defence against algorithmic complexity attacks against recursive JSON parsers.

---

#### Step 5 — Dependency Audit

`pnpm audit` is run as part of the CI pipeline (Stage 1). The audit:

| Severity | Action |
|---|---|
| Critical | Blocks merge immediately; must be resolved before the PR can proceed |
| High | Blocks merge; must be resolved or a documented exception added within 24 hours |
| Moderate | Logged as a warning; must be resolved within the next sprint |
| Low | Logged; resolved opportunistically during dependency update chores |

A `pnpm audit --json` report is uploaded as a CI artefact for every run. The Security Agent reviews moderate and high findings before they are escalated to critical.

---

#### Step 6 — Secret Scanning

GitHub Advanced Security secret scanning is enabled on the repository. It scans every commit for patterns matching known secret formats: Supabase keys, AWS access keys, Stripe keys, SMTP passwords, private keys.

Additionally, a pre-commit hook runs `git diff --cached` through a local secret detection regex list before every commit. The hook rejects commits containing strings matching:

| Pattern | Matches |
|---|---|
| `eyJhbGciOi...` | JWT tokens committed as values |
| `sbp_...` | Supabase personal access tokens |
| `sk_live_...` | Stripe live secret keys |
| `-----BEGIN RSA PRIVATE KEY-----` | Private keys |
| Any 40+ character hex string in a `.env` file | Likely a secret value |

The pre-commit hook is installed via `pnpm prepare` in the root `package.json`, which runs `husky install`. All developers who run `pnpm install` have the hook installed automatically.

---

#### Step 7 — SQL Injection Prevention

Prisma is the exclusive database access layer. Prisma's query builder uses parameterised queries for all operations — SQL injection via model methods is structurally impossible.

The only SQL injection risk surface is `db.$queryRaw` and `db.$executeRaw`, which are used for:
- Health check `SELECT 1`
- Materialized view refresh (Phase 3+)
- Full-text search index creation (Phase 3+)

Rules for raw SQL:
- Template literal syntax only — `db.$queryRaw\`SELECT ...\`` — never string concatenation
- No user-provided values appear in raw SQL strings — user input is always passed as Prisma tagged template parameters
- An ESLint rule flags any `$queryRaw` or `$executeRaw` call using string concatenation

---

#### Phase 1 Security Verification

| Check | Expected result |
|---|---|
| `GET /` response headers | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` present |
| CORS from unauthorised origin | `HTTP 403` with no `Access-Control-Allow-Origin` header |
| 6 login attempts in 1 minute from same IP | 6th attempt returns HTTP 429, `Retry-After` header present |
| `POST /v1/any` with deeply nested JSON (11 levels) | HTTP 400, rejected before reaching controller |
| `pnpm audit` | Zero critical or high severity findings |
| `pnpm prepare` (fresh install) | Husky hooks installed; pre-commit hook file exists at `.husky/pre-commit` |
| Commit containing a JWT string | Pre-commit hook rejects the commit with a descriptive error |
| `db.$queryRaw` with string concatenation | ESLint error — blocks commit |

---

## 21. CI/CD Foundation

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Architecture Agent  
**Quality Gate:** Infrastructure Agent

---

### Objective

Deliver a fully operational CI pipeline that runs on every push to every branch and a CD pipeline that deploys to staging on merge to `develop`. At Phase 1, the pipeline validates the infrastructure layer — lint, type-check, build, unit tests, and security audit. Integration tests and E2E tests are wired but operate against empty test suites; they will fill as domain modules are added in Phase 2. The pipeline must pass before Phase 1 is closed.

---

### Pipeline File Structure

```
.github/
└── workflows/
    ├── ci.yml               # Runs on every push to every branch
    ├── staging-deploy.yml   # Runs on merge to develop
    ├── production-deploy.yml # Runs on merge to main
    └── nightly-audit.yml    # Dependency audit and security scan, runs daily
```

All four files are created at Phase 1. `staging-deploy.yml` and `production-deploy.yml` have their deployment steps stubbed — they trigger Vercel and container deployments but the apps being deployed are Phase 1 skeletons.

---

### CI Pipeline — ci.yml

The CI pipeline runs on every `push` to every branch and on every `pull_request` targeting `develop` or `main`.

#### Stage 1 — Lint and Type Check

Runs in parallel across all packages and apps.

| Step | Command | Failure action |
|---|---|---|
| ESLint | `turbo lint` | Block merge immediately |
| TypeScript | `turbo typecheck` | Block merge immediately |
| Circular dependency check | `pnpm madge --circular --extensions ts apps/api/src packages/*/src` | Block merge immediately |
| Import direction check | ESLint custom rule (runs within `turbo lint`) | Block merge immediately |
| Secret scan | `pnpm secretlint` against all staged files | Block merge immediately |
| Dependency audit | `pnpm audit --audit-level=high` | Block merge on high/critical |

All steps in Stage 1 run in parallel. The stage is complete when all steps pass. A single failure fails the stage.

#### Stage 2 — Unit Tests

Runs after Stage 1 passes.

| Step | Command | Failure action |
|---|---|---|
| Run unit tests | `turbo test` | Block merge |
| Coverage check | `turbo test --coverage` with per-package thresholds | Block merge if any package drops below threshold |
| Upload coverage | Coverage JSON uploaded as CI artefact | Never blocks — informational |

The coverage thresholds enforced at Phase 1 are those defined in §18. Phase 2 adds domain-specific thresholds as each module is introduced.

#### Stage 3 — Build

Runs after Stage 2 passes. Turborepo remote cache is active — unchanged packages are restored from cache.

| Step | Command | Failure action |
|---|---|---|
| Generate Prisma client | `turbo run generate --filter=@ofs/database` | Block — must succeed before any app builds |
| Build all packages | `turbo build --filter=!apps/*` | Block |
| Build apps | `turbo build --filter=apps/*` | Block |
| Check bundle size | `next build` output parsed; First Load JS asserted < 150 kB gzip | Warn on first violation; block on second consecutive violation |

The Prisma client generation step runs before any TypeScript compilation because NestJS and Next.js both import `@ofs/database`, which requires the generated client to exist.

#### Stage 4 — Integration Tests (PR only)

Runs after Stage 3 on pull requests targeting `develop` or `main`. Skipped on pushes to feature branches.

| Step | Detail |
|---|---|
| Start PostgreSQL | GitHub Actions service container: `postgres:16` |
| Apply migrations | `pnpm db:migrate` against the CI test database |
| Run seed | `pnpm db:seed` — reference data for integration tests |
| Run integration tests | `turbo test:integration` |
| Teardown | Service container stopped automatically by GitHub Actions |

At Phase 1, the integration test suite contains the foundation tests from §18 (auth guard, tenant guard, audit emitter, tenant isolation). As domain modules are added in Phase 2, their integration tests run here automatically.

---

### GitHub Actions Environment Variables

CI environment variables are stored in GitHub Actions Secrets and Variables:

| Name | Type | Used in stage |
|---|---|---|
| `TURBO_TOKEN` | Secret | Stages 1–4: Turborepo remote cache authentication |
| `TURBO_TEAM` | Variable | Stages 1–4: Turborepo remote cache team identifier |
| `DATABASE_TEST_URL` | Secret | Stage 4: test PostgreSQL connection |
| `DATABASE_DIRECT_URL_TEST` | Secret | Stage 4: direct connection for migration |
| `SUPABASE_URL_TEST` | Secret | Stage 4: staging Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY_TEST` | Secret | Stage 4: staging Supabase service role key |

No production secrets are present in CI. The CI environment connects only to the test/staging Supabase project.

---

### Staging Deploy Pipeline — staging-deploy.yml

Triggered by merge to `develop`. Runs Stages 1–4 from `ci.yml` first, then:

| Step | Action |
|---|---|
| Run DB migration | `pnpm db:migrate` against the staging database |
| Deploy `apps/api` | Vercel CLI: `vercel deploy --prod --token=$VERCEL_TOKEN` targeting the staging Vercel project |
| Deploy `apps/web` | Vercel CLI: `vercel deploy --prod --token=$VERCEL_TOKEN` targeting the staging Vercel project |
| Restart worker | Container platform API: trigger a rolling restart of the worker container with the new image |
| Health check | `curl` the staging API `/v1/health` and the staging web root; fail the pipeline if either returns non-200 |

The migration step runs before any application deployment. If the migration fails, the deployment is aborted and the current application version continues serving traffic from the previous deployment.

---

### Nightly Audit Pipeline — nightly-audit.yml

Runs on a cron schedule: `0 2 * * *` (02:00 UTC daily).

| Step | Action |
|---|---|
| `pnpm audit` | Reports all severity levels; posts summary to the team Slack channel |
| GitHub CodeQL scan | Static analysis of TypeScript source for security vulnerabilities |
| Lighthouse CI | Runs Lighthouse against the staging frontend; reports Core Web Vitals; fails if LCP > 3s or CLS > 0.1 |
| Bundle size trend | Compares current `apps/web` bundle size against the 7-day rolling average; alerts on > 10% increase |

Nightly audit failures do not block development but create GitHub Issues automatically via the `gh` CLI, assigned to the Infrastructure Agent.

---

### Fix → Explain → Continue — CI Context

If the CI pipeline fails at Phase 1 on any gate other than a missing domain feature:

1. **Fix** — the Infrastructure Agent applies the minimal fix within the current commit or a follow-up commit on the same branch
2. **Explain** — the root cause is documented in the commit message body or a PR comment; no silent fixes
3. **Continue** — other unaffected CI stages continue running in parallel; a failing unit test does not block the bundle size check from completing

A CI stage that consistently fails across multiple PRs is escalated to the Architecture Agent for a structural resolution — it is not patched repeatedly.

---

#### Phase 1 CI Verification

| Check | Expected result |
|---|---|
| Push to a feature branch | `ci.yml` Stages 1–3 run and pass |
| Open a PR to `develop` | `ci.yml` Stages 1–4 run; integration tests pass |
| Merge to `develop` | `staging-deploy.yml` runs; staging health check passes |
| Commit with a hardcoded secret pattern | Stage 1 `secretlint` step fails; commit is blocked |
| `pnpm audit` with a known vulnerability | Stage 1 reports it; critical/high blocks merge |
| Second build with no source changes | Stage 3 shows 100% Turborepo cache hits |

---

## 22. Deployment Preparation

**Responsible Agent:** Infrastructure Agent  
**Reviewing Agent:** Backend Agent  
**Quality Gate:** Infrastructure Agent

---

### Objective

Configure the deployment targets so that the Phase 1 skeleton applications can be deployed and verified on the staging environment before any domain work begins. Deployment preparation is not about launching features — it is about confirming that the deployment pipeline, environment variable injection, and infrastructure wiring work correctly with an empty application shell.

---

### Vercel Project Setup

Three Vercel projects are created: one for `apps/web` and one for `apps/api`. (`apps/worker` is not on Vercel.)

#### apps/web Vercel Project

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root directory | `apps/web` |
| Build command | `cd ../.. && pnpm turbo build --filter=web` |
| Output directory | `.next` |
| Node.js version | 22.x LTS |
| Region | Closest to the primary Supabase region |

#### apps/api Vercel Project

| Setting | Value |
|---|---|
| Framework preset | Other |
| Root directory | `apps/api` |
| Build command | `cd ../.. && pnpm turbo build --filter=api` |
| Output directory | `dist` |
| Node.js version | 22.x LTS |
| Region | Same region as Supabase primary database — non-negotiable for latency |

Both projects are linked to the same GitHub repository. Vercel auto-creates Preview deployments for every pull request branch.

---

### Vercel Environment Variable Configuration

Environment variables are configured in the Vercel dashboard per project and per environment (Preview, Production). They are never committed to the repository.

**apps/web — Staging environment variables**

| Variable | Environment |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Staging Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Staging `apps/api` Vercel URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging service role key |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ar` |

**apps/api — Staging environment variables**

| Variable | Environment |
|---|---|
| `DATABASE_URL` | Staging PgBouncer URL (port 6543) |
| `DATABASE_READ_URL` | Staging read replica PgBouncer URL |
| `DATABASE_DIRECT_URL` | Staging direct PostgreSQL URL (port 5432) |
| `SUPABASE_URL` | Staging Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging service role key |
| `API_JWT_SECRET` | Staging Supabase JWT secret |
| `API_ALLOWED_ORIGINS` | Staging `apps/web` Vercel URL |
| `REDIS_URL` | Staging Upstash Redis URL |
| `LOG_LEVEL` | `debug` for staging; `info` for production |

---

### Worker Container Setup

`apps/worker` runs as a persistent container on the chosen platform (Fly.io, Railway, or Render). Phase 1 deploys an empty worker shell that starts and stays alive.

#### Dockerfile Strategy

`apps/worker/Dockerfile` is a multi-stage build:

| Stage | Base image | Purpose |
|---|---|---|
| `deps` | `node:22-alpine` | Install pnpm and all production dependencies |
| `builder` | `node:22-alpine` | Run `pnpm db:generate` and compile TypeScript |
| `runner` | `node:22-alpine` | Copy only `dist/` and `node_modules/`; no dev dependencies; minimal attack surface |

The final image is < 300 MB. It contains no source TypeScript, no test files, and no dev tooling. The Prisma Client is generated during the build stage and included in the final image.

#### Container Health Probe

The worker exposes port `8080` exclusively for the container platform health probe. The probe endpoint `/health` returns `{ "status": "ok", "queues": [] }` at Phase 1. Queue names are added as workers are registered in Phase 2.

The health probe port is never exposed publicly. Container networking is configured to route only the probe port to the health check mechanism — all other ports are blocked.

#### Worker Environment Variables

| Variable | Source |
|---|---|
| `DATABASE_URL` | Container platform secret |
| `DATABASE_READ_URL` | Container platform secret |
| `REDIS_URL` | Upstash dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Container platform secret |
| `WORKER_CONCURRENCY` | `5` (default) — tuned after Phase 2 queue introduction |
| `LOG_LEVEL` | `info` |
| `NODE_ENV` | `production` |

---

### Staging Deployment Verification

After the first successful staging deployment via `staging-deploy.yml`, the following are verified manually:

| Check | URL | Expected result |
|---|---|---|
| Web root | `https://staging.ofs.app/` | Redirects to `/ar`; `<html dir="rtl" lang="ar">` |
| Web locale switch | `https://staging.ofs.app/en` | `<html dir="ltr" lang="en">` |
| Rubik font | Browser network tab | `rubik-arabic-400.woff2` fetched with status 200 |
| Green theme | Browser DevTools computed styles | `--colour-primary-500` visible on `:root` |
| API health | `https://api.staging.ofs.app/v1/health` | `{ "status": "ok", "database": { "primary": "connected", "replica": "connected" } }` |
| Worker health probe | Container platform dashboard | Health check `PASSING` |
| Supabase Auth | Staging Supabase Studio Auth panel | Zero users; service reachable |
| Log stream | Vercel log drain / container platform logs | Structured JSON; no plain text lines |

The RTL root, Rubik font, and green theme checks are non-negotiable — they must pass on the staging deployment before Phase 1 is declared complete. A staging deployment that fails any of these three checks is not an acceptable Phase 1 output regardless of what else passes.

---

### Domain Name and SSL

| Environment | Domain pattern | SSL |
|---|---|---|
| Staging | `staging.ofs.app`, `api.staging.ofs.app` | Vercel-managed Let's Encrypt |
| Production | `<tenant>.ofs.app`, `api.ofs.app` | Vercel-managed wildcard certificate |

Wildcard SSL for `*.ofs.app` is provisioned via Vercel's DNS management. Tenant subdomains are added automatically when a new tenant is created (Phase 2). No manual SSL provisioning is required after the wildcard certificate is active.

---

## 23. Local Development Workflow

**Responsible Agent:** Architecture Agent  
**Reviewing Agent:** Infrastructure Agent  
**Quality Gate:** Architecture Agent

---

### Objective

Document the complete developer experience from a fresh clone to a running local environment. Every developer on the team follows this workflow. The workflow must be deterministic — the same sequence of commands on any machine produces the same running environment. Time from clone to running application must not exceed 15 minutes on a standard developer machine.

---

### Prerequisites

Before running the setup sequence, a developer must have:

| Tool | Minimum version | Install method |
|---|---|---|
| Node.js | 22.x LTS | `nvm install 22` or `volta install node@22` |
| pnpm | 9.x | `npm install -g pnpm@9` |
| Docker Desktop | 4.x | Docker website |
| Supabase CLI | Latest | `pnpm add -g supabase` |
| Git | 2.40+ | System package manager |

Docker Desktop must be running before any `supabase` commands are executed. The Supabase CLI uses Docker to run the local stack.

---

### First-Time Setup Sequence

This sequence is performed once per machine after cloning the repository.

| Step | Command | Time estimate | What happens |
|---|---|---|---|
| 1 | `git clone <repo>` | 30s | Clones the monorepo |
| 2 | `cd ofs` | — | Enters the project root |
| 3 | `pnpm install` | 2–3 min | Installs all dependencies; links workspace packages; runs `postinstall` which generates Prisma Client; installs Husky hooks |
| 4 | `cp .env.example .env.local` | — | Creates the local env file template |
| 5 | `pnpm supabase:start` | 3–5 min | Starts local Supabase stack via Docker; downloads images on first run |
| 6 | `pnpm supabase:status` | — | Prints all local service URLs and keys |
| 7 | Fill `.env.local` | 2 min | Copy `DB URL`, `API URL`, `anon key`, `service_role key` from `supabase status` output into `.env.local` |
| 8 | `pnpm db:migrate` | 30s | Applies baseline migration to local database |
| 9 | `pnpm db:seed` | 15s | Seeds reference data |
| 10 | `pnpm dev` | 30s | Starts all three apps concurrently |

Total time: approximately 10–12 minutes on a machine with a fast internet connection (the Docker image download dominates).

After Step 10, the developer has:

| Service | URL |
|---|---|
| `apps/web` | `http://localhost:3007` |
| `apps/api` | `http://localhost:3000` |
| Supabase Studio | `http://localhost:54323` |
| Prisma Studio | `http://localhost:5555` (via `pnpm db:studio` in a separate terminal) |
| Email capture (Inbucket) | `http://localhost:54324` |

---

### Daily Workflow

The daily workflow assumes the developer's machine was shut down the previous day.

| Step | Command | When |
|---|---|---|
| Start Docker | Open Docker Desktop | Before any `supabase` or `pnpm dev` commands |
| Start Supabase | `pnpm supabase:start` | Once per session; skipped if already running |
| Pull latest | `git pull origin develop` | Start of each working day |
| Install new dependencies | `pnpm install` | After a pull that changed `pnpm-lock.yaml` |
| Apply new migrations | `pnpm db:migrate` | After a pull that added migration files |
| Regenerate Prisma Client | `pnpm db:generate` | After a pull that changed `schema.prisma` |
| Start dev servers | `pnpm dev` | Begin development work |

The `.nvmrc` file in the repository root specifies the Node.js version. Developers using `nvm` or `volta` will have the correct version activated automatically when they enter the project directory.

---

### Common Development Commands

| Scenario | Command |
|---|---|
| Start everything | `pnpm dev` |
| Start only the backend | `pnpm dev --filter=api` |
| Start only the frontend | `pnpm dev --filter=web` |
| Run all unit tests | `pnpm test` |
| Run a single package's tests | `pnpm test --filter=@ofs/utils` |
| Run integration tests | `pnpm test:integration` |
| Run E2E tests | `pnpm test:e2e` (requires `pnpm dev` running) |
| Check types | `pnpm typecheck` |
| Run linter | `pnpm lint` |
| Fix auto-fixable lint errors | `pnpm lint --fix` |
| Add a schema migration | `pnpm db:migrate:dev --name="<domain>_<description>"` |
| Regenerate Prisma Client | `pnpm db:generate` |
| Open Prisma Studio | `pnpm db:studio` |
| Reset local database | `pnpm supabase:reset` (destroys all local data; re-applies migrations and seed) |
| Check Supabase status | `pnpm supabase:status` |
| Stop local Supabase | `pnpm supabase:stop` |
| Run a specific test file | `pnpm vitest run packages/utils/src/date/format.spec.ts` |

---

### Making and Committing Changes

| Situation | Action |
|---|---|
| Adding a new `@ofs/types` interface | Create the type; run `pnpm typecheck`; all consumers will pick it up via workspace linking |
| Adding a new `@ofs/validation` schema | Create the schema; register it in the consuming NestJS module's `onModuleInit`; add a Vitest test |
| Changing `schema.prisma` | Run `pnpm db:migrate:dev --name="..."` to create and apply the migration; run `pnpm db:generate`; commit both the schema and the migration file together |
| Adding a new package | Create the directory; add `package.json` with `@ofs/` name; update `turbo.json` if the package has tasks; run `pnpm install` from root |
| Committing | Pre-commit hook runs ESLint and secret detection automatically; if it passes, `git commit` proceeds |

---

### Troubleshooting Guide

| Problem | Cause | Fix |
|---|---|---|
| `pnpm dev` port 3007 already in use | Another `apps/web` process is running | `lsof -ti:3007 \| xargs kill` |
| Prisma Client not found | `postinstall` did not run | `pnpm db:generate` |
| `supabase start` fails | Docker not running | Start Docker Desktop first |
| `DATABASE_URL` connection refused | Supabase stack not started | `pnpm supabase:start` |
| Migration fails with "relation already exists" | Schema drift — local DB ahead of migrations | `pnpm supabase:reset` |
| TypeScript error after `git pull` | New dependency added; `pnpm install` not run | `pnpm install && pnpm db:generate` |
| ESLint fails on an import | Wrong import group order | Run `pnpm lint --fix`; if unfixable, check the `@ofs/config` ESLint rules |
| Arabic text not rendering correctly | Rubik Arabic subset not loaded | Check `public/fonts/` contains `rubik-arabic-*.woff2` |
| `dir="ltr"` on root element | Locale not resolving to `ar` | Check `middleware.ts` locale detection; check `NEXT_PUBLIC_DEFAULT_LOCALE=ar` in `.env.local` |

The last two troubleshooting entries address the non-negotiable RTL and Rubik rules. Any developer who encounters these issues has a broken development environment and must resolve them before writing any frontend code.

**Fix → Explain → Continue:** When a developer encounters any troubleshooting scenario, the expected behaviour is to fix the specific issue, note the root cause in the team chat (to alert others who may hit the same issue), and continue development. No development work is blocked by a tooling issue for more than 30 minutes — escalate to the Infrastructure Agent after that threshold.

---

## 24. Foundation Execution Order

**Responsible Agent:** Architecture Agent  
**Reviewing Agent:** Infrastructure Agent  
**Quality Gate:** Architecture Agent

---

### Objective

Provide a single, authoritative, sequenced list of every Phase 1 implementation task with its dependencies explicitly stated. This list is the implementation roadmap. Tasks within the same group are independent and may be executed in parallel by different team members. A task may not begin until all tasks it depends on are marked complete.

---

### Group 0 — Pre-Implementation (no dependencies)

| ID | Task | Owner |
|---|---|---|
| 0.1 | Create GitHub repository; set `develop` and `main` branch protection rules | Infrastructure Agent |
| 0.2 | Create staging Supabase project; record credentials in team password manager | Infrastructure Agent |
| 0.3 | Create production Supabase project; record credentials; enable read replica | Infrastructure Agent |
| 0.4 | Create Vercel projects for `apps/web` and `apps/api`; link to GitHub repository | Infrastructure Agent |
| 0.5 | Configure Vercel staging environment variables for both projects | Infrastructure Agent |
| 0.6 | Provision staging Upstash Redis; record `REDIS_URL` | Infrastructure Agent |
| 0.7 | Decide and document container platform for `apps/worker` | Infrastructure Agent |

---

### Group 1 — Repository Bootstrap (depends on: 0.1)

| ID | Task | Owner |
|---|---|---|
| 1.1 | Initialise git; create root `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `.gitignore`, `.env.example` | Infrastructure Agent |
| 1.2 | Install Turborepo; create `turbo.json` pipeline | Infrastructure Agent |
| 1.3 | Create `packages/config/` with all tsconfig, ESLint, and Prettier files | Infrastructure Agent |
| 1.4 | Run `pnpm install` from root; verify workspace links | Infrastructure Agent |
| 1.5 | Verify `turbo run build --dry` produces correct dependency graph | Infrastructure Agent |

---

### Group 2 — Core Package Scaffolds (depends on: 1.3, 1.4)

| ID | Task | Owner |
|---|---|---|
| 2.1 | Create `@ofs/types` — utility types, common DTOs | Types Agent |
| 2.2 | Create `@ofs/logger` — Pino factory, redaction list, Logger interface | Infrastructure Agent |
| 2.3 | Create `@ofs/database` — client.ts, seed entry point, Prisma schema baseline | Database Agent |

Tasks 2.1, 2.2, and 2.3 are independent; all three may begin simultaneously.

---

### Group 3 — Dependent Package Scaffolds (depends on: 2.1, 2.2, 2.3)

| ID | Task | Owner |
|---|---|---|
| 3.1 | Create `@ofs/utils` — `formatDate` (fully implemented), money stubs, RTL utilities | Utilities Agent |
| 3.2 | Create `@ofs/validation` — all five primitives, message maps | Validation Agent |
| 3.3 | Apply Prisma baseline migration; run `pnpm db:generate` | Database Agent |

Tasks 3.1, 3.2, and 3.3 are independent.

---

### Group 4 — Final Package Scaffolds (depends on: 3.1, 3.2, 3.3)

| ID | Task | Owner |
|---|---|---|
| 4.1 | Create `@ofs/audit` — `AuditPayload` types, `@Auditable` decorator stub; connect to logger (Phase 1 stub) | Audit Agent |
| 4.2 | Create `@ofs/api-contracts` — client factory stub, empty endpoint directories | Backend Agent |
| 4.3 | Create `@ofs/ui` — full token system, `RtlProvider`, `ThemeProvider`, `StatusBadge`, `DateDisplay` | Frontend Agent |

Tasks 4.1, 4.2, and 4.3 are independent.

---

### Group 5 — Application Scaffolds (depends on: Group 4 complete)

| ID | Task | Owner |
|---|---|---|
| 5.1 | Scaffold `apps/web`: Next.js init; clear scaffold; add font files; wire Tailwind with OFS tokens | Frontend Agent |
| 5.2 | Scaffold `apps/api`: NestJS init; clear scaffold; create `main.ts`; create `AppModule` | Backend Agent |
| 5.3 | Scaffold `apps/worker`: create `main.ts`; BullMQ connection; health probe server | Backend Agent |

Tasks 5.1, 5.2, and 5.3 are independent.

---

### Group 6 — Infrastructure Wiring (depends on: Group 5 complete)

| ID | Task | Owner |
|---|---|---|
| 6.1 | `apps/web`: root layout with `dir="rtl"`, `lang="ar"`, `RtlProvider`, `ThemeProvider`, Rubik font | Frontend Agent |
| 6.2 | `apps/web`: middleware for locale detection, auth stub, tenant resolution stub | Frontend Agent |
| 6.3 | `apps/web`: `next-intl` configuration; Arabic and English message files | Frontend Agent |
| 6.4 | `apps/web`: web health route handler | Frontend Agent |
| 6.5 | `apps/api`: global bootstrap (`CoreModule`, all global pipes, filters, interceptors) | Backend Agent |
| 6.6 | `apps/api`: `ConfigModule` with Zod env schema validation | Backend Agent |
| 6.7 | `apps/api`: `DatabaseModule` providing `db` and `dbRead` | Database Agent |
| 6.8 | `apps/api`: `LoggerModule` with NestJS adapter; wire `LoggingInterceptor` | Infrastructure Agent |
| 6.9 | `apps/api`: `GlobalExceptionFilter` — all exception mappings; `BusinessRuleException` | Backend Agent |
| 6.10 | `apps/api`: `ResponseTransformInterceptor` — success envelope | Backend Agent |
| 6.11 | `apps/api`: health check controller with database probe | Backend Agent |

Tasks 6.1–6.4 are independent of 6.5–6.11.

---

### Group 7 — Security and Auth Wiring (depends on: 6.5, 6.6)

| ID | Task | Owner |
|---|---|---|
| 7.1 | `AuthGuard` — full JWT verification via Supabase secret | Security Agent |
| 7.2 | `TenantGuard` — subdomain and header resolution; `TenantContext` service | Backend Agent |
| 7.3 | `PermissionGuard` — bootstrap permission set; `@RequirePermission` decorator | Backend Agent |
| 7.4 | `ZodValidationPipe` — full implementation; `SchemaRegistry` | Validation Agent |
| 7.5 | `RateLimitGuard` — token bucket per user; HTTP 429 response | Security Agent |
| 7.6 | Security HTTP headers in `next.config.ts` | Security Agent |
| 7.7 | CORS configuration in `apps/api/src/main.ts` | Security Agent |

Tasks 7.1–7.7 are independent of each other within this group.

---

### Group 8 — Audit Foundation (depends on: 7.2, 3.3 — AuditLog migration required)

| ID | Task | Owner |
|---|---|---|
| 8.1 | Add `AuditLog` model to `schema.prisma`; generate and apply migration | Database Agent |
| 8.2 | Upgrade `AuditEmitter.emit()` to write to database; implement `computeDiff()` | Audit Agent |
| 8.3 | Implement `AuditInterceptor`; wire into NestJS globally | Audit Agent |

Tasks 8.2 and 8.3 depend on 8.1 (database model must exist). 8.2 and 8.3 are independent of each other.

---

### Group 9 — Testing Foundation (depends on: Group 8 complete)

| ID | Task | Owner |
|---|---|---|
| 9.1 | Configure Vitest across all packages and apps; shared setup file; `@ofs/config/vitest/` utilities | QA Agent |
| 9.2 | Write all nine foundation test files from §18 | QA Agent |
| 9.3 | Configure Playwright; write `foundation.e2e.ts` baseline tests from §18 | QA Agent |
| 9.4 | Verify all tests pass locally; confirm coverage gates met | QA Agent |

---

### Group 10 — CI/CD Pipeline (depends on: Group 9 complete)

| ID | Task | Owner |
|---|---|---|
| 10.1 | Create `ci.yml` — Stages 1–4; configure GitHub Secrets | Infrastructure Agent |
| 10.2 | Create `staging-deploy.yml`; configure Vercel CLI deployment steps | Infrastructure Agent |
| 10.3 | Create `production-deploy.yml` — stubbed; not triggered at Phase 1 | Infrastructure Agent |
| 10.4 | Create `nightly-audit.yml` — dependency audit, CodeQL, Lighthouse | Infrastructure Agent |
| 10.5 | Verify `ci.yml` passes on a push to `develop` | Infrastructure Agent |
| 10.6 | Verify `staging-deploy.yml` completes and staging health checks pass | Infrastructure Agent |

---

### Group 11 — Local Developer Experience (depends on: Group 10 complete)

| ID | Task | Owner |
|---|---|---|
| 11.1 | Configure Supabase CLI; create `infra/supabase/config.toml` | Infrastructure Agent |
| 11.2 | Write `infra/scripts/migrate.sh`; verify Prisma + Supabase migration sequence | Database Agent |
| 11.3 | Install and test all Husky hooks (pre-commit secret scan, lint) | Infrastructure Agent |
| 11.4 | Perform a clean-clone test: new machine, follow §23 setup sequence exactly; record actual time | QA Agent |
| 11.5 | Document any deviations from §23 found during clean-clone test | QA Agent |

---

### Critical Path

The longest dependency chain — the critical path — determines the minimum wall-clock time for Phase 1:

```
0.1 → 1.1 → 1.3 → 2.3 → 3.3 → 4.1 → 5.2 → 6.5 → 6.9 → 7.1 → 8.1 → 8.2 → 9.2 → 10.1 → 10.5
```

Estimated duration with a team of 3 agents working in parallel on independent tasks: **8–10 working days**.

Any task not on the critical path can slip without affecting the Phase 1 completion date, as long as it finishes before the first task in Group 11 that depends on it.

---

## 25. Foundation Completion Checklist

**Responsible Agent:** Architecture Agent  
**Reviewing Agent:** All Agents  
**Quality Gate:** Architecture Agent

---

### Purpose

This checklist is the single gate between Phase 1 and Phase 2. Every item must be checked before any Phase 2 domain module work begins. The Architecture Agent is responsible for verifying each item and signing off on the checklist. No partial completions are accepted — an unchecked item blocks the phase transition.

---

### Non-Negotiable Rules Verification

These items verify that the platform's non-negotiable constraints are enforced from the first working commit. They are checked first because they cannot be retrofitted later without significant rework.

| # | Rule | Verification method | Status |
|---|---|---|---|
| N-1 | **Arabic First** | Navigate to `https://staging.ofs.app/`; confirm redirect to `/ar`; confirm Arabic UI text renders | ☐ |
| N-2 | **RTL First** | Inspect `<html>` element on `/ar` routes; `dir="rtl"` present; CSS logical properties only in `@ofs/ui` | ☐ |
| N-3 | **Rubik Font** | Network tab confirms `rubik-arabic-400.woff2` served from `/fonts/`; no fallback font visible | ☐ |
| N-4 | **Professional Green Theme** | Browser DevTools: `--colour-primary-500` defined on `:root`; green visible in UI | ☐ |
| N-5 | **Multi-Tenant SaaS** | `TenantContext.set()` is called on every authenticated request; request without tenant context returns 403 | ☐ |
| N-6 | **Dynamic Statuses** | `StatusBadge` renders `labelAr` by default; no `if (status === '...')` in any `@ofs/ui` or `apps/web` file | ☐ |
| N-7 | **Dynamic Workflows** | `WorkflowService` stub is registered; no domain service directly sets a status field | ☐ |
| N-8 | **No Hardcoded Business Logic** | `grep -r "if.*status.*===" apps/ packages/` returns zero matches in non-test files | ☐ |
| N-9 | **Audit Everything** | `AuditEmitter.emit()` writes to `audit_log`; `@Auditable` decorator is operational | ☐ |
| N-10 | **Performance First** | API health check p95 < 50ms; Next.js First Load JS < 150 kB gzip | ☐ |
| N-11 | **Security First** | All §20 security headers present on staging responses; `pnpm audit` shows zero critical/high findings | ☐ |
| N-12 | **Accounting Accuracy** | `moneyPrimitive` rejects `number` type; `formatMoney` is the only money-to-string function; no `float` in any type definition | ☐ |
| N-13 | **Date Format DD MMM YYYY** | `DateDisplay` component renders `24 May 2026` format; `formatDate` unit tests pass for both locales | ☐ |

---

### CI/CD Gates

| # | Gate | Verification method | Status |
|---|---|---|---|
| C-1 | `ci.yml` passes on push to `develop` | GitHub Actions run status: green | ☐ |
| C-2 | Turborepo remote cache active | Second CI run with no changes: 100% cache hits in build log | ☐ |
| C-3 | `staging-deploy.yml` completes | GitHub Actions run status: green; staging health checks pass | ☐ |
| C-4 | `pnpm audit` — zero critical/high | CI Stage 1 audit step: no blocking findings | ☐ |
| C-5 | `pnpm secretlint` — zero findings | CI Stage 1: no secrets detected in any source file | ☐ |
| C-6 | Integration tests pass | CI Stage 4: all nine foundation test files green | ☐ |
| C-7 | Coverage gates met | CI Stage 2: all per-package thresholds satisfied | ☐ |
| C-8 | Playwright E2E baseline passes | `foundation.e2e.ts`: all assertions green including RTL and Rubik checks | ☐ |

---

### Package Gates

| # | Package | Gate | Status |
|---|---|---|---|
| P-1 | `@ofs/config` | All tsconfig, ESLint, and Prettier configs extend cleanly from consuming packages | ☐ |
| P-2 | `@ofs/types` | G-18: all utility types exported; `pnpm typecheck --filter=@ofs/types` zero errors | ☐ |
| P-3 | `@ofs/utils` | G-19: `formatDate`, `formatMoney`, `detectDirection`, `encodeCursor`, `decodeCursor` exported and tested | ☐ |
| P-4 | `@ofs/validation` | G-20: all five primitives exported; Arabic error messages returned by default | ☐ |
| P-5 | `@ofs/database` | G-21: `db` and `dbRead` connect; baseline migration applied; seed runs cleanly | ☐ |
| P-6 | `@ofs/logger` | G-22: structured JSON in production mode; PII redaction verified | ☐ |
| P-7 | `@ofs/audit` | G-23: `AuditEmitter.emit()` writes to `audit_log`; diff computation tested | ☐ |
| P-8 | `@ofs/ui` | G-24: `RtlProvider`, `ThemeProvider`, `StatusBadge`, `DateDisplay` exported; RTL-first verified | ☐ |
| P-9 | `@ofs/api-contracts` | G-25: client factory stub exported; `pnpm typecheck --filter=@ofs/api-contracts` zero errors | ☐ |

---

### Application Gates

| # | Application | Gate | Status |
|---|---|---|---|
| A-1 | `apps/web` | `GET http://localhost:3007/` redirects to `/ar`; HTTP 200 | ☐ |
| A-2 | `apps/web` | Root `<html dir="rtl" lang="ar">` on all `/ar/*` routes | ☐ |
| A-3 | `apps/web` | Root `<html dir="ltr" lang="en">` on all `/en/*` routes | ☐ |
| A-4 | `apps/web` | Rubik WOFF2 served from `/fonts/`; `font-display: swap` confirmed | ☐ |
| A-5 | `apps/web` | `GET /api/health` returns `{ "status": "ok", "app": "web" }` | ☐ |
| A-6 | `apps/web` | `pnpm build --filter=web` First Load JS < 150 kB gzip | ☐ |
| A-7 | `apps/api` | `GET http://localhost:3000/v1/health` returns `{ "status": "ok", "database": { "primary": "connected" } }` | ☐ |
| A-8 | `apps/api` | Request without auth token returns HTTP 401 in `ApiResponse` envelope | ☐ |
| A-9 | `apps/api` | Request without tenant context returns HTTP 403 in `ApiResponse` envelope | ☐ |
| A-10 | `apps/api` | Unknown route returns HTTP 404 in `ApiResponse` envelope | ☐ |
| A-11 | `apps/api` | All startup logs are structured JSON; no `console.log` lines in output | ☐ |
| A-12 | `apps/worker` | Process starts; logs `Worker started — awaiting jobs`; does not exit within 60 seconds | ☐ |
| A-13 | `apps/worker` | Health probe `GET :8080/health` returns `{ "status": "ok" }` | ☐ |

---

### Security Gates

| # | Gate | Verification method | Status |
|---|---|---|---|
| S-1 | Security headers present on staging | `curl -I https://staging.ofs.app/` — all headers from §20 present | ☐ |
| S-2 | CORS blocks unauthorised origin | `curl -H "Origin: https://evil.com"` to API — no `Access-Control-Allow-Origin` in response | ☐ |
| S-3 | Rate limiting active | 6 rapid requests to login route from same IP — 6th returns HTTP 429 | ☐ |
| S-4 | Secret not committed | `git log --all -S "sbp_" --oneline` returns empty | ☐ |
| S-5 | Pre-commit hook installed | `.husky/pre-commit` exists; `chmod +x` confirmed | ☐ |
| S-6 | PII redaction verified | Log line containing `password` field shows `[REDACTED]` as value | ☐ |
| S-7 | JWT verification operational | Expired token → HTTP 401; valid token → request proceeds | ☐ |

---

### Documentation Gates

| # | Gate | Status |
|---|---|---|
| D-1 | `docs/MONOREPO_ARCHITECTURE.md` complete (all 25 sections) | ☐ |
| D-2 | `docs/PHASE_1_FOUNDATION.md` complete (all 25 sections) | ☐ |
| D-3 | `docs/performance/baselines.md` created with Phase 1 measurements | ☐ |
| D-4 | `docs/releases/` directory exists | ☐ |
| D-5 | `docs/post-mortems/` directory exists | ☐ |
| D-6 | `.env.example` contains all variables from §13 catalogue | ☐ |
| D-7 | `packages/database/prisma/migrations/migration_lock.toml` committed | ☐ |

---

### Phase Transition Sign-Off

Phase 1 is complete and Phase 2 may begin when:

1. All items in this checklist are checked ☐ → ☑
2. The Architecture Agent has reviewed and signed off: **\_\_\_\_\_\_\_\_\_\_\_\_\_ / \_\_\_ \_\_\_ \_\_\_\_**  (name / DD MMM YYYY)
3. The Security Agent has reviewed and signed off: **\_\_\_\_\_\_\_\_\_\_\_\_\_ / \_\_\_ \_\_\_ \_\_\_\_**  (name / DD MMM YYYY)
4. The Infrastructure Agent has reviewed and signed off: **\_\_\_\_\_\_\_\_\_\_\_\_\_ / \_\_\_ \_\_\_ \_\_\_\_**  (name / DD MMM YYYY)
5. The Phase 1 completion PR has been merged to `develop`
6. The `develop` branch CI pipeline is green
7. The staging deployment is healthy

---

### What Phase 2 Will Build On

Phase 1 delivers a platform. Phase 2 delivers the first domain features built on that platform. The Phase 2 team inherits:

| Foundation | State at Phase 1 handoff |
|---|---|
| Monorepo | 9 shared packages, 3 applications, CI/CD pipeline, Turborepo remote cache |
| Authentication | Real Supabase JWT verification; `AuthGuard` operational |
| Authorisation | RBAC framework wired; bootstrap permission set; ready for `Role`/`Permission` models |
| Tenant isolation | `TenantContext` enforced; `BaseTenantRepository` pattern established |
| Audit | `AuditLog` model live; `AuditEmitter` and `@Auditable` operational |
| Logging | Structured JSON; request correlation; PII redaction; all three apps logging consistently |
| Validation | `ZodValidationPipe` wired; five primitives ready; Arabic error messages active |
| Error handling | `GlobalExceptionFilter` complete; `BusinessRuleException` available |
| Security | Headers, CORS, rate limiting, secret scanning, dependency audit all active |
| Database | Prisma baseline; `db` + `dbRead` clients; migration pipeline; seed framework |
| Frontend | RTL root; Rubik font; green theme tokens; `StatusBadge`; `DateDisplay`; locale routing |
| Testing | Vitest configured; 9 foundation tests passing; Playwright baseline passing |

The first Phase 2 task is to add the `Plan`, `Tenant`, `User`, `Role`, `Permission`, and `UserRole` Prisma models — the identity and platform domain from `PRISMA_SCHEMA_BLUEPRINT.md` §9 and §10. Everything Phase 2 needs to do that is already in place.

---

*Document complete. Phase 1 Foundation — all 25 sections authored and approved.*  
*This document is the implementation source of truth for Phase 1.*  
*Phase 2 begins after the Phase Transition Sign-Off above is completed.*
