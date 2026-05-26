import { PrismaClient, RoleCode, ScopeType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES: Array<{ code: RoleCode; nameAr: string; nameEn: string; scopeType: ScopeType }> = [
  { code: RoleCode.PLATFORM_OWNER,      nameAr: 'مالك المنصة',        nameEn: 'Platform Owner',       scopeType: ScopeType.GLOBAL  },
  { code: RoleCode.ADMIN,               nameAr: 'مدير النظام',         nameEn: 'Admin',                scopeType: ScopeType.BRAND   },
  { code: RoleCode.GENERAL_MANAGER,     nameAr: 'المدير العام',        nameEn: 'General Manager',      scopeType: ScopeType.COMPANY },
  { code: RoleCode.TEAM_MANAGER,        nameAr: 'مدير الفريق',         nameEn: 'Team Manager',         scopeType: ScopeType.BRANCH  },
  { code: RoleCode.SALES_AGENT,         nameAr: 'مندوب مبيعات',        nameEn: 'Sales Agent',          scopeType: ScopeType.BRANCH  },
  { code: RoleCode.CUSTOMER_CARE_AGENT, nameAr: 'موظف خدمة العملاء',  nameEn: 'Customer Care Agent',  scopeType: ScopeType.BRANCH  },
  { code: RoleCode.SUPPORT_AGENT,       nameAr: 'موظف الدعم الفني',    nameEn: 'Support Agent',        scopeType: ScopeType.BRANCH  },
  { code: RoleCode.ACCOUNTANT,          nameAr: 'محاسب',               nameEn: 'Accountant',           scopeType: ScopeType.BRANCH  },
  { code: RoleCode.FINANCE_MANAGER,     nameAr: 'مدير مالي',           nameEn: 'Finance Manager',      scopeType: ScopeType.BRANCH  },
];

const BASE_PERMISSIONS: Array<{ resource: string; action: string; description: string }> = [
  // Users
  { resource: 'users', action: 'create',  description: 'Create a new user' },
  { resource: 'users', action: 'read',    description: 'View user details' },
  { resource: 'users', action: 'update',  description: 'Update user data' },
  { resource: 'users', action: 'delete',  description: 'Deactivate a user' },
  // Roles & Permissions
  { resource: 'roles', action: 'create',  description: 'Create a role' },
  { resource: 'roles', action: 'read',    description: 'View roles' },
  { resource: 'roles', action: 'assign',  description: 'Assign role to user' },
  { resource: 'roles', action: 'revoke',  description: 'Revoke role from user' },
  // Brands
  { resource: 'brands', action: 'create', description: 'Create a brand' },
  { resource: 'brands', action: 'read',   description: 'View brands' },
  { resource: 'brands', action: 'update', description: 'Update brand' },
  { resource: 'brands', action: 'delete', description: 'Archive a brand' },
  // Companies
  { resource: 'companies', action: 'create', description: 'Create a company' },
  { resource: 'companies', action: 'read',   description: 'View companies' },
  { resource: 'companies', action: 'update', description: 'Update company' },
  { resource: 'companies', action: 'delete', description: 'Archive a company' },
  // Branches
  { resource: 'branches', action: 'create', description: 'Create a branch' },
  { resource: 'branches', action: 'read',   description: 'View branches' },
  { resource: 'branches', action: 'update', description: 'Update branch' },
  { resource: 'branches', action: 'delete', description: 'Archive a branch' },
  // Orders
  { resource: 'orders', action: 'create',  description: 'Create an order' },
  { resource: 'orders', action: 'read',    description: 'View orders' },
  { resource: 'orders', action: 'update',  description: 'Update an order' },
  { resource: 'orders', action: 'delete',  description: 'Cancel an order' },
  { resource: 'orders', action: 'export',  description: 'Export orders report' },
  // Reports
  { resource: 'reports', action: 'read',   description: 'View reports' },
  { resource: 'reports', action: 'export', description: 'Export reports' },
  // Finance
  { resource: 'finance', action: 'read',   description: 'View financial data' },
  { resource: 'finance', action: 'manage', description: 'Manage financial records' },
];

async function main() {
  console.log('🌱 Starting seed...');

  // ── Tenant (dev) ──────────────────────────────────────────────────────────────
  const devTenant = await prisma.tenant.upsert({
    where: { subdomain: 'dev' },
    update: {},
    create: {
      name: 'Development Tenant',
      nameAr: 'مستأجر التطوير',
      subdomain: 'dev',
      isActive: true,
    },
  });
  console.log(`✔ Tenant: ${devTenant.subdomain}`);

  // ── Roles ─────────────────────────────────────────────────────────────────────
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { nameAr: role.nameAr, nameEn: role.nameEn, scopeType: role.scopeType },
      create: { ...role, isSystem: true, isActive: true },
    });
  }
  console.log(`✔ Roles: ${ROLES.length} seeded`);

  // ── Permissions ───────────────────────────────────────────────────────────────
  for (const perm of BASE_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: { description: perm.description },
      create: { ...perm, isActive: true },
    });
  }
  console.log(`✔ Permissions: ${BASE_PERMISSIONS.length} seeded`);

  // ── Platform Owner ────────────────────────────────────────────────────────────
  const platformOwnerRole = await prisma.role.findUniqueOrThrow({ where: { code: RoleCode.PLATFORM_OWNER } });
  const platformOwnerHash = await bcrypt.hash('Admin@1234', 12);

  const platformOwner = await prisma.user.upsert({
    where: { email: 'admin@ofs.io' },
    update: {},
    create: {
      email: 'admin@ofs.io',
      nameAr: 'مالك المنصة',
      nameEn: 'Platform Owner',
      passwordHash: platformOwnerHash,
      isActive: true,
      isVerified: true,
      userRoles: {
        create: {
          roleId: platformOwnerRole.id,
          scopeType: ScopeType.GLOBAL,
        },
      },
    },
  });
  console.log(`✔ Platform Owner: ${platformOwner.email}`);

  // ── Demo Brand ────────────────────────────────────────────────────────────────
  const demoBrand = await prisma.brand.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      nameAr: 'البراند التجريبي',
      nameEn: 'Demo Brand',
      slug: 'demo',
      isActive: true,
      settings: { plan: 'professional' },
    },
  });
  console.log(`✔ Demo Brand: ${demoBrand.slug}`);

  // ── Demo Company ──────────────────────────────────────────────────────────────
  const demoCompany = await prisma.company.upsert({
    where: { taxNumber: 'TAX-DEMO-0001' },
    update: {},
    create: {
      brandId: demoBrand.id,
      nameAr: 'الشركة التجريبية',
      nameEn: 'Demo Company',
      taxNumber: 'TAX-DEMO-0001',
      isActive: true,
    },
  });
  console.log(`✔ Demo Company: ${demoCompany.nameEn}`);

  // ── Demo Branch ───────────────────────────────────────────────────────────────
  let demoBranch = await prisma.branch.findFirst({
    where: { companyId: demoCompany.id, nameEn: 'Demo Main Branch' },
  });
  if (!demoBranch) {
    demoBranch = await prisma.branch.create({
      data: {
        companyId: demoCompany.id,
        nameAr: 'الفرع الرئيسي التجريبي',
        nameEn: 'Demo Main Branch',
        isActive: true,
      },
    });
  }
  console.log(`✔ Demo Branch: ${demoBranch.nameEn}`);

  // ── Demo Brand Owner ──────────────────────────────────────────────────────────
  const adminRole     = await prisma.role.findUniqueOrThrow({ where: { code: RoleCode.ADMIN } });
  const brandOwnerHash = await bcrypt.hash('Brand@1234', 12);

  const brandOwner = await prisma.user.upsert({
    where: { email: 'owner@demo.ofs' },
    update: {},
    create: {
      email: 'owner@demo.ofs',
      nameAr: 'مالك البراند التجريبي',
      nameEn: 'Demo Brand Owner',
      passwordHash: brandOwnerHash,
      isActive: true,
      isVerified: true,
      userRoles: {
        create: {
          roleId: adminRole.id,
          scopeType: ScopeType.BRAND,
          brandId: demoBrand.id,
        },
      },
    },
  });
  console.log(`✔ Brand Owner: ${brandOwner.email}`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!\n');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│           Seed Credentials               │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ Platform Owner                           │');
  console.log('│   Email:    admin@ofs.io                 │');
  console.log('│   Password: Admin@1234                   │');
  console.log('│   Login:    /platform/login              │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ Demo Brand Owner                         │');
  console.log('│   Email:    owner@demo.ofs               │');
  console.log('│   Password: Brand@1234                   │');
  console.log('│   Login:    /login                       │');
  console.log('└─────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
