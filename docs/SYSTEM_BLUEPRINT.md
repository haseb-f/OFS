# OFS — Operations & Financial System
## System Blueprint

**Version:** 1.0.0
**Status:** Foundation Draft
**Last Updated:** 2026-05-23
**Classification:** Internal — Master Reference Document

---

> This document is the single source of truth for the OFS platform. Every architectural decision, design choice, module definition, and business rule originates here. All downstream documents — technical specifications, API contracts, UI guidelines, and database schemas — derive from and must remain consistent with this blueprint.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Product Goals](#2-product-goals)
3. [Reference Systems](#3-reference-systems)
4. [Design Principles](#4-design-principles)
5. [SaaS Hierarchy](#5-saas-hierarchy)

---

## 1. Product Vision

### 1.1 The Problem

Businesses operating in Arabic-speaking markets — particularly in the Gulf, Levant, and North Africa — are forced to choose between two painful compromises:

**Option A — Global ERP Systems (SAP, Oracle, Odoo, Zoho)**
These platforms are feature-rich but built for Western markets. Arabic is an afterthought, RTL is broken or inconsistent, the UX is dense and overwhelming, onboarding takes months, and licensing costs are prohibitive for growing businesses. Localization patches add technical debt without solving the fundamental design mismatch.

**Option B — Local Accounting Tools (Daftra, Qoyod, Wafeq)**
These tools are Arabic-native and easier to adopt but are narrowly scoped. They handle accounting and invoicing adequately but offer no integrated CRM, no lead management, no purchasing workflows, and no operational layer. Businesses end up stitching together multiple disconnected tools — a spreadsheet for leads, a separate system for orders, another for expenses — which creates data silos, reconciliation nightmares, and manual overhead.

**The result:** No single platform exists that is simultaneously Arabic-first, operationally complete, and built to the quality standard of modern premium SaaS products.

### 1.2 The Solution

OFS is a **modern, Arabic-first Financial Operations Platform** that unifies every critical business function — from the moment a lead is captured to the moment revenue is posted in the general ledger — into a single, cohesive, and beautifully designed SaaS product.

OFS is not a translation of a Western product. It is designed from the ground up with Arabic language, RTL layout, and the operational patterns of Arabic-speaking businesses as its foundation. Every interaction, every workflow, and every data model is built with this context as the primary constraint.

### 1.3 The Platform

OFS brings together:

| Domain | Function |
|---|---|
| CRM | Customer relationship lifecycle, contact management, communication history |
| Lead Management | Structured lead capture, validation, deduplication, and distribution |
| Sales | Order creation, pricing, discounts, fulfillment tracking |
| Purchasing | Supplier management, purchase orders, receiving, and cost tracking |
| Inventory | Multi-location stock control, movements, and valuation |
| Accounting | Double-entry bookkeeping, journal entries, financial statements |
| Expenses | Expense capture, categorization, approval, and reimbursement |
| HR | Employee records, role assignment, and attendance management |
| Reporting & Analytics | Cross-module intelligence, KPIs, dashboards, and exports |

These modules are not bolted together. They share a unified data model, a single permission layer, and a consistent user experience. An order created in Sales automatically drives inventory movements and accounting entries. A lead imported from a spreadsheet passes through validation, deduplication, and approval before it ever touches the main dataset. Every action is traceable, every number is reconcilable.

### 1.4 The Market Position

OFS occupies a deliberately chosen position in the market:

- **Above** simple Arabic accounting tools in scope and operational depth.
- **Below** complex global ERPs in implementation time and cognitive overhead.
- **Beside** modern SaaS platforms like HubSpot, Notion, and Linear in user experience quality — but purpose-built for financial operations in the Arabic-speaking world.

The target customer is a **growing business** — 5 to 500 employees — that has outgrown spreadsheets and disconnected tools but is not ready for a multi-year ERP implementation project. They need something that works today, grows with them, and does not require a consultant to operate.

### 1.5 The Promise

> **One platform. Every operation. In Arabic. Built right.**

OFS promises its users:

- **Completeness** — every function a growing business needs, available in one place.
- **Clarity** — no feature is hidden, no workflow is ambiguous, no number is untraced.
- **Speed** — sub-second dashboards, instant search, and zero loading spinners on core actions.
- **Trust** — every financial entry is auditable, every user action is logged, every import is validated.
- **Ownership** — businesses control their data, their workflows, their statuses, and their rules.

---

## 2. Product Goals

Product goals are organized into three tiers: **System Goals** (what the platform must do), **Quality Goals** (how well it must do it), and **Business Goals** (what outcomes it must produce).

### 2.1 System Goals

#### SG-01 — Unified Operations
All modules — CRM, Sales, Purchasing, Inventory, Accounting, Expenses, HR — must operate within a single platform under a unified data model. There must be no need for external integrations to connect core business functions to each other.

#### SG-02 — Arabic-First Architecture
The platform must be designed in Arabic first. RTL layout, Arabic typography, Arabic date and number formatting, and Arabic-language default content must be foundational constraints, not post-launch additions. The English version, if offered, is derived from the Arabic version — not the reverse.

#### SG-03 — Validated Data Entry
No data enters the system without passing through a validation and approval layer. This applies specifically to bulk imports via the Import Center but governs all system entry points. Garbage-in must be structurally impossible.

#### SG-04 — Complete Auditability
Every state change on every entity must be recorded: who changed what, from what value, to what value, at what time. Financial entries must carry a complete audit trail that satisfies standard accounting review requirements.

#### SG-05 — Configurable Without Code
Administrators must be able to configure lead statuses, order statuses, shipping statuses, payment statuses, expense categories, customer tags, roles, permissions, workflows, and active modules — all from the UI, without developer intervention. The system must treat configuration as data, not code.

#### SG-06 — Multi-Tenant by Design
The platform must support multiple independent tenants (Brands) on shared infrastructure, with absolute data isolation between them. A Brand's data must be invisible and inaccessible to any other Brand under all circumstances.

#### SG-07 — Modular Activation
Each module must be independently activatable and deactivatable per Brand. A Brand that only needs Accounting and Expenses must not be exposed to the complexity of Sales or HR modules.

#### SG-08 — Structured Lead Lifecycle
The platform must enforce a structured, auditable lifecycle for leads — from import through validation, deduplication, approval, assignment, follow-up, and conversion to order. No step in this chain may be skipped without explicit configuration permitting it.

#### SG-09 — Reconciliation-Grade Accounting
The accounting module must implement double-entry bookkeeping principles. Every transaction must produce balanced journal entries. The platform must support chart of accounts configuration, account hierarchies, period closing, and financial statement generation.

#### SG-10 — Role and Scope Isolation
Every user's access must be governed by both their assigned role (what they can do) and their assigned scope (what data they can see). A sales agent in Branch A must have no access to data in Branch B, even if they share the same role title.

---

### 2.2 Quality Goals

#### QG-01 — Performance at Scale
The platform must remain fast as data volume grows. Performance targets are not aspirational — they are acceptance criteria. Any feature that does not meet its performance target at representative data volumes is incomplete.

| Metric | Target |
|---|---|
| Dashboard initial load | < 1 second |
| Report generation | < 2 seconds |
| API response P95 | < 300ms |
| Database query P95 | < 100ms |
| Search results | < 200ms |
| Table pagination | < 300ms |

#### QG-02 — Zero Tolerance for N+1 Queries
Every list view, every report, and every API endpoint must be reviewed against the N+1 query anti-pattern before release. The database must never be called in a loop for data that could be fetched in a single query.

#### QG-03 — Consistent Design System
Every screen in the platform must be built from a single, versioned design system. No ad-hoc styling. No inconsistent spacing. No one-off components. The design system governs every element: spacing, typography, color, interactive state, loading state, empty state, and error state.

#### QG-04 — Mobile Readiness
All primary workflows must be accessible and fully functional on mobile devices. The responsive breakpoints must be treated as first-class targets, not degraded fallbacks. A sales agent following up on a lead from their phone must have the same workflow capability as one at a desktop.

#### QG-05 — Accessibility Compliance
The platform must meet WCAG 2.1 AA standards. This includes keyboard navigation, screen reader compatibility, sufficient color contrast ratios, and focus management — all verified in RTL layout.

#### QG-06 — Reliability
The platform targets 99.9% monthly uptime for all Tier 1 modules (Dashboard, Sales, Accounting, Inventory). Scheduled maintenance windows must not exceed 30 minutes per month.

---

### 2.3 Business Goals

#### BG-01 — Fast Onboarding
A new Brand must be able to go from signup to first operational transaction in under 2 hours. Onboarding wizards, pre-configured chart of accounts templates, and sensible defaults must eliminate the blank-slate problem.

#### BG-02 — Subscription Flexibility
The platform must support tiered subscription plans that align module access with business size and budget. Brands must be able to start small and expand their subscription without data migration or system disruption.

#### BG-03 — Import as a First-Class Workflow
The Import Center is not a utility feature — it is a primary entry point for operational data. Many businesses manage their orders and leads in spreadsheets today. The Import Center must make the transition from spreadsheet to OFS seamless, reliable, and repeatable.

#### BG-04 — Data Ownership and Portability
Businesses must be able to export their complete data at any time, in standard formats, without requiring support assistance. Lock-in through data inaccessibility is explicitly rejected as a business practice.

---

## 3. Reference Systems

OFS is informed by the following reference systems. These are studied for their functional logic and product decisions, not replicated in their UI or copied in their implementation.

### 3.1 Accounting Logic Reference — Daftra

**Why Daftra:**
Daftra is one of the most widely adopted Arabic-language accounting platforms in the MENA region. It has earned trust among small and medium businesses precisely because it maps to how Arabic-speaking accountants and business owners think about financial operations. Its workflows reflect localized accounting conventions that are not present in Western-origin accounting software.

**What OFS learns from Daftra:**

| Area | Learning |
|---|---|
| Chart of Accounts | The account structure and default Arabic account names familiar to regional accountants. OFS adopts compatible terminology so migrating users feel at home. |
| Invoice Flows | The concept of linking sales invoices to payment receipts and to accounting entries in one connected flow. |
| Tax Handling | Regional tax models (VAT, withholding) and how they interact with invoice line items. |
| Arabic Financial Statements | The format, terminology, and layout conventions for P&L, Balance Sheet, and Cash Flow statements as expected by Arabic-reading stakeholders. |
| Payment Methods | The diversity of payment methods relevant to the region: cash, bank transfer, cheque, POS, digital wallets. |

**What OFS deliberately does differently from Daftra:**

- Daftra is primarily an accounting and invoicing tool. OFS is an operational platform that includes accounting as one module among many. The accounting module in OFS must be deeply integrated with Sales, Purchasing, and Expenses — not a standalone ledger.
- Daftra's UI, while functional, follows conventions from an earlier era of web software. OFS targets a significantly higher standard of visual design, interaction quality, and information density.
- Daftra does not have a structured lead management or CRM layer. This entire domain is native to OFS.

---

### 3.2 Inventory, Sales, and Purchasing Reference — Odoo

**Why Odoo:**
Odoo is the most comprehensive open-source business platform available and has the broadest coverage of operational workflows — purchase orders, warehouse management, inventory valuation methods, sales order lifecycle, and multi-location stock operations. Its data model for operational commerce is mature, battle-tested, and widely understood by ERP practitioners.

**What OFS learns from Odoo:**

| Area | Learning |
|---|---|
| Purchase Order Lifecycle | The structured flow from purchase request → supplier selection → purchase order → goods receipt → vendor bill → payment. |
| Inventory Valuation | Support for FIFO, AVCO (Weighted Average Cost), and standard cost methods as accounting-grade inventory valuation. |
| Multi-Location Stock | The concept of stock moves between internal locations, virtual locations, and external (supplier/customer) locations as the foundation of inventory traceability. |
| Sales Order to Invoice | The direct link between confirmed sales orders, delivery, and invoice generation — ensuring revenue is recognized only when earned. |
| Product Variants | The model for handling products with multiple attributes (size, color, etc.) as variants of a single product template. |
| Reordering Rules | Automated or semi-automated purchase recommendations based on minimum stock levels and lead times. |

**What OFS deliberately does differently from Odoo:**

- Odoo's interface is functionally comprehensive but cognitively overwhelming. OFS targets a significantly simpler, more opinionated UX. Complexity is hidden behind sensible defaults; power is available but not surfaced by default.
- Odoo is a generalist platform serving hundreds of industries. OFS is deliberately focused on the operational patterns of trading, services, and distribution businesses in the Arabic-speaking market.
- Odoo requires significant technical expertise to configure and maintain. OFS must be self-configurable by a business owner or operations manager without developer involvement.
- Odoo's RTL and Arabic support is layered on top of a fundamentally LTR design system. OFS starts RTL and derives LTR from it.

---

### 3.3 UI/UX Inspiration — Microsoft Clarity & Apple Dashboards

**Why These References:**
These are not ERP systems. They are chosen specifically because they represent the quality standard of modern product interfaces — the kind of design that sets user expectations today. OFS must feel like a product from this era, not from the era that produced most accounting software.

#### Microsoft Clarity

**What OFS learns:**

| Element | Application in OFS |
|---|---|
| Dense data presentation | Clarity presents large volumes of behavioral data in a compact, scannable layout. OFS adopts this principle: high information density without visual clutter. |
| Progressive disclosure | Complex data is summarized at the top; details are available on demand. OFS tables lead with key columns; secondary data is revealed on row expansion. |
| Purposeful color use | Color in Clarity is used to communicate meaning (positive/negative trend, severity, status) — not decoration. OFS follows the same discipline: every color choice carries semantic weight. |
| Empty states | Clarity's empty states guide users toward the next action rather than displaying a blank screen. OFS must implement this consistently across all modules. |

#### Apple Dashboards

**What OFS learns:**

| Element | Application in OFS |
|---|---|
| Metric cards | The clean, minimal metric card format — large primary number, supporting label, trend indicator — is adopted as the standard KPI display unit across all OFS dashboards. |
| Whitespace as structure | Apple interfaces use whitespace to create visual hierarchy without borders or dividing lines. OFS applies this to reduce visual noise in dense operational screens. |
| Typography hierarchy | Clear, consistent typographic hierarchy where the most important number or action is immediately visually dominant. |
| Motion and feedback | Subtle, purposeful animation that confirms actions and communicates state changes — never decorative motion. |

**What OFS does not take from these references:**
- Neither Clarity nor Apple dashboards deal with transactional forms, multi-step workflows, or Arabic language. OFS cannot borrow their specific layouts — it must derive equivalent quality from first principles applied to Arabic-language operational forms.

---

## 4. Design Principles

These principles are non-negotiable. They govern every screen, every component, and every interaction in the platform. They are not guidelines to be followed when convenient — they are constraints that define what OFS is.

---

### 4.1 Language and Direction

#### P-01 — Arabic First
Arabic is the primary language of the platform. All default content, all placeholder text, all error messages, all email templates, and all system-generated reports default to Arabic. English is a secondary language option that does not compromise or degrade the Arabic experience.

#### P-02 — RTL is the Default Direction
The entire layout system is built RTL. Every component — navigation, forms, tables, cards, modals, tooltips, dropdowns, progress indicators — is designed and tested in RTL first. LTR is derived from the RTL implementation, not the other way around.

In RTL layout, the following directional rules apply throughout the system:

- Primary navigation is on the **right** side of the screen.
- Content flows from **right to left**.
- Icons that imply direction (arrows, chevrons, breadcrumbs) are **mirrored**.
- Form field labels are **right-aligned**.
- Table columns read from **right to left** (first column is rightmost for primary identifier).
- Numerical data and currency amounts follow Arabic numeral conventions by default, with user-configurable switching to Eastern Arabic-Indic numerals.

#### P-03 — Rubik is the Platform Typeface
Rubik is the exclusive typeface for all platform text. It was selected for its:
- Excellent Arabic glyph quality and legibility at small sizes.
- Geometric, modern character that aligns with the premium SaaS aesthetic.
- Full support for Arabic Unicode ranges including presentation forms.
- Available weights (300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold) that support a complete typographic hierarchy.

No other typeface may be introduced without a formal design system review.

#### P-04 — Typography Scale
The platform uses a fixed type scale to maintain consistent visual hierarchy:

| Role | Size | Weight | Usage |
|---|---|---|---|
| Display | 32px | 700 Bold | Page titles, empty state headlines |
| Heading 1 | 24px | 600 SemiBold | Section headings |
| Heading 2 | 20px | 600 SemiBold | Card titles, modal headings |
| Heading 3 | 16px | 600 SemiBold | Subsection labels |
| Body Large | 15px | 400 Regular | Primary body text |
| Body | 14px | 400 Regular | Default body, form values |
| Body Small | 13px | 400 Regular | Secondary information, help text |
| Caption | 12px | 400 Regular | Metadata, timestamps, tooltips |
| Label | 12px | 500 Medium | Form labels, column headers |

---

### 4.2 Color System

#### P-05 — Primary Color: Professional Accounting Green
The primary brand color is a professional, desaturated green in the tradition of financial and accounting software — conveying trust, accuracy, and stability. This is not a bright lime green or a vivid emerald. It occupies the space between teal and forest green, with sufficient luminance contrast to meet WCAG AA on white backgrounds.

The color system has five roles:

| Role | Purpose |
|---|---|
| **Primary** | Main actions, active states, brand identity, positive financial indicators |
| **Neutral** | Backgrounds, borders, dividers, disabled states, secondary text |
| **Semantic: Success** | Confirmations, positive amounts, completed statuses |
| **Semantic: Warning** | Pending states, items requiring attention, near-threshold alerts |
| **Semantic: Danger** | Errors, deletions, negative amounts, critical alerts |

#### P-06 — Color Carries Meaning
Color is never decorative. Every use of color communicates a specific meaning. A green amount means a positive balance. A red status badge means a critical or overdue state. A yellow indicator means pending attention. Using the primary green for decorative purposes degrades its semantic power.

---

### 4.3 Layout and Density

#### P-07 — Compact and Information-Dense
OFS is an operational tool used by people who spend their entire workday inside it. The interface must be compact and information-dense. A sales agent reviewing 50 leads must be able to scan them efficiently. An accountant reviewing journal entries must see 25 rows in a table without scrolling. Padding and whitespace serve clarity, not aesthetics.

The density target: most list views should display a minimum of 20 rows before pagination at 1080p resolution without requiring vertical scrolling on the table itself.

#### P-08 — Consistent Spatial System
All spacing derives from a base unit of **4px**. Every margin, padding, gap, and offset is a multiple of 4: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. No arbitrary pixel values.

#### P-09 — Responsive Breakpoints
The layout adapts across three primary breakpoints:

| Breakpoint | Range | Layout Behavior |
|---|---|---|
| Mobile | 0 – 767px | Single column, bottom navigation, full-width cards |
| Tablet | 768px – 1199px | Two-column content, collapsible sidebar |
| Desktop | 1200px+ | Full sidebar navigation, multi-column layouts, dense tables |

All three breakpoints are tested targets. No feature is complete until it works correctly at all three.

---

### 4.4 Components and Interaction

#### P-10 — Searchable Dropdowns Everywhere
Every dropdown that contains more than 5 items must be a searchable dropdown. This is not optional. Product selection, customer selection, account selection, employee selection, country selection — all searchable. The search must filter as the user types with no perceptible lag.

#### P-11 — Clear Button on All Searchable Inputs
Every searchable input field and every filter field must display a visible clear (×) button when it contains a value. The clear button removes the value with a single click. Users must never be forced to manually select and delete text to clear a field.

#### P-12 — Pagination on Every Table
Every table that displays more than one page of data must have pagination controls. Pagination must be server-side — the client never loads more data than the current page. The standard page size options are 25, 50, and 100 rows, with 25 as the default.

#### P-13 — Bulk Actions on Every Table
Every table that displays records that can be acted upon must support bulk selection and bulk actions. The minimum bulk actions are:
- Select all on current page
- Select all matching records (across all pages)
- Bulk delete (where permitted)
- Bulk status change (where applicable)
- Bulk export

The bulk action toolbar must appear contextually when one or more rows are selected and disappear when the selection is cleared.

#### P-14 — Professional Hover States
Every interactive element must have a distinct, well-designed hover state. Table rows highlight on hover. Buttons shift in brightness on hover. Links underline on hover. Cards elevate subtly on hover where clickable. Hover states must use CSS transitions of 120–180ms duration — fast enough to feel responsive, slow enough to be noticed.

#### P-15 — Loading States
Every asynchronous operation — page loads, filter applications, search queries, form submissions — must display a loading indicator. The platform must never present a blank screen or unresponsive UI during a loading operation. Skeleton screens are preferred over spinners for content that has a predictable layout.

#### P-16 — Empty States
Every list, table, or data view must have a designed empty state. The empty state must:
- Explain why the view is empty (no data yet, no results match the filter).
- Provide a clear call to action (import data, create first record, clear filters).
- Use an appropriate illustration or icon that reinforces the context.

Empty states are never blank white boxes.

#### P-17 — Error States
All form validation errors must appear inline, immediately adjacent to the offending field, in Arabic. Errors must not require form submission to appear — real-time validation is preferred for fields with deterministic rules (required, format, range). The submit button must not be the first place a user learns their input is invalid.

---

### 4.5 Minimal and Premium

#### P-18 — No Visual Noise
Every element on a screen must earn its presence. Decorative borders, unnecessary icons, redundant labels, and filler content are removed. If removing an element does not reduce understanding, it should be removed.

#### P-19 — Purposeful Iconography
Icons are used to aid recognition of known patterns (save, delete, filter, search, settings) and to communicate status at a glance. Icons are never used as decoration. Every icon must have an accessible text label or tooltip. Icon sets must be consistent — a single icon library is used throughout the platform.

#### P-20 — Consistent Elevation Model
The platform uses a simple three-level elevation model:

| Level | Use Case |
|---|---|
| Level 0 — Flat | Page background, table rows, form fields |
| Level 1 — Raised | Cards, sidebars, sticky headers |
| Level 2 — Floating | Modals, dropdowns, tooltips, popovers |

Shadows are subtle, using low-opacity dark values rather than heavy drop shadows. Elevation is communicated through shadow and background contrast, not borders.

---

## 5. SaaS Hierarchy

OFS is a multi-tenant platform with a five-level organizational hierarchy. Understanding this hierarchy is essential to understanding how data is scoped, how permissions are assigned, and how the platform is configured and administered.

---

### 5.1 Hierarchy Overview

```
Platform Owner
      │
      ├── Brand A
      │     ├── Company A1
      │     │     ├── Branch A1-1
      │     │     │     └── Users
      │     │     └── Branch A1-2
      │     │           └── Users
      │     └── Company A2
      │           └── Branch A2-1
      │                 └── Users
      │
      └── Brand B
            └── Company B1
                  └── Branch B1-1
                        └── Users
```

Each level has a distinct identity, distinct capabilities, and distinct data boundaries. Data created at any level belongs to that level and is visible only to principals with access to that level or above within the same Brand lineage.

---

### 5.2 Level 1 — Platform Owner

The Platform Owner is the entity that operates the OFS SaaS platform. There is exactly one Platform Owner per platform deployment.

**Identity:**
The Platform Owner is Softland (or the operating entity of the OFS platform). This is not a customer — it is the platform operator.

**Capabilities:**

| Capability | Description |
|---|---|
| Brand Lifecycle Management | Create, activate, suspend, and terminate Brands. |
| Subscription Management | Create and modify subscription plans, assign plans to Brands, manage billing cycles, enforce usage limits. |
| Plan Configuration | Define the feature set and module access included in each subscription tier. |
| Platform-Wide Settings | Configure global settings such as supported currencies, supported languages, system-wide rate limits, and maintenance windows. |
| Platform Analytics | View aggregated, anonymized analytics across all Brands: total active users, module adoption rates, import volumes, system performance metrics. |
| Support Access | With explicit consent, access a Brand's environment in read-only mode to assist with support escalations. |

**Data Access:**
The Platform Owner has no access to individual Brand's operational data (leads, orders, accounting entries, etc.) except through explicit, logged, and time-limited support access sessions. Platform-level analytics are always aggregated — no individual record is visible at the platform level.

**Constraints:**
- There is only one Platform Owner account.
- Platform Owner credentials must be protected by hardware-grade MFA.
- All Platform Owner actions are permanently logged in a tamper-evident audit trail.

---

### 5.3 Level 2 — Brand

A Brand is a top-level organizational tenant on the platform. It represents a business group, a franchise, an independent business, or a reseller operating one or more companies under a common identity.

**Examples of Brands:**
- A retail holding group operating three separate retail chains.
- A franchise operator running 12 franchised locations under one brand umbrella.
- An independent trading company with two subsidiaries.
- A SaaS reseller managing OFS deployments for their clients (each client is a Brand).

**Identity:**
Each Brand has its own:
- Name, logo, and primary color (used in their white-labeled interface, if applicable).
- Subscription plan and active module set.
- Independent user directory.
- Independent data store (logically isolated).

**Capabilities:**

| Capability | Description |
|---|---|
| Company Management | Create, configure, and deactivate Companies within the Brand. |
| Branch Management | Create and configure Branches under each Company. |
| User Management | Create user accounts, assign roles, assign scope (which companies/branches a user can access). |
| Module Activation | Activate or deactivate modules (e.g., enable HR, disable Purchasing) within the limits of their subscription plan. |
| Workflow Configuration | Configure approval workflows, lead assignment rules, and automated status transitions. |
| Dynamic Entity Configuration | Create and manage lead statuses, order statuses, expense categories, customer tags, and other configurable entities. |
| Brand-Level Reporting | View reports aggregated across all Companies and Branches within the Brand. |
| Subscription Visibility | View current subscription status, usage metrics, and plan limits. |

**Brand Administrator:**
The Brand is managed by one or more users with the Brand Admin role. The Brand Admin has the highest level of access within the Brand, bounded by what the subscription plan permits.

**Data Isolation:**
A Brand's data is completely isolated from all other Brands. This isolation is enforced at the data layer, not just the application layer. Under no circumstances can a user from Brand A access, view, or infer data from Brand B.

---

### 5.4 Level 3 — Company

A Company is a distinct legal entity operating under a Brand. It typically corresponds to a registered business with its own trade name, tax registration, and financial statements.

**Examples of Companies:**
- Brand: "Al-Noor Holdings" → Companies: "Al-Noor Trading LLC", "Al-Noor Logistics LLC".
- Brand: "TechMart Group" → Companies: "TechMart Riyadh", "TechMart Jeddah" (if treated as separate legal entities).

**Identity:**
Each Company has its own:
- Legal name and trade name.
- Tax registration number (VAT number, commercial registration).
- Base currency.
- Fiscal year configuration.
- Chart of accounts (can inherit from a Brand template or be independently configured).
- Bank accounts.

**Financial Separation:**
Companies are the financial unit of the platform. Each Company maintains its own:
- General ledger and chart of accounts.
- Accounts receivable and payable subledgers.
- Bank reconciliation records.
- Financial statements (P&L, Balance Sheet, Cash Flow).

Inter-company transactions (where a transaction occurs between two Companies within the same Brand) are a configurable feature. When enabled, inter-company transfers generate matching accounting entries in both entities.

**Capabilities at Company Level:**
Company-level administrators can configure Company-specific settings:
- Fiscal year start and end.
- Default invoice payment terms.
- Tax configuration.
- Currency and rounding rules.
- Document numbering sequences (invoice numbers, order numbers, etc.).

---

### 5.5 Level 4 — Branch

A Branch is an operational unit within a Company. It represents a physical location, a sales channel, a department, or any subdivision that requires independent operational tracking while sharing the Company's financial identity.

**Examples of Branches:**
- Company: "Al-Noor Trading LLC" → Branches: "Riyadh Showroom", "Online Store", "Jeddah Warehouse".
- Company: "TechMart Riyadh" → Branches: "Mall of Arabia Outlet", "King Fahad Road Outlet", "Call Center".

**Identity:**
Each Branch has:
- A name and physical address.
- An assigned set of users.
- A default inventory location (warehouse).
- Operational settings (working hours, assigned delivery zones, etc.).

**Purpose of the Branch Level:**
Branches serve three functions:

1. **Operational Routing** — Leads can be assigned to specific branches. Orders can be fulfilled from specific branches. Expenses can be tracked by branch.

2. **Data Scoping** — Users assigned to a branch see only their branch's leads, orders, and customers. A sales agent at the Jeddah branch does not see the Riyadh branch's pipeline.

3. **Performance Tracking** — Reporting at the branch level enables comparison of operational performance across locations: revenue per branch, lead conversion rate per branch, expense per branch.

**Relationship to Inventory:**
Each Branch is associated with one or more inventory locations (warehouses or stock areas). Stock movements record the originating and destination locations, maintaining complete traceability across branches.

---

### 5.6 Level 5 — Users

Users are the humans who operate the platform. Every user account is created within a Brand and assigned to one or more Companies and Branches based on their role and responsibilities.

**User Identity:**
Each user has:
- Full name (Arabic and optionally English).
- Email address (login credential).
- Phone number.
- Profile photo.
- Language preference (Arabic / English).
- Timezone.
- Assigned role (single role per Company-Branch context).
- Assigned scope (which Companies and Branches they can access).

**User Scope Assignment:**
A user's data visibility is determined by their scope assignment. The scope model supports multiple configurations:

| Configuration | Description | Example |
|---|---|---|
| Single Branch | User sees only one branch within one company. | Junior sales agent at a specific outlet. |
| All Branches in a Company | User sees all branches within a specific company. | Company sales manager. |
| All Companies in a Brand | User sees all data across the entire brand. | Brand General Manager. |
| Selected Companies, Selected Branches | Custom cross-entity access. | Regional manager covering specific outlets. |

**Important Constraint:** Scope defines the ceiling of data visibility. Role defines the ceiling of permitted actions. A user's effective access is the intersection of their role permissions and their assigned scope. Broader scope does not grant additional action permissions beyond what the role allows.

**User Lifecycle:**

```
Invited by Admin
      ↓
Activation Email Sent
      ↓
User Sets Password
      ↓
Active
      ↓
    [Role or Scope Updated by Admin]
      ↓
    [Suspended by Admin]
      ↓
    [Reactivated or Permanently Deactivated]
```

Deactivated users cannot log in. Their historical records (which orders they created, which leads they handled) are preserved and attributed to their account. Deactivation does not delete history.

---

### 5.7 Hierarchy Data Flow

The following illustrates how a standard operational transaction flows through the hierarchy and how data boundaries are enforced:

```
A lead is imported via the Import Center.
      │
      ▼
It is associated with a specific Branch.
      │
      ▼
Users with access to that Branch can view and act on it.
      │
      ▼
When converted to an Order, the Order is created under the Company that owns the Branch.
      │
      ▼
The Order drives inventory movements in the Branch's warehouse.
      │
      ▼
The Order drives an accounting entry in the Company's general ledger.
      │
      ▼
The Company's financial statements reflect the revenue.
      │
      ▼
The Brand's consolidated report includes this Company's performance.
      │
      ▼
The Platform Owner sees total platform activity (count/volume, not record content).
```

This flow ensures that operational data (the specific lead, the specific customer, the specific order amount) is confined to the Branch and Company where it originated, while aggregated business intelligence flows upward through the hierarchy to the levels that need it.

---

### 5.8 Hierarchy Configuration Rules

The following rules govern the creation and management of hierarchy nodes:

| Rule | Detail |
|---|---|
| A Brand must have at least one Company to be operational. | A Brand with no Companies cannot have active users or process transactions. |
| A Company must have at least one Branch to be operational. | Transactions are always assigned to a Branch. A Company with no Branches cannot process transactions. |
| A User must be assigned to at least one Branch to access operational modules. | Users without Branch assignment can only access settings and configuration relevant to their role. |
| Deleting a hierarchy node is not permitted if it has associated operational data. | Companies and Branches with transactions, users, or inventory cannot be deleted. They can only be deactivated. |
| A deactivated Branch cannot receive new leads or orders. | Existing data in a deactivated Branch remains accessible in read-only mode to authorized users. |
| Companies cannot be moved between Brands. | The Company-to-Brand relationship is permanent. Restructuring requires creating a new Company. |
| Branches can be moved between Companies within the same Brand. | This is a privileged operation, logged in the audit trail, and requires confirmation. It does not alter historical transaction records — those remain associated with the Branch. |

---

*End of Section 5 — SaaS Hierarchy*

---

**Document Status:** Sections 1–5 complete. Sections 6–15 pending.

---

## 6. User Types

User Types describe the human personas that interact with OFS. They are distinct from Roles — a Role is a system-level access control construct, while a User Type is a persona description: who the person is, what they need, how they spend their day, and what the system must do well for them. Understanding User Types is essential for making correct product decisions: what to surface by default, what to hide behind configuration, what to optimize for speed, and what workflows to make frictionless.

---

### 6.1 Platform Operator

**Who they are:**
The team member at Softland (the platform owner) responsible for managing the OFS SaaS infrastructure — onboarding new Brands, managing subscription plans, monitoring platform health, and handling escalated support issues.

**Daily context:**
They work in the Platform Owner console, not inside any Brand's operational environment. They rarely see individual business records. Their world is Brands, plans, usage metrics, and system configuration.

**What the system must do for them:**
- Present a clean overview of all active Brands, their subscription status, and key usage metrics.
- Allow fast activation and suspension of Brands with a clear confirmation workflow.
- Surface platform-level health: API error rates, slow queries, import failure rates, active user counts.
- Log every action they take in a permanent, tamper-evident audit trail.

**Pain points to avoid:**
- Having to navigate into individual Brand environments to answer basic questions about usage.
- Any action that is irreversible without a confirmation step.

---

### 6.2 Brand Administrator

**Who they are:**
The most senior operational user within a Brand. Often the business owner, COO, or IT director of the organization. They are responsible for the overall configuration and health of their OFS environment. They set up the organizational structure, configure workflows, manage users, and oversee the platform's alignment with business processes.

**Daily context:**
They may not be in the system every day for transactional work. They visit to review configuration, investigate anomalies, manage user access, or review cross-company analytics. When they do interact with transactions, it is at a supervisory level — reviewing an approval queue, investigating a data discrepancy, running a consolidated report.

**What the system must do for them:**
- Provide a high-level dashboard showing the health of the entire Brand: revenue across companies, active leads, pending approvals, recent imports.
- Make organizational configuration (companies, branches, users, roles) navigable and change-confirmable.
- Surface audit logs that let them answer "who changed this, and when?"
- Allow module activation and workflow configuration without requiring technical knowledge.

**Pain points to avoid:**
- Configuration screens that require understanding of technical concepts (JSON, regex, code).
- Changes that take effect immediately without preview or confirmation.
- Inability to delegate specific administrative tasks to other users without granting full admin access.

---

### 6.3 General Manager

**Who they are:**
The senior business executive within a Company — not necessarily the Brand owner. The General Manager oversees all operations within their assigned company: sales performance, financial health, purchasing decisions, and team productivity. They are a heavy consumer of reports and dashboards, a moderate consumer of operational screens, and an approver of significant transactions.

**Daily context:**
Starts the day on the dashboard. Reviews KPIs: revenue today vs. target, open leads, pending orders, expense approvals, and any items flagged for their attention. Spends most of their time in reports, summary views, and approval queues — not in individual data entry screens.

**What the system must do for them:**
- Deliver a rich, fast, and insightful dashboard that loads in under one second.
- Surface exceptions and items requiring action prominently: overdue invoices, pending approvals, leads not contacted in X days.
- Provide cross-module reports that answer business questions without requiring navigation through multiple screens.
- Allow drill-down from a summary metric to the underlying records.

**Pain points to avoid:**
- Dashboards that are slow or require manual refresh.
- Reports that require filtering setup every time — saved report configurations are essential.
- Being forced to navigate through operational workflows designed for agents to find summary information.

---

### 6.4 Team Manager

**Who they are:**
A middle-management user responsible for a specific team within a Branch: the sales team, the customer care team, or the support team. They are operational supervisors — they assign leads, review team performance, resolve escalations, and ensure their team is meeting targets.

**Daily context:**
Heavily involved in lead and order management. Monitors their team's pipeline: who has how many leads, which leads are stalled, which agents are under- or over-loaded. Approves or escalates items that require senior intervention. Runs team-level performance reports.

**What the system must do for them:**
- Show a real-time view of their team's pipeline with clear visual indicators of lead age, status, and assignment.
- Allow rapid reassignment of leads between agents — bulk reassignment is a common and critical operation.
- Surface agent productivity metrics: contacts made today, orders created, conversion rate.
- Allow the manager to act on behalf of their team only in explicitly permitted scenarios (e.g., creating a note on a lead).

**Pain points to avoid:**
- Having to open individual lead records to assess lead health — list views must carry enough information to triage at a glance.
- Slow lead list loads when the team has hundreds of active leads.
- Inability to see across all their agents' workloads in a single view.

---

### 6.5 Sales Agent

**Who they are:**
The frontline operator who works leads, contacts customers, creates orders, and drives revenue. They are the most frequent users of the system and the users most sensitive to performance and usability. Their workflow is transactional and repetitive: open lead, review history, contact customer, update status, create order, move to next lead.

**Daily context:**
Arrives to a queue of assigned leads. Works through them systematically: calls customers, logs outcomes, updates lead status, creates orders when customers confirm. May process 30–150 leads in a day depending on the nature of the business. Speed and clarity of the lead screen directly impacts their productivity.

**What the system must do for them:**
- Present their assigned lead queue immediately on login with no loading delay.
- Make the lead detail screen fast to navigate: all relevant customer information, full history, and all action buttons visible without scrolling.
- Allow status updates, notes, and order creation with minimal clicks.
- Never lose a form entry on navigation — accidental back-button clicks must not destroy in-progress work.

**Pain points to avoid:**
- Any loading state between clicking a lead and seeing its details.
- Form fields that reset on validation error.
- Notifications or modal interruptions that disrupt their workflow rhythm.
- Being able to accidentally see or act on leads that belong to other agents.

---

### 6.6 Customer Care Agent

**Who they are:**
A user focused on post-order customer interactions: handling complaints, tracking order status, coordinating refunds or exchanges, and updating customers on delivery progress. They need a complete view of the customer's history with the business — not just the current order, but all past interactions.

**Daily context:**
Receives customer inquiries (by phone, chat, or email — logged manually in the system) and resolves them. Primary screens are the customer record, the order record, and the communication log. They do not create orders but may update order statuses, log notes, escalate to management, or trigger refund workflows.

**What the system must do for them:**
- Provide a 360-degree customer view: all orders, all payments, all communications, all complaints in one place.
- Allow fast customer lookup by phone number, order ID, or name — search must match partial values and be instantaneous.
- Surface the current status and location of every order linked to the customer.
- Allow note logging and status updates without navigating away from the customer record.

**Pain points to avoid:**
- Searching for a customer and getting no result because of a minor spelling variation.
- Having to navigate to three different screens to answer a single customer question.
- Order status information that is stale or requires manual refresh.

---

### 6.7 Accountant

**Who they are:**
A finance professional responsible for the day-to-day accounting operations of a Company: journal entries, bank reconciliation, accounts receivable and payable management, expense recording, and period-end closing procedures. They are deeply familiar with double-entry bookkeeping and expect the system to behave like a proper accounting engine.

**Daily context:**
Reviews auto-generated accounting entries from sales orders and expenses. Investigates mismatches in the reconciliation queue. Manually enters journal entries for transactions that do not flow automatically. Runs trial balances and account statements. Prepares supporting documentation for period close.

**What the system must do for them:**
- Generate accounting entries automatically and correctly from every sales, purchasing, and expense transaction.
- Present the accounting impact of any transaction clearly before it is committed.
- Provide a clean journal entry interface that feels native to accounting practice — debit/credit columns, account search, reference fields.
- Support multi-currency entries with locked exchange rates at the transaction date.
- Allow draft entries to be saved, reviewed, and posted in a separate step — never auto-post without confirmation.

**Pain points to avoid:**
- Auto-posting entries without a review step.
- Inability to add a manual adjustment journal entry to correct an automated one.
- Account selection that requires knowing the account code instead of searching by name.
- Period data that can be modified after closing — closed periods must be locked.

---

### 6.8 Finance Manager

**Who they are:**
A senior financial officer — CFO, Finance Director, or Finance Manager — responsible for financial oversight, financial reporting, budget management, and cash flow planning. They are consumers of financial data at a summary and analytical level, not day-to-day transaction processors.

**Daily context:**
Reviews financial dashboards: cash position, revenue vs. budget, outstanding receivables, upcoming payable due dates. Approves large transactions and expense claims above threshold. Reviews and approves period-end financial statements before they are finalized. Sets financial policies: payment terms, expense approval limits, account structures.

**What the system must do for them:**
- Provide financial dashboards with real-time visibility: bank balances, aging receivables, aging payables, monthly P&L trend.
- Support multi-company consolidated views where applicable.
- Allow configuration of approval thresholds and financial policies without developer intervention.
- Generate export-ready financial statements in formats suitable for external presentation.

**Pain points to avoid:**
- Financial reports that require manual data refresh or export-then-format workflows.
- Inability to drill from a summary figure to its constituent transactions.
- Consolidated views that require running and manually combining individual company reports.

---

### 6.9 Support Agent

**Who they are:**
An internal user who handles post-sales support tickets: technical issues, delivery problems, product complaints, and general customer service escalations. Distinct from Customer Care in that Support Agents deal with more complex, multi-step resolution workflows rather than quick status inquiries.

**Daily context:**
Works a queue of open support cases. Each case is linked to a customer, an order, and a complaint category. They investigate, communicate with the customer, coordinate with other teams (logistics, warehouse, finance), log resolution steps, and close cases. They need read access to a wide range of records but limited write access — they update the support case, not the underlying order or accounting entry.

**What the system must do for them:**
- Present a support case queue with clear priority, age, and status indicators.
- Provide read access to all records linked to a support case — order, customer, payment, shipping — without navigating to those modules separately.
- Allow internal notes (visible only to staff) and external notes (visible to customer in communications) on the same case record.
- Surface escalation paths clearly: who to escalate to, and how.

**Pain points to avoid:**
- Having to request access from an admin to view an order record relevant to their case.
- No distinction between internal and external notes — accidental customer-facing exposure of internal comments.

---

## 7. Roles

Roles are the primary mechanism for defining what actions a user is permitted to perform within OFS. Each role represents a bundle of permissions appropriate to a job function. Roles are assigned to users within a specific scope (Brand, Company, or Branch) and determine the ceiling of what that user can do within that scope.

The platform ships with the following system roles. These are the default role templates. Brand Administrators may create custom roles derived from these templates. The Platform Owner role is non-customizable.

---

### 7.1 Role: Platform Owner

**Scope Level:** Platform (above Brand)
**Instance:** Exactly one per platform deployment.

| Domain | Access Level |
|---|---|
| All Brands | Full lifecycle management (create, activate, suspend, terminate) |
| Subscription Plans | Full create/edit/assign |
| Platform Settings | Full |
| Platform Analytics | Read |
| Individual Brand Data | Read-only, logged, time-limited support access only |
| User Accounts | Platform-level accounts only |

**Key Constraints:**
- Cannot access Brand operational data (leads, orders, accounting entries) except through explicit, logged support sessions.
- All actions are permanently logged.
- Login requires hardware MFA.

---

### 7.2 Role: Brand Admin

**Scope Level:** Brand (all Companies and Branches within the Brand)
**Instance:** One or more per Brand.

| Domain | Access Level |
|---|---|
| Companies | Create, configure, deactivate |
| Branches | Create, configure, deactivate |
| Users | Create, edit, assign roles, assign scope, suspend |
| Roles | Create custom roles, assign permissions to custom roles |
| Module Activation | Activate/deactivate modules per Brand subscription |
| Workflow Configuration | Full |
| Dynamic Entities | Full (statuses, categories, tags) |
| All Operational Modules | Full read; configurable write access |
| Audit Logs | Full read |
| Brand Reports | Full |
| Subscription Status | Read |

**Key Constraints:**
- Cannot exceed the permissions granted by the Brand's subscription plan (e.g., cannot activate a module not included in the plan).
- Cannot modify the Platform Owner account or any platform-level settings.
- Cannot view data belonging to other Brands.

---

### 7.3 Role: General Manager

**Scope Level:** Company (all Branches within the assigned Company)
**Instance:** One or more per Company.

| Domain | Access Level |
|---|---|
| Dashboard | Full read |
| CRM | Full read; create/edit customers and contacts |
| Sales | Full read; approve orders above threshold; view all orders |
| Purchasing | Full read; approve purchase orders above threshold |
| Inventory | Full read |
| Accounting | Full read; cannot post/reverse journal entries (accountant function) |
| Expenses | Full read; approve all expense claims |
| HR | Read employee records; no payroll access |
| Reports | Full access to all Company-level reports |
| User Management | Cannot create/delete users; can view user activity |
| Import Center | Approve/reject import batches |
| Audit Logs | Read within Company scope |

**Key Constraints:**
- Scope is bounded to their assigned Companies and all Branches within them.
- Cannot configure system settings, roles, or dynamic entities.
- Financial statement access is read-only — they may not post accounting entries.

---

### 7.4 Role: Team Manager

**Scope Level:** Branch (the specific Branch(es) to which they are assigned)
**Instance:** One or more per Branch.

| Domain | Access Level |
|---|---|
| CRM | Read customers within Branch scope; create/edit contacts |
| Sales | Full read for Branch; create and edit orders; cannot approve high-value orders |
| Lead Management | Full: assign, reassign, bulk reassign, update status |
| Import Center | Initiate imports for their Branch; approve import batches (if permitted) |
| Reports | Branch-level operational reports |
| Team Performance | Read agent productivity metrics |
| Expenses | Create and submit expense claims; view team expenses |
| Inventory | Read inventory levels for Branch warehouse |

**Key Constraints:**
- Cannot see data outside their assigned Branch(es).
- Cannot access accounting module.
- Cannot create or edit users.
- Cannot configure system settings or dynamic entities.

---

### 7.5 Role: Sales Agent

**Scope Level:** Branch (the specific Branch to which they are assigned)
**Instance:** Many per Branch.

| Domain | Access Level |
|---|---|
| Lead Queue | Read and act on assigned leads only |
| Lead Status | Update status on assigned leads |
| Lead Notes | Create notes on assigned leads |
| Orders | Create orders from leads; edit own unconfirmed orders |
| Customers | Read customer records linked to their leads; create new customers |
| Products | Read product catalog |
| Expenses | Create and submit own expense claims |
| Reports | Own performance metrics only |

**Key Constraints:**
- Cannot see leads assigned to other agents.
- Cannot reassign leads (Team Manager function).
- Cannot view financial data beyond their own commission summaries (if applicable).
- Cannot delete records.
- Cannot access accounting, purchasing, or HR modules.

---

### 7.6 Role: Customer Care Agent

**Scope Level:** Branch (the specific Branch to which they are assigned)
**Instance:** Many per Branch.

| Domain | Access Level |
|---|---|
| Customer Records | Full read; create/edit contact information |
| Orders | Read all orders within Branch scope; update delivery status |
| Communication Log | Create communication entries on any customer record within Branch scope |
| Returns / Complaints | Create and update complaint records |
| Lead Records | Read-only access to leads linked to their cases |
| Expenses | Create and submit own expense claims |
| Reports | Own activity metrics |

**Key Constraints:**
- Cannot create orders.
- Cannot access accounting or financial data.
- Cannot access purchasing or HR modules.
- Cannot see data outside their assigned Branch.

---

### 7.7 Role: Support Agent

**Scope Level:** Branch (the specific Branch to which they are assigned)
**Instance:** Many per Branch.

| Domain | Access Level |
|---|---|
| Support Cases | Full CRUD on support cases |
| Customer Records | Read |
| Orders | Read (all fields required to investigate support cases) |
| Payments | Read payment status; cannot see full payment details (PCI scope) |
| Internal Notes | Create on support cases |
| Escalations | Create escalation records; assign to Team Manager or General Manager |
| Expenses | Create and submit own expense claims |

**Key Constraints:**
- Write access is limited to support case records and internal notes.
- Cannot modify orders, customers, or financial records.
- Cannot access accounting, purchasing, or HR modules.

---

### 7.8 Role: Accountant

**Scope Level:** Company (all Branches within the assigned Company)
**Instance:** One or more per Company.

| Domain | Access Level |
|---|---|
| Accounting | Full: chart of accounts, journal entries, bank reconciliation, period management |
| Sales | Read all orders; read invoices; cannot create/edit orders |
| Purchasing | Read all purchase orders; read vendor bills; cannot create purchase orders |
| Expenses | Read all expense claims; create accounting entries for approved expenses |
| Import Center | Import financial transactions |
| Reports | Full access to accounting and financial reports |
| HR | No access |
| CRM / Leads | No access |

**Key Constraints:**
- Cannot create sales orders or purchase orders — their access to these modules is read-only for accounting purposes.
- Can create, edit, and post journal entries including manual adjustments.
- Can open and close accounting periods.
- Cannot access HR payroll data.

---

### 7.9 Role: Finance Manager

**Scope Level:** Company (all Branches within the assigned Company, optionally expanded to Brand level)
**Instance:** One or more per Company.

| Domain | Access Level |
|---|---|
| Accounting | Full read; approve period closing; view all journal entries |
| Financial Statements | Generate and export |
| Budget Management | Create and manage budgets (if module enabled) |
| Expense Approvals | Approve all expense claims; set approval thresholds |
| Purchase Approvals | Approve purchase orders above defined thresholds |
| Payments | Approve outgoing payments above defined thresholds |
| Reports | Full access to all financial and operational reports |
| User Activity | Read financial activity logs for audit purposes |

**Key Constraints:**
- Does not post individual journal entries (that is the Accountant's function) but may review and reverse them.
- Cannot configure system settings or manage users.
- Cannot access HR module beyond salary cost summaries.

---

### 7.10 Custom Roles

Brand Administrators may create custom roles to accommodate organizational structures that do not map cleanly to the system role templates. Custom roles are always derived from a base system role and may only restrict — not expand — the permissions of that base role.

**Rules for Custom Roles:**
- A custom role inherits all permissions of its base role by default.
- Individual permissions may be removed from the custom role; permissions cannot be added beyond those in the base role.
- A custom role has the same maximum scope level as its base role.
- Custom roles are scoped to the Brand in which they were created.
- Deleting a custom role is only permitted if no active users are currently assigned to it.

**Example:** A Brand may create a "Senior Sales Agent" custom role derived from Sales Agent that adds the ability to view other agents' leads within the Branch (a permission removed from standard Sales Agent). This is achieved by creating the custom role and selecting which permissions to include.

---

## 8. Permission Architecture

OFS uses a **Role-Based Access Control (RBAC)** model augmented by **Scope-Based Access Control**. The two systems are complementary: RBAC governs what actions a user may perform; Scope controls which data those actions apply to. Both constraints must be satisfied for any operation to succeed.

---

### 8.1 The Two Axes of Access Control

```
         WHAT (RBAC)                  WHICH DATA (Scope)
              │                              │
              ▼                              ▼
    Can this user perform         Does this user's scope
    this action on this           include this specific
    type of resource?             record/entity?
              │                              │
              └──────────── AND ─────────────┘
                                │
                                ▼
                     Access Granted or Denied
```

**Example:** A Sales Agent has the RBAC permission to `leads:update_status`. But their scope is limited to Branch A. When they attempt to update the status of a lead in Branch B, the scope check fails. The RBAC permission alone is insufficient — both conditions must pass.

---

### 8.2 Permission Naming Convention

All permissions follow a structured `resource:action` naming convention. This makes permission sets human-readable, programmatically filterable, and easy to audit.

**Format:** `{module}.{resource}:{action}`

**Examples:**

| Permission Key | Meaning |
|---|---|
| `leads:read` | View lead records |
| `leads:create` | Create new leads |
| `leads:update_status` | Change the status of a lead |
| `leads:assign` | Assign a lead to an agent |
| `leads:delete` | Delete a lead record |
| `orders:create` | Create a new sales order |
| `orders:approve` | Approve a sales order for fulfillment |
| `orders:cancel` | Cancel a confirmed order |
| `accounting.journal_entries:create` | Create manual journal entries |
| `accounting.periods:close` | Close an accounting period |
| `accounting.reports:read` | Read accounting reports |
| `inventory.stock_moves:create` | Record inventory movements |
| `expenses:approve` | Approve an expense claim |
| `users:create` | Create a new user account |
| `config.statuses:manage` | Create and edit dynamic status lists |
| `import:initiate` | Start a new import batch |
| `import:approve` | Approve a validated import batch |

---

### 8.3 Standard Actions

The following action vocabulary is used consistently across all resources:

| Action | Meaning |
|---|---|
| `read` | View a record or list of records |
| `create` | Create a new record |
| `update` | Edit an existing record's fields |
| `delete` | Delete a record (soft-delete by default) |
| `update_status` | Change the status field specifically |
| `assign` | Assign the record to a user |
| `approve` | Move a record through an approval gate |
| `reject` | Reject a record at an approval gate |
| `post` | Commit a draft financial record (journal entries, invoices) |
| `reverse` | Create a reversal entry for a posted financial record |
| `export` | Export records to file |
| `import` | Import records from file |
| `manage` | Full lifecycle control (create + update + delete) — reserved for admin-level config |

---

### 8.4 Scope Model

Every user has an assigned scope. Scope is a set of explicit pointers to hierarchy nodes (Brand, Companies, Branches) that the user may access. The scope is stored as a structured list on the user's profile and is evaluated at query time — not at login time.

**Scope Levels:**

| Scope Level | Accessible Data |
|---|---|
| Brand Scope | All Companies and Branches under the Brand |
| Company Scope | All Branches within one or more specified Companies |
| Branch Scope | Only the specified Branch(es) |

**Scope Assignment Rules:**
- A user may be assigned to multiple Companies and/or multiple Branches simultaneously.
- Scope can only be assigned by a user with an equal or higher scope level.
- A Brand Admin cannot be scoped below Brand level (by definition).
- A user's effective scope is the union of all their assigned nodes — if they have Branch A and Branch B, they see data from both.
- Scope changes take effect immediately on next request — there is no cache lag on scope enforcement.

---

### 8.5 Permission Evaluation Flow

Every API request that accesses or modifies data passes through the following evaluation sequence:

```
1. Authentication Check
   └── Is the session token valid and unexpired?
       NO → 401 Unauthorized

2. Role Permission Check
   └── Does the user's role include the required permission key?
       NO → 403 Forbidden

3. Scope Check
   └── Is the target record's Company/Branch within the user's assigned scope?
       NO → 403 Forbidden

4. Business Rule Check
   └── Does the request satisfy any additional business rules?
       (e.g., cannot approve your own expense, cannot post to a closed period)
       NO → 422 Unprocessable

5. Execute Action
   └── Perform the operation and record in audit log.
```

All four checks must pass. A failure at any step terminates the request with the appropriate error response. The error message must not disclose the reason for step 3 failures to the user — a record outside their scope must appear as "not found", not "access denied", to prevent enumeration attacks.

---

### 8.6 Special Permission Patterns

#### Ownership-Based Override
For specific resources, a user may be granted access to their own records even when their role does not include general read access to that resource. The most common case is Sales Agents viewing their own performance reports. The `self` scope qualifier is used: `reports.performance:read:self`.

#### Threshold-Based Permissions
Certain approval permissions are conditioned on a monetary threshold rather than being absolute grants. For example, a Team Manager may be permitted to approve orders up to 50,000 SAR, while a General Manager approves above that. Thresholds are configured in the Role settings and evaluated at approval time.

**Permission Key Format:** `orders:approve:threshold:{currency}:{amount}`
The threshold is stored as a configuration value attached to the role assignment, not hardcoded in the permission key.

#### Delegation
A user may not delegate their permissions to another user. Permission expansion always flows through role reassignment by an authorized admin. There is no concept of temporary permission grants outside of the formal role assignment workflow.

---

### 8.7 Audit Logging of Permission Decisions

Every permission denial is logged alongside every permission grant. The audit log records:

| Field | Content |
|---|---|
| `timestamp` | ISO 8601 UTC timestamp |
| `user_id` | The requesting user |
| `action` | The permission key requested |
| `target_resource` | Resource type and ID |
| `outcome` | `granted` or `denied` |
| `denial_reason` | `no_permission`, `out_of_scope`, `business_rule` |
| `ip_address` | Requesting IP |
| `session_id` | Linked session |

Audit logs are append-only. No application process may delete or modify an audit log record.

---

## 9. Dynamic Configuration Architecture

One of OFS's foundational principles is that the business logic surfaced to users — statuses, categories, workflows, tags, and rules — must be fully configurable by administrators without code changes or developer involvement. This section defines the architecture that makes this possible.

---

### 9.1 The Configuration-as-Data Principle

Every entity that would traditionally be a hardcoded enum in a simpler system is instead stored as a configurable data record in OFS. When a Sales Agent sees a list of Lead Statuses, those statuses are not compiled into the application — they are records in the database that the Brand Admin created, ordered, and colored through a UI.

This principle applies to all of the following entity classes:

| Configurable Entity | Who Configures | Scope |
|---|---|---|
| Lead Statuses | Brand Admin | Brand |
| Order Statuses | Brand Admin | Brand |
| Shipping Statuses | Brand Admin | Brand |
| Payment Statuses | Brand Admin | Brand |
| Expense Categories | Brand Admin | Brand |
| Customer Tags | Brand Admin | Brand |
| Product Categories | Brand Admin | Brand |
| Custom Fields | Brand Admin | Per-module |
| Roles | Brand Admin | Brand |
| Approval Workflows | Brand Admin | Brand |
| Active Modules | Brand Admin | Brand (within plan limits) |
| Document Number Sequences | Brand Admin / Company Admin | Company |

---

### 9.2 Status Configuration

Statuses are the most frequently configured entity class. They govern how records move through their lifecycle and what actions are available at each stage.

#### Status Record Structure

Every configurable status has the following properties:

| Property | Type | Description |
|---|---|---|
| `name` | String (Arabic) | The display name shown to users |
| `name_en` | String (English) | Optional English name |
| `code` | String | System identifier — lowercase, no spaces, immutable after creation |
| `color` | Hex color | Badge/indicator color for this status |
| `category` | Enum | Semantic category: `initial`, `active`, `pending`, `completed`, `cancelled` |
| `is_default` | Boolean | Whether new records default to this status |
| `is_terminal` | Boolean | Whether records in this status can be further updated |
| `sort_order` | Integer | Display order in dropdowns and status selectors |
| `is_active` | Boolean | Whether this status is available for selection |

#### Terminal Status Behavior
A status marked `is_terminal: true` locks the record. Users cannot update a record in a terminal status without a specific `override_terminal` permission, which is restricted to senior roles. This prevents accidental modification of completed or cancelled records.

#### Default Status Behavior
Exactly one status per entity type may be marked `is_default: true`. When a new record is created without an explicit status, it receives the default status. The system enforces that exactly one default exists at all times — changing the default status atomically un-defaults the previous one.

#### Status Transitions (Optional Workflow Layer)
When the Workflow module is active, Administrators may configure explicit transition rules for status changes:

- **Allowed transitions:** Define which statuses a record may move to from a given status.
- **Condition gates:** A transition may require a condition to be met (e.g., a lead cannot move to "Order Created" unless an order record exists).
- **Role gates:** A transition may require a specific role permission (e.g., only a Team Manager may move a lead to "Escalated").
- **Notification triggers:** A status transition may trigger a notification to a specified user or role.

When no transition rules are configured, all status changes are permitted to any role with the `update_status` permission. Transition rules add restriction on top of the default open model, never expansion.

---

### 9.3 Custom Fields

Administrators may add custom fields to the following entities: Leads, Customers, Orders, Products, Expenses, and Employees. Custom fields extend the standard record structure without modifying the core data model.

#### Supported Custom Field Types

| Field Type | Description | Example |
|---|---|---|
| Text | Free-form single-line text | Internal reference code |
| Long Text | Multi-line free-form text | Additional notes |
| Number | Numeric value with optional decimal precision | Weight, dimensions |
| Date | Date picker | Warranty expiry date |
| Date + Time | Full timestamp | Scheduled callback time |
| Dropdown | Single value from a configurable list | Sales channel |
| Multi-Select | Multiple values from a configurable list | Applicable product tags |
| Checkbox | Boolean yes/no | VIP customer flag |
| File | Single file upload | Supporting document |

#### Custom Field Properties

| Property | Description |
|---|---|
| `label` | Arabic display label |
| `label_en` | Optional English label |
| `field_type` | One of the types listed above |
| `is_required` | Whether the field must be completed before saving |
| `is_visible_in_list` | Whether to show as a column in list views |
| `is_searchable` | Whether to include in global and module search |
| `default_value` | Pre-populated value for new records |
| `help_text` | Short instruction shown below the field |
| `sort_order` | Position in the form layout |
| `applicable_roles` | Which roles can see/edit this field |

Custom fields are always displayed in a designated section of the record form, visually separated from core system fields. They cannot override or replace core fields.

---

### 9.4 Approval Workflows

Workflows define the approval steps that certain record types must pass through before they reach a committed state. Workflows are optional — if no workflow is configured for a record type, records move directly to their next state without requiring approval.

#### Supported Workflow Triggers

| Trigger | Example |
|---|---|
| Import batch ready for commit | An import of 500 leads has been validated and is awaiting approval before being added to the lead pool |
| Order value exceeds threshold | An order above 100,000 SAR requires Finance Manager approval |
| Expense claim submitted | All expense claims above 5,000 SAR require General Manager approval |
| Purchase order created | All purchase orders require Finance Manager approval |
| Lead converted to order | Conversion requires Team Manager confirmation |

#### Workflow Step Structure

A workflow is a linear sequence of one or more approval steps:

```
Trigger Event
      │
      ▼
Step 1: Approver Role = Team Manager
      │ Approved ──→ Next Step
      │ Rejected ──→ Return to Submitter with comment
      │
      ▼
Step 2: Approver Role = Finance Manager (conditional: amount > 50,000)
      │ Approved ──→ Committed
      │ Rejected ──→ Return to Submitter with comment
```

Each step specifies:
- **Approver Role** — the role required to approve this step.
- **Approver Scope** — whether the approver must be in the same Branch, same Company, or Brand-level.
- **Condition** — optional condition that, if false, automatically passes this step (for conditional steps).
- **Deadline** — optional SLA; if the step is not actioned within the deadline, an escalation notification is sent.

---

### 9.5 Module Activation

Modules are independently activatable per Brand, within the constraints of the Brand's subscription plan. Module activation is binary: a module is either active (visible and functional) or inactive (completely hidden from all users in the Brand).

#### Module Dependency Rules

Some modules have dependencies that must be resolved before activation:

| Module | Requires |
|---|---|
| Sales | CRM (customer data) |
| Purchasing | Inventory (product catalog) |
| Accounting | Sales (invoices) and Purchasing (vendor bills) |
| Expenses | Accounting (expense account posting) |
| Reports | At least one operational module |

Attempting to deactivate a module that another active module depends on will display a clear warning listing the dependent modules. The admin must deactivate dependents first.

#### Module Deactivation Behavior

When a module is deactivated, its data is not deleted. All existing records are preserved in the database. Navigation items for the module disappear from all users in the Brand. If the module is reactivated, all data becomes accessible again. This allows seasonal or trial use of modules without data loss.

---

### 9.6 Document Number Sequences

Every document-generating entity in OFS (invoices, orders, purchase orders, journal entries, expense claims) uses a configurable numbering sequence. Sequences are configured per Company and per document type.

#### Sequence Configuration Properties

| Property | Description | Example |
|---|---|---|
| `prefix` | Text prepended to the number | `INV-`, `PO-2026-` |
| `next_number` | The next number to be assigned | `1001` |
| `padding` | Zero-padding width | `4` → `0001` |
| `reset_period` | When the counter resets: `never`, `annually`, `monthly` | `annually` |
| `fiscal_year_in_prefix` | Whether to include the fiscal year | `true` → `INV-2026-0001` |

Sequences are atomic — concurrent document creation never produces duplicate numbers. Once a number is assigned, it cannot be reused even if the document is deleted (the deleted document retains its number for audit traceability; the next document receives the subsequent number).

---

## 10. Module Definitions

This section defines the purpose, scope, key capabilities, and cross-module relationships of every module in the OFS platform. Module definitions establish what each module is responsible for and, critically, what it is not responsible for — preventing scope creep and feature confusion during implementation.

---

### 10.1 Module: Dashboard

**Purpose:**
The Dashboard is the platform's home screen and the primary situational awareness tool for every user type. It presents a real-time summary of the most operationally relevant information for the logged-in user's role and scope, without requiring navigation to any other module.

**Audience:** All user types (each role sees a role-appropriate dashboard configuration).

**Key Capabilities:**

| Capability | Description |
|---|---|
| Role-Aware KPI Cards | The set of KPI cards displayed adapts to the user's role. A Sales Agent sees their lead count and conversion rate; a Finance Manager sees cash position and overdue receivables. |
| Real-Time Data | All dashboard figures reflect the current state of the database, not a cached snapshot. Data displayed on the dashboard must never be more than 60 seconds stale. |
| Trend Indicators | Each KPI card shows a directional trend (vs. previous period) with color coding: green for improvement, red for regression. |
| Pending Actions | A dedicated section surfaces records requiring the user's action: approval queue items, overdue leads, unreconciled transactions. This section is always visible and never hidden behind a tab. |
| Quick Navigation | Each KPI card and pending action item is clickable and navigates directly to the relevant filtered list view in the appropriate module. |
| Period Selector | Users can switch the KPI period: today, this week, this month, this quarter, this year. The selection persists across sessions. |
| Branch/Company Selector | Users with multi-scope access can switch context between their assigned companies and branches directly from the dashboard header. |

**Performance Requirement:** Full dashboard render in under 1 second at P95 for a dataset of 100,000 leads and 50,000 orders.

**What Dashboard is NOT responsible for:**
- Deep analytics and multi-dimensional reports (that is the Reports module).
- Data entry of any kind.
- Configuration of any system entity.

---

### 10.2 Module: Import Center

**Purpose:**
The Import Center is the primary data ingestion gateway for the platform. It enforces a validate-before-commit discipline on all bulk data entry: no imported record touches the live dataset until it has been validated, previewed, and explicitly approved by an authorized user.

**Audience:** Brand Admin, General Manager, Team Manager (initiate); Brand Admin, General Manager (approve).

**Supported Data Sources:**
- Google Sheets (via authenticated OAuth connection)
- Microsoft Excel (.xlsx, .xls)
- CSV (.csv)

**Supported Import Types:**

| Import Type | Target Module | Key Validation Rules |
|---|---|---|
| Leads | Lead Management | Required fields present, phone format valid, currency code recognized, duplicate detection against existing leads |
| Orders | Sales | Customer resolvable or creatable, products exist, quantities are positive, order date is valid |
| Financial Transactions | Accounting | Account codes exist, debit/credit balanced, date within open period, currency valid |
| Products | Inventory | SKU unique, category exists, unit of measure valid |
| Expenses | Expenses | Category exists, amount positive, date valid, submitting employee exists |

**Import Workflow:**

```
1. UPLOAD
   User selects source (file upload or Google Sheets URL) and import type.
   System accepts the raw data and creates an Import Batch record.

2. COLUMN MAPPING
   System presents a column mapping interface. The user maps source columns
   to OFS field definitions. Previously saved mappings are suggested automatically.
   The mapping configuration is saveable and reusable.

3. VALIDATION
   System processes every row against the validation ruleset for the import type.
   Validation runs server-side. Results are returned with per-row status:
   - Valid: row passes all validation rules.
   - Warning: row passes mandatory rules but has non-critical anomalies (e.g., unrecognized city name).
   - Error: row fails one or more mandatory validation rules.
   - Duplicate: row matches an existing record above the configured similarity threshold.

4. PREVIEW
   User reviews the validation results in a paginated table with:
   - Row-level status indicators (color-coded).
   - Inline error/warning messages on failing cells.
   - Duplicate match detail (side-by-side comparison of the incoming row and the matched existing record).
   - Summary statistics: total rows, valid, warning, error, duplicate counts.
   User may:
   - Edit individual cells to correct errors inline.
   - Remove specific rows from the batch.
   - Mark duplicate rows as "import anyway" or "skip".
   - Download the error report as a CSV for offline correction and re-upload.

5. APPROVAL
   Once the user is satisfied with the preview state, they submit the batch for approval.
   If the user has the approve permission, they may self-approve. Otherwise, the batch
   enters the approval queue for an authorized approver.
   The approver reviews the summary and may:
   - Approve: proceed to commit.
   - Reject: return to the initiator with a comment.

6. COMMIT
   Approved rows are written to the live dataset atomically. A commit is all-or-nothing
   per batch — if any database write fails during commit, the entire batch is rolled back
   and the user is notified. Successful commit creates an Import Batch audit record
   linking every imported record to its source batch for full traceability.
```

**Duplicate Detection:**
The duplicate detection engine evaluates incoming records against existing records using a configurable combination of fields and similarity scoring. For leads, the default duplicate check uses phone number as the primary key (exact match) and customer name + address as secondary signals (fuzzy match). The similarity threshold and the fields used are configurable per import type.

**Import Batch Record:**
Every completed import creates a permanent Import Batch record containing:
- Source file name and upload timestamp.
- Column mapping used.
- Initiating user and approving user.
- Total rows, imported rows, skipped rows, rejected rows.
- A link to download the original source file.
- Links to every record created by the import.

**What Import Center is NOT responsible for:**
- Real-time API integrations (that is a future integration layer).
- Editing existing records in bulk (that is a bulk action within the respective module).
- Scheduling recurring automated imports.

---

### 10.3 Module: CRM

**Purpose:**
The CRM module manages the platform's customer and contact master data. It is the authoritative source of customer identity — every sales order, every lead, every communication, and every accounting receivable links back to a CRM customer record. The CRM does not manage the sales pipeline or lead workflow — those belong to Lead Management within the Sales module.

**Audience:** Sales Agent, Customer Care Agent, Team Manager, General Manager.

**Key Capabilities:**

| Capability | Description |
|---|---|
| Customer Records | Full customer profile: name, classification (individual/company), tax ID, address, country, city, contact details, assigned tags, credit limit, payment terms, currency. |
| Contact Management | Multiple contacts per customer (for B2B: contact name, title, direct phone, email). |
| Communication Log | Chronological record of all interactions: calls logged, emails sent, notes added — linked to the customer record regardless of which module generated the interaction. |
| Customer Tagging | Flexible tagging for segmentation (configurable tag list). |
| Customer Search | Full-text and field-specific search across all customer attributes. Phone number search must match partial values. |
| Duplicate Detection | Prevents creation of duplicate customer records based on phone, email, and tax ID matching. Offers merge workflow when duplicates are identified. |
| Customer Statements | A view of all financial transactions linked to the customer: invoices, payments, credits, outstanding balance. |
| Activity Timeline | Chronological history of all events on the customer record: order created, payment received, complaint opened, status changed. |

**Cross-Module Relationships:**
- Every Sales Order links to a CRM Customer.
- Every Accounting invoice/receipt links to a CRM Customer.
- Every Lead, upon conversion, either links to an existing CRM Customer or creates a new one.
- Customer Care interactions are logged to the CRM Communication Log.

**What CRM is NOT responsible for:**
- Lead lifecycle management (that is the Lead Management component of Sales).
- Order creation or management.
- Financial transactions directly.

---

### 10.4 Module: Sales

**Purpose:**
The Sales module manages the complete lifecycle from lead to fulfilled order. It encompasses lead management, order creation, pricing, discounting, order status tracking, and delivery confirmation. Sales is the operational heart of the platform for revenue-generating businesses.

**Audience:** Sales Agent, Customer Care Agent, Team Manager, General Manager.

**Sub-Components:**

#### 10.4.1 Lead Management

**Capabilities:**

| Capability | Description |
|---|---|
| Lead Queue | Paginated, filterable, sortable list of leads assigned to the current user (or all leads for managers). |
| Lead Detail | Full lead record: all imported fields, status, assignment, activity timeline, linked orders, notes. |
| Lead Status Management | Update lead status through configured status transitions. |
| Lead Notes | Time-stamped, attributed notes. Notes are permanent — they cannot be deleted, only superseded by new notes. |
| Lead Assignment | Manual assignment to an agent; bulk reassignment by managers. |
| Automatic Lead Distribution | Round-robin, equal-distribution, or weighted distribution across active agents (configurable). |
| Duplicate Management | View and action on flagged duplicates from import. Decision options: merge, keep both, archive one. |
| Lead Conversion | Convert a qualified lead into a Sales Order. The conversion creates a new Order pre-populated with the lead's data and links the Order back to the Lead. The lead status is updated to reflect the conversion. |
| Lead Aging | Visual indicators (color-coded) on leads that have not been contacted within configured SLA periods. |
| Bulk Actions | Bulk reassign, bulk status update, bulk export, bulk archive. |

#### 10.4.2 Order Management

**Capabilities:**

| Capability | Description |
|---|---|
| Order Creation | Manual order creation from CRM customer or converted from a lead. |
| Order Lines | One or more product lines with product, quantity, unit price, discount, and line total. |
| Pricing | Unit price sourced from product catalog; discounts applied at line or order level; totals calculated with tax. |
| Order Status | Configurable order statuses (pending, confirmed, dispatched, delivered, cancelled, returned). |
| Payment Tracking | Record payments against orders: amount, method, date, reference. Partial payments supported. |
| Invoice Generation | Generate a formatted invoice PDF from a confirmed order. |
| Delivery Tracking | Update shipping/delivery status; record courier reference and expected delivery date. |
| Order History | Full audit trail of all changes to an order: who changed what, when. |
| Return Management | Create return records linked to original orders; trigger inventory and accounting reversals. |

**Cross-Module Relationships:**
- Confirmed orders trigger Inventory stock movements (if Inventory module is active).
- Confirmed orders trigger Accounting invoice entries (if Accounting module is active).
- Payments recorded on orders trigger Accounting payment entries.
- Returns trigger reversal movements in Inventory and Accounting.

---

### 10.5 Module: Purchasing

**Purpose:**
The Purchasing module manages the acquisition of goods and services from external suppliers. It provides a structured workflow from purchase request to goods receipt to vendor payment, with full traceability and accounting integration.

**Audience:** Team Manager, General Manager, Finance Manager, Accountant.

**Key Capabilities:**

| Capability | Description |
|---|---|
| Supplier Management | Supplier master data: name, contact, payment terms, bank details, tax registration, currency. |
| Purchase Orders | Create, send, confirm, and receive purchase orders. Multi-line, multi-currency. |
| Goods Receipt | Record partial or full receipt of purchased goods. Links to inventory movements. |
| Vendor Bills | Auto-generate vendor bills from received goods receipts; or create manual vendor bills. |
| Payment Recording | Record payments against vendor bills with method, date, bank reference. |
| Purchase Approvals | Configurable approval workflow for purchase orders above defined thresholds. |
| Purchase History | Full history of all purchases per supplier: orders, receipts, bills, payments. |
| Reorder Alerts | Notifications when product stock levels fall below reorder threshold. |

**Cross-Module Relationships:**
- Purchase receipts trigger Inventory stock increase movements.
- Vendor bills trigger Accounting accounts-payable entries.
- Vendor payments trigger Accounting payment entries.

---

### 10.6 Module: Inventory

**Purpose:**
The Inventory module tracks the quantity, location, and valuation of all products across all warehouse locations (Branches). It is the authoritative record of what stock is where, how it got there, and what it is worth.

**Audience:** Team Manager, General Manager, Accountant, Finance Manager.

**Key Capabilities:**

| Capability | Description |
|---|---|
| Product Catalog | Product master data: name, SKU, category, unit of measure, cost price, sale price, images, variant attributes. |
| Product Variants | Products with multiple attributes (size, color, etc.) managed as variants under a single product template. |
| Stock Locations | Multiple named warehouse/storage locations per Branch. |
| Stock Movements | Every increase and decrease in stock is recorded as an explicit stock movement with source, destination, reference document, date, quantity, and unit cost. |
| Stock Valuation | Supports three costing methods: FIFO, Weighted Average Cost (AVCO), and Standard Cost. Valuation method is set per product. |
| Stock Adjustments | Manual adjustment entries for physical inventory counts, with mandatory reason code and adjustment reference. |
| Inventory Reports | Stock on hand, stock movement history, inventory valuation by product/location/period. |
| Low Stock Alerts | Configurable minimum stock levels per product per location; notification when breached. |
| Transfers | Internal stock transfers between locations/branches, fully traced. |

**Cross-Module Relationships:**
- Every Sales Order delivery triggers an outbound stock movement.
- Every Purchase Receipt triggers an inbound stock movement.
- Every Return triggers a reversal stock movement.
- Stock valuation changes trigger Accounting inventory asset entries (for perpetual inventory method).

---

### 10.7 Module: Expenses

**Purpose:**
The Expenses module manages the capture, categorization, approval, and accounting posting of employee and business expenses. It provides a structured workflow from expense submission to reimbursement, with full accounting integration.

**Audience:** All user types (submit); Team Manager, General Manager, Finance Manager (approve); Accountant (post).

**Key Capabilities:**

| Capability | Description |
|---|---|
| Expense Submission | Any user may submit an expense claim: category, amount, currency, date, description, receipt image upload. |
| Expense Categories | Configurable category list (travel, meals, office supplies, utilities, etc.) with optional accounting account mapping. |
| Receipt Attachment | Photo or file upload of supporting receipt. Mandatory for claims above a configurable threshold. |
| Approval Workflow | Configurable multi-level approval workflow. Claims below threshold may be auto-approved. |
| Bulk Expense Reports | Group multiple expense claims into a single expense report for batch approval and payment. |
| Reimbursement Tracking | Record reimbursement payments against approved claims; track outstanding reimbursements per employee. |
| Expense Analytics | Expenses by category, by employee, by branch, by period — with budget comparison if budgets are configured. |

**Cross-Module Relationships:**
- Approved and posted expenses trigger Accounting journal entries to the configured expense accounts.
- Reimbursements trigger Accounting payment entries.

---

### 10.8 Module: Accounting

**Purpose:**
The Accounting module is the financial engine of the platform. It implements double-entry bookkeeping principles and serves as the authoritative record of all financial transactions. Every monetary event in any other module ultimately produces a journal entry that passes through the Accounting module.

**Audience:** Accountant, Finance Manager.

**Key Capabilities:**

| Capability | Description |
|---|---|
| Chart of Accounts | Configurable hierarchical chart of accounts with account type (asset, liability, equity, revenue, expense), account code, and Arabic name. Template COAs available for quick setup. |
| Journal Entries | Manual and automated double-entry journal entries. Every entry must balance (total debits = total credits). Entries are created in draft state and require explicit posting. |
| Auto-Generated Entries | Sales invoices, purchase bills, payments received, payments made, expense postings, and inventory value changes automatically generate the corresponding journal entries. |
| Accounts Receivable | Subledger of outstanding customer invoices and payment records. Aging analysis by customer. |
| Accounts Payable | Subledger of outstanding vendor bills and payment records. Aging analysis by supplier. |
| Bank Reconciliation | Match bank statement lines against accounting payment records. Flag and investigate discrepancies. |
| Multi-Currency | All transactions support multi-currency entry. Exchange rates are recorded at transaction date. Realized and unrealized gains/losses are calculated on period-end processing. |
| Period Management | Define fiscal periods. Period close locks all journal entries within the period from modification. Year-end close generates opening balance entries for the new fiscal year. |
| Financial Statements | Generate: Trial Balance, Profit & Loss, Balance Sheet, Cash Flow Statement — for any date range, any company. |
| Tax Management | Configure tax rates (VAT, withholding) and apply to transactions. Generate tax summary reports for filing. |

**The Accounting Integrity Rule:**
The Accounting module receives data from other modules but never blindly accepts it. Every auto-generated journal entry is visible to the Accountant in a review queue before it is posted to the ledger. The Accountant may edit the entry before posting. Once posted, entries may not be edited — they may only be reversed by a new correcting entry, which itself must be posted. This produces an immutable audit trail of every financial event.

**Cross-Module Relationships:**
- All other financial modules (Sales, Purchasing, Expenses, Inventory) feed the Accounting module.
- The Accounting module is a sink, not a source — it does not push data back to operational modules.

---

### 10.9 Module: HR

**Purpose:**
The HR module manages employee records, organizational structure, and role assignments within the platform. In this initial version, HR is a supporting module — it provides the employee master data that other modules reference (expense submitters, lead assignees, sales agents) and lays the structural foundation for future payroll and attendance capabilities.

**Audience:** Brand Admin (configure); General Manager, Team Manager (read and manage their team).

**Key Capabilities:**

| Capability | Description |
|---|---|
| Employee Records | Core employee data: full name (Arabic/English), national ID, job title, department, branch assignment, contact information, employment start date, employment status. |
| Organizational Structure | Define departments and reporting lines within a Company. |
| User Linking | Link an employee record to a platform user account. An employee may or may not have a user account (warehouse staff may be employees without system access). |
| Employment Status | Active, on leave, suspended, terminated. Status changes are logged with date and reason. |
| Document Attachments | Store HR documents against the employee record: employment contract, ID copies, certificates. Document access is restricted to HR-authorized roles. |
| Team Assignment | Assign employees to teams within branches. Team membership drives lead assignment availability. |

**What HR is NOT responsible for (in this version):**
- Payroll calculation or payroll runs.
- Leave management and approval workflows.
- Attendance tracking.
- Performance reviews.
These capabilities are defined as future module expansions.

---

### 10.10 Module: Reports

**Purpose:**
The Reports module provides cross-module business intelligence: structured reports that combine data from multiple operational modules to answer business questions that no single module can answer alone. Reports are the primary analytical tool for General Managers and Finance Managers.

**Audience:** General Manager, Finance Manager, Brand Admin, Team Manager (limited scope).

**Key Capabilities:**

| Capability | Description |
|---|---|
| Pre-Built Report Library | A curated library of standard business reports covering Sales, Finance, Operations, and HR domains. Reports are designed to answer the most common business questions without custom configuration. |
| Report Parameters | Every report accepts parameters (date range, company, branch, product, employee, status) that filter the underlying data. Parameters are presented as form fields above the report — no SQL required. |
| Saved Report Configurations | Users may save their preferred parameter configurations for reports they run regularly. Saved configurations are personal by default but may be shared with the team. |
| Scheduled Reports | Reports may be scheduled to run automatically at defined intervals (daily, weekly, monthly) and delivered to specified email addresses. |
| Export | Every report is exportable to PDF (formatted for print/presentation) and Excel (raw data for further analysis). |
| Dashboard Widgets | Select report outputs may be pinned to the Dashboard as widgets, visible to all users with the appropriate scope. |

**Standard Report Categories:**

| Category | Example Reports |
|---|---|
| Sales Performance | Revenue by agent, lead conversion rate, order value distribution, top customers, sales by product |
| Financial | P&L statement, balance sheet, cash flow, accounts receivable aging, accounts payable aging, tax summary |
| Inventory | Stock on hand, stock movement history, inventory valuation, slow-moving inventory, reorder report |
| Purchasing | Purchase volume by supplier, purchase order cycle time, vendor performance |
| Operational | Lead age analysis, import batch history, status distribution by module, workflow SLA compliance |
| HR | Headcount by branch, employee activity, team performance summary |

**Performance Requirement:** All standard reports must render in under 2 seconds at P95 for a dataset representing 12 months of operational data at a mid-size business (100,000 orders, 500,000 leads, 1,000,000 accounting entries).

---

### 10.11 Module: Settings

**Purpose:**
The Settings module is the administrative control center for the platform. It is not an operational module — users do not spend their workday in Settings. It exists to configure the platform's behavior, structure, and rules.

**Audience:** Brand Admin (primary); General Manager (limited configuration rights).

**Settings Sections:**

| Section | Contents |
|---|---|
| Organization | Company and Branch creation, legal details, fiscal year configuration, document number sequences |
| Users & Access | User management, role management, scope assignment, permission configuration |
| Modules | Module activation/deactivation, module-specific configuration |
| Dynamic Entities | Lead statuses, order statuses, shipping statuses, payment statuses, expense categories, customer tags |
| Workflows | Approval workflow configuration, transition rules, notification rules |
| Custom Fields | Custom field management per entity type |
| Import Configuration | Column mapping templates, duplicate detection settings, import validation rules |
| Notifications | Notification triggers, recipients, and delivery channels |
| Integrations | Google Sheets connection, future API integrations |
| Audit Log | Read-only view of all system events within scope |
| Subscription | Current plan details, module limits, usage metrics |

**Settings Access Principle:**
Settings are not a single access level. Different sections of Settings are accessible to different roles. The Brand Admin has access to all sections. The General Manager has access to organization configuration and dynamic entities but not user management or module activation. This is enforced through the standard permission architecture described in Section 8.

---

*End of Section 10 — Module Definitions*

---

**Document Status:** Sections 1–10 complete. Sections 11–15 appended below.

---

## 11. Core Workflows

Core workflows are the end-to-end sequences of events that span multiple modules and represent the primary value delivery paths of the platform. Every architectural decision in OFS must be evaluated against its impact on these workflows. A feature that improves an isolated module but degrades a core workflow is net-negative.

---

### 11.1 Primary Workflow: Lead to Revenue

This is the central operating sequence of the platform. It begins the moment an external data source delivers a lead and ends when the resulting revenue is posted in the general ledger.

```
EXTERNAL DATA SOURCE
(Google Sheets / Excel / CSV)
        │
        ▼
┌───────────────────┐
│  1. IMPORT        │  User uploads file in Import Center.
│                   │  System creates an Import Batch record.
│                   │  Raw data is stored as-is, unmodified.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  2. COLUMN MAP    │  User maps source columns to OFS lead fields.
│                   │  Saved mapping templates are suggested.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  3. VALIDATE      │  System applies validation rules row by row:
│                   │  — Required fields present
│                   │  — Phone format valid
│                   │  — Currency code recognized
│                   │  — Date parseable
│                   │  — Product/country values recognized
│                   │  Each row is tagged: Valid / Warning / Error
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  4. DUPLICATE     │  System compares each valid row against:
│     DETECTION     │  — Existing leads in the database
│                   │  — Other rows in the same batch
│                   │  Using: phone (exact), name+address (fuzzy)
│                   │  Each match is scored and flagged for review.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  5. PREVIEW       │  User reviews the full validation result table.
│                   │  Inline cell editing to fix errors.
│                   │  Duplicate decision: merge / keep / skip.
│                   │  Row-level include/exclude toggle.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  6. APPROVAL      │  Batch submitted for approval.
│                   │  Approver reviews summary statistics.
│                   │  Decision: Approve → Commit / Reject → Return.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  7. COMMIT        │  Approved rows written atomically to Lead pool.
│                   │  Each lead assigned: status = default initial status.
│                   │  Import Batch ID stamped on every created lead.
│                   │  Rollback on any write failure.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  8. ASSIGNMENT    │  Leads distributed to agents:
│                   │  — Manual: manager assigns individually or in bulk
│                   │  — Automatic: system applies distribution rule
│                   │    (round-robin / equal / weighted)
│                   │  Assigned agent receives notification.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  9. FOLLOW-UP     │  Sales Agent works the lead:
│                   │  — Reviews lead data and customer history
│                   │  — Contacts customer
│                   │  — Logs outcome as note
│                   │  — Updates lead status
│                   │  — Schedules next action (if applicable)
│                   │  Repeat until qualified or disqualified.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  10. ORDER        │  Qualified lead converted to Sales Order:
│      CREATION     │  — Order pre-populated with lead data
│                   │  — Agent confirms product, quantity, price
│                   │  — Order saved in Pending status
│                   │  — Lead status updated to "Order Created"
│                   │  — Lead ↔ Order link recorded
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  11. ORDER        │  Order moves through its configured lifecycle:
│      FULFILMENT   │  Confirmed → Dispatched → Delivered
│                   │  Each status change timestamped and logged.
│                   │  Inventory stock movement created on dispatch.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  12. PAYMENT      │  Payment recorded against the order:
│      RECORDING    │  — Amount, method, date, reference
│                   │  — Partial payments tracked cumulatively
│                   │  — Payment status: unpaid / partial / paid
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  13. ACCOUNTING   │  On order confirmation (or configurable trigger):
│      POSTING      │  — Sales invoice journal entry auto-generated
│                   │  — Debit: Accounts Receivable
│                   │  — Credit: Revenue account
│                   │  On payment recording:
│                   │  — Payment entry auto-generated
│                   │  — Debit: Bank / Cash account
│                   │  — Credit: Accounts Receivable
│                   │  Accountant reviews entries in review queue.
│                   │  Accountant posts. Entry becomes immutable.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  14. REPORTING    │  Revenue visible in:
│                   │  — Dashboard KPI cards (real-time)
│                   │  — Sales performance reports
│                   │  — Accounting P&L statement
│                   │  — Agent productivity reports
│                   │  Full drill-down from report → order → lead.
└───────────────────┘
```

---

### 11.2 Workflow: Purchase to Payment

This workflow governs the acquisition of goods or services from external suppliers.

```
NEED IDENTIFIED
(low stock alert / manual request)
        │
        ▼
  Purchase Order Created
  (product, quantity, supplier, agreed price, expected delivery date)
        │
        ▼
  Approval Workflow (if threshold exceeded)
  → Approved: continue
  → Rejected: returned to requester with comment
        │
        ▼
  Purchase Order Confirmed and Sent to Supplier
        │
        ▼
  Goods Receipt Recorded
  (full or partial; triggers inventory stock increase)
        │
        ▼
  Vendor Bill Generated
  (from goods receipt; or entered manually for service purchases)
        │
        ▼
  Accounting Entry: Accounts Payable
  (Debit: Inventory / Expense account | Credit: Accounts Payable)
        │
        ▼
  Payment Recorded Against Vendor Bill
        │
        ▼
  Accounting Entry: Payment
  (Debit: Accounts Payable | Credit: Bank / Cash account)
        │
        ▼
  Vendor Balance Cleared
```

---

### 11.3 Workflow: Expense Submission to Reimbursement

```
Employee Submits Expense Claim
(category, amount, date, description, receipt upload)
        │
        ▼
  Validation: receipt mandatory if amount > threshold
        │
        ▼
  Approval Workflow
  Step 1: Team Manager (if amount ≤ manager threshold)
  Step 2: Finance Manager (if amount > manager threshold)
  → Approved: continue
  → Rejected: returned with comment
        │
        ▼
  Accountant Reviews and Posts Journal Entry
  (Debit: Expense account | Credit: Employee Payable account)
        │
        ▼
  Reimbursement Payment Recorded
  (Debit: Employee Payable | Credit: Bank / Cash account)
        │
        ▼
  Employee notified. Expense claim closed.
```

---

### 11.4 Workflow: Accounting Period Close

The period close workflow is a structured sequence that ensures a period's financial data is complete, reviewed, and locked before the next period begins.

```
Finance Manager initiates Period Close
        │
        ▼
  System Pre-Close Checklist (automated):
  — All sales invoices for the period posted?  ✓ / ✗
  — All vendor bills for the period posted?    ✓ / ✗
  — All expense claims posted?                 ✓ / ✗
  — All bank reconciliations complete?         ✓ / ✗
  — Any unposted journal entry drafts?         ✓ / ✗
        │
        ▼
  Unresolved items displayed as blockers.
  Finance Manager resolves or explicitly overrides each.
        │
        ▼
  Accountant performs final adjustments:
  — Accrual entries
  — Depreciation entries
  — Currency revaluation entries
        │
        ▼
  Finance Manager reviews Trial Balance.
        │
        ▼
  Finance Manager confirms Period Close.
        │
        ▼
  Period status set to CLOSED.
  All journal entries within the period locked from modification.
  Reversal entries can still be created; they post to the next open period.
        │
        ▼
  Financial statements for the closed period are finalized and exportable.
```

---

### 11.5 Workflow: User Onboarding (New Brand)

This workflow covers the sequence from Brand activation by the Platform Owner to first operational transaction.

```
Platform Owner activates Brand
        │
        ▼
  Brand Admin receives activation email
  Sets password and logs in
        │
        ▼
  Onboarding Wizard:
  Step 1: Brand profile (name, logo, primary contact)
  Step 2: Create first Company (legal name, tax ID, base currency, fiscal year)
  Step 3: Create first Branch (name, address, linked warehouse)
  Step 4: Select Chart of Accounts template (regional template pre-populated)
  Step 5: Activate modules (select from subscription plan entitlements)
  Step 6: Invite first user(s) (email, role, branch assignment)
        │
        ▼
  Invited users receive emails, set passwords, log in
        │
        ▼
  Brand is operational.
  First import or manual transaction may proceed.
```

---

## 12. Import Center Architecture

The Import Center is one of the most operationally critical components of OFS. Its architecture must be robust, fault-tolerant, and transparent. A failed import must never silently corrupt data — and a successful import must be fully traceable back to its source.

---

### 12.1 Architectural Layers

The Import Center is composed of six discrete layers. Each layer has a single responsibility and a clean handoff point to the next.

```
┌────────────────────────────────────────┐
│  Layer 1: INGESTION                    │
│  Accept raw file or Google Sheets URL  │
│  Store raw source data unchanged       │
│  Create Import Batch record            │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│  Layer 2: COLUMN MAPPING               │
│  Present source columns to user        │
│  Map to OFS field definitions          │
│  Save mapping template for reuse       │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│  Layer 3: VALIDATION ENGINE            │
│  Apply per-field validation rules      │
│  Apply cross-field business rules      │
│  Tag each row: Valid / Warning / Error  │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│  Layer 4: DUPLICATE DETECTION ENGINE   │
│  Score each row against existing data  │
│  Score rows against each other         │
│  Flag matches above threshold          │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│  Layer 5: PREVIEW & DECISION LAYER     │
│  Present results to user               │
│  Allow inline correction               │
│  Allow row-level include/exclude       │
│  Allow duplicate decisions             │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│  Layer 6: APPROVAL & COMMIT ENGINE     │
│  Route batch through approval workflow │
│  On approval: atomic write to database │
│  On failure: full rollback             │
│  Stamp every created record with       │
│  Import Batch ID                       │
└────────────────────────────────────────┘
```

---

### 12.2 Import Batch Lifecycle States

Every Import Batch exists in exactly one state at any time.

| State | Description |
|---|---|
| `draft` | File uploaded; awaiting column mapping completion |
| `mapping_complete` | Column mapping saved; awaiting validation run |
| `validating` | Validation engine processing rows (background job) |
| `validated` | Validation complete; awaiting user preview review |
| `pending_approval` | User submitted batch; awaiting approver decision |
| `approved` | Approver accepted; awaiting commit execution |
| `committing` | Atomic write in progress |
| `committed` | All rows written successfully; batch closed |
| `partially_committed` | Some rows written, some skipped (user-excluded rows) |
| `rejected` | Approver rejected; returned to initiator |
| `failed` | Commit attempted but database write failed; fully rolled back |
| `cancelled` | User cancelled the batch before approval |

State transitions are one-directional except for `rejected`, which returns the batch to `validated` state so the user may correct and resubmit.

---

### 12.3 Validation Engine Rules

Validation rules are defined per import type and applied to every row independently. Rules are organized into three tiers:

**Tier 1 — Hard Errors (row excluded from commit if triggered):**

| Rule | Applied To |
|---|---|
| Required field is empty | All import types |
| Phone number contains non-numeric characters (after stripping spaces/dashes) | Leads |
| Currency code not in ISO 4217 recognized list | Leads, Orders, Transactions |
| Date field is not a parseable date | All import types |
| Numeric field contains non-numeric value | Leads, Orders, Products |
| Amount is negative where it must be positive | Orders, Expenses, Transactions |
| Product SKU does not exist in catalog | Orders |
| Account code does not exist in chart of accounts | Financial Transactions |
| Debit/credit amounts do not balance on a journal entry row | Financial Transactions |

**Tier 2 — Warnings (row included but flagged for user review):**

| Rule | Applied To |
|---|---|
| Country name not in recognized country list (fuzzy match attempted) | Leads |
| City not recognized for the given country | Leads |
| Amount is unusually large (above configured alert threshold) | All financial import types |
| Product SKU exists but quantity is above historical average by 3× | Orders |
| Customer name matches an existing customer (but not an exact duplicate) | Leads, Orders |

**Tier 3 — Informational (logged but not surfaced to user):**

| Rule | Applied To |
|---|---|
| Field value was auto-corrected (e.g., currency code lowercased) | All |
| Date format normalized (e.g., DD/MM/YYYY → ISO 8601) | All |

---

### 12.4 Duplicate Detection Engine

Duplicate detection is a three-phase process: exact matching, fuzzy matching, and intra-batch matching.

**Phase 1 — Exact Match (against existing database records):**
- Phone number: normalized (strip spaces, dashes, leading zeros, country code), then exact string match.
- External Order ID: exact match against existing lead external order IDs.

Any row that produces an exact match is flagged as `duplicate_exact`. The user must make an explicit decision for each such row.

**Phase 2 — Fuzzy Match (against existing database records):**
A composite similarity score is computed using:

| Signal | Weight | Method |
|---|---|---|
| Normalized phone number | 50% | Exact match = 1.0; last 7 digits match = 0.7; no match = 0.0 |
| Customer name | 30% | Levenshtein distance normalized to [0,1] |
| City | 20% | Exact match = 1.0; no match = 0.0 |

A combined score ≥ 0.75 is flagged as `duplicate_likely`. A score between 0.50 and 0.74 is flagged as `duplicate_possible`. The threshold values are configurable per Brand.

**Phase 3 — Intra-Batch Match:**
Rows within the same import batch are compared against each other using the same exact and fuzzy logic. This catches situations where a spreadsheet contains duplicate rows before they ever touch the database.

**Duplicate Decision Options (per flagged row):**

| Decision | Effect |
|---|---|
| Skip this row | Row excluded from commit; existing record unchanged |
| Import anyway | Row imported as a new record; existing record unchanged |
| Merge into existing | Data from the incoming row updates specified fields on the existing record; no new record created |

All duplicate decisions are recorded on the Import Batch and included in the audit trail.

---

### 12.5 Commit Atomicity and Rollback

The commit operation is designed for correctness above all else.

**Atomicity:** All rows in a batch are written within a single database transaction. Either every approved row succeeds, or none are written. There is no partial commit of a batch — if 499 of 500 rows succeed and 1 fails, all 499 are rolled back and the batch state is set to `failed`.

**Exception — User-Excluded Rows:** Rows the user explicitly excluded during preview are not attempted. The committed batch is recorded as `partially_committed` when excluded rows exist, with counts of committed vs. excluded rows.

**On Failure:** The batch state is set to `failed`. The error that caused the failure is recorded on the batch record. The user is notified with a clear message identifying the failing row and the error. The user may correct the source data and re-initiate the import.

**Post-Commit Integrity:** After a successful commit, the system performs an immediate count verification: the number of records created in the database must equal the number of rows approved for commit. If there is a discrepancy, an alert is generated for platform administrators and the batch is flagged for investigation. This post-commit check does not block the user — it runs asynchronously.

---

### 12.6 Column Mapping Templates

Column mapping templates allow users to save their field mapping configuration and reuse it for future imports of the same type from the same source.

**Template Properties:**

| Property | Description |
|---|---|
| `name` | User-defined name (e.g., "Shopify Orders Export", "Google Ads Leads Sheet") |
| `import_type` | The import type this template applies to (Leads, Orders, etc.) |
| `mappings` | Array of source column name → OFS field key pairs |
| `default_values` | Static default values to apply to unmapped fields |
| `created_by` | The user who saved the template |
| `is_shared` | Whether the template is available to all users in the Branch |

When a user uploads a file and its column headers match a saved template exactly, the template is automatically applied and the user proceeds directly to the validation step, bypassing manual mapping.

---

### 12.7 Google Sheets Integration

Google Sheets is supported as a live data source, not just a file export. The integration requires a one-time OAuth authentication per Brand to authorize OFS read access to the Brand's Google Workspace.

**Connection Flow:**
1. Brand Admin initiates Google Sheets connection in Settings → Integrations.
2. OAuth consent screen is presented. Admin grants read-only access.
3. Access token is stored securely against the Brand record.
4. Any user initiating an import may paste a Google Sheets URL as the source.
5. OFS fetches the sheet data at import time using the stored token.
6. If the token is expired or revoked, the user is prompted to reconnect.

**Sheet Selection:** When a Google Sheets URL is provided, OFS presents a sheet selector (for workbooks with multiple sheets) and a row range selector (to specify header row and data start row).

**Data Freshness:** OFS fetches the sheet data once at the moment the import is initiated. Subsequent changes to the source sheet after import initiation do not affect the batch in progress.

---

## 13. Lead Management Architecture

Lead Management is the highest-frequency operational workflow in OFS for most customer types. Its architecture must prioritize speed, clarity, and fault tolerance. A Sales Agent who processes 80 leads per day cannot tolerate a slow lead list or a form that loses data.

---

### 13.1 Lead Data Model

A lead record contains two categories of fields: **Core Fields** (always present, defined by the system) and **Extended Fields** (configurable custom fields defined by the Brand Admin).

**Core Fields:**

| Field | Description | Source |
|---|---|---|
| `id` | System-generated unique identifier | System |
| `external_order_id` | Order ID from the source system | Import |
| `order_date` | Date of the original order | Import |
| `customer_name` | Full customer name | Import |
| `country` | Customer country | Import |
| `city` | Customer city | Import |
| `address` | Detailed shipping/billing address | Import |
| `phone` | Primary contact phone number | Import |
| `phone_normalized` | Phone in E.164 format, computed at import | System |
| `product` | Product name or description as given in source | Import |
| `product_id` | Resolved product reference (if matched to catalog) | System |
| `quantity` | Order quantity | Import |
| `paid_amount` | Amount paid by the customer | Import |
| `currency` | ISO 4217 currency code | Import |
| `payment_method` | Payment method description | Import |
| `receipt_reference` | Payment receipt identifier | Import |
| `notes` | Free-text notes from the source | Import |
| `status` | Current lead status (from configured status list) | System |
| `assigned_to` | User ID of the assigned agent | System |
| `assigned_at` | Timestamp of last assignment | System |
| `import_batch_id` | Reference to the Import Batch that created this lead | System |
| `duplicate_score` | Highest similarity score found during duplicate detection | System |
| `duplicate_of_id` | Reference to the lead this was identified as a duplicate of | System |
| `converted_order_id` | Reference to the Sales Order created from this lead | System |
| `converted_at` | Timestamp of conversion to order | System |
| `last_activity_at` | Timestamp of the most recent action on this lead | System |
| `branch_id` | The Branch this lead belongs to | System |
| `company_id` | The Company this lead belongs to | System |
| `created_at` | Record creation timestamp | System |
| `updated_at` | Last modification timestamp | System |

---

### 13.2 Lead Lifecycle State Machine

A lead passes through a defined sequence of states. The exact status labels are configurable, but the semantic categories they belong to are fixed. Every status must be assigned to one of the following semantic categories:

| Semantic Category | Meaning | Example Statuses |
|---|---|---|
| `initial` | Lead has been imported but not yet worked | "جديد" (New), "في الانتظار" (Waiting) |
| `active` | Lead is being actively worked by an agent | "قيد المتابعة" (In Follow-up), "تم التواصل" (Contacted) |
| `pending` | Lead requires an action before it can proceed | "في انتظار العميل" (Awaiting Customer), "بحاجة مراجعة" (Needs Review) |
| `converted` | Lead has been converted to a Sales Order | "تم إنشاء الطلب" (Order Created) |
| `completed` | Lead lifecycle is fully complete | "مكتمل" (Completed) |
| `cancelled` | Lead has been disqualified or closed without conversion | "ملغى" (Cancelled), "غير مهتم" (Not Interested) |

The `converted`, `completed`, and `cancelled` categories map to `is_terminal: true` statuses by default. A lead in a terminal status cannot have its status changed without an explicit override permission.

**State Transition Diagram (Semantic Categories):**

```
         initial
            │
     ┌──────▼──────┐
     │   active    │◄─────────────────────┐
     └──────┬──────┘                      │
            │                             │
     ┌──────▼──────┐                      │
     │   pending   │──── re-engaged ──────┘
     └──────┬──────┘
            │
     ┌──────┴──────────────────────┐
     │                             │
 converted                    cancelled
     │
 completed
```

---

### 13.3 Lead Activity Timeline

Every lead maintains a chronological activity timeline. The timeline is append-only — no entry may be deleted or modified. The timeline is the authoritative history of everything that happened to a lead.

**Timeline Entry Types:**

| Entry Type | Triggered By | Content |
|---|---|---|
| `imported` | System (on batch commit) | Import batch reference, source file name |
| `assigned` | System or Manager | Previous assignee, new assignee, assigning user |
| `status_changed` | Agent or System | Previous status, new status, acting user |
| `note_added` | Any authorized user | Note text, author |
| `call_logged` | Agent | Call outcome, duration (optional), agent |
| `order_created` | System (on conversion) | Linked order ID |
| `duplicate_flagged` | System | Duplicate score, matched lead ID |
| `duplicate_resolved` | Authorized user | Decision taken (kept/merged/skipped) |
| `field_updated` | Any authorized user | Field name, previous value, new value |
| `viewed` | Not logged | (View events are not recorded — only state changes) |

The timeline is displayed on the lead detail screen in reverse chronological order (most recent at top), with Arabic timestamps formatted to the user's timezone.

---

### 13.4 Lead Aging Rules

Lead aging is the mechanism by which the system surfaces stalled leads — leads that have not been actioned within a configured time window. Aging rules are configured per Brand and apply to all leads in `initial` and `active` semantic status categories.

**Aging Tier Structure:**

| Tier | Condition | Visual Indicator | Default Threshold |
|---|---|---|---|
| Fresh | Last activity within threshold | No indicator | < 24 hours |
| Aging | Last activity approaching SLA | Yellow indicator | 24–48 hours |
| Overdue | Last activity exceeds SLA | Red indicator | > 48 hours |
| Critical | Last activity severely exceeds SLA | Red pulsing indicator | > 72 hours |

Aging thresholds are configurable per Brand. Overdue and Critical leads are surfaced prominently in:
- The Team Manager's lead queue (filterable by aging tier).
- The Dashboard's "Pending Actions" section for Team Managers.
- The General Manager's operational overview.

Aging indicators do not affect the lead record itself — they are a display-time computation based on `last_activity_at` and the current time. They never automatically change a lead's status.

---

### 13.5 Lead Conversion to Order

Lead conversion is the critical transition from the Sales module's lead management sub-component to its order management sub-component. Conversion is always an explicit user action — it is never triggered automatically.

**Conversion Pre-Conditions:**
- The lead must be in an `active` or `pending` semantic status category.
- The lead must not already have a linked `converted_order_id`.
- The converting user must have the `leads:convert` permission.

**Conversion Process:**

```
Agent clicks "Convert to Order" on lead detail screen
        │
        ▼
System presents Order Creation form
Pre-populated fields (editable):
— Customer name → resolved to CRM customer (or new customer created)
— Product → matched to product catalog (or free-text if no match)
— Quantity, paid amount, currency, payment method
— Shipping address from lead address fields
        │
        ▼
Agent reviews and confirms order details
        │
        ▼
Order record created in Sales module
Lead record updated:
— status → converted status
— converted_order_id → new order ID
— converted_at → current timestamp
Timeline entry added to lead: type = order_created
        │
        ▼
Agent lands on new Order record.
Lead remains accessible via the Order's "source lead" link.
```

**Post-Conversion Lead Access:** The lead record remains fully accessible after conversion. The converting order is linked on the lead record. The lead's status is terminal after conversion. The lead cannot be converted again (one lead → one order maximum, unless the Brand explicitly configures otherwise through a custom workflow).

---

### 13.6 Bulk Lead Operations

Bulk operations apply to a selection of leads from the list view. All bulk operations are recorded in the audit trail with the acting user, timestamp, number of records affected, and the selection criteria used.

| Bulk Operation | Required Permission | Description |
|---|---|---|
| Bulk Assign | `leads:assign` | Assign selected leads to a specified agent |
| Bulk Reassign | `leads:assign` | Move selected leads from current agent to a new agent |
| Bulk Status Update | `leads:update_status` | Move all selected leads to a specified status |
| Bulk Export | `leads:export` | Export selected leads to Excel or CSV |
| Bulk Archive | `leads:archive` | Move selected leads to archived state (hidden from active queues) |
| Bulk Delete | `leads:delete` | Soft-delete selected leads (restricted to managers) |

**Selection Scope:**
Users may select leads on the current page (up to the page size limit) or all leads matching the current filter set, regardless of how many pages they span. When "select all matching" is used, the selection is evaluated at bulk-action execution time, not at selection time, to capture any leads added in the interim.

---

## 14. Lead Distribution Rules

Lead distribution governs how incoming leads are assigned to sales agents after a batch is committed. The distribution system is designed to be fair, transparent, and auditable — both agents and managers must be able to verify that distribution is working as configured.

---

### 14.1 Distribution Modes

The platform supports three distribution modes. The active mode is configured per Branch by the Brand Admin or Team Manager.

---

#### 14.1.1 Manual Assignment

**Behavior:**
All newly committed leads enter an unassigned pool. They are not visible in any agent's queue until a manager explicitly assigns them. The unassigned pool is visible to Team Managers and General Managers.

**When to use:**
When assignments must be made based on lead characteristics — e.g., routing high-value leads to senior agents, routing by product type, or routing by customer geography.

**Workflow:**
```
Leads committed → Unassigned Pool
Team Manager reviews pool
Manager selects leads (individually or in bulk)
Manager selects target agent from dropdown
Leads moved to agent's queue
Agent notified
```

**Manager View:**
The unassigned pool displays all core lead fields alongside a recommended-agent suggestion (the agent with the fewest current active leads) to inform, but not enforce, the manager's decision.

---

#### 14.1.2 Round Robin Assignment

**Behavior:**
Each new lead is assigned to the next agent in a rotating sequence. The sequence cycles through all eligible agents in the Branch in a defined order. The rotation position is persisted — a power cycle or server restart does not reset the position.

**Eligibility Rules:**
An agent is eligible for round-robin assignment only when:
- Their user account is Active (not suspended or on leave).
- They are assigned to the relevant Branch.
- They have not exceeded their configured lead capacity limit (if set).
- They are in the "active agents" pool — managers may temporarily exclude agents from the rotation (e.g., an agent on vacation).

**Rotation Persistence:**
The current rotation position is stored against the Branch's distribution configuration record, not in application memory. This ensures continuity across restarts and guarantees that the round-robin sequence is auditable.

**Example Rotation:**
```
Agents: Ahmed, Fatima, Khalid, Nour
Position: 2 (Khalid is next)

Lead 1 committed → assigned to Khalid → position advances to 3
Lead 2 committed → assigned to Nour → position advances to 0
Lead 3 committed → assigned to Ahmed → position advances to 1
...
```

**Handling Agent Removal:**
If an agent is removed from the eligible pool mid-rotation, the position skips them on the next assignment. Historical assignments to the removed agent are unaffected.

---

#### 14.1.3 Equal Distribution (Load Balancing)

**Behavior:**
Each new lead is assigned to the eligible agent with the fewest currently active (non-terminal) leads. In the case of a tie, the tiebreaker is the agent who was least recently assigned a lead.

**When to use:**
When fairness across the team matters more than strict rotation order — for example, when some leads require significantly more follow-up time than others and simple round-robin would overload agents with complex cases.

**Real-Time Recalculation:**
The active lead count is computed at assignment time from the live database. There is no cached count that could drift out of sync. This means equal distribution is always based on current reality, even if leads were just reassigned or converted moments before.

---

### 14.2 Distribution Configuration Properties

Each Branch has a single active distribution configuration:

| Property | Type | Description |
|---|---|---|
| `mode` | Enum | `manual`, `round_robin`, `equal_distribution` |
| `eligible_agents` | User ID array | The pool of agents currently available for auto-assignment |
| `round_robin_position` | Integer | Current position in the rotation (round robin only) |
| `capacity_limit` | Integer | Maximum active leads per agent; 0 = no limit |
| `notify_on_assignment` | Boolean | Whether agent receives in-platform notification on assignment |
| `auto_assign_on_commit` | Boolean | Whether distribution runs immediately on batch commit or is manager-triggered |

When `auto_assign_on_commit` is false, batch commit creates leads in the unassigned pool regardless of the configured mode. The manager then triggers distribution manually from the Import Batch summary screen.

---

### 14.3 Distribution Exclusion Rules

The following conditions permanently or temporarily remove an agent from the eligible distribution pool:

| Condition | Effect | Resolution |
|---|---|---|
| User account suspended | Permanently excluded until account reactivated | Admin reactivates account |
| Agent manually removed from pool | Excluded until manually re-added | Manager re-adds to pool |
| Agent at capacity limit | Excluded until active lead count drops below limit | Agent closes/converts leads |
| Agent on leave (HR status) | Excluded while leave status is active | HR status returns to Active |

An agent excluded from distribution retains all leads previously assigned to them. Exclusion only prevents new assignments. The manager must decide whether to reassign the excluded agent's existing leads.

---

### 14.4 Distribution Summary Reports

Distribution transparency is a core commitment of the platform. The following summary data is available to Team Managers and above at all times:

**Per-Agent Distribution Summary:**

| Metric | Description |
|---|---|
| Total leads assigned (this period) | Count of leads assigned to this agent in the selected period |
| Currently active leads | Count of non-terminal leads currently in the agent's queue |
| Leads converted (this period) | Count of leads converted to orders in the selected period |
| Conversion rate | Converted / Total assigned, as a percentage |
| Average follow-up time | Mean time from assignment to first status change |
| Leads overdue | Count of leads beyond the aging SLA in the agent's queue |

**Team Distribution Health:**

| Metric | Description |
|---|---|
| Total unassigned leads | Count of leads in the unassigned pool |
| Distribution imbalance score | Statistical measure of how unequal the current load is across agents |
| Agents at capacity | Count of agents currently at their configured capacity limit |
| Last distribution run | Timestamp of the last automatic distribution event |

---

### 14.5 Reassignment Rules and Audit

Reassignment — moving a lead from one agent to another after initial assignment — follows strict rules to protect both agents and managers.

**Who can reassign:**

| Role | Can Reassign | Scope |
|---|---|---|
| Team Manager | Yes | Any lead within their Branch |
| General Manager | Yes | Any lead within their Company |
| Brand Admin | Yes | Any lead within their Brand |
| Sales Agent | No | Agents cannot self-reassign or reassign peers |

**Reassignment Audit:**
Every reassignment creates a timeline entry on the lead record:
- Previous assignee
- New assignee
- Acting user (the manager who performed the reassignment)
- Timestamp
- Optional reason note

This audit trail makes it possible to reconstruct the complete assignment history of any lead, which is essential for resolving disputes about commissions, workload fairness, and sales credit attribution.

---

## 15. Business Rules

Business rules are the non-negotiable logical constraints that govern the platform's behavior. They represent decisions about how the business must work — decisions that cannot be overridden by configuration, user action, or developer shortcut. A system that violates a business rule is incorrect, regardless of whether it "works."

These rules are organized by domain.

---

### 15.1 Data Integrity Rules

**BR-DI-01 — No Direct Data Entry Bypass**
No lead, order, financial transaction, or product record may be created in bulk without passing through the Import Center's validate → preview → approve → commit workflow. Individual manual record creation (e.g., a sales agent creating one lead manually) is permitted through the standard form interface. Bulk data entry always requires Import Center.

**BR-DI-02 — Soft Delete Only**
No operational record (lead, order, customer, product, journal entry, expense, employee) may be hard-deleted from the database. All deletions are soft deletes: a `deleted_at` timestamp is set on the record, and the record is excluded from all default queries. Soft-deleted records remain accessible to authorized users through explicit "show deleted" filters and audit log queries. Hard deletes are reserved for administrative data hygiene procedures executed only by the Platform Owner and are permanently logged.

**BR-DI-03 — Timestamps Are Immutable**
The `created_at` timestamp on any record may never be changed after creation. The `updated_at` timestamp is updated by the system on every modification — it may not be set manually. No import or API operation may supply a `created_at` value that differs from the actual write time.

**BR-DI-04 — Import Batch Traceability**
Every record created through the Import Center must carry a reference to the Import Batch that created it. This reference is immutable. It is not possible to import a record without this reference being set. This ensures that any data quality issue can be traced back to its source batch, source file, and the users who initiated and approved the import.

**BR-DI-05 — Sequence Numbers Are Never Reused**
Document sequence numbers (invoice numbers, order numbers, journal entry references) are never reused, even when the document they were assigned to is deleted or cancelled. A cancelled invoice retains its number; the next invoice receives the next number in the sequence. This prevents gaps from being exploited to conceal transactions.

---

### 15.2 Financial Rules

**BR-FI-01 — Double Entry is Mandatory**
Every financial transaction in the Accounting module must produce a balanced journal entry: total debits must equal total credits. The system must enforce this constraint at the database level, not only at the application level. A journal entry that does not balance must be rejected before it reaches committed state.

**BR-FI-02 — Closed Periods Are Locked**
Once an accounting period is closed, no journal entry within that period may be created, edited, or deleted — by any user, including the Platform Owner. This is an immutable rule. The only operation permitted against a closed period is the creation of a reversal entry, which posts to the next open period.

**BR-FI-03 — Draft-Before-Post**
No auto-generated journal entry (from sales, purchasing, expenses, or inventory) is posted to the ledger without passing through a review step visible to the Accountant. Auto-generated entries are created in `draft` state. They must be explicitly posted by an authorized user (Accountant or Finance Manager). The system must never auto-post entries without human confirmation.

**BR-FI-04 — No Negative Stock Valuation**
The accounting value of any inventory item may not go below zero. A stock movement that would result in negative inventory value must be blocked and the user notified. The business must resolve the discrepancy (either through a stock adjustment or a correction to the originating transaction) before the movement proceeds.

**BR-FI-05 — Exchange Rate Immutability**
The exchange rate applied to a multi-currency transaction is recorded at the time the transaction is posted and is immutable thereafter. Subsequent changes to configured exchange rates do not retroactively affect posted transactions. Unrealized foreign currency gains and losses are calculated separately on period-end through a dedicated revaluation process.

**BR-FI-06 — Self-Approval Is Prohibited**
No user may approve their own financial submission. This applies to: expense claims, purchase orders, and import batches. If the submitter is the only user with the approval permission in their scope, the system must flag this as a configuration issue and prevent self-approval regardless. The approval must be escalated to a higher-scope approver.

**BR-FI-07 — Revenue Recognition Follows Delivery**
Revenue is recognized when an order moves to the configured "delivered" status, not when the order is created or confirmed. The accounting invoice entry that credits revenue is triggered by the delivery status change, not the order confirmation. Brands may configure an alternative recognition point (on confirmation rather than delivery) through explicit accounting configuration, but the default is delivery.

---

### 15.3 Lead Rules

**BR-LD-01 — One Active Assignment Per Lead**
A lead may be assigned to exactly one agent at any time. Multiple simultaneous assignments are not permitted. When a lead is reassigned, the previous assignment ends and the new one begins. The full assignment history is preserved in the activity timeline.

**BR-LD-02 — One Conversion Per Lead**
A lead may be converted to a Sales Order exactly once. Once a lead has a linked `converted_order_id`, it may not be converted again. If the linked order is cancelled, the lead may be re-converted — this is a configurable exception requiring explicit Brand Admin configuration, and each re-conversion is logged.

**BR-LD-03 — Duplicate Decisions Are Mandatory**
A lead flagged as `duplicate_exact` cannot be committed to the database without an explicit user decision on that row. The Import Center must not allow a batch to proceed to the approval step if any `duplicate_exact` row has no decision recorded.

**BR-LD-04 — Unassigned Leads Are Not Visible to Agents**
A lead in the unassigned pool is not visible in any agent's lead queue. Agents work only their assigned leads. Unassigned leads are visible only to Team Managers, General Managers, and Brand Admins. This rule prevents agents from cherry-picking leads from the unassigned pool.

**BR-LD-05 — Lead Data From Import Is the Record of Truth**
The data as it existed in the source file at the time of import is permanently preserved on the Import Batch record. If a lead's fields are subsequently edited within OFS (e.g., address corrected, phone updated), the import-time values are still accessible through the batch record. The audit trail shows both the original imported values and subsequent changes.

---

### 15.4 Order Rules

**BR-OR-01 — Order Amount Cannot Be Negative**
An order's line item quantity must be positive. A unit price may be zero (for complimentary items) but may not be negative. Discounts may not exceed 100% of the line value. The system enforces these constraints at form validation time and at the database constraint level.

**BR-OR-02 — Cancellation of Confirmed Orders Requires Authorization**
An order in `confirmed` status or beyond may not be cancelled by the agent who created it. Cancellation of a confirmed order requires a Team Manager or above. Cancellation of an order that has been dispatched requires a General Manager or above. Every cancellation requires a mandatory cancellation reason.

**BR-OR-03 — Inventory Reservation**
When an order is confirmed, the ordered quantity is reserved in inventory. Reserved stock reduces the available-for-sale quantity but does not reduce the on-hand quantity. The on-hand quantity decreases only when the stock movement is recorded (on dispatch). Cancellation of a confirmed order releases the reservation.

**BR-OR-04 — Payment Totals May Not Exceed Order Total**
The sum of all payment records against an order may not exceed the order's total amount. The system enforces this at payment recording time. If a payment would cause an overpayment, the user is shown a clear error identifying the overpayment amount and must either correct the payment amount or create a credit note.

---

### 15.5 User and Access Rules

**BR-UA-01 — Session Invalidation on Role or Scope Change**
When a user's role or scope is modified by an administrator, any active sessions for that user are immediately invalidated. The user's next request will receive a 401 response and they will be redirected to the login screen. This prevents a window where a user with reduced permissions continues to operate with their old access level.

**BR-UA-02 — Password Policy**
All user passwords must meet a minimum security policy: at least 10 characters, at least one uppercase letter, at least one number, and at least one special character. Password history is enforced: the last 10 passwords may not be reused. Password expiry is configurable per Brand (default: 90 days for financial roles, no expiry for operational roles unless configured).

**BR-UA-03 — MFA Requirement for Financial Roles**
Users assigned the Accountant, Finance Manager, or Brand Admin roles must complete MFA setup before gaining access to their assigned modules. MFA is enforced at login — there is no grace period. The system must not provide a bypass for MFA for these roles, regardless of circumstances.

**BR-UA-04 — Deactivated Users Are Immediately Locked Out**
When a user account is deactivated, all active sessions are invalidated instantly. The deactivated user cannot log in by any means. Deactivation does not delete the user's records or activity history. All records created by the deactivated user retain their attribution.

**BR-UA-05 — Scope Boundaries Are Absolute**
No application-level logic, no admin override, and no support tool may expose a user to data outside their assigned scope. The scope check is enforced at the data access layer, not only at the UI routing layer. An API request for a record outside the user's scope returns `404 Not Found`, never the actual record with a `403 Forbidden` header, to prevent enumeration.

---

### 15.6 Audit Rules

**BR-AU-01 — All State Changes Are Logged**
Every change to a record's fields, status, or relationships is recorded in the audit log with the acting user, timestamp, previous value, and new value. Reads are not logged (performance). The audit log is immutable — no application process may delete or modify an audit entry.

**BR-AU-02 — Audit Log Retention**
Audit logs are retained for a minimum of 7 years to satisfy standard accounting and regulatory requirements in the platform's target markets. Logs older than 7 years may be archived to cold storage but must remain retrievable on request within 5 business days.

**BR-AU-03 — Failed Actions Are Logged**
Permission denials, validation rejections, and failed login attempts are logged alongside successful actions. The log entry for a denial includes the reason code. This enables security audits and investigation of suspicious access patterns.

**BR-AU-04 — Export Actions Are Logged**
Every data export (report export, table export, bulk export) is recorded in the audit log: acting user, timestamp, export type, filter parameters applied, and record count exported. This creates accountability for data leaving the system.

---

*End of Section 15 — Business Rules*

---

**Document Status:** Sections 1–15 complete. Sections 16–20 appended below.

---

## 16. UI Principles

This section defines the implementation-level standards that govern every screen and component in OFS. The high-level design philosophy was established in Section 4. This section translates that philosophy into specific, enforceable rules that designers and engineers must follow when building any part of the interface.

---

### 16.1 Layout System

#### Navigation Structure

The primary navigation is a fixed sidebar positioned on the **right side** of the screen, consistent with RTL layout convention. The sidebar contains module-level navigation items, a user profile section at the bottom, and a compact Brand/Company/Branch context switcher at the top.

**Sidebar Behavior:**

| Breakpoint | Sidebar State |
|---|---|
| Desktop (≥1200px) | Always visible, full-width labels + icons |
| Tablet (768–1199px) | Collapsible; collapses to icon-only strip; toggled by hamburger button |
| Mobile (<768px) | Hidden by default; opens as a full-screen overlay from the right edge |

The sidebar never overlaps content on desktop. Content area occupies the remaining width to the left of the sidebar. On tablet and mobile, the sidebar overlays the content when expanded.

**Active State:**
The active navigation item is visually distinguished by a filled background using the primary color at 10% opacity, a left-edge accent bar in the primary color (on the right edge of the item in RTL, which is the inner edge facing the content area), and the item label in medium weight.

**Module Grouping:**
Navigation items are grouped into logical clusters separated by subtle dividers:

```
──────────────────
  لوحة التحكم       (Dashboard)
──────────────────
  مركز الاستيراد    (Import Center)
──────────────────
  إدارة العملاء     (CRM)
  المبيعات          (Sales)
  المشتريات         (Purchasing)
  المخزون           (Inventory)
──────────────────
  المصروفات         (Expenses)
  المحاسبة          (Accounting)
──────────────────
  الموارد البشرية   (HR)
──────────────────
  التقارير          (Reports)
  الإعدادات         (Settings)
──────────────────
```

Only activated modules appear in the navigation. Deactivated modules are completely absent — they are not shown as disabled or locked items.

---

#### Page Layout Anatomy

Every page in OFS follows a consistent three-zone layout:

```
┌──────────────────────────────────────────────────┬─────────┐
│  PAGE HEADER                                     │         │
│  Page title · Breadcrumb · Primary action button │ SIDEBAR │
├──────────────────────────────────────────────────│  (RTL:  │
│  FILTER / SEARCH BAR (where applicable)          │  right  │
│  Search input · Filter chips · Sort · Export     │  side)  │
├──────────────────────────────────────────────────│         │
│                                                  │         │
│  CONTENT AREA                                    │         │
│  Table / Cards / Form / Detail view              │         │
│                                                  │         │
├──────────────────────────────────────────────────│         │
│  PAGINATION BAR (for list views)                 │         │
│  Showing X–Y of Z · Page size selector · Pages   │         │
└──────────────────────────────────────────────────┴─────────┘
```

The Page Header is sticky — it remains visible during vertical scroll. The Pagination Bar is sticky at the bottom of the viewport for list views. The content area between them scrolls.

---

### 16.2 Table Design

Tables are the primary data display component in OFS. Every table must conform to the following standards without exception.

**Column Anatomy:**
- Column headers are right-aligned (RTL default), in Label style (12px, 500 Medium), uppercase, with a sort indicator (↑↓) on sortable columns.
- Data cells are right-aligned by default. Numerical data is always right-aligned. Status badges are centered within their cell.
- Row height: 48px for standard density; 40px for compact density (user-configurable per-table preference).
- First column (rightmost in RTL) always contains the primary identifier or record name and is a clickable link to the detail view.

**Required Table Features:**

| Feature | Specification |
|---|---|
| Pagination | Server-side. Page sizes: 25 (default), 50, 100. Controls show "عرض X–Y من Z سجل". |
| Sorting | Server-side. Click column header to sort ascending; click again for descending. One active sort at a time. Current sort state preserved in URL query parameters. |
| Filtering | Server-side. Filters appear in the filter bar above the table as chips. Active filters are visually highlighted with a clear (×) button per filter. |
| Search | Global search input above the table. Searches across configured searchable fields server-side. Debounced at 300ms. |
| Bulk Selection | Checkbox column on the leftmost side (in RTL: leftmost visible column). "Select all on this page" checkbox in header. "Select all N matching records" banner appears after selecting all on page. |
| Bulk Actions Bar | Appears above the table when any rows are selected. Contains: count of selected records, available bulk actions, and a clear-selection button. Disappears when selection is cleared. |
| Column Visibility | Users may show/hide optional columns. The core identifier column is always visible and cannot be hidden. Column preferences are saved per-user per-table. |
| Empty State | Displayed when the table has no rows. Contains an icon, a descriptive message, and a contextual call-to-action. |
| Row Hover | Subtle background color change on row hover (neutral-100). Row becomes fully clickable (entire row is a link to detail view, not just the name cell). |
| Loading State | Skeleton rows (grey animated placeholders) replace table content during data fetch. The table header remains visible during loading. |

**Status Badges:**
Status values displayed in tables use colored badge components — a rounded pill with a background color matching the status configuration and a short text label. Badge text is truncated at 20 characters. The full status name is available on tooltip hover.

---

### 16.3 Form Design

Forms are used for record creation and editing throughout the platform. All forms must follow these standards.

**Field Layout:**
- Labels are positioned above their fields (not inline), right-aligned in RTL, in Label style (12px, 500 Medium, neutral-600).
- Field width occupies the full container column. Multi-column form layouts use a 2-column grid on desktop, collapsing to single column on mobile.
- Vertical spacing between field groups: 16px. Within a group: 8px between label and field, 4px between field and help text.
- Required fields are indicated by a red asterisk (*) after the label. The asterisk is not sufficient on its own — a note "الحقول المطلوبة مشار إليها بـ *" is displayed at the top of every form containing required fields.

**Input Field States:**

| State | Visual Treatment |
|---|---|
| Default | Border: neutral-300; background: white |
| Focus | Border: primary-500 (2px); background: white; subtle shadow |
| Filled | Border: neutral-300; background: white; value in body text color |
| Disabled | Border: neutral-200; background: neutral-50; value in neutral-400 |
| Error | Border: danger-500 (2px); background: danger-50; error message below in danger-600 |
| Valid | Border: neutral-300 (no green border — visual noise without value) |

**Validation Timing:**
- Required field validation triggers on blur (when the user leaves the field).
- Format validation (phone, email, number range) triggers on blur.
- Cross-field validation (e.g., end date must be after start date) triggers on the second field's blur and on form submit.
- The submit button remains enabled at all times. Validation errors appear on submit attempt if not already shown, scroll the form to the first error field, and focus that field.

**Searchable Dropdowns:**
All dropdowns containing more than 5 options must be implemented as searchable dropdowns with the following behavior:
- A text input is rendered inside the dropdown trigger.
- Typing filters the option list in real-time, server-side for lists > 100 items, client-side for lists ≤ 100 items.
- A clear (×) button appears in the trigger whenever a value is selected.
- If no results match the search term, an empty state message is shown: "لا توجد نتائج".
- Keyboard navigation: Arrow keys cycle through options; Enter selects; Escape closes.
- The dropdown list is limited to 250px height with internal scroll. It opens upward if there is insufficient space below.

**Save Behavior:**
- Forms with significant content (more than 5 fields) auto-save a draft to local storage every 30 seconds. If the user navigates away with unsaved changes, a confirmation dialog is shown: "لديك تغييرات غير محفوظة. هل تريد الخروج؟".
- Form submissions show an inline loading state on the submit button (spinner + "جاري الحفظ..."). The button is disabled during submission.
- On success, a toast notification confirms the action. The user remains on the record (edit mode) or navigates to the detail view, depending on the context.
- On failure, the error is shown inline at the field level if field-specific, or as a banner at the top of the form if general.

---

### 16.4 Modal and Dialog Design

**When to Use Modals:**
Modals are for focused tasks that are subsidiary to the current page: confirming a destructive action, creating a simple related record, viewing a quick detail without full navigation. Modals are not for complex multi-section forms. A form with more than 8 fields belongs on its own page, not in a modal.

**Modal Sizes:**

| Size | Width | Use Case |
|---|---|---|
| Small | 400px | Confirmation dialogs, single-field inputs |
| Medium | 600px | Short forms (up to 8 fields), detail previews |
| Large | 800px | Multi-section forms, import previews |
| Full-Screen | 100vw × 100vh | Complex workflows (e.g., Import Center preview step) |

**Modal Behavior:**
- Modals always render centered vertically and horizontally on desktop; they slide up from the bottom on mobile (sheet pattern).
- Background content is dimmed with a semi-transparent overlay (black at 40% opacity).
- Pressing Escape closes the modal if it contains no unsaved changes. If there are unsaved changes, an exit confirmation dialog is shown.
- Clicking the overlay background closes the modal — except for destructive confirmation dialogs, which require explicit button interaction.
- Modal titles are in Heading 2 style, right-aligned (RTL). The close button (×) is in the top-left corner (RTL: leftmost).
- Modals have a sticky header (title + close button) and sticky footer (action buttons). The body scrolls if content exceeds the modal height.

**Confirmation Dialogs:**
Destructive actions (delete, cancel order, close period, reject import) always require a confirmation dialog with the following structure:
- **Title:** States the action clearly. Not "هل أنت متأكد؟" — always specific: "حذف العميل: اسم العميل".
- **Body:** One sentence explaining the consequence and whether it is reversible.
- **Actions:** Two buttons — a destructive primary button (red, danger color) and a secondary cancel button. The destructive button is never the default focused element.

---

### 16.5 Notification and Feedback System

**Toast Notifications:**
Transient feedback for completed actions. Always appear in the top-left corner (RTL: top-right of content area) and auto-dismiss after 4 seconds. Users may dismiss manually. Toast types:

| Type | Color | When Used |
|---|---|---|
| Success | Green | Record saved, import committed, status updated |
| Error | Red | Action failed, server error |
| Warning | Amber | Action succeeded with caveats |
| Info | Blue | Background process started, informational update |

Toasts stack vertically (newest on top). Maximum 3 toasts visible simultaneously; additional toasts queue.

**Inline Banners:**
Persistent feedback for page-level states that require attention. Appear between the filter bar and the content area. Types: error (red), warning (amber), info (blue). Banners have a dismiss button unless they communicate a blocking system state.

**Badge Counters:**
Navigation items for modules with pending actions display a numeric badge (e.g., import approvals waiting, expense claims pending). Badge counts are updated on navigation focus. A count of 0 hides the badge — it never shows "0".

---

### 16.6 Empty States

Every view that can be empty must have a designed empty state. Empty states are not optional and are not a blank screen.

**Empty State Components:**
- **Illustration:** A simple, contextual icon or illustration (not a generic "no data" image — each module has a distinct illustration).
- **Headline:** States why the view is empty in one short sentence.
- **Sub-text:** Explains what to do next. One sentence.
- **Call to Action:** A single button linking to the most relevant next action.

**Empty State Variants:**

| Variant | Headline Pattern | CTA |
|---|---|---|
| No data yet | "لا توجد [سجلات] بعد" | "إضافة [سجل]" |
| No results for filter | "لا توجد نتائج تطابق البحث" | "مسح الفلاتر" |
| Module not activated | "هذه الوحدة غير مفعّلة" | "تفعيل الوحدة" (Admin only) |
| No permission | "ليس لديك صلاحية لعرض هذه البيانات" | No CTA |
| Loading failed | "تعذّر تحميل البيانات" | "إعادة المحاولة" |

---

### 16.7 RTL-Specific Implementation Rules

These rules supplement Section 4's RTL-first principle with specific implementation requirements for engineers.

**Directional Icons:**
Icons that imply direction must be mirrored in RTL. This applies to: arrows (left/right), chevrons (navigation, breadcrumbs), forward/back controls, progress indicators, and any icon showing a sequence or flow. Icons that are non-directional (star, check, bell, gear) are never mirrored.

**Bidirectional Text:**
Mixed Arabic/English text (common in product names, SKUs, email addresses, phone numbers) must be handled with explicit Unicode bidirectional control. Phone numbers, email addresses, URLs, and numeric values always render LTR regardless of the surrounding RTL context. The `dir="ltr"` attribute or `unicode-bidi: isolate` CSS is applied to these field types.

**Form Field Alignment:**
- Arabic text inputs: right-aligned text, RTL cursor behavior.
- Numeric inputs (amounts, quantities, codes): left-aligned text (numbers read LTR), but the field itself remains in its RTL grid position.
- Placeholder text: always in the language and direction of the expected input.

**Scrollbars:**
Horizontal scrollbars (for wide tables on narrow screens) appear at the bottom of the scroll container. The scroll direction is reversed in RTL — the default scroll position is the rightmost edge (the beginning of the RTL content), not the leftmost.

**Animations:**
Slide animations are mirrored in RTL. A drawer that slides in from the right in LTR slides in from the left in RTL. A toast that appears from the right in LTR appears from the left in RTL (since "left" is the content area's edge in RTL, where the sidebar is not).

---

### 16.8 Mobile Design Rules

Mobile is not a degraded experience. The following rules govern mobile-specific design decisions.

**Touch Targets:**
All interactive elements (buttons, links, checkboxes, dropdown triggers) must have a minimum touch target of 44×44px, regardless of the visual size of the element. This is achieved through padding, not by enlarging the visible element.

**Bottom Navigation:**
On mobile, the primary module navigation moves from the sidebar to a bottom tab bar. The bottom tab bar displays the 5 most commonly used modules for the user's role (configurable per role). Access to all other modules is available through a "More" tab that opens the full navigation list.

**Table Adaptation:**
Tables on mobile become card-based list views. Each record is represented as a card showing the 3–4 most important fields. The full record is accessible through the card detail view. Pagination controls adapt to a simplified previous/next format with a page indicator.

**Form Adaptation:**
Multi-column form layouts collapse to single-column on mobile. Date pickers use the native mobile date picker rather than a custom component. File upload fields support camera capture as a source on mobile.

---

## 17. Technical Decisions

This section documents the foundational technical decisions for the OFS platform. Each decision is stated with its rationale and its implications. These decisions establish the technical boundaries within which all implementation work takes place.

---

### 17.1 Frontend Architecture

**Decision: React with TypeScript**

OFS is built on React with TypeScript as the frontend framework.

**Rationale:**
- React's component model maps directly to OFS's design system: every UI primitive is a reusable component with well-defined props.
- TypeScript eliminates a class of runtime errors — particularly important for a financial platform where a mistyped field name on a form submission could corrupt data.
- The React ecosystem has the broadest available support for RTL layout, Arabic typography, and internationalization tooling.
- TypeScript's strict mode forces explicit handling of null and undefined — critical for a platform that processes imported data with incomplete fields.

**Implications:**
- All components are written as functional components with hooks. Class components are not used.
- Shared types for all API request and response shapes are generated from the API contract and imported into frontend code — no manual type definitions for API responses.
- The component library is a private, internal design system. No third-party UI component library is used as a base — external libraries introduce RTL regressions and design inconsistencies that are expensive to fix.

---

### 17.2 State Management

**Decision: Server State via React Query; UI State via local component state and React Context**

**Rationale:**
- The majority of OFS's state is server state: lead lists, order records, accounting entries. React Query handles caching, background refresh, stale-while-revalidate, and optimistic updates for all server-derived state.
- Global client UI state (active module, sidebar open/closed, user preferences) is minimal and fits cleanly in React Context without requiring a full global state manager.
- Avoiding Redux/Zustand for server state eliminates the synchronization problem — the cache is the source of truth, and React Query's invalidation model ensures it stays consistent with the server.

**Implications:**
- Every API call is wrapped in a React Query `useQuery` or `useMutation` hook.
- Cache invalidation is explicit and granular: an order status update invalidates the order list cache and the specific order record cache, but not the customer cache.
- Optimistic updates are used for status changes and note additions — these are the highest-frequency operations and must feel instant.

---

### 17.3 Backend Architecture

**Decision: API-First, Modular Monolith**

OFS starts as a modular monolith — a single deployable backend application with strong internal module boundaries — rather than microservices.

**Rationale:**
- Microservices introduce distributed systems complexity (network failures, eventual consistency, distributed transactions) before the product has proven its boundaries. A financial platform cannot tolerate eventual consistency in its accounting layer.
- A modular monolith enforces the same module separation as microservices through code organization and internal interface contracts, but without the operational overhead.
- At the scale OFS will operate during its first 2–3 years, a well-optimized monolith with proper indexing and caching outperforms a microservices architecture managed by a small team.
- The module boundaries are designed to be extraction-ready: if a specific module (e.g., Import Center) requires independent scaling in the future, it can be extracted to a separate service without changing its external contract.

**Module Boundaries (Internal):**
Each module owns its domain models, its business logic, and its database tables. Cross-module interaction happens through defined internal service interfaces — never through direct cross-module database queries. This rule is enforced through code review and, where the language supports it, package/module visibility constraints.

---

### 17.4 API Design

**Decision: RESTful API with JSON; no GraphQL**

**Rationale:**
- REST's resource-oriented model maps cleanly to OFS's domain: leads, orders, journal entries, and import batches are all well-defined resources.
- REST APIs are simpler to cache at the CDN and infrastructure layer than GraphQL.
- GraphQL's flexibility is not required here: the frontend is built alongside the API and its data requirements are known. Over-fetching is addressed through sparse fieldsets and compound documents, not a query language.
- REST is more straightforward to secure with standard middleware: rate limiting, authentication, and audit logging integrate cleanly with resource-based routing.

**API Conventions:**
- All endpoints follow the pattern: `/{version}/{module}/{resource}` (e.g., `/v1/leads`, `/v1/accounting/journal-entries`).
- Arabic field names are never used in the API layer. All API field names are in English (snake_case). Arabic is a display concern handled by the frontend.
- Pagination uses cursor-based pagination for high-volume lists (leads, audit logs) and offset-based pagination for lower-volume lists. The response always includes `total_count`, `page`, `page_size`, `has_next_page`.
- All timestamps in API responses are in ISO 8601 UTC format. Timezone conversion is a frontend responsibility.
- Error responses follow a consistent structure: `{ "error": { "code": "LEAD_NOT_FOUND", "message": "...", "field": "id" } }`.

---

### 17.5 Database

**Decision: PostgreSQL as the primary database**

**Rationale:**
- PostgreSQL's transactional integrity, foreign key enforcement, and check constraint support are non-negotiable for a financial platform. Every double-entry constraint, every sequence integrity rule, and every referential link between orders and accounting entries benefits from database-level enforcement.
- PostgreSQL's JSONB column type allows custom fields (Section 9.3) to be stored efficiently without a completely dynamic schema — core fields remain in typed columns, custom fields in a JSONB column on the same row.
- Full-text search in Arabic requires proper Unicode collation support. PostgreSQL's `pg_trgm` extension and Arabic-aware collations provide sufficient search capability for the platform's search requirements without introducing a separate search infrastructure.
- Row-level security (RLS) in PostgreSQL provides a second layer of multi-tenant data isolation beneath the application layer, making it structurally impossible for a query to access another tenant's data even if the application's scope check were to malfunction.

**Multi-Tenancy Model:**
OFS uses a **shared database, shared schema** multi-tenancy model with row-level security. All Brand data lives in the same database and schema. Every table that contains Brand-specific data has a `brand_id` column. Row-level security policies on each such table restrict all queries to rows matching the current session's `brand_id`, which is set at connection time.

This model is chosen over schema-per-tenant because:
- Schema-per-tenant creates operational complexity at scale (1,000 Brands = 1,000 schemas to migrate on every deployment).
- Shared schema with RLS provides equivalent isolation with simpler operations.
- Connection pooling is more efficient in a shared schema model.

**Read Replicas:**
All reporting queries, analytics queries, and export operations are routed to read replicas. Write operations and transactional reads (where consistency is critical, e.g., accounting entries) go to the primary. This separation is enforced at the connection pool routing layer.

---

### 17.6 Background Job Processing

**Decision: Persistent queue-based job processor**

Long-running operations — import batch validation, duplicate detection scoring, bulk export generation, report generation, email notifications — are executed as background jobs, not in the HTTP request lifecycle.

**Job Categories:**

| Category | Examples | Priority |
|---|---|---|
| Critical | Import batch commit, accounting entry post | High |
| Operational | Duplicate detection, validation run, bulk assign | Medium |
| Reporting | Report generation, export file creation | Low |
| Notification | Email delivery, in-platform notification dispatch | Low |

**Failure Handling:**
- All jobs have a retry policy: up to 3 retries with exponential backoff (1 min, 5 min, 15 min).
- A job that exhausts its retries is moved to a dead-letter queue and flagged for investigation.
- The user who initiated a long-running job receives an in-platform notification when it completes or fails — they never need to poll a status page.

---

### 17.7 Caching Strategy

Caching operates at three layers:

**Layer 1 — HTTP Cache (CDN/Reverse Proxy):**
Static assets (JS bundles, CSS, fonts, images) are served with long-lived cache headers (1 year, content-hash in filename). API responses are not cached at the CDN layer — they are dynamic and tenant-specific.

**Layer 2 — Application Cache (Redis):**
Frequently read, infrequently changed data is cached in Redis:

| Data | TTL | Invalidation Trigger |
|---|---|---|
| User session and permissions | 15 minutes | Role/scope change, logout |
| Active status lists (lead statuses, order statuses) | 10 minutes | Admin updates a status |
| Product catalog (active products) | 5 minutes | Product create/update/delete |
| Currency codes and rates | 1 hour | Rate update event |
| User preferences and column configs | 30 minutes | User saves a preference |

**Layer 3 — Query Result Cache:**
Expensive report queries that are run frequently with the same parameters are cached at the query result level for up to 60 seconds. The cache key includes the Brand ID, the query parameters, and the user's scope hash. Cache entries are invalidated immediately when a write operation touches the tables the query reads from.

**Cache Invalidation Rule:**
Cache entries are invalidated proactively on write, not lazily on read. A stale financial figure on a dashboard is a worse outcome than a slightly slower cache invalidation path.

---

### 17.8 File Storage

All user-uploaded files (import source files, receipt attachments, employee documents, product images) are stored in object storage (S3-compatible), never on the application server's filesystem.

**File Access Model:**
Files are never served directly to the browser from a public URL. Every file access is mediated by the application: the client requests a file through the API, the API verifies the user's permission to access that file, and then issues a short-lived signed URL (TTL: 5 minutes) that the client uses for the actual download. This ensures file access respects the permission model even after the file has been uploaded.

**File Retention:**
- Import source files: retained for 2 years (regulatory traceability).
- Receipt attachments: retained for 7 years (accounting requirement per BR-AU-02).
- Export files: retained for 7 days, then automatically deleted.

---

## 18. Performance Standards

Performance standards are acceptance criteria, not aspirations. A feature that does not meet its performance target at the specified data volume is incomplete. These targets are measured at P95 (the 95th percentile of response times) — not averages, which mask tail latency problems.

---

### 18.1 Response Time Targets

**User-Facing Operations:**

| Operation | P95 Target | Measurement Point |
|---|---|---|
| Dashboard initial load (all KPIs rendered) | < 1,000ms | Browser time-to-interactive |
| Lead list, first page (25 rows) | < 300ms | API response time |
| Lead detail view | < 200ms | API response time |
| Order list, first page | < 300ms | API response time |
| Product/customer searchable dropdown | < 200ms | API response time |
| Global search (cross-module) | < 300ms | API response time |
| Report generation (standard reports) | < 2,000ms | API response time |
| Import batch validation (per 1,000 rows) | < 10,000ms | Background job duration |
| Import batch commit (per 1,000 rows) | < 5,000ms | Background job duration |
| Bulk status update (up to 500 records) | < 3,000ms | Background job duration |
| File upload (up to 10MB) | < 5,000ms | Client-perceived time to upload complete |
| Export generation (up to 10,000 rows) | < 15,000ms | Background job duration |

**Infrastructure-Level Targets:**

| Metric | Target |
|---|---|
| API P95 response time (all endpoints) | < 300ms |
| Database query P95 execution time | < 100ms |
| Cache hit rate (Redis) | > 85% |
| Background job queue wait time P95 | < 30 seconds |
| Concurrent users per application instance | 500 |

---

### 18.2 Data Volume Benchmarks

Performance targets must hold at the following representative data volumes. These are the benchmarks used for load testing and are not theoretical maximums.

| Entity | Test Volume |
|---|---|
| Leads per Brand | 1,000,000 |
| Orders per Brand | 200,000 |
| Journal entries per Brand | 2,000,000 |
| Customers per Brand | 100,000 |
| Products per Brand | 10,000 |
| Active users per Brand | 500 |
| Import batch size | 10,000 rows |
| Concurrent active users (platform-wide) | 5,000 |

---

### 18.3 Mandatory Performance Techniques

The following techniques are not optional optimizations — they are mandatory implementation requirements. Any implementation that omits them is non-compliant with this blueprint.

**Server-Side Pagination:**
No API endpoint that returns a list may return more than 100 records in a single response. The default page size is 25. Pagination parameters (`page`, `page_size` or `cursor`, `limit`) are required on all list endpoints. "Get all records" endpoints do not exist in the public API; export operations use streaming or background jobs.

**Server-Side Filtering and Sorting:**
All filtering and sorting of list data happens in the database, not in the application layer. The application never fetches all records and filters them in memory. Every filter parameter maps to a SQL WHERE clause. Every sort parameter maps to an ORDER BY clause backed by an index.

**No N+1 Queries:**
List views must fetch all required data in a bounded number of queries, regardless of the number of rows returned. The maximum number of database queries for any list view response is the number of distinct entity types represented, plus one per pagination metadata query. Implementations must be reviewed for N+1 patterns before merging.

**Virtualized Tables:**
For client-side rendered lists (where pagination is client-managed, e.g., import preview tables), the DOM must not render more than 50 rows at a time. Virtual scrolling (only rendering the visible viewport's rows) is mandatory for any client-side list exceeding 100 items.

**Lazy Loading of Heavy Content:**
Dashboard sections that require expensive queries are loaded progressively. The page renders its layout skeleton immediately, then populates each section as its data arrives. Users see content appearing rather than waiting for the entire page to be ready.

**Proper Database Indexing:**
Every foreign key column is indexed. Every column used in a WHERE clause in a common query is indexed. Every column used in an ORDER BY clause on a high-frequency query is indexed. Composite indexes are created for queries that filter on multiple columns simultaneously. Index coverage is verified before any schema migration is deployed to production.

**Database Connection Pooling:**
Application instances never open direct database connections. All database access goes through a connection pool. The pool size is tuned per environment and monitored. Connection exhaustion is treated as a critical incident.

---

### 18.4 Performance Monitoring Requirements

The following metrics must be captured and monitored in production at all times:

| Metric | Alert Threshold | Alert Recipient |
|---|---|---|
| API P95 response time | > 500ms for 5 minutes | Platform Owner |
| Database query P95 | > 200ms for 5 minutes | Platform Owner |
| Background job queue depth | > 1,000 jobs | Platform Owner |
| Failed job rate | > 1% of jobs in 10 minutes | Platform Owner |
| Cache hit rate | < 70% for 10 minutes | Platform Owner |
| Error rate (5xx responses) | > 0.5% of requests in 5 minutes | Platform Owner |
| Import batch failure rate | > 5% of batches in 1 hour | Platform Owner |

Every API response includes a server-side processing time header (`X-Response-Time`). This enables performance regression detection at the endpoint level without requiring full distributed tracing.

---

## 19. Security Principles

Security in OFS is non-negotiable. The platform handles financial records, customer personal data, and payment information. A security failure is a business failure. Every layer of the system is designed with the assumption that any single layer may be compromised — security is defense-in-depth, not a perimeter.

---

### 19.1 Authentication

**Session Management:**
OFS uses short-lived JWT access tokens (TTL: 15 minutes) paired with long-lived refresh tokens (TTL: 30 days, stored as HttpOnly cookies). The access token is stored in application memory only — never in localStorage or sessionStorage, which are accessible to JavaScript and vulnerable to XSS. On access token expiry, the client silently exchanges the refresh token for a new access token.

**Token Invalidation:**
Refresh tokens are stored in the database with their active status. When a user logs out, is suspended, or has their role changed, their active refresh tokens are immediately invalidated in the database. The next refresh attempt returns 401, forcing re-authentication. This is the mechanism behind BR-UA-01.

**Multi-Factor Authentication:**
MFA is mandatory for Accountant, Finance Manager, and Brand Admin roles (BR-UA-03). MFA is implemented as TOTP (Time-based One-Time Password), compatible with standard authenticator apps (Google Authenticator, Authy, etc.). SMS-based MFA is not offered — SMS is susceptible to SIM-swapping attacks. Recovery codes (8 single-use codes) are generated at MFA setup and must be stored securely by the user.

**Login Security:**
- Brute force protection: after 5 consecutive failed login attempts, the account is locked for 15 minutes. After 10 consecutive failures, the account is locked until an admin unlocks it.
- All failed login attempts are logged with timestamp and IP address.
- Successful logins from a new IP address or device generate an in-platform security notification to the user.
- Session fixation is prevented by issuing a new session identifier on every successful authentication.

---

### 19.2 Transport Security

**TLS Everywhere:**
All communication between client and server, and between internal services, uses TLS 1.2 or higher. TLS 1.0 and 1.1 are disabled. HTTP requests are redirected to HTTPS. HSTS (HTTP Strict Transport Security) is enforced with a minimum max-age of 1 year and includeSubDomains.

**Certificate Management:**
TLS certificates are automatically renewed before expiry. Certificate expiry monitoring alerts fire 30 days before expiry. A certificate expiry is treated as a critical incident.

---

### 19.3 Multi-Tenant Data Isolation

Data isolation between Brands is the highest-priority security requirement of the platform. The following defense layers enforce it:

**Layer 1 — Row-Level Security (Database):**
PostgreSQL row-level security policies ensure that every query against a Brand-specific table automatically includes a `WHERE brand_id = :current_brand_id` filter at the database engine level, regardless of what the application query contains. This makes it structurally impossible for a query to accidentally or maliciously return another Brand's data.

**Layer 2 — Scope Check (Application):**
Every API handler validates that the requested resource's `brand_id` matches the authenticated user's `brand_id` before any data is returned or modified (Section 8.5, Step 3).

**Layer 3 — API Response Scrubbing:**
Serialization layers never include `brand_id` in API responses sent to clients. Clients must not have visibility into the Brand's internal identifier, which could be used to probe for other Brands' data.

**Layer 4 — Penetration Testing:**
Tenant isolation is explicitly tested in every penetration test cycle. Test cases include: cross-tenant data access via manipulated request parameters, cross-tenant access via shared resource IDs, and cross-tenant access via timing attacks on shared infrastructure.

---

### 19.4 Input Validation and Injection Prevention

**All Input Is Untrusted:**
Every value arriving at the API from a client — request body fields, query parameters, path parameters, file contents — is treated as untrusted input until validated. This applies without exception, including input from authenticated admin users.

**SQL Injection:**
All database queries use parameterized queries or an ORM's query builder. String interpolation into SQL is forbidden without exception. This rule is enforced through code review and automated static analysis.

**Cross-Site Scripting (XSS):**
All user-supplied content rendered in the browser is escaped by the rendering framework. React's JSX escapes string values by default — no use of `dangerouslySetInnerHTML` is permitted except for content sanitized by a server-side HTML sanitizer. Content Security Policy (CSP) headers restrict script execution to known origins.

**File Upload Security:**
Uploaded files are never executed. File types are validated by magic bytes (file signature), not file extension. Files are stored in object storage with a randomized key — the original filename is stored in the database record but never used as the storage key. Uploaded files are scanned for malware before being stored.

**Import Data Sanitization:**
Data imported through the Import Center is sanitized before storage: HTML tags are stripped, control characters are removed, and field lengths are truncated to their defined maximum before any database write.

---

### 19.5 Secrets Management

**No Secrets in Code:**
No credentials, API keys, database connection strings, or encryption keys are committed to source code repositories. All secrets are injected at runtime through environment variables or a secrets manager.

**Encryption Keys:**
Sensitive fields in the database (bank account numbers, tax IDs) are encrypted at the application layer using AES-256 before storage. Encryption keys are rotated annually. The key rotation process re-encrypts all affected records without downtime.

**Third-Party Credentials:**
OAuth tokens for Google Sheets integration are stored encrypted at rest and are never logged or included in error reports.

---

### 19.6 Vulnerability Management

**Dependency Scanning:**
All third-party dependencies are scanned for known vulnerabilities on every build. Critical or high-severity vulnerabilities block deployment until resolved. Dependency scanning runs on both frontend and backend dependency trees.

**Security Patching:**
Operating system and runtime security patches are applied within 72 hours of release for critical vulnerabilities and within 14 days for high-severity vulnerabilities.

**Penetration Testing:**
A full penetration test is conducted before the platform's initial public launch and annually thereafter. The scope includes: authentication, authorization, multi-tenant isolation, API security, file upload security, and the admin configuration interfaces. All critical and high findings must be remediated before the next scheduled test.

**Responsible Disclosure:**
A responsible disclosure policy is published on the platform's public website. Reports from external security researchers are acknowledged within 48 hours and triaged within 7 days.

---

### 19.7 Data Privacy

**Minimal Data Collection:**
OFS collects only the data required for the platform's stated operational functions. No behavioral analytics, advertising identifiers, or data-broker integrations are built into the platform.

**Personal Data Handling:**
Customer personal data (names, phone numbers, addresses) stored in OFS is owned by the Brand, not by Softland. Softland processes this data as a data processor, not a data controller. The platform provides the tools (export, delete) that Brands need to fulfill their own data subject rights obligations.

**Data Deletion on Brand Termination:**
When a Brand's account is terminated (not suspended), all of the Brand's operational data is scheduled for deletion within 90 days. The Brand may request an export of their data before deletion is executed. After deletion, no record of the Brand's operational data remains in the production database; only anonymized billing records are retained for Softland's own accounting requirements.

---

## 20. Scalability Principles

OFS is designed to scale — but scalability is not achieved by over-engineering the initial implementation. It is achieved by making architectural decisions that do not create scaling ceilings, and by ensuring the system can grow horizontally without fundamental restructuring.

---

### 20.1 Horizontal Scaling of Application Layer

The application server is stateless. No session state, no user context, and no request-in-flight data is stored in application memory between requests. All session state lives in Redis. This means any number of application server instances can run simultaneously behind a load balancer and any instance can serve any request.

**Scaling Trigger:**
Application instances are scaled horizontally when CPU utilization exceeds 70% for more than 5 minutes, or when the P95 API response time exceeds 400ms for more than 2 minutes.

**Zero-Downtime Deployment:**
Deployments use a rolling update strategy: new instances are added to the load balancer before old instances are removed. Health checks ensure new instances are serving traffic correctly before old instances shut down. Database migrations are executed before code deployment and must be backward-compatible with the previous version of the application code.

---

### 20.2 Database Scaling

**Read/Write Separation:**
From launch, all read-heavy operations (reporting queries, export queries, list views for non-critical data) are routed to read replicas. Write operations and transactionally critical reads go to the primary. This separation is implemented at the connection pool level and is transparent to application code.

**Read Replica Scaling:**
Additional read replicas can be added without application changes. As reporting load grows, replicas dedicated to reporting workloads are provisioned with higher memory configurations to support larger working sets.

**Vertical Scaling Ceiling:**
The primary database is sized conservatively at launch and scaled vertically (larger instance type) as write volume grows. Vertical scaling has a ceiling — when that ceiling is approached, the following strategies are evaluated in order:

1. **Query Optimization Pass:** Ensure all slow queries are optimally indexed before hardware investment.
2. **Caching Expansion:** Increase Redis cache TTLs and coverage to reduce read pressure on primary.
3. **Read Replica Offload:** Move more read traffic to replicas.
4. **Table Partitioning:** Partition high-volume tables (leads, audit logs, journal entries) by `brand_id` or time range.
5. **Horizontal Sharding:** If all above options are exhausted, shard by `brand_id`. The module boundary design (shared-schema, brand_id-on-every-table) is specifically chosen to make brand-based sharding feasible without a schema redesign.

---

### 20.3 Background Job Scaling

The background job queue is the pressure valve for the application layer. Operations that would otherwise make API responses slow (import processing, export generation, bulk operations) are offloaded to the job queue.

**Worker Scaling:**
Job workers are independent processes that can be scaled independently of the application servers. As import volume increases, more workers are added to the import processing queue without affecting API response time for interactive users.

**Queue Prioritization:**
The job queue is partitioned into priority tiers (Critical, Operational, Reporting, Notification — Section 17.6). High-priority queues always have dedicated workers that cannot be starved by low-priority queue growth. A surge in report generation requests never delays import batch commits.

---

### 20.4 Caching Layer Scaling

Redis is deployed in a cluster configuration from the start. Cluster mode allows horizontal sharding of the cache across multiple nodes. As cache data volume grows (more Brands, more cached data), nodes are added to the cluster without application changes or cache invalidation.

**Cache Warming:**
On application startup, the most commonly accessed reference data (active status lists, product catalogs) is pre-loaded into the cache. This prevents cold-start performance degradation after deployments.

---

### 20.5 Multi-Region Architecture

**Phase 1 (Launch): Single Region**
OFS launches in a single cloud region co-located with the primary customer base (Gulf region). All infrastructure is in one region. Cross-region redundancy is not a day-one requirement.

**Phase 2 (Growth): Multi-Region Read**
As the customer base grows geographically, read replicas and CDN edge nodes are deployed in additional regions. Interactive API reads for geographically distant users are served from the nearest replica, while writes continue to flow to the primary region.

**Phase 3 (Scale): Active-Active Multi-Region**
If the customer base requires it, active-active multi-region deployment is evaluated. This requires resolving write conflict resolution for the shared database — a significant architectural investment that is deferred until the data shows it is necessary. The platform's module boundaries and Brand-level data isolation are explicitly designed to make active-active feasible: most write conflicts are within a single Brand, and Brands can be pinned to a home region.

---

### 20.6 Tenant Isolation and Noisy Neighbor Prevention

In a shared infrastructure model, a single large tenant's heavy workload can degrade performance for all other tenants. The following mechanisms prevent this:

**API Rate Limiting:**
Every Brand is subject to API rate limits enforced at the gateway layer. Default limits: 1,000 requests per minute per Brand, 100 requests per second per user. Limits are configurable per subscription plan — higher-tier plans receive higher limits. Rate limit violations return a `429 Too Many Requests` response with a `Retry-After` header.

**Import Batch Throttling:**
Import batch processing jobs are throttled per Brand: a maximum of 2 concurrent import jobs per Brand. Additional batches queue behind the active ones. This prevents a Brand uploading 50 large files simultaneously from exhausting worker capacity.

**Report Query Timeout:**
All report queries have a maximum execution time of 30 seconds. A query that exceeds this limit is cancelled and the user is shown a timeout error with a suggestion to narrow the date range or add more specific filters. This prevents runaway queries from monopolizing database connections.

**Large Tenant Isolation:**
Brands above a configured size threshold (determined by monthly active leads, orders, or API call volume) are flagged for dedicated infrastructure review. Options include: dedicated read replicas, dedicated job worker pools, or tenant-specific database shards. This decision is made by the Platform Owner on a case-by-case basis and is transparent to the Brand.

---

### 20.7 Observability Requirements

A system cannot scale reliably without comprehensive observability. The following telemetry is mandatory from day one.

**Metrics (time-series):**
- Request rate, error rate, and P50/P95/P99 latency per API endpoint.
- Database query execution time per query pattern.
- Cache hit/miss rate per cache key namespace.
- Background job throughput, failure rate, and queue depth per queue.
- Application instance CPU, memory, and open connection counts.

**Logs (structured):**
- All application logs are structured JSON, including: timestamp, log level, Brand ID (where applicable), request ID, user ID (where applicable), message, and any error details.
- Logs are shipped to a centralized log aggregation service in real-time.
- Log retention: 90 days in hot storage, 1 year in cold storage.

**Distributed Traces:**
Every request that spans multiple internal components (API → queue → worker → database) carries a trace ID. Traces are sampled at 5% in production (100% for error traces) and stored in a distributed tracing system.

**Alerting:**
All alert thresholds defined in Section 18.4 are implemented as automated alerts. Alert routing: critical alerts page the on-call engineer; warning alerts create tickets for next-business-day review. Alert fatigue is actively managed — a persistent alert that cannot be resolved is escalated or removed and replaced with a better signal.

---

*End of Section 20 — Scalability Principles*

---

**Document Status:** Sections 1–25 complete. This document is final.

---

## 21. Deployment Architecture

This section defines how OFS is built, tested, packaged, and delivered to production environments. Deployment architecture is a first-class product concern — a platform that cannot be deployed reliably and quickly cannot serve its customers reliably.

---

### 21.1 Infrastructure Model

OFS runs on cloud infrastructure using a managed services model. The platform team manages application code and configuration; the cloud provider manages the underlying compute, storage, and networking hardware.

**Core Infrastructure Components:**

| Component | Role | Managed By |
|---|---|---|
| Container Orchestration | Run and scale application containers | Cloud provider (managed Kubernetes or equivalent) |
| Relational Database | PostgreSQL primary and read replicas | Cloud provider (managed database service) |
| In-Memory Cache | Redis cluster | Cloud provider (managed Redis service) |
| Object Storage | File uploads, export artifacts, import source files | Cloud provider (S3-compatible object storage) |
| Background Job Queue | Async job processing | Cloud provider (managed queue service) or self-hosted within cluster |
| CDN | Static asset delivery, edge caching | Cloud provider CDN |
| Load Balancer | HTTPS termination, traffic distribution across app instances | Cloud provider |
| Secret Store | Runtime secrets injection | Cloud provider secret manager |
| Log Aggregation | Structured log collection and search | Managed log service |
| Metrics and Alerting | Time-series metrics, dashboards, alert routing | Managed monitoring service |

**Deployment Region — Launch:**
Gulf region (UAE or Saudi Arabia data center) as the primary region, chosen to minimize latency for the initial customer base and satisfy data residency requirements common in the GCC market.

---

### 21.2 Container Architecture

Every application component runs in a container. There are no bare-metal processes. Container images are immutable — the same image built and tested in CI is the image deployed to production without modification.

**Container Images:**

| Image | Contents | Scaling Axis |
|---|---|---|
| `ofs-api` | Backend API server | Horizontal (stateless) |
| `ofs-worker` | Background job workers | Horizontal (per queue priority) |
| `ofs-scheduler` | Cron-like scheduled jobs (report schedules, token cleanup) | Single instance |
| `ofs-migrate` | Database migration runner | Job (runs once per deployment) |
| `ofs-web` | Frontend static build served via nginx | CDN-fronted; minimal compute |

Workers for different queue priority tiers run in separate container instances. Critical queue workers are never co-located with low-priority reporting workers — a surge in report generation cannot starve the critical queue.

---

### 21.3 Deployment Pipeline

Every code change passes through a linear pipeline before reaching production. Skipping stages is not permitted except under a declared incident with full post-incident review.

```
Developer pushes to feature branch
        │
        ▼
┌─────────────────────────────┐
│  CI: AUTOMATED CHECKS       │
│  — TypeScript compilation   │
│  — Unit tests               │
│  — Integration tests        │
│  — Dependency vulnerability │
│    scan                     │
│  — Static analysis (SQL     │
│    injection, XSS linting)  │
│  — Docker image build       │
└──────────────┬──────────────┘
               │ All checks pass
               ▼
┌─────────────────────────────┐
│  STAGING DEPLOYMENT         │
│  — Auto-deployed to staging │
│  — Database migrations run  │
│  — Smoke tests execute      │
│  — Performance benchmark    │
│    against staging data      │
└──────────────┬──────────────┘
               │ Manual approval (or auto for non-critical changes)
               ▼
┌─────────────────────────────┐
│  PRODUCTION DEPLOYMENT      │
│  — Rolling update           │
│  — Database migrations run  │
│    (backward-compatible)    │
│  — Health checks verified   │
│  — Traffic shifted          │
│    progressively            │
│  — Automated rollback if    │
│    error rate spike detected│
└─────────────────────────────┘
```

**Deployment Frequency Target:** Multiple deployments per day are achievable. The pipeline is optimized to complete from push to staging in under 10 minutes and from staging approval to production in under 5 minutes.

**Automated Rollback:**
Production deployments are monitored for 10 minutes post-deployment. If the error rate (5xx responses) exceeds 1% of requests during this window, the deployment is automatically rolled back to the previous known-good image. The on-call engineer is notified immediately.

---

### 21.4 Database Migration Policy

Database migrations are one of the highest-risk activities in the deployment pipeline. The following policy makes them safe:

**Backward Compatibility Requirement:**
Every migration must be backward-compatible with the version of application code that was running immediately before it. This means:
- Adding a new column is safe (old code ignores it).
- Adding a new table is safe.
- Removing a column requires a two-phase deployment: first deploy application code that no longer references the column; then deploy the migration that drops it.
- Renaming a column requires a three-phase deployment: add the new column, deploy code that writes to both columns, backfill the new column, deploy code that reads only the new column, drop the old column.

**Migration Verification:**
Every migration is tested against a production data snapshot in the staging environment before being deployed to production. The test measures migration execution time — a migration that takes longer than 60 seconds against the production data volume requires a non-blocking implementation strategy (e.g., adding a column with a default value then backfilling in a background job).

**Zero-Downtime Migrations:**
Migrations that would lock tables for more than 1 second are not acceptable. PostgreSQL concurrent index creation, shadow table techniques, and application-layer backfills are used to achieve zero-downtime schema changes on high-traffic tables.

---

### 21.5 Disaster Recovery

**Recovery Point Objective (RPO):** 1 hour. The maximum acceptable data loss in the event of a catastrophic failure is 1 hour of transactions.

**Recovery Time Objective (RTO):** 4 hours. The maximum acceptable time from incident declaration to full service restoration.

**Backup Strategy:**
- Continuous WAL (Write-Ahead Log) archiving to object storage, enabling point-in-time recovery to any second within the retention window.
- Daily full database snapshots retained for 30 days.
- Weekly full snapshots retained for 1 year.
- Backups are stored in a different availability zone from the primary database and, for daily/weekly snapshots, in a separate cloud region.

**Recovery Drills:**
Disaster recovery procedures are tested by performing a full restore to an isolated environment once per quarter. The test validates both the technical restore process and the RTO target. Results are documented. Any procedure that fails to meet the RTO target is improved before the next drill.

---

## 22. Environment Strategy

OFS maintains four distinct environments. Each environment has a defined purpose, a defined audience, and defined rules about what data it may contain.

---

### 22.1 Environment Definitions

| Environment | Purpose | Audience | Data Policy |
|---|---|---|---|
| **Development** | Local developer machines for feature work and debugging | Individual developers | Synthetic/seeded data only. No real customer data. |
| **Staging** | Pre-production integration testing, QA, and deployment rehearsal | Developers, QA, product team | Anonymized production snapshot or seeded data. No real customer data. |
| **UAT (User Acceptance Testing)** | Customer-facing preview for Brand Admins to test configurations before production rollout | Invited Brand Admins, internal product team | Isolated tenant data created by the Brand Admin. No other customer data. |
| **Production** | Live platform serving real customers | All active users | Real customer data. Strictest access controls. |

---

### 22.2 Environment Promotion Rules

Code and configuration move in one direction only: Development → Staging → Production. There is no mechanism for moving code from Production back to Staging or Development.

**What is promoted:** Container images (immutable, tagged by git commit hash). Database migrations (versioned and sequential). Configuration values (injected via environment variables, never embedded in images).

**What is never promoted:** Data. Production data never flows to Staging or Development. The reverse is equally forbidden — data created in Staging is never imported to Production.

---

### 22.3 Feature Flags

Feature flags decouple code deployment from feature activation. A feature may be fully deployed to production (in the codebase, passing all tests) but activated only for a subset of Brands or users.

**Use Cases for Feature Flags:**
- Gradual rollout of a major new feature (e.g., activate for 10% of Brands, monitor for issues, expand to 100%).
- Enabling experimental features for specific Brand Admins who have opted in to early access.
- Emergency kill switch: a feature flag can deactivate a specific feature in production within seconds if it is causing incidents, without a full redeployment.

**Feature Flag Discipline:**
Feature flags are temporary. Every flag has a defined removal date — the date by which the feature is expected to be fully rolled out and the flag removed from the codebase. Flags are not permanent configuration. A flag that has been at 100% rollout for more than 30 days must be removed in the next sprint.

---

### 22.4 Configuration Management

**Environment Variables:**
All environment-specific configuration (database connection strings, Redis URLs, API keys for third-party services, log levels) is injected via environment variables at container startup. There are no configuration files committed to the repository that contain environment-specific values.

**Configuration Validation on Startup:**
On startup, every application container validates that all required environment variables are present and well-formed. A container that fails validation refuses to start and emits a clear error message identifying the missing or malformed variable. This prevents partially-configured instances from serving traffic.

---

## 23. Future Expansion Strategy

OFS is designed as a foundation. The modules and capabilities defined in this blueprint are not the ceiling of the platform — they are the first layer. This section defines the expansion roadmap, organized by strategic priority and sequencing logic.

---

### 23.1 Expansion Principles

Every future capability added to OFS must satisfy three criteria before it is committed to the roadmap:

1. **It serves the core customer.** The expansion must address a real, validated need of the platform's target customer (growing Arabic-speaking businesses) — not a feature added for competitive checkbox reasons.

2. **It integrates with the existing data model.** A new module or capability is not a bolt-on. It must share the existing Customer, Product, Branch, and Accounting data models. Any expansion that requires a parallel data model is a product architecture failure, not a feature.

3. **It does not degrade existing module performance.** New tables, new background jobs, and new API endpoints introduced by an expansion must be profiled against the performance benchmarks in Section 18 before release.

---

### 23.2 Tier 1 Expansions — High Priority

These expansions address the most frequently expressed customer needs adjacent to the current platform scope. They are natural extensions of existing modules and are achievable without architectural changes.

#### 23.2.1 Payroll Module

**What:** A full payroll calculation and disbursement engine integrated with the HR module.

**Why:** The HR module as defined in this blueprint stores employee data and structure but does not calculate salaries. For businesses that have adopted OFS for HR, the absence of payroll creates a gap — payroll data must be managed in a separate tool and then manually posted to accounting. Payroll closes this gap.

**Key Capabilities:**
- Salary structure configuration (base salary, allowances, deductions by type).
- Payroll run generation: calculate net pay for all active employees for a pay period.
- Deduction management: social insurance, income tax (where applicable), loans, and advances.
- Payroll journal entry auto-generation: debit salary expense accounts, credit employee payable accounts.
- Payroll payment batch: generate bank transfer instructions for payroll disbursement.
- Payslip generation: formatted, employee-accessible payslips.
- WPS (Wage Protection System) file generation for UAE and Saudi Arabia compliance.

**Integration Points:** HR module (employee records, salary structures), Accounting module (payroll journal entries), Bank integration (payment batch export).

---

#### 23.2.2 Leave and Attendance Management

**What:** Employee leave request, approval, and balance tracking; attendance recording and absent day deduction.

**Why:** Leave management is tightly coupled with payroll. Unpaid absences, leave encashments, and leave balance provisions all affect payroll calculations. Without leave management, payroll requires manual input of absence data — a high-error process.

**Key Capabilities:**
- Leave types configuration (annual, sick, unpaid, emergency — configurable per Brand).
- Leave request and approval workflow.
- Leave balance accrual (automatic monthly accrual based on entitlement rules).
- Attendance import (from biometric devices or manual entry).
- Absence calculation feeding directly into payroll deductions.
- Leave reports: balance by employee, utilization by team, compliance with labor law minimums.

---

#### 23.2.3 Customer Portal

**What:** A read-only self-service portal where customers can view their orders, invoices, payment history, and outstanding balances.

**Why:** Customer Care Agents spend significant time answering status inquiries. A self-service portal reduces this workload while improving the customer experience. It also reduces the volume of inbound calls during peak periods (e.g., post-holiday order surges).

**Key Capabilities:**
- Customer authentication via phone number + OTP (no password required).
- Order history and current order status.
- Invoice download (PDF).
- Payment history and outstanding balance.
- Complaint submission (creates a support case in OFS automatically).
- Arabic-first interface, fully RTL.

**Integration Points:** CRM module (customer identity), Sales module (orders, invoices), Accounting module (payment history, balances).

---

#### 23.2.4 Budgeting Module

**What:** Department and project-level budget definition, with actual-vs-budget tracking integrated into financial reporting.

**Why:** Finance Managers and General Managers currently have no way to define budget targets within OFS and compare actuals against them. They export financial data and build budget comparisons in spreadsheets — precisely the workflow OFS is designed to eliminate.

**Key Capabilities:**
- Budget creation by account, department, branch, and period.
- Budget versioning (original budget, revised budget).
- Actual vs. budget comparison reports with variance calculations.
- Budget alert: notification when actual spend reaches a configured percentage of the budget.
- Budget import via Import Center.

---

### 23.3 Tier 2 Expansions — Medium Priority

These expansions extend the platform's reach into adjacent capabilities. They require more significant new surface area and are sequenced after Tier 1.

#### 23.3.1 Multi-Currency Consolidation Reporting

Multi-currency consolidation allows a Brand with Companies operating in different currencies to produce consolidated financial statements with all figures translated to a single reporting currency.

**Key Capabilities:**
- Reporting currency configuration at Brand level.
- Translation rate configuration: closing rate for balance sheet items, average rate for income statement items.
- Consolidated P&L, Balance Sheet, and Cash Flow with inter-company eliminations.
- Translation difference account for unrealized FX movements.

---

#### 23.3.2 E-Commerce Integration Layer

A structured integration layer that allows OFS to receive orders from external e-commerce platforms (Salla, Zid, WooCommerce, Shopify) and pass them directly into the Import Center pipeline.

**Architecture:** Inbound webhooks from e-commerce platforms trigger an automatic Import Batch creation. The batch passes through the standard Import Center validation and approval pipeline — there is no "direct write" path. The e-commerce integration produces batches; the Import Center governs what enters the database.

---

#### 23.3.3 WhatsApp Business Integration

WhatsApp is the dominant customer communication channel in the GCC market. This integration allows Customer Care Agents to send and receive WhatsApp messages from within the OFS interface, with all conversations logged to the CRM Communication Log.

**Key Capabilities:**
- Inbound message routing to the assigned Customer Care Agent.
- Outbound message composition from the CRM or Order screen.
- Message templates for common communications (order confirmation, delivery notification, payment receipt).
- Full conversation history on the customer record.
- Unread message count in the platform notification system.

---

#### 23.3.4 Document Management

A structured document repository for storing and retrieving business documents: contracts, supplier agreements, compliance certificates, and product documentation. Documents are linked to the relevant entity (supplier, customer, employee, product) and are subject to the same scope-based access control as all other platform data.

---

#### 23.3.5 Advanced Analytics and Custom Reporting

A report builder interface that allows Brand Admins and Finance Managers to create custom reports by selecting dimensions and measures from a pre-defined semantic layer — without writing SQL or requiring developer involvement.

**Architecture:** A semantic layer maps database tables and columns to business-friendly names (e.g., `leads.created_at` → "Lead Import Date"). The report builder operates against this semantic layer exclusively. Raw table access is not exposed to the report builder. This prevents users from constructing queries that bypass the permission model.

---

### 23.4 Tier 3 Expansions — Long-Term

These expansions represent significant platform evolution and are scoped for a later stage when the core platform has achieved market fit and operational stability.

| Expansion | Description |
|---|---|
| **Mobile Native App** | Dedicated iOS and Android applications for Sales Agents and Customer Care Agents. Offline capability for lead follow-up in low-connectivity environments. |
| **AI-Assisted Lead Scoring** | Machine learning model trained on historical lead data to predict conversion probability. Surfaced as a score on each lead to help agents prioritize. |
| **Automated Payment Reconciliation** | Bank statement import with AI-assisted matching of bank transactions to accounting payment records. Reduces manual reconciliation time. |
| **Open API for Third-Party Integration** | A documented, versioned public API allowing Brands to build their own integrations and connect OFS to tools not supported natively. |
| **White-Label Platform** | The ability for large enterprise customers or resellers to deploy OFS under their own brand identity — custom domain, custom logo, custom color system — on dedicated infrastructure. |
| **Multi-Language UI** | English-language UI as a first-class supported language (not a secondary translation). Additional language support (French for North African markets) as a subsequent expansion. |

---

### 23.5 Expansion Governance

Every expansion follows a defined governance process before development begins:

1. **Problem Statement:** A one-page document describing the customer problem being solved, the evidence for its existence, and the size of the opportunity. No development begins without a validated problem statement.
2. **Blueprint Addendum:** A section added to this blueprint document defining the new module or capability's scope, workflows, business rules, and cross-module integration points. The blueprint is the source of truth — it is updated before implementation, not after.
3. **Performance Impact Assessment:** An analysis of the expansion's impact on existing module performance. Any expansion that degrades existing P95 targets requires architecture review before proceeding.
4. **Rollout Plan:** A phased rollout plan using feature flags, with defined metrics for each phase and explicit rollback criteria.

---

## 24. Non-Negotiable Rules

This section is a distillation of the platform's most critical constraints — the rules that cannot be compromised under any circumstances, including delivery pressure, customer requests, or technical convenience. Any implementation decision that violates a rule in this section must be escalated to the product architect and documented as a formal exception with a remediation plan.

These rules exist because their violation has historically caused catastrophic failures in financial systems, and because the cost of enforcing them from the start is far lower than retrofitting them after the platform is in production.

---

### 24.1 Data Rules

**NR-D-01 — Nothing Enters Without Validation**
No record in any module may be created through bulk ingestion without passing through the Import Center's full validate → approve → commit pipeline. No exceptions. No "fast path" imports. No admin backdoors. Validation is not optional for any import type.

**NR-D-02 — No Hard Deletes on Operational Data**
Financial records, lead records, order records, audit log entries, and journal entries are never hard-deleted from the database in any operational context. Soft deletes only. The `deleted_at` column is set; the row is never removed.

**NR-D-03 — Audit Logs Are Immutable**
No application code, no migration, no admin tool, and no emergency procedure may delete or modify an audit log entry. Audit logs are append-only. A request to delete audit logs — regardless of the stated reason — is refused.

**NR-D-04 — Sequence Numbers Are Never Recycled**
A document number (invoice, order, journal entry) once assigned to a record is the permanent identifier of that record. If the record is cancelled or deleted, the number is retired, not reused. The sequence always advances; it never resets within a fiscal year unless explicitly configured at year-end, and even then the prior year's numbers are immutably associated with their records.

---

### 24.2 Financial Rules

**NR-F-01 — Double Entry Is Enforced at the Database Layer**
The constraint that debits must equal credits on every journal entry is not only validated in application code — it is enforced by a database check constraint. An entry that does not balance cannot be written to the database by any path: application, migration, admin tool, or direct database access.

**NR-F-02 — Closed Periods Cannot Be Reopened Without Explicit Authorization**
Once a period is closed, it is closed. Re-opening a closed accounting period requires an action logged to the audit trail with the Finance Manager's credentials. There is no "quietly re-open" operation. Every re-opening is visible in the audit log and generates a notification to the Brand Admin.

**NR-F-03 — No Auto-Post**
Journal entries are never posted to the ledger automatically without passing through a human review step. Auto-generated entries (from sales, purchasing, expenses) arrive in the accountant's review queue in draft state. A human must explicitly post them. There are no exceptions, including entries below a threshold amount.

**NR-F-04 — Self-Approval Is Architecturally Blocked**
The approval workflow engine must enforce at the code level that the user who submitted a record cannot approve it, regardless of the roles they hold. If a workflow step is configured with an approver role and the submitter holds that role, the system must route to the next level of authority or block the approval entirely. This constraint is not enforced by policy — it is enforced by the workflow engine's execution logic.

---

### 24.3 Security Rules

**NR-S-01 — Scope Violations Return 404, Not 403**
A request for a record that is outside the requesting user's scope must return `404 Not Found`, not `403 Forbidden`. Returning 403 confirms the record exists, enabling enumeration attacks. The application must be architecturally incapable of confirming the existence of a record to a user who is not within its scope.

**NR-S-02 — No Secrets in Source Code**
No password, API key, database credential, encryption key, or token is committed to any source code repository — including private repositories. All secrets are injected at runtime. A pre-commit hook that blocks credential patterns is a mandatory part of the developer toolchain.

**NR-S-03 — MFA Cannot Be Bypassed for Financial Roles**
Multi-factor authentication for Accountant, Finance Manager, and Brand Admin roles has no bypass path. There is no "remember this device," no grace period, no admin override that skips MFA. A user in one of these roles without a configured MFA device cannot access the platform.

**NR-S-04 — Brand Data Isolation Is Absolute**
No request, no query, no report, no support tool, and no admin action may expose one Brand's data to a user authenticated under a different Brand. This is enforced at three independent layers (application scope check, row-level security, response serialization) so that a failure in any one layer is caught by the others.

---

### 24.4 Architecture Rules

**NR-A-01 — No Cross-Module Direct Database Queries**
A module's business logic may only access its own database tables directly. Cross-module data access is always through the other module's internal service interface. The Accounting module does not query the `leads` table directly; it calls the Lead service's interface. This rule preserves module independence and makes future extraction of modules into separate services feasible.

**NR-A-02 — The Import Center Is the Only Bulk Write Path**
No background job, no API endpoint, and no admin tool may write bulk records to the database without going through the Import Center's validation and approval pipeline. The Import Center is not a UI wrapper around a bulk insert — it is the gatekeeper. Any code path that writes more than one record at a time without going through it is a violation of this rule.

**NR-A-03 — All Configuration Is Data, Not Code**
Lead statuses, order statuses, expense categories, approval workflows, role permissions, and module activation states are stored in the database and managed through the UI. They are not environment variables, not configuration files, and not code constants. A change to a status label or the addition of a new expense category must never require a code deployment.

**NR-A-04 — Performance Targets Are Acceptance Criteria**
A feature that does not meet the performance targets defined in Section 18 at the specified benchmark data volumes is not complete. It may not be released to production. Performance testing against representative data volumes is a required step in every feature's development cycle, not an optional post-release activity.

---

### 24.5 Product Rules

**NR-P-01 — Arabic Is Always the Primary Language**
No feature, no screen, no error message, and no notification may be released with an English-only implementation on the grounds that Arabic translation is pending. Arabic is the primary language. An English-only feature is an incomplete feature.

**NR-P-02 — RTL Is Always Tested Before Release**
No UI feature may be released without being tested and verified in RTL layout at all three responsive breakpoints (mobile, tablet, desktop). A feature that works correctly in LTR but breaks in RTL is an incomplete feature. RTL testing is a mandatory step in the QA checklist, not an optional enhancement pass.

**NR-P-03 — Every Table Has Pagination, Bulk Actions, and Empty States**
These three features are not optional for any table in the platform. A table without pagination, a table without bulk actions on a resource that can be acted upon, or a table without a designed empty state is an incomplete feature.

**NR-P-04 — No Feature Without a Designed Empty State**
Every view, every list, and every data-dependent component must have a designed empty state before it is released. A blank white area where data would appear is not an empty state.

---

## 25. Final Architecture Summary

This section provides a concise, authoritative reference of the OFS platform's complete architectural identity — a single-page summary that any engineer, designer, or stakeholder can read to understand what OFS is and how it works.

---

### 25.1 What OFS Is

OFS (Operations & Financial System) is a **multi-tenant, Arabic-first, modular SaaS platform** that unifies CRM, Lead Management, Sales, Purchasing, Inventory, Accounting, Expenses, HR, and Reporting into a single product. It is designed for growing Arabic-speaking businesses that have outgrown spreadsheets and disconnected tools but are not ready for a multi-year ERP implementation.

---

### 25.2 Organizational Hierarchy

```
Platform Owner  →  Brand  →  Company  →  Branch  →  Users
```

Data is scoped to Brand. Financial records belong to Company. Operations are executed at Branch level. Users are assigned to one or more Branches within one or more Companies within a Brand.

---

### 25.3 Access Control Model

**Two-axis model:** RBAC (what you can do) × Scope (which data you can do it to). Both must pass for any operation to succeed. Scope violations return 404, not 403. Role hierarchy: Platform Owner → Brand Admin → General Manager → Team Manager → (Sales Agent | Customer Care Agent | Support Agent | Accountant | Finance Manager).

---

### 25.4 The Central Data Flow

```
External Source → Import Center → Validate → Approve → Lead Pool
→ Assign → Agent Follow-up → Order Creation → Fulfillment
→ Payment Recording → Accounting Entry Review → Post to Ledger
→ Financial Statements → Reports → Dashboard
```

Every step in this chain is auditable, reversible (where applicable), and scope-controlled.

---

### 25.5 Module Map

| Module | Primary Function | Feeds Into |
|---|---|---|
| Import Center | Bulk data ingestion gateway | All operational modules |
| CRM | Customer master data | Sales, Accounting |
| Sales | Lead lifecycle + order lifecycle | Inventory, Accounting |
| Purchasing | Supplier orders + goods receipt | Inventory, Accounting |
| Inventory | Stock levels + movements + valuation | Accounting |
| Expenses | Employee expense capture + approval | Accounting |
| Accounting | Double-entry ledger + financial statements | Reports |
| HR | Employee records + org structure | Sales (assignment), Expenses |
| Reports | Cross-module analytics | Dashboard |
| Settings | Configuration control plane | All modules |
| Dashboard | Situational awareness hub | All modules (read) |

---

### 25.6 Core Technical Stack

| Layer | Decision |
|---|---|
| Frontend | React + TypeScript |
| State Management | React Query (server state) + React Context (UI state) |
| Backend | Modular monolith, API-first |
| API Style | RESTful JSON |
| Database | PostgreSQL with row-level security |
| Multi-Tenancy | Shared schema, brand_id on every row, RLS enforcement |
| Cache | Redis (application cache) + CDN (static assets) |
| Background Jobs | Priority-tiered queue with dedicated workers per tier |
| File Storage | S3-compatible object storage, signed URL access |
| Auth | JWT (15-min) + HttpOnly refresh token (30-day) + TOTP MFA |

---

### 25.7 The Five Design Constraints

These five constraints define OFS's identity. Every product and engineering decision must be evaluated against them.

| # | Constraint | What It Means in Practice |
|---|---|---|
| 1 | **Arabic First** | Arabic is designed first. English is derived. RTL is the default. Rubik is the typeface. Every release is tested in Arabic before it ships. |
| 2 | **Nothing Enters Without Validation** | The Import Center is the only bulk write path. No data bypasses validate → approve → commit. Ever. |
| 3 | **Every Number Is Traceable** | Every financial figure can be drilled to its source transaction, its journal entry, its import batch, and its originating file. |
| 4 | **Configuration Is Data** | Statuses, categories, workflows, roles, and permissions are database records managed in the UI. Code deployments are never required to change business configuration. |
| 5 | **Performance Is an Acceptance Criterion** | A feature that misses its P95 target is incomplete. Sub-second dashboards, sub-300ms API responses, and zero N+1 queries are non-negotiable. |

---

### 25.8 Non-Negotiable Rule Index

| Code | Rule | Section |
|---|---|---|
| NR-D-01 | Nothing enters without validation | 24.1 |
| NR-D-02 | No hard deletes on operational data | 24.1 |
| NR-D-03 | Audit logs are immutable | 24.1 |
| NR-D-04 | Sequence numbers are never recycled | 24.1 |
| NR-F-01 | Double entry enforced at DB layer | 24.2 |
| NR-F-02 | Closed periods require explicit authorization to reopen | 24.2 |
| NR-F-03 | No auto-post | 24.2 |
| NR-F-04 | Self-approval is architecturally blocked | 24.2 |
| NR-S-01 | Scope violations return 404 | 24.3 |
| NR-S-02 | No secrets in source code | 24.3 |
| NR-S-03 | MFA cannot be bypassed for financial roles | 24.3 |
| NR-S-04 | Brand data isolation is absolute | 24.3 |
| NR-A-01 | No cross-module direct DB queries | 24.4 |
| NR-A-02 | Import Center is the only bulk write path | 24.4 |
| NR-A-03 | All configuration is data, not code | 24.4 |
| NR-A-04 | Performance targets are acceptance criteria | 24.4 |
| NR-P-01 | Arabic is always the primary language | 24.5 |
| NR-P-02 | RTL is always tested before release | 24.5 |
| NR-P-03 | Every table has pagination, bulk actions, and empty states | 24.5 |
| NR-P-04 | No feature without a designed empty state | 24.5 |

---

### 25.9 Document Ownership and Maintenance

This blueprint is a living document for the duration of the platform's active development. It is updated — not replaced — as the platform evolves.

**Ownership:** The product architect is the owner of this document. No section may be changed without the architect's review.

**Update Protocol:**
- A new module or major capability requires a new section or subsection before implementation begins.
- A change to a business rule, a workflow, or a non-negotiable constraint requires an explicit revision entry and must be reviewed by both the product architect and the Finance Manager role representative.
- Minor clarifications and corrections may be committed directly with a note in the document's version history.

**Version History:**

| Version | Date | Author | Summary |
|---|---|---|---|
| 1.0.0 | 2026-05-23 | System Blueprint | Initial complete document — Sections 1–25 |

---

*End of Document — OFS System Blueprint v1.0.0*

---

> "Build it right. Build it once. Build it in Arabic."
