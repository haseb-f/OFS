# DATABASE MASTER BLUEPRINT

## 1. Database Philosophy

The database is the source of truth. All business logic enforced at the application layer must have a corresponding constraint, type, or structure at the database layer. Data integrity is non-negotiable.

- Prefer explicit over implicit. Never rely on application-side defaults for critical fields.
- Normalize to third normal form (3NF) by default. Denormalize only with documented justification.
- Every table must have a clear owner domain. Tables that belong to multiple domains are a design failure.
- The database schema is a contract. Breaking changes require migrations, not hotfixes.
- Performance optimizations (indexes, partitioning, materialized views) are secondary to correctness. Optimize after the model is stable.

---

## 2. Multi-Tenant Strategy

All tenant data is isolated using a **shared database, shared schema** model with row-level tenant discrimination.

- Every tenant-scoped table carries a `tenant_id` column of type `UUID NOT NULL`.
- `tenant_id` is always the first column in any composite index when present.
- Foreign keys never cross tenant boundaries. Cross-tenant queries are application-level operations only.
- Global tables (reference data, system config) are explicitly marked as tenant-exempt and carry no `tenant_id`.
- All queries against tenant-scoped tables must include a `tenant_id` predicate. ORM-level global scopes enforce this by default.
- Tenant provisioning and deprovisioning are handled via migration scripts, never ad-hoc SQL.

---

## 3. Naming Conventions

**General**
- All identifiers use `snake_case`. No camelCase, PascalCase, or hyphenation.
- Names are singular for tables (`order`, `invoice`, `user`), not plural.
- Abbreviations are avoided unless universally understood (`id`, `url`, `sku`).

**Tables**
- Named after the entity they represent: `product`, `shipment`, `payment_method`.
- Junction tables use both entity names joined by underscore in dependency order: `order_product`, `user_role`.

**Columns**
- Primary key: `id` (every table).
- Foreign keys: `{referenced_table}_id` (e.g., `tenant_id`, `order_id`, `created_by`).
- Boolean columns: prefixed with `is_` or `has_` (e.g., `is_active`, `has_discount`).
- Enum/status columns: suffixed with `_status` or `_type` (e.g., `payment_status`, `address_type`).
- Avoid reserved words: never name a column `order`, `group`, `user`, `value`, `key`.

**Indexes**
- Pattern: `idx_{table}_{columns}` (e.g., `idx_order_tenant_id_status`).
- Unique constraints: `uq_{table}_{columns}` (e.g., `uq_user_tenant_id_email`).
- Foreign key indexes: `fk_{table}_{referenced_table}` (e.g., `fk_order_item_order`).

---

## 4. Audit Architecture

All user-facing and business-critical tables implement full audit trails.

**Audit Columns (on every audited table)**

| Column | Type | Purpose |
|---|---|---|
| `created_by` | `UUID` | User who created the record |
| `updated_by` | `UUID` | User who last modified the record |
| `deleted_by` | `UUID NULL` | User who soft-deleted the record |

**Audit Log Table (`audit_log`)**

A centralized `audit_log` table captures before/after state for all write operations on audited tables.

| Column | Type |
|---|---|
| `id` | `UUID PK` |
| `tenant_id` | `UUID NOT NULL` |
| `table_name` | `VARCHAR NOT NULL` |
| `record_id` | `UUID NOT NULL` |
| `action` | `ENUM('INSERT','UPDATE','DELETE')` |
| `old_values` | `JSONB NULL` |
| `new_values` | `JSONB NULL` |
| `performed_by` | `UUID NOT NULL` |
| `performed_at` | `TIMESTAMPTZ NOT NULL` |
| `ip_address` | `INET NULL` |
| `session_id` | `UUID NULL` |

- Audit log rows are immutable. No `UPDATE` or `DELETE` is permitted on `audit_log`.
- Audit log population is handled via database triggers, not application code.
- Audit logs are retained for a minimum of 7 years for compliance.

---

## 5. Soft Delete Strategy

Soft delete is the default deletion strategy for all tenant-scoped business entities.

- Soft-deleted rows carry a non-null `deleted_at` timestamp.
- All application queries filter `WHERE deleted_at IS NULL` by default via ORM global scopes.
- Hard deletes are reserved for: system logs, ephemeral session data, and explicitly designated purge-eligible tables.
- A table is soft-delete-eligible if it meets any of the following: referenced by an audit log, carries financial data, or is visible to end users.
- Cascading deletes are prohibited on soft-delete tables. Child records must be soft-deleted explicitly.
- Unique constraints on soft-delete tables must account for deleted state:
  - Use partial unique indexes: `WHERE deleted_at IS NULL`.
  - Example: `CREATE UNIQUE INDEX uq_user_email ON user(tenant_id, email) WHERE deleted_at IS NULL`.

---

## 6. Timestamp Standards

All timestamps are stored in **UTC**. No exceptions. Timezone conversion is an application-layer responsibility.

**Standard Timestamp Columns**

| Column | Type | Nullable | Present On |
|---|---|---|---|
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Every table |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Every table |
| `deleted_at` | `TIMESTAMPTZ` | NULL | Soft-delete tables |

- `created_at` defaults to `NOW()` and is immutable after insert.
- `updated_at` defaults to `NOW()` and is updated automatically via trigger on every `UPDATE`.
- `deleted_at` is set by the application on soft delete; never via trigger.
- Date-only values (birthdates, due dates, effective dates) use the `DATE` type, not `TIMESTAMPTZ`.
- Duration values are stored in seconds as `INTEGER` or `INTERVAL`, never as formatted strings.

---

## 7. Currency Standards

All monetary values are stored as **integers representing the smallest currency unit** (e.g., cents for USD, fils for AED).

- Column type: `BIGINT NOT NULL DEFAULT 0`.
- Column naming: suffix with `_amount` (e.g., `unit_price_amount`, `discount_amount`, `tax_amount`).
- Currency code is always stored alongside monetary values in a paired column suffixed `_currency` (e.g., `unit_price_currency`).
- Currency code type: `CHAR(3) NOT NULL` following ISO 4217 (e.g., `'USD'`, `'AED'`, `'EUR'`).
- No floating-point types (`FLOAT`, `DOUBLE`, `REAL`) are permitted for monetary values.
- `NUMERIC(19,4)` is acceptable only for exchange rate storage.
- Aggregations (SUM, AVG) on monetary columns must preserve currency grouping. Summing across currencies is a logic error.

**Example**

```sql
unit_price_amount   BIGINT NOT NULL DEFAULT 0,  -- 1999 = $19.99
unit_price_currency CHAR(3) NOT NULL DEFAULT 'USD'
```

---

## 8. Relationship Standards

**Primary Keys**
- All tables use a single-column `UUID` primary key named `id`.
- UUIDs are generated at the application layer before insert (UUIDv4 or UUIDv7).
- Auto-increment integers are not used for primary keys on tenant-scoped tables.

**Foreign Keys**
- All foreign key relationships are declared explicitly with `FOREIGN KEY` constraints.
- Foreign keys reference the `id` column of the parent table.
- `ON DELETE CASCADE` is prohibited on soft-delete tables.
- `ON DELETE RESTRICT` is the default behavior. Use `ON DELETE SET NULL` only when orphaned references are semantically valid.
- Self-referencing foreign keys (e.g., `parent_id`) are permitted for hierarchical entities and must be nullable.

**Junction Tables**
- Carry their own `id UUID PK`.
- Include `tenant_id` if either parent entity is tenant-scoped.
- Include `created_at` and `created_by` at minimum.
- No business logic columns beyond the relationship itself. If a junction needs additional attributes, promote it to a named entity table.

**Index Requirements**
- Every foreign key column must have a corresponding index.
- Composite indexes follow column order: `tenant_id` first, then selectivity descending.
- Covering indexes are added only when query patterns are established and measured, not speculatively.

---

## 9. Platform Domain

The Platform Domain contains system-level entities that exist outside any tenant boundary. These tables are owned by the platform operator and are not accessible to tenant users directly.

**Scope:** Global. No `tenant_id`. Managed exclusively by platform administrators.

---

### `plan`

Defines subscription plans available on the platform.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `name` | `VARCHAR(100)` | NOT NULL |
| `slug` | `VARCHAR(100)` | NOT NULL, UNIQUE |
| `description` | `TEXT` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_public` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `trial_days` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

---

### `plan_feature`

Defines the feature entitlements included in each plan.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `plan_id` | `UUID` | NOT NULL, FK → plan.id |
| `feature_key` | `VARCHAR(100)` | NOT NULL |
| `feature_value` | `VARCHAR(255)` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_plan_feature_plan_id`, `uq_plan_feature_plan_id_feature_key (plan_id, feature_key)`

---

### `tenant`

The root entity for every organization on the platform.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `name` | `VARCHAR(255)` | NOT NULL |
| `slug` | `VARCHAR(100)` | NOT NULL, UNIQUE |
| `plan_id` | `UUID` | NOT NULL, FK → plan.id |
| `plan_status` | `ENUM` | NOT NULL (`trial`, `active`, `suspended`, `cancelled`) |
| `trial_ends_at` | `TIMESTAMPTZ` | NULL |
| `plan_started_at` | `TIMESTAMPTZ` | NULL |
| `plan_expires_at` | `TIMESTAMPTZ` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_tenant_slug (slug) WHERE deleted_at IS NULL`

---

### `tenant_setting`

Key-value configuration store scoped to a tenant. Overrides platform defaults.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `key` | `VARCHAR(100)` | NOT NULL |
| `value` | `TEXT` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_tenant_setting_tenant_id_key (tenant_id, key)`

---

## 10. Identity Domain

The Identity Domain manages all entities related to human actors on the platform — their accounts, credentials, sessions, and tenant membership.

**Scope:** Mixed. `user` is global. All membership and session tables are tenant-scoped.

---

### `user`

A global identity record. One record per human, regardless of how many tenants they belong to.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `email` | `VARCHAR(320)` | NOT NULL, UNIQUE |
| `email_verified_at` | `TIMESTAMPTZ` | NULL |
| `phone` | `VARCHAR(30)` | NULL |
| `phone_verified_at` | `TIMESTAMPTZ` | NULL |
| `password_hash` | `VARCHAR(255)` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `last_login_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_user_email (email) WHERE deleted_at IS NULL`

---

### `user_profile`

Display and personal information for a user. Separated from `user` to keep the identity record lean.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | NOT NULL, UNIQUE, FK → user.id |
| `first_name` | `VARCHAR(100)` | NOT NULL |
| `last_name` | `VARCHAR(100)` | NOT NULL |
| `display_name` | `VARCHAR(150)` | NULL |
| `avatar_url` | `TEXT` | NULL |
| `locale` | `CHAR(5)` | NOT NULL, DEFAULT 'en' |
| `timezone` | `VARCHAR(50)` | NOT NULL, DEFAULT 'UTC' |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

---

### `tenant_user`

Membership record linking a user to a tenant. A user may belong to multiple tenants.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `user_id` | `UUID` | NOT NULL, FK → user.id |
| `is_owner` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `invited_by` | `UUID` | NULL, FK → user.id |
| `joined_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_tenant_user (tenant_id, user_id) WHERE deleted_at IS NULL`, `idx_tenant_user_user_id`

---

### `user_session`

Active authentication sessions. Tenant-scoped — a session belongs to exactly one tenant context.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `user_id` | `UUID` | NOT NULL, FK → user.id |
| `token_hash` | `VARCHAR(255)` | NOT NULL, UNIQUE |
| `ip_address` | `INET` | NULL |
| `user_agent` | `TEXT` | NULL |
| `last_active_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL |
| `revoked_at` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_user_session_tenant_id_user_id`, `idx_user_session_expires_at`

---

### `password_reset_token`

Short-lived tokens for password recovery. Invalidated on use or expiry.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | NOT NULL, FK → user.id |
| `token_hash` | `VARCHAR(255)` | NOT NULL, UNIQUE |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL |
| `used_at` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

---

## 11. Permission Domain

The Permission Domain defines what authenticated users are allowed to do within a tenant. It uses a Role-Based Access Control (RBAC) model with flat, named roles and granular permission assignments.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

**Model:** Users are assigned one or more roles. Roles hold a set of permissions. Permissions are checked at the application layer against a `resource:action` key pattern.

---

### `role`

A named collection of permissions within a tenant. System roles (seeded at tenant creation) are marked `is_system = TRUE` and cannot be deleted.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(100)` | NOT NULL |
| `slug` | `VARCHAR(100)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `is_system` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_role_tenant_id_slug (tenant_id, slug) WHERE deleted_at IS NULL`

---

### `permission`

The master catalog of available permissions on the platform. Global, not tenant-scoped. Seeded and managed by platform deployments.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `key` | `VARCHAR(150)` | NOT NULL, UNIQUE |
| `domain` | `VARCHAR(100)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Key format:** `{domain}:{resource}:{action}` — e.g., `inventory:product:create`, `finance:invoice:approve`, `hr:user:delete`.

**Indexes:** `idx_permission_domain`

---

### `role_permission`

Junction table assigning permissions to roles within a tenant.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `role_id` | `UUID` | NOT NULL, FK → role.id |
| `permission_id` | `UUID` | NOT NULL, FK → permission.id |
| `granted_by` | `UUID` | NOT NULL, FK → user.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_role_permission (tenant_id, role_id, permission_id)`, `idx_role_permission_role_id`

---

### `user_role`

Assigns roles to tenant members. A user may hold multiple roles within the same tenant.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `user_id` | `UUID` | NOT NULL, FK → user.id |
| `role_id` | `UUID` | NOT NULL, FK → role.id |
| `assigned_by` | `UUID` | NOT NULL, FK → user.id |
| `expires_at` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_user_role (tenant_id, user_id, role_id)`, `idx_user_role_user_id`

---

### Permission Check Contract

At query time, the application resolves permissions using the following join path:

```
user_role → role_permission → permission
WHERE user_role.tenant_id = :tenant_id
  AND user_role.user_id   = :user_id
  AND permission.key      = :required_permission
  AND (user_role.expires_at IS NULL OR user_role.expires_at > NOW())
```

No permission inheritance, no permission negation, no wildcard grants. If the key is not present in the resolved set, access is denied.

---

## 12. CRM Domain

The CRM Domain manages leads, contacts, activities, and pipeline data before a prospect becomes a customer. All records are tenant-scoped.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `lead`

A prospective customer that has not yet been converted to a customer record.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `first_name` | `VARCHAR(100)` | NOT NULL |
| `last_name` | `VARCHAR(100)` | NOT NULL |
| `email` | `VARCHAR(320)` | NULL |
| `phone` | `VARCHAR(30)` | NULL |
| `company_name` | `VARCHAR(255)` | NULL |
| `job_title` | `VARCHAR(150)` | NULL |
| `source` | `VARCHAR(100)` | NULL |
| `lead_status` | `ENUM` | NOT NULL (`new`, `contacted`, `qualified`, `disqualified`, `converted`) |
| `assigned_to` | `UUID` | NULL, FK → user.id |
| `converted_at` | `TIMESTAMPTZ` | NULL |
| `converted_customer_id` | `UUID` | NULL, FK → customer.id |
| `notes` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_lead_tenant_id_lead_status`, `idx_lead_tenant_id_assigned_to`

---

### `crm_activity`

Tracks interactions with a lead or customer: calls, emails, meetings, notes.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `activity_type` | `ENUM` | NOT NULL (`call`, `email`, `meeting`, `note`, `task`) |
| `subject` | `VARCHAR(255)` | NOT NULL |
| `body` | `TEXT` | NULL |
| `outcome` | `VARCHAR(255)` | NULL |
| `occurred_at` | `TIMESTAMPTZ` | NOT NULL |
| `duration_seconds` | `INTEGER` | NULL |
| `lead_id` | `UUID` | NULL, FK → lead.id |
| `customer_id` | `UUID` | NULL, FK → customer.id |
| `performed_by` | `UUID` | NOT NULL, FK → user.id |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Exactly one of `lead_id` or `customer_id` must be non-null. Enforced via application-layer constraint.

**Indexes:** `idx_crm_activity_tenant_id_lead_id`, `idx_crm_activity_tenant_id_customer_id`, `idx_crm_activity_tenant_id_occurred_at`

---

### `pipeline`

A named sales pipeline belonging to a tenant. A tenant may operate multiple pipelines.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_pipeline_tenant_id`

---

### `pipeline_stage`

An ordered stage within a pipeline. Leads and deals progress through stages.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `pipeline_id` | `UUID` | NOT NULL, FK → pipeline.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `position` | `INTEGER` | NOT NULL |
| `is_won` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `is_lost` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_pipeline_stage_pipeline_id`, `uq_pipeline_stage_position (tenant_id, pipeline_id, position)`

---

### `deal`

A qualified sales opportunity moving through a pipeline stage.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(255)` | NOT NULL |
| `pipeline_id` | `UUID` | NOT NULL, FK → pipeline.id |
| `stage_id` | `UUID` | NOT NULL, FK → pipeline_stage.id |
| `lead_id` | `UUID` | NULL, FK → lead.id |
| `customer_id` | `UUID` | NULL, FK → customer.id |
| `assigned_to` | `UUID` | NULL, FK → user.id |
| `deal_value_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `deal_value_currency` | `CHAR(3)` | NOT NULL, DEFAULT 'USD' |
| `expected_close_date` | `DATE` | NULL |
| `closed_at` | `TIMESTAMPTZ` | NULL |
| `deal_status` | `ENUM` | NOT NULL (`open`, `won`, `lost`) |
| `loss_reason` | `VARCHAR(255)` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_deal_tenant_id_stage_id`, `idx_deal_tenant_id_assigned_to`, `idx_deal_tenant_id_deal_status`

---

## 13. Customer Domain

The Customer Domain represents verified, converted entities that have transacted or are eligible to transact with the business. It is the anchor domain for orders, invoices, and financial records.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `customer`

The root entity for a paying or prospective-paying party. Can represent an individual or a business.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `customer_type` | `ENUM` | NOT NULL (`individual`, `business`) |
| `display_name` | `VARCHAR(255)` | NOT NULL |
| `reference_code` | `VARCHAR(100)` | NULL |
| `assigned_to` | `UUID` | NULL, FK → user.id |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `notes` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_customer_tenant_id_is_active`, `uq_customer_reference_code (tenant_id, reference_code) WHERE reference_code IS NOT NULL AND deleted_at IS NULL`

---

### `customer_profile`

Extended personal or business detail for a customer.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `customer_id` | `UUID` | NOT NULL, UNIQUE, FK → customer.id |
| `first_name` | `VARCHAR(100)` | NULL |
| `last_name` | `VARCHAR(100)` | NULL |
| `company_name` | `VARCHAR(255)` | NULL |
| `tax_number` | `VARCHAR(50)` | NULL |
| `website` | `TEXT` | NULL |
| `industry` | `VARCHAR(100)` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

---

### `customer_contact`

One or more contact points (email, phone) for a customer. A customer may have multiple contacts.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `customer_id` | `UUID` | NOT NULL, FK → customer.id |
| `contact_type` | `ENUM` | NOT NULL (`email`, `phone`, `fax`, `other`) |
| `value` | `VARCHAR(320)` | NOT NULL |
| `label` | `VARCHAR(100)` | NULL |
| `is_primary` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_customer_contact_tenant_id_customer_id`, `idx_customer_contact_tenant_id_value`

---

### `customer_address`

Physical or mailing addresses associated with a customer.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `customer_id` | `UUID` | NOT NULL, FK → customer.id |
| `address_type` | `ENUM` | NOT NULL (`billing`, `shipping`, `other`) |
| `label` | `VARCHAR(100)` | NULL |
| `line1` | `VARCHAR(255)` | NOT NULL |
| `line2` | `VARCHAR(255)` | NULL |
| `city` | `VARCHAR(100)` | NOT NULL |
| `state` | `VARCHAR(100)` | NULL |
| `postal_code` | `VARCHAR(20)` | NULL |
| `country_code` | `CHAR(2)` | NOT NULL |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_customer_address_tenant_id_customer_id`

---

### `customer_tag`

Free-form labels applied to customers for segmentation and filtering.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `customer_id` | `UUID` | NOT NULL, FK → customer.id |
| `tag` | `VARCHAR(100)` | NOT NULL |
| `created_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_customer_tag (tenant_id, customer_id, tag)`, `idx_customer_tag_tenant_id_tag`

---

## 14. Orders Domain

The Orders Domain covers the full lifecycle of a commercial transaction: from quotation through order placement, fulfillment, and financial settlement.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `order`

The root transaction record. Represents a confirmed commitment between the tenant and a customer.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `order_number` | `VARCHAR(50)` | NOT NULL |
| `customer_id` | `UUID` | NOT NULL, FK → customer.id |
| `order_status` | `ENUM` | NOT NULL (`draft`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`) |
| `payment_status` | `ENUM` | NOT NULL (`unpaid`, `partial`, `paid`, `overpaid`, `refunded`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `subtotal_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `discount_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `shipping_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `paid_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `notes` | `TEXT` | NULL |
| `billing_address_snapshot` | `JSONB` | NULL |
| `shipping_address_snapshot` | `JSONB` | NULL |
| `confirmed_at` | `TIMESTAMPTZ` | NULL |
| `cancelled_at` | `TIMESTAMPTZ` | NULL |
| `cancellation_reason` | `VARCHAR(255)` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Address fields are stored as snapshots at order time to preserve historical accuracy independent of customer record changes.

**Indexes:** `uq_order_number (tenant_id, order_number)`, `idx_order_tenant_id_customer_id`, `idx_order_tenant_id_order_status`, `idx_order_tenant_id_created_at`

---

### `order_line`

An individual line item within an order. Each line references a product and captures pricing at the time of order.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `order_id` | `UUID` | NOT NULL, FK → order.id |
| `line_number` | `INTEGER` | NOT NULL |
| `product_id` | `UUID` | NULL, FK → product.id |
| `product_snapshot` | `JSONB` | NOT NULL |
| `description` | `VARCHAR(255)` | NOT NULL |
| `sku` | `VARCHAR(100)` | NULL |
| `quantity` | `NUMERIC(12,4)` | NOT NULL |
| `unit_price_amount` | `BIGINT` | NOT NULL |
| `unit_price_currency` | `CHAR(3)` | NOT NULL |
| `discount_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `line_total_amount` | `BIGINT` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`product_snapshot` captures name, SKU, and pricing at order time. `product_id` may become null if the product is later deleted.

**Indexes:** `idx_order_line_order_id`, `uq_order_line_number (tenant_id, order_id, line_number)`

---

### `order_status_history`

Immutable log of every status transition on an order.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `order_id` | `UUID` | NOT NULL, FK → order.id |
| `from_status` | `VARCHAR(50)` | NULL |
| `to_status` | `VARCHAR(50)` | NOT NULL |
| `reason` | `VARCHAR(255)` | NULL |
| `performed_by` | `UUID` | NOT NULL, FK → user.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only. No updates or deletes permitted.

**Indexes:** `idx_order_status_history_order_id`

---

### `shipment`

Fulfillment dispatch record linked to an order.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `order_id` | `UUID` | NOT NULL, FK → order.id |
| `shipment_status` | `ENUM` | NOT NULL (`pending`, `dispatched`, `in_transit`, `delivered`, `returned`) |
| `carrier` | `VARCHAR(100)` | NULL |
| `tracking_number` | `VARCHAR(150)` | NULL |
| `shipped_at` | `TIMESTAMPTZ` | NULL |
| `estimated_delivery_at` | `TIMESTAMPTZ` | NULL |
| `delivered_at` | `TIMESTAMPTZ` | NULL |
| `shipping_address_snapshot` | `JSONB` | NOT NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_shipment_tenant_id_order_id`, `idx_shipment_tenant_id_shipment_status`

---

### `shipment_line`

Links specific order lines and quantities to a shipment. Supports partial fulfillment.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `shipment_id` | `UUID` | NOT NULL, FK → shipment.id |
| `order_line_id` | `UUID` | NOT NULL, FK → order_line.id |
| `quantity_shipped` | `NUMERIC(12,4)` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_shipment_line_shipment_id`, `idx_shipment_line_order_line_id`

---

### `payment`

Records a payment event applied against an order. Multiple payments per order are supported.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `order_id` | `UUID` | NOT NULL, FK → order.id |
| `payment_method` | `VARCHAR(100)` | NOT NULL |
| `payment_status` | `ENUM` | NOT NULL (`pending`, `completed`, `failed`, `refunded`) |
| `amount` | `BIGINT` | NOT NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `reference` | `VARCHAR(255)` | NULL |
| `gateway_response` | `JSONB` | NULL |
| `paid_at` | `TIMESTAMPTZ` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_payment_tenant_id_order_id`, `idx_payment_tenant_id_payment_status`

---

## 15. Import Domain

The Import Domain manages the lifecycle of bulk data ingestion operations: file upload, parsing, validation, and row-level processing. All imports are tenant-scoped and fully auditable.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `import_job`

Tracks a single bulk import operation from initiation to completion.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `import_type` | `VARCHAR(100)` | NOT NULL |
| `file_name` | `VARCHAR(255)` | NOT NULL |
| `file_size_bytes` | `BIGINT` | NOT NULL |
| `file_mime_type` | `VARCHAR(100)` | NOT NULL |
| `storage_key` | `TEXT` | NOT NULL |
| `import_status` | `ENUM` | NOT NULL (`pending`, `parsing`, `validating`, `processing`, `completed`, `failed`, `cancelled`) |
| `total_rows` | `INTEGER` | NULL |
| `valid_rows` | `INTEGER` | NULL |
| `invalid_rows` | `INTEGER` | NULL |
| `processed_rows` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `failed_rows` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `error_summary` | `TEXT` | NULL |
| `mapping` | `JSONB` | NULL |
| `options` | `JSONB` | NULL |
| `started_at` | `TIMESTAMPTZ` | NULL |
| `completed_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`import_type` identifies the target domain entity (e.g., `customer`, `product`, `order`). `mapping` stores the user-defined column-to-field mapping. `options` stores import mode flags such as `upsert`, `skip_errors`, `dry_run`.

**Indexes:** `idx_import_job_tenant_id_import_status`, `idx_import_job_tenant_id_created_at`

---

### `import_row`

Row-level record for each data row within an import job. Captures raw input, validation outcome, and processing result.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `import_job_id` | `UUID` | NOT NULL, FK → import_job.id |
| `row_number` | `INTEGER` | NOT NULL |
| `raw_data` | `JSONB` | NOT NULL |
| `mapped_data` | `JSONB` | NULL |
| `row_status` | `ENUM` | NOT NULL (`pending`, `valid`, `invalid`, `processed`, `failed`, `skipped`) |
| `validation_errors` | `JSONB` | NULL |
| `error_message` | `TEXT` | NULL |
| `entity_id` | `UUID` | NULL |
| `processed_at` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`entity_id` references the created or updated record after successful processing. Its target table is implied by `import_job.import_type` and is not enforced via FK.

**Indexes:** `idx_import_row_import_job_id`, `idx_import_row_import_job_id_row_status`, `uq_import_row_job_row (tenant_id, import_job_id, row_number)`

---

### `import_error_log`

Structured error log for import failures at the job or row level. Preserves full context for user review and support.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `import_job_id` | `UUID` | NOT NULL, FK → import_job.id |
| `import_row_id` | `UUID` | NULL, FK → import_row.id |
| `error_code` | `VARCHAR(100)` | NOT NULL |
| `error_message` | `TEXT` | NOT NULL |
| `field_name` | `VARCHAR(100)` | NULL |
| `field_value` | `TEXT` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only. No updates or deletes permitted.

**Indexes:** `idx_import_error_log_import_job_id`, `idx_import_error_log_import_row_id`

---

## 16. Financial Operations Domain

The Financial Operations Domain manages invoices, credit notes, expense records, and tax configurations. It sits between the Orders Domain (commercial events) and the Accounting Domain (ledger postings). All amounts follow the integer currency standard.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `invoice`

A formal billing document issued to a customer. Generated from an order or manually.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `invoice_number` | `VARCHAR(50)` | NOT NULL |
| `order_id` | `UUID` | NULL, FK → order.id |
| `customer_id` | `UUID` | NOT NULL, FK → customer.id |
| `invoice_status` | `ENUM` | NOT NULL (`draft`, `issued`, `partially_paid`, `paid`, `void`, `uncollectable`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `subtotal_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `discount_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `paid_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `due_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `issued_at` | `TIMESTAMPTZ` | NULL |
| `due_date` | `DATE` | NULL |
| `paid_at` | `TIMESTAMPTZ` | NULL |
| `voided_at` | `TIMESTAMPTZ` | NULL |
| `void_reason` | `VARCHAR(255)` | NULL |
| `notes` | `TEXT` | NULL |
| `billing_address_snapshot` | `JSONB` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_invoice_number (tenant_id, invoice_number)`, `idx_invoice_tenant_id_customer_id`, `idx_invoice_tenant_id_invoice_status`, `idx_invoice_tenant_id_due_date`

---

### `invoice_line`

A line item on an invoice. Mirrors `order_line` but is independent — invoices may be issued for items not tied to an order.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `invoice_id` | `UUID` | NOT NULL, FK → invoice.id |
| `order_line_id` | `UUID` | NULL, FK → order_line.id |
| `line_number` | `INTEGER` | NOT NULL |
| `description` | `VARCHAR(255)` | NOT NULL |
| `sku` | `VARCHAR(100)` | NULL |
| `quantity` | `NUMERIC(12,4)` | NOT NULL |
| `unit_price_amount` | `BIGINT` | NOT NULL |
| `unit_price_currency` | `CHAR(3)` | NOT NULL |
| `discount_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `line_total_amount` | `BIGINT` | NOT NULL |
| `tax_rate_id` | `UUID` | NULL, FK → tax_rate.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_invoice_line_invoice_id`, `uq_invoice_line_number (tenant_id, invoice_id, line_number)`

---

### `invoice_payment`

Records a payment applied to an invoice. An invoice may receive multiple partial payments.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `invoice_id` | `UUID` | NOT NULL, FK → invoice.id |
| `payment_id` | `UUID` | NULL, FK → payment.id |
| `amount` | `BIGINT` | NOT NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `payment_method` | `VARCHAR(100)` | NOT NULL |
| `reference` | `VARCHAR(255)` | NULL |
| `paid_at` | `TIMESTAMPTZ` | NOT NULL |
| `created_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_invoice_payment_invoice_id`, `idx_invoice_payment_payment_id`

---

### `credit_note`

A partial or full reversal issued against an invoice. Reduces the customer's outstanding balance.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `credit_note_number` | `VARCHAR(50)` | NOT NULL |
| `invoice_id` | `UUID` | NOT NULL, FK → invoice.id |
| `customer_id` | `UUID` | NOT NULL, FK → customer.id |
| `credit_note_status` | `ENUM` | NOT NULL (`draft`, `issued`, `applied`, `void`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `total_amount` | `BIGINT` | NOT NULL |
| `applied_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `reason` | `TEXT` | NULL |
| `issued_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_credit_note_number (tenant_id, credit_note_number)`, `idx_credit_note_invoice_id`

---

### `tax_rate`

Defines named tax rates applicable to invoice and order lines.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(100)` | NOT NULL |
| `rate` | `NUMERIC(8,4)` | NOT NULL |
| `tax_type` | `VARCHAR(50)` | NOT NULL |
| `country_code` | `CHAR(2)` | NULL |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `effective_from` | `DATE` | NOT NULL |
| `effective_to` | `DATE` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`rate` is stored as a decimal fraction: `0.0500` = 5%. Applied to `BIGINT` amounts at the application layer before rounding.

**Indexes:** `idx_tax_rate_tenant_id_is_active`, `idx_tax_rate_tenant_id_country_code`

---

### `expense`

Records an internal business expense incurred by the tenant.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `expense_number` | `VARCHAR(50)` | NOT NULL |
| `expense_category_id` | `UUID` | NOT NULL, FK → expense_category.id |
| `vendor_name` | `VARCHAR(255)` | NULL |
| `supplier_id` | `UUID` | NULL, FK → supplier.id |
| `purchase_order_id` | `UUID` | NULL, FK → purchase_order.id |
| `expense_status` | `ENUM` | NOT NULL (`draft`, `submitted`, `approved`, `rejected`, `paid`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `total_amount` | `BIGINT` | NOT NULL |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `incurred_date` | `DATE` | NOT NULL |
| `paid_at` | `TIMESTAMPTZ` | NULL |
| `notes` | `TEXT` | NULL |
| `receipt_url` | `TEXT` | NULL |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_expense_number (tenant_id, expense_number)`, `idx_expense_tenant_id_expense_status`, `idx_expense_tenant_id_incurred_date`

---

### `expense_category`

Classifies expenses for reporting and account mapping.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `parent_id` | `UUID` | NULL, FK → expense_category.id |
| `gl_account_id` | `UUID` | NULL, FK → chart_of_account.id |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_expense_category_tenant_id_parent_id`

---

## 17. Accounting Domain

The Accounting Domain maintains the general ledger, journal entries, and chart of accounts. It receives postings from all financial events in the system. All entries are immutable after posting.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

**Model:** Double-entry bookkeeping. Every journal entry contains at least one debit line and one credit line. The sum of all debit amounts must equal the sum of all credit amounts per entry.

---

### `fiscal_year`

Defines the tenant's accounting period calendar.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(100)` | NOT NULL |
| `start_date` | `DATE` | NOT NULL |
| `end_date` | `DATE` | NOT NULL |
| `is_closed` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `closed_at` | `TIMESTAMPTZ` | NULL |
| `closed_by` | `UUID` | NULL, FK → user.id |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_fiscal_year_dates (tenant_id, start_date, end_date)`

---

### `accounting_period`

A sub-division of a fiscal year, typically monthly. Periods are closed sequentially.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `fiscal_year_id` | `UUID` | NOT NULL, FK → fiscal_year.id |
| `name` | `VARCHAR(50)` | NOT NULL |
| `start_date` | `DATE` | NOT NULL |
| `end_date` | `DATE` | NOT NULL |
| `period_number` | `INTEGER` | NOT NULL |
| `is_closed` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `closed_at` | `TIMESTAMPTZ` | NULL |
| `closed_by` | `UUID` | NULL, FK → user.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_accounting_period_fiscal_year_id`, `uq_accounting_period_number (tenant_id, fiscal_year_id, period_number)`

---

### `chart_of_account`

The tenant's chart of accounts. Defines every account available for ledger postings.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `code` | `VARCHAR(20)` | NOT NULL |
| `name` | `VARCHAR(150)` | NOT NULL |
| `account_type` | `ENUM` | NOT NULL (`asset`, `liability`, `equity`, `revenue`, `expense`) |
| `account_subtype` | `VARCHAR(100)` | NULL |
| `parent_id` | `UUID` | NULL, FK → chart_of_account.id |
| `currency` | `CHAR(3)` | NOT NULL |
| `is_system` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `description` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_chart_of_account_code (tenant_id, code) WHERE deleted_at IS NULL`, `idx_chart_of_account_account_type`, `idx_chart_of_account_parent_id`

---

### `journal_entry`

The header record for a double-entry accounting transaction. Immutable once posted.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `entry_number` | `VARCHAR(50)` | NOT NULL |
| `accounting_period_id` | `UUID` | NOT NULL, FK → accounting_period.id |
| `entry_type` | `ENUM` | NOT NULL (`manual`, `system`, `adjustment`, `closing`) |
| `entry_status` | `ENUM` | NOT NULL (`draft`, `posted`, `void`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `description` | `TEXT` | NOT NULL |
| `reference` | `VARCHAR(255)` | NULL |
| `source_type` | `VARCHAR(100)` | NULL |
| `source_id` | `UUID` | NULL |
| `transaction_date` | `DATE` | NOT NULL |
| `posted_at` | `TIMESTAMPTZ` | NULL |
| `posted_by` | `UUID` | NULL, FK → user.id |
| `voided_at` | `TIMESTAMPTZ` | NULL |
| `voided_by` | `UUID` | NULL, FK → user.id |
| `void_reason` | `VARCHAR(255)` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`source_type` and `source_id` identify the originating domain event (e.g., `invoice`, `expense`, `payment`). Once `entry_status = 'posted'`, the entry and its lines are immutable.

**Indexes:** `uq_journal_entry_number (tenant_id, entry_number)`, `idx_journal_entry_accounting_period_id`, `idx_journal_entry_transaction_date`, `idx_journal_entry_source (tenant_id, source_type, source_id)`

---

### `journal_entry_line`

Debit or credit leg of a journal entry. Each entry must balance: sum of debits = sum of credits.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `journal_entry_id` | `UUID` | NOT NULL, FK → journal_entry.id |
| `line_number` | `INTEGER` | NOT NULL |
| `account_id` | `UUID` | NOT NULL, FK → chart_of_account.id |
| `entry_direction` | `ENUM` | NOT NULL (`debit`, `credit`) |
| `amount` | `BIGINT` | NOT NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `description` | `VARCHAR(255)` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only once the parent entry is posted.

**Indexes:** `idx_journal_entry_line_journal_entry_id`, `idx_journal_entry_line_account_id`, `uq_journal_entry_line_number (tenant_id, journal_entry_id, line_number)`

---

## 18. Inventory Domain

The Inventory Domain manages products, stock levels, warehouse locations, and stock movement history. It serves as the catalog and quantity authority for all other domains.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `product`

The master product record. Represents a sellable or stockable item.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `sku` | `VARCHAR(100)` | NOT NULL |
| `name` | `VARCHAR(255)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `product_type` | `ENUM` | NOT NULL (`physical`, `digital`, `service`, `bundle`) |
| `category_id` | `UUID` | NULL, FK → product_category.id |
| `unit_of_measure` | `VARCHAR(50)` | NOT NULL |
| `barcode` | `VARCHAR(100)` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_stockable` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_purchasable` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_sellable` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `base_price_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `base_price_currency` | `CHAR(3)` | NOT NULL, DEFAULT 'USD' |
| `cost_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `cost_currency` | `CHAR(3)` | NOT NULL, DEFAULT 'USD' |
| `weight_grams` | `NUMERIC(10,2)` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_product_sku (tenant_id, sku) WHERE deleted_at IS NULL`, `idx_product_tenant_id_category_id`, `idx_product_tenant_id_is_active`

---

### `product_category`

Hierarchical classification tree for products.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `slug` | `VARCHAR(150)` | NOT NULL |
| `parent_id` | `UUID` | NULL, FK → product_category.id |
| `position` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_product_category_slug (tenant_id, slug) WHERE deleted_at IS NULL`, `idx_product_category_parent_id`

---

### `warehouse`

A physical or logical location where inventory is held.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `code` | `VARCHAR(50)` | NOT NULL |
| `address_line1` | `VARCHAR(255)` | NULL |
| `address_line2` | `VARCHAR(255)` | NULL |
| `city` | `VARCHAR(100)` | NULL |
| `country_code` | `CHAR(2)` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_warehouse_code (tenant_id, code) WHERE deleted_at IS NULL`

---

### `stock_level`

Current on-hand, reserved, and available quantity for each product per warehouse. The authoritative quantity record — updated by stock movements, never edited directly.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `quantity_on_hand` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `quantity_reserved` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `quantity_available` | `NUMERIC(12,4)` | GENERATED AS (`quantity_on_hand - quantity_reserved`) STORED |
| `reorder_point` | `NUMERIC(12,4)` | NULL |
| `reorder_quantity` | `NUMERIC(12,4)` | NULL |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_stock_level (tenant_id, product_id, warehouse_id)`, `idx_stock_level_tenant_id_warehouse_id`

---

### `stock_movement`

Immutable record of every quantity change for a product in a warehouse. The ledger of inventory.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `movement_type` | `ENUM` | NOT NULL (`receipt`, `shipment`, `adjustment`, `transfer_in`, `transfer_out`, `return`, `write_off`) |
| `quantity` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_before` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_after` | `NUMERIC(12,4)` | NOT NULL |
| `reference_type` | `VARCHAR(100)` | NULL |
| `reference_id` | `UUID` | NULL |
| `notes` | `TEXT` | NULL |
| `performed_by` | `UUID` | NOT NULL, FK → user.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only. `reference_type` and `reference_id` link to the originating document (e.g., `purchase_order`, `shipment`, `adjustment`).

**Indexes:** `idx_stock_movement_tenant_id_product_id`, `idx_stock_movement_tenant_id_warehouse_id`, `idx_stock_movement_reference (tenant_id, reference_type, reference_id)`, `idx_stock_movement_created_at`

---

### `stock_adjustment`

Deliberate manual correction to stock quantities, requiring a reason and authorization.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `adjustment_number` | `VARCHAR(50)` | NOT NULL |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `adjustment_type` | `ENUM` | NOT NULL (`count`, `write_off`, `return`, `correction`) |
| `reason` | `TEXT` | NOT NULL |
| `adjustment_status` | `ENUM` | NOT NULL (`draft`, `approved`, `posted`, `cancelled`) |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `posted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_adjustment_number (tenant_id, adjustment_number)`, `idx_stock_adjustment_tenant_id_warehouse_id`

---

### `stock_adjustment_line`

Individual product quantity change within a stock adjustment.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `stock_adjustment_id` | `UUID` | NOT NULL, FK → stock_adjustment.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `quantity_counted` | `NUMERIC(12,4)` | NULL |
| `quantity_system` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_delta` | `NUMERIC(12,4)` | NOT NULL |
| `unit_cost_amount` | `BIGINT` | NULL |
| `unit_cost_currency` | `CHAR(3)` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_stock_adjustment_line_stock_adjustment_id`, `idx_stock_adjustment_line_product_id`

---

## 19. Purchasing Domain

The Purchasing Domain manages the procurement lifecycle: supplier management, purchase orders, and goods receipt. It feeds stock receipts into the Inventory Domain and costs into the Financial Operations Domain.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `supplier`

An external party from whom the tenant procures goods or services.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(255)` | NOT NULL |
| `reference_code` | `VARCHAR(100)` | NULL |
| `supplier_type` | `ENUM` | NOT NULL (`goods`, `services`, `both`) |
| `tax_number` | `VARCHAR(50)` | NULL |
| `currency` | `CHAR(3)` | NOT NULL, DEFAULT 'USD' |
| `payment_terms_days` | `INTEGER` | NOT NULL, DEFAULT 30 |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `notes` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_supplier_reference_code (tenant_id, reference_code) WHERE reference_code IS NOT NULL AND deleted_at IS NULL`, `idx_supplier_tenant_id_is_active`

---

### `supplier_contact`

Contact details for a supplier. Mirrors `customer_contact` in structure.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `supplier_id` | `UUID` | NOT NULL, FK → supplier.id |
| `contact_type` | `ENUM` | NOT NULL (`email`, `phone`, `fax`, `other`) |
| `value` | `VARCHAR(320)` | NOT NULL |
| `label` | `VARCHAR(100)` | NULL |
| `is_primary` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_supplier_contact_tenant_id_supplier_id`

---

### `purchase_order`

A formal document sent to a supplier requesting goods or services at agreed terms.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `po_number` | `VARCHAR(50)` | NOT NULL |
| `supplier_id` | `UUID` | NOT NULL, FK → supplier.id |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `po_status` | `ENUM` | NOT NULL (`draft`, `submitted`, `confirmed`, `partially_received`, `received`, `cancelled`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `subtotal_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `notes` | `TEXT` | NULL |
| `expected_delivery_date` | `DATE` | NULL |
| `submitted_at` | `TIMESTAMPTZ` | NULL |
| `confirmed_at` | `TIMESTAMPTZ` | NULL |
| `cancelled_at` | `TIMESTAMPTZ` | NULL |
| `cancellation_reason` | `VARCHAR(255)` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_purchase_order_po_number (tenant_id, po_number)`, `idx_purchase_order_tenant_id_supplier_id`, `idx_purchase_order_tenant_id_po_status`

---

### `purchase_order_line`

An individual product line within a purchase order.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `purchase_order_id` | `UUID` | NOT NULL, FK → purchase_order.id |
| `line_number` | `INTEGER` | NOT NULL |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `description` | `VARCHAR(255)` | NOT NULL |
| `quantity_ordered` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_received` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `unit_cost_amount` | `BIGINT` | NOT NULL |
| `unit_cost_currency` | `CHAR(3)` | NOT NULL |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `line_total_amount` | `BIGINT` | NOT NULL |
| `expected_delivery_date` | `DATE` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_purchase_order_line_purchase_order_id`, `idx_purchase_order_line_product_id`, `uq_purchase_order_line_number (tenant_id, purchase_order_id, line_number)`

---

### `goods_receipt`

Records the physical arrival of goods against a purchase order.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `receipt_number` | `VARCHAR(50)` | NOT NULL |
| `purchase_order_id` | `UUID` | NOT NULL, FK → purchase_order.id |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `receipt_status` | `ENUM` | NOT NULL (`draft`, `posted`, `cancelled`) |
| `received_date` | `DATE` | NOT NULL |
| `supplier_delivery_ref` | `VARCHAR(150)` | NULL |
| `notes` | `TEXT` | NULL |
| `posted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_goods_receipt_number (tenant_id, receipt_number)`, `idx_goods_receipt_purchase_order_id`

---

### `goods_receipt_line`

Quantity received per product line on a goods receipt. Supports partial receipts across multiple deliveries.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `goods_receipt_id` | `UUID` | NOT NULL, FK → goods_receipt.id |
| `purchase_order_line_id` | `UUID` | NOT NULL, FK → purchase_order_line.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `quantity_received` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_rejected` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `rejection_reason` | `VARCHAR(255)` | NULL |
| `unit_cost_amount` | `BIGINT` | NOT NULL |
| `unit_cost_currency` | `CHAR(3)` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

On posting, each line generates a `stock_movement` of type `receipt` and updates `stock_level.quantity_on_hand`.

**Indexes:** `idx_goods_receipt_line_goods_receipt_id`, `idx_goods_receipt_line_purchase_order_line_id`, `idx_goods_receipt_line_product_id`

---

### `supplier_invoice`

An invoice received from a supplier, matched against a purchase order for three-way verification.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `invoice_number` | `VARCHAR(100)` | NOT NULL |
| `supplier_id` | `UUID` | NOT NULL, FK → supplier.id |
| `purchase_order_id` | `UUID` | NULL, FK → purchase_order.id |
| `invoice_status` | `ENUM` | NOT NULL (`received`, `matched`, `approved`, `paid`, `disputed`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `total_amount` | `BIGINT` | NOT NULL |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `paid_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `invoice_date` | `DATE` | NOT NULL |
| `due_date` | `DATE` | NULL |
| `paid_at` | `TIMESTAMPTZ` | NULL |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `notes` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_supplier_invoice (tenant_id, supplier_id, invoice_number) WHERE deleted_at IS NULL`, `idx_supplier_invoice_purchase_order_id`, `idx_supplier_invoice_tenant_id_invoice_status`, `idx_supplier_invoice_tenant_id_due_date`

---

## 20. Treasury & Reconciliation Domain

The Treasury & Reconciliation Domain manages cash positions, payment method configuration, and the bank reconciliation process. It is the boundary between internal financial records and external financial institutions.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

**Model:** Cash enters and exits through `bank_account` and `cash_account` records. Every movement is captured as a `financial_transaction`. Reconciliation matches internal transactions to external bank statement lines via `matching_session` and `matching_result`.

---

### `transaction_source`

Reference catalog defining where a financial transaction originates. Global — not tenant-scoped. Seeded at deployment.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `key` | `VARCHAR(100)` | NOT NULL, UNIQUE |
| `label` | `VARCHAR(150)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`key` follows the pattern `{domain}:{event}` — e.g., `orders:payment`, `purchasing:supplier_invoice`, `treasury:manual_entry`, `payroll:disbursement`.

**Indexes:** `uq_transaction_source_key (key)`

---

### `payment_method`

Configures a payment method available to the tenant for sending or receiving funds.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(100)` | NOT NULL |
| `method_type` | `ENUM` | NOT NULL (`bank_transfer`, `cash`, `card`, `cheque`, `digital_wallet`, `other`) |
| `is_inbound` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_outbound` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `gl_account_id` | `UUID` | NULL, FK → chart_of_account.id |
| `config` | `JSONB` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`config` holds method-specific metadata (e.g., gateway credentials reference, wallet identifiers). Never store raw secrets here — reference a secrets manager key only.

**Indexes:** `idx_payment_method_tenant_id_method_type`, `idx_payment_method_tenant_id_is_active`

---

### `bank_account`

A tenant's external bank account, linked to a GL account for ledger posting.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `bank_name` | `VARCHAR(150)` | NOT NULL |
| `account_number_masked` | `VARCHAR(50)` | NOT NULL |
| `iban` | `VARCHAR(34)` | NULL |
| `swift_bic` | `VARCHAR(11)` | NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `gl_account_id` | `UUID` | NOT NULL, FK → chart_of_account.id |
| `current_balance_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `last_statement_date` | `DATE` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`account_number_masked` stores only the last 4 digits (e.g., `****4321`). Full account numbers are never persisted in the database.

**Indexes:** `idx_bank_account_tenant_id_is_active`, `idx_bank_account_tenant_id_gl_account_id`

---

### `cash_account`

A petty cash or till account managed internally, not tied to an external bank.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `gl_account_id` | `UUID` | NOT NULL, FK → chart_of_account.id |
| `current_balance_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_cash_account_tenant_id_is_active`

---

### `payment_status`

Reference table defining every lifecycle status a `financial_transaction` can hold. Global — not tenant-scoped. Seeded at deployment.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `key` | `VARCHAR(50)` | NOT NULL, UNIQUE |
| `label` | `VARCHAR(100)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `is_terminal` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Terminal statuses (`completed`, `failed`, `cancelled`, `refunded`) cannot transition further. Enforced at the application layer.

Seed values: `pending`, `processing`, `completed`, `failed`, `cancelled`, `refunded`, `on_hold`, `disputed`.

**Indexes:** `uq_payment_status_key (key)`

---

### `financial_transaction`

The central record for every cash movement — inbound or outbound — across bank and cash accounts. Feeds journal entries in the Accounting Domain.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `transaction_number` | `VARCHAR(50)` | NOT NULL |
| `transaction_type` | `ENUM` | NOT NULL (`receipt`, `payment`, `transfer`, `refund`, `adjustment`) |
| `transaction_status_key` | `VARCHAR(50)` | NOT NULL, FK → payment_status.key |
| `source_key` | `VARCHAR(100)` | NOT NULL, FK → transaction_source.key |
| `source_id` | `UUID` | NULL |
| `payment_method_id` | `UUID` | NULL, FK → payment_method.id |
| `bank_account_id` | `UUID` | NULL, FK → bank_account.id |
| `cash_account_id` | `UUID` | NULL, FK → cash_account.id |
| `counterparty_type` | `ENUM` | NULL (`customer`, `supplier`, `employee`, `other`) |
| `counterparty_id` | `UUID` | NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `amount` | `BIGINT` | NOT NULL |
| `exchange_rate` | `NUMERIC(19,4)` | NULL |
| `base_currency_amount` | `BIGINT` | NULL |
| `reference` | `VARCHAR(255)` | NULL |
| `description` | `TEXT` | NULL |
| `transaction_date` | `DATE` | NOT NULL |
| `value_date` | `DATE` | NULL |
| `journal_entry_id` | `UUID` | NULL, FK → journal_entry.id |
| `reconciled_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Exactly one of `bank_account_id` or `cash_account_id` must be non-null. Enforced at the application layer. `source_id` references the originating record in its domain (e.g., `invoice.id`, `supplier_invoice.id`). `counterparty_id` resolves against `counterparty_type` — not enforced via FK.

**Indexes:** `uq_transaction_number (tenant_id, transaction_number)`, `idx_financial_transaction_tenant_id_transaction_date`, `idx_financial_transaction_tenant_id_transaction_status_key`, `idx_financial_transaction_tenant_id_bank_account_id`, `idx_financial_transaction_tenant_id_cash_account_id`, `idx_financial_transaction_source (tenant_id, source_key, source_id)`, `idx_financial_transaction_journal_entry_id`

---

### `matching_session`

A reconciliation run that attempts to match internal `financial_transaction` records against an imported bank statement or external feed.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `bank_account_id` | `UUID` | NOT NULL, FK → bank_account.id |
| `session_status` | `ENUM` | NOT NULL (`pending`, `running`, `review`, `completed`, `cancelled`) |
| `statement_from_date` | `DATE` | NOT NULL |
| `statement_to_date` | `DATE` | NOT NULL |
| `statement_file_name` | `VARCHAR(255)` | NULL |
| `statement_storage_key` | `TEXT` | NULL |
| `total_statement_lines` | `INTEGER` | NULL |
| `matched_lines` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `unmatched_lines` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `disputed_lines` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `opening_balance_amount` | `BIGINT` | NULL |
| `closing_balance_amount` | `BIGINT` | NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `completed_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_matching_session_tenant_id_bank_account_id`, `idx_matching_session_tenant_id_session_status`

---

### `matching_result`

Row-level outcome of a reconciliation attempt — one record per bank statement line processed within a session.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `matching_session_id` | `UUID` | NOT NULL, FK → matching_session.id |
| `statement_line_ref` | `VARCHAR(150)` | NOT NULL |
| `statement_date` | `DATE` | NOT NULL |
| `statement_description` | `TEXT` | NULL |
| `statement_amount` | `BIGINT` | NOT NULL |
| `statement_currency` | `CHAR(3)` | NOT NULL |
| `match_status` | `ENUM` | NOT NULL (`matched`, `unmatched`, `disputed`, `manually_matched`, `ignored`) |
| `match_confidence` | `NUMERIC(5,4)` | NULL |
| `financial_transaction_id` | `UUID` | NULL, FK → financial_transaction.id |
| `match_method` | `ENUM` | NULL (`auto`, `manual`) |
| `matched_by` | `UUID` | NULL, FK → user.id |
| `matched_at` | `TIMESTAMPTZ` | NULL |
| `dispute_reason` | `TEXT` | NULL |
| `resolved_at` | `TIMESTAMPTZ` | NULL |
| `resolved_by` | `UUID` | NULL, FK → user.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`match_confidence` is a score between `0.0000` and `1.0000` produced by the auto-matching engine. Scores below the configured threshold require manual review. Rows with `match_status = 'unmatched'` may trigger creation of a new `financial_transaction` after user confirmation.

**Indexes:** `idx_matching_result_matching_session_id`, `idx_matching_result_financial_transaction_id`, `idx_matching_result_match_status`, `uq_matching_result_statement_line (tenant_id, matching_session_id, statement_line_ref)`

---

## 21. Accounting Domain — Extended

This section expands §17 with the full accounting model. The definitions here are authoritative and supersede the preliminary definitions in §17 where names overlap. New tables — `account_type`, `cost_center`, `fixed_asset`, `asset_depreciation`, and `account_balance` — are introduced here for the first time. `journal_entry_line` is expanded to carry `cost_center_id`. `financial_year` replaces `fiscal_year`. `fiscal_period` replaces `accounting_period`. `chart_of_account` is expanded to reference `account_type` as a FK rather than an ENUM.

**Scope:** Tenant-scoped except `account_type`, which is global. All tenant tables carry `tenant_id`.

---

### `account_type`

Global reference table defining the classification and normal balance of every account type in the system. Seeded at deployment. Not tenant-scoped.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `key` | `VARCHAR(50)` | NOT NULL, UNIQUE |
| `label` | `VARCHAR(100)` | NOT NULL |
| `category` | `ENUM` | NOT NULL (`asset`, `liability`, `equity`, `revenue`, `expense`) |
| `normal_balance` | `ENUM` | NOT NULL (`debit`, `credit`) |
| `is_balance_sheet` | `BOOLEAN` | NOT NULL |
| `is_income_statement` | `BOOLEAN` | NOT NULL |
| `description` | `TEXT` | NULL |
| `position` | `INTEGER` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`normal_balance` determines the side that increases the account: assets and expenses are debit-normal; liabilities, equity, and revenue are credit-normal. Used by the reporting engine to calculate net balances correctly.

Seed values: `current_asset`, `non_current_asset`, `current_liability`, `non_current_liability`, `equity`, `operating_revenue`, `other_revenue`, `cost_of_goods_sold`, `operating_expense`, `depreciation`, `tax_expense`.

**Indexes:** `uq_account_type_key (key)`

---

### `chart_of_account`

The tenant's full account register. Supersedes the §17 definition — adds `account_type_id` FK in place of the ENUM, adds `cost_center_id` linkage and balance tracking columns.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `code` | `VARCHAR(20)` | NOT NULL |
| `name` | `VARCHAR(150)` | NOT NULL |
| `account_type_id` | `UUID` | NOT NULL, FK → account_type.id |
| `parent_id` | `UUID` | NULL, FK → chart_of_account.id |
| `currency` | `CHAR(3)` | NOT NULL |
| `cost_center_id` | `UUID` | NULL, FK → cost_center.id |
| `is_system` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `allow_direct_posting` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `description` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`allow_direct_posting` is `FALSE` for summary/header accounts that exist only for grouping. Journal entry lines may only post to accounts where this is `TRUE`.

**Indexes:** `uq_chart_of_account_code (tenant_id, code) WHERE deleted_at IS NULL`, `idx_chart_of_account_account_type_id`, `idx_chart_of_account_parent_id`

---

### `cost_center`

An organizational dimension for allocating revenue and expenses across departments, projects, or business units.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `code` | `VARCHAR(20)` | NOT NULL |
| `name` | `VARCHAR(150)` | NOT NULL |
| `cost_center_type` | `ENUM` | NOT NULL (`department`, `project`, `location`, `product_line`, `other`) |
| `parent_id` | `UUID` | NULL, FK → cost_center.id |
| `manager_id` | `UUID` | NULL, FK → user.id |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_cost_center_code (tenant_id, code) WHERE deleted_at IS NULL`, `idx_cost_center_parent_id`

---

### `financial_year`

Defines the tenant's fiscal year boundaries. Supersedes `fiscal_year` from §17 — adds `locked_at` and period count tracking.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(100)` | NOT NULL |
| `start_date` | `DATE` | NOT NULL |
| `end_date` | `DATE` | NOT NULL |
| `period_count` | `INTEGER` | NOT NULL, DEFAULT 12 |
| `year_status` | `ENUM` | NOT NULL (`open`, `locked`, `closed`) |
| `locked_at` | `TIMESTAMPTZ` | NULL |
| `locked_by` | `UUID` | NULL, FK → user.id |
| `closed_at` | `TIMESTAMPTZ` | NULL |
| `closed_by` | `UUID` | NULL, FK → user.id |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

A `locked` year permits read-only reporting but prevents new postings. A `closed` year has had its closing entries posted and balances rolled into the next year's opening.

**Indexes:** `uq_financial_year_dates (tenant_id, start_date)`, `idx_financial_year_tenant_id_year_status`

---

### `fiscal_period`

A sub-period within a financial year, typically monthly. Supersedes `accounting_period` from §17 — adds `period_type` and adjustment period support.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `financial_year_id` | `UUID` | NOT NULL, FK → financial_year.id |
| `name` | `VARCHAR(50)` | NOT NULL |
| `period_number` | `INTEGER` | NOT NULL |
| `period_type` | `ENUM` | NOT NULL (`regular`, `adjustment`, `closing`) |
| `start_date` | `DATE` | NOT NULL |
| `end_date` | `DATE` | NOT NULL |
| `period_status` | `ENUM` | NOT NULL (`open`, `locked`, `closed`) |
| `locked_at` | `TIMESTAMPTZ` | NULL |
| `locked_by` | `UUID` | NULL, FK → user.id |
| `closed_at` | `TIMESTAMPTZ` | NULL |
| `closed_by` | `UUID` | NULL, FK → user.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`adjustment` periods allow year-end corrections after the last regular period closes but before the year itself closes. `closing` periods hold the formal closing entries only.

**Indexes:** `idx_fiscal_period_financial_year_id`, `uq_fiscal_period_number (tenant_id, financial_year_id, period_number)`, `idx_fiscal_period_tenant_id_period_status`

---

### `journal_entry`

Header record for a double-entry transaction. Definition matches §17 — `fiscal_period_id` replaces `accounting_period_id` to align with the updated naming.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `entry_number` | `VARCHAR(50)` | NOT NULL |
| `fiscal_period_id` | `UUID` | NOT NULL, FK → fiscal_period.id |
| `entry_type` | `ENUM` | NOT NULL (`manual`, `system`, `adjustment`, `closing`, `reversal`) |
| `entry_status` | `ENUM` | NOT NULL (`draft`, `posted`, `void`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `description` | `TEXT` | NOT NULL |
| `reference` | `VARCHAR(255)` | NULL |
| `source_type` | `VARCHAR(100)` | NULL |
| `source_id` | `UUID` | NULL |
| `reversal_of_id` | `UUID` | NULL, FK → journal_entry.id |
| `transaction_date` | `DATE` | NOT NULL |
| `posted_at` | `TIMESTAMPTZ` | NULL |
| `posted_by` | `UUID` | NULL, FK → user.id |
| `voided_at` | `TIMESTAMPTZ` | NULL |
| `voided_by` | `UUID` | NULL, FK → user.id |
| `void_reason` | `VARCHAR(255)` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`reversal_of_id` links a reversal entry back to the entry it negates. Once `entry_status = 'posted'`, the entry and all its lines are immutable.

**Indexes:** `uq_journal_entry_number (tenant_id, entry_number)`, `idx_journal_entry_fiscal_period_id`, `idx_journal_entry_transaction_date`, `idx_journal_entry_source (tenant_id, source_type, source_id)`, `idx_journal_entry_reversal_of_id`

---

### `journal_entry_line`

Debit or credit leg of a journal entry. Expanded from §17 — adds `cost_center_id` for dimensional reporting.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `journal_entry_id` | `UUID` | NOT NULL, FK → journal_entry.id |
| `line_number` | `INTEGER` | NOT NULL |
| `account_id` | `UUID` | NOT NULL, FK → chart_of_account.id |
| `cost_center_id` | `UUID` | NULL, FK → cost_center.id |
| `entry_direction` | `ENUM` | NOT NULL (`debit`, `credit`) |
| `amount` | `BIGINT` | NOT NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `exchange_rate` | `NUMERIC(19,4)` | NULL |
| `base_currency_amount` | `BIGINT` | NULL |
| `description` | `VARCHAR(255)` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only once the parent entry is posted. `base_currency_amount` stores the tenant's home currency equivalent when `currency` differs from the account's home currency.

**Indexes:** `idx_journal_entry_line_journal_entry_id`, `idx_journal_entry_line_account_id`, `idx_journal_entry_line_cost_center_id`, `uq_journal_entry_line_number (tenant_id, journal_entry_id, line_number)`

---

### `fixed_asset`

A long-lived tangible or intangible asset owned by the tenant and subject to depreciation.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `asset_number` | `VARCHAR(50)` | NOT NULL |
| `name` | `VARCHAR(255)` | NOT NULL |
| `asset_type` | `ENUM` | NOT NULL (`tangible`, `intangible`) |
| `asset_category` | `VARCHAR(100)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `serial_number` | `VARCHAR(150)` | NULL |
| `location` | `VARCHAR(255)` | NULL |
| `cost_center_id` | `UUID` | NULL, FK → cost_center.id |
| `asset_account_id` | `UUID` | NOT NULL, FK → chart_of_account.id |
| `accumulated_depreciation_account_id` | `UUID` | NOT NULL, FK → chart_of_account.id |
| `depreciation_expense_account_id` | `UUID` | NOT NULL, FK → chart_of_account.id |
| `depreciation_method` | `ENUM` | NOT NULL (`straight_line`, `declining_balance`, `units_of_production`, `none`) |
| `useful_life_months` | `INTEGER` | NULL |
| `salvage_value_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `salvage_value_currency` | `CHAR(3)` | NOT NULL |
| `purchase_cost_amount` | `BIGINT` | NOT NULL |
| `purchase_cost_currency` | `CHAR(3)` | NOT NULL |
| `purchase_date` | `DATE` | NOT NULL |
| `in_service_date` | `DATE` | NULL |
| `disposal_date` | `DATE` | NULL |
| `disposal_amount` | `BIGINT` | NULL |
| `asset_status` | `ENUM` | NOT NULL (`active`, `disposed`, `fully_depreciated`, `impaired`, `held_for_sale`) |
| `supplier_id` | `UUID` | NULL, FK → supplier.id |
| `purchase_order_id` | `UUID` | NULL, FK → purchase_order.id |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Three GL accounts are required per asset: the asset account (debit on purchase), the accumulated depreciation contra account (credit on depreciation), and the depreciation expense account (debit on depreciation).

**Indexes:** `uq_fixed_asset_number (tenant_id, asset_number) WHERE deleted_at IS NULL`, `idx_fixed_asset_tenant_id_asset_status`, `idx_fixed_asset_tenant_id_cost_center_id`

---

### `asset_depreciation`

Records each depreciation charge computed for a fixed asset per fiscal period. Generated by the depreciation run and posted as journal entries.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `fixed_asset_id` | `UUID` | NOT NULL, FK → fixed_asset.id |
| `fiscal_period_id` | `UUID` | NOT NULL, FK → fiscal_period.id |
| `depreciation_amount` | `BIGINT` | NOT NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `book_value_before` | `BIGINT` | NOT NULL |
| `book_value_after` | `BIGINT` | NOT NULL |
| `accumulated_depreciation` | `BIGINT` | NOT NULL |
| `depreciation_method` | `ENUM` | NOT NULL (`straight_line`, `declining_balance`, `units_of_production`) |
| `journal_entry_id` | `UUID` | NULL, FK → journal_entry.id |
| `is_posted` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `posted_at` | `TIMESTAMPTZ` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only. One row per asset per fiscal period. Once posted, the linked journal entry is immutable. Re-running depreciation for a period requires reversing and reposting — not editing this record.

**Indexes:** `uq_asset_depreciation (tenant_id, fixed_asset_id, fiscal_period_id)`, `idx_asset_depreciation_fiscal_period_id`, `idx_asset_depreciation_journal_entry_id`

---

### `account_balance`

Stores the computed opening balance, period activity, and closing balance for each GL account per fiscal period. Populated by the period-close process. Used by reporting to avoid full ledger re-aggregation on every query.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `account_id` | `UUID` | NOT NULL, FK → chart_of_account.id |
| `fiscal_period_id` | `UUID` | NOT NULL, FK → fiscal_period.id |
| `cost_center_id` | `UUID` | NULL, FK → cost_center.id |
| `currency` | `CHAR(3)` | NOT NULL |
| `opening_debit_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `opening_credit_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `period_debit_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `period_credit_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `closing_debit_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `closing_credit_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `net_balance_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `is_finalized` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `computed_at` | `TIMESTAMPTZ` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`net_balance_amount` is the closing balance expressed in the account's normal balance direction: positive means the account has a normal balance, negative means it is contra. `is_finalized` is set `TRUE` when the period is closed and the balance is locked. Interim (open-period) balances are recomputed on each posting and marked `is_finalized = FALSE`. When `cost_center_id` is `NULL`, the row represents the account total across all cost centers.

**Indexes:** `uq_account_balance (tenant_id, account_id, fiscal_period_id, cost_center_id)`, `idx_account_balance_fiscal_period_id`, `idx_account_balance_account_id`

---

## 22. Inventory Domain — Extended

This section expands §18 with the full inventory model. Definitions here are authoritative and supersede §18 where names overlap. New tables — `product_variant`, `stock_balance`, `inventory_count`, and `inventory_count_line` — are introduced here for the first time. `inventory_adjustment` and `inventory_adjustment_line` replace `stock_adjustment` and `stock_adjustment_line` from §18. `stock_balance` replaces `stock_level` from §18.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `product_category`

Hierarchical product classification. Supersedes the §18 definition — adds `image_url` and `metadata` for catalog use.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `slug` | `VARCHAR(150)` | NOT NULL |
| `parent_id` | `UUID` | NULL, FK → product_category.id |
| `description` | `TEXT` | NULL |
| `image_url` | `TEXT` | NULL |
| `position` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `metadata` | `JSONB` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_product_category_slug (tenant_id, slug) WHERE deleted_at IS NULL`, `idx_product_category_parent_id`, `idx_product_category_tenant_id_is_active`

---

### `product`

Master product record. Supersedes the §18 definition — adds `has_variants`, `track_serial`, `track_batch`, and `gl_account_id` for direct inventory valuation linkage.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `sku` | `VARCHAR(100)` | NOT NULL |
| `name` | `VARCHAR(255)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `product_type` | `ENUM` | NOT NULL (`physical`, `digital`, `service`, `bundle`) |
| `category_id` | `UUID` | NULL, FK → product_category.id |
| `unit_of_measure` | `VARCHAR(50)` | NOT NULL |
| `barcode` | `VARCHAR(100)` | NULL |
| `has_variants` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_stockable` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_purchasable` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_sellable` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `track_serial` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `track_batch` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `base_price_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `base_price_currency` | `CHAR(3)` | NOT NULL, DEFAULT 'USD' |
| `cost_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `cost_currency` | `CHAR(3)` | NOT NULL, DEFAULT 'USD' |
| `weight_grams` | `NUMERIC(10,2)` | NULL |
| `gl_inventory_account_id` | `UUID` | NULL, FK → chart_of_account.id |
| `gl_cogs_account_id` | `UUID` | NULL, FK → chart_of_account.id |
| `tax_rate_id` | `UUID` | NULL, FK → tax_rate.id |
| `image_url` | `TEXT` | NULL |
| `metadata` | `JSONB` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

When `has_variants = TRUE`, stock is tracked at the `product_variant` level, not the `product` level. `gl_inventory_account_id` and `gl_cogs_account_id` override the system default GL accounts for this product.

**Indexes:** `uq_product_sku (tenant_id, sku) WHERE deleted_at IS NULL`, `idx_product_tenant_id_category_id`, `idx_product_tenant_id_is_active`, `idx_product_tenant_id_product_type`

---

### `product_variant`

A stockable variation of a product distinguished by one or more attribute combinations (e.g., size, color, material). Each variant carries its own SKU and is the unit of stock tracking when `product.has_variants = TRUE`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `sku` | `VARCHAR(100)` | NOT NULL |
| `name` | `VARCHAR(255)` | NOT NULL |
| `barcode` | `VARCHAR(100)` | NULL |
| `attributes` | `JSONB` | NOT NULL, DEFAULT '{}' |
| `base_price_amount` | `BIGINT` | NULL |
| `base_price_currency` | `CHAR(3)` | NULL |
| `cost_amount` | `BIGINT` | NULL |
| `cost_currency` | `CHAR(3)` | NULL |
| `weight_grams` | `NUMERIC(10,2)` | NULL |
| `image_url` | `TEXT` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `position` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`attributes` stores the variant dimension values as a JSON object: `{"color": "black", "size": "L"}`. `base_price_amount` and `cost_amount` are nullable — when null the parent `product` values apply. SKU uniqueness is enforced across both products and variants within the same tenant.

**Indexes:** `uq_product_variant_sku (tenant_id, sku) WHERE deleted_at IS NULL`, `idx_product_variant_product_id`, `idx_product_variant_tenant_id_is_active`

---

### `warehouse`

A physical or logical stock location. Supersedes the §18 definition — adds `warehouse_type` and `is_virtual`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `code` | `VARCHAR(50)` | NOT NULL |
| `warehouse_type` | `ENUM` | NOT NULL (`physical`, `virtual`, `transit`, `returns`) |
| `is_virtual` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `address_line1` | `VARCHAR(255)` | NULL |
| `address_line2` | `VARCHAR(255)` | NULL |
| `city` | `VARCHAR(100)` | NULL |
| `state` | `VARCHAR(100)` | NULL |
| `postal_code` | `VARCHAR(20)` | NULL |
| `country_code` | `CHAR(2)` | NULL |
| `gl_account_id` | `UUID` | NULL, FK → chart_of_account.id |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`transit` warehouses hold stock in-transit between two physical locations. `returns` warehouses isolate returned goods pending inspection. `is_virtual = TRUE` indicates the warehouse has no physical address and is used for system-level stock tracking only.

**Indexes:** `uq_warehouse_code (tenant_id, code) WHERE deleted_at IS NULL`, `idx_warehouse_tenant_id_is_active`

---

### `stock_balance`

Current on-hand, reserved, and available quantity per product (or variant) per warehouse. Supersedes `stock_level` from §18 — adds `product_variant_id`, `last_movement_id` traceability, and explicit `quantity_in_transit`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `product_variant_id` | `UUID` | NULL, FK → product_variant.id |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `quantity_on_hand` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `quantity_reserved` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `quantity_in_transit` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `quantity_available` | `NUMERIC(12,4)` | GENERATED AS (`quantity_on_hand - quantity_reserved`) STORED |
| `reorder_point` | `NUMERIC(12,4)` | NULL |
| `reorder_quantity` | `NUMERIC(12,4)` | NULL |
| `last_movement_id` | `UUID` | NULL, FK → stock_movement.id |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

When `product.has_variants = TRUE`, `product_variant_id` is required. When `FALSE`, `product_variant_id` is `NULL`. This constraint is enforced at the application layer. `quantity_available` is a stored generated column; never updated directly.

**Indexes:** `uq_stock_balance (tenant_id, product_id, product_variant_id, warehouse_id)`, `idx_stock_balance_tenant_id_warehouse_id`, `idx_stock_balance_product_variant_id`

---

### `stock_movement`

Immutable ledger of every quantity change across products, variants, and warehouses. Supersedes the §18 definition — adds `product_variant_id`, `unit_cost_amount`, `lot_number`, and `serial_number`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `product_variant_id` | `UUID` | NULL, FK → product_variant.id |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `movement_type` | `ENUM` | NOT NULL (`receipt`, `shipment`, `adjustment`, `transfer_in`, `transfer_out`, `return`, `write_off`, `count_correction`) |
| `quantity` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_before` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_after` | `NUMERIC(12,4)` | NOT NULL |
| `unit_cost_amount` | `BIGINT` | NULL |
| `unit_cost_currency` | `CHAR(3)` | NULL |
| `lot_number` | `VARCHAR(100)` | NULL |
| `serial_number` | `VARCHAR(100)` | NULL |
| `expiry_date` | `DATE` | NULL |
| `reference_type` | `VARCHAR(100)` | NULL |
| `reference_id` | `UUID` | NULL |
| `notes` | `TEXT` | NULL |
| `performed_by` | `UUID` | NOT NULL, FK → user.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only. `quantity` is signed: positive for inflows, negative for outflows. `reference_type` and `reference_id` link to the originating document. `count_correction` is written only by `inventory_count` posting.

**Indexes:** `idx_stock_movement_tenant_id_product_id`, `idx_stock_movement_tenant_id_product_variant_id`, `idx_stock_movement_tenant_id_warehouse_id`, `idx_stock_movement_reference (tenant_id, reference_type, reference_id)`, `idx_stock_movement_created_at`

---

### `inventory_count`

A physical stock-count session for one or more products in a warehouse. Counts are drafted, submitted for review, then posted — posting writes `stock_movement` records and updates `stock_balance`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `count_number` | `VARCHAR(50)` | NOT NULL |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `count_type` | `ENUM` | NOT NULL (`full`, `partial`, `cycle`) |
| `count_status` | `ENUM` | NOT NULL (`draft`, `in_progress`, `submitted`, `approved`, `posted`, `cancelled`) |
| `scheduled_date` | `DATE` | NOT NULL |
| `counted_date` | `DATE` | NULL |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `posted_at` | `TIMESTAMPTZ` | NULL |
| `notes` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

A `full` count covers all products in the warehouse. A `partial` count covers a specified subset. A `cycle` count covers a rotating subset on a scheduled cadence.

**Indexes:** `uq_inventory_count_number (tenant_id, count_number)`, `idx_inventory_count_tenant_id_warehouse_id`, `idx_inventory_count_tenant_id_count_status`

---

### `inventory_count_line`

One row per product (or variant) counted within an inventory count session. Records the system quantity at count time and the physically counted quantity.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `inventory_count_id` | `UUID` | NOT NULL, FK → inventory_count.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `product_variant_id` | `UUID` | NULL, FK → product_variant.id |
| `lot_number` | `VARCHAR(100)` | NULL |
| `quantity_system` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_counted` | `NUMERIC(12,4)` | NULL |
| `quantity_delta` | `NUMERIC(12,4)` | GENERATED AS (`quantity_counted - quantity_system`) STORED |
| `unit_cost_amount` | `BIGINT` | NULL |
| `unit_cost_currency` | `CHAR(3)` | NULL |
| `line_status` | `ENUM` | NOT NULL (`pending`, `counted`, `confirmed`, `skipped`) |
| `counted_by` | `UUID` | NULL, FK → user.id |
| `counted_at` | `TIMESTAMPTZ` | NULL |
| `stock_movement_id` | `UUID` | NULL, FK → stock_movement.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`quantity_system` is captured from `stock_balance` at the moment the count line is created and is frozen thereafter. `quantity_counted` is filled by the warehouse operative. `quantity_delta` is a stored generated column. On posting, non-zero delta lines generate a `stock_movement` of type `count_correction` and `stock_movement_id` is set.

**Indexes:** `idx_inventory_count_line_inventory_count_id`, `idx_inventory_count_line_product_id`, `uq_inventory_count_line (tenant_id, inventory_count_id, product_id, product_variant_id, lot_number)`

---

### `inventory_adjustment`

A deliberate manual correction to stock quantities requiring a stated reason and approval before posting. Supersedes `stock_adjustment` from §18 — adds `adjustment_method` and GL linkage.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `adjustment_number` | `VARCHAR(50)` | NOT NULL |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `adjustment_type` | `ENUM` | NOT NULL (`write_off`, `write_on`, `correction`, `return`, `damage`, `expiry`) |
| `adjustment_method` | `ENUM` | NOT NULL (`quantity_only`, `quantity_and_value`) |
| `reason` | `TEXT` | NOT NULL |
| `adjustment_status` | `ENUM` | NOT NULL (`draft`, `submitted`, `approved`, `posted`, `cancelled`) |
| `gl_account_id` | `UUID` | NULL, FK → chart_of_account.id |
| `journal_entry_id` | `UUID` | NULL, FK → journal_entry.id |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `posted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`adjustment_method = 'quantity_and_value'` requires `gl_account_id` and generates a `journal_entry` on posting. `adjustment_method = 'quantity_only'` adjusts `stock_balance` only with no GL impact — used when the financial impact has already been recorded through another domain.

**Indexes:** `uq_inventory_adjustment_number (tenant_id, adjustment_number)`, `idx_inventory_adjustment_tenant_id_warehouse_id`, `idx_inventory_adjustment_tenant_id_adjustment_status`

---

### `inventory_adjustment_line`

One line per product (or variant) within an inventory adjustment. Supersedes `stock_adjustment_line` from §18 — adds `product_variant_id`, `lot_number`, and `stock_movement_id`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `inventory_adjustment_id` | `UUID` | NOT NULL, FK → inventory_adjustment.id |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `product_variant_id` | `UUID` | NULL, FK → product_variant.id |
| `lot_number` | `VARCHAR(100)` | NULL |
| `quantity_before` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_delta` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_after` | `NUMERIC(12,4)` | NOT NULL |
| `unit_cost_amount` | `BIGINT` | NULL |
| `unit_cost_currency` | `CHAR(3)` | NULL |
| `stock_movement_id` | `UUID` | NULL, FK → stock_movement.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`quantity_delta` is signed: positive adds stock, negative removes it. `stock_movement_id` is populated on posting. `quantity_before` is frozen from `stock_balance` at draft time and must not be recalculated after the adjustment is submitted.

**Indexes:** `idx_inventory_adjustment_line_inventory_adjustment_id`, `idx_inventory_adjustment_line_product_id`, `idx_inventory_adjustment_line_product_variant_id`

---

## 23. Purchasing Domain — Extended

This section expands §19 with a complete vendor and procurement model. Definitions here are authoritative and supersede §19 where names overlap. `vendor` replaces `supplier` as the primary entity name. `purchase_order` and `purchase_order_item` supersede `purchase_order` and `purchase_order_line` from §19. New tables — `purchase_return`, `purchase_return_item`, `vendor_payment`, and `vendor_statement` — are introduced here for the first time.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `vendor`

An external party from whom the tenant procures goods or services. Supersedes `supplier` from §19 — adds `payment_method_id`, `tax_treatment`, `credit_limit`, and `rating`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `vendor_number` | `VARCHAR(50)` | NOT NULL |
| `name` | `VARCHAR(255)` | NOT NULL |
| `vendor_type` | `ENUM` | NOT NULL (`goods`, `services`, `both`) |
| `tax_number` | `VARCHAR(50)` | NULL |
| `tax_treatment` | `ENUM` | NOT NULL (`taxable`, `exempt`, `zero_rated`) |
| `currency` | `CHAR(3)` | NOT NULL, DEFAULT 'USD' |
| `payment_terms_days` | `INTEGER` | NOT NULL, DEFAULT 30 |
| `payment_method_id` | `UUID` | NULL, FK → payment_method.id |
| `credit_limit_amount` | `BIGINT` | NULL |
| `credit_limit_currency` | `CHAR(3)` | NULL |
| `gl_payable_account_id` | `UUID` | NULL, FK → chart_of_account.id |
| `rating` | `SMALLINT` | NULL |
| `website` | `TEXT` | NULL |
| `notes` | `TEXT` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `is_approved` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`rating` is an integer 1–5 set manually by procurement staff. `is_approved` gates whether purchase orders can be raised against this vendor.

**Indexes:** `uq_vendor_number (tenant_id, vendor_number) WHERE deleted_at IS NULL`, `idx_vendor_tenant_id_is_active`, `idx_vendor_tenant_id_is_approved`

---

### `vendor_contact`

Contact points for a vendor. Mirrors `customer_contact` in structure.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `vendor_id` | `UUID` | NOT NULL, FK → vendor.id |
| `contact_type` | `ENUM` | NOT NULL (`email`, `phone`, `fax`, `other`) |
| `value` | `VARCHAR(320)` | NOT NULL |
| `label` | `VARCHAR(100)` | NULL |
| `is_primary` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_vendor_contact_tenant_id_vendor_id`

---

### `vendor_address`

Physical and billing addresses for a vendor.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `vendor_id` | `UUID` | NOT NULL, FK → vendor.id |
| `address_type` | `ENUM` | NOT NULL (`billing`, `remittance`, `shipping`, `other`) |
| `label` | `VARCHAR(100)` | NULL |
| `line1` | `VARCHAR(255)` | NOT NULL |
| `line2` | `VARCHAR(255)` | NULL |
| `city` | `VARCHAR(100)` | NOT NULL |
| `state` | `VARCHAR(100)` | NULL |
| `postal_code` | `VARCHAR(20)` | NULL |
| `country_code` | `CHAR(2)` | NOT NULL |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_vendor_address_tenant_id_vendor_id`

---

### `purchase_order`

A formal procurement document issued to a vendor. Supersedes the §19 definition — adds `approved_by`, `priority`, `delivery_address_snapshot`, and GL linkage.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `po_number` | `VARCHAR(50)` | NOT NULL |
| `vendor_id` | `UUID` | NOT NULL, FK → vendor.id |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `requisition_ref` | `VARCHAR(100)` | NULL |
| `po_status` | `ENUM` | NOT NULL (`draft`, `submitted`, `approved`, `sent`, `partially_received`, `received`, `closed`, `cancelled`) |
| `priority` | `ENUM` | NOT NULL (`normal`, `urgent`, `critical`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `subtotal_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `discount_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `received_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `billed_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `delivery_address_snapshot` | `JSONB` | NULL |
| `notes` | `TEXT` | NULL |
| `terms` | `TEXT` | NULL |
| `expected_delivery_date` | `DATE` | NULL |
| `submitted_at` | `TIMESTAMPTZ` | NULL |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `sent_at` | `TIMESTAMPTZ` | NULL |
| `closed_at` | `TIMESTAMPTZ` | NULL |
| `cancelled_at` | `TIMESTAMPTZ` | NULL |
| `cancellation_reason` | `VARCHAR(255)` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`received_amount` and `billed_amount` are running totals updated on each goods receipt and vendor invoice respectively. `closed` status is set automatically when all lines are fully received and the final vendor invoice is matched.

**Indexes:** `uq_purchase_order_po_number (tenant_id, po_number)`, `idx_purchase_order_tenant_id_vendor_id`, `idx_purchase_order_tenant_id_po_status`, `idx_purchase_order_tenant_id_expected_delivery_date`

---

### `purchase_order_item`

An individual line on a purchase order. Supersedes `purchase_order_line` from §19 — adds `product_variant_id`, `discount_amount`, `received_quantity`, `billed_quantity`, and `tax_rate_id`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `purchase_order_id` | `UUID` | NOT NULL, FK → purchase_order.id |
| `line_number` | `INTEGER` | NOT NULL |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `product_variant_id` | `UUID` | NULL, FK → product_variant.id |
| `description` | `VARCHAR(255)` | NOT NULL |
| `quantity_ordered` | `NUMERIC(12,4)` | NOT NULL |
| `quantity_received` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `quantity_billed` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `quantity_returned` | `NUMERIC(12,4)` | NOT NULL, DEFAULT 0 |
| `unit_cost_amount` | `BIGINT` | NOT NULL |
| `unit_cost_currency` | `CHAR(3)` | NOT NULL |
| `discount_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `tax_rate_id` | `UUID` | NULL, FK → tax_rate.id |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `line_total_amount` | `BIGINT` | NOT NULL |
| `expected_delivery_date` | `DATE` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`quantity_received`, `quantity_billed`, and `quantity_returned` are updated by goods receipt, vendor invoice matching, and purchase return posting respectively — never edited directly.

**Indexes:** `idx_purchase_order_item_purchase_order_id`, `idx_purchase_order_item_product_id`, `idx_purchase_order_item_product_variant_id`, `uq_purchase_order_item_line (tenant_id, purchase_order_id, line_number)`

---

### `purchase_return`

Records the return of goods to a vendor, either against an original purchase order or as a standalone return.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `return_number` | `VARCHAR(50)` | NOT NULL |
| `vendor_id` | `UUID` | NOT NULL, FK → vendor.id |
| `purchase_order_id` | `UUID` | NULL, FK → purchase_order.id |
| `warehouse_id` | `UUID` | NOT NULL, FK → warehouse.id |
| `return_status` | `ENUM` | NOT NULL (`draft`, `approved`, `dispatched`, `confirmed`, `credited`, `cancelled`) |
| `return_reason` | `ENUM` | NOT NULL (`defective`, `wrong_item`, `overshipment`, `quality_issue`, `other`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `total_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `credit_note_ref` | `VARCHAR(150)` | NULL |
| `credit_received_at` | `TIMESTAMPTZ` | NULL |
| `dispatched_at` | `TIMESTAMPTZ` | NULL |
| `confirmed_at` | `TIMESTAMPTZ` | NULL |
| `notes` | `TEXT` | NULL |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `journal_entry_id` | `UUID` | NULL, FK → journal_entry.id |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

On posting (`dispatched` status), each line decrements `stock_balance` and writes a `stock_movement` of type `transfer_out`. `credit_note_ref` holds the vendor's credit note number when the return is credited rather than replaced.

**Indexes:** `uq_purchase_return_number (tenant_id, return_number)`, `idx_purchase_return_tenant_id_vendor_id`, `idx_purchase_return_purchase_order_id`, `idx_purchase_return_tenant_id_return_status`

---

### `purchase_return_item`

One line per product returned within a purchase return.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `purchase_return_id` | `UUID` | NOT NULL, FK → purchase_return.id |
| `purchase_order_item_id` | `UUID` | NULL, FK → purchase_order_item.id |
| `line_number` | `INTEGER` | NOT NULL |
| `product_id` | `UUID` | NOT NULL, FK → product.id |
| `product_variant_id` | `UUID` | NULL, FK → product_variant.id |
| `quantity_returned` | `NUMERIC(12,4)` | NOT NULL |
| `unit_cost_amount` | `BIGINT` | NOT NULL |
| `unit_cost_currency` | `CHAR(3)` | NOT NULL |
| `line_total_amount` | `BIGINT` | NOT NULL |
| `lot_number` | `VARCHAR(100)` | NULL |
| `stock_movement_id` | `UUID` | NULL, FK → stock_movement.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`stock_movement_id` is populated on return dispatch. `purchase_order_item_id` is null for standalone returns not linked to an original PO line.

**Indexes:** `idx_purchase_return_item_purchase_return_id`, `idx_purchase_return_item_product_id`, `uq_purchase_return_item_line (tenant_id, purchase_return_id, line_number)`

---

### `vendor_payment`

Records an outbound payment made to a vendor against one or more vendor invoices.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `payment_number` | `VARCHAR(50)` | NOT NULL |
| `vendor_id` | `UUID` | NOT NULL, FK → vendor.id |
| `payment_method_id` | `UUID` | NOT NULL, FK → payment_method.id |
| `bank_account_id` | `UUID` | NULL, FK → bank_account.id |
| `cash_account_id` | `UUID` | NULL, FK → cash_account.id |
| `payment_status` | `ENUM` | NOT NULL (`draft`, `submitted`, `approved`, `processing`, `completed`, `failed`, `cancelled`, `refunded`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `amount` | `BIGINT` | NOT NULL |
| `exchange_rate` | `NUMERIC(19,4)` | NULL |
| `base_currency_amount` | `BIGINT` | NULL |
| `reference` | `VARCHAR(255)` | NULL |
| `payment_date` | `DATE` | NOT NULL |
| `value_date` | `DATE` | NULL |
| `notes` | `TEXT` | NULL |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `financial_transaction_id` | `UUID` | NULL, FK → financial_transaction.id |
| `journal_entry_id` | `UUID` | NULL, FK → journal_entry.id |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Exactly one of `bank_account_id` or `cash_account_id` must be non-null. Enforced at the application layer. On completion, a `financial_transaction` of type `payment` and a `journal_entry` are created and linked.

**Indexes:** `uq_vendor_payment_number (tenant_id, payment_number)`, `idx_vendor_payment_tenant_id_vendor_id`, `idx_vendor_payment_tenant_id_payment_status`, `idx_vendor_payment_financial_transaction_id`

---

### `vendor_payment_allocation`

Allocates a vendor payment across one or more vendor invoices. A single payment may settle multiple invoices partially or in full.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `vendor_payment_id` | `UUID` | NOT NULL, FK → vendor_payment.id |
| `vendor_invoice_id` | `UUID` | NOT NULL, FK → supplier_invoice.id |
| `allocated_amount` | `BIGINT` | NOT NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `created_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

The sum of `allocated_amount` across all lines for a given `vendor_payment_id` must not exceed `vendor_payment.amount`. Enforced at the application layer.

**Indexes:** `idx_vendor_payment_allocation_vendor_payment_id`, `idx_vendor_payment_allocation_vendor_invoice_id`, `uq_vendor_payment_allocation (tenant_id, vendor_payment_id, vendor_invoice_id)`

---

### `vendor_statement`

A periodic statement of account issued by or reconciled with a vendor, summarising all transactions within a date range.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `vendor_id` | `UUID` | NOT NULL, FK → vendor.id |
| `statement_number` | `VARCHAR(100)` | NULL |
| `statement_date` | `DATE` | NOT NULL |
| `from_date` | `DATE` | NOT NULL |
| `to_date` | `DATE` | NOT NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `opening_balance_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_invoiced_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_paid_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_credited_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `closing_balance_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `statement_status` | `ENUM` | NOT NULL (`received`, `under_review`, `reconciled`, `disputed`) |
| `dispute_notes` | `TEXT` | NULL |
| `reconciled_by` | `UUID` | NULL, FK → user.id |
| `reconciled_at` | `TIMESTAMPTZ` | NULL |
| `file_name` | `VARCHAR(255)` | NULL |
| `storage_key` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`closing_balance_amount` must equal the vendor's `gl_payable_account` balance for the period when `statement_status = 'reconciled'`. Discrepancies trigger `statement_status = 'disputed'` and require resolution before the period is closed.

**Indexes:** `idx_vendor_statement_tenant_id_vendor_id`, `idx_vendor_statement_tenant_id_statement_date`, `idx_vendor_statement_tenant_id_statement_status`

---

## 24. Expenses Domain

The Expenses Domain manages employee-submitted expense claims, approval workflows, reimbursements, and policy enforcement. It is distinct from the Financial Operations Domain's `expense` table, which records vendor-side business costs. This domain owns the employee-facing side: claims, receipts, and personal reimbursement.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `expense_policy`

Defines the rules governing allowable expense amounts, categories, and approval thresholds for a tenant.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `requires_receipt_above_amount` | `BIGINT` | NULL |
| `requires_receipt_currency` | `CHAR(3)` | NULL |
| `auto_approve_below_amount` | `BIGINT` | NULL |
| `auto_approve_currency` | `CHAR(3)` | NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_expense_policy_tenant_id_is_active`

---

### `expense_category`

Classifies expense claims. Linked to GL accounts for automatic journal entry generation on approval.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `code` | `VARCHAR(20)` | NOT NULL |
| `parent_id` | `UUID` | NULL, FK → expense_category.id |
| `gl_account_id` | `UUID` | NULL, FK → chart_of_account.id |
| `requires_description` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `limit_amount` | `BIGINT` | NULL |
| `limit_currency` | `CHAR(3)` | NULL |
| `limit_period` | `ENUM` | NULL (`per_claim`, `daily`, `weekly`, `monthly`, `yearly`) |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_expense_category_code (tenant_id, code) WHERE deleted_at IS NULL`, `idx_expense_category_parent_id`

---

### `expense_claim`

An employee's request for reimbursement of one or more out-of-pocket expenses.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `claim_number` | `VARCHAR(50)` | NOT NULL |
| `employee_id` | `UUID` | NOT NULL, FK → employee.id |
| `expense_policy_id` | `UUID` | NOT NULL, FK → expense_policy.id |
| `claim_status` | `ENUM` | NOT NULL (`draft`, `submitted`, `under_review`, `approved`, `partially_approved`, `rejected`, `paid`, `cancelled`) |
| `currency` | `CHAR(3)` | NOT NULL |
| `total_claimed_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_approved_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `total_reimbursed_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `title` | `VARCHAR(255)` | NOT NULL |
| `description` | `TEXT` | NULL |
| `submitted_at` | `TIMESTAMPTZ` | NULL |
| `reviewed_by` | `UUID` | NULL, FK → user.id |
| `reviewed_at` | `TIMESTAMPTZ` | NULL |
| `approved_by` | `UUID` | NULL, FK → user.id |
| `approved_at` | `TIMESTAMPTZ` | NULL |
| `rejection_reason` | `TEXT` | NULL |
| `paid_at` | `TIMESTAMPTZ` | NULL |
| `journal_entry_id` | `UUID` | NULL, FK → journal_entry.id |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_expense_claim_number (tenant_id, claim_number)`, `idx_expense_claim_tenant_id_employee_id`, `idx_expense_claim_tenant_id_claim_status`

---

### `expense_claim_line`

A single expense item within a claim. Carries the receipt, merchant, date, and category for each spend event.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `expense_claim_id` | `UUID` | NOT NULL, FK → expense_claim.id |
| `line_number` | `INTEGER` | NOT NULL |
| `expense_category_id` | `UUID` | NOT NULL, FK → expense_category.id |
| `expense_date` | `DATE` | NOT NULL |
| `merchant_name` | `VARCHAR(255)` | NULL |
| `description` | `TEXT` | NULL |
| `currency` | `CHAR(3)` | NOT NULL |
| `claimed_amount` | `BIGINT` | NOT NULL |
| `approved_amount` | `BIGINT` | NULL |
| `tax_amount` | `BIGINT` | NOT NULL, DEFAULT 0 |
| `tax_rate_id` | `UUID` | NULL, FK → tax_rate.id |
| `line_status` | `ENUM` | NOT NULL (`pending`, `approved`, `rejected`, `partially_approved`) |
| `rejection_reason` | `TEXT` | NULL |
| `receipt_attachment_id` | `UUID` | NULL, FK → attachment.id |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_expense_claim_line_expense_claim_id`, `idx_expense_claim_line_expense_category_id`, `uq_expense_claim_line_number (tenant_id, expense_claim_id, line_number)`

---

### `expense_reimbursement`

Records the actual payment disbursed to an employee for an approved expense claim.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `reimbursement_number` | `VARCHAR(50)` | NOT NULL |
| `expense_claim_id` | `UUID` | NOT NULL, FK → expense_claim.id |
| `employee_id` | `UUID` | NOT NULL, FK → employee.id |
| `payment_method_id` | `UUID` | NOT NULL, FK → payment_method.id |
| `bank_account_id` | `UUID` | NULL, FK → bank_account.id |
| `currency` | `CHAR(3)` | NOT NULL |
| `amount` | `BIGINT` | NOT NULL |
| `reimbursement_status` | `ENUM` | NOT NULL (`pending`, `processing`, `completed`, `failed`) |
| `payment_date` | `DATE` | NOT NULL |
| `reference` | `VARCHAR(255)` | NULL |
| `financial_transaction_id` | `UUID` | NULL, FK → financial_transaction.id |
| `journal_entry_id` | `UUID` | NULL, FK → journal_entry.id |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_reimbursement_number (tenant_id, reimbursement_number)`, `idx_expense_reimbursement_expense_claim_id`, `idx_expense_reimbursement_employee_id`

---

## 25. HR Domain

The HR Domain manages the employee lifecycle: personal records, positions, contracts, leave, and payroll configuration. It is the identity source for the `employee_id` foreign key referenced throughout the system.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `department`

An organisational unit within a tenant. Used for reporting, leave policy assignment, and cost centre linkage.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(150)` | NOT NULL |
| `code` | `VARCHAR(20)` | NOT NULL |
| `parent_id` | `UUID` | NULL, FK → department.id |
| `manager_id` | `UUID` | NULL, FK → employee.id |
| `cost_center_id` | `UUID` | NULL, FK → cost_center.id |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_department_code (tenant_id, code) WHERE deleted_at IS NULL`, `idx_department_parent_id`

---

### `position`

A named job role within a department. Employees are hired into positions.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `title` | `VARCHAR(150)` | NOT NULL |
| `code` | `VARCHAR(20)` | NOT NULL |
| `department_id` | `UUID` | NOT NULL, FK → department.id |
| `is_management` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `head_count` | `INTEGER` | NOT NULL, DEFAULT 1 |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_position_code (tenant_id, code) WHERE deleted_at IS NULL`, `idx_position_department_id`

---

### `employee`

The primary HR record for a person employed by the tenant. Links to `user` when the employee has system access.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `employee_number` | `VARCHAR(50)` | NOT NULL |
| `user_id` | `UUID` | NULL, FK → user.id |
| `first_name` | `VARCHAR(100)` | NOT NULL |
| `last_name` | `VARCHAR(100)` | NOT NULL |
| `preferred_name` | `VARCHAR(100)` | NULL |
| `date_of_birth` | `DATE` | NULL |
| `gender` | `VARCHAR(50)` | NULL |
| `nationality` | `CHAR(2)` | NULL |
| `national_id` | `VARCHAR(50)` | NULL |
| `passport_number` | `VARCHAR(50)` | NULL |
| `personal_email` | `VARCHAR(320)` | NULL |
| `work_email` | `VARCHAR(320)` | NULL |
| `personal_phone` | `VARCHAR(30)` | NULL |
| `work_phone` | `VARCHAR(30)` | NULL |
| `position_id` | `UUID` | NULL, FK → position.id |
| `department_id` | `UUID` | NULL, FK → department.id |
| `manager_id` | `UUID` | NULL, FK → employee.id |
| `employment_type` | `ENUM` | NOT NULL (`full_time`, `part_time`, `contract`, `intern`, `casual`) |
| `employment_status` | `ENUM` | NOT NULL (`active`, `on_leave`, `terminated`, `suspended`) |
| `hire_date` | `DATE` | NOT NULL |
| `probation_end_date` | `DATE` | NULL |
| `termination_date` | `DATE` | NULL |
| `termination_reason` | `VARCHAR(255)` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`national_id` and `passport_number` are sensitive PII. Access must be restricted at the application layer. `user_id` is null for employees who have no system login (e.g., warehouse operatives, field staff).

**Indexes:** `uq_employee_number (tenant_id, employee_number) WHERE deleted_at IS NULL`, `idx_employee_tenant_id_employment_status`, `idx_employee_tenant_id_department_id`, `idx_employee_user_id`

---

### `employee_contract`

Defines the terms of employment for an employee for a given period. An employee may have multiple sequential contracts.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `employee_id` | `UUID` | NOT NULL, FK → employee.id |
| `contract_type` | `ENUM` | NOT NULL (`permanent`, `fixed_term`, `probation`, `contract`) |
| `start_date` | `DATE` | NOT NULL |
| `end_date` | `DATE` | NULL |
| `base_salary_amount` | `BIGINT` | NOT NULL |
| `base_salary_currency` | `CHAR(3)` | NOT NULL |
| `pay_frequency` | `ENUM` | NOT NULL (`weekly`, `bi_weekly`, `semi_monthly`, `monthly`) |
| `working_hours_per_week` | `NUMERIC(5,2)` | NOT NULL |
| `is_current` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `signed_at` | `DATE` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Only one contract per employee may have `is_current = TRUE`. Enforced via partial unique index.

**Indexes:** `idx_employee_contract_employee_id`, `uq_employee_contract_current (tenant_id, employee_id) WHERE is_current = TRUE`

---

### `leave_type`

Defines the types of leave available to employees within a tenant (e.g., annual, sick, maternity).

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `name` | `VARCHAR(100)` | NOT NULL |
| `code` | `VARCHAR(20)` | NOT NULL |
| `is_paid` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `accrual_basis` | `ENUM` | NOT NULL (`fixed`, `accrued`, `unlimited`) |
| `days_per_year` | `NUMERIC(5,2)` | NULL |
| `carry_over_days` | `NUMERIC(5,2)` | NOT NULL, DEFAULT 0 |
| `requires_approval` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `min_notice_days` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_leave_type_code (tenant_id, code)`

---

### `leave_request`

An employee's request for leave of a specified type and duration.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `employee_id` | `UUID` | NOT NULL, FK → employee.id |
| `leave_type_id` | `UUID` | NOT NULL, FK → leave_type.id |
| `request_status` | `ENUM` | NOT NULL (`draft`, `submitted`, `approved`, `rejected`, `cancelled`, `withdrawn`) |
| `start_date` | `DATE` | NOT NULL |
| `end_date` | `DATE` | NOT NULL |
| `days_requested` | `NUMERIC(5,2)` | NOT NULL |
| `reason` | `TEXT` | NULL |
| `reviewed_by` | `UUID` | NULL, FK → user.id |
| `reviewed_at` | `TIMESTAMPTZ` | NULL |
| `rejection_reason` | `TEXT` | NULL |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_leave_request_tenant_id_employee_id`, `idx_leave_request_tenant_id_request_status`, `idx_leave_request_start_date`

---

### `leave_balance`

Tracks the accrued, used, and remaining leave days per employee per leave type per year.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `employee_id` | `UUID` | NOT NULL, FK → employee.id |
| `leave_type_id` | `UUID` | NOT NULL, FK → leave_type.id |
| `financial_year_id` | `UUID` | NOT NULL, FK → financial_year.id |
| `opening_balance` | `NUMERIC(5,2)` | NOT NULL, DEFAULT 0 |
| `accrued` | `NUMERIC(5,2)` | NOT NULL, DEFAULT 0 |
| `used` | `NUMERIC(5,2)` | NOT NULL, DEFAULT 0 |
| `carried_over` | `NUMERIC(5,2)` | NOT NULL, DEFAULT 0 |
| `adjusted` | `NUMERIC(5,2)` | NOT NULL, DEFAULT 0 |
| `closing_balance` | `NUMERIC(5,2)` | GENERATED AS (`opening_balance + accrued + carried_over + adjusted - used`) STORED |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_leave_balance (tenant_id, employee_id, leave_type_id, financial_year_id)`

---

## 26. System Domain

The System Domain stores platform-level operational tables that support background jobs, feature flags, event queuing, and system configuration. None of these tables are visible to tenant users directly.

**Scope:** Mixed. `feature_flag` and `system_config` are global. Job and event tables are global but carry optional `tenant_id`.

---

### `system_config`

Key-value store for global platform configuration. Tenant-level overrides live in `tenant_setting` (§9).

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `key` | `VARCHAR(150)` | NOT NULL, UNIQUE |
| `value` | `TEXT` | NOT NULL |
| `value_type` | `ENUM` | NOT NULL (`string`, `integer`, `boolean`, `json`) |
| `description` | `TEXT` | NULL |
| `is_sensitive` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`is_sensitive = TRUE` masks the value in logs and API responses. Raw values are never returned to non-platform-admin callers.

**Indexes:** `uq_system_config_key (key)`

---

### `feature_flag`

Controls feature availability at the platform or tenant level.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `key` | `VARCHAR(150)` | NOT NULL, UNIQUE |
| `description` | `TEXT` | NULL |
| `is_enabled` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `rollout_percentage` | `SMALLINT` | NOT NULL, DEFAULT 0 |
| `allowed_tenant_ids` | `UUID[]` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`rollout_percentage` (0–100) enables gradual rollout when `allowed_tenant_ids` is null. When `allowed_tenant_ids` is non-null, only listed tenants see the feature regardless of `rollout_percentage`.

**Indexes:** `uq_feature_flag_key (key)`

---

### `background_job`

Tracks the lifecycle of all asynchronous background jobs dispatched by the platform.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NULL |
| `job_type` | `VARCHAR(150)` | NOT NULL |
| `job_status` | `ENUM` | NOT NULL (`queued`, `running`, `completed`, `failed`, `cancelled`, `retrying`) |
| `payload` | `JSONB` | NOT NULL |
| `result` | `JSONB` | NULL |
| `error_message` | `TEXT` | NULL |
| `attempt_count` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `max_attempts` | `INTEGER` | NOT NULL, DEFAULT 3 |
| `scheduled_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `started_at` | `TIMESTAMPTZ` | NULL |
| `completed_at` | `TIMESTAMPTZ` | NULL |
| `next_retry_at` | `TIMESTAMPTZ` | NULL |
| `created_by` | `UUID` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_background_job_job_status`, `idx_background_job_scheduled_at`, `idx_background_job_tenant_id_job_type`

---

### `event_log`

Immutable domain event record. Captures every significant state transition across all domains for audit, replay, and event-driven integration.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NULL |
| `event_type` | `VARCHAR(150)` | NOT NULL |
| `aggregate_type` | `VARCHAR(100)` | NOT NULL |
| `aggregate_id` | `UUID` | NOT NULL |
| `version` | `INTEGER` | NOT NULL |
| `payload` | `JSONB` | NOT NULL |
| `metadata` | `JSONB` | NULL |
| `performed_by` | `UUID` | NULL |
| `performed_at` | `TIMESTAMPTZ` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only. `event_type` follows `{domain}.{aggregate}.{action}` — e.g., `orders.order.confirmed`, `inventory.stock.adjusted`. `version` is a per-aggregate monotonically increasing counter for optimistic concurrency.

**Indexes:** `idx_event_log_aggregate (aggregate_type, aggregate_id, version)`, `idx_event_log_tenant_id_event_type`, `idx_event_log_performed_at`

---

### `webhook_endpoint`

A tenant-configured HTTP endpoint that receives domain event payloads.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `url` | `TEXT` | NOT NULL |
| `description` | `TEXT` | NULL |
| `event_types` | `TEXT[]` | NOT NULL |
| `secret_hash` | `VARCHAR(255)` | NOT NULL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `last_triggered_at` | `TIMESTAMPTZ` | NULL |
| `failure_count` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`secret_hash` stores a hashed HMAC signing secret. The raw secret is displayed once at creation and never stored. `event_types` is an array of `event_type` patterns the endpoint subscribes to.

**Indexes:** `idx_webhook_endpoint_tenant_id_is_active`

---

### `webhook_delivery`

Records every delivery attempt for a webhook event.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `webhook_endpoint_id` | `UUID` | NOT NULL, FK → webhook_endpoint.id |
| `event_log_id` | `UUID` | NOT NULL, FK → event_log.id |
| `delivery_status` | `ENUM` | NOT NULL (`pending`, `success`, `failed`, `retrying`) |
| `http_status_code` | `SMALLINT` | NULL |
| `request_payload` | `JSONB` | NOT NULL |
| `response_body` | `TEXT` | NULL |
| `attempt_count` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `next_retry_at` | `TIMESTAMPTZ` | NULL |
| `delivered_at` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_webhook_delivery_webhook_endpoint_id`, `idx_webhook_delivery_event_log_id`, `idx_webhook_delivery_delivery_status`

---

## 27. Notification Domain

The Notification Domain manages all outbound communications to users: in-app alerts, emails, push notifications, and SMS. It decouples notification dispatch from the business domains that trigger them.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

---

### `notification_template`

Defines the content and channel configuration for a category of notification.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NULL |
| `key` | `VARCHAR(150)` | NOT NULL |
| `name` | `VARCHAR(150)` | NOT NULL |
| `channel` | `ENUM` | NOT NULL (`in_app`, `email`, `sms`, `push`) |
| `subject_template` | `TEXT` | NULL |
| `body_template` | `TEXT` | NOT NULL |
| `available_variables` | `JSONB` | NULL |
| `is_system` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `created_by` | `UUID` | NOT NULL |
| `updated_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`tenant_id` is null for system-level templates shared across all tenants. Tenant-specific templates override system templates when both match the same `key` and `channel`. Templates use a Mustache-compatible `{{variable}}` syntax.

**Indexes:** `uq_notification_template_key (tenant_id, key, channel)`

---

### `notification_preference`

Per-user opt-in/opt-out configuration for each notification category and channel.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `user_id` | `UUID` | NOT NULL, FK → user.id |
| `notification_key` | `VARCHAR(150)` | NOT NULL |
| `channel` | `ENUM` | NOT NULL (`in_app`, `email`, `sms`, `push`) |
| `is_enabled` | `BOOLEAN` | NOT NULL, DEFAULT TRUE |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `uq_notification_preference (tenant_id, user_id, notification_key, channel)`

---

### `notification`

A single notification instance generated for a specific user.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `user_id` | `UUID` | NOT NULL, FK → user.id |
| `notification_template_id` | `UUID` | NULL, FK → notification_template.id |
| `channel` | `ENUM` | NOT NULL (`in_app`, `email`, `sms`, `push`) |
| `notification_status` | `ENUM` | NOT NULL (`pending`, `sent`, `delivered`, `failed`, `read`, `dismissed`) |
| `subject` | `TEXT` | NULL |
| `body` | `TEXT` | NOT NULL |
| `action_url` | `TEXT` | NULL |
| `source_type` | `VARCHAR(100)` | NULL |
| `source_id` | `UUID` | NULL |
| `read_at` | `TIMESTAMPTZ` | NULL |
| `sent_at` | `TIMESTAMPTZ` | NULL |
| `failed_at` | `TIMESTAMPTZ` | NULL |
| `failure_reason` | `TEXT` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`source_type` and `source_id` identify the domain event that triggered the notification (e.g., `expense_claim`, `purchase_order`). `action_url` is the deep-link the user is directed to when interacting with the notification.

**Indexes:** `idx_notification_tenant_id_user_id`, `idx_notification_tenant_id_notification_status`, `idx_notification_tenant_id_created_at`, `idx_notification_source (tenant_id, source_type, source_id)`

---

### `notification_batch`

Groups a single logical notification dispatched across multiple users (e.g., a broadcast to all tenant admins).

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `notification_template_id` | `UUID` | NULL, FK → notification_template.id |
| `channel` | `ENUM` | NOT NULL (`in_app`, `email`, `sms`, `push`) |
| `batch_status` | `ENUM` | NOT NULL (`pending`, `processing`, `completed`, `failed`) |
| `recipient_count` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `sent_count` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `failed_count` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `context` | `JSONB` | NULL |
| `completed_at` | `TIMESTAMPTZ` | NULL |
| `created_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

**Indexes:** `idx_notification_batch_tenant_id_batch_status`

---

## 28. Attachment Domain

The Attachment Domain manages all file uploads across the platform. It acts as the single storage registry — every domain that needs to associate a file with a record references `attachment.id`. No other domain stores file paths or storage keys directly.

**Scope:** Tenant-scoped. All tables carry `tenant_id`.

**Rule:** No domain table stores `file_name`, `storage_key`, `mime_type`, or `file_size` directly. All file references are foreign keys to `attachment.id`.

---

### `attachment`

The master file record. Stores the storage layer reference and metadata for every uploaded file.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `file_name` | `VARCHAR(255)` | NOT NULL |
| `storage_key` | `TEXT` | NOT NULL, UNIQUE |
| `mime_type` | `VARCHAR(100)` | NOT NULL |
| `file_size_bytes` | `BIGINT` | NOT NULL |
| `checksum_sha256` | `VARCHAR(64)` | NULL |
| `storage_provider` | `VARCHAR(50)` | NOT NULL |
| `storage_bucket` | `VARCHAR(150)` | NOT NULL |
| `is_public` | `BOOLEAN` | NOT NULL, DEFAULT FALSE |
| `virus_scan_status` | `ENUM` | NOT NULL (`pending`, `clean`, `infected`, `error`) |
| `virus_scanned_at` | `TIMESTAMPTZ` | NULL |
| `uploaded_by` | `UUID` | NOT NULL, FK → user.id |
| `deleted_at` | `TIMESTAMPTZ` | NULL |
| `deleted_by` | `UUID` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Files with `virus_scan_status = 'infected'` must not be served. Soft-deleted attachments are purged from object storage by a background job after a configurable retention period. `storage_key` is the authoritative path in the object store; it is never exposed to clients — a signed URL is generated on demand.

**Indexes:** `uq_attachment_storage_key (storage_key)`, `idx_attachment_tenant_id_uploaded_by`, `idx_attachment_tenant_id_virus_scan_status`

---

### `entity_attachment`

Junction table linking any domain record to one or more attachments. Provides a generic, polymorphic attachment association without adding FK columns to business tables.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `attachment_id` | `UUID` | NOT NULL, FK → attachment.id |
| `entity_type` | `VARCHAR(100)` | NOT NULL |
| `entity_id` | `UUID` | NOT NULL |
| `label` | `VARCHAR(100)` | NULL |
| `position` | `INTEGER` | NOT NULL, DEFAULT 0 |
| `created_by` | `UUID` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

`entity_type` identifies the owning table (e.g., `expense_claim_line`, `purchase_order`, `invoice`). The FK is not enforced at the database level — the application validates entity existence before inserting. `position` orders multiple attachments on the same entity record.

**Indexes:** `idx_entity_attachment_entity (tenant_id, entity_type, entity_id)`, `idx_entity_attachment_attachment_id`, `uq_entity_attachment (tenant_id, attachment_id, entity_type, entity_id)`

---

### `attachment_access_log`

Immutable record of every file download or preview event. Used for compliance auditing of sensitive documents.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL, FK → tenant.id |
| `attachment_id` | `UUID` | NOT NULL, FK → attachment.id |
| `accessed_by` | `UUID` | NOT NULL, FK → user.id |
| `access_type` | `ENUM` | NOT NULL (`download`, `preview`, `share`) |
| `ip_address` | `INET` | NULL |
| `user_agent` | `TEXT` | NULL |
| `accessed_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() |

Rows are insert-only. Retained for the same period as audit logs.

**Indexes:** `idx_attachment_access_log_attachment_id`, `idx_attachment_access_log_tenant_id_accessed_at`

---

## 29. Performance Strategy

Performance is designed in, not bolted on. The decisions below apply to the full schema and must be respected in every migration.

---

### Query Design Contract

Every query against a tenant-scoped table must satisfy the following in order of priority:

1. Filter on `tenant_id` first — always the leading predicate.
2. Filter on an indexed status or date column second.
3. Never perform a full-table scan on any table projected to exceed 100,000 rows.
4. Never use `SELECT *` in application code. Select only the columns needed.
5. Pagination uses keyset (cursor) pagination, not `OFFSET`. `OFFSET N` on large tables causes full scans.

---

### Connection Pooling

- All application connections go through PgBouncer in **transaction-mode** pooling.
- Maximum pool size per tenant tier is defined by the `tenant_setting` key `db.max_connections`.
- Long-running transactions (> 30 seconds) are killed by the connection pool. Background jobs use dedicated long-lived connections outside the pool.
- Prepared statements are disabled in transaction-mode pooling. Use query-level parameterisation instead.

---

### Read Replicas

| Traffic Type | Target |
|---|---|
| Application reads (reports, listings, exports) | Read replica |
| Application writes | Primary |
| Background jobs | Read replica where possible; primary only for writes |
| Audit log reads | Read replica |
| Real-time dashboard queries | Read replica + query result cache |

Read replicas operate with a replication lag tolerance of ≤ 500 ms. Queries that require read-after-write consistency (e.g., immediately reading a record just created) must target the primary.

---

### Caching Strategy

| Layer | Tool | TTL | Invalidation |
|---|---|---|---|
| Query result cache | Redis | 60s–300s | On write to the source table |
| Reference data (e.g., `account_type`, `tax_rate`) | Redis | 1 hour | On any write to the reference table |
| Session tokens | Redis | Per `user_session.expires_at` | On revocation |
| Feature flags | In-process memory | 60s | Background sync from `feature_flag` |
| Permissions per user-tenant | Redis | 5 minutes | On any `user_role` or `role_permission` change |

Never cache mutable financial records (`journal_entry`, `invoice`, `payment`). Cache only reads that tolerate eventual consistency.

---

### Slow Query Policy

- Any query exceeding 100 ms average execution time requires an index review before the feature ships.
- Any query exceeding 1 second is a blocking incident. It must be optimised or killed before the next deploy.
- `pg_stat_statements` is enabled on all environments. Weekly slow-query reviews are mandatory.
- `EXPLAIN ANALYZE` output is required in the PR description for any migration that adds or removes an index on a table with > 1 million rows.

---

## 30. Indexing Strategy

Indexes follow a strict decision framework. Every index has a cost (write amplification, storage, vacuum overhead). An index is created only when the benefit is proven.

---

### Decision Framework

An index is **required** when:
- It enforces a unique constraint.
- It is a foreign key column (prevents full-table scans on cascading operations and JOIN resolution).
- It is the leading filter in a query that runs on a schedule or in a hot path (e.g., listing by status, filtering by date range).
- It is used in a `WHERE`, `JOIN ON`, or `ORDER BY` clause on a table projected to exceed 50,000 rows.

An index is **prohibited** when:
- The column has very low cardinality (e.g., `is_active BOOLEAN`) without a supporting high-cardinality prefix.
- The table receives a high write volume and the column is never used as a filter (index is pure overhead).
- A covering index already satisfies the access pattern.

---

### Standard Index Patterns

**Tenant + status listing**
```sql
CREATE INDEX idx_{table}_tenant_id_{status_col}
    ON {table} (tenant_id, {status_col})
    WHERE deleted_at IS NULL;
```

**Tenant + date range**
```sql
CREATE INDEX idx_{table}_tenant_id_created_at
    ON {table} (tenant_id, created_at DESC);
```

**Polymorphic source/reference columns**
```sql
CREATE INDEX idx_{table}_source
    ON {table} (tenant_id, source_type, source_id);
```

**Soft-delete-aware unique constraint**
```sql
CREATE UNIQUE INDEX uq_{table}_{col}
    ON {table} (tenant_id, {col})
    WHERE deleted_at IS NULL;
```

**Partial index for singleton constraints**
```sql
CREATE UNIQUE INDEX uq_{table}_current
    ON {table} (tenant_id, {parent_id})
    WHERE is_current = TRUE;
```

---

### Composite Index Column Order

1. `tenant_id` — always first on tenant-scoped tables.
2. Equality filter columns (e.g., `status`, `type`) — high selectivity first.
3. Range filter columns (e.g., `created_at`, `due_date`) — last.
4. `ORDER BY` columns — match the query sort direction.

Violating this order causes the index to be skipped by the planner on range queries.

---

### Index Maintenance Rules

- Indexes on immutable insert-only tables (`audit_log`, `event_log`, `stock_movement`) are never dropped.
- `REINDEX CONCURRENTLY` is used for all production index rebuilds. Never `REINDEX` without `CONCURRENTLY` on a live table.
- Unused indexes (zero scans in `pg_stat_user_indexes` for 30 days) are candidates for removal and must be reviewed in the next sprint.
- All indexes on tables > 10 million rows are created `CONCURRENTLY` in migrations to avoid table locks.

---

## 31. Partitioning Strategy

Partitioning is applied only to tables projected to exceed 50 million rows or to tables where time-based data lifecycle management (archival, deletion) is a hard requirement.

---

### Partitioning Candidates

| Table | Method | Key | Rationale |
|---|---|---|---|
| `audit_log` | Range | `performed_at` (monthly) | Legal retention; cold data archived per month |
| `event_log` | Range | `performed_at` (monthly) | Replay and compliance; monthly partition drop |
| `stock_movement` | Range | `created_at` (monthly) | High insert volume; historical reads are rare |
| `notification` | Range | `created_at` (monthly) | Read-once; old notifications have no query value |
| `background_job` | List | `job_status` | Completed jobs purged on schedule |
| `webhook_delivery` | Range | `created_at` (monthly) | Retained 90 days; monthly drop |

All other tables use no partitioning. Adding partitioning to a table not on this list requires architectural review.

---

### Partition Management Rules

- Monthly range partitions are created 3 months in advance by a scheduled `background_job`.
- Partition drop (for data beyond retention) uses `DROP TABLE` on the child partition — never `DELETE`. This is a zero-cost operation that does not trigger VACUUM.
- Default partitions are enabled on all partitioned tables to catch out-of-range inserts. Inserts landing in the default partition trigger an alert.
- Foreign keys cannot reference partitioned tables in PostgreSQL < 16. All FK references to partitioned tables use application-layer enforcement only and are documented in `MEMORY.md`.
- Partition pruning relies on the partition key being present in the `WHERE` clause. Queries that omit the partition key scan all partitions — this is treated as a slow query incident.

---

### Partition Naming Convention

```
{table}_{YYYY}_{MM}
```

Examples: `audit_log_2026_05`, `stock_movement_2026_06`, `event_log_2025_12`.

---

## 32. Archiving Strategy

Archiving moves cold data out of the operational database without deleting it. The operational database holds only data required for active business operations and the legally mandated minimum lookback window.

---

### Retention Tiers

| Tier | Retention in Operational DB | Archive Destination | Purge After |
|---|---|---|---|
| Hot | Current financial year + 1 | — | — |
| Warm | Last 3 years | — | — |
| Cold | 3–7 years | Cold object storage (Parquet / S3) | 7 years |
| Legal hold | Indefinite until hold released | Cold object storage | On hold release |

Financial records (`journal_entry`, `invoice`, `payment`) are never purged from the archive. They are retained indefinitely in cold storage.

---

### Archiving Process

1. A monthly `background_job` identifies rows in archiving-eligible tables that exceed the hot/warm threshold.
2. Rows are serialised to Parquet and written to the cold store with path: `{tenant_id}/{table}/{YYYY}/{MM}/data.parquet`.
3. A corresponding `archive_manifest` record is written to the operational database referencing the Parquet file location.
4. Source rows are deleted from the operational database only after the Parquet write is verified by checksum.
5. Archived data is queryable via an analytics engine (e.g., Athena, BigQuery) — not through the operational database.

---

### `archive_manifest`

Tracks every completed archive batch for auditability and data recovery.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `tenant_id` | `UUID` | NOT NULL |
| `table_name` | `VARCHAR(100)` | NOT NULL |
| `from_date` | `DATE` | NOT NULL |
| `to_date` | `DATE` | NOT NULL |
| `row_count` | `BIGINT` | NOT NULL |
| `file_path` | `TEXT` | NOT NULL |
| `checksum_sha256` | `VARCHAR(64)` | NOT NULL |
| `file_size_bytes` | `BIGINT` | NOT NULL |
| `archived_at` | `TIMESTAMPTZ` | NOT NULL |
| `archived_by_job_id` | `UUID` | NOT NULL, FK → background_job.id |

Rows are insert-only.

**Indexes:** `idx_archive_manifest_tenant_id_table_name`, `idx_archive_manifest_archived_at`

---

### Tables Exempt from Archiving

The following tables are never archived from the operational database:

- `tenant`, `user`, `employee`, `customer`, `vendor` — master records required for all lookups.
- `chart_of_account`, `account_type`, `cost_center` — accounting reference data.
- `product`, `product_variant`, `warehouse` — inventory master data.
- `role`, `permission`, `user_role`, `role_permission` — security model.
- `system_config`, `feature_flag` — platform configuration.

---

## 33. Reporting Strategy

Reporting queries are never run against the operational (OLTP) primary database. The reporting architecture is layered to protect write throughput and query latency.

---

### Reporting Tiers

**Tier 1 — Operational Reports (< 5 seconds)**

Run against the read replica. Scoped to a single tenant. Always filtered by `tenant_id` and bounded by a date range of ≤ 90 days. Examples: open invoices, stock on hand, pending approvals.

Requirements:
- Must use indexed columns in all filter predicates.
- Must not perform aggregations across more than 1 million rows.
- Paginated with keyset cursor. No unbounded result sets.

**Tier 2 — Analytical Reports (5–60 seconds)**

Run against the `account_balance` snapshot table and pre-aggregated materialised views. Scoped to a single tenant. Date ranges up to 3 years. Examples: P&L statement, balance sheet, aged payables.

Requirements:
- Source data from `account_balance`, not raw `journal_entry_line`.
- Materialised views are refreshed at period close and on demand.
- Query must declare its materialised view dependency in code comments.

**Tier 3 — Cross-Tenant / Platform Reports**

Run against the analytics warehouse (Parquet on cold storage, queried via Athena/BigQuery). Never against the operational database. Examples: platform-wide revenue, churn analysis, tenant adoption metrics.

Requirements:
- Queries must be registered and approved by the platform team.
- Results are cached for a minimum of 1 hour.
- No raw PII columns in cross-tenant queries.

---

### Materialised Views

| View | Source Tables | Refresh Trigger | Tier |
|---|---|---|---|
| `mv_account_balance_summary` | `account_balance`, `chart_of_account` | Period close | 2 |
| `mv_aged_receivables` | `invoice`, `invoice_payment`, `customer` | Daily (00:00 UTC) | 2 |
| `mv_aged_payables` | `supplier_invoice`, `vendor_payment`, `vendor` | Daily (00:00 UTC) | 2 |
| `mv_stock_on_hand` | `stock_balance`, `product`, `warehouse` | On `stock_balance` update | 1 |
| `mv_sales_summary` | `order`, `order_line`, `customer` | Hourly | 1 |
| `mv_purchase_summary` | `purchase_order`, `purchase_order_item`, `vendor` | Daily (00:00 UTC) | 2 |

Materialised views are never queried directly by the API. A thin service layer resolves the correct view and applies tenant scoping before returning data.

---

### Reporting Forbidden Patterns

The following are prohibited in all reporting queries:

- `SELECT *` — select named columns only.
- `OFFSET` pagination — use keyset cursors.
- Correlated subqueries — rewrite as JOINs or CTEs.
- Queries without a `tenant_id` predicate on tenant-scoped tables.
- Aggregating raw `journal_entry_line` for financial statements — use `account_balance`.
- Joining more than 6 tables in a single operational query — split into two queries or use a materialised view.

---

## 34. Data Integrity Rules

These rules apply universally across all domains. They are enforced at multiple layers: database constraints, application logic, and automated tests.

---

### Immutability Rules

The following tables are insert-only. No `UPDATE` or `DELETE` is permitted after row creation:

| Table | Reason |
|---|---|
| `audit_log` | Legal compliance |
| `event_log` | Event sourcing integrity |
| `stock_movement` | Inventory ledger accuracy |
| `journal_entry_line` | Accounting immutability (once entry is posted) |
| `asset_depreciation` | Depreciation ledger accuracy |
| `import_error_log` | Traceability |
| `order_status_history` | State machine audit trail |
| `attachment_access_log` | Compliance |
| `archive_manifest` | Archiving integrity |
| `webhook_delivery` | Delivery audit trail |

Enforced via database triggers that raise exceptions on `UPDATE` and `DELETE` operations.

---

### Financial Integrity Rules

1. **Double-entry balance** — every posted `journal_entry` must have sum of debits = sum of credits. Enforced by a `BEFORE INSERT` trigger on `journal_entry` status change to `posted`.
2. **No negative stock** — `stock_balance.quantity_on_hand` must never go below zero. Enforced by a trigger on `stock_movement` insert.
3. **Currency consistency** — all monetary columns on the same table must share the same `currency` column. Cross-currency aggregation is forbidden in SQL; conversion happens at the application layer.
4. **Payment over-allocation** — the sum of `vendor_payment_allocation.allocated_amount` for a payment must not exceed `vendor_payment.amount`. Enforced at the application layer with a database check constraint.
5. **Invoice total consistency** — `invoice.total_amount` must equal the sum of `invoice_line.line_total_amount`. Recalculated and verified by trigger on each line insert/update.
6. **Period lock enforcement** — no `journal_entry` may be posted to a `fiscal_period` with `period_status = 'closed'` or `'locked'`. Enforced by trigger.
7. **Soft-delete referential integrity** — a record may not be soft-deleted if active child records reference it. Enforced at the application layer before setting `deleted_at`.

---

### Referential Integrity Rules

1. All foreign key constraints are declared explicitly at the database level.
2. `ON DELETE RESTRICT` is the default. Exceptions require explicit documentation in the migration file.
3. `ON DELETE CASCADE` is never used on soft-delete tables.
4. Polymorphic references (`entity_type` + `entity_id`) are validated at the application layer. No database-level FK is possible for polymorphic patterns — this is a documented exception.
5. Self-referencing foreign keys (`parent_id`) are nullable and use `ON DELETE RESTRICT`.

---

### Constraint Naming Rules

| Constraint Type | Pattern | Example |
|---|---|---|
| Primary key | `pk_{table}` | `pk_invoice` |
| Foreign key | `fk_{table}_{referenced_table}` | `fk_invoice_customer` |
| Unique | `uq_{table}_{columns}` | `uq_invoice_number` |
| Check | `chk_{table}_{rule}` | `chk_journal_entry_balanced` |
| Not null | Inline in column definition | — |

---

### Null Policy

- `NOT NULL` is the default for all columns unless a specific business reason requires nullability.
- Nullable columns must have a documented reason in the migration file.
- Empty strings are never stored — use `NULL` for absent text values. Enforced by a `CHECK (column <> '')` constraint on all `VARCHAR` and `TEXT` columns where blank is semantically invalid.
- Boolean columns are never nullable. Use `NOT NULL DEFAULT FALSE` or `NOT NULL DEFAULT TRUE`.

---

### Sensitive Data Rules

| Data Class | Columns | Rule |
|---|---|---|
| Authentication secrets | `password_hash`, `secret_hash`, `token_hash` | Store hash only. Raw value never persisted. |
| Financial account numbers | `account_number_masked` | Last 4 digits only. Full number never stored. |
| Personal identity | `national_id`, `passport_number` | Column-level encryption required. Access logged. |
| Contact details | `personal_email`, `personal_phone` | Encrypted at rest. Masked in non-production environments. |
| API keys / tokens | Any `*_key`, `*_token` | Hash only. Shown once at creation via application layer. |

Non-production environments (staging, development) must have all sensitive columns masked via a data anonymisation pipeline run after each production data clone.

---

## 35. Final Database Summary

### Domain Map

| § | Domain | Tables | Scope |
|---|---|---|---|
| 9 | Platform | `plan`, `plan_feature`, `tenant`, `tenant_setting` | Global |
| 10 | Identity | `user`, `user_profile`, `tenant_user`, `user_session`, `password_reset_token` | Mixed |
| 11 | Permission | `role`, `permission`, `role_permission`, `user_role` | Tenant |
| 12 | CRM | `lead`, `crm_activity`, `pipeline`, `pipeline_stage`, `deal` | Tenant |
| 13 | Customer | `customer`, `customer_profile`, `customer_contact`, `customer_address`, `customer_tag` | Tenant |
| 14 | Orders | `order`, `order_line`, `order_status_history`, `shipment`, `shipment_line`, `payment` | Tenant |
| 15 | Import | `import_job`, `import_row`, `import_error_log` | Tenant |
| 16 | Financial Operations | `invoice`, `invoice_line`, `invoice_payment`, `credit_note`, `tax_rate`, `expense`, `expense_category` | Tenant |
| 17 | Accounting (initial) | Superseded by §21 | — |
| 18 | Inventory (initial) | Superseded by §22 | — |
| 19 | Purchasing (initial) | Superseded by §23 | — |
| 20 | Treasury & Reconciliation | `transaction_source`, `payment_method`, `bank_account`, `cash_account`, `payment_status`, `financial_transaction`, `matching_session`, `matching_result` | Mixed |
| 21 | Accounting (extended) | `account_type`, `chart_of_account`, `cost_center`, `financial_year`, `fiscal_period`, `journal_entry`, `journal_entry_line`, `fixed_asset`, `asset_depreciation`, `account_balance` | Mixed |
| 22 | Inventory (extended) | `product_category`, `product`, `product_variant`, `warehouse`, `stock_balance`, `stock_movement`, `inventory_count`, `inventory_count_line`, `inventory_adjustment`, `inventory_adjustment_line` | Tenant |
| 23 | Purchasing (extended) | `vendor`, `vendor_contact`, `vendor_address`, `purchase_order`, `purchase_order_item`, `purchase_return`, `purchase_return_item`, `vendor_payment`, `vendor_payment_allocation`, `vendor_statement` | Tenant |
| 24 | Expenses | `expense_policy`, `expense_category`, `expense_claim`, `expense_claim_line`, `expense_reimbursement` | Tenant |
| 25 | HR | `department`, `position`, `employee`, `employee_contract`, `leave_type`, `leave_request`, `leave_balance` | Tenant |
| 26 | System | `system_config`, `feature_flag`, `background_job`, `event_log`, `webhook_endpoint`, `webhook_delivery` | Mixed |
| 27 | Notification | `notification_template`, `notification_preference`, `notification`, `notification_batch` | Mixed |
| 28 | Attachment | `attachment`, `entity_attachment`, `attachment_access_log` | Tenant |

---

### Table Count

| Scope | Count |
|---|---|
| Global tables | 9 |
| Tenant-scoped tables | 81 |
| Mixed (tenant_id nullable) | 8 |
| **Total** | **98** |

---

### Cross-Domain Dependency Graph

```
Platform ──────────────────────────────────────────────────┐
    └─► Identity ──────────────────────────────────────┐   │
            └─► Permission                              │   │
                                                        │   │
CRM ──────────────────────────────────────────────────► Customer
                                                            │
                                                            ▼
HR ──────────────────────────────────────────────────► Orders
    └─► Expenses ──────────────────────────────────┐       │
                                                   │       ▼
Purchasing ──────────────────────────────────────► Financial Operations
    └─► Inventory ────────────────────────────────────────┘
                                                           │
                  Accounting ◄──────────────────────────── │
                      │                                    │
                      ▼                                    │
              Treasury & Reconciliation ◄──────────────────┘
                                                           
System ──────► all domains (events, jobs, webhooks)        
Notification ─► all domains (triggered by events)          
Attachment ──► all domains (files referenced via FK)       
Import ──────► any domain (loads data into target tables)  
```

---

### Authoritative Definitions Index

When a table is defined in multiple sections, the following section is authoritative:

| Table Group | Authoritative Section |
|---|---|
| `fiscal_year` / `financial_year` | §21 (`financial_year`) |
| `accounting_period` / `fiscal_period` | §21 (`fiscal_period`) |
| `chart_of_account` | §21 |
| `journal_entry`, `journal_entry_line` | §21 |
| `stock_level` / `stock_balance` | §22 (`stock_balance`) |
| `stock_movement` | §22 |
| `stock_adjustment` / `inventory_adjustment` | §22 (`inventory_adjustment`) |
| `product`, `product_category`, `warehouse` | §22 |
| `supplier` / `vendor` | §23 (`vendor`) |
| `purchase_order`, `purchase_order_line` | §23 (`purchase_order`, `purchase_order_item`) |
| `expense_category` (vendor-side) | §16 |
| `expense_category` (employee-side) | §24 |

---

### Non-Negotiable Rules — Quick Reference

| Rule | Enforcement |
|---|---|
| All timestamps in UTC | Database column type `TIMESTAMPTZ` |
| All monetary values as `BIGINT` cents | Column type; no `FLOAT` permitted |
| No raw secrets in any column | Application + code review |
| All tenant queries filter `tenant_id` first | ORM global scope + query review |
| No `SELECT *` in application code | Linting rule |
| No `OFFSET` pagination on large tables | Code review standard |
| Soft-delete with partial unique indexes | Migration template |
| Insert-only tables enforced by trigger | Database trigger on listed tables |
| Double-entry balance enforced on post | `BEFORE INSERT` trigger on `journal_entry` |
| Partitioned tables created 3 months ahead | Scheduled `background_job` |
| Sensitive columns masked in non-production | Data anonymisation pipeline |
| Index on every FK column | Migration checklist item |
