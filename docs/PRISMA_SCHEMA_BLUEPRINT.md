# Prisma Schema Blueprint

> Canonical reference for schema design in this project. All models, fields, and relations must conform to these standards. Sections are appended incrementally — do not reorganize without updating this header.

---

## 1. Prisma Modeling Philosophy

Prisma schema is the single source of truth for the database contract. Every structural decision lives here first; migrations are generated outputs, not hand-edited artifacts.

**Core principles:**

- **Explicit over implicit.** Every field, relation, and index is declared deliberately. Avoid relying on Prisma defaults unless the default matches the intent exactly.
- **Schema-first.** Never alter the database directly in production. All changes flow through `schema.prisma` → migration → deploy.
- **One model, one concern.** A model maps to one entity. Polymorphism is modeled through explicit union tables or typed discriminators, not overloaded nullable fields.
- **Immutable history.** Data that has business or audit value is never physically deleted. Deletion is a state transition, not a `DELETE` statement.
- **Tenant isolation at the row level.** Every tenant-scoped model carries its ownership key as a non-nullable field, enforced by composite unique constraints and partial indexes.
- **Lean migrations.** Additive changes (new columns, new tables) are always safe. Destructive changes (drops, renames, type changes) require a multi-step migration plan documented in the PR.

---

## 2. Naming Conventions

### Models

| Rule | Example |
|------|---------|
| PascalCase, singular noun | `InvoiceLine`, `UserProfile` |
| No abbreviations unless universally understood | `Organization` not `Org`; `URL` is acceptable |
| Junction tables use both entity names, alphabetical order | `ProjectUser`, `RolePermission` |

### Fields

| Rule | Example |
|------|---------|
| camelCase | `createdAt`, `externalRef` |
| Boolean fields prefixed with `is` or `has` | `isActive`, `hasVerifiedEmail` |
| Foreign key fields end with `Id` | `organizationId`, `createdById` |
| Enum fields use the enum type name as the field name when unambiguous | `status`, `role` |
| Timestamps end with `At` | `deletedAt`, `publishedAt` |

### Enums

- PascalCase name, SCREAMING_SNAKE_CASE values.

```prisma
enum InvoiceStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  VOID
}
```

### Database-level names (`@map` / `@@map`)

- Table names: `snake_case`, plural noun → `@@map("invoice_lines")`
- Column names: `snake_case` → `@map("created_at")`
- All models and fields carry explicit `@map` / `@@map` so renaming a Prisma identifier never silently renames a column.

---

## 3. Audit Model Pattern

Every model whose mutations have business significance includes a companion `*Audit` (or `*History`) model capturing point-in-time snapshots.

### Structure

```prisma
model Invoice {
  id        String         @id @default(cuid()) @map("id")
  // ... business fields
  audits    InvoiceAudit[]

  @@map("invoices")
}

model InvoiceAudit {
  id          String   @id @default(cuid()) @map("id")
  invoiceId   String   @map("invoice_id")
  actorId     String   @map("actor_id")
  action      AuditAction
  snapshot    Json     @map("snapshot")       // full field state at time of change
  changedAt   DateTime @default(now()) @map("changed_at")

  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
  actor       User     @relation(fields: [actorId], references: [id])

  @@index([invoiceId, changedAt])
  @@map("invoice_audits")
}

enum AuditAction {
  CREATED
  UPDATED
  DELETED
  STATUS_CHANGED
}
```

### Rules

- `snapshot` stores the **post-change** state as JSON. Pre-change state is derivable from the previous audit row.
- `actorId` is always required — system-generated changes use a designated system user ID, never `NULL`.
- Audit tables are **append-only**. No update or delete operations are issued against them.
- Audit writes are performed inside the same transaction as the primary mutation.

---

## 4. Soft Delete Pattern

Models subject to soft delete carry `deletedAt` and `deletedById`. Hard deletes are prohibited on these models.

### Field declarations

```prisma
deletedAt     DateTime? @map("deleted_at")
deletedById   String?   @map("deleted_by_id")
```

### Model example

```prisma
model Project {
  id            String    @id @default(cuid()) @map("id")
  name          String    @map("name")
  // ...
  deletedAt     DateTime? @map("deleted_at")
  deletedById   String?   @map("deleted_by_id")

  deletedBy     User?     @relation("ProjectDeletedBy", fields: [deletedById], references: [id])

  @@index([deletedAt])           // filter active records efficiently
  @@map("projects")
}
```

### Query conventions

- All application queries append `where: { deletedAt: null }` for active records.
- A shared Prisma middleware or query extension enforces this automatically — individual call sites do not add it manually.
- Restoring a soft-deleted record sets `deletedAt: null` and `deletedById: null`, and appends an audit row with action `RESTORED`.
- Cascading soft deletes (e.g. deleting a Project soft-deletes its Tasks) are handled in the service layer, not via Prisma `onDelete` cascades.

---

## 5. Multi-Tenant Ownership Pattern

Tenant isolation is enforced at the schema level. Every tenant-scoped model carries the owning `organizationId` as a non-nullable field.

### Field declaration

```prisma
organizationId  String  @map("organization_id")
organization    Organization @relation(fields: [organizationId], references: [id])
```

### Composite uniqueness

Business-unique constraints are always scoped to the tenant:

```prisma
@@unique([organizationId, slug])
@@unique([organizationId, externalRef])
```

### Indexing

```prisma
@@index([organizationId])
@@index([organizationId, createdAt])
```

### Rules

- `organizationId` is **never** nullable on tenant-scoped models.
- Cross-tenant relations are prohibited. A model may not hold a foreign key into another tenant's row.
- Queries in service-layer functions always receive `organizationId` as a parameter and include it in every `where` clause. It is never inferred from context or defaulted.
- Global (non-tenant) models — e.g. `Country`, `Currency`, `Plan` — explicitly omit `organizationId` and are documented as such with a schema comment.

---

## 6. Base Model Standards

Every persistent model includes the following base fields unless a documented exception applies.

### Required base fields

```prisma
id          String    @id @default(cuid()) @map("id")
createdAt   DateTime  @default(now()) @map("created_at")
updatedAt   DateTime  @updatedAt @map("updated_at")
createdById String    @map("created_by_id")
updatedById String    @map("updated_by_id")
```

### ID strategy

- Default: `cuid()` — URL-safe, sortable, non-guessable.
- Use `uuid()` only when an external system requires UUID format.
- Use `autoincrement()` only for internal join tables where the ID is never exposed outside the database.
- Composite primary keys (`@@id`) are used only on pure junction tables with no other identifying need.

### Timestamp rules

- `createdAt` is set once at insert; never updated.
- `updatedAt` uses `@updatedAt` — Prisma sets it automatically on every write.
- Application code never manually assigns `createdAt` or `updatedAt`.

### Actor tracking

- `createdById` and `updatedById` reference `User.id`.
- For system-initiated writes, a designated service-account user ID is used.
- These fields are required; nullable exceptions require schema-comment justification.

---

## 7. Relationship Standards

### Naming

- Relation fields on the owning side are named after the related model in camelCase: `organization`, `createdBy`, `assignee`.
- Back-relation arrays are named as plural camelCase: `projects`, `invoices`, `members`.
- Ambiguous relations (more than one relation between the same two models) use named relations:

```prisma
createdBy   User  @relation("ProjectCreatedBy", fields: [createdById], references: [id])
updatedBy   User  @relation("ProjectUpdatedBy", fields: [updatedById], references: [id])
```

### Referential actions

| Scenario | `onDelete` | `onUpdate` |
|----------|-----------|-----------|
| Hard cascade (child meaningless without parent) | `Cascade` | `Cascade` |
| Soft-delete parent, preserve child | `Restrict` | `Cascade` |
| Optional relation (nullable FK) | `SetNull` | `Cascade` |
| Audit / history rows | `Restrict` | `Cascade` |

- `NoAction` is not used — it defers the constraint to the database without Prisma awareness.
- Every `@relation` explicitly declares `onDelete` and `onUpdate`.

### Junction tables

Junction tables for many-to-many relations are always **explicit models** (never implicit Prisma `@relation` syntax). This ensures they can carry metadata fields and audit rows.

```prisma
model ProjectUser {
  projectId  String   @map("project_id")
  userId     String   @map("user_id")
  role       ProjectRole
  assignedAt DateTime @default(now()) @map("assigned_at")
  assignedById String @map("assigned_by_id")

  project    Project  @relation(fields: [projectId], references: [id])
  user       User     @relation(fields: [userId], references: [id])
  assignedBy User     @relation("ProjectUserAssignedBy", fields: [assignedById], references: [id])

  @@id([projectId, userId])
  @@map("project_users")
}
```

---

## 8. Indexing Standards

### Mandatory indexes

Every model carries at minimum:

```prisma
@@index([createdAt])                        // time-range queries
@@index([organizationId])                   // tenant scoping (if applicable)
@@index([organizationId, createdAt])        // tenant + time (if applicable)
```

Soft-delete models add:

```prisma
@@index([deletedAt])                        // active-record filtering
```

### Unique constraints

- Declared with `@@unique`, not as unique indexes in raw SQL.
- Always tenant-scoped where the uniqueness is per-tenant.

### Composite index ordering

Columns in composite indexes follow selectivity descending: most selective (highest cardinality) column first, range/sort column last.

```prisma
@@index([organizationId, status, createdAt])
//       ^high card.       ^low   ^sort
```

### What not to index

- Do not index every foreign key by default — add indexes based on observed query patterns.
- Do not create redundant indexes where a `@@unique` already covers the column set.
- Do not index boolean fields in isolation — their cardinality is too low; combine with a higher-cardinality field.

### Full-text search

Full-text search fields use database-native mechanisms declared outside Prisma schema (in raw migration SQL) and are documented in the migration file with a comment referencing the query they serve.

---

*End of initial sections. Append further sections below this line.*

---

## 9. Platform Domain Models

**Scope:** Global. No `tenantId`. Managed exclusively by platform administrators. These models are the root of the multi-tenant hierarchy — they own the subscription contract and provide the ownership anchor (`Tenant`) that every tenant-scoped model references.

---

### Plan

**Purpose:** Defines subscription tiers available on the platform. Drives feature entitlement resolution for every `Tenant`.

**Ownership:** Global — no `tenantId`.

**Relationships:**
- `features PlanFeature[]` — entitlement rows bundled into this plan
- `tenants Tenant[]` — tenants currently subscribed

**Foreign Keys:** None — root entity.

**Unique Constraints:** `@@unique([slug])`

**Indexes:** `@@index([isActive])`

**Audit Fields:** `createdAt`, `updatedAt` only. Plan mutations are platform-operator actions outside the tenant user context; no actor FK is required.

```prisma
model Plan {
  id          String   @id @default(cuid()) @map("id")
  name        String   @map("name") @db.VarChar(100)
  slug        String   @unique @map("slug") @db.VarChar(100)
  description String?  @map("description")
  isActive    Boolean  @default(true) @map("is_active")
  isPublic    Boolean  @default(true) @map("is_public")
  trialDays   Int      @default(0) @map("trial_days")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  features PlanFeature[]
  tenants  Tenant[]

  @@index([isActive])
  @@map("plan")
}
```

---

### PlanFeature

**Purpose:** Declares feature entitlements bundled into a `Plan`. Each row is a key-value pair. The application resolves entitlements by joining `Tenant.planId → PlanFeature.planId` and filtering on `featureKey`.

**Ownership:** Global — no `tenantId`.

**Relationships:**
- `plan Plan`

**Foreign Keys:** `planId → Plan.id` — `onDelete: Cascade, onUpdate: Cascade`

**Unique Constraints:** `@@unique([planId, featureKey])`

**Indexes:** Covered by unique constraint.

**Audit Fields:** `createdAt`, `updatedAt` only.

```prisma
model PlanFeature {
  id           String   @id @default(cuid()) @map("id")
  planId       String   @map("plan_id")
  featureKey   String   @map("feature_key") @db.VarChar(100)
  featureValue String   @map("feature_value") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  plan Plan @relation(fields: [planId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@unique([planId, featureKey])
  @@map("plan_feature")
}
```

---

### Tenant

**Purpose:** Root entity for every organization on the platform. Carries plan subscription state. All tenant-scoped domain records trace back to this model via `tenantId`.

**Ownership:** Global — IS the ownership anchor. Not self-referential to any other tenant.

**Relationships:**
- `plan Plan`
- `settings TenantSetting[]`
- `members TenantUser[]`
- `roles Role[]`

**Foreign Keys:** `planId → Plan.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([slug])` — partial, active records only. Enforced via raw migration SQL: `CREATE UNIQUE INDEX uq_tenant_slug ON tenant(slug) WHERE deleted_at IS NULL;`

**Indexes:** `@@index([planStatus])`, `@@index([isActive])`, `@@index([deletedAt])`

**Audit Fields:** `deletedAt`, `deletedById`. No `createdById`/`updatedById` — tenant provisioning is a platform-level operation with no tenant user actor.

```prisma
model Tenant {
  id            String     @id @default(cuid()) @map("id")
  name          String     @map("name") @db.VarChar(255)
  slug          String     @map("slug") @db.VarChar(100)
  planId        String     @map("plan_id")
  planStatus    PlanStatus @map("plan_status")
  trialEndsAt   DateTime?  @map("trial_ends_at")
  planStartedAt DateTime?  @map("plan_started_at")
  planExpiresAt DateTime?  @map("plan_expires_at")
  isActive      Boolean    @default(true) @map("is_active")
  deletedAt     DateTime?  @map("deleted_at")
  deletedById   String?    @map("deleted_by_id")
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  plan     Plan            @relation(fields: [planId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  settings TenantSetting[]
  members  TenantUser[]
  roles    Role[]

  @@index([planStatus])
  @@index([isActive])
  @@index([deletedAt])
  @@map("tenant")
}

// Partial unique enforced via raw migration SQL — not expressible in Prisma schema:
// CREATE UNIQUE INDEX uq_tenant_slug ON tenant(slug) WHERE deleted_at IS NULL;

enum PlanStatus {
  TRIAL
  ACTIVE
  SUSPENDED
  CANCELLED
}
```

---

### TenantSetting

**Purpose:** Key-value configuration store scoped to a tenant. Overrides platform defaults on a per-key basis. Consumed by the application at runtime to resolve tenant-specific behaviour (locale, feature toggles, limits).

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`

**Foreign Keys:** `tenantId → Tenant.id` — `onDelete: Cascade, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, key])`

**Indexes:** Covered by unique constraint.

**Audit Fields:** `createdAt`, `updatedAt` only. Setting mutations are captured in `AuditLog`.

```prisma
model TenantSetting {
  id        String   @id @default(cuid()) @map("id")
  tenantId  String   @map("tenant_id")
  key       String   @map("key") @db.VarChar(100)
  value     String   @map("value")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@unique([tenantId, key])
  @@map("tenant_setting")
}
```

---

## 10. Identity & Access Models

**Scope:** Mixed. `User`, `UserProfile`, and `PasswordResetToken` are global. `TenantUser`, `UserSession`, `Role`, `RolePermission`, and `UserRole` are tenant-scoped. `Permission` is global — a platform deployment artifact.

---

### User

**Purpose:** Global identity record. One row per human, independent of how many tenants they belong to. Holds credentials and verification state only. All personal display data lives in `UserProfile` to keep the identity record minimal.

**Ownership:** Global — no `tenantId`.

**Relationships:**
- `profile UserProfile?`
- `memberships TenantUser[]`
- `sessions UserSession[]`
- `passwordResetTokens PasswordResetToken[]`
- `assignedRoles UserRole[]`

**Foreign Keys:** None — root identity entity. `deletedById` is a self-referential FK.

**Unique Constraints:** `@@unique([email])` — partial, active records only. Enforced via raw migration SQL: `CREATE UNIQUE INDEX uq_user_email ON "user"(email) WHERE deleted_at IS NULL;`

**Indexes:** `@@index([deletedAt])`

**Audit Fields:** `deletedAt`, `deletedById` (self-referential). No `createdById`/`updatedById` — user creation is self-service or platform-level.

```prisma
model User {
  id              String    @id @default(cuid()) @map("id")
  email           String    @map("email") @db.VarChar(320)
  emailVerifiedAt DateTime? @map("email_verified_at")
  phone           String?   @map("phone") @db.VarChar(30)
  phoneVerifiedAt DateTime? @map("phone_verified_at")
  passwordHash    String?   @map("password_hash") @db.VarChar(255)
  isActive        Boolean   @default(true) @map("is_active")
  lastLoginAt     DateTime? @map("last_login_at")
  deletedAt       DateTime? @map("deleted_at")
  deletedById     String?   @map("deleted_by_id")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  profile             UserProfile?
  memberships         TenantUser[]
  sessions            UserSession[]
  passwordResetTokens PasswordResetToken[]
  assignedRoles       UserRole[]           @relation("UserRoleUser")
  deletedBy           User?                @relation("UserDeletedBy", fields: [deletedById], references: [id])
  deletedUsers        User[]               @relation("UserDeletedBy")

  @@index([deletedAt])
  @@map("user")
}

// Partial unique enforced via raw migration SQL:
// CREATE UNIQUE INDEX uq_user_email ON "user"(email) WHERE deleted_at IS NULL;
```

---

### UserProfile

**Purpose:** Display and personal information for a user. Separated from `User` so profile updates never touch the credential record. One-to-one with `User`.

**Ownership:** Global — no `tenantId`.

**Relationships:**
- `user User`

**Foreign Keys:** `userId → User.id` — `onDelete: Cascade, onUpdate: Cascade`

**Unique Constraints:** `@@unique([userId])` — enforces the one-to-one.

**Indexes:** Covered by unique constraint.

**Audit Fields:** `createdAt`, `updatedAt` only.

```prisma
model UserProfile {
  id          String   @id @default(cuid()) @map("id")
  userId      String   @unique @map("user_id")
  firstName   String   @map("first_name") @db.VarChar(100)
  lastName    String   @map("last_name") @db.VarChar(100)
  displayName String?  @map("display_name") @db.VarChar(150)
  avatarUrl   String?  @map("avatar_url")
  locale      String   @default("en") @map("locale") @db.Char(5)
  timezone    String   @default("UTC") @map("timezone") @db.VarChar(50)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@map("user_profile")
}
```

---

### TenantUser

**Purpose:** Membership record linking a `User` to a `Tenant`. A user may belong to multiple tenants. Carries activation, invitation, and soft-delete state. The `isOwner` flag gates irreversible tenant-level operations.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `user User`
- `invitedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `userId → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `invitedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, userId])` — partial, active records only. Enforced via raw migration SQL: `CREATE UNIQUE INDEX uq_tenant_user ON tenant_user(tenant_id, user_id) WHERE deleted_at IS NULL;`

**Indexes:** `@@index([userId])`, `@@index([tenantId, isActive])`, `@@index([deletedAt])`

**Audit Fields:** `deletedAt`, `deletedById`. No `createdById`/`updatedById`.

```prisma
model TenantUser {
  id          String    @id @default(cuid()) @map("id")
  tenantId    String    @map("tenant_id")
  userId      String    @map("user_id")
  isOwner     Boolean   @default(false) @map("is_owner")
  isActive    Boolean   @default(true) @map("is_active")
  invitedById String?   @map("invited_by_id")
  joinedAt    DateTime? @map("joined_at")
  deletedAt   DateTime? @map("deleted_at")
  deletedById String?   @map("deleted_by_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  user      User   @relation(fields: [userId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  invitedBy User?  @relation("TenantUserInvitedBy", fields: [invitedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([userId])
  @@index([tenantId, isActive])
  @@index([deletedAt])
  @@map("tenant_user")
}

// Partial unique enforced via raw migration SQL:
// CREATE UNIQUE INDEX uq_tenant_user ON tenant_user(tenant_id, user_id) WHERE deleted_at IS NULL;
```

---

### UserSession

**Purpose:** Active authentication session for a user scoped to a specific tenant context. Revoked on logout, expiry, or security event. `tokenHash` is the bcrypt hash of the session bearer token — the raw token is never stored.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `user User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Cascade, onUpdate: Cascade`
- `userId → User.id` — `onDelete: Cascade, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tokenHash])`

**Indexes:** `@@index([tenantId, userId])`, `@@index([expiresAt])`

**Audit Fields:** `createdAt` only. Sessions are created once and revoked — no `updatedAt`.

```prisma
model UserSession {
  id           String    @id @default(cuid()) @map("id")
  tenantId     String    @map("tenant_id")
  userId       String    @map("user_id")
  tokenHash    String    @unique @map("token_hash") @db.VarChar(255)
  ipAddress    String?   @map("ip_address") @db.VarChar(45)
  userAgent    String?   @map("user_agent")
  lastActiveAt DateTime  @default(now()) @map("last_active_at")
  expiresAt    DateTime  @map("expires_at")
  revokedAt    DateTime? @map("revoked_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@index([tenantId, userId])
  @@index([expiresAt])
  @@map("user_session")
}
```

---

### PasswordResetToken

**Purpose:** Short-lived token issued for password recovery. Single-use — `usedAt` is stamped on consumption and the token becomes permanently invalid. Expired and used tokens are purged by a scheduled background job.

**Ownership:** Global — no `tenantId`. Scoped to a `User`.

**Relationships:**
- `user User`

**Foreign Keys:** `userId → User.id` — `onDelete: Cascade, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tokenHash])`

**Indexes:** `@@index([userId])`, `@@index([expiresAt])`

**Audit Fields:** `createdAt` only.

```prisma
model PasswordResetToken {
  id        String    @id @default(cuid()) @map("id")
  userId    String    @map("user_id")
  tokenHash String    @unique @map("token_hash") @db.VarChar(255)
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("password_reset_token")
}
```

---

### Permission

**Purpose:** Platform-level catalog of all available permissions. Global — seeded at deployment, updated only via migration. Never written to by application code. Keys follow the pattern `{domain}:{resource}:{action}` (e.g., `finance:invoice:approve`).

**Ownership:** Global — no `tenantId`.

**Relationships:**
- `grantedRoles RolePermission[]`

**Foreign Keys:** None — root catalog entity.

**Unique Constraints:** `@@unique([key])`

**Indexes:** `@@index([domain])`

**Audit Fields:** `createdAt` only — permissions are deployment artifacts.

```prisma
model Permission {
  id          String   @id @default(cuid()) @map("id")
  key         String   @unique @map("key") @db.VarChar(150)
  domain      String   @map("domain") @db.VarChar(100)
  description String?  @map("description")
  createdAt   DateTime @default(now()) @map("created_at")

  grantedRoles RolePermission[]

  @@index([domain])
  @@map("permission")
}
```

---

### Role

**Purpose:** A named collection of permissions within a tenant. System roles (`isSystem = true`) are seeded at tenant creation, cannot be deleted, and their permission set cannot be modified by tenant users.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `permissions RolePermission[]`
- `assignedUsers UserRole[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, slug])` — partial, active records only. Enforced via raw migration SQL: `CREATE UNIQUE INDEX uq_role_tenant_slug ON role(tenant_id, slug) WHERE deleted_at IS NULL;`

**Indexes:** `@@index([tenantId])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Role {
  id          String    @id @default(cuid()) @map("id")
  tenantId    String    @map("tenant_id")
  name        String    @map("name") @db.VarChar(100)
  slug        String    @map("slug") @db.VarChar(100)
  description String?   @map("description")
  isSystem    Boolean   @default(false) @map("is_system")
  deletedAt   DateTime? @map("deleted_at")
  deletedById String?   @map("deleted_by_id")
  createdById String    @map("created_by_id")
  updatedById String    @map("updated_by_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  tenant        Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy     User             @relation("RoleCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy     User             @relation("RoleUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy     User?            @relation("RoleDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  permissions   RolePermission[]
  assignedUsers UserRole[]

  @@index([tenantId])
  @@index([deletedAt])
  @@map("role")
}

// Partial unique enforced via raw migration SQL:
// CREATE UNIQUE INDEX uq_role_tenant_slug ON role(tenant_id, slug) WHERE deleted_at IS NULL;
```

---

### RolePermission

**Purpose:** Explicit junction assigning a `Permission` to a `Role` within a tenant. Carries the granting actor and tenant scope for row-level query isolation.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `role Role`
- `permission Permission`
- `grantedBy User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Cascade, onUpdate: Cascade`
- `roleId → Role.id` — `onDelete: Cascade, onUpdate: Cascade`
- `permissionId → Permission.id` — `onDelete: Restrict, onUpdate: Cascade`
- `grantedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, roleId, permissionId])`

**Indexes:** `@@index([roleId])`

**Audit Fields:** `createdAt` only — grant history is captured in `AuditLog`.

```prisma
model RolePermission {
  id           String   @id @default(cuid()) @map("id")
  tenantId     String   @map("tenant_id")
  roleId       String   @map("role_id")
  permissionId String   @map("permission_id")
  grantedById  String   @map("granted_by_id")
  createdAt    DateTime @default(now()) @map("created_at")

  tenant     Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  grantedBy  User       @relation("RolePermissionGrantedBy", fields: [grantedById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@unique([tenantId, roleId, permissionId])
  @@index([roleId])
  @@map("role_permission")
}
```

---

### UserRole

**Purpose:** Assigns a `Role` to a user within a tenant. A user may hold multiple roles per tenant. Supports optional expiry for time-boxed grants. The permission check query joins through this model — see §10 Permission Check Contract.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `user User`
- `role Role`
- `assignedBy User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Cascade, onUpdate: Cascade`
- `userId → User.id` — `onDelete: Cascade, onUpdate: Cascade`
- `roleId → Role.id` — `onDelete: Cascade, onUpdate: Cascade`
- `assignedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, userId, roleId])`

**Indexes:** `@@index([userId])`, `@@index([tenantId, userId])`

**Audit Fields:** `createdAt` only.

```prisma
model UserRole {
  id           String    @id @default(cuid()) @map("id")
  tenantId     String    @map("tenant_id")
  userId       String    @map("user_id")
  roleId       String    @map("role_id")
  assignedById String    @map("assigned_by_id")
  expiresAt    DateTime? @map("expires_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  tenant     Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  user       User   @relation("UserRoleUser", fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  role       Role   @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  assignedBy User   @relation("UserRoleAssignedBy", fields: [assignedById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@unique([tenantId, userId, roleId])
  @@index([userId])
  @@index([tenantId, userId])
  @@map("user_role")
}
```

#### Permission Check Contract

At query time the application resolves permissions by joining:

```
UserRole → Role → RolePermission → Permission
WHERE UserRole.tenantId  = :tenantId
  AND UserRole.userId    = :userId
  AND Permission.key     = :requiredPermission
  AND (UserRole.expiresAt IS NULL OR UserRole.expiresAt > NOW())
```

No inheritance, no negation, no wildcards. If the key is absent from the resolved set, access is denied.

---

## 11. System Models

**Scope:** Mixed. `AuditLog`, `TransactionSource`, and `PaymentStatus` are global. `BackgroundJob` and `OutboxEvent` are optionally tenant-scoped — platform-level operations carry no `tenantId`.

---

### AuditLog

**Purpose:** Centralized, immutable event log for all write operations on audited tables. Captures before/after state as JSON. Populated by database triggers — application code does not write to this table directly. Retained for a minimum of 7 years for compliance.

**Ownership:** Mixed — `tenantId` is nullable. Tenant-scoped events carry the originating tenant; platform-level events (e.g. plan changes) carry `null`.

**Relationships:**
- `performedBy User`

No FK on `recordId` — polymorphic reference resolved by `tableName`.

**Foreign Keys:** `performedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None — append-only, no deduplication.

**Indexes:** `@@index([tenantId, tableName, recordId])`, `@@index([tenantId, performedAt])`, `@@index([tableName, recordId])`, `@@index([performedById])`

**Audit Fields:** `performedAt` (the row IS the audit event). Immutable — no `updatedAt`, no `deletedAt`.

```prisma
model AuditLog {
  id            String      @id @default(cuid()) @map("id")
  tenantId      String?     @map("tenant_id")
  tableName     String      @map("table_name") @db.VarChar(100)
  recordId      String      @map("record_id")
  action        AuditAction @map("action")
  oldValues     Json?       @map("old_values")
  newValues     Json?       @map("new_values")
  performedById String      @map("performed_by_id")
  performedAt   DateTime    @default(now()) @map("performed_at")
  ipAddress     String?     @map("ip_address") @db.VarChar(45)
  sessionId     String?     @map("session_id")
  createdAt     DateTime    @default(now()) @map("created_at")

  performedBy User @relation("AuditLogPerformedBy", fields: [performedById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@index([tenantId, tableName, recordId])
  @@index([tenantId, performedAt])
  @@index([tableName, recordId])
  @@index([performedById])
  @@map("audit_log")
}

enum AuditAction {
  INSERT
  UPDATE
  DELETE
}
```

---

### TransactionSource

**Purpose:** Global reference catalog identifying the originating domain event for every `FinancialTransaction`. Seeded at deployment. Keys follow the pattern `{domain}:{event}` (e.g., `orders:payment`, `purchasing:supplier_invoice`, `treasury:manual_entry`).

**Ownership:** Global — no `tenantId`. Platform operator managed.

**Relationships:** None in Prisma — `FinancialTransaction` joins by `key` string, not FK, to keep the reference table schema-stable.

**Foreign Keys:** None.

**Unique Constraints:** `@@unique([key])`

**Indexes:** Covered by unique constraint.

**Audit Fields:** `createdAt` only — seeded data, not user-mutable.

```prisma
model TransactionSource {
  id          String   @id @default(cuid()) @map("id")
  key         String   @unique @map("key") @db.VarChar(100)
  label       String   @map("label") @db.VarChar(150)
  description String?  @map("description")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("transaction_source")
}
```

---

### PaymentStatus

**Purpose:** Reference table defining every lifecycle status a `FinancialTransaction` can hold. `isTerminal` flags states that cannot transition further. Global — seeded at deployment.

Seed values: `pending`, `processing`, `completed`, `failed`, `cancelled`, `refunded`, `on_hold`, `disputed`.

**Ownership:** Global — no `tenantId`.

**Relationships:** None in Prisma — `FinancialTransaction` joins by `key` string.

**Foreign Keys:** None.

**Unique Constraints:** `@@unique([key])`

**Indexes:** Covered by unique constraint.

**Audit Fields:** `createdAt` only.

```prisma
model PaymentStatus {
  id          String   @id @default(cuid()) @map("id")
  key         String   @unique @map("key") @db.VarChar(50)
  label       String   @map("label") @db.VarChar(100)
  description String?  @map("description")
  isTerminal  Boolean  @default(false) @map("is_terminal")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("payment_status")
}
```

---

### BackgroundJob

**Purpose:** Tracks async job execution across all domains — import processing, depreciation runs, reconciliation sessions, email dispatch, report generation. Supports retry logic via `attempts`/`maxAttempts`.

**Ownership:** Optionally tenant-scoped. `tenantId` is nullable — platform-level jobs carry no tenant.

**Relationships:**
- `tenant Tenant?`
- `triggeredBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: SetNull, onUpdate: Cascade`
- `triggeredById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

Both are `SetNull` so job history is preserved even if the triggering actor or tenant is soft-deleted.

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, jobStatus])`, `@@index([jobType, jobStatus])`, `@@index([scheduledAt])`, `@@index([tenantId, createdAt])`

**Audit Fields:** `createdAt`, `updatedAt`. No `createdById`/`updatedById` beyond `triggeredById`.

```prisma
model BackgroundJob {
  id            String    @id @default(cuid()) @map("id")
  tenantId      String?   @map("tenant_id")
  jobType       String    @map("job_type") @db.VarChar(100)
  jobStatus     JobStatus @default(PENDING) @map("job_status")
  payload       Json?     @map("payload")
  result        Json?     @map("result")
  errorMessage  String?   @map("error_message")
  attempts      Int       @default(0) @map("attempts")
  maxAttempts   Int       @default(3) @map("max_attempts")
  scheduledAt   DateTime? @map("scheduled_at")
  startedAt     DateTime? @map("started_at")
  completedAt   DateTime? @map("completed_at")
  failedAt      DateTime? @map("failed_at")
  triggeredById String?   @map("triggered_by_id")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  tenant      Tenant? @relation(fields: [tenantId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  triggeredBy User?   @relation("BackgroundJobTriggeredBy", fields: [triggeredById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, jobStatus])
  @@index([jobType, jobStatus])
  @@index([scheduledAt])
  @@index([tenantId, createdAt])
  @@map("background_job")
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

### OutboxEvent

**Purpose:** Transactional outbox for reliable cross-domain event delivery. Every domain write that must produce a side effect (notification dispatch, external webhook, event bus publish) appends a row inside the same database transaction as the primary mutation. A background processor polls for unpublished rows and dispatches them, stamping `publishedAt` on success.

**Ownership:** Optionally tenant-scoped. `tenantId` is nullable for platform-level events.

**Relationships:** None with FK constraints. `aggregateId` is a polymorphic reference resolved by `aggregateType`. No FK is declared intentionally — the outbox must survive the source record being soft-deleted or hard-deleted.

**Foreign Keys:** None.

**Unique Constraints:** None.

**Indexes:** `@@index([publishedAt])`, `@@index([tenantId, aggregateType])`, `@@index([createdAt])`

**Audit Fields:** `createdAt` only. Immutable — rows are appended and then stamped; never edited.

```prisma
model OutboxEvent {
  id            String    @id @default(cuid()) @map("id")
  tenantId      String?   @map("tenant_id")
  eventType     String    @map("event_type") @db.VarChar(150)
  aggregateType String    @map("aggregate_type") @db.VarChar(100)
  aggregateId   String    @map("aggregate_id")
  payload       Json      @map("payload")
  publishedAt   DateTime? @map("published_at")
  failedAt      DateTime? @map("failed_at")
  errorMessage  String?   @map("error_message")
  attempts      Int       @default(0) @map("attempts")
  createdAt     DateTime  @default(now()) @map("created_at")

  @@index([publishedAt])
  @@index([tenantId, aggregateType])
  @@index([createdAt])
  @@map("outbox_event")
}
```

---

*Sections 9–11 appended. Append further sections below this line.*

---

## 12. CRM Models

**Scope:** Tenant-scoped. All tables carry `tenantId`. Manages pre-conversion activity: leads, interactions, pipelines, stages, and deals. The CRM feeds the Customer domain on lead conversion.

---

### Lead

**Purpose:** A prospective customer that has not yet been converted. Tracks qualification state, source, and assigned owner. On conversion, `convertedCustomerId` is stamped and `leadStatus` transitions to `CONVERTED`.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `assignedTo User?`
- `convertedCustomer Customer?`
- `activities CrmActivity[]`
- `deals Deal[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `assignedToId → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `convertedCustomerId → Customer.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, leadStatus])`, `@@index([tenantId, assignedToId])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Lead {
  id                  String     @id @default(cuid()) @map("id")
  tenantId            String     @map("tenant_id")
  firstName           String     @map("first_name") @db.VarChar(100)
  lastName            String     @map("last_name") @db.VarChar(100)
  email               String?    @map("email") @db.VarChar(320)
  phone               String?    @map("phone") @db.VarChar(30)
  companyName         String?    @map("company_name") @db.VarChar(255)
  jobTitle            String?    @map("job_title") @db.VarChar(150)
  source              String?    @map("source") @db.VarChar(100)
  leadStatus          LeadStatus @map("lead_status")
  assignedToId        String?    @map("assigned_to_id")
  convertedAt         DateTime?  @map("converted_at")
  convertedCustomerId String?    @map("converted_customer_id")
  notes               String?    @map("notes")
  deletedAt           DateTime?  @map("deleted_at")
  deletedById         String?    @map("deleted_by_id")
  createdById         String     @map("created_by_id")
  updatedById         String     @map("updated_by_id")
  createdAt           DateTime   @default(now()) @map("created_at")
  updatedAt           DateTime   @updatedAt @map("updated_at")

  tenant            Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  assignedTo        User?         @relation("LeadAssignedTo", fields: [assignedToId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  convertedCustomer Customer?     @relation("LeadConvertedCustomer", fields: [convertedCustomerId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy         User          @relation("LeadCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy         User          @relation("LeadUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy         User?         @relation("LeadDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  activities        CrmActivity[]
  deals             Deal[]

  @@index([tenantId, leadStatus])
  @@index([tenantId, assignedToId])
  @@index([deletedAt])
  @@map("lead")
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  DISQUALIFIED
  CONVERTED
}
```

---

### CrmActivity

**Purpose:** Records a single interaction with a lead or customer — calls, emails, meetings, notes, tasks. Exactly one of `leadId` or `customerId` must be non-null; this mutual exclusion is enforced at the application layer.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `lead Lead?`
- `customer Customer?`
- `performedBy User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `leadId → Lead.id` — `onDelete: SetNull, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: SetNull, onUpdate: Cascade`
- `performedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, leadId])`, `@@index([tenantId, customerId])`, `@@index([tenantId, occurredAt])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`. No soft delete — activities are facts; correction is a new activity with a note.

```prisma
model CrmActivity {
  id              String       @id @default(cuid()) @map("id")
  tenantId        String       @map("tenant_id")
  activityType    ActivityType @map("activity_type")
  subject         String       @map("subject") @db.VarChar(255)
  body            String?      @map("body")
  outcome         String?      @map("outcome") @db.VarChar(255)
  occurredAt      DateTime     @map("occurred_at")
  durationSeconds Int?         @map("duration_seconds")
  leadId          String?      @map("lead_id")
  customerId      String?      @map("customer_id")
  performedById   String       @map("performed_by_id")
  createdById     String       @map("created_by_id")
  updatedById     String       @map("updated_by_id")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  lead        Lead?     @relation(fields: [leadId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  performedBy User      @relation("CrmActivityPerformedBy", fields: [performedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy   User      @relation("CrmActivityCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy   User      @relation("CrmActivityUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@index([tenantId, leadId])
  @@index([tenantId, customerId])
  @@index([tenantId, occurredAt])
  @@map("crm_activity")
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  NOTE
  TASK
}
```

---

### Pipeline

**Purpose:** A named sales pipeline. A tenant may operate multiple pipelines. At most one pipeline per tenant carries `isDefault = true` — enforced at the application layer.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `stages PipelineStage[]`
- `deals Deal[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Pipeline {
  id          String    @id @default(cuid()) @map("id")
  tenantId    String    @map("tenant_id")
  name        String    @map("name") @db.VarChar(150)
  isDefault   Boolean   @default(false) @map("is_default")
  deletedAt   DateTime? @map("deleted_at")
  deletedById String?   @map("deleted_by_id")
  createdById String    @map("created_by_id")
  updatedById String    @map("updated_by_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  tenant    Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy User            @relation("PipelineCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User            @relation("PipelineUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?           @relation("PipelineDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  stages    PipelineStage[]
  deals     Deal[]

  @@index([tenantId])
  @@index([deletedAt])
  @@map("pipeline")
}
```

---

### PipelineStage

**Purpose:** An ordered stage within a pipeline. `position` determines display order. At most one stage per pipeline may be `isWon = true` and one may be `isLost = true` — enforced at the application layer. Stages are not soft-deleted; they are removed only when no active deals reference them.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `pipeline Pipeline`
- `deals Deal[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `pipelineId → Pipeline.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, pipelineId, position])`

**Indexes:** `@@index([pipelineId])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`. No soft delete.

```prisma
model PipelineStage {
  id          String   @id @default(cuid()) @map("id")
  tenantId    String   @map("tenant_id")
  pipelineId  String   @map("pipeline_id")
  name        String   @map("name") @db.VarChar(150)
  position    Int      @map("position")
  isWon       Boolean  @default(false) @map("is_won")
  isLost      Boolean  @default(false) @map("is_lost")
  createdById String   @map("created_by_id")
  updatedById String   @map("updated_by_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  pipeline  Pipeline  @relation(fields: [pipelineId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy User      @relation("PipelineStageCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User      @relation("PipelineStageUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deals     Deal[]

  @@unique([tenantId, pipelineId, position])
  @@index([pipelineId])
  @@map("pipeline_stage")
}
```

---

### Deal

**Purpose:** A qualified sales opportunity moving through a pipeline stage. May originate from a lead or be created directly against a customer. `dealValueAmount` follows the integer currency standard. `closedAt` is stamped when `dealStatus` transitions to `WON` or `LOST`.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `pipeline Pipeline`
- `stage PipelineStage`
- `lead Lead?`
- `customer Customer?`
- `assignedTo User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `pipelineId → Pipeline.id` — `onDelete: Restrict, onUpdate: Cascade`
- `stageId → PipelineStage.id` — `onDelete: Restrict, onUpdate: Cascade`
- `leadId → Lead.id` — `onDelete: SetNull, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: SetNull, onUpdate: Cascade`
- `assignedToId → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, stageId])`, `@@index([tenantId, assignedToId])`, `@@index([tenantId, dealStatus])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Deal {
  id                String     @id @default(cuid()) @map("id")
  tenantId          String     @map("tenant_id")
  name              String     @map("name") @db.VarChar(255)
  pipelineId        String     @map("pipeline_id")
  stageId           String     @map("stage_id")
  leadId            String?    @map("lead_id")
  customerId        String?    @map("customer_id")
  assignedToId      String?    @map("assigned_to_id")
  dealValueAmount   BigInt     @default(0) @map("deal_value_amount")
  dealValueCurrency String     @default("USD") @map("deal_value_currency") @db.Char(3)
  expectedCloseDate DateTime?  @map("expected_close_date") @db.Date
  closedAt          DateTime?  @map("closed_at")
  dealStatus        DealStatus @map("deal_status")
  lossReason        String?    @map("loss_reason") @db.VarChar(255)
  deletedAt         DateTime?  @map("deleted_at")
  deletedById       String?    @map("deleted_by_id")
  createdById       String     @map("created_by_id")
  updatedById       String     @map("updated_by_id")
  createdAt         DateTime   @default(now()) @map("created_at")
  updatedAt         DateTime   @updatedAt @map("updated_at")

  tenant     Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  pipeline   Pipeline      @relation(fields: [pipelineId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  stage      PipelineStage @relation(fields: [stageId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  lead       Lead?         @relation(fields: [leadId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  customer   Customer?     @relation(fields: [customerId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  assignedTo User?         @relation("DealAssignedTo", fields: [assignedToId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy  User          @relation("DealCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy  User          @relation("DealUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy  User?         @relation("DealDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, stageId])
  @@index([tenantId, assignedToId])
  @@index([tenantId, dealStatus])
  @@index([deletedAt])
  @@map("deal")
}

enum DealStatus {
  OPEN
  WON
  LOST
}
```

---

## 13. Customer Models

**Scope:** Tenant-scoped. All tables carry `tenantId`. Represents verified, converted entities eligible to transact. Anchors the Orders, Financial Operations, and CRM domains.

---

### Customer

**Purpose:** Root entity for a paying or prospective-paying party — individual or business. All order, invoice, and activity records foreign-key into this model. `referenceCode` is an optional tenant-assigned identifier (e.g. legacy ERP code).

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `assignedTo User?`
- `profile CustomerProfile?`
- `contacts CustomerContact[]`
- `addresses CustomerAddress[]`
- `tags CustomerTag[]`
- `activities CrmActivity[]`
- `deals Deal[]`
- `orders Order[]`
- `invoices Invoice[]`
- `convertedLeads Lead[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `assignedToId → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, referenceCode])` — partial, non-null and active only. Enforced via raw migration SQL: `CREATE UNIQUE INDEX uq_customer_reference_code ON customer(tenant_id, reference_code) WHERE reference_code IS NOT NULL AND deleted_at IS NULL;`

**Indexes:** `@@index([tenantId, isActive])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Customer {
  id            String       @id @default(cuid()) @map("id")
  tenantId      String       @map("tenant_id")
  customerType  CustomerType @map("customer_type")
  displayName   String       @map("display_name") @db.VarChar(255)
  referenceCode String?      @map("reference_code") @db.VarChar(100)
  assignedToId  String?      @map("assigned_to_id")
  isActive      Boolean      @default(true) @map("is_active")
  notes         String?      @map("notes")
  deletedAt     DateTime?    @map("deleted_at")
  deletedById   String?      @map("deleted_by_id")
  createdById   String       @map("created_by_id")
  updatedById   String       @map("updated_by_id")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  tenant         Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  assignedTo     User?             @relation("CustomerAssignedTo", fields: [assignedToId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy      User              @relation("CustomerCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy      User              @relation("CustomerUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy      User?             @relation("CustomerDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  profile        CustomerProfile?
  contacts       CustomerContact[]
  addresses      CustomerAddress[]
  tags           CustomerTag[]
  activities     CrmActivity[]
  deals          Deal[]
  orders         Order[]
  invoices       Invoice[]
  convertedLeads Lead[]            @relation("LeadConvertedCustomer")

  @@index([tenantId, isActive])
  @@index([deletedAt])
  @@map("customer")
}

// Partial unique enforced via raw migration SQL:
// CREATE UNIQUE INDEX uq_customer_reference_code ON customer(tenant_id, reference_code)
// WHERE reference_code IS NOT NULL AND deleted_at IS NULL;

enum CustomerType {
  INDIVIDUAL
  BUSINESS
}
```

---

### CustomerProfile

**Purpose:** Extended personal or business detail for a customer. Separated from `Customer` so the root record stays lean. One-to-one enforced by `@@unique([customerId])`.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `customer Customer`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: Cascade, onUpdate: Cascade`

**Unique Constraints:** `@@unique([customerId])`

**Indexes:** Covered by unique constraint.

**Audit Fields:** `createdAt`, `updatedAt` only — profile changes are captured in `AuditLog`.

```prisma
model CustomerProfile {
  id          String   @id @default(cuid()) @map("id")
  tenantId    String   @map("tenant_id")
  customerId  String   @unique @map("customer_id")
  firstName   String?  @map("first_name") @db.VarChar(100)
  lastName    String?  @map("last_name") @db.VarChar(100)
  companyName String?  @map("company_name") @db.VarChar(255)
  taxNumber   String?  @map("tax_number") @db.VarChar(50)
  website     String?  @map("website")
  industry    String?  @map("industry") @db.VarChar(100)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@map("customer_profile")
}
```

---

### CustomerContact

**Purpose:** One or more contact points (email, phone, fax) for a customer. A customer may hold multiple contacts across types. `isPrimary` identifies the preferred contact per type — enforced at the application layer.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `customer Customer`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: Cascade, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, customerId])`, `@@index([tenantId, value])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model CustomerContact {
  id          String      @id @default(cuid()) @map("id")
  tenantId    String      @map("tenant_id")
  customerId  String      @map("customer_id")
  contactType ContactType @map("contact_type")
  value       String      @map("value") @db.VarChar(320)
  label       String?     @map("label") @db.VarChar(100)
  isPrimary   Boolean     @default(false) @map("is_primary")
  deletedAt   DateTime?   @map("deleted_at")
  deletedById String?     @map("deleted_by_id")
  createdById String      @map("created_by_id")
  updatedById String      @map("updated_by_id")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  customer  Customer @relation(fields: [customerId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  createdBy User     @relation("CustomerContactCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User     @relation("CustomerContactUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?    @relation("CustomerContactDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, customerId])
  @@index([tenantId, value])
  @@index([deletedAt])
  @@map("customer_contact")
}

enum ContactType {
  EMAIL
  PHONE
  FAX
  OTHER
}
```

---

### CustomerAddress

**Purpose:** Physical or mailing addresses for a customer. A customer may hold multiple addresses across types. `isDefault` flags the primary address per `addressType` — enforced at the application layer.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `customer Customer`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: Cascade, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, customerId])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model CustomerAddress {
  id          String      @id @default(cuid()) @map("id")
  tenantId    String      @map("tenant_id")
  customerId  String      @map("customer_id")
  addressType AddressType @map("address_type")
  label       String?     @map("label") @db.VarChar(100)
  line1       String      @map("line1") @db.VarChar(255)
  line2       String?     @map("line2") @db.VarChar(255)
  city        String      @map("city") @db.VarChar(100)
  state       String?     @map("state") @db.VarChar(100)
  postalCode  String?     @map("postal_code") @db.VarChar(20)
  countryCode String      @map("country_code") @db.Char(2)
  isDefault   Boolean     @default(false) @map("is_default")
  deletedAt   DateTime?   @map("deleted_at")
  deletedById String?     @map("deleted_by_id")
  createdById String      @map("created_by_id")
  updatedById String      @map("updated_by_id")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  customer  Customer @relation(fields: [customerId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  createdBy User     @relation("CustomerAddressCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User     @relation("CustomerAddressUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?    @relation("CustomerAddressDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, customerId])
  @@index([deletedAt])
  @@map("customer_address")
}

enum AddressType {
  BILLING
  SHIPPING
  OTHER
}
```

---

### CustomerTag

**Purpose:** Free-form labels applied to a customer for segmentation and filtering. Tags are append-only facts — removing a tag is a hard delete of the row. No soft delete.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `customer Customer`
- `createdBy User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: Cascade, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, customerId, tag])`

**Indexes:** `@@index([tenantId, tag])`

**Audit Fields:** `createdAt` only. No `updatedAt` — tags are immutable once applied.

```prisma
model CustomerTag {
  id          String   @id @default(cuid()) @map("id")
  tenantId    String   @map("tenant_id")
  customerId  String   @map("customer_id")
  tag         String   @map("tag") @db.VarChar(100)
  createdById String   @map("created_by_id")
  createdAt   DateTime @default(now()) @map("created_at")

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  customer  Customer @relation(fields: [customerId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  createdBy User     @relation("CustomerTagCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@unique([tenantId, customerId, tag])
  @@index([tenantId, tag])
  @@map("customer_tag")
}
```

---

## 14. Orders Models

**Scope:** Tenant-scoped. All tables carry `tenantId`. Covers the full commercial transaction lifecycle: order placement, line items, status history, fulfillment, and payment capture.

---

### Order

**Purpose:** Root transaction record. Represents a confirmed commercial commitment between the tenant and a customer. Address fields are stored as JSON snapshots at order time — independent of subsequent customer address changes. All monetary fields follow the integer currency standard.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `customer Customer`
- `lines OrderLine[]`
- `statusHistory OrderStatusHistory[]`
- `shipments Shipment[]`
- `payments Payment[]`
- `invoices Invoice[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, orderNumber])`

**Indexes:** `@@index([tenantId, customerId])`, `@@index([tenantId, orderStatus])`, `@@index([tenantId, createdAt])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Order {
  id                      String            @id @default(cuid()) @map("id")
  tenantId                String            @map("tenant_id")
  orderNumber             String            @map("order_number") @db.VarChar(50)
  customerId              String            @map("customer_id")
  orderStatus             OrderStatus       @map("order_status")
  paymentStatus           OrderPaymentStatus @map("payment_status")
  currency                String            @map("currency") @db.Char(3)
  subtotalAmount          BigInt            @default(0) @map("subtotal_amount")
  discountAmount          BigInt            @default(0) @map("discount_amount")
  taxAmount               BigInt            @default(0) @map("tax_amount")
  shippingAmount          BigInt            @default(0) @map("shipping_amount")
  totalAmount             BigInt            @default(0) @map("total_amount")
  paidAmount              BigInt            @default(0) @map("paid_amount")
  notes                   String?           @map("notes")
  billingAddressSnapshot  Json?             @map("billing_address_snapshot")
  shippingAddressSnapshot Json?             @map("shipping_address_snapshot")
  confirmedAt             DateTime?         @map("confirmed_at")
  cancelledAt             DateTime?         @map("cancelled_at")
  cancellationReason      String?           @map("cancellation_reason") @db.VarChar(255)
  deletedAt               DateTime?         @map("deleted_at")
  deletedById             String?           @map("deleted_by_id")
  createdById             String            @map("created_by_id")
  updatedById             String            @map("updated_by_id")
  createdAt               DateTime          @default(now()) @map("created_at")
  updatedAt               DateTime          @updatedAt @map("updated_at")

  tenant        Tenant               @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  customer      Customer             @relation(fields: [customerId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy     User                 @relation("OrderCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy     User                 @relation("OrderUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy     User?                @relation("OrderDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  lines         OrderLine[]
  statusHistory OrderStatusHistory[]
  shipments     Shipment[]
  payments      Payment[]
  invoices      Invoice[]

  @@unique([tenantId, orderNumber])
  @@index([tenantId, customerId])
  @@index([tenantId, orderStatus])
  @@index([tenantId, createdAt])
  @@index([deletedAt])
  @@map("order")
}

enum OrderStatus {
  DRAFT
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

// Named OrderPaymentStatus to avoid collision with the PaymentStatus reference table (§11).
enum OrderPaymentStatus {
  UNPAID
  PARTIAL
  PAID
  OVERPAID
  REFUNDED
}
```

---

### OrderLine

**Purpose:** An individual line item within an order. `productSnapshot` captures name, SKU, and pricing at order time so the line is accurate even if the product is later modified or deleted. `productId` becomes nullable via `SetNull` on product deletion.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `order Order`
- `product Product?`
- `shipmentLines ShipmentLine[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `orderId → Order.id` — `onDelete: Restrict, onUpdate: Cascade`
- `productId → Product.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, orderId, lineNumber])`

**Indexes:** `@@index([orderId])`

**Audit Fields:** `createdAt`, `updatedAt` only. Lines are not independently soft-deleted — the parent order is.

```prisma
model OrderLine {
  id                String   @id @default(cuid()) @map("id")
  tenantId          String   @map("tenant_id")
  orderId           String   @map("order_id")
  lineNumber        Int      @map("line_number")
  productId         String?  @map("product_id")
  productSnapshot   Json     @map("product_snapshot")
  description       String   @map("description") @db.VarChar(255)
  sku               String?  @map("sku") @db.VarChar(100)
  quantity          Decimal  @map("quantity") @db.Decimal(12, 4)
  unitPriceAmount   BigInt   @map("unit_price_amount")
  unitPriceCurrency String   @map("unit_price_currency") @db.Char(3)
  discountAmount    BigInt   @default(0) @map("discount_amount")
  taxAmount         BigInt   @default(0) @map("tax_amount")
  lineTotalAmount   BigInt   @map("line_total_amount")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  tenant        Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  order         Order          @relation(fields: [orderId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  product       Product?       @relation(fields: [productId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  shipmentLines ShipmentLine[]

  @@unique([tenantId, orderId, lineNumber])
  @@index([orderId])
  @@map("order_line")
}
```

---

### OrderStatusHistory

**Purpose:** Immutable log of every status transition on an order. Append-only — no updates or deletes are ever issued against this table. Provides a complete audit trail of order lifecycle without touching the parent record's history.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `order Order`
- `performedBy User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `orderId → Order.id` — `onDelete: Restrict, onUpdate: Cascade`
- `performedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([orderId])`

**Audit Fields:** `createdAt` only. Immutable — no `updatedAt`.

```prisma
model OrderStatusHistory {
  id            String   @id @default(cuid()) @map("id")
  tenantId      String   @map("tenant_id")
  orderId       String   @map("order_id")
  fromStatus    String?  @map("from_status") @db.VarChar(50)
  toStatus      String   @map("to_status") @db.VarChar(50)
  reason        String?  @map("reason") @db.VarChar(255)
  performedById String   @map("performed_by_id")
  createdAt     DateTime @default(now()) @map("created_at")

  tenant      Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  order       Order  @relation(fields: [orderId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  performedBy User   @relation("OrderStatusHistoryPerformedBy", fields: [performedById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@index([orderId])
  @@map("order_status_history")
}
```

---

### Shipment

**Purpose:** A fulfillment dispatch record linked to an order. `shippingAddressSnapshot` captures the delivery address at dispatch time. An order may generate multiple shipments for partial fulfillment.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `order Order`
- `lines ShipmentLine[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `orderId → Order.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, orderId])`, `@@index([tenantId, shipmentStatus])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`. No soft delete — shipments are physical events.

```prisma
model Shipment {
  id                      String         @id @default(cuid()) @map("id")
  tenantId                String         @map("tenant_id")
  orderId                 String         @map("order_id")
  shipmentStatus          ShipmentStatus @map("shipment_status")
  carrier                 String?        @map("carrier") @db.VarChar(100)
  trackingNumber          String?        @map("tracking_number") @db.VarChar(150)
  shippedAt               DateTime?      @map("shipped_at")
  estimatedDeliveryAt     DateTime?      @map("estimated_delivery_at")
  deliveredAt             DateTime?      @map("delivered_at")
  shippingAddressSnapshot Json           @map("shipping_address_snapshot")
  createdById             String         @map("created_by_id")
  updatedById             String         @map("updated_by_id")
  createdAt               DateTime       @default(now()) @map("created_at")
  updatedAt               DateTime       @updatedAt @map("updated_at")

  tenant    Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  order     Order          @relation(fields: [orderId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy User           @relation("ShipmentCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User           @relation("ShipmentUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  lines     ShipmentLine[]

  @@index([tenantId, orderId])
  @@index([tenantId, shipmentStatus])
  @@map("shipment")
}

enum ShipmentStatus {
  PENDING
  DISPATCHED
  IN_TRANSIT
  DELIVERED
  RETURNED
}
```

---

### ShipmentLine

**Purpose:** Links a specific `OrderLine` and quantity to a `Shipment`. Supports partial fulfillment — a single order line may be split across multiple shipments, and `quantityShipped` records how much was dispatched in each.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `shipment Shipment`
- `orderLine OrderLine`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `shipmentId → Shipment.id` — `onDelete: Restrict, onUpdate: Cascade`
- `orderLineId → OrderLine.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([shipmentId])`, `@@index([orderLineId])`

**Audit Fields:** `createdAt` only. Immutable once created.

```prisma
model ShipmentLine {
  id              String   @id @default(cuid()) @map("id")
  tenantId        String   @map("tenant_id")
  shipmentId      String   @map("shipment_id")
  orderLineId     String   @map("order_line_id")
  quantityShipped Decimal  @map("quantity_shipped") @db.Decimal(12, 4)
  createdAt       DateTime @default(now()) @map("created_at")

  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  shipment  Shipment  @relation(fields: [shipmentId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  orderLine OrderLine @relation(fields: [orderLineId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@index([shipmentId])
  @@index([orderLineId])
  @@map("shipment_line")
}
```

---

### Payment

**Purpose:** Records a payment event applied against an order. Multiple partial payments per order are supported. `gatewayResponse` stores the raw response payload from the payment gateway for debugging and dispute resolution — never queried in application logic. `InvoicePayment` rows link individual payments to invoices in the Financial Operations domain.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `order Order`
- `invoicePayments InvoicePayment[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `orderId → Order.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, orderId])`, `@@index([tenantId, paymentStatus])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`. No soft delete — payments are financial records; voiding is a status transition.

```prisma
model Payment {
  id              String             @id @default(cuid()) @map("id")
  tenantId        String             @map("tenant_id")
  orderId         String             @map("order_id")
  paymentMethod   String             @map("payment_method") @db.VarChar(100)
  paymentStatus   PaymentEventStatus @map("payment_status")
  amount          BigInt             @map("amount")
  currency        String             @map("currency") @db.Char(3)
  reference       String?            @map("reference") @db.VarChar(255)
  gatewayResponse Json?              @map("gateway_response")
  paidAt          DateTime?          @map("paid_at")
  createdById     String             @map("created_by_id")
  updatedById     String             @map("updated_by_id")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  tenant          Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  order           Order            @relation(fields: [orderId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy       User             @relation("PaymentCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy       User             @relation("PaymentUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  invoicePayments InvoicePayment[]

  @@index([tenantId, orderId])
  @@index([tenantId, paymentStatus])
  @@map("payment")
}

// Named PaymentEventStatus to avoid collision with the PaymentStatus reference table (§11).
enum PaymentEventStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

---

## 15. Import Engine Models

**Scope:** Tenant-scoped. All tables carry `tenantId`. Manages the full lifecycle of bulk data ingestion: file upload, column mapping, row-level validation, processing, and structured error reporting.

---

### ImportJob

**Purpose:** Tracks a single bulk import operation from initiation to completion. `importType` identifies the target domain entity (e.g., `customer`, `product`, `order`). `mapping` stores the user-defined column-to-field map. `options` holds import-mode flags such as `upsert`, `skip_errors`, `dry_run`.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `rows ImportRow[]`
- `errors ImportErrorLog[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, importStatus])`, `@@index([tenantId, createdAt])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model ImportJob {
  id            String       @id @default(cuid()) @map("id")
  tenantId      String       @map("tenant_id")
  importType    String       @map("import_type") @db.VarChar(100)
  fileName      String       @map("file_name") @db.VarChar(255)
  fileSizeBytes BigInt       @map("file_size_bytes")
  fileMimeType  String       @map("file_mime_type") @db.VarChar(100)
  storageKey    String       @map("storage_key")
  importStatus  ImportStatus @map("import_status")
  totalRows     Int?         @map("total_rows")
  validRows     Int?         @map("valid_rows")
  invalidRows   Int?         @map("invalid_rows")
  processedRows Int          @default(0) @map("processed_rows")
  failedRows    Int          @default(0) @map("failed_rows")
  errorSummary  String?      @map("error_summary")
  mapping       Json?        @map("mapping")
  options       Json?        @map("options")
  startedAt     DateTime?    @map("started_at")
  completedAt   DateTime?    @map("completed_at")
  deletedAt     DateTime?    @map("deleted_at")
  deletedById   String?      @map("deleted_by_id")
  createdById   String       @map("created_by_id")
  updatedById   String       @map("updated_by_id")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  tenant    Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy User             @relation("ImportJobCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User             @relation("ImportJobUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?            @relation("ImportJobDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  rows      ImportRow[]
  errors    ImportErrorLog[]

  @@index([tenantId, importStatus])
  @@index([tenantId, createdAt])
  @@index([deletedAt])
  @@map("import_job")
}

enum ImportStatus {
  PENDING
  PARSING
  VALIDATING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

### ImportRow

**Purpose:** Row-level record for each data row within an import job. Captures raw input, the mapped representation after column mapping is applied, validation outcome, and the ID of the created or updated entity after successful processing. `entityId` is a polymorphic reference — its target table is implied by `ImportJob.importType` and is not enforced via FK.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `importJob ImportJob`
- `errors ImportErrorLog[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `importJobId → ImportJob.id` — `onDelete: Cascade, onUpdate: Cascade`

No FK on `entityId` — polymorphic reference, resolved by `ImportJob.importType`.

**Unique Constraints:** `@@unique([tenantId, importJobId, rowNumber])`

**Indexes:** `@@index([importJobId])`, `@@index([importJobId, rowStatus])`

**Audit Fields:** `createdAt`, `updatedAt` only. No actor tracking — rows are written by the import processor, not by users directly.

```prisma
model ImportRow {
  id               String    @id @default(cuid()) @map("id")
  tenantId         String    @map("tenant_id")
  importJobId      String    @map("import_job_id")
  rowNumber        Int       @map("row_number")
  rawData          Json      @map("raw_data")
  mappedData       Json?     @map("mapped_data")
  rowStatus        RowStatus @map("row_status")
  validationErrors Json?     @map("validation_errors")
  errorMessage     String?   @map("error_message")
  entityId         String?   @map("entity_id")
  processedAt      DateTime? @map("processed_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  tenant    Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  importJob ImportJob        @relation(fields: [importJobId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  errors    ImportErrorLog[]

  @@unique([tenantId, importJobId, rowNumber])
  @@index([importJobId])
  @@index([importJobId, rowStatus])
  @@map("import_row")
}

enum RowStatus {
  PENDING
  VALID
  INVALID
  PROCESSED
  FAILED
  SKIPPED
}
```

---

### ImportErrorLog

**Purpose:** Structured error log for import failures at job or row level. Preserves full context — error code, message, field name, and raw field value — for user review and support diagnostics. Rows are append-only; no updates or deletes are ever issued.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `importJob ImportJob`
- `importRow ImportRow?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `importJobId → ImportJob.id` — `onDelete: Cascade, onUpdate: Cascade`
- `importRowId → ImportRow.id` — `onDelete: SetNull, onUpdate: Cascade`

`importRowId` is nullable — job-level errors (e.g., unparseable file) carry no row reference.

**Unique Constraints:** None.

**Indexes:** `@@index([importJobId])`, `@@index([importRowId])`

**Audit Fields:** `createdAt` only. Immutable — no `updatedAt`.

```prisma
model ImportErrorLog {
  id           String   @id @default(cuid()) @map("id")
  tenantId     String   @map("tenant_id")
  importJobId  String   @map("import_job_id")
  importRowId  String?  @map("import_row_id")
  errorCode    String   @map("error_code") @db.VarChar(100)
  errorMessage String   @map("error_message")
  fieldName    String?  @map("field_name") @db.VarChar(100)
  fieldValue   String?  @map("field_value")
  createdAt    DateTime @default(now()) @map("created_at")

  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  importJob ImportJob  @relation(fields: [importJobId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  importRow ImportRow? @relation(fields: [importRowId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([importJobId])
  @@index([importRowId])
  @@map("import_error_log")
}
```

---

*Sections 12–15 appended. Append further sections below this line.*

---

## 16. Financial Operations Models

**Scope:** Tenant-scoped. All tables carry `tenantId`. Manages formal billing documents, payment application, reversals, tax configuration, and business-side expense records. Sits between the Orders domain (commercial events) and the Accounting domain (ledger postings).

---

### TaxRate

**Purpose:** Named tax rate applicable to invoice and order lines. `rate` is stored as a decimal fraction (`0.0500` = 5%) and applied to `BigInt` amounts at the application layer before rounding. Date range fields constrain which periods a rate is valid for.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `invoiceLines InvoiceLine[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, isActive])`, `@@index([tenantId, countryCode])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`. No soft delete — superseded rates are made inactive, not deleted.

```prisma
model TaxRate {
  id            String   @id @default(cuid()) @map("id")
  tenantId      String   @map("tenant_id")
  name          String   @map("name") @db.VarChar(100)
  rate          Decimal  @map("rate") @db.Decimal(8, 4)
  taxType       String   @map("tax_type") @db.VarChar(50)
  countryCode   String?  @map("country_code") @db.Char(2)
  isDefault     Boolean  @default(false) @map("is_default")
  isActive      Boolean  @default(true) @map("is_active")
  effectiveFrom DateTime @map("effective_from") @db.Date
  effectiveTo   DateTime? @map("effective_to") @db.Date
  createdById   String   @map("created_by_id")
  updatedById   String   @map("updated_by_id")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy   User          @relation("TaxRateCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy   User          @relation("TaxRateUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  invoiceLines InvoiceLine[]

  @@index([tenantId, isActive])
  @@index([tenantId, countryCode])
  @@map("tax_rate")
}
```

---

### Invoice

**Purpose:** Formal billing document issued to a customer. Generated from an order or created manually. `billingAddressSnapshot` captures the address at issuance time. All monetary fields follow the integer currency standard.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `order Order?`
- `customer Customer`
- `lines InvoiceLine[]`
- `payments InvoicePayment[]`
- `creditNotes CreditNote[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `orderId → Order.id` — `onDelete: SetNull, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, invoiceNumber])`

**Indexes:** `@@index([tenantId, customerId])`, `@@index([tenantId, invoiceStatus])`, `@@index([tenantId, dueDate])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Invoice {
  id                     String        @id @default(cuid()) @map("id")
  tenantId               String        @map("tenant_id")
  invoiceNumber          String        @map("invoice_number") @db.VarChar(50)
  orderId                String?       @map("order_id")
  customerId             String        @map("customer_id")
  invoiceStatus          InvoiceStatus @map("invoice_status")
  currency               String        @map("currency") @db.Char(3)
  subtotalAmount         BigInt        @default(0) @map("subtotal_amount")
  discountAmount         BigInt        @default(0) @map("discount_amount")
  taxAmount              BigInt        @default(0) @map("tax_amount")
  totalAmount            BigInt        @default(0) @map("total_amount")
  paidAmount             BigInt        @default(0) @map("paid_amount")
  dueAmount              BigInt        @default(0) @map("due_amount")
  issuedAt               DateTime?     @map("issued_at")
  dueDate                DateTime?     @map("due_date") @db.Date
  paidAt                 DateTime?     @map("paid_at")
  voidedAt               DateTime?     @map("voided_at")
  voidReason             String?       @map("void_reason") @db.VarChar(255)
  notes                  String?       @map("notes")
  billingAddressSnapshot Json?         @map("billing_address_snapshot")
  deletedAt              DateTime?     @map("deleted_at")
  deletedById            String?       @map("deleted_by_id")
  createdById            String        @map("created_by_id")
  updatedById            String        @map("updated_by_id")
  createdAt              DateTime      @default(now()) @map("created_at")
  updatedAt              DateTime      @updatedAt @map("updated_at")

  tenant      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  order       Order?           @relation(fields: [orderId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  customer    Customer         @relation(fields: [customerId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy   User             @relation("InvoiceCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy   User             @relation("InvoiceUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy   User?            @relation("InvoiceDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  lines       InvoiceLine[]
  payments    InvoicePayment[]
  creditNotes CreditNote[]

  @@unique([tenantId, invoiceNumber])
  @@index([tenantId, customerId])
  @@index([tenantId, invoiceStatus])
  @@index([tenantId, dueDate])
  @@index([deletedAt])
  @@map("invoice")
}

enum InvoiceStatus {
  DRAFT
  ISSUED
  PARTIALLY_PAID
  PAID
  VOID
  UNCOLLECTABLE
}
```

---

### InvoiceLine

**Purpose:** A line item on an invoice. Independent of `OrderLine` — invoices may be created for items not tied to any order. When an invoice is generated from an order, `orderLineId` links the line for traceability.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `invoice Invoice`
- `orderLine OrderLine?`
- `taxRate TaxRate?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `invoiceId → Invoice.id` — `onDelete: Restrict, onUpdate: Cascade`
- `orderLineId → OrderLine.id` — `onDelete: SetNull, onUpdate: Cascade`
- `taxRateId → TaxRate.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, invoiceId, lineNumber])`

**Indexes:** `@@index([invoiceId])`

**Audit Fields:** `createdAt`, `updatedAt` only. Lines are not independently soft-deleted.

```prisma
model InvoiceLine {
  id                String   @id @default(cuid()) @map("id")
  tenantId          String   @map("tenant_id")
  invoiceId         String   @map("invoice_id")
  orderLineId       String?  @map("order_line_id")
  lineNumber        Int      @map("line_number")
  description       String   @map("description") @db.VarChar(255)
  sku               String?  @map("sku") @db.VarChar(100)
  quantity          Decimal  @map("quantity") @db.Decimal(12, 4)
  unitPriceAmount   BigInt   @map("unit_price_amount")
  unitPriceCurrency String   @map("unit_price_currency") @db.Char(3)
  discountAmount    BigInt   @default(0) @map("discount_amount")
  taxAmount         BigInt   @default(0) @map("tax_amount")
  lineTotalAmount   BigInt   @map("line_total_amount")
  taxRateId         String?  @map("tax_rate_id")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  invoice   Invoice    @relation(fields: [invoiceId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  orderLine OrderLine? @relation(fields: [orderLineId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  taxRate   TaxRate?   @relation(fields: [taxRateId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, invoiceId, lineNumber])
  @@index([invoiceId])
  @@map("invoice_line")
}
```

---

### InvoicePayment

**Purpose:** Records a payment event applied to an invoice. Supports multiple partial payments. `paymentId` optionally links to an `Order`-domain `Payment` record when the payment originated from an order settlement.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `invoice Invoice`
- `payment Payment?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `invoiceId → Invoice.id` — `onDelete: Restrict, onUpdate: Cascade`
- `paymentId → Payment.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([invoiceId])`, `@@index([paymentId])`

**Audit Fields:** `createdAt` only. Immutable once created.

```prisma
model InvoicePayment {
  id            String   @id @default(cuid()) @map("id")
  tenantId      String   @map("tenant_id")
  invoiceId     String   @map("invoice_id")
  paymentId     String?  @map("payment_id")
  amount        BigInt   @map("amount")
  currency      String   @map("currency") @db.Char(3)
  paymentMethod String   @map("payment_method") @db.VarChar(100)
  reference     String?  @map("reference") @db.VarChar(255)
  paidAt        DateTime @map("paid_at")
  createdById   String   @map("created_by_id")
  createdAt     DateTime @default(now()) @map("created_at")

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  invoice   Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  payment   Payment? @relation(fields: [paymentId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy User     @relation("InvoicePaymentCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@index([invoiceId])
  @@index([paymentId])
  @@map("invoice_payment")
}
```

---

### CreditNote

**Purpose:** A partial or full reversal issued against an invoice. Reduces the customer's outstanding balance. `appliedAmount` tracks how much of the credit has been consumed against invoices or refunds.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `invoice Invoice`
- `customer Customer`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `invoiceId → Invoice.id` — `onDelete: Restrict, onUpdate: Cascade`
- `customerId → Customer.id` — `onDelete: Restrict, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, creditNoteNumber])`

**Indexes:** `@@index([invoiceId])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model CreditNote {
  id               String           @id @default(cuid()) @map("id")
  tenantId         String           @map("tenant_id")
  creditNoteNumber String           @map("credit_note_number") @db.VarChar(50)
  invoiceId        String           @map("invoice_id")
  customerId       String           @map("customer_id")
  creditNoteStatus CreditNoteStatus @map("credit_note_status")
  currency         String           @map("currency") @db.Char(3)
  totalAmount      BigInt           @map("total_amount")
  appliedAmount    BigInt           @default(0) @map("applied_amount")
  reason           String?          @map("reason")
  issuedAt         DateTime?        @map("issued_at")
  deletedAt        DateTime?        @map("deleted_at")
  deletedById      String?          @map("deleted_by_id")
  createdById      String           @map("created_by_id")
  updatedById      String           @map("updated_by_id")
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  invoice   Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  customer  Customer @relation(fields: [customerId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy User     @relation("CreditNoteCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User     @relation("CreditNoteUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?    @relation("CreditNoteDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, creditNoteNumber])
  @@index([invoiceId])
  @@index([deletedAt])
  @@map("credit_note")
}

enum CreditNoteStatus {
  DRAFT
  ISSUED
  APPLIED
  VOID
}
```

---

### ExpenseCategory

**Purpose:** Classifies business expenses for reporting and GL account mapping. Self-referential parent/child hierarchy. Extended by §24 (Expenses Domain) which adds `code`, per-category spend limits, and policy linkage.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `parent ExpenseCategory?`
- `children ExpenseCategory[]`
- `glAccount ChartOfAccount?`
- `expenses Expense[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `parentId → ExpenseCategory.id` — `onDelete: SetNull, onUpdate: Cascade`
- `glAccountId → ChartOfAccount.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** None.

**Indexes:** `@@index([tenantId, parentId])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`. No soft delete.

```prisma
model ExpenseCategory {
  id          String    @id @default(cuid()) @map("id")
  tenantId    String    @map("tenant_id")
  name        String    @map("name") @db.VarChar(150)
  parentId    String?   @map("parent_id")
  glAccountId String?   @map("gl_account_id")
  isActive    Boolean   @default(true) @map("is_active")
  createdById String    @map("created_by_id")
  updatedById String    @map("updated_by_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  tenant    Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  parent    ExpenseCategory?  @relation("ExpenseCategoryParent", fields: [parentId], references: [id])
  children  ExpenseCategory[] @relation("ExpenseCategoryParent")
  glAccount ChartOfAccount?   @relation(fields: [glAccountId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy User              @relation("ExpenseCategoryCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User              @relation("ExpenseCategoryUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  expenses  Expense[]

  @@index([tenantId, parentId])
  @@map("expense_category")
}
```

---

### Expense

**Purpose:** Records an internal business expense incurred by the tenant — vendor-side operational costs (utilities, services, subscriptions). Distinct from employee expense claims managed in §24. May optionally link to a `Vendor` and a `PurchaseOrder` for three-way matching.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `expenseCategory ExpenseCategory`
- `vendor Vendor?`
- `purchaseOrder PurchaseOrder?`
- `approvedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `expenseCategoryId → ExpenseCategory.id` — `onDelete: Restrict, onUpdate: Cascade`
- `vendorId → Vendor.id` — `onDelete: SetNull, onUpdate: Cascade`
- `purchaseOrderId → PurchaseOrder.id` — `onDelete: SetNull, onUpdate: Cascade`
- `approvedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, expenseNumber])`

**Indexes:** `@@index([tenantId, expenseStatus])`, `@@index([tenantId, incurredDate])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Expense {
  id                String        @id @default(cuid()) @map("id")
  tenantId          String        @map("tenant_id")
  expenseNumber     String        @map("expense_number") @db.VarChar(50)
  expenseCategoryId String        @map("expense_category_id")
  vendorName        String?       @map("vendor_name") @db.VarChar(255)
  vendorId          String?       @map("vendor_id")
  purchaseOrderId   String?       @map("purchase_order_id")
  expenseStatus     ExpenseStatus @map("expense_status")
  currency          String        @map("currency") @db.Char(3)
  totalAmount       BigInt        @map("total_amount")
  taxAmount         BigInt        @default(0) @map("tax_amount")
  incurredDate      DateTime      @map("incurred_date") @db.Date
  paidAt            DateTime?     @map("paid_at")
  notes             String?       @map("notes")
  receiptUrl        String?       @map("receipt_url")
  approvedById      String?       @map("approved_by_id")
  approvedAt        DateTime?     @map("approved_at")
  deletedAt         DateTime?     @map("deleted_at")
  deletedById       String?       @map("deleted_by_id")
  createdById       String        @map("created_by_id")
  updatedById       String        @map("updated_by_id")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  tenant          Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  expenseCategory ExpenseCategory @relation(fields: [expenseCategoryId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  vendor          Vendor?         @relation(fields: [vendorId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  purchaseOrder   PurchaseOrder?  @relation(fields: [purchaseOrderId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  approvedBy      User?           @relation("ExpenseApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy       User            @relation("ExpenseCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy       User            @relation("ExpenseUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy       User?           @relation("ExpenseDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, expenseNumber])
  @@index([tenantId, expenseStatus])
  @@index([tenantId, incurredDate])
  @@index([deletedAt])
  @@map("expense")
}

enum ExpenseStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  PAID
}
```

---

## 17. Accounting Models

**Scope:** Mixed. `AccountType` is global — seeded at deployment. All other models are tenant-scoped. Definitions use the §21 Extended schema, which supersedes the preliminary §17 definitions in the DATABASE_MASTER_BLUEPRINT. `FinancialYear`/`FiscalPeriod` replace `FiscalYear`/`AccountingPeriod`. `ChartOfAccount` uses `accountTypeId` FK instead of an enum. `JournalEntryLine` carries `costCenterId`.

---

### AccountType

**Purpose:** Global reference catalog classifying every account in the system. Defines `category` (asset/liability/equity/revenue/expense), `normalBalance` (which side increases the account), and financial statement membership. Seeded at deployment; never tenant-modified.

**Ownership:** Global — no `tenantId`.

**Relationships:**
- `accounts ChartOfAccount[]`

**Foreign Keys:** None.

**Unique Constraints:** `@@unique([key])`

**Indexes:** Covered by unique constraint.

**Audit Fields:** `createdAt` only.

```prisma
model AccountType {
  id                String          @id @default(cuid()) @map("id")
  key               String          @unique @map("key") @db.VarChar(50)
  label             String          @map("label") @db.VarChar(100)
  category          AccountCategory @map("category")
  normalBalance     NormalBalance   @map("normal_balance")
  isBalanceSheet    Boolean         @map("is_balance_sheet")
  isIncomeStatement Boolean         @map("is_income_statement")
  description       String?         @map("description")
  position          Int             @map("position")
  createdAt         DateTime        @default(now()) @map("created_at")

  accounts ChartOfAccount[]

  @@map("account_type")
}

enum AccountCategory {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

enum NormalBalance {
  DEBIT
  CREDIT
}
```

---

### ChartOfAccount

**Purpose:** The tenant's full account register. Every journal line posts to an account here. `allowDirectPosting = false` marks summary/header accounts used only for grouping — journal lines may not post to them. `accountTypeId` FK replaces the enum from the preliminary §17 definition.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `accountType AccountType`
- `parent ChartOfAccount?`
- `children ChartOfAccount[]`
- `costCenter CostCenter?`
- `journalLines JournalEntryLine[]`
- `accountBalances AccountBalance[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `accountTypeId → AccountType.id` — `onDelete: Restrict, onUpdate: Cascade`
- `parentId → ChartOfAccount.id` — `onDelete: Restrict` (self-referential)
- `costCenterId → CostCenter.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code])` — partial, active records only. Enforced via raw migration SQL: `CREATE UNIQUE INDEX uq_chart_of_account_code ON chart_of_account(tenant_id, code) WHERE deleted_at IS NULL;`

**Indexes:** `@@index([tenantId, accountTypeId])`, `@@index([parentId])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model ChartOfAccount {
  id                 String    @id @default(cuid()) @map("id")
  tenantId           String    @map("tenant_id")
  code               String    @map("code") @db.VarChar(20)
  name               String    @map("name") @db.VarChar(150)
  accountTypeId      String    @map("account_type_id")
  parentId           String?   @map("parent_id")
  currency           String    @map("currency") @db.Char(3)
  costCenterId       String?   @map("cost_center_id")
  isSystem           Boolean   @default(false) @map("is_system")
  isActive           Boolean   @default(true) @map("is_active")
  allowDirectPosting Boolean   @default(true) @map("allow_direct_posting")
  description        String?   @map("description")
  deletedAt          DateTime? @map("deleted_at")
  deletedById        String?   @map("deleted_by_id")
  createdById        String    @map("created_by_id")
  updatedById        String    @map("updated_by_id")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  tenant          Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  accountType     AccountType        @relation(fields: [accountTypeId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  parent          ChartOfAccount?    @relation("ChartOfAccountParent", fields: [parentId], references: [id])
  children        ChartOfAccount[]   @relation("ChartOfAccountParent")
  costCenter      CostCenter?        @relation(fields: [costCenterId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy       User               @relation("ChartOfAccountCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy       User               @relation("ChartOfAccountUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy       User?              @relation("ChartOfAccountDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  journalLines    JournalEntryLine[]
  accountBalances AccountBalance[]
  expenseCategories ExpenseCategory[]

  @@index([tenantId, accountTypeId])
  @@index([parentId])
  @@index([deletedAt])
  @@map("chart_of_account")
}

// Partial unique enforced via raw migration SQL:
// CREATE UNIQUE INDEX uq_chart_of_account_code ON chart_of_account(tenant_id, code) WHERE deleted_at IS NULL;
```

---

### CostCenter

**Purpose:** An organizational dimension for allocating revenue and expenses across departments, projects, or business units. Self-referential hierarchy. Journal lines carry an optional `costCenterId` for dimensional reporting.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `parent CostCenter?`
- `children CostCenter[]`
- `manager User?`
- `accounts ChartOfAccount[]`
- `journalLines JournalEntryLine[]`
- `accountBalances AccountBalance[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `parentId → CostCenter.id` — `onDelete: SetNull, onUpdate: Cascade`
- `managerId → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code])` — partial. Raw SQL: `CREATE UNIQUE INDEX uq_cost_center_code ON cost_center(tenant_id, code) WHERE deleted_at IS NULL;`

**Indexes:** `@@index([parentId])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model CostCenter {
  id               String           @id @default(cuid()) @map("id")
  tenantId         String           @map("tenant_id")
  code             String           @map("code") @db.VarChar(20)
  name             String           @map("name") @db.VarChar(150)
  costCenterType   CostCenterType   @map("cost_center_type")
  parentId         String?          @map("parent_id")
  managerId        String?          @map("manager_id")
  isActive         Boolean          @default(true) @map("is_active")
  deletedAt        DateTime?        @map("deleted_at")
  deletedById      String?          @map("deleted_by_id")
  createdById      String           @map("created_by_id")
  updatedById      String           @map("updated_by_id")
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  tenant          Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  parent          CostCenter?        @relation("CostCenterParent", fields: [parentId], references: [id])
  children        CostCenter[]       @relation("CostCenterParent")
  manager         User?              @relation("CostCenterManager", fields: [managerId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy       User               @relation("CostCenterCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy       User               @relation("CostCenterUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy       User?              @relation("CostCenterDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  accounts        ChartOfAccount[]
  journalLines    JournalEntryLine[]
  accountBalances AccountBalance[]

  @@index([parentId])
  @@index([deletedAt])
  @@map("cost_center")
}

enum CostCenterType {
  DEPARTMENT
  PROJECT
  LOCATION
  PRODUCT_LINE
  OTHER
}
```

---

### FinancialYear

**Purpose:** Defines the tenant's fiscal year boundaries. `LOCKED` permits read-only reporting but prevents new postings. `CLOSED` indicates closing entries have been posted and opening balances rolled into the next year. Supersedes `FiscalYear` from the preliminary §17 definition.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `periods FiscalPeriod[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `lockedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `closedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, startDate])`

**Indexes:** `@@index([tenantId, yearStatus])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`. No soft delete — years are closed, not deleted.

```prisma
model FinancialYear {
  id          String     @id @default(cuid()) @map("id")
  tenantId    String     @map("tenant_id")
  name        String     @map("name") @db.VarChar(100)
  startDate   DateTime   @map("start_date") @db.Date
  endDate     DateTime   @map("end_date") @db.Date
  periodCount Int        @default(12) @map("period_count")
  yearStatus  YearStatus @default(OPEN) @map("year_status")
  lockedAt    DateTime?  @map("locked_at")
  lockedById  String?    @map("locked_by_id")
  closedAt    DateTime?  @map("closed_at")
  closedById  String?    @map("closed_by_id")
  createdById String     @map("created_by_id")
  updatedById String     @map("updated_by_id")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  tenant    Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  lockedBy  User?         @relation("FinancialYearLockedBy", fields: [lockedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  closedBy  User?         @relation("FinancialYearClosedBy", fields: [closedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy User          @relation("FinancialYearCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User          @relation("FinancialYearUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  periods   FiscalPeriod[]

  @@unique([tenantId, startDate])
  @@index([tenantId, yearStatus])
  @@map("financial_year")
}

enum YearStatus {
  OPEN
  LOCKED
  CLOSED
}
```

---

### FiscalPeriod

**Purpose:** A sub-period within a financial year, typically monthly. `ADJUSTMENT` periods allow year-end corrections after the last regular period closes. `CLOSING` periods hold formal closing entries only. Supersedes `AccountingPeriod` from the preliminary §17 definition.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `financialYear FinancialYear`
- `journalEntries JournalEntry[]`
- `accountBalances AccountBalance[]`
- `assetDepreciations AssetDepreciation[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `financialYearId → FinancialYear.id` — `onDelete: Restrict, onUpdate: Cascade`
- `lockedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `closedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, financialYearId, periodNumber])`

**Indexes:** `@@index([financialYearId])`, `@@index([tenantId, periodStatus])`

**Audit Fields:** `createdAt`, `updatedAt` only.

```prisma
model FiscalPeriod {
  id              String             @id @default(cuid()) @map("id")
  tenantId        String             @map("tenant_id")
  financialYearId String             @map("financial_year_id")
  name            String             @map("name") @db.VarChar(50)
  periodNumber    Int                @map("period_number")
  periodType      FiscalPeriodType   @map("period_type")
  startDate       DateTime           @map("start_date") @db.Date
  endDate         DateTime           @map("end_date") @db.Date
  periodStatus    FiscalPeriodStatus @default(OPEN) @map("period_status")
  lockedAt        DateTime?          @map("locked_at")
  lockedById      String?            @map("locked_by_id")
  closedAt        DateTime?          @map("closed_at")
  closedById      String?            @map("closed_by_id")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  tenant          FinancialYear        @relation(fields: [financialYearId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  lockedBy        User?                @relation("FiscalPeriodLockedBy", fields: [lockedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  closedBy        User?                @relation("FiscalPeriodClosedBy", fields: [closedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  journalEntries  JournalEntry[]
  accountBalances AccountBalance[]
  assetDepreciations AssetDepreciation[]

  @@unique([tenantId, financialYearId, periodNumber])
  @@index([financialYearId])
  @@index([tenantId, periodStatus])
  @@map("fiscal_period")
}

enum FiscalPeriodType {
  REGULAR
  ADJUSTMENT
  CLOSING
}

enum FiscalPeriodStatus {
  OPEN
  LOCKED
  CLOSED
}
```

---

### JournalEntry

**Purpose:** Header record for a double-entry accounting transaction. Immutable once `entryStatus = POSTED`. `source_type`/`source_id` identify the originating domain event (e.g. `invoice`, `expense`, `payment`). `reversalOfId` links a reversal entry back to the entry it negates.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `fiscalPeriod FiscalPeriod`
- `lines JournalEntryLine[]`
- `reversalOf JournalEntry?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `fiscalPeriodId → FiscalPeriod.id` — `onDelete: Restrict, onUpdate: Cascade`
- `reversalOfId → JournalEntry.id` — `onDelete: SetNull, onUpdate: Cascade`
- `postedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `voidedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, entryNumber])`

**Indexes:** `@@index([fiscalPeriodId])`, `@@index([tenantId, transactionDate])`, `@@index([tenantId, sourceType, sourceId])`, `@@index([reversalOfId])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`. No soft delete — void is a status transition; voided entries remain in the ledger.

```prisma
model JournalEntry {
  id              String             @id @default(cuid()) @map("id")
  tenantId        String             @map("tenant_id")
  entryNumber     String             @map("entry_number") @db.VarChar(50)
  fiscalPeriodId  String             @map("fiscal_period_id")
  entryType       JournalEntryType   @map("entry_type")
  entryStatus     JournalEntryStatus @default(DRAFT) @map("entry_status")
  currency        String             @map("currency") @db.Char(3)
  description     String             @map("description")
  reference       String?            @map("reference") @db.VarChar(255)
  sourceType      String?            @map("source_type") @db.VarChar(100)
  sourceId        String?            @map("source_id")
  reversalOfId    String?            @map("reversal_of_id")
  transactionDate DateTime           @map("transaction_date") @db.Date
  postedAt        DateTime?          @map("posted_at")
  postedById      String?            @map("posted_by_id")
  voidedAt        DateTime?          @map("voided_at")
  voidedById      String?            @map("voided_by_id")
  voidReason      String?            @map("void_reason") @db.VarChar(255)
  createdById     String             @map("created_by_id")
  updatedById     String             @map("updated_by_id")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  tenant       Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  fiscalPeriod FiscalPeriod       @relation(fields: [fiscalPeriodId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  reversalOf   JournalEntry?      @relation("JournalEntryReversal", fields: [reversalOfId], references: [id])
  reversals    JournalEntry[]     @relation("JournalEntryReversal")
  postedBy     User?              @relation("JournalEntryPostedBy", fields: [postedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  voidedBy     User?              @relation("JournalEntryVoidedBy", fields: [voidedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy    User               @relation("JournalEntryCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy    User               @relation("JournalEntryUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  lines        JournalEntryLine[]

  @@unique([tenantId, entryNumber])
  @@index([fiscalPeriodId])
  @@index([tenantId, transactionDate])
  @@index([tenantId, sourceType, sourceId])
  @@index([reversalOfId])
  @@map("journal_entry")
}

enum JournalEntryType {
  MANUAL
  SYSTEM
  ADJUSTMENT
  CLOSING
  REVERSAL
}

enum JournalEntryStatus {
  DRAFT
  POSTED
  VOID
}
```

---

### JournalEntryLine

**Purpose:** A single debit or credit leg of a journal entry. Append-only once the parent entry is posted. The sum of all debit amounts must equal the sum of all credit amounts per entry — enforced at the application layer before posting. `baseCurrencyAmount` stores the tenant home-currency equivalent when `currency` differs from the account's home currency.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `journalEntry JournalEntry`
- `account ChartOfAccount`
- `costCenter CostCenter?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `journalEntryId → JournalEntry.id` — `onDelete: Restrict, onUpdate: Cascade`
- `accountId → ChartOfAccount.id` — `onDelete: Restrict, onUpdate: Cascade`
- `costCenterId → CostCenter.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, journalEntryId, lineNumber])`

**Indexes:** `@@index([journalEntryId])`, `@@index([accountId])`, `@@index([costCenterId])`

**Audit Fields:** `createdAt` only. Immutable once the parent entry is posted.

```prisma
model JournalEntryLine {
  id                  String         @id @default(cuid()) @map("id")
  tenantId            String         @map("tenant_id")
  journalEntryId      String         @map("journal_entry_id")
  lineNumber          Int            @map("line_number")
  accountId           String         @map("account_id")
  costCenterId        String?        @map("cost_center_id")
  entryDirection      EntryDirection @map("entry_direction")
  amount              BigInt         @map("amount")
  currency            String         @map("currency") @db.Char(3)
  exchangeRate        Decimal?       @map("exchange_rate") @db.Decimal(19, 4)
  baseCurrencyAmount  BigInt?        @map("base_currency_amount")
  description         String?        @map("description") @db.VarChar(255)
  createdAt           DateTime       @default(now()) @map("created_at")

  tenant       Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  journalEntry JournalEntry   @relation(fields: [journalEntryId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  account      ChartOfAccount @relation(fields: [accountId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  costCenter   CostCenter?    @relation(fields: [costCenterId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, journalEntryId, lineNumber])
  @@index([journalEntryId])
  @@index([accountId])
  @@index([costCenterId])
  @@map("journal_entry_line")
}

enum EntryDirection {
  DEBIT
  CREDIT
}
```

---

### FixedAsset

**Purpose:** A long-lived tangible or intangible asset subject to depreciation. Requires three GL accounts: the asset account (debited on purchase), the accumulated depreciation contra account (credited on each depreciation charge), and the depreciation expense account (debited on each charge).

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `costCenter CostCenter?`
- `assetAccount ChartOfAccount`
- `accumulatedDepreciationAccount ChartOfAccount`
- `depreciationExpenseAccount ChartOfAccount`
- `depreciations AssetDepreciation[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `costCenterId → CostCenter.id` — `onDelete: SetNull, onUpdate: Cascade`
- `assetAccountId → ChartOfAccount.id` — `onDelete: Restrict, onUpdate: Cascade`
- `accumulatedDepreciationAccountId → ChartOfAccount.id` — `onDelete: Restrict, onUpdate: Cascade`
- `depreciationExpenseAccountId → ChartOfAccount.id` — `onDelete: Restrict, onUpdate: Cascade`
- `vendorId → Vendor.id` — `onDelete: SetNull, onUpdate: Cascade`
- `purchaseOrderId → PurchaseOrder.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `updatedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`
- `deletedById → User.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, assetNumber])` — partial. Raw SQL: `CREATE UNIQUE INDEX uq_fixed_asset_number ON fixed_asset(tenant_id, asset_number) WHERE deleted_at IS NULL;`

**Indexes:** `@@index([tenantId, assetStatus])`, `@@index([tenantId, costCenterId])`, `@@index([deletedAt])`

**Audit Fields:** Full — `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model FixedAsset {
  id                              String              @id @default(cuid()) @map("id")
  tenantId                        String              @map("tenant_id")
  assetNumber                     String              @map("asset_number") @db.VarChar(50)
  name                            String              @map("name") @db.VarChar(255)
  assetType                       AssetType           @map("asset_type")
  assetCategory                   String              @map("asset_category") @db.VarChar(100)
  description                     String?             @map("description")
  serialNumber                    String?             @map("serial_number") @db.VarChar(150)
  location                        String?             @map("location") @db.VarChar(255)
  costCenterId                    String?             @map("cost_center_id")
  assetAccountId                  String              @map("asset_account_id")
  accumulatedDepreciationAccountId String             @map("accumulated_depreciation_account_id")
  depreciationExpenseAccountId    String              @map("depreciation_expense_account_id")
  depreciationMethod              DepreciationMethod  @map("depreciation_method")
  usefulLifeMonths                Int?                @map("useful_life_months")
  salvageValueAmount              BigInt              @default(0) @map("salvage_value_amount")
  salvageValueCurrency            String              @map("salvage_value_currency") @db.Char(3)
  purchaseCostAmount              BigInt              @map("purchase_cost_amount")
  purchaseCostCurrency            String              @map("purchase_cost_currency") @db.Char(3)
  purchaseDate                    DateTime            @map("purchase_date") @db.Date
  inServiceDate                   DateTime?           @map("in_service_date") @db.Date
  disposalDate                    DateTime?           @map("disposal_date") @db.Date
  disposalAmount                  BigInt?             @map("disposal_amount")
  assetStatus                     AssetStatus         @map("asset_status")
  vendorId                        String?             @map("vendor_id")
  purchaseOrderId                 String?             @map("purchase_order_id")
  deletedAt                       DateTime?           @map("deleted_at")
  deletedById                     String?             @map("deleted_by_id")
  createdById                     String              @map("created_by_id")
  updatedById                     String              @map("updated_by_id")
  createdAt                       DateTime            @default(now()) @map("created_at")
  updatedAt                       DateTime            @updatedAt @map("updated_at")

  tenant                         Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  costCenter                     CostCenter?         @relation(fields: [costCenterId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  assetAccount                   ChartOfAccount      @relation("FixedAssetAssetAccount", fields: [assetAccountId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  accumulatedDepreciationAccount ChartOfAccount      @relation("FixedAssetAccumDeprecAccount", fields: [accumulatedDepreciationAccountId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  depreciationExpenseAccount     ChartOfAccount      @relation("FixedAssetDeprecExpenseAccount", fields: [depreciationExpenseAccountId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  vendor                         Vendor?             @relation(fields: [vendorId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  purchaseOrder                  PurchaseOrder?      @relation(fields: [purchaseOrderId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy                      User                @relation("FixedAssetCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy                      User                @relation("FixedAssetUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy                      User?               @relation("FixedAssetDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  depreciations                  AssetDepreciation[]

  @@index([tenantId, assetStatus])
  @@index([tenantId, costCenterId])
  @@index([deletedAt])
  @@map("fixed_asset")
}

enum AssetType {
  TANGIBLE
  INTANGIBLE
}

enum DepreciationMethod {
  STRAIGHT_LINE
  DECLINING_BALANCE
  UNITS_OF_PRODUCTION
  NONE
}

enum AssetStatus {
  ACTIVE
  DISPOSED
  FULLY_DEPRECIATED
  IMPAIRED
  HELD_FOR_SALE
}
```

---

### AssetDepreciation

**Purpose:** Records each depreciation charge per fixed asset per fiscal period. Generated by the depreciation run and posted as a journal entry. Append-only — re-running depreciation for a period requires reversing and reposting, not editing this record.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `fixedAsset FixedAsset`
- `fiscalPeriod FiscalPeriod`
- `journalEntry JournalEntry?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `fixedAssetId → FixedAsset.id` — `onDelete: Restrict, onUpdate: Cascade`
- `fiscalPeriodId → FiscalPeriod.id` — `onDelete: Restrict, onUpdate: Cascade`
- `journalEntryId → JournalEntry.id` — `onDelete: SetNull, onUpdate: Cascade`
- `createdById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, fixedAssetId, fiscalPeriodId])`

**Indexes:** `@@index([fiscalPeriodId])`, `@@index([journalEntryId])`

**Audit Fields:** `createdAt` only. Immutable.

```prisma
model AssetDepreciation {
  id                      String             @id @default(cuid()) @map("id")
  tenantId                String             @map("tenant_id")
  fixedAssetId            String             @map("fixed_asset_id")
  fiscalPeriodId          String             @map("fiscal_period_id")
  depreciationAmount      BigInt             @map("depreciation_amount")
  currency                String             @map("currency") @db.Char(3)
  bookValueBefore         BigInt             @map("book_value_before")
  bookValueAfter          BigInt             @map("book_value_after")
  accumulatedDepreciation BigInt             @map("accumulated_depreciation")
  depreciationMethod      DepreciationMethod @map("depreciation_method")
  journalEntryId          String?            @map("journal_entry_id")
  isPosted                Boolean            @default(false) @map("is_posted")
  postedAt                DateTime?          @map("posted_at")
  createdById             String             @map("created_by_id")
  createdAt               DateTime           @default(now()) @map("created_at")

  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  fixedAsset    FixedAsset    @relation(fields: [fixedAssetId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  fiscalPeriod  FiscalPeriod  @relation(fields: [fiscalPeriodId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  journalEntry  JournalEntry? @relation(fields: [journalEntryId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy     User          @relation("AssetDepreciationCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@unique([tenantId, fixedAssetId, fiscalPeriodId])
  @@index([fiscalPeriodId])
  @@index([journalEntryId])
  @@map("asset_depreciation")
}
```

---

### AccountBalance

**Purpose:** Stores computed opening balance, period activity, and closing balance per GL account per fiscal period. Populated by the period-close process. `isFinalized = true` when the period is closed and the balance is locked. Rows with `costCenterId = null` represent account totals across all cost centers.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `account ChartOfAccount`
- `fiscalPeriod FiscalPeriod`
- `costCenter CostCenter?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `accountId → ChartOfAccount.id` — `onDelete: Restrict, onUpdate: Cascade`
- `fiscalPeriodId → FiscalPeriod.id` — `onDelete: Restrict, onUpdate: Cascade`
- `costCenterId → CostCenter.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, accountId, fiscalPeriodId, costCenterId])`

**Indexes:** `@@index([fiscalPeriodId])`, `@@index([accountId])`

**Audit Fields:** `createdAt`, `updatedAt` only. Written by the system close process, not by users directly.

```prisma
model AccountBalance {
  id                  String         @id @default(cuid()) @map("id")
  tenantId            String         @map("tenant_id")
  accountId           String         @map("account_id")
  fiscalPeriodId      String         @map("fiscal_period_id")
  costCenterId        String?        @map("cost_center_id")
  currency            String         @map("currency") @db.Char(3)
  openingDebitAmount  BigInt         @default(0) @map("opening_debit_amount")
  openingCreditAmount BigInt         @default(0) @map("opening_credit_amount")
  periodDebitAmount   BigInt         @default(0) @map("period_debit_amount")
  periodCreditAmount  BigInt         @default(0) @map("period_credit_amount")
  closingDebitAmount  BigInt         @default(0) @map("closing_debit_amount")
  closingCreditAmount BigInt         @default(0) @map("closing_credit_amount")
  netBalanceAmount    BigInt         @default(0) @map("net_balance_amount")
  isFinalized         Boolean        @default(false) @map("is_finalized")
  computedAt          DateTime       @map("computed_at")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  tenant       Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  account      ChartOfAccount @relation(fields: [accountId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  fiscalPeriod FiscalPeriod   @relation(fields: [fiscalPeriodId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  costCenter   CostCenter?    @relation(fields: [costCenterId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, accountId, fiscalPeriodId, costCenterId])
  @@index([fiscalPeriodId])
  @@index([accountId])
  @@map("account_balance")
}
```

---

## 18. Product & Catalog Models

Core product catalog supporting multi-tenant SKU management, variant tracking, and flexible price lists. `Product` is the master record; `ProductVariant` holds sellable units with their own SKUs. `PriceList` / `PriceListItem` decouple pricing from the product definition.

### ProductCategory

**Purpose:** Hierarchical category tree for organizing products. Self-referential via `parentId`; root nodes have `parentId = null`. `path` stores the materialized ancestry string (e.g. `root/electronics/phones`) for efficient subtree queries.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `parent ProductCategory?`
- `children ProductCategory[]`
- `products Product[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `parentId → ProductCategory.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, slug])`

**Indexes:** `@@index([tenantId, parentId])`, `@@index([tenantId, path])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model ProductCategory {
  id          String    @id @default(cuid()) @map("id")
  tenantId    String    @map("tenant_id")
  parentId    String?   @map("parent_id")
  name        String    @map("name") @db.VarChar(200)
  slug        String    @map("slug") @db.VarChar(220)
  path        String    @map("path") @db.VarChar(1000)
  description String?   @map("description") @db.Text
  sortOrder   Int       @default(0) @map("sort_order")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  createdById String    @map("created_by_id")
  updatedById String    @map("updated_by_id")
  deletedAt   DateTime? @map("deleted_at")
  deletedById String?   @map("deleted_by_id")

  tenant    Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  parent    ProductCategory?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  children  ProductCategory[] @relation("CategoryTree")
  products  Product[]
  createdBy User              @relation("ProductCategoryCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User              @relation("ProductCategoryUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?             @relation("ProductCategoryDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, slug])
  @@index([tenantId, parentId])
  @@index([tenantId, path])
  @@map("product_category")
}
```

---

### Product

**Purpose:** Master product record. `type` distinguishes physical goods, digital downloads, and services. `sku` is the tenant-scoped master SKU; variants carry their own SKUs. All monetary defaults (e.g. base price) are stored in minor units as `BigInt`.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `category ProductCategory?`
- `variants ProductVariant[]`
- `priceListItems PriceListItem[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `categoryId → ProductCategory.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, sku])`

**Indexes:** `@@index([tenantId, categoryId])`, `@@index([tenantId, type])`, `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum ProductType {
  PHYSICAL
  DIGITAL
  SERVICE
  BUNDLE
}

enum ProductStatus {
  DRAFT
  ACTIVE
  DISCONTINUED
}
```

```prisma
model Product {
  id              String        @id @default(cuid()) @map("id")
  tenantId        String        @map("tenant_id")
  categoryId      String?       @map("category_id")
  sku             String        @map("sku") @db.VarChar(100)
  name            String        @map("name") @db.VarChar(500)
  description     String?       @map("description") @db.Text
  type            ProductType   @default(PHYSICAL) @map("type")
  status          ProductStatus @default(DRAFT) @map("status")
  isActive        Boolean       @default(true) @map("is_active")
  isSellable      Boolean       @default(true) @map("is_sellable")
  isPurchasable   Boolean       @default(true) @map("is_purchasable")
  currency        String        @map("currency") @db.Char(3)
  basePriceAmount BigInt        @default(0) @map("base_price_amount")
  costAmount      BigInt        @default(0) @map("cost_amount")
  taxRateId       String?       @map("tax_rate_id")
  unitOfMeasure   String        @map("unit_of_measure") @db.VarChar(50)
  barcode         String?       @map("barcode") @db.VarChar(100)
  weight          Decimal?      @map("weight") @db.Decimal(10, 4)
  weightUnit      String?       @map("weight_unit") @db.VarChar(10)
  metadata        Json          @default("{}") @map("metadata")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  createdById     String        @map("created_by_id")
  updatedById     String        @map("updated_by_id")
  deletedAt       DateTime?     @map("deleted_at")
  deletedById     String?       @map("deleted_by_id")

  tenant         Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  category       ProductCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  taxRate        TaxRate?         @relation(fields: [taxRateId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  variants       ProductVariant[]
  priceListItems PriceListItem[]
  createdBy      User             @relation("ProductCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy      User             @relation("ProductUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy      User?            @relation("ProductDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, sku])
  @@index([tenantId, categoryId])
  @@index([tenantId, type])
  @@index([tenantId, isActive])
  @@map("product")
}
```

---

### ProductVariant

**Purpose:** Sellable unit of a product distinguished by one or more attribute values (size, colour, etc.). Each variant has its own `sku`, optional override price, and optional barcode. When a product has no meaningful variants a single default variant is created automatically.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `product Product`
- `priceListItems PriceListItem[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `productId → Product.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, sku])`

**Indexes:** `@@index([tenantId, productId])`, `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model ProductVariant {
  id                  String    @id @default(cuid()) @map("id")
  tenantId            String    @map("tenant_id")
  productId           String    @map("product_id")
  sku                 String    @map("sku") @db.VarChar(100)
  name                String    @map("name") @db.VarChar(500)
  isDefault           Boolean   @default(false) @map("is_default")
  isActive            Boolean   @default(true) @map("is_active")
  barcode             String?   @map("barcode") @db.VarChar(100)
  attributes          Json      @default("{}") @map("attributes")
  priceOverrideAmount BigInt?   @map("price_override_amount")
  costOverrideAmount  BigInt?   @map("cost_override_amount")
  weight              Decimal?  @map("weight") @db.Decimal(10, 4)
  weightUnit          String?   @map("weight_unit") @db.VarChar(10)
  sortOrder           Int       @default(0) @map("sort_order")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  createdById         String    @map("created_by_id")
  updatedById         String    @map("updated_by_id")
  deletedAt           DateTime? @map("deleted_at")
  deletedById         String?   @map("deleted_by_id")

  tenant         Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  product        Product         @relation(fields: [productId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  priceListItems PriceListItem[]
  createdBy      User            @relation("ProductVariantCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy      User            @relation("ProductVariantUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy      User?           @relation("ProductVariantDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, sku])
  @@index([tenantId, productId])
  @@index([tenantId, isActive])
  @@map("product_variant")
}
```

---

### PriceList

**Purpose:** Named price list (e.g. Retail, Wholesale, VIP). `isDefault = true` marks the fallback list used when no explicit list is assigned to a customer or order. Only one default per tenant is enforced at the application layer.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `items PriceListItem[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code])`

**Indexes:** `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model PriceList {
  id          String    @id @default(cuid()) @map("id")
  tenantId    String    @map("tenant_id")
  code        String    @map("code") @db.VarChar(100)
  name        String    @map("name") @db.VarChar(200)
  description String?   @map("description") @db.Text
  currency    String    @map("currency") @db.Char(3)
  isDefault   Boolean   @default(false) @map("is_default")
  isActive    Boolean   @default(true) @map("is_active")
  validFrom   DateTime? @map("valid_from")
  validTo     DateTime? @map("valid_to")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  createdById String    @map("created_by_id")
  updatedById String    @map("updated_by_id")
  deletedAt   DateTime? @map("deleted_at")
  deletedById String?   @map("deleted_by_id")

  tenant    Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  items     PriceListItem[]
  createdBy User            @relation("PriceListCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User            @relation("PriceListUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?           @relation("PriceListDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, code])
  @@index([tenantId, isActive])
  @@map("price_list")
}
```

---

### PriceListItem

**Purpose:** Unit price for a product or specific variant within a price list. When `variantId` is set it overrides the product-level price. `minQuantity` enables tier pricing by requiring multiple rows per product/price-list pair with ascending quantities.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `priceList PriceList`
- `product Product`
- `variant ProductVariant?`
- `createdBy User`, `updatedBy User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `priceListId → PriceList.id` — `onDelete: Cascade, onUpdate: Cascade`
- `productId → Product.id` — `onDelete: Restrict, onUpdate: Cascade`
- `variantId → ProductVariant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([priceListId, productId, variantId, minQuantity])`

**Indexes:** `@@index([tenantId, priceListId])`, `@@index([tenantId, productId])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`.

```prisma
model PriceListItem {
  id          String   @id @default(cuid()) @map("id")
  tenantId    String   @map("tenant_id")
  priceListId String   @map("price_list_id")
  productId   String   @map("product_id")
  variantId   String?  @map("variant_id")
  currency    String   @map("currency") @db.Char(3)
  amount      BigInt   @map("amount")
  minQuantity Decimal  @default(1) @map("min_quantity") @db.Decimal(14, 4)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  createdById String   @map("created_by_id")
  updatedById String   @map("updated_by_id")

  tenant    Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  priceList PriceList       @relation(fields: [priceListId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  product   Product         @relation(fields: [productId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  variant   ProductVariant? @relation(fields: [variantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy User            @relation("PriceListItemCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User            @relation("PriceListItemUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@unique([priceListId, productId, variantId, minQuantity])
  @@index([tenantId, priceListId])
  @@index([tenantId, productId])
  @@map("price_list_item")
}
```

---

## 19. Purchasing Models

Supplier master, purchase orders, and goods receipt. `Supplier` is the vendor record. `PurchaseOrder` tracks procurement intent; `PurchaseOrderLine` references `Product` / `ProductVariant`. `PurchaseReceipt` records physical goods arrival against a PO; `PurchaseReceiptLine` captures received quantities per line.

### Supplier

**Purpose:** Vendor master record. `code` is the tenant-scoped internal supplier code. `paymentTermsDays` is the net payment window in calendar days. `currency` is the default ordering currency negotiated with the supplier.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `contacts SupplierContact[]`
- `purchaseOrders PurchaseOrder[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code])`

**Indexes:** `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum SupplierStatus {
  ACTIVE
  INACTIVE
  BLOCKED
}
```

```prisma
model Supplier {
  id               String         @id @default(cuid()) @map("id")
  tenantId         String         @map("tenant_id")
  code             String         @map("code") @db.VarChar(100)
  name             String         @map("name") @db.VarChar(500)
  legalName        String?        @map("legal_name") @db.VarChar(500)
  status           SupplierStatus @default(ACTIVE) @map("status")
  isActive         Boolean        @default(true) @map("is_active")
  currency         String         @map("currency") @db.Char(3)
  paymentTermsDays Int            @default(30) @map("payment_terms_days")
  taxId            String?        @map("tax_id") @db.VarChar(100)
  email            String?        @map("email") @db.VarChar(320)
  phone            String?        @map("phone") @db.VarChar(50)
  website          String?        @map("website") @db.VarChar(500)
  addressLine1     String?        @map("address_line1") @db.VarChar(255)
  addressLine2     String?        @map("address_line2") @db.VarChar(255)
  city             String?        @map("city") @db.VarChar(100)
  stateProvince    String?        @map("state_province") @db.VarChar(100)
  postalCode       String?        @map("postal_code") @db.VarChar(20)
  countryCode      String?        @map("country_code") @db.Char(2)
  notes            String?        @map("notes") @db.Text
  metadata         Json           @default("{}") @map("metadata")
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")
  createdById      String         @map("created_by_id")
  updatedById      String         @map("updated_by_id")
  deletedAt        DateTime?      @map("deleted_at")
  deletedById      String?        @map("deleted_by_id")

  tenant         Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  contacts       SupplierContact[]
  purchaseOrders PurchaseOrder[]
  createdBy      User            @relation("SupplierCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy      User            @relation("SupplierUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy      User?           @relation("SupplierDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, code])
  @@index([tenantId, isActive])
  @@map("supplier")
}
```

---

### SupplierContact

**Purpose:** Named contact person at a supplier. `isPrimary = true` designates the default contact for ordering. Only one primary contact per supplier is enforced at the application layer.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `supplier Supplier`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `supplierId → Supplier.id` — `onDelete: Cascade, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, supplierId])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model SupplierContact {
  id          String    @id @default(cuid()) @map("id")
  tenantId    String    @map("tenant_id")
  supplierId  String    @map("supplier_id")
  firstName   String    @map("first_name") @db.VarChar(100)
  lastName    String    @map("last_name") @db.VarChar(100)
  jobTitle    String?   @map("job_title") @db.VarChar(200)
  email       String?   @map("email") @db.VarChar(320)
  phone       String?   @map("phone") @db.VarChar(50)
  isPrimary   Boolean   @default(false) @map("is_primary")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  createdById String    @map("created_by_id")
  updatedById String    @map("updated_by_id")
  deletedAt   DateTime? @map("deleted_at")
  deletedById String?   @map("deleted_by_id")

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  supplier  Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  createdBy User     @relation("SupplierContactCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User     @relation("SupplierContactUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?    @relation("SupplierContactDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, supplierId])
  @@map("supplier_contact")
}
```

---

### PurchaseOrder

**Purpose:** Procurement order sent to a supplier. `number` is the tenant-scoped human-readable PO reference. `expectedDeliveryDate` is the agreed delivery date. All monetary totals are in minor units as `BigInt`. `status` drives the procurement workflow; only `DRAFT` orders are editable.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `supplier Supplier`
- `lines PurchaseOrderLine[]`
- `receipts PurchaseReceipt[]`
- `approvedBy User?`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `supplierId → Supplier.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, number])`

**Indexes:** `@@index([tenantId, supplierId])`, `@@index([tenantId, status])`, `@@index([tenantId, expectedDeliveryDate])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum PurchaseOrderStatus {
  DRAFT
  SUBMITTED
  APPROVED
  PARTIALLY_RECEIVED
  RECEIVED
  CANCELLED
  CLOSED
}
```

```prisma
model PurchaseOrder {
  id                   String              @id @default(cuid()) @map("id")
  tenantId             String              @map("tenant_id")
  supplierId           String              @map("supplier_id")
  number               String              @map("number") @db.VarChar(100)
  status               PurchaseOrderStatus @default(DRAFT) @map("status")
  currency             String              @map("currency") @db.Char(3)
  subtotalAmount       BigInt              @default(0) @map("subtotal_amount")
  taxAmount            BigInt              @default(0) @map("tax_amount")
  shippingAmount       BigInt              @default(0) @map("shipping_amount")
  totalAmount          BigInt              @default(0) @map("total_amount")
  notes                String?             @map("notes") @db.Text
  supplierReference    String?             @map("supplier_reference") @db.VarChar(200)
  expectedDeliveryDate DateTime?           @map("expected_delivery_date") @db.Date
  approvedAt           DateTime?           @map("approved_at")
  approvedById         String?             @map("approved_by_id")
  submittedAt          DateTime?           @map("submitted_at")
  cancelledAt          DateTime?           @map("cancelled_at")
  metadata             Json                @default("{}") @map("metadata")
  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")
  createdById          String              @map("created_by_id")
  updatedById          String              @map("updated_by_id")
  deletedAt            DateTime?           @map("deleted_at")
  deletedById          String?             @map("deleted_by_id")

  tenant      Tenant               @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  supplier    Supplier             @relation(fields: [supplierId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  approvedBy  User?                @relation("PurchaseOrderApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  lines       PurchaseOrderLine[]
  receipts    PurchaseReceipt[]
  createdBy   User                 @relation("PurchaseOrderCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy   User                 @relation("PurchaseOrderUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy   User?                @relation("PurchaseOrderDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, number])
  @@index([tenantId, supplierId])
  @@index([tenantId, status])
  @@index([tenantId, expectedDeliveryDate])
  @@map("purchase_order")
}
```

---

### PurchaseOrderLine

**Purpose:** Single line on a purchase order referencing a product and optional variant. `orderedQuantity` is what was requested; `receivedQuantity` is updated incrementally as receipts are posted. `unitCostAmount` is the agreed cost per unit in minor units.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `purchaseOrder PurchaseOrder`
- `product Product`
- `variant ProductVariant?`
- `receiptLines PurchaseReceiptLine[]`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `purchaseOrderId → PurchaseOrder.id` — `onDelete: Restrict, onUpdate: Cascade`
- `productId → Product.id` — `onDelete: Restrict, onUpdate: Cascade`
- `variantId → ProductVariant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, purchaseOrderId])`, `@@index([tenantId, productId])`

**Audit Fields:** `createdAt`, `updatedAt`.

```prisma
model PurchaseOrderLine {
  id                String          @id @default(cuid()) @map("id")
  tenantId          String          @map("tenant_id")
  purchaseOrderId   String          @map("purchase_order_id")
  productId         String          @map("product_id")
  variantId         String?         @map("variant_id")
  description       String?         @map("description") @db.VarChar(500)
  orderedQuantity   Decimal         @map("ordered_quantity") @db.Decimal(14, 4)
  receivedQuantity  Decimal         @default(0) @map("received_quantity") @db.Decimal(14, 4)
  unitOfMeasure     String          @map("unit_of_measure") @db.VarChar(50)
  unitCostAmount    BigInt          @map("unit_cost_amount")
  taxAmount         BigInt          @default(0) @map("tax_amount")
  totalAmount       BigInt          @map("total_amount")
  taxRateId         String?         @map("tax_rate_id")
  sortOrder         Int             @default(0) @map("sort_order")
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")

  tenant         Tenant               @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  purchaseOrder  PurchaseOrder        @relation(fields: [purchaseOrderId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  product        Product              @relation(fields: [productId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  variant        ProductVariant?      @relation(fields: [variantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  taxRate        TaxRate?             @relation(fields: [taxRateId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  receiptLines   PurchaseReceiptLine[]

  @@index([tenantId, purchaseOrderId])
  @@index([tenantId, productId])
  @@map("purchase_order_line")
}
```

---

### PurchaseReceipt

**Purpose:** Goods-received note (GRN) recording a physical delivery against a purchase order. A PO may have multiple partial receipts. `receivedAt` is the actual date goods arrived at the warehouse.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `purchaseOrder PurchaseOrder`
- `lines PurchaseReceiptLine[]`
- `receivedBy User`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `purchaseOrderId → PurchaseOrder.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, number])`

**Indexes:** `@@index([tenantId, purchaseOrderId])`, `@@index([tenantId, receivedAt])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum PurchaseReceiptStatus {
  DRAFT
  POSTED
  CANCELLED
}
```

```prisma
model PurchaseReceipt {
  id              String                @id @default(cuid()) @map("id")
  tenantId        String                @map("tenant_id")
  purchaseOrderId String                @map("purchase_order_id")
  number          String                @map("number") @db.VarChar(100)
  status          PurchaseReceiptStatus @default(DRAFT) @map("status")
  receivedAt      DateTime              @map("received_at") @db.Date
  receivedById    String                @map("received_by_id")
  carrierName     String?               @map("carrier_name") @db.VarChar(200)
  trackingNumber  String?               @map("tracking_number") @db.VarChar(200)
  notes           String?               @map("notes") @db.Text
  createdAt       DateTime              @default(now()) @map("created_at")
  updatedAt       DateTime              @updatedAt @map("updated_at")
  createdById     String                @map("created_by_id")
  updatedById     String                @map("updated_by_id")
  deletedAt       DateTime?             @map("deleted_at")
  deletedById     String?               @map("deleted_by_id")

  tenant        Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  purchaseOrder PurchaseOrder         @relation(fields: [purchaseOrderId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  receivedBy    User                  @relation("PurchaseReceiptReceivedBy", fields: [receivedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  lines         PurchaseReceiptLine[]
  createdBy     User                  @relation("PurchaseReceiptCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy     User                  @relation("PurchaseReceiptUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy     User?                 @relation("PurchaseReceiptDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, number])
  @@index([tenantId, purchaseOrderId])
  @@index([tenantId, receivedAt])
  @@map("purchase_receipt")
}
```

---

### PurchaseReceiptLine

**Purpose:** Individual received quantity for a single `PurchaseOrderLine`. `acceptedQuantity` is goods accepted into stock; `rejectedQuantity` is goods rejected (damaged, wrong item). `acceptedQuantity + rejectedQuantity` must equal the posted receipt quantity — enforced at the application layer.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `purchaseReceipt PurchaseReceipt`
- `purchaseOrderLine PurchaseOrderLine`
- `product Product`
- `variant ProductVariant?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `purchaseReceiptId → PurchaseReceipt.id` — `onDelete: Restrict, onUpdate: Cascade`
- `purchaseOrderLineId → PurchaseOrderLine.id` — `onDelete: Restrict, onUpdate: Cascade`
- `productId → Product.id` — `onDelete: Restrict, onUpdate: Cascade`
- `variantId → ProductVariant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, purchaseReceiptId])`, `@@index([tenantId, purchaseOrderLineId])`

**Audit Fields:** `createdAt`, `updatedAt`.

```prisma
model PurchaseReceiptLine {
  id                  String   @id @default(cuid()) @map("id")
  tenantId            String   @map("tenant_id")
  purchaseReceiptId   String   @map("purchase_receipt_id")
  purchaseOrderLineId String   @map("purchase_order_line_id")
  productId           String   @map("product_id")
  variantId           String?  @map("variant_id")
  acceptedQuantity    Decimal  @map("accepted_quantity") @db.Decimal(14, 4)
  rejectedQuantity    Decimal  @default(0) @map("rejected_quantity") @db.Decimal(14, 4)
  unitOfMeasure       String   @map("unit_of_measure") @db.VarChar(50)
  rejectionReason     String?  @map("rejection_reason") @db.VarChar(500)
  notes               String?  @map("notes") @db.Text
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  tenant            Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  purchaseReceipt   PurchaseReceipt   @relation(fields: [purchaseReceiptId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  purchaseOrderLine PurchaseOrderLine @relation(fields: [purchaseOrderLineId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  product           Product           @relation(fields: [productId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  variant           ProductVariant?   @relation(fields: [variantId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@index([tenantId, purchaseReceiptId])
  @@index([tenantId, purchaseOrderLineId])
  @@map("purchase_receipt_line")
}
```

---

## 20. Inventory Models

Warehouse hierarchy, running stock levels, and the immutable stock movement ledger. `Warehouse` → `WarehouseLocation` form the physical hierarchy. `StockLevel` holds the live balance per variant per location. `StockMovement` is the append-only ledger; every quantity change writes a row here. `StockAdjustment` groups manual corrections (cycle counts, write-offs).

### Warehouse

**Purpose:** Physical storage site. `code` is the tenant-scoped identifier. `isDefault = true` marks the warehouse used when no explicit location is specified on an order or receipt.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `locations WarehouseLocation[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code])`

**Indexes:** `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Warehouse {
  id           String    @id @default(cuid()) @map("id")
  tenantId     String    @map("tenant_id")
  code         String    @map("code") @db.VarChar(100)
  name         String    @map("name") @db.VarChar(200)
  isDefault    Boolean   @default(false) @map("is_default")
  isActive     Boolean   @default(true) @map("is_active")
  addressLine1 String?   @map("address_line1") @db.VarChar(255)
  addressLine2 String?   @map("address_line2") @db.VarChar(255)
  city         String?   @map("city") @db.VarChar(100)
  stateProvince String?  @map("state_province") @db.VarChar(100)
  postalCode   String?   @map("postal_code") @db.VarChar(20)
  countryCode  String?   @map("country_code") @db.Char(2)
  notes        String?   @map("notes") @db.Text
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  createdById  String    @map("created_by_id")
  updatedById  String    @map("updated_by_id")
  deletedAt    DateTime? @map("deleted_at")
  deletedById  String?   @map("deleted_by_id")

  tenant    Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  locations WarehouseLocation[]
  createdBy User                @relation("WarehouseCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User                @relation("WarehouseUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?               @relation("WarehouseDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, code])
  @@index([tenantId, isActive])
  @@map("warehouse")
}
```

---

### WarehouseLocation

**Purpose:** Bin, shelf, or rack within a warehouse. `code` is the tenant-scoped bin identifier (e.g. `A-01-03`). `locationType` distinguishes receiving docks, bulk storage, pick faces, and quarantine areas. Locations marked `isPickable = false` cannot be allocated to outbound orders.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `warehouse Warehouse`
- `stockLevels StockLevel[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `warehouseId → Warehouse.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, warehouseId, code])`

**Indexes:** `@@index([tenantId, warehouseId])`, `@@index([tenantId, locationType])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum WarehouseLocationType {
  RECEIVING
  STORAGE
  PICK_FACE
  BULK
  QUARANTINE
  DISPATCH
}
```

```prisma
model WarehouseLocation {
  id           String                @id @default(cuid()) @map("id")
  tenantId     String                @map("tenant_id")
  warehouseId  String                @map("warehouse_id")
  code         String                @map("code") @db.VarChar(100)
  name         String?               @map("name") @db.VarChar(200)
  locationType WarehouseLocationType @default(STORAGE) @map("location_type")
  isPickable   Boolean               @default(true) @map("is_pickable")
  isActive     Boolean               @default(true) @map("is_active")
  sortOrder    Int                   @default(0) @map("sort_order")
  createdAt    DateTime              @default(now()) @map("created_at")
  updatedAt    DateTime              @updatedAt @map("updated_at")
  createdById  String                @map("created_by_id")
  updatedById  String                @map("updated_by_id")
  deletedAt    DateTime?             @map("deleted_at")
  deletedById  String?               @map("deleted_by_id")

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  warehouse   Warehouse    @relation(fields: [warehouseId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  stockLevels StockLevel[]
  createdBy   User         @relation("WarehouseLocationCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy   User         @relation("WarehouseLocationUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy   User?        @relation("WarehouseLocationDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, warehouseId, code])
  @@index([tenantId, warehouseId])
  @@index([tenantId, locationType])
  @@map("warehouse_location")
}
```

---

### StockLevel

**Purpose:** Running stock balance per product variant per warehouse location. `onHandQty` is the physical count. `reservedQty` is quantity allocated to unfulfilled orders. `availableQty` is a stored computed column kept in sync by the application (`onHandQty - reservedQty`). All quantities use `Decimal(14,4)` to support fractional units of measure.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `location WarehouseLocation`
- `product Product`
- `variant ProductVariant?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `locationId → WarehouseLocation.id` — `onDelete: Restrict, onUpdate: Cascade`
- `productId → Product.id` — `onDelete: Restrict, onUpdate: Cascade`
- `variantId → ProductVariant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([locationId, productId, variantId])`

**Indexes:** `@@index([tenantId, productId])`, `@@index([tenantId, locationId])`

**Audit Fields:** `updatedAt` only. Written exclusively by the inventory service; no user audit trail.

```prisma
model StockLevel {
  id            String          @id @default(cuid()) @map("id")
  tenantId      String          @map("tenant_id")
  locationId    String          @map("location_id")
  productId     String          @map("product_id")
  variantId     String?         @map("variant_id")
  unitOfMeasure String          @map("unit_of_measure") @db.VarChar(50)
  onHandQty     Decimal         @default(0) @map("on_hand_qty") @db.Decimal(14, 4)
  reservedQty   Decimal         @default(0) @map("reserved_qty") @db.Decimal(14, 4)
  availableQty  Decimal         @default(0) @map("available_qty") @db.Decimal(14, 4)
  reorderPoint  Decimal?        @map("reorder_point") @db.Decimal(14, 4)
  reorderQty    Decimal?        @map("reorder_qty") @db.Decimal(14, 4)
  updatedAt     DateTime        @updatedAt @map("updated_at")

  tenant   Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  location WarehouseLocation @relation(fields: [locationId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  product  Product           @relation(fields: [productId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  variant  ProductVariant?   @relation(fields: [variantId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@unique([locationId, productId, variantId])
  @@index([tenantId, productId])
  @@index([tenantId, locationId])
  @@map("stock_level")
}
```

---

### StockMovement

**Purpose:** Immutable ledger entry for every quantity change. Never updated or deleted after posting. `movementType` identifies the source operation. `referenceType` + `referenceId` are a polymorphic pointer to the originating document (e.g. `PURCHASE_RECEIPT` / receipt id, `ORDER` / order id). `qty` is always positive; direction is encoded in `movementType`. `runningBalance` is the location+variant balance after this movement, snapshotted at write time for audit.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `location WarehouseLocation`
- `product Product`
- `variant ProductVariant?`
- `createdBy User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `locationId → WarehouseLocation.id` — `onDelete: Restrict, onUpdate: Cascade`
- `productId → Product.id` — `onDelete: Restrict, onUpdate: Cascade`
- `variantId → ProductVariant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, productId, locationId])`, `@@index([tenantId, movementType])`, `@@index([tenantId, referenceType, referenceId])`, `@@index([tenantId, occurredAt])`

**Audit Fields:** `createdAt`, `createdById`. No `updatedAt` — rows are immutable.

**Enums:**
```prisma
enum StockMovementType {
  PURCHASE_RECEIPT
  PURCHASE_RETURN
  SALE_DISPATCH
  SALE_RETURN
  TRANSFER_OUT
  TRANSFER_IN
  ADJUSTMENT_IN
  ADJUSTMENT_OUT
  OPENING_BALANCE
}
```

```prisma
model StockMovement {
  id             String            @id @default(cuid()) @map("id")
  tenantId       String            @map("tenant_id")
  locationId     String            @map("location_id")
  productId      String            @map("product_id")
  variantId      String?           @map("variant_id")
  movementType   StockMovementType @map("movement_type")
  referenceType  String?           @map("reference_type") @db.VarChar(100)
  referenceId    String?           @map("reference_id")
  qty            Decimal           @map("qty") @db.Decimal(14, 4)
  unitOfMeasure  String            @map("unit_of_measure") @db.VarChar(50)
  unitCostAmount BigInt?           @map("unit_cost_amount")
  runningBalance Decimal           @map("running_balance") @db.Decimal(14, 4)
  occurredAt     DateTime          @map("occurred_at")
  notes          String?           @map("notes") @db.Text
  createdAt      DateTime          @default(now()) @map("created_at")
  createdById    String            @map("created_by_id")

  tenant    Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  location  WarehouseLocation @relation(fields: [locationId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  product   Product           @relation(fields: [productId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  variant   ProductVariant?   @relation(fields: [variantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy User              @relation("StockMovementCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@index([tenantId, productId, locationId])
  @@index([tenantId, movementType])
  @@index([tenantId, referenceType, referenceId])
  @@index([tenantId, occurredAt])
  @@map("stock_movement")
}
```

---

### StockAdjustment

**Purpose:** Header record for a manual stock correction session (cycle count, write-off, opening balance entry). Each adjustment posts one `StockMovement` row per line. `status = POSTED` is terminal; posted adjustments cannot be edited.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `warehouse Warehouse`
- `lines StockAdjustmentLine[]`
- `approvedBy User?`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `warehouseId → Warehouse.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, number])`

**Indexes:** `@@index([tenantId, warehouseId])`, `@@index([tenantId, status])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum StockAdjustmentStatus {
  DRAFT
  POSTED
  CANCELLED
}

enum StockAdjustmentReason {
  CYCLE_COUNT
  WRITE_OFF
  WRITE_UP
  OPENING_BALANCE
  DAMAGED
  THEFT
  OTHER
}
```

```prisma
model StockAdjustment {
  id           String                @id @default(cuid()) @map("id")
  tenantId     String                @map("tenant_id")
  warehouseId  String                @map("warehouse_id")
  number       String                @map("number") @db.VarChar(100)
  status       StockAdjustmentStatus @default(DRAFT) @map("status")
  reason       StockAdjustmentReason @map("reason")
  notes        String?               @map("notes") @db.Text
  adjustedAt   DateTime              @map("adjusted_at") @db.Date
  approvedAt   DateTime?             @map("approved_at")
  approvedById String?               @map("approved_by_id")
  postedAt     DateTime?             @map("posted_at")
  createdAt    DateTime              @default(now()) @map("created_at")
  updatedAt    DateTime              @updatedAt @map("updated_at")
  createdById  String                @map("created_by_id")
  updatedById  String                @map("updated_by_id")
  deletedAt    DateTime?             @map("deleted_at")
  deletedById  String?               @map("deleted_by_id")

  tenant      Tenant               @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  warehouse   Warehouse            @relation(fields: [warehouseId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  approvedBy  User?                @relation("StockAdjustmentApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  lines       StockAdjustmentLine[]
  createdBy   User                 @relation("StockAdjustmentCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy   User                 @relation("StockAdjustmentUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy   User?                @relation("StockAdjustmentDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, number])
  @@index([tenantId, warehouseId])
  @@index([tenantId, status])
  @@map("stock_adjustment")
}
```

---

### StockAdjustmentLine

**Purpose:** Single line within a stock adjustment specifying the product/variant, location, and quantity delta. `systemQty` is the balance recorded in `StockLevel` before the count; `countedQty` is what was physically found; `adjustmentQty` is the signed delta posted to `StockMovement` (`countedQty - systemQty`).

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `stockAdjustment StockAdjustment`
- `location WarehouseLocation`
- `product Product`
- `variant ProductVariant?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `stockAdjustmentId → StockAdjustment.id` — `onDelete: Restrict, onUpdate: Cascade`
- `locationId → WarehouseLocation.id` — `onDelete: Restrict, onUpdate: Cascade`
- `productId → Product.id` — `onDelete: Restrict, onUpdate: Cascade`
- `variantId → ProductVariant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, stockAdjustmentId])`, `@@index([tenantId, productId])`

**Audit Fields:** `createdAt`, `updatedAt`.

```prisma
model StockAdjustmentLine {
  id                String   @id @default(cuid()) @map("id")
  tenantId          String   @map("tenant_id")
  stockAdjustmentId String   @map("stock_adjustment_id")
  locationId        String   @map("location_id")
  productId         String   @map("product_id")
  variantId         String?  @map("variant_id")
  unitOfMeasure     String   @map("unit_of_measure") @db.VarChar(50)
  systemQty         Decimal  @map("system_qty") @db.Decimal(14, 4)
  countedQty        Decimal  @map("counted_qty") @db.Decimal(14, 4)
  adjustmentQty     Decimal  @map("adjustment_qty") @db.Decimal(14, 4)
  unitCostAmount    BigInt?  @map("unit_cost_amount")
  notes             String?  @map("notes") @db.Text
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  tenant          Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  stockAdjustment StockAdjustment   @relation(fields: [stockAdjustmentId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  location        WarehouseLocation @relation(fields: [locationId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  product         Product           @relation(fields: [productId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  variant         ProductVariant?   @relation(fields: [variantId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@index([tenantId, stockAdjustmentId])
  @@index([tenantId, productId])
  @@map("stock_adjustment_line")
}
```

---

## 21. Expenses Models

Employee expense claims and spend-policy enforcement. Distinct from the operational `Expense` model in §16 (vendor/business costs). `ExpensePolicy` defines per-category limits and approval thresholds. `ExpenseReport` is the claim header submitted by an employee; `ExpenseReportLine` captures individual receipts. `ExpenseCategory` in §16 is reused for categorisation; no new category model is introduced here.

### ExpensePolicy

**Purpose:** Named spend policy assigned to employees or roles. `requiresReceiptAboveAmount` sets the minor-unit threshold above which a receipt attachment is mandatory. `autoApproveBelow` sets the minor-unit threshold below which reports are auto-approved without a human reviewer.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `rules ExpensePolicyRule[]`
- `reports ExpenseReport[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code])`

**Indexes:** `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model ExpensePolicy {
  id                        String    @id @default(cuid()) @map("id")
  tenantId                  String    @map("tenant_id")
  code                      String    @map("code") @db.VarChar(100)
  name                      String    @map("name") @db.VarChar(200)
  description               String?   @map("description") @db.Text
  currency                  String    @map("currency") @db.Char(3)
  requiresReceiptAboveAmount BigInt   @default(0) @map("requires_receipt_above_amount")
  autoApproveBelowAmount    BigInt    @default(0) @map("auto_approve_below_amount")
  isActive                  Boolean   @default(true) @map("is_active")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")
  createdById               String    @map("created_by_id")
  updatedById               String    @map("updated_by_id")
  deletedAt                 DateTime? @map("deleted_at")
  deletedById               String?   @map("deleted_by_id")

  tenant    Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  rules     ExpensePolicyRule[]
  reports   ExpenseReport[]
  createdBy User                @relation("ExpensePolicyCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User                @relation("ExpensePolicyUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?               @relation("ExpensePolicyDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, code])
  @@index([tenantId, isActive])
  @@map("expense_policy")
}
```

---

### ExpensePolicyRule

**Purpose:** Per-category spending limit within an `ExpensePolicy`. `limitPerOccurrenceAmount` caps a single expense line; `limitPerPeriodAmount` caps total spend in that category over the policy's rolling `periodDays` window. `null` means no limit applies for that dimension.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `policy ExpensePolicy`
- `category ExpenseCategory`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `policyId → ExpensePolicy.id` — `onDelete: Cascade, onUpdate: Cascade`
- `categoryId → ExpenseCategory.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([policyId, categoryId])`

**Indexes:** `@@index([tenantId, policyId])`

**Audit Fields:** `createdAt`, `updatedAt`.

```prisma
model ExpensePolicyRule {
  id                        String   @id @default(cuid()) @map("id")
  tenantId                  String   @map("tenant_id")
  policyId                  String   @map("policy_id")
  categoryId                String   @map("category_id")
  limitPerOccurrenceAmount  BigInt?  @map("limit_per_occurrence_amount")
  limitPerPeriodAmount      BigInt?  @map("limit_per_period_amount")
  periodDays                Int?     @map("period_days")
  requiresReceipt           Boolean  @default(false) @map("requires_receipt")
  requiresNote              Boolean  @default(false) @map("requires_note")
  createdAt                 DateTime @default(now()) @map("created_at")
  updatedAt                 DateTime @updatedAt @map("updated_at")

  tenant   Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  policy   ExpensePolicy   @relation(fields: [policyId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  category ExpenseCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@unique([policyId, categoryId])
  @@index([tenantId, policyId])
  @@map("expense_policy_rule")
}
```

---

### ExpenseReport

**Purpose:** Employee expense claim grouping one or more receipt lines for reimbursement. `submittedById` is the claimant; `assignedApproverId` is the designated reviewer. `status` drives the approval workflow; `APPROVED` and `REJECTED` are terminal states. `totalAmount` is denormalised and kept in sync with line totals by the application.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `policy ExpensePolicy?`
- `lines ExpenseReportLine[]`
- `submittedBy User`
- `assignedApprover User?`
- `approvedBy User?`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `policyId → ExpensePolicy.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, number])`

**Indexes:** `@@index([tenantId, status])`, `@@index([tenantId, submittedById])`, `@@index([tenantId, assignedApproverId])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum ExpenseReportStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  PAID
}
```

```prisma
model ExpenseReport {
  id                  String              @id @default(cuid()) @map("id")
  tenantId            String              @map("tenant_id")
  number              String              @map("number") @db.VarChar(100)
  policyId            String?             @map("policy_id")
  status              ExpenseReportStatus @default(DRAFT) @map("status")
  title               String              @map("title") @db.VarChar(300)
  currency            String              @map("currency") @db.Char(3)
  totalAmount         BigInt              @default(0) @map("total_amount")
  submittedById       String              @map("submitted_by_id")
  assignedApproverId  String?             @map("assigned_approver_id")
  submittedAt         DateTime?           @map("submitted_at")
  reviewStartedAt     DateTime?           @map("review_started_at")
  approvedAt          DateTime?           @map("approved_at")
  approvedById        String?             @map("approved_by_id")
  rejectedAt          DateTime?           @map("rejected_at")
  rejectionReason     String?             @map("rejection_reason") @db.Text
  paidAt              DateTime?           @map("paid_at")
  notes               String?             @map("notes") @db.Text
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")
  createdById         String              @map("created_by_id")
  updatedById         String              @map("updated_by_id")
  deletedAt           DateTime?           @map("deleted_at")
  deletedById         String?             @map("deleted_by_id")

  tenant           Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  policy           ExpensePolicy?      @relation(fields: [policyId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  submittedBy      User                @relation("ExpenseReportSubmittedBy", fields: [submittedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  assignedApprover User?               @relation("ExpenseReportAssignedApprover", fields: [assignedApproverId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  approvedBy       User?               @relation("ExpenseReportApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  lines            ExpenseReportLine[]
  createdBy        User                @relation("ExpenseReportCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy        User                @relation("ExpenseReportUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy        User?               @relation("ExpenseReportDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, number])
  @@index([tenantId, status])
  @@index([tenantId, submittedById])
  @@index([tenantId, assignedApproverId])
  @@map("expense_report")
}
```

---

### ExpenseReportLine

**Purpose:** Single receipt or expense item within an `ExpenseReport`. `incurredAt` is the date the expense occurred. `receiptUrl` stores the uploaded attachment reference. `policyViolation` is set by the policy-check service when the line breaches a rule; a non-null value blocks auto-approval and flags the report for manual review.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `report ExpenseReport`
- `category ExpenseCategory`
- `taxRate TaxRate?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `reportId → ExpenseReport.id` — `onDelete: Restrict, onUpdate: Cascade`
- `categoryId → ExpenseCategory.id` — `onDelete: Restrict, onUpdate: Cascade`
- `taxRateId → TaxRate.id` — `onDelete: SetNull, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, reportId])`, `@@index([tenantId, categoryId])`

**Audit Fields:** `createdAt`, `updatedAt`.

```prisma
model ExpenseReportLine {
  id              String          @id @default(cuid()) @map("id")
  tenantId        String          @map("tenant_id")
  reportId        String          @map("report_id")
  categoryId      String          @map("category_id")
  taxRateId       String?         @map("tax_rate_id")
  description     String          @map("description") @db.VarChar(500)
  merchant        String?         @map("merchant") @db.VarChar(300)
  currency        String          @map("currency") @db.Char(3)
  amount          BigInt          @map("amount")
  taxAmount       BigInt          @default(0) @map("tax_amount")
  incurredAt      DateTime        @map("incurred_at") @db.Date
  receiptUrl      String?         @map("receipt_url") @db.VarChar(1000)
  policyViolation String?         @map("policy_violation") @db.VarChar(500)
  sortOrder       Int             @default(0) @map("sort_order")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  tenant   Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  report   ExpenseReport   @relation(fields: [reportId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  category ExpenseCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  taxRate  TaxRate?        @relation(fields: [taxRateId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, reportId])
  @@index([tenantId, categoryId])
  @@map("expense_report_line")
}
```

---

## 22. HR Models

Core people-management models: org structure, employee records, contracts, and leave management. `Department` provides the org hierarchy. `Employee` is the canonical HR record and may optionally link to a `User` account. `EmployeeContract` tracks employment terms and compensation. `LeaveType` / `LeaveBalance` / `LeaveRequest` cover the full time-off lifecycle.

### Department

**Purpose:** Organisational unit within the tenant. Self-referential via `parentId` for nested org charts. `managerId` points to the `Employee` who leads the department.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `parent Department?`
- `children Department[]`
- `manager Employee?`
- `employees Employee[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `parentId → Department.id` — `onDelete: Restrict, onUpdate: Cascade`
- `managerId → Employee.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code])`

**Indexes:** `@@index([tenantId, parentId])`, `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

```prisma
model Department {
  id          String    @id @default(cuid()) @map("id")
  tenantId    String    @map("tenant_id")
  parentId    String?   @map("parent_id")
  managerId   String?   @map("manager_id")
  code        String    @map("code") @db.VarChar(100)
  name        String    @map("name") @db.VarChar(200)
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  createdById String    @map("created_by_id")
  updatedById String    @map("updated_by_id")
  deletedAt   DateTime? @map("deleted_at")
  deletedById String?   @map("deleted_by_id")

  tenant    Tenant       @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  parent    Department?  @relation("DepartmentTree", fields: [parentId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  children  Department[] @relation("DepartmentTree")
  manager   Employee?    @relation("DepartmentManager", fields: [managerId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  employees Employee[]   @relation("DepartmentEmployees")
  createdBy User         @relation("DepartmentCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User         @relation("DepartmentUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?        @relation("DepartmentDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, code])
  @@index([tenantId, parentId])
  @@index([tenantId, isActive])
  @@map("department")
}
```

---

### Employee

**Purpose:** Canonical HR record for a person employed by the tenant. `userId` links to their system account when one exists; an employee may exist before a user account is provisioned. `managerId` is a self-reference for reporting-line hierarchy. `employeeNumber` is the tenant-scoped HR identifier.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `user User?`
- `department Department?`
- `manager Employee?`
- `directReports Employee[]`
- `contracts EmployeeContract[]`
- `leaveBalances LeaveBalance[]`
- `leaveRequests LeaveRequest[]`
- `managedDepartments Department[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `userId → User.id` — `onDelete: SetNull, onUpdate: Cascade`
- `departmentId → Department.id` — `onDelete: SetNull, onUpdate: Cascade`
- `managerId → Employee.id` — `onDelete: SetNull, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, employeeNumber])`, `@@unique([tenantId, userId])`

**Indexes:** `@@index([tenantId, departmentId])`, `@@index([tenantId, status])`, `@@index([tenantId, managerId])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum EmployeeStatus {
  ACTIVE
  ON_LEAVE
  SUSPENDED
  TERMINATED
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN
  CASUAL
}
```

```prisma
model Employee {
  id               String         @id @default(cuid()) @map("id")
  tenantId         String         @map("tenant_id")
  userId           String?        @map("user_id")
  departmentId     String?        @map("department_id")
  managerId        String?        @map("manager_id")
  employeeNumber   String         @map("employee_number") @db.VarChar(100)
  firstName        String         @map("first_name") @db.VarChar(100)
  lastName         String         @map("last_name") @db.VarChar(100)
  preferredName    String?        @map("preferred_name") @db.VarChar(100)
  email            String         @map("email") @db.VarChar(320)
  phone            String?        @map("phone") @db.VarChar(50)
  jobTitle         String?        @map("job_title") @db.VarChar(200)
  employmentType   EmploymentType @default(FULL_TIME) @map("employment_type")
  status           EmployeeStatus @default(ACTIVE) @map("status")
  hiredAt          DateTime       @map("hired_at") @db.Date
  terminatedAt     DateTime?      @map("terminated_at") @db.Date
  dateOfBirth      DateTime?      @map("date_of_birth") @db.Date
  nationalId       String?        @map("national_id") @db.VarChar(100)
  metadata         Json           @default("{}") @map("metadata")
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")
  createdById      String         @map("created_by_id")
  updatedById      String         @map("updated_by_id")
  deletedAt        DateTime?      @map("deleted_at")
  deletedById      String?        @map("deleted_by_id")

  tenant             Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  user               User?              @relation("EmployeeUser", fields: [userId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  department         Department?        @relation("DepartmentEmployees", fields: [departmentId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  manager            Employee?          @relation("EmployeeReports", fields: [managerId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  directReports      Employee[]         @relation("EmployeeReports")
  managedDepartments Department[]       @relation("DepartmentManager")
  contracts          EmployeeContract[]
  leaveBalances      LeaveBalance[]
  leaveRequests      LeaveRequest[]
  createdBy          User               @relation("EmployeeCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy          User               @relation("EmployeeUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy          User?              @relation("EmployeeDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, employeeNumber])
  @@unique([tenantId, userId])
  @@index([tenantId, departmentId])
  @@index([tenantId, status])
  @@index([tenantId, managerId])
  @@map("employee")
}
```

---

### EmployeeContract

**Purpose:** Employment contract record capturing terms and compensation for a period. Multiple contracts per employee are allowed for contract renewals and role changes. Only one contract should be `isCurrent = true` per employee at any time — enforced at the application layer. `salaryAmount` is the gross base salary in minor units for the stated `payFrequency`.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `employee Employee`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `employeeId → Employee.id` — `onDelete: Restrict, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, employeeId])`, `@@index([tenantId, isCurrent])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum PayFrequency {
  WEEKLY
  FORTNIGHTLY
  SEMI_MONTHLY
  MONTHLY
  ANNUAL
}

enum ContractType {
  PERMANENT
  FIXED_TERM
  CASUAL
  PROBATION
}
```

```prisma
model EmployeeContract {
  id              String       @id @default(cuid()) @map("id")
  tenantId        String       @map("tenant_id")
  employeeId      String       @map("employee_id")
  contractType    ContractType @map("contract_type")
  employmentType  EmploymentType @map("employment_type")
  jobTitle        String       @map("job_title") @db.VarChar(200)
  isCurrent       Boolean      @default(false) @map("is_current")
  startDate       DateTime     @map("start_date") @db.Date
  endDate         DateTime?    @map("end_date") @db.Date
  currency        String       @map("currency") @db.Char(3)
  salaryAmount    BigInt       @map("salary_amount")
  payFrequency    PayFrequency @map("pay_frequency")
  hoursPerWeek    Decimal?     @map("hours_per_week") @db.Decimal(5, 2)
  notes           String?      @map("notes") @db.Text
  signedAt        DateTime?    @map("signed_at") @db.Date
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")
  createdById     String       @map("created_by_id")
  updatedById     String       @map("updated_by_id")
  deletedAt       DateTime?    @map("deleted_at")
  deletedById     String?      @map("deleted_by_id")

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  employee  Employee @relation(fields: [employeeId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  createdBy User     @relation("EmployeeContractCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User     @relation("EmployeeContractUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?    @relation("EmployeeContractDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, employeeId])
  @@index([tenantId, isCurrent])
  @@map("employee_contract")
}
```

---

### LeaveType

**Purpose:** Catalogue of leave categories available within the tenant (annual leave, sick leave, parental leave, etc.). `accrualBasis` describes how entitlement accumulates. `isCarryOver` controls whether unused days roll into the next year. `maxCarryOverDays` caps the rollover when carry-over is enabled.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `balances LeaveBalance[]`
- `requests LeaveRequest[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code])`

**Indexes:** `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum LeaveAccrualBasis {
  ANNUAL_GRANT
  MONTHLY_ACCRUAL
  HOURLY_ACCRUAL
  UNLIMITED
}
```

```prisma
model LeaveType {
  id                String            @id @default(cuid()) @map("id")
  tenantId          String            @map("tenant_id")
  code              String            @map("code") @db.VarChar(100)
  name              String            @map("name") @db.VarChar(200)
  accrualBasis      LeaveAccrualBasis @map("accrual_basis")
  defaultDaysPerYear Decimal?         @map("default_days_per_year") @db.Decimal(6, 2)
  isCarryOver       Boolean           @default(false) @map("is_carry_over")
  maxCarryOverDays  Decimal?          @map("max_carry_over_days") @db.Decimal(6, 2)
  isPaid            Boolean           @default(true) @map("is_paid")
  requiresApproval  Boolean           @default(true) @map("requires_approval")
  isActive          Boolean           @default(true) @map("is_active")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")
  createdById       String            @map("created_by_id")
  updatedById       String            @map("updated_by_id")
  deletedAt         DateTime?         @map("deleted_at")
  deletedById       String?           @map("deleted_by_id")

  tenant   Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  balances LeaveBalance[]
  requests LeaveRequest[]
  createdBy User          @relation("LeaveTypeCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User          @relation("LeaveTypeUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?         @relation("LeaveTypeDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, code])
  @@index([tenantId, isActive])
  @@map("leave_type")
}
```

---

### LeaveBalance

**Purpose:** Current entitlement balance per employee per leave type per calendar year. `entitledDays` is the total days granted for the year. `usedDays` is updated when a leave request is approved and taken. `pendingDays` reflects days in submitted/approved requests not yet taken. `remainingDays` is a stored computed value kept in sync by the application.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `employee Employee`
- `leaveType LeaveType`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `employeeId → Employee.id` — `onDelete: Restrict, onUpdate: Cascade`
- `leaveTypeId → LeaveType.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([employeeId, leaveTypeId, year])`

**Indexes:** `@@index([tenantId, employeeId])`, `@@index([tenantId, leaveTypeId])`

**Audit Fields:** `updatedAt` only. Managed exclusively by the leave service.

```prisma
model LeaveBalance {
  id             String   @id @default(cuid()) @map("id")
  tenantId       String   @map("tenant_id")
  employeeId     String   @map("employee_id")
  leaveTypeId    String   @map("leave_type_id")
  year           Int      @map("year")
  entitledDays   Decimal  @map("entitled_days") @db.Decimal(6, 2)
  usedDays       Decimal  @default(0) @map("used_days") @db.Decimal(6, 2)
  pendingDays    Decimal  @default(0) @map("pending_days") @db.Decimal(6, 2)
  remainingDays  Decimal  @map("remaining_days") @db.Decimal(6, 2)
  carriedOverDays Decimal @default(0) @map("carried_over_days") @db.Decimal(6, 2)
  updatedAt      DateTime @updatedAt @map("updated_at")

  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  employee  Employee  @relation(fields: [employeeId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  leaveType LeaveType @relation(fields: [leaveTypeId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@unique([employeeId, leaveTypeId, year])
  @@index([tenantId, employeeId])
  @@index([tenantId, leaveTypeId])
  @@map("leave_balance")
}
```

---

### LeaveRequest

**Purpose:** Employee time-off request. `startDate` / `endDate` are inclusive calendar dates; `totalDays` is the calculated working-day span stored at submission. `status` drives the approval workflow; `APPROVED` and `REJECTED` are terminal. Approved requests decrement `LeaveBalance.usedDays` when the leave is taken (status transitions to `TAKEN`).

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `employee Employee`
- `leaveType LeaveType`
- `approvedBy User?`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `employeeId → Employee.id` — `onDelete: Restrict, onUpdate: Cascade`
- `leaveTypeId → LeaveType.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, number])`

**Indexes:** `@@index([tenantId, employeeId])`, `@@index([tenantId, status])`, `@@index([tenantId, startDate])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum LeaveRequestStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  CANCELLED
  TAKEN
}
```

```prisma
model LeaveRequest {
  id              String             @id @default(cuid()) @map("id")
  tenantId        String             @map("tenant_id")
  employeeId      String             @map("employee_id")
  leaveTypeId     String             @map("leave_type_id")
  number          String             @map("number") @db.VarChar(100)
  status          LeaveRequestStatus @default(DRAFT) @map("status")
  startDate       DateTime           @map("start_date") @db.Date
  endDate         DateTime           @map("end_date") @db.Date
  totalDays       Decimal            @map("total_days") @db.Decimal(6, 2)
  reason          String?            @map("reason") @db.Text
  approvedById    String?            @map("approved_by_id")
  approvedAt      DateTime?          @map("approved_at")
  rejectedAt      DateTime?          @map("rejected_at")
  rejectionReason String?            @map("rejection_reason") @db.Text
  submittedAt     DateTime?          @map("submitted_at")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")
  createdById     String             @map("created_by_id")
  updatedById     String             @map("updated_by_id")
  deletedAt       DateTime?          @map("deleted_at")
  deletedById     String?            @map("deleted_by_id")

  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  employee  Employee  @relation(fields: [employeeId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  leaveType LeaveType @relation(fields: [leaveTypeId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  approvedBy User?    @relation("LeaveRequestApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull, onUpdate: Cascade)
  createdBy User      @relation("LeaveRequestCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy User      @relation("LeaveRequestUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy User?     @relation("LeaveRequestDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, number])
  @@index([tenantId, employeeId])
  @@index([tenantId, status])
  @@index([tenantId, startDate])
  @@map("leave_request")
}
```

---

## 23. Notification Models

Templated multi-channel notifications with per-user delivery tracking and preference management. `NotificationTemplate` holds reusable content for each channel. `Notification` is the per-recipient delivery record. `NotificationPreference` stores each user's opt-in/opt-out per category and channel.

### NotificationTemplate

**Purpose:** Reusable content template for a notification event. `code` is the machine identifier used by application code to look up the template (e.g. `ORDER_CONFIRMED`, `LEAVE_APPROVED`). `channel` defines the delivery transport. `subjectTemplate` and `bodyTemplate` are Handlebars strings rendered at send time with an event-specific payload. Locale variants are separate rows sharing the same `code`.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `notifications Notification[]`
- `createdBy User`, `updatedBy User`, `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`

**Unique Constraints:** `@@unique([tenantId, code, channel, locale])`

**Indexes:** `@@index([tenantId, code])`, `@@index([tenantId, isActive])`

**Audit Fields:** `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`, `deletedById`.

**Enums:**
```prisma
enum NotificationChannel {
  EMAIL
  SMS
  PUSH
  IN_APP
}
```

```prisma
model NotificationTemplate {
  id              String              @id @default(cuid()) @map("id")
  tenantId        String              @map("tenant_id")
  code            String              @map("code") @db.VarChar(100)
  channel         NotificationChannel @map("channel")
  locale          String              @default("en") @map("locale") @db.VarChar(10)
  name            String              @map("name") @db.VarChar(200)
  subjectTemplate String?             @map("subject_template") @db.VarChar(500)
  bodyTemplate    String              @map("body_template") @db.Text
  isActive        Boolean             @default(true) @map("is_active")
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")
  createdById     String              @map("created_by_id")
  updatedById     String              @map("updated_by_id")
  deletedAt       DateTime?           @map("deleted_at")
  deletedById     String?             @map("deleted_by_id")

  tenant        Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  notifications Notification[]
  createdBy     User           @relation("NotificationTemplateCreatedBy", fields: [createdById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  updatedBy     User           @relation("NotificationTemplateUpdatedBy", fields: [updatedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy     User?          @relation("NotificationTemplateDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@unique([tenantId, code, channel, locale])
  @@index([tenantId, code])
  @@index([tenantId, isActive])
  @@map("notification_template")
}
```

---

### Notification

**Purpose:** Single delivery record for one recipient. `templateId` is nullable to allow ad-hoc notifications without a template. `payload` is the data object merged into the template at render time, stored for audit and retry. `scheduledAt` enables deferred delivery; null means send immediately. `externalId` stores the message ID returned by the downstream provider (SendGrid, Twilio, FCM, etc.) for delivery-status webhook correlation.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `recipient User`
- `template NotificationTemplate?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `recipientId → User.id` — `onDelete: Cascade, onUpdate: Cascade`
- `templateId → NotificationTemplate.id` — `onDelete: SetNull, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, recipientId, status])`, `@@index([tenantId, channel])`, `@@index([tenantId, scheduledAt])`, `@@index([tenantId, createdAt])`

**Audit Fields:** `createdAt` only. Immutable after creation; status transitions are in-place updates by the delivery service.

**Enums:**
```prisma
enum NotificationStatus {
  PENDING
  SCHEDULED
  SENDING
  SENT
  DELIVERED
  READ
  FAILED
  CANCELLED
}
```

```prisma
model Notification {
  id           String              @id @default(cuid()) @map("id")
  tenantId     String              @map("tenant_id")
  recipientId  String              @map("recipient_id")
  templateId   String?             @map("template_id")
  channel      NotificationChannel @map("channel")
  status       NotificationStatus  @default(PENDING) @map("status")
  subject      String?             @map("subject") @db.VarChar(500)
  body         String              @map("body") @db.Text
  payload      Json                @default("{}") @map("payload")
  externalId   String?             @map("external_id") @db.VarChar(255)
  scheduledAt  DateTime?           @map("scheduled_at")
  sentAt       DateTime?           @map("sent_at")
  deliveredAt  DateTime?           @map("delivered_at")
  readAt       DateTime?           @map("read_at")
  failedAt     DateTime?           @map("failed_at")
  failureReason String?            @map("failure_reason") @db.VarChar(500)
  retryCount   Int                 @default(0) @map("retry_count")
  createdAt    DateTime            @default(now()) @map("created_at")

  tenant    Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  recipient User                  @relation("NotificationRecipient", fields: [recipientId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  template  NotificationTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, recipientId, status])
  @@index([tenantId, channel])
  @@index([tenantId, scheduledAt])
  @@index([tenantId, createdAt])
  @@map("notification")
}
```

---

### NotificationPreference

**Purpose:** Per-user opt-in/opt-out for a notification category on a given channel. `category` is a free-form string matching the `code` namespace used in `NotificationTemplate` (e.g. `ORDER_UPDATES`, `LEAVE_APPROVALS`). `isEnabled = false` suppresses delivery for that category/channel combination. Rows are created on first preference save; absence of a row means the system default applies.

**Ownership:** Tenant-scoped via `tenantId`.

**Relationships:**
- `tenant Tenant`
- `user User`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `userId → User.id` — `onDelete: Cascade, onUpdate: Cascade`

**Unique Constraints:** `@@unique([userId, category, channel])`

**Indexes:** `@@index([tenantId, userId])`

**Audit Fields:** `updatedAt` only. Written by the user's preference service.

```prisma
model NotificationPreference {
  id        String              @id @default(cuid()) @map("id")
  tenantId  String              @map("tenant_id")
  userId    String              @map("user_id")
  category  String              @map("category") @db.VarChar(100)
  channel   NotificationChannel @map("channel")
  isEnabled Boolean             @default(true) @map("is_enabled")
  updatedAt DateTime            @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@unique([userId, category, channel])
  @@index([tenantId, userId])
  @@map("notification_preference")
}
```

---

## 24. Attachment Models

Polymorphic file attachment registry. The `Attachment` model stores file metadata; the bytes live in object storage (S3, Azure Blob, GCS, etc.). Any domain entity references attachments via the `resourceType` + `resourceId` polymorphic pair — no foreign key constraint, resolved at the application layer. `storageKey` is the object-storage path. `Attachment` rows are never hard-deleted by application code; they are soft-deleted and purged by a background retention job after the storage object is removed.

### Attachment

**Purpose:** Metadata record for an uploaded file associated with any domain resource. `resourceType` is the entity name string (e.g. `ExpenseReportLine`, `PurchaseOrder`, `Lead`). `storageProvider` identifies the configured object-storage backend so the file-service knows which SDK to call. `isPublic` controls whether a pre-signed URL or a public CDN URL is generated. `checksum` (MD5 or SHA-256 hex) enables client-side integrity verification and deduplication.

**Ownership:** Tenant-scoped via `tenantId`.

**Soft Delete:** `deletedAt`, `deletedById`.

**Relationships:**
- `tenant Tenant`
- `uploadedBy User`
- `deletedBy User?`

**Foreign Keys:**
- `tenantId → Tenant.id` — `onDelete: Restrict, onUpdate: Cascade`
- `uploadedById → User.id` — `onDelete: Restrict, onUpdate: Cascade`

**Indexes:** `@@index([tenantId, resourceType, resourceId])`, `@@index([tenantId, uploadedById])`, `@@index([tenantId, deletedAt])`

**Audit Fields:** `createdAt`, `deletedAt`, `deletedById`. No `updatedAt` — attachments are immutable after upload.

**Enums:**
```prisma
enum StorageProvider {
  S3
  AZURE_BLOB
  GCS
  LOCAL
}
```

```prisma
model Attachment {
  id              String          @id @default(cuid()) @map("id")
  tenantId        String          @map("tenant_id")
  resourceType    String          @map("resource_type") @db.VarChar(100)
  resourceId      String          @map("resource_id")
  storageProvider StorageProvider @map("storage_provider")
  storageKey      String          @map("storage_key") @db.VarChar(1000)
  fileName        String          @map("file_name") @db.VarChar(500)
  mimeType        String          @map("mime_type") @db.VarChar(255)
  sizeBytes       BigInt          @map("size_bytes")
  checksum        String?         @map("checksum") @db.VarChar(128)
  isPublic        Boolean         @default(false) @map("is_public")
  description     String?         @map("description") @db.VarChar(500)
  metadata        Json            @default("{}") @map("metadata")
  uploadedById    String          @map("uploaded_by_id")
  createdAt       DateTime        @default(now()) @map("created_at")
  deletedAt       DateTime?       @map("deleted_at")
  deletedById     String?         @map("deleted_by_id")

  tenant     Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  uploadedBy User   @relation("AttachmentUploadedBy", fields: [uploadedById], references: [id], onDelete: Restrict, onUpdate: Cascade)
  deletedBy  User?  @relation("AttachmentDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([tenantId, resourceType, resourceId])
  @@index([tenantId, uploadedById])
  @@index([tenantId, deletedAt])
  @@map("attachment")
}
```

---

## 25. Reporting Considerations

Prisma is an OLTP tool. Reporting queries run on the same schema but must be designed to avoid degrading transactional throughput. This section documents the patterns and constraints that govern how reporting is implemented against this schema.

### Read Replica Routing

All reporting queries **must** target a read replica. The application maintains two Prisma client instances:

```typescript
// OLTP — mutations and latency-sensitive reads
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })

// Reporting — analytics, exports, aggregations
const dbRead = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_READ_URL } } })
```

Never run aggregate or full-table-scan queries through the primary `db` client.

### Pre-computed Aggregates

Several models in this schema are intentionally denormalised to serve reporting without expensive JOINs at query time:

| Model | What it pre-computes |
|---|---|
| `AccountBalance` | GL debit/credit totals per account per fiscal period |
| `StockLevel` | On-hand, reserved, and available quantities per variant per location |
| `LeaveBalance` | Entitled, used, pending, and remaining days per employee per year |
| `OrderLine` | `totalAmount` kept in sync with `unitPrice × quantity` |
| `ExpenseReport` | `totalAmount` denormalised from line sum |
| `PurchaseOrder` | `subtotalAmount`, `taxAmount`, `totalAmount` denormalised from lines |

These fields are written by the application, not computed by the database. Never query them from the primary write path without confirming they are current.

### Materialized Views

For cross-tenant or time-series dashboards that cannot be served from pre-computed columns, create **PostgreSQL materialized views** outside Prisma schema management. Refresh them via a `BackgroundJob` or a scheduled `OutboxEvent` consumer. Examples:

- `mv_revenue_by_tenant_month` — aggregates `Invoice.totalAmount` by `tenantId` and calendar month
- `mv_stock_valuation` — joins `StockLevel` with `Product.costAmount` for inventory value reports
- `mv_expense_by_category_period` — summarises `ExpenseReportLine` by `categoryId` and fiscal period

Prisma cannot manage views. Map them using raw SQL in migration files and query them with `db.$queryRaw`.

### Index Strategy for Reporting

Reporting queries commonly filter on date ranges and group by tenant. Follow these rules:

- Always include `tenantId` as the **leading column** on composite indexes, even for reporting indexes — row-level security partitions by tenant.
- For range scans on dates (e.g. `createdAt`, `incurredAt`, `occurredAt`), add a composite index `[tenantId, <date_column>]`. These are already present on high-volume models such as `StockMovement`, `JournalEntry`, and `AuditLog`.
- For status-filtered counts (e.g. open orders, pending approvals), composite indexes on `[tenantId, status]` eliminate full-table scans. These are defined on all workflow models.
- Never add a reporting-only index to a high-write table without load testing. Prefer the read replica and covering indexes on the replica if the primary write path would be harmed.

### OutboxEvent as Reporting Feed

`OutboxEvent` (§11) is the canonical integration point for pushing domain events to downstream analytics systems (data warehouses, BI tools, event streams). Each significant state transition — order confirmed, invoice posted, stock adjusted — should emit an `OutboxEvent`. A consumer forwards these events to the warehouse without querying the OLTP tables.

Reporting on near-real-time data should consume from the event stream, not poll the OLTP database.

### What to Avoid

| Anti-pattern | Reason |
|---|---|
| `SELECT *` across soft-deleted rows without `WHERE deletedAt IS NULL` | Inflates result sets; skews aggregates |
| Joining more than four tables in a single Prisma query | Use a materialised view or raw SQL with an execution plan review |
| Filtering on unindexed `metadata Json` fields | Full-table scan; extract frequently-queried keys to typed columns |
| Using `count()` on `AuditLog` or `StockMovement` for dashboards | These are append-only ledgers; use pre-aggregated summary tables instead |
| Running `groupBy` on the primary | Route to the read replica |

---

## 26. Final Prisma Modeling Summary

This section is the canonical reference for conventions and decisions applied uniformly across all models in this schema. Treat it as the checklist when adding a new model or reviewing an existing one.

### Domain Coverage

| § | Domain | Key Models |
|---|---|---|
| 1–8 | Foundations | Philosophy, naming, audit, soft delete, tenancy, base fields, relationships, indexes |
| 9 | Platform | `Plan`, `PlanFeature`, `Tenant`, `TenantSetting` |
| 10 | Identity & Access | `User`, `UserProfile`, `TenantUser`, `UserSession`, `PasswordResetToken`, `Permission`, `Role`, `RolePermission`, `UserRole` |
| 11 | System | `AuditLog`, `TransactionSource`, `BackgroundJob`, `OutboxEvent` |
| 12 | CRM | `Lead`, `CrmActivity`, `Pipeline`, `PipelineStage`, `Deal` |
| 13 | Customer | `Customer`, `CustomerProfile`, `CustomerContact`, `CustomerAddress`, `CustomerTag` |
| 14 | Orders | `Order`, `OrderLine`, `OrderStatusHistory`, `Shipment`, `ShipmentLine`, `Payment` |
| 15 | Import Engine | `ImportJob`, `ImportRow`, `ImportErrorLog` |
| 16 | Financial Operations | `TaxRate`, `Invoice`, `InvoiceLine`, `InvoicePayment`, `CreditNote`, `ExpenseCategory`, `Expense` |
| 17 | Accounting | `AccountType`, `ChartOfAccount`, `CostCenter`, `FinancialYear`, `FiscalPeriod`, `JournalEntry`, `JournalEntryLine`, `FixedAsset`, `AssetDepreciation`, `AccountBalance` |
| 18 | Product & Catalog | `ProductCategory`, `Product`, `ProductVariant`, `PriceList`, `PriceListItem` |
| 19 | Purchasing | `Supplier`, `SupplierContact`, `PurchaseOrder`, `PurchaseOrderLine`, `PurchaseReceipt`, `PurchaseReceiptLine` |
| 20 | Inventory | `Warehouse`, `WarehouseLocation`, `StockLevel`, `StockMovement`, `StockAdjustment`, `StockAdjustmentLine` |
| 21 | Expenses | `ExpensePolicy`, `ExpensePolicyRule`, `ExpenseReport`, `ExpenseReportLine` |
| 22 | HR | `Department`, `Employee`, `EmployeeContract`, `LeaveType`, `LeaveBalance`, `LeaveRequest` |
| 23 | Notifications | `NotificationTemplate`, `Notification`, `NotificationPreference` |
| 24 | Attachments | `Attachment` |

### Universal Field Conventions

| Convention | Rule |
|---|---|
| Primary key | `String @id @default(cuid())` — no integer sequences |
| Money | `BigInt` in minor units (cents, pence). Never `Float` or `Decimal` for currency |
| Quantity | `Decimal(14,4)` — supports fractional units of measure |
| Percentages / rates | `Decimal(10,4)` |
| Timestamps | `DateTime` in UTC. `@db.Date` for calendar-only fields (e.g. `hiredAt`, `startDate`) |
| Char codes | `@db.Char(3)` for ISO currency codes; `@db.Char(2)` for ISO country codes |
| Free text | `@db.VarChar(N)` with an explicit length. `@db.Text` only for unbounded prose |
| JSON bags | `Json @default("{}")` for extensible metadata. Never use JSON for filterable fields |
| Column naming | `snake_case` via `@map`; Prisma field names remain `camelCase` |
| Table naming | `snake_case` via `@@map` |

### Cross-Cutting Patterns

**Soft Delete** — applied to all user-managed entities. Fields: `deletedAt DateTime?`, `deletedById String?`. All queries must filter `WHERE deleted_at IS NULL` unless explicitly reading deleted records. Hard deletes are reserved for system-generated rows with no audit requirement (e.g. `NotificationPreference`).

**Audit Trail** — standard actor fields on all mutable entities: `createdAt`, `updatedAt`, `createdById`, `updatedById`. Append-only models (`StockMovement`, `JournalEntryLine`) carry only `createdAt` and `createdById`.

**Tenant Isolation** — every model carries `tenantId` as a non-nullable indexed field. `tenantId` is always the leading column on composite indexes. Cross-tenant queries are forbidden at the application layer; no model has a cross-tenant relationship.

**Referential Actions** — standard set used throughout:
- Parent is a core entity the child cannot exist without → `onDelete: Restrict`
- Child should be cleaned up with the parent → `onDelete: Cascade`
- Reference is optional context → `onDelete: SetNull`
- Always `onUpdate: Cascade`

**Immutable Ledger Rows** — `StockMovement` and `JournalEntryLine` are never updated or soft-deleted after posting. They have no `updatedAt`. Application code must insert a correcting entry rather than modifying an existing row.

**Denormalised Totals** — monetary totals on header models (`Order.totalAmount`, `PurchaseOrder.totalAmount`, `ExpenseReport.totalAmount`, `Invoice.totalAmount`) are kept in sync by the application. They are never computed at query time.

### Enum Registry

| Enum | Used on |
|---|---|
| `ProductType` | `Product.type` |
| `ProductStatus` | `Product.status` |
| `SupplierStatus` | `Supplier.status` |
| `PurchaseOrderStatus` | `PurchaseOrder.status` |
| `PurchaseReceiptStatus` | `PurchaseReceipt.status` |
| `WarehouseLocationType` | `WarehouseLocation.locationType` |
| `StockMovementType` | `StockMovement.movementType` |
| `StockAdjustmentStatus` | `StockAdjustment.status` |
| `StockAdjustmentReason` | `StockAdjustment.reason` |
| `ExpenseReportStatus` | `ExpenseReport.status` |
| `EmployeeStatus` | `Employee.status` |
| `EmploymentType` | `Employee.employmentType`, `EmployeeContract.employmentType` |
| `ContractType` | `EmployeeContract.contractType` |
| `PayFrequency` | `EmployeeContract.payFrequency` |
| `LeaveAccrualBasis` | `LeaveType.accrualBasis` |
| `LeaveRequestStatus` | `LeaveRequest.status` |
| `NotificationChannel` | `NotificationTemplate.channel`, `Notification.channel`, `NotificationPreference.channel` |
| `NotificationStatus` | `Notification.status` |
| `StorageProvider` | `Attachment.storageProvider` |

Enums defined in earlier sections remain in effect: `AccountType`, `JournalEntryStatus`, `ImportJobStatus`, `ImportRowStatus`, `InvoiceStatus`, `PaymentStatus`, `OrderStatus`, `ShipmentStatus`, `LeadStatus`, `DealStatus`, `BackgroundJobStatus`, `OutboxEventStatus`, `ExpenseStatus`.

### What This Schema Deliberately Excludes

| Excluded | Rationale |
|---|---|
| Database views | Managed outside Prisma via raw migration SQL; queried with `$queryRaw` |
| Stored procedures / triggers | All business logic lives in the application layer |
| Row-level security policies | Implemented at the application layer via `tenantId` scoping, not PostgreSQL RLS |
| Full-text search indexes | Defined in raw migration SQL (`CREATE INDEX ... USING GIN`) and not representable in Prisma schema |
| Partitioned tables | Applied post-generation via raw migration SQL on high-volume tables (`audit_log`, `stock_movement`, `journal_entry_line`) |
| Composite primary keys | All models use a single `cuid()` PK; composite uniqueness is expressed via `@@unique` |
| Polymorphic foreign keys | Represented as `resourceType String` + `resourceId String` pairs; resolved at the application layer |

---

*Schema blueprint complete. All 24 domain sections documented.*
