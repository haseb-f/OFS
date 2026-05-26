# PHASE 2 — EXECUTION BLUEPRINT

**Project:** OFS — Order Fulfillment System (Multi-Tenant SaaS)
**Document Type:** Step-by-Step Execution Blueprint
**Status:** In Progress — Sections 1–5 authored
**Non-Negotiables:** Arabic First · RTL First · Rubik Font · Professional Green Theme · Multi-Tenant SaaS · Dynamic Statuses · Dynamic Workflows · No Hardcoded Business Logic · Audit Everything · Performance First · Security First · Accounting Accuracy First · Date Format DD MMM YYYY (e.g. 01 Jan 2026)
**Agent Policy:** Fix → Explain → Continue on every blocked step

---

## 1. Repository Creation Sequence

### Objective

Establish the root Git repository, enforce branch protection rules, configure commit signing expectations, and produce the canonical empty monorepo shell from which all subsequent sequences operate. No application code or package code is written in this sequence — only the repository contract itself.

### Execution Steps

**Step 1.1 — Initialize Local Repository**
Create the root project directory named `ofs`. Run `git init` inside it. Set the default branch to `main`. Confirm the `.git` directory is present and the branch is `main` before proceeding.

**Step 1.2 — Create Root `.gitignore`**
Add entries for: `node_modules/`, `.env`, `.env.local`, `.env.*.local`, `dist/`, `.turbo/`, `.next/`, `coverage/`, `*.tsbuildinfo`, `.DS_Store`, `Thumbs.db`, `*.log`, `pnpm-debug.log*`. Do not wildcard `.env.*` — only the local variants. `.env.example` files must NOT be gitignored.

**Step 1.3 — Create Root `.gitattributes`**
Enforce LF line endings for all text files (`* text=auto eol=lf`). Mark binary formats explicitly (`*.png`, `*.jpg`, `*.ico`, `*.woff2` as `binary`). This prevents CRLF contamination on Windows developer machines.

**Step 1.4 — Create Root `README.md`**
Minimal placeholder: project name, one-line description in Arabic and English, tech stack list (Next.js, NestJS, Prisma, PostgreSQL, Supabase, Turborepo, pnpm), and a note that the full architecture is in `docs/`. No setup instructions yet — those belong in Phase 1 docs.

**Step 1.5 — Create Remote Repository**
Create the repository on GitHub under the organization account. Name: `ofs`. Visibility: Private. Do NOT initialize with any files from GitHub — the local repository is the source of truth. Copy the remote URL.

**Step 1.6 — Connect Local to Remote**
Add the remote as `origin`. Push the `main` branch. Set the upstream tracking reference. Confirm `git status` shows `Your branch is up to date with 'origin/main'`.

**Step 1.7 — Create `develop` Branch**
Branch from `main`. Push `develop` to origin. Set tracking. From this point, all feature work targets `develop`. `main` receives only merge commits from `develop` (minor releases) or `hotfix/*` branches.

**Step 1.8 — Configure Branch Protection on `main`**
Via GitHub Settings → Branches: require pull request before merging (minimum 1 approval), require status checks to pass (add CI check names after CI is configured in Section 5), require conversation resolution, disallow force pushes, disallow deletion.

**Step 1.9 — Configure Branch Protection on `develop`**
Same as `main` except: allow direct push from Infrastructure Agent for emergency fixes only. Require status checks. Disallow force pushes.

**Step 1.10 — Initial Commit**
Stage `.gitignore`, `.gitattributes`, `README.md`. Commit message: `chore: initialize ofs monorepo repository`. Push to both `main` and `develop`. This is the canonical baseline commit — all future sequences branch from here.

### Responsible Agent
Infrastructure Agent

### Reviewing Agent
Architecture Agent

### Quality Gate
- `git log --oneline` shows exactly one commit on both `main` and `develop`
- `git remote -v` shows `origin` pointing to the correct GitHub URL
- `cat .gitattributes` shows `* text=auto eol=lf`
- Branch protection rules are active and reject a direct push test to `main`
- `.env` is listed in `.gitignore` and does not appear in `git status` even if created locally

### Completion Criteria
Repository exists on GitHub, both `main` and `develop` branches are protected, the initial commit is present on both branches, and no application files exist yet. The Infrastructure Agent signs off by recording the commit SHA in the project log. The Architecture Agent confirms branch protection configuration matches the branching strategy.

---

## 2. Turborepo Setup Sequence

### Objective

Install and configure Turborepo as the monorepo build orchestration layer. Define the task pipeline (build, test, lint, typecheck, dev) with correct dependency relationships so that Turborepo understands which tasks must complete before others and which can run in parallel. Enable remote caching. This sequence operates on the root of the repository created in Section 1.

### Execution Steps

**Step 2.1 — Install Turborepo as Root Dev Dependency**
Add `turbo` to the root `package.json` as a `devDependency`. Pin to the exact version agreed in architecture (do not use `^` or `~` — exact version only to ensure reproducible builds across all agent machines and CI). Run `pnpm install` after adding.

**Step 2.2 — Create Root `turbo.json`**
Define the pipeline with these tasks and their dependency rules:

- `build`: depends on `^build` (upstream packages must build first). Outputs: `dist/**`, `.next/**`, `build/**`. Not cached for `apps/worker` (persistent process, no output artifact).
- `dev`: does NOT depend on `^build`. Runs in persistent mode for all apps. No cache.
- `lint`: no upstream dependency. Outputs nothing. Cached by input files.
- `typecheck`: depends on `^build` (type definitions from upstream packages must exist). Outputs `*.tsbuildinfo`. Cached.
- `test`: no upstream dependency. Outputs `coverage/**`. Cached by input files.
- `test:integration`: no upstream dependency. No cache (hits live database).
- `db:generate`: runs Prisma generate. No cache.
- `db:migrate`: no cache. Never runs in pipeline — only invoked manually or in CI deployment stage.
- `clean`: no cache. Deletes `dist/`, `.next/`, `build/`, `*.tsbuildinfo` in each package.

**Step 2.3 — Define Global Environment Variables for Cache Invalidation**
In `turbo.json`, list environment variables that, if changed, must bust the Turborepo cache. Include at minimum: `NODE_ENV`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`. Do not include secrets (`JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) in the global list — cache keys must not encode secrets.

**Step 2.4 — Configure Remote Cache**
Enable Turborepo Remote Cache pointing to Vercel Remote Cache (the default Turborepo cloud provider). Set the team slug. Add the Turborepo token as an environment variable (`TURBO_TOKEN`) — in CI via GitHub Actions secrets, locally via `.env.local` (gitignored). Test that `pnpm turbo build --dry-run` outputs the task graph without errors.

**Step 2.5 — Add Root `package.json` Scripts**
Add these scripts to root `package.json` using Turborepo:
- `build`: `turbo run build`
- `dev`: `turbo run dev`
- `lint`: `turbo run lint`
- `typecheck`: `turbo run typecheck`
- `test`: `turbo run test`
- `test:integration`: `turbo run test:integration`
- `clean`: `turbo run clean`
- `format`: runs Prettier across the entire repo (not via Turborepo — direct invocation)

**Step 2.6 — Verify Task Graph**
Run `pnpm turbo run build --graph`. Confirm the output shows no circular dependencies and that all package relationships are acyclic. At this stage, with no packages yet, the graph will be empty — this is expected and correct.

**Step 2.7 — Commit Turborepo Configuration**
Stage `turbo.json`, updated `package.json`. Commit: `chore: configure turborepo pipeline and remote cache`. Push to `develop`.

### Responsible Agent
Infrastructure Agent

### Reviewing Agent
Architecture Agent

### Quality Gate
- `pnpm turbo run build --dry-run` exits 0 and prints the task graph
- `pnpm turbo run build --graph` exits 0 with no circular dependency warnings
- `turbo.json` has exact task dependencies matching the pipeline specification above
- Remote cache is reachable (`turbo run build --summarize` shows cache hit/miss metadata)
- `pnpm lint` and `pnpm typecheck` execute via Turborepo without error (even with no packages, no packages means no work, which is a valid empty run)

### Completion Criteria
`turbo.json` committed on `develop`. Turborepo executes all defined tasks without error against an empty workspace. Remote cache is configured and the token is stored as a secret — not committed to source. Architecture Agent confirms the pipeline dependency graph matches the build order required by the monorepo architecture.

---

## 3. PNPM Workspace Setup Sequence

### Objective

Configure pnpm workspaces so that the monorepo recognizes all apps and packages as workspace members, enabling the `workspace:*` protocol for internal dependency declarations. Establish the exact pnpm version, the `.npmrc` configuration, and the `pnpm-lock.yaml` baseline. After this sequence, any package added under `apps/` or `packages/` is automatically a workspace member without further configuration.

### Execution Steps

**Step 3.1 — Pin pnpm Version**
Create `.npmrc` at the repository root with: `engine-strict=true`. Create `.node-version` or use `engines` in root `package.json` to pin Node.js to `22.x LTS`. Add `packageManager` field to root `package.json` specifying the exact pnpm version (e.g. `pnpm@9.x.x` — use the exact patch version agreed in architecture). This ensures all agents and CI use the same pnpm version via Corepack.

**Step 3.2 — Configure `.npmrc`**
In `.npmrc`, set:
- `engine-strict=true` — fails loudly if Node.js version does not match
- `shamefully-hoist=false` — enforce strict node_modules isolation (no phantom dependencies)
- `strict-peer-dependencies=false` — avoid peer dependency noise during ecosystem instability
- `auto-install-peers=true` — automatically resolve peer dependencies
- `prefer-workspace-packages=true` — always resolve internal packages from workspace before npm registry

**Step 3.3 — Create `pnpm-workspace.yaml`**
Define workspace members:
- `packages/apps/*` — all application workspaces
- `packages/packages/*` — all shared package workspaces

The pattern must cover the directory structure: `apps/web`, `apps/api`, `apps/worker` and `packages/config`, `packages/types`, `packages/utils`, `packages/validation`, `packages/database`, `packages/logger`, `packages/audit`, `packages/api-contracts`, `packages/ui`.

**Step 3.4 — Create Placeholder Workspace Directories**
Create the directory tree for apps and packages. Each directory must contain at minimum a placeholder `package.json` with the correct `name` field (using `@ofs/` namespace) and `version: "0.0.0"` so pnpm recognizes it as a workspace member. Do not add any source files yet — that is the responsibility of Section 4 (packages) and Sections 6–8 (apps).

Directory structure to create:
```
apps/
  web/
  api/
  worker/
packages/
  config/
  types/
  utils/
  validation/
  database/
  logger/
  audit/
  api-contracts/
  ui/
```

**Step 3.5 — Install Workspace Root Dependencies**
Run `pnpm install` from the root. This generates `pnpm-lock.yaml`. Confirm all workspace packages are listed in the lockfile. Confirm `node_modules/.pnpm` uses the isolated store layout (no hoisting artifacts).

**Step 3.6 — Verify Workspace Resolution**
Run `pnpm list --recursive --depth 0`. All nine packages and three apps must appear in the output. Run `pnpm why @ofs/types` from `apps/web/` — it must resolve to the local workspace version, not a registry version.

**Step 3.7 — Add `workspace:*` to Internal Dependencies**
In each placeholder `package.json`, add the appropriate internal dependencies using `workspace:*` protocol. Example: `apps/web` depends on `@ofs/ui workspace:*`, `@ofs/types workspace:*`, `@ofs/utils workspace:*`, `@ofs/validation workspace:*`, `@ofs/api-contracts workspace:*`. `apps/api` depends on `@ofs/types`, `@ofs/utils`, `@ofs/validation`, `@ofs/database`, `@ofs/logger`, `@ofs/audit`, `@ofs/api-contracts`. `apps/worker` depends on `@ofs/types`, `@ofs/utils`, `@ofs/database`, `@ofs/logger`, `@ofs/audit`. Each shared package depends only on packages that are strictly below it in the dependency hierarchy — no circular references.

**Step 3.8 — Commit Workspace Configuration**
Stage `pnpm-workspace.yaml`, `.npmrc`, updated root `package.json`, `pnpm-lock.yaml`, all placeholder `package.json` files. Commit: `chore: configure pnpm workspaces and internal package graph`. Push to `develop`.

### Responsible Agent
Infrastructure Agent

### Reviewing Agent
Architecture Agent

### Quality Gate
- `pnpm list --recursive --depth 0` shows all 12 workspace members (3 apps + 9 packages)
- `pnpm why @ofs/config` from any app directory resolves to the local workspace package
- `shamefully-hoist=false` is confirmed: no package appears at `node_modules/@ofs/*` directly under root — they resolve through the pnpm store
- `pnpm install` is idempotent: running it twice produces no changes to `pnpm-lock.yaml`
- No circular dependency exists in the internal `workspace:*` dependency graph

### Completion Criteria
`pnpm-workspace.yaml` and `.npmrc` committed on `develop`. All 12 workspace members recognized by pnpm. `workspace:*` protocol is in place for all internal cross-package dependencies. `pnpm-lock.yaml` is committed and reproducible. Infrastructure Agent confirms idempotency; Architecture Agent confirms the dependency graph direction is acyclic and matches the package hierarchy.

---

## 4. Shared Packages Creation Sequence

### Objective

Implement the nine shared packages under `packages/` — replacing the placeholder stubs from Section 3 with fully operational package contracts. Each package must export its public API through a barrel `index.ts`, declare its TypeScript configuration, and be buildable in isolation via Turborepo. Packages are created in strict dependency order: a package may only reference packages that have already been created and committed.

### Execution Steps

**Step 4.1 — Create `@ofs/config`**
This package has zero internal dependencies. It exports environment variable schemas (Zod), validated configuration objects, and the `NODE_ENV` utility. It must not import from any other `@ofs/*` package. Set up `tsconfig.json` extending a shared root tsconfig. Add `exports` field in `package.json` pointing to the built `dist/index.js` and type declaration `dist/index.d.ts`. Confirm `pnpm turbo run build --filter=@ofs/config` exits 0.

**Step 4.2 — Create `@ofs/types`**
Depends on: `@ofs/config`. Exports all shared TypeScript interfaces (`I<Entity>` naming convention), enums, and utility types used across the system. Includes the `StatusConfig<TStatus>` generic type, `ApiResponse<T>` envelope type, pagination cursor/offset types, and the `TenantContext` interface. No runtime logic — types only. Confirm build passes.

**Step 4.3 — Create `@ofs/utils`**
Depends on: `@ofs/config`, `@ofs/types`. Exports:
- `formatDate(date: Date | string): string` — returns DD MMM YYYY format with Arabic month abbreviations as default; throws on invalid input (no silent fallback)
- `formatMoney(amount: bigint, currency: string, locale?: string): string` — only allowed money-to-string function
- BigInt arithmetic helpers (add, subtract, multiply with banker's rounding)
- RTL bidi utilities
- Cursor and offset pagination helpers
- `assertNever(x: never): never` exhaustiveness checker

No utility may use `moment` or `dayjs`. `date-fns` is the only date library permitted. Confirm 100% test coverage on `date/` and `money/` sub-directories before marking this step complete.

**Step 4.4 — Create `@ofs/validation`**
Depends on: `@ofs/config`, `@ofs/types`, `@ofs/utils`. Exports Zod schemas for every shared DTO, the `ZodValidationPipe` factory (NestJS-compatible), the `datePrimitive` Zod primitive that accepts only DD MMM YYYY strings, the `workflowTransitionSchema` factory, and the `customFieldSchema` factory. All Zod error messages must be bilingual — Arabic label first, English label second. Confirm build passes and Zod schema exports are tree-shakeable.

**Step 4.5 — Create `@ofs/database`**
Depends on: `@ofs/config`, `@ofs/types`. Exports:
- The Prisma Client singleton (`db`) configured for PgBouncer transaction mode (port 6543, `pgbouncer=true`, `connection_limit=1`)
- The read-replica Prisma Client singleton (`dbRead`) with fallback warning if `DATABASE_READ_URL` is not set (falls back to `DATABASE_URL` with a warning log — never silently)
- `validateConnection(): Promise<void>` — used in health checks
- The Prisma Client type re-exports for use in other packages without duplicating the Prisma dependency

The Prisma schema lives inside this package at `packages/database/prisma/schema.prisma`. The baseline migration directory lives at `packages/database/prisma/migrations/`. `directUrl` must be set to bypass PgBouncer during `prisma migrate deploy`. Confirm `pnpm turbo run db:generate --filter=@ofs/database` exits 0.

**Step 4.6 — Create `@ofs/logger`**
Depends on: `@ofs/config`, `@ofs/types`. Exports:
- `createLogger(context: string): Logger` factory — returns a Pino logger instance configured for JSON output in production, pretty output in development
- The `Logger` interface with methods: `info`, `warn`, `error`, `debug`, `fatal`
- PII redaction configuration (applied at the Pino transport level — redaction paths cover fields identified in the architecture: `password`, `token`, `secret`, `authorization`, `creditCard`)
- `requestId` injection utilities for child logger creation

Confirm build passes. Confirm `createLogger` is the only permitted logger constructor — `console.log` is blocked by ESLint (configured in Section 5).

**Step 4.7 — Create `@ofs/audit`**
Depends on: `@ofs/config`, `@ofs/types`, `@ofs/logger`, `@ofs/database`. Exports:
- `AuditEmitter` class with `emit(event: AuditEvent, tx: PrismaTransaction): Promise<void>` — writes to `AuditLog` inside the caller's transaction, never outside
- `AuditEvent` type with fields: `tenantId`, `actorId`, `action`, `resourceType`, `resourceId`, `before`, `after`, `requestId`, `ipAddress`
- `@Auditable` decorator stub (Phase 1 implementation: logs only; full interceptor wiring is Phase 2)
- Diff utility: accepts `before` and `after` objects, returns only changed fields, excludes `updatedAt`, converts `BigInt` to string, redacts PII fields

Confirm build passes. Confirm `AuditEmitter.emit` signature enforces the `tx` parameter — it must not be optional.

**Step 4.8 — Create `@ofs/api-contracts`**
Depends on: `@ofs/config`, `@ofs/types`, `@ofs/validation`. Exports all request/response DTOs as Zod schemas with inferred TypeScript types. Exports the typed API client factory for use in `apps/web`. Exports webhook payload types. All DTOs use `z.infer<typeof Schema>` — no duplicate manual type declarations. BigInt fields are serialized as strings in API contracts (the client deserializes back to BigInt). Confirm build passes.

**Step 4.9 — Create `@ofs/ui`**
Depends on: `@ofs/config`, `@ofs/types`, `@ofs/utils`. This is the design system package. It exports:
- Rubik font loading configuration (WOFF2 files only, 8 weight/style combinations, `font-display: swap`, self-hosted — no Google Fonts CDN in production)
- The CSS custom property token scale for the professional green theme
- `StatusBadge` component driven by `StatusConfig<TStatus>` — zero hardcoded status strings
- RTL-first base styles using CSS logical properties throughout
- Shared layout primitives

Confirm Rubik font files are committed inside the package at `packages/ui/src/fonts/`. Confirm no inline color values exist in component files — all colors reference CSS custom properties from the token scale.

**Step 4.10 — Run Full Workspace Build**
Run `pnpm turbo run build` from the root. All nine packages must build successfully in dependency order (Turborepo resolves this automatically from the task graph). Zero TypeScript errors. Zero lint errors. Commit all package source files: `feat: implement all shared @ofs/* packages`. Push to `develop`.

### Responsible Agent
Full-Stack Agent (packages 4.1–4.4, 4.8–4.9) and Infrastructure Agent (packages 4.5–4.7)

### Reviewing Agent
Architecture Agent (all packages); Security Agent (4.6 PII redaction, 4.7 audit transaction enforcement, 4.5 database connection config)

### Quality Gate
- `pnpm turbo run build` exits 0 with all nine packages built
- `pnpm turbo run typecheck` exits 0 with zero TypeScript errors
- `pnpm turbo run lint` exits 0 with zero ESLint errors
- `pnpm turbo run test` exits 0; `@ofs/utils` date/ and money/ sub-directories report 100% coverage
- `formatDate(new Date('2026-01-15'))` returns exactly `'15 Jan 2026'`
- `AuditEmitter.emit` TypeScript signature requires `tx` — calling it without `tx` produces a compile error
- `@ofs/ui` Rubik font files exist and are served via the package, no Google Fonts CDN URL in source
- No CSS inline color values in `@ofs/ui` component files — all reference CSS custom properties
- `pnpm why @ofs/config` from `apps/web/` resolves to the local workspace version

### Completion Criteria
All nine shared packages are built, tested, and committed on `develop`. The Turborepo build graph is acyclic and resolves in correct dependency order. Architecture Agent confirms package boundaries respect the defined dependency hierarchy. Security Agent confirms PII redaction paths and audit transaction enforcement. Full-Stack Agent confirms `formatDate` output and RTL CSS logical properties are present in `@ofs/ui`.

---

## 5. Infrastructure Bootstrap Sequence

### Objective

Provision and configure the supporting infrastructure required for the platform to operate: Supabase project setup, environment variable distribution strategy, Husky git hooks, ESLint and Prettier root configuration, and the CI/CD baseline workflow. After this sequence, every commit is linted and type-checked automatically, secrets are blocked from being committed, and the CI pipeline executes on every push to `develop`.

### Execution Steps

**Step 5.1 — Supabase Project Initialization**
Using the Supabase CLI, initialize the local Supabase configuration in the repository at `supabase/config.toml`. Configure: project name, local ports (API: 54321, DB: 54322, Studio: 54323), auth JWT expiry, and disable email confirmation for local development. Do not create the production Supabase project in this step — local only. Run `supabase start` and confirm all services start without error.

**Step 5.2 — Extract Local Supabase Variables**
Run `supabase status` and extract: `API URL`, `DB URL`, `anon key`, `service_role key`, `JWT secret`. Record these in `.env.local` (gitignored) following the variable naming convention from the architecture. Create `.env.example` at the repository root listing all required variable names with placeholder values and a comment describing the purpose of each. `.env.example` is committed to source — it is the canonical variable contract.

**Step 5.3 — Environment Variable Distribution**
For each application (`apps/web`, `apps/api`, `apps/worker`), create a `.env.example` file listing only the variables that application requires (not the full set — scoped per app). Create `.env.local` (gitignored) with actual local values for development. Variables prefixed `NEXT_PUBLIC_` are the only variables that may appear in the frontend app. Backend secrets must never appear in `apps/web/.env.example`.

**Step 5.4 — Configure Root ESLint**
Create root `eslint.config.js` (flat config format). Rules that must be enforced across all packages and apps:
- `no-console`: error (use `@ofs/logger` instead)
- `no-restricted-syntax`: block `$queryRaw` with string concatenation (template literal allowed, string variable concatenation is not)
- TypeScript strict mode rules via `@typescript-eslint/recommended-type-checked`
- Import ordering rules: external imports first, then `@ofs/*` internal imports, then relative imports
- No `any` type without explicit `// eslint-disable-next-line` comment explaining why

Each app and package may extend the root config and add local rules. They may not loosen root rules.

**Step 5.5 — Configure Root Prettier**
Create `.prettierrc` at the repository root. Settings: single quotes, trailing commas (ES5), 100-character print width, 2-space indent, LF line endings. Create `.prettierignore` covering: `dist/`, `.next/`, `pnpm-lock.yaml`, `*.md` (markdown is hand-formatted in this project). Add `format` script to root `package.json`: `prettier --write .`.

**Step 5.6 — Configure Husky and `lint-staged`**
Install `husky` and `lint-staged` as root dev dependencies. Initialize Husky (`husky install`). Add the `prepare` script to root `package.json`: `husky install`. Create these hooks:

- `pre-commit`: runs `lint-staged` (lint + format changed files only), runs secret scanning via `gitleaks` or equivalent against staged files. If secret scanning finds a match, block the commit with an explicit error message naming the file and pattern matched.
- `commit-msg`: validates commit message follows Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`, `perf:`). Reject with a message explaining the required format.

**Step 5.7 — Create TypeScript Root Configuration**
Create `tsconfig.base.json` at the repository root with strict TypeScript settings: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`. Set `moduleResolution: bundler`, `module: ESNext`, `target: ES2022`. All package and app `tsconfig.json` files extend this base. No package may disable a strict rule without Architecture Agent approval recorded in a code comment.

**Step 5.8 — Create CI Baseline Workflow**
Create `.github/workflows/ci.yml`. The workflow triggers on push to `develop` and on pull requests targeting `develop` or `main`. Stages in order:
- **Stage 1 — Quality**: `pnpm lint`, `pnpm typecheck`, secret scan via `gitleaks`, `pnpm audit --audit-level=high` (blocks on high or critical vulnerabilities)
- **Stage 2 — Unit Tests**: `pnpm test` with coverage reporting. Upload coverage artifact.
- **Stage 3 — Build**: `pnpm build`. Uses Turborepo remote cache.
- **Stage 4 — Integration Tests** (PR only, not on direct push): `pnpm test:integration` against the Supabase local stack spun up in the CI environment.

Each stage runs only if the previous stage passed. No stage may be skipped via `continue-on-error: true`.

**Step 5.9 — Add Branch Protection Status Checks**
Return to the GitHub branch protection rules for `main` and `develop` (configured in Section 1.8 and 1.9). Add the CI job names from the `ci.yml` workflow as required status checks. Branch protection is now enforced by actual CI, not just the placeholder from Section 1.

**Step 5.10 — Create Nightly Audit Workflow**
Create `.github/workflows/nightly-audit.yml`. Triggers on `schedule: cron` at 02:00 UTC daily. Runs: `pnpm audit --audit-level=moderate`, `pnpm outdated` (informational, does not block), dependency license scan. On failure, opens a GitHub Issue titled `[Automated] Dependency Audit Failure — <DD MMM YYYY>` and assigns it to the Infrastructure Agent's GitHub team.

**Step 5.11 — Commit Infrastructure Configuration**
Stage all new files: `.github/workflows/`, `supabase/config.toml`, `.env.example`, per-app `.env.example` files, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `tsconfig.base.json`, `.husky/`, updated root `package.json`. Commit: `chore: bootstrap infrastructure — ci, hooks, lint, supabase`. Push to `develop`. Confirm CI triggers and all stages pass.

### Responsible Agent
Infrastructure Agent

### Reviewing Agent
Security Agent (5.1–5.3 environment variables, 5.6 secret scanning, 5.8 audit gate); Architecture Agent (5.4 ESLint rules, 5.7 TypeScript strictness, 5.8 CI pipeline structure)

### Quality Gate
- `supabase start` runs without error locally and all services report healthy
- `.env.example` files exist for root and each app; no secret values are present in any `.env.example`
- `pnpm lint` exits 0 on the committed codebase
- `pnpm typecheck` exits 0 on the committed codebase
- `git commit` with a message that violates Conventional Commits format is rejected by the `commit-msg` hook
- A file containing a test secret pattern (e.g. `SECRET_KEY=abc123`) staged for commit is rejected by the `pre-commit` hook secret scan
- `.github/workflows/ci.yml` triggers on the first push to `develop` after this commit and all four stages pass
- `pnpm audit --audit-level=high` exits 0 (no high or critical vulnerabilities in the initial dependency set)
- Branch protection on `develop` now lists the CI job names as required status checks

### Completion Criteria
All infrastructure configuration is committed on `develop`. CI passes on the first run. Husky hooks are active on all developer machines (enforced via `prepare` script running on `pnpm install`). Environment variable contracts are documented in `.env.example` files. Security Agent confirms no secrets are present in any committed file and the pre-commit secret scan is operational. Architecture Agent confirms ESLint and TypeScript strictness settings match the non-negotiable platform rules.

---

## 6. Frontend Bootstrap Sequence

### Objective

Scaffold the `apps/web` Next.js application with the App Router, enforce RTL-first layout from the very first file, configure Arabic as the default locale, wire up the Rubik font exclusively from the `@ofs/ui` package, and confirm the local development server starts and renders a valid RTL Arabic page. No feature UI is built in this sequence — only the structural shell that all future frontend work extends.

### Execution Steps

**Step 6.1 — Scaffold Next.js Application**
Inside `apps/web`, initialize a Next.js application using the App Router (not Pages Router). Use the exact Next.js version pinned in the architecture. Do not use the `create-next-app` interactive wizard output as-is — review and align `package.json`, `next.config.js`, and `tsconfig.json` with the project standards before committing. Remove all placeholder content (default `page.tsx`, `globals.css` starter styles, `public/` SVG assets) before the first commit.

**Step 6.2 — Configure `next.config.js`**
Set: `output: 'standalone'` for Docker compatibility, `reactStrictMode: true`, `poweredByHeader: false` (removes `X-Powered-By: Next.js` response header — security hygiene). Configure the `experimental.serverComponentsExternalPackages` list to include Prisma if needed. Set `images.domains` to an explicit allowlist — no wildcard. Do not enable experimental flags that are not in the agreed architecture.

**Step 6.3 — Establish App Router Directory Structure**
Create the App Router directory tree inside `apps/web/src/app/`:

```
app/
  [locale]/
    layout.tsx        ← locale root layout
    page.tsx          ← locale home (placeholder)
    (auth)/
      login/
        page.tsx      ← placeholder
    (dashboard)/
      layout.tsx      ← authenticated shell placeholder
      page.tsx        ← dashboard placeholder
  api/
    health/
      route.ts        ← health check endpoint
  layout.tsx          ← root layout (sets dir, lang, font)
  not-found.tsx       ← 404 page
  error.tsx           ← error boundary
  global-error.tsx    ← root error boundary
```

All `page.tsx` and `layout.tsx` files are placeholders at this stage — they render a single Arabic string and nothing more. No styling beyond what is required to confirm RTL rendering.

**Step 6.4 — Configure Root Layout for RTL Arabic**
In `apps/web/src/app/layout.tsx`, set `<html lang="ar" dir="rtl">` as static defaults. Apply the Rubik font class from `@ofs/ui` to `<body>`. This is the non-negotiable baseline: every page in the application inherits RTL direction and the Rubik font from this single root layout. No component may override `dir` to `ltr` without an explicit Architecture Agent approval comment in the source.

**Step 6.5 — Wire Rubik Font from `@ofs/ui`**
Import the Rubik font configuration exported by `@ofs/ui`. The font must be loaded as a Next.js `next/font/local` instance pointing to the WOFF2 files committed inside `packages/ui/src/fonts/`. Font loading configuration: `display: 'swap'`, all 8 weight/style combinations included. Apply the font variable to the `<html>` element. Confirm in browser DevTools that the `font-family` resolves to `Rubik` and the WOFF2 files are served from the local origin — not from fonts.googleapis.com or fonts.gstatic.com.

**Step 6.6 — Configure `next-intl` for Locale Routing**
Install `next-intl` (exact version pinned). Create the middleware at `apps/web/src/middleware.ts` that intercepts all requests and redirects based on locale. Configure: supported locales `['ar', 'en']`, default locale `'ar'`. Create the `[locale]` segment layout that provides the `next-intl` context. Create placeholder message files at `apps/web/messages/ar.json` and `apps/web/messages/en.json`. The Arabic message file is the source of truth — English translations are added after Arabic is complete, never before.

**Step 6.7 — Configure `tsconfig.json` for `apps/web`**
Extend `tsconfig.base.json` from the root. Add path aliases: `@/*` → `./src/*`. Confirm `next-intl` types are recognized. Set `include` to cover `src/` only. Confirm `pnpm turbo run typecheck --filter=apps/web` exits 0.

**Step 6.8 — Implement Health Route**
In `apps/web/src/app/api/health/route.ts`, implement a `GET` handler that returns a JSON response with: `status: 'ok'`, `app: 'web'`, `timestamp` in DD MMM YYYY format (using `formatDate` from `@ofs/utils`). This route is used by Vercel health checks and the local development verification checklist.

**Step 6.9 — Configure Local Dev Script**
In `apps/web/package.json`, set the `dev` script to run on port 3007 (`next dev --port 3007`). Confirm Turborepo's `dev` task picks this up. Running `pnpm dev --filter=apps/web` must start the server on port 3007 and not conflict with any other workspace app.

**Step 6.10 — Verify RTL Render and Commit**
Start the development server. Open `http://localhost:3007/ar` in a browser. Confirm: `dir="rtl"` is on the `<html>` element, `lang="ar"` is set, the Rubik font is loading from the local origin, the page renders without console errors. Open `http://localhost:3007/api/health` and confirm the JSON response is well-formed with a DD MMM YYYY timestamp. Commit: `feat(web): bootstrap next.js app with rtl arabic root and rubik font`. Push to `develop`.

### Responsible Agent
Frontend Agent

### Reviewing Agent
Architecture Agent (App Router structure, RTL enforcement); UI/UX Agent (Rubik font loading, `dir="rtl"` verification); Security Agent (`poweredByHeader: false`, image domain allowlist)

### Quality Gate
- `http://localhost:3007/ar` renders with `dir="rtl"` and `lang="ar"` on `<html>`
- Browser DevTools Network tab shows Rubik WOFF2 files served from `localhost:3007` — zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`
- `http://localhost:3007/api/health` returns `{"status":"ok","app":"web","timestamp":"24 May 2026"}` (date matches current date in DD MMM YYYY format)
- `pnpm turbo run typecheck --filter=apps/web` exits 0
- `pnpm turbo run lint --filter=apps/web` exits 0
- Navigating to `http://localhost:3007` (no locale) redirects to `http://localhost:3007/ar`
- No component in `src/` contains `dir="ltr"` without an approval comment
- `X-Powered-By` response header is absent from all responses

### Completion Criteria
`apps/web` is committed on `develop` with RTL Arabic root layout, Rubik font from local origin, `next-intl` locale routing defaulting to Arabic, and a passing health endpoint. Frontend Agent signs off on visual RTL confirmation. Architecture Agent confirms the App Router directory structure matches the agreed layout. UI/UX Agent confirms Rubik font is the only font loading.

---

## 7. Design System Setup Sequence

### Objective

Operationalize the `@ofs/ui` package as the single source of truth for all visual decisions: the professional green token scale, RTL-first component primitives, the `StatusBadge` component, and the Storybook development environment for isolated component review. After this sequence, every future UI component is built on top of these foundations without re-declaring colors, spacing, or typography.

### Execution Steps

**Step 7.1 — Define CSS Custom Property Token Scale**
In `packages/ui/src/tokens/`, define the complete CSS custom property scale as a `.css` file (not a JavaScript object — CSS custom properties are the runtime contract). Token categories:

- **Color — Green Scale**: `--color-green-50` through `--color-green-950` (11 stops). The primary brand green sits at `--color-green-600`. The hover state is `--color-green-700`. The active/pressed state is `--color-green-800`. The subtle background tint is `--color-green-50`.
- **Color — Neutral Scale**: `--color-neutral-0` (white) through `--color-neutral-950` (near-black). 11 stops.
- **Color — Semantic Tokens**: `--color-primary`, `--color-primary-hover`, `--color-primary-active`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-border-subtle`, `--color-text`, `--color-text-muted`, `--color-text-inverse`. Each semantic token references a scale token via `var()` — never a raw hex value.
- **Color — Status Tokens**: `--color-status-draft`, `--color-status-active`, `--color-status-pending`, `--color-status-approved`, `--color-status-rejected`, `--color-status-cancelled`, `--color-status-completed`. These are the only permitted status colors. `StatusBadge` uses these — nothing else does.
- **Spacing**: `--space-1` through `--space-16` on a 4px base scale.
- **Typography**: `--font-family-base: 'Rubik', sans-serif`, `--font-size-xs` through `--font-size-4xl`, `--font-weight-regular: 400`, `--font-weight-medium: 500`, `--font-weight-semibold: 600`, `--font-weight-bold: 700`.
- **Border Radius**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`.
- **Shadow**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.

No component file may reference a color, spacing value, or font by raw value. All values go through these tokens.

**Step 7.2 — Implement RTL-First Base Styles**
In `packages/ui/src/styles/base.css`, define reset and base styles using CSS logical properties exclusively:
- `margin-inline-start` / `margin-inline-end` instead of `margin-left` / `margin-right`
- `padding-inline-start` / `padding-inline-end` instead of `padding-left` / `padding-right`
- `border-inline-start` / `border-inline-end` instead of `border-left` / `border-right`
- `inset-inline-start` / `inset-inline-end` instead of `left` / `right`
- `text-align: start` instead of `text-align: left`

No physical directional property (`left`, `right`, `margin-left`, `padding-right`, etc.) is permitted in any file inside `packages/ui/`. The ESLint plugin `eslint-plugin-css-logical` enforces this rule — configure it for the `packages/ui/` scope.

**Step 7.3 — Implement `StatusBadge` Component**
`StatusBadge` is the canonical component for rendering any workflow status. Its contract:
- Accepts `status: TStatus` (generic) and `config: StatusConfig<TStatus>` (the map of status → label/color/transitions)
- Renders the `labelAr` field as the visible label (Arabic first — the `label` English field is the `aria-label` fallback for screen readers)
- Applies `--color-status-*` token via the `colour` field from `StatusConfig`
- Renders as a `<span>` with `role="status"` for accessibility
- Zero hardcoded strings inside the component — all text comes from the config object
- Zero hardcoded colors — all colors reference the status token scale

This component must work correctly for every future domain status (sales order, purchase order, inventory adjustment, leave request, expense report, etc.) without modification. The `StatusConfig` shape is the extension point.

**Step 7.4 — Implement Core Layout Primitives**
Create the following layout components in `packages/ui/src/components/layout/`:
- `Stack`: vertical or horizontal flex container with `gap` from the spacing token scale. Supports `direction` prop (`'column'` | `'row'`). Uses `gap` (logical) not `margin`.
- `Grid`: CSS grid wrapper with `columns` and `gap` props from the token scale.
- `Container`: max-width wrapper with horizontal `padding-inline` from the token scale. Centers content. RTL-safe.
- `Divider`: horizontal rule using `border-block-end` (logical) not `border-bottom`.

No layout component hardcodes pixel values — all values reference spacing tokens.

**Step 7.5 — Implement Core Input Primitives**
Create the following form primitives in `packages/ui/src/components/form/`:
- `Label`: wraps `<label>` with correct `htmlFor`, applies `--font-weight-medium`, renders Arabic text correctly in RTL.
- `Input`: wraps `<input>` with focus ring using `outline-offset` (not box-shadow hack), error state via `aria-invalid`, `text-align: start` (logical).
- `Button`: primary, secondary, ghost, and destructive variants. Uses `--color-primary` and `--color-primary-hover` tokens. Icon-start and icon-end slots using `margin-inline-start`/`margin-inline-end`. Never `margin-left`/`margin-right`.
- `FieldError`: renders validation error text. Styled with `--color-status-rejected`. Associated to the input via `aria-describedby`.

These primitives are unstyled shells at this stage — they accept `className` for extension but provide accessible structure and token-based defaults.

**Step 7.6 — Configure Storybook**
Install Storybook (exact version pinned) inside `packages/ui/`. Configure for React + Vite. Add stories for: `StatusBadge` (one story per status token color), `Stack`, `Grid`, `Container`, `Button` (all variants), `Input` (default, error, disabled), `Label`, `FieldError`. All stories render with `dir="rtl"` by default — the Storybook global decorator sets `document.documentElement.dir = 'rtl'` and `document.documentElement.lang = 'ar'`. Add a `storybook` script to `packages/ui/package.json`. Storybook does not run via Turborepo — it is a local development tool only, not part of the build pipeline.

**Step 7.7 — Export Package Public API**
In `packages/ui/src/index.ts`, export all components, tokens (as a CSS string import path), and the Rubik font configuration. Structure exports clearly by category: fonts, tokens, layout, form, status. Only export what is intended to be consumed by apps — internal utilities are not exported from the barrel.

**Step 7.8 — Write Component Tests**
Write unit tests in `packages/ui/src/__tests__/` for: `StatusBadge` renders `labelAr` as visible text and `label` as `aria-label`; `StatusBadge` applies the correct CSS custom property for each status token; `Button` renders all four variants without throwing; `Input` sets `aria-invalid="true"` when the error prop is provided; all layout components render children without error. Tests run via Vitest. Confirm `pnpm turbo run test --filter=@ofs/ui` exits 0.

**Step 7.9 — Rebuild and Verify**
Run `pnpm turbo run build --filter=@ofs/ui`. Import `@ofs/ui` from `apps/web` and render `StatusBadge` with a test config on the placeholder home page. Confirm in browser that: the status badge renders with Arabic text, uses the correct token color, and the Rubik font is applied. Remove the test render before committing.

**Step 7.10 — Commit Design System**
Commit: `feat(ui): implement design system — tokens, rtl base, status badge, primitives`. Push to `develop`. Update `apps/web` to import the token CSS file in the root layout so all token values are available globally.

### Responsible Agent
UI/UX Agent

### Reviewing Agent
Frontend Agent (integration into `apps/web`); Architecture Agent (RTL enforcement, zero hardcoded values, `StatusBadge` generics contract)

### Quality Gate
- No file in `packages/ui/src/` contains a physical directional CSS property (`margin-left`, `padding-right`, `left:`, `right:`) — ESLint CSS logical plugin exits 0
- No file in `packages/ui/src/` contains a raw hex color value — all colors reference CSS custom properties
- `StatusBadge` renders `labelAr` as visible text in RTL stories — confirmed in Storybook
- `pnpm turbo run test --filter=@ofs/ui` exits 0
- `pnpm turbo run build --filter=@ofs/ui` exits 0
- Storybook launches at `http://localhost:6006` with `dir="rtl"` active on the document root in all stories
- `packages/ui/src/fonts/` contains WOFF2 files — no URLs pointing to external font CDNs in any source file

### Completion Criteria
Design system package is built, tested, and committed on `develop`. All token categories are defined. RTL logical properties are enforced by ESLint. `StatusBadge` is generic and config-driven with zero hardcoded status strings or colors. Storybook is operational for local development. UI/UX Agent confirms visual parity in Storybook. Architecture Agent confirms the `StatusConfig<TStatus>` generic contract matches the type defined in `@ofs/types`.

---

## 8. Backend Bootstrap Sequence

### Objective

Scaffold the `apps/api` NestJS application, establish the module architecture, configure the global middleware stack (CORS, validation pipe, exception filter, interceptors, rate limiting, request size cap), and confirm the backend starts and responds to health checks. No domain modules are built in this sequence — only the application shell and core infrastructure modules.

### Execution Steps

**Step 8.1 — Scaffold NestJS Application**
Inside `apps/api`, initialize a NestJS application using the NestJS CLI or manual scaffold (exact NestJS version pinned). Remove all generated placeholder files that do not conform to the architecture (the default `app.controller.ts`, `app.service.ts` stubs are replaced by the structure in Step 8.3). Extend `tsconfig.base.json`. Set `emitDecoratorMetadata: true` and `experimentalDecorators: true` (required for NestJS decorators) in `apps/api/tsconfig.json`.

**Step 8.2 — Configure Bootstrap Order**
In `apps/api/src/main.ts`, configure the NestJS application in this exact order — order matters because each layer wraps the next:

1. Create the Nest application instance
2. Enable CORS with an explicit origin allowlist loaded from `CORS_ALLOWED_ORIGINS` environment variable (comma-separated). Wildcard `*` is rejected at boot if `NODE_ENV === 'production'`.
3. Set global prefix: `/v1`
4. Apply `ZodValidationPipe` globally (from `@ofs/validation`)
5. Apply `GlobalExceptionFilter` globally
6. Apply `LoggingInterceptor` globally (generates and propagates `requestId`)
7. Apply `AuditInterceptor` globally (no-op on non-`@Auditable` methods — zero overhead)
8. Configure JSON body parser with a nesting depth cap of 10 levels and a maximum body size of 1 MB
9. Apply rate limiting guard globally (token bucket — 100 requests per 60 seconds per IP by default; overridable per route)
10. Start listening on the port from `PORT` environment variable (default 3001)

**Step 8.3 — Define Core Module Structure**
Create the following NestJS modules inside `apps/api/src/`:

- `app.module.ts` — root module; imports all other modules listed below
- `core/core.module.ts` — registers global providers: `TenantContext`, `LoggingInterceptor`, `AuditInterceptor`, `GlobalExceptionFilter`
- `health/health.module.ts` — health check controller and service
- `auth/auth.module.ts` — JWT guard, `@Public()` decorator, Supabase JWT verification (stub: passes all in this sequence, fully operational in Section 9)
- `tenant/tenant.module.ts` — `TenantGuard`, `TenantContext` request-scoped provider (stub: uses `X-Tenant-ID` header, full subdomain resolution in Section 9)
- `config/config.module.ts` — wraps `@ofs/config`, makes validated config available via NestJS `ConfigService`-compatible provider

No domain modules (sales, inventory, purchasing, etc.) are created in this sequence.

**Step 8.4 — Implement `TenantContext` Provider**
In `tenant/tenant.context.ts`, implement a request-scoped NestJS provider that:
- Reads `tenantId` from the `X-Tenant-ID` header (stub) or resolves it from the subdomain (full implementation in Section 9)
- Is immutable after initialization — `tenantId` cannot be changed after the request is bound
- Throws `UnauthorizedException` if no tenant can be determined
- Is typed as `{ tenantId: string }` — no optional fields, no nullable `tenantId`

`TenantContext` must be registered as `REQUEST` scope. Any service that injects `TenantContext` is automatically promoted to `REQUEST` scope by NestJS — document this behavior in the module's JSDoc. All `BaseTenantRepository` instances depend on `TenantContext`.

**Step 8.5 — Implement `GlobalExceptionFilter`**
The filter catches all exceptions and maps them to the `ApiResponse` error envelope format. Mapping table:
- `ZodValidationException` → HTTP 422 with Arabic field-level error messages
- `BusinessRuleException` → HTTP 409 (conflict/rule violation)
- `UnauthorizedException` → HTTP 401
- `ForbiddenException` → HTTP 403
- `NotFoundException` → HTTP 404
- Prisma `P2002` (unique constraint) → HTTP 409
- Prisma `P2025` (record not found) → HTTP 404
- Prisma `P2003` (foreign key violation) → HTTP 409
- All other exceptions → HTTP 500 (message: Arabic generic error; stack trace logged only, never sent to client)

The filter logs every exception at `error` level using the `@ofs/logger` instance. Stack traces are logged — never sent in the response body.

**Step 8.6 — Implement Health Check Endpoint**
In `health/health.controller.ts`, implement `GET /v1/health` as a `@Public()` route (no auth required). The response must include:
- `status`: `'ok'` or `'degraded'`
- `timestamp`: DD MMM YYYY format (from `formatDate` in `@ofs/utils`)
- `services.database`: `'connected'` or `'disconnected'` (calls `validateConnection()` from `@ofs/database`)
- `services.readReplica`: `'connected'`, `'disconnected'`, or `'fallback'` (if `DATABASE_READ_URL` is not set and `dbRead` falls back to primary)

If any service reports `'disconnected'`, the overall `status` is `'degraded'` and the HTTP status code is 503.

**Step 8.7 — Configure `BaseTenantRepository`**
In `apps/api/src/core/repositories/base-tenant.repository.ts`, implement the abstract base class that all domain repositories extend. It must:
- Accept `TenantContext` as a constructor dependency (injected by NestJS)
- Expose a protected `get db()` that returns the Prisma client from `@ofs/database`
- Expose a protected `get dbRead()` that returns the read-replica Prisma client
- Expose a protected `get tenantId(): string` — typed as `string`, never `string | undefined`
- Enforce at the TypeScript level that all query methods receive `tenantId` as the first filter argument — via a generic typed constraint, not via runtime checks

Prisma middleware injection is explicitly prohibited for tenant isolation — `tenantId` filtering is a compile-time contract enforced by the repository base class, not a runtime interceptor.

**Step 8.8 — Implement `LoggingInterceptor`**
In `core/interceptors/logging.interceptor.ts`, implement the NestJS interceptor that:
- Generates a `requestId` (UUID v4) for each request if not already present in the `X-Request-ID` header
- Attaches `requestId` to the request object and to the logger child context
- Logs request start: method, path, `tenantId` (if resolved), `requestId` — at `info` level
- Logs request end: status code, duration in ms, `requestId` — at `info` level
- Logs errors: full error details including `requestId`, `tenantId`, user ID — at `error` level
- Never logs request body or response body (PII risk)

**Step 8.9 — Start and Verify**
Start `apps/api` with `pnpm dev --filter=apps/api`. Confirm: server starts on port 3001 without error, `GET http://localhost:3001/v1/health` returns a 200 with well-formed JSON and a DD MMM YYYY timestamp, `GET http://localhost:3001/v1/nonexistent` returns 404 in the `ApiResponse` error envelope, a request without `X-Tenant-ID` to a non-`@Public()` route returns 401.

**Step 8.10 — Commit Backend Bootstrap**
Commit: `feat(api): bootstrap nestjs application with rtl-ready core modules`. Push to `develop`. Confirm CI passes.

### Responsible Agent
Backend Agent

### Reviewing Agent
Architecture Agent (bootstrap order, module structure, `TenantContext` scoping); Security Agent (CORS configuration, rate limiting, JSON depth cap, stack trace containment in responses)

### Quality Gate
- `GET /v1/health` returns 200 with `status: 'ok'` and a DD MMM YYYY timestamp
- `GET /v1/nonexistent` returns 404 in `ApiResponse` envelope format — not a raw NestJS 404
- `CORS_ALLOWED_ORIGINS='*'` with `NODE_ENV=production` causes the server to refuse to start
- A request with an invalid JSON body (deeply nested beyond 10 levels) returns 400 — body is not parsed
- Rate limiting triggers a 429 response after 100 requests in 60 seconds from the same IP
- Stack traces are absent from all HTTP response bodies — present only in server logs
- `pnpm turbo run typecheck --filter=apps/api` exits 0
- `pnpm turbo run lint --filter=apps/api` exits 0

### Completion Criteria
`apps/api` is committed on `develop` with the complete global middleware stack, core module structure, `TenantContext`, `BaseTenantRepository`, and a passing health endpoint. Backend Agent signs off on all Quality Gate items. Security Agent confirms CORS production guard, rate limiting, and response body stack trace containment. Architecture Agent confirms module structure and bootstrap order match the agreed architecture.

---

## 9. API Foundation Sequence

### Objective

Implement the authentication and authorization layers on top of the backend shell from Section 8: Supabase JWT verification, the `AuthGuard`, the `@Public()` decorator, the RBAC `@RequirePermission()` decorator, the `TenantGuard` with full subdomain resolution, and the `WorkflowService` as the single entry point for all status transitions. After this sequence, every protected route requires a valid JWT and a resolved tenant — no exceptions without `@Public()`.

### Execution Steps

**Step 9.1 — Implement Supabase JWT Verification**
In `auth/strategies/supabase-jwt.strategy.ts`, implement JWT verification that:
- Verifies the JWT signature locally against `API_JWT_SECRET` from `@ofs/config` — no Supabase API call per request
- Extracts the Supabase user payload: `sub` (user ID), `email`, `role`
- Rejects expired tokens (checks `exp` claim)
- Rejects tokens issued for a different audience (checks `aud` claim against `authenticated`)
- Returns a typed `AuthenticatedUser` object: `{ userId: string; email: string; role: string }`

JWTs are read from the `Authorization: Bearer <token>` header. Cookie-based auth is not supported in Phase 2 — the browser Supabase client handles token refresh and attaches the header.

**Step 9.2 — Implement `AuthGuard`**
In `auth/guards/auth.guard.ts`, implement a NestJS guard that:
- Checks for the `@Public()` decorator — if present, skips all auth checks and returns `true`
- Calls the Supabase JWT verification from Step 9.1
- Attaches the `AuthenticatedUser` to the request object under `request.user`
- Returns `false` (triggers 401) if the JWT is absent, malformed, expired, or invalid

`AuthGuard` is registered globally in `app.module.ts`. Every route requires a valid JWT unless decorated with `@Public()`. This is the correct default — fail closed, not open.

**Step 9.3 — Implement Full `TenantGuard` with Subdomain Resolution**
Replace the stub `TenantGuard` from Section 8 with full subdomain resolution:
- Extract the subdomain from the `Host` header: `<subdomain>.ofs.app` → `tenantId` lookup
- Look up `tenantId` from the `Tenant` Prisma model using the subdomain as the key
- Cache the subdomain → `tenantId` mapping in memory for 60 seconds to avoid repeated DB lookups per request (a simple `Map` with TTL — not Redis; Redis caching is Phase 3)
- Fall back to `X-Tenant-ID` header in local development (`NODE_ENV !== 'production'`) for developer convenience
- Attach the resolved `TenantContext` to the request scope
- Throw `UnauthorizedException` if the subdomain does not map to a known active tenant

**Step 9.4 — Implement RBAC Permission System**
In `auth/rbac/`, implement:
- `PERMISSIONS` constant object in `@ofs/types` with all Phase 2 permission strings in `DOMAIN:ACTION` format (e.g. `'TENANT:READ'`, `'USER:INVITE'`, `'SETTINGS:WRITE'`). Only the permissions needed for Phase 2 modules are defined — no speculative permissions.
- `@RequirePermission(permission: string)` decorator that attaches the required permission to the route metadata
- `PermissionGuard` that reads the required permission from route metadata, looks up the authenticated user's permissions for the current tenant from `TenantUser.permissions`, and rejects (403) if the permission is absent
- The ESLint rule that blocks `@Post`, `@Patch`, `@Delete`, and `@Put` decorators without `@RequirePermission` — configured in `apps/api/.eslintrc` extending the root config

Permissions are stored on `TenantUser` as a string array. There is no permissions table — permissions are a column on the join record. Role presets (admin, manager, staff) are helper functions that return permission arrays — not database rows.

**Step 9.5 — Implement `WorkflowService`**
In `core/workflow/workflow.service.ts`, implement the single entry point for all status transitions across the entire platform:
- Accepts: `resourceType: string`, `currentStatus: TStatus`, `targetStatus: TStatus`, `config: StatusConfig<TStatus>`, `context: WorkflowTransitionContext`
- Validates that `targetStatus` appears in `config[currentStatus].allowedTransitions` — throws `BusinessRuleException` if not
- Emits an audit event for the transition via `AuditEmitter` within the caller's transaction
- Returns the `targetStatus` on success — it does not write to the database; the caller's repository method performs the write

No module may perform a status transition by directly setting a status field. All transitions route through `WorkflowService`. The `if (status === '...')` pattern in application code is a lint error (enforced by a custom ESLint rule in `apps/api/`).

**Step 9.6 — Implement Token Refresh Strategy**
Document (as a code comment in `auth.module.ts`) that token refresh is owned entirely by the browser Supabase client. The API does not issue, refresh, or invalidate tokens in Phase 2. The API is stateless with respect to auth tokens. A token denylist is planned for Phase 3 — at this stage, a compromised token remains valid until expiry.

**Step 9.7 — Write Auth and Workflow Tests**
Write unit tests for:
- `AuthGuard`: valid JWT passes, expired JWT returns 401, malformed JWT returns 401, `@Public()` route skips auth
- `TenantGuard`: known subdomain resolves to tenant, unknown subdomain returns 401, cache hit avoids DB call on second request
- `WorkflowService`: valid transition returns target status, invalid transition throws `BusinessRuleException`, audit event is emitted on valid transition
- `PermissionGuard`: user with permission passes, user without permission returns 403

All tests use `createMockTenantContext` and `createMockAuditEmitter` from the test utilities established in the Phase 1 foundation.

**Step 9.8 — Integration Test: Protected Route**
Write an integration test that: creates a test tenant, creates a test user with a known permission set, calls a protected route with a valid JWT and `X-Tenant-ID`, confirms a 200 response. Call the same route without a JWT — confirm 401. Call with a valid JWT but insufficient permissions — confirm 403. Use `runInTransaction` for cleanup.

**Step 9.9 — Commit API Foundation**
Commit: `feat(api): implement auth guard, tenant guard, rbac, workflow service`. Push to `develop`. Confirm CI passes including integration tests.

### Responsible Agent
Backend Agent

### Reviewing Agent
Security Agent (JWT verification correctness, fail-closed `AuthGuard` default, RBAC logic, token denylist Phase 3 documentation); Architecture Agent (`WorkflowService` as sole transition entry point, ESLint rule for `if (status === '...')`, `TenantGuard` caching strategy)

### Quality Gate
- A request with an expired JWT to any non-`@Public()` route returns 401 — confirmed via integration test
- A request with a valid JWT but missing permission returns 403 — confirmed via integration test
- `WorkflowService` unit test: invalid transition throws `BusinessRuleException` and no audit event is emitted
- `WorkflowService` unit test: valid transition emits exactly one audit event with `before` and `after` status
- `TenantGuard` unit test: second request for the same subdomain hits the in-memory cache, not the database
- `pnpm turbo run test --filter=apps/api` exits 0
- `pnpm turbo run typecheck --filter=apps/api` exits 0
- A `@Post` route without `@RequirePermission` causes an ESLint error — confirmed by running lint

### Completion Criteria
Auth and authorization layers are fully operational and committed on `develop`. Every non-`@Public()` route requires a valid JWT and a resolved tenant. All status transitions route through `WorkflowService`. RBAC guards all write operations. Security Agent confirms fail-closed defaults and JWT verification correctness. Architecture Agent confirms `WorkflowService` is the single transition entry point with no bypass path.

---

## 10. Shared Contract Setup Sequence

### Objective

Finalize the `@ofs/api-contracts` package as the runtime-validated bridge between `apps/api` and `apps/web`: define all shared request/response schemas, the typed API client, webhook payload types, and the `useApiForm` hook that bridges backend Zod errors into React Hook Form state. After this sequence, there is a single source of truth for every API shape — no hand-maintained duplicate types between frontend and backend.

### Execution Steps

**Step 10.1 — Define DTO Schema Conventions**
Establish and document the DTO schema conventions that all future domain modules must follow:
- Every request schema is named `<Action><Resource>RequestSchema` (e.g. `CreateTenantRequestSchema`, `UpdateUserRequestSchema`)
- Every response schema is named `<Resource>ResponseSchema` (e.g. `TenantResponseSchema`, `UserResponseSchema`)
- The inferred TypeScript types are exported as `<Name>` (e.g. `type CreateTenantRequest = z.infer<typeof CreateTenantRequestSchema>`)
- BigInt fields in response schemas are `z.string()` at the contract layer — the client converts back to `BigInt` after receiving
- All date fields in response schemas are `z.string()` formatted as DD MMM YYYY — the server serializes using `formatDate`, the client displays as-is
- All Arabic-language fields (`labelAr`, `nameAr`, `descriptionAr`) are `z.string().min(1)` — never optional in the contract if required in the UI

**Step 10.2 — Implement Pagination Schemas**
Define reusable pagination schemas:
- `CursorPaginationRequestSchema`: `{ cursor?: string; limit: number (1–100) }`
- `OffsetPaginationRequestSchema`: `{ page: number (min 1); pageSize: number (1–100) }`
- `CursorPaginationResponseSchema<T>`: `{ data: T[]; nextCursor: string | null; hasMore: boolean }`
- `OffsetPaginationResponseSchema<T>`: `{ data: T[]; total: number; page: number; pageSize: number; totalPages: number }`

Export these as factory functions (e.g. `cursorPaginatedResponse(schema: ZodType)`) so domain modules compose them, not re-declare them.

**Step 10.3 — Implement `ApiResponse` Envelope Schema**
Define the `ApiResponse<T>` envelope as a Zod schema:
- Success: `{ success: true; data: T; requestId: string }`
- Error: `{ success: false; error: { code: string; messageAr: string; message: string; fields?: Record<string, string[]> }; requestId: string }`

The `requestId` field is always present — it comes from `LoggingInterceptor`. All API responses from `apps/api` are wrapped in this envelope by the global response interceptor. Confirm `apps/web` can infer the data type from `ApiResponse<TenantResponseSchema>` without type casting.

**Step 10.4 — Implement Phase 2 Domain DTOs**
For each domain module that Phase 2 introduces, define its request and response schemas in `packages/api-contracts/src/schemas/`. Phase 2 domains (foundational only):
- `auth/`: `LoginRequestSchema`, `LoginResponseSchema` (JWT + user profile), `RefreshResponseSchema`
- `tenants/`: `CreateTenantRequestSchema`, `TenantResponseSchema`, `UpdateTenantRequestSchema`
- `users/`: `InviteUserRequestSchema`, `UserResponseSchema`, `UpdateUserRoleRequestSchema`
- `settings/`: `TenantSettingsResponseSchema`, `UpdateTenantSettingsRequestSchema`

No sales, inventory, or purchasing DTOs in Phase 2 — those are Phase 3.

**Step 10.5 — Implement Typed API Client**
In `packages/api-contracts/src/client/`, implement the typed API client factory:
- `createApiClient(baseUrl: string, getToken: () => Promise<string>): ApiClient`
- `ApiClient` is a typed object with methods mirroring the API routes: `auth.login(req)`, `tenants.create(req)`, `users.invite(req)`, etc.
- Every method: sets `Authorization: Bearer <token>` header, sets `Content-Type: application/json`, sends the request body serialized with BigInt → string conversion, receives and validates the response against the corresponding response schema using Zod `parse` (not `safeParse` — throw on contract violation), unwraps `ApiResponse.data` and returns it typed
- The client throws a typed `ApiError` (subclass of `Error`) on non-2xx responses, exposing `error.code`, `error.messageAr`, `error.message`, and `error.fields` from the error envelope

**Step 10.6 — Implement `useApiForm` Hook**
In `packages/api-contracts/src/hooks/use-api-form.ts`, implement a React hook that:
- Wraps `react-hook-form`'s `useForm` with automatic backend error injection
- On `ApiError` with `fields`, calls `setError` on each field named in `error.fields`
- The error message displayed is `error.fields[fieldName][0]` — Arabic first (it comes from the backend Zod Arabic error messages)
- On `ApiError` without `fields`, sets a root-level form error accessible as `form.formState.errors.root`
- Accepts a Zod schema for client-side validation (the same request schema from Step 10.4) — passed to `zodResolver`
- Returns: `{ form, onSubmit, isSubmitting, rootError }` — `onSubmit` wraps the caller's submit function with try/catch for `ApiError`

This hook is the only permitted way to build API-connected forms in `apps/web`. It must not be reimplemented per feature.

**Step 10.7 — Define Webhook Payload Types**
In `packages/api-contracts/src/webhooks/`, define Zod schemas for all outbound webhook payloads the platform will emit. Phase 2 webhooks (foundational):
- `TenantCreatedWebhookSchema`: `{ event: 'tenant.created'; tenantId: string; name: string; timestamp: string (DD MMM YYYY) }`
- `UserInvitedWebhookSchema`: `{ event: 'user.invited'; tenantId: string; userId: string; email: string; timestamp: string }`

Webhook schemas follow the same BigInt-as-string, date-as-DD-MMM-YYYY conventions as API response schemas.

**Step 10.8 — Wire Typed Client into `apps/web`**
In `apps/web/src/lib/api.ts`, instantiate the typed API client using `createApiClient`. The `getToken` function calls the browser Supabase client's `getSession()` and returns the `access_token`. Export the singleton `api` instance. All `apps/web` data fetching goes through this instance — no raw `fetch` calls to the API. Server Components use a separate `serverApi` instance that reads the token from the server-side Supabase session (cookies).

**Step 10.9 — Write Contract Tests**
Write tests in `packages/api-contracts/src/__tests__/`:
- `ApiResponse` envelope: success shape parses, error shape parses, missing `requestId` fails parse
- `CursorPaginationResponseSchema`: `hasMore: true` with `nextCursor` parses; `hasMore: false` with `null` cursor parses
- `useApiForm` hook: `ApiError` with `fields` calls `setError` for each field; root error is set when no fields; Zod client validation fires before the submit function is called

All hook tests use React Testing Library's `renderHook` utility.

**Step 10.10 — Rebuild and Commit**
Run `pnpm turbo run build --filter=@ofs/api-contracts`. Run `pnpm turbo run test --filter=@ofs/api-contracts`. Confirm both exit 0. Commit: `feat(api-contracts): implement shared dto schemas, typed client, use-api-form hook`. Push to `develop`. Confirm CI passes.

### Responsible Agent
Full-Stack Agent

### Reviewing Agent
Architecture Agent (single source of truth enforcement, no duplicate types, BigInt serialization); Backend Agent (DTO alignment with NestJS controller signatures); Frontend Agent (`useApiForm` hook integration, client wiring in `apps/web`); Security Agent (token injection in client, no secrets in client bundle)

### Quality Gate
- `pnpm turbo run build --filter=@ofs/api-contracts` exits 0
- `pnpm turbo run test --filter=@ofs/api-contracts` exits 0
- TypeScript: `ApiResponse<TenantResponseSchema>` infers `data` as `TenantResponse` without a type cast — confirmed by removing an explicit cast and verifying no TypeScript error
- `useApiForm` test: `ApiError` with `{ fields: { nameAr: ['اسم مطلوب'] } }` causes `form.formState.errors.nameAr.message` to equal `'اسم مطلوب'`
- No raw `fetch` call to the API origin exists in `apps/web/src/` — confirmed by `grep -r "fetch('http" apps/web/src/` returning no matches
- No BigInt value is serialized as a number in any API response — all monetary values arrive as strings and are converted to BigInt on the client
- `NEXT_PUBLIC_*` variables are the only env vars referenced in `packages/api-contracts/src/client/`

### Completion Criteria
`@ofs/api-contracts` is built, tested, and committed on `develop`. All Phase 2 domain DTOs are defined. The typed API client is wired into `apps/web`. `useApiForm` is the established pattern for API-connected forms. Architecture Agent confirms there are no duplicate type declarations between packages. Security Agent confirms no secrets flow through the client bundle. Full-Stack Agent confirms `useApiForm` Arabic error injection is operational.

---

*Document in progress — sections 11 and beyond to be appended in subsequent sessions.*

---

**Agent Policy Reminder:** Fix → Explain → Continue on every blocked step. No step may be skipped or marked complete without its Quality Gate passing. All date values in logs, commits, and issue titles use DD MMM YYYY format (e.g. 01 Jan 2026, 24 May 2026).
