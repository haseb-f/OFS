# OFS — Order Fulfillment System

**نظام إدارة الطلبات** | Multi-Tenant SaaS Platform

## Tech Stack

- **Frontend**: Next.js 15 (App Router) — port 3007
- **Backend**: NestJS 11
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Queue**: BullMQ + Redis
- **Deployment**: Vercel (web + api) + Docker (worker)
- **Monorepo**: Turborepo + pnpm workspaces

## Non-Negotiables

- Arabic First · RTL First · Rubik Font · Professional Green Theme
- Multi-Tenant SaaS · Dynamic Statuses · Dynamic Workflows
- No Hardcoded Business Logic · Audit Everything
- Performance First · Security First · Accounting Accuracy First
- Date Format: DD MMM YYYY (e.g. 01 Jan 2026)

## Structure

```
apps/web      Next.js frontend (port 3007)
apps/api      NestJS backend  (port 3001)
packages/     Shared packages (@ofs/*)
docs/         Architecture blueprints
```

## Getting Started

See `docs/PHASE_1_FOUNDATION.md` for the full setup guide.

```bash
pnpm install
pnpm dev
```
