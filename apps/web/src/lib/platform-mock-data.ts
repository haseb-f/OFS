// Platform Administration mock data — no backend, no API calls.

// ─── Types ──────────────────────────────────────────────────────────────────

export type BrandStatus  = 'active' | 'inactive' | 'suspended';
export type BrandPlan    = 'starter' | 'professional' | 'enterprise';
export type EntityStatus = 'active' | 'inactive';
export type UserStatus   = 'active' | 'inactive' | 'pending';
export type RoleScope    = 'platform' | 'brand' | 'company' | 'branch';

export interface PlatformBrand {
  id: string;
  nameAr: string;
  code: string;
  status: BrandStatus;
  plan: BrandPlan;
  planExpiry: string;   // ISO date
  usersCount: number;
  companiesCount: number;
  createdAt: string;    // ISO date
}

export interface PlatformCompany {
  id: string;
  nameAr: string;
  code: string;
  brandId: string;
  brandNameAr: string;
  country: string;
  currency: string;
  status: EntityStatus;
}

export interface PlatformBranch {
  id: string;
  nameAr: string;
  code: string;
  companyId: string;
  companyNameAr: string;
  city: string;
  status: EntityStatus;
}

export interface PlatformUser {
  id: string;
  nameAr: string;
  email: string;
  roleCode: string;
  roleNameAr: string;
  brandNameAr?: string;
  companyNameAr?: string;
  branchNameAr?: string;
  status: UserStatus;
  lastLoginAt: string;  // ISO date
}

export interface PlatformRole {
  id: string;
  nameAr: string;
  code: string;
  scope: RoleScope;
  usersCount: number;
  descriptionAr: string;
}

export interface PermissionModule {
  id: string;
  nameAr: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
  };
}

// ─── Brands ─────────────────────────────────────────────────────────────────

export const mockPlatformBrands: PlatformBrand[] = [
  { id: 'br-001', nameAr: 'مجموعة الأفق التجارية',   code: 'AFAQ',    status: 'active',    plan: 'enterprise',    planExpiry: '2027-03-31', usersCount: 45, companiesCount: 3, createdAt: '2024-01-15' },
  { id: 'br-002', nameAr: 'شركة النخبة للتوزيع',     code: 'NUKHBA',  status: 'active',    plan: 'professional',  planExpiry: '2026-12-31', usersCount: 18, companiesCount: 2, createdAt: '2024-03-20' },
  { id: 'br-003', nameAr: 'مؤسسة الريادة الحديثة',   code: 'RIADA',   status: 'active',    plan: 'starter',       planExpiry: '2026-08-15', usersCount:  8, companiesCount: 1, createdAt: '2024-06-10' },
  { id: 'br-004', nameAr: 'مجموعة البناء والتطوير',   code: 'BINAA',   status: 'inactive',  plan: 'professional',  planExpiry: '2025-12-31', usersCount: 22, companiesCount: 2, createdAt: '2023-11-01' },
  { id: 'br-005', nameAr: 'شركة الإتقان للخدمات',    code: 'ITQAN',   status: 'active',    plan: 'enterprise',    planExpiry: '2027-06-30', usersCount: 67, companiesCount: 5, createdAt: '2023-08-15' },
  { id: 'br-006', nameAr: 'مؤسسة الابتكار الرقمي',   code: 'IBTIKAR', status: 'suspended', plan: 'starter',       planExpiry: '2025-03-31', usersCount:  4, companiesCount: 1, createdAt: '2024-09-01' },
];

// ─── Companies ───────────────────────────────────────────────────────────────

export const mockPlatformCompanies: PlatformCompany[] = [
  { id: 'co-001', nameAr: 'مجموعة الأفق — الرياض',    code: 'AFAQ-RUH',   brandId: 'br-001', brandNameAr: 'مجموعة الأفق التجارية',  country: 'المملكة العربية السعودية', currency: 'SAR', status: 'active'   },
  { id: 'co-002', nameAr: 'مجموعة الأفق — جدة',       code: 'AFAQ-JED',   brandId: 'br-001', brandNameAr: 'مجموعة الأفق التجارية',  country: 'المملكة العربية السعودية', currency: 'SAR', status: 'active'   },
  { id: 'co-003', nameAr: 'شركة النخبة — الرئيسية',   code: 'NUKHBA-HQ',  brandId: 'br-002', brandNameAr: 'شركة النخبة للتوزيع',    country: 'المملكة العربية السعودية', currency: 'SAR', status: 'active'   },
  { id: 'co-004', nameAr: 'مؤسسة الريادة',             code: 'RIADA-01',   brandId: 'br-003', brandNameAr: 'مؤسسة الريادة الحديثة',  country: 'المملكة العربية السعودية', currency: 'SAR', status: 'active'   },
  { id: 'co-005', nameAr: 'شركة الإتقان — الرياض',    code: 'ITQAN-RUH',  brandId: 'br-005', brandNameAr: 'شركة الإتقان للخدمات',   country: 'المملكة العربية السعودية', currency: 'SAR', status: 'active'   },
  { id: 'co-006', nameAr: 'شركة الإتقان — الدمام',    code: 'ITQAN-DAM',  brandId: 'br-005', brandNameAr: 'شركة الإتقان للخدمات',   country: 'المملكة العربية السعودية', currency: 'SAR', status: 'active'   },
  { id: 'co-007', nameAr: 'مجموعة البناء — الرياض',   code: 'BINAA-RUH',  brandId: 'br-004', brandNameAr: 'مجموعة البناء والتطوير', country: 'المملكة العربية السعودية', currency: 'SAR', status: 'inactive' },
];

// ─── Branches ────────────────────────────────────────────────────────────────

export const mockPlatformBranches: PlatformBranch[] = [
  { id: 'bn-001', nameAr: 'فرع الرياض الرئيسي', code: 'AFAQ-RUH-01',  companyId: 'co-001', companyNameAr: 'مجموعة الأفق — الرياض',  city: 'الرياض', status: 'active'   },
  { id: 'bn-002', nameAr: 'فرع العليا',           code: 'AFAQ-RUH-02',  companyId: 'co-001', companyNameAr: 'مجموعة الأفق — الرياض',  city: 'الرياض', status: 'active'   },
  { id: 'bn-003', nameAr: 'فرع جدة',              code: 'AFAQ-JED-01',  companyId: 'co-002', companyNameAr: 'مجموعة الأفق — جدة',    city: 'جدة',    status: 'active'   },
  { id: 'bn-004', nameAr: 'فرع النخبة الرئيسي',   code: 'NUKHBA-01',    companyId: 'co-003', companyNameAr: 'شركة النخبة — الرئيسية', city: 'الرياض', status: 'active'   },
  { id: 'bn-005', nameAr: 'فرع الريادة',           code: 'RIADA-01',     companyId: 'co-004', companyNameAr: 'مؤسسة الريادة',          city: 'الرياض', status: 'active'   },
  { id: 'bn-006', nameAr: 'فرع الإتقان — الرياض', code: 'ITQAN-RUH-01', companyId: 'co-005', companyNameAr: 'شركة الإتقان — الرياض', city: 'الرياض', status: 'active'   },
  { id: 'bn-007', nameAr: 'فرع الإتقان — الدمام', code: 'ITQAN-DAM-01', companyId: 'co-006', companyNameAr: 'شركة الإتقان — الدمام', city: 'الدمام', status: 'active'   },
  { id: 'bn-008', nameAr: 'فرع البناء',            code: 'BINAA-RUH-01', companyId: 'co-007', companyNameAr: 'مجموعة البناء — الرياض', city: 'الرياض', status: 'inactive' },
];

// ─── Users ───────────────────────────────────────────────────────────────────

export const mockPlatformUsers: PlatformUser[] = [
  { id: 'usr-001', nameAr: 'أحمد القحطاني',  email: 'a.qahtani@ofs.io',     roleCode: 'PLATFORM_OWNER',  roleNameAr: 'مالك المنصة',      status: 'active',   lastLoginAt: '2026-05-24' },
  { id: 'usr-002', nameAr: 'سارة الأحمد',    email: 's.ahmad@afaq.com',     roleCode: 'BRAND_OWNER',     roleNameAr: 'مالك براند',        brandNameAr: 'مجموعة الأفق التجارية', status: 'active',  lastLoginAt: '2026-05-24' },
  { id: 'usr-003', nameAr: 'خالد المنصور',   email: 'k.mansour@afaq.com',   roleCode: 'GENERAL_MANAGER', roleNameAr: 'مدير عام',          brandNameAr: 'مجموعة الأفق التجارية', companyNameAr: 'مجموعة الأفق — الرياض', status: 'active',  lastLoginAt: '2026-05-23' },
  { id: 'usr-004', nameAr: 'نورة الشمري',    email: 'n.shamri@nukhba.com',  roleCode: 'ACCOUNTANT',      roleNameAr: 'محاسب',             brandNameAr: 'شركة النخبة للتوزيع',   companyNameAr: 'شركة النخبة — الرئيسية', branchNameAr: 'فرع النخبة الرئيسي', status: 'active',  lastLoginAt: '2026-05-22' },
  { id: 'usr-005', nameAr: 'فيصل العتيبي',   email: 'f.otaibi@itqan.com',   roleCode: 'FINANCE_MANAGER', roleNameAr: 'مدير مالي',         brandNameAr: 'شركة الإتقان للخدمات',  status: 'active',  lastLoginAt: '2026-05-21' },
  { id: 'usr-006', nameAr: 'ريم الحربي',     email: 'r.harbi@riada.com',    roleCode: 'SALES_AGENT',     roleNameAr: 'مندوب مبيعات',     brandNameAr: 'مؤسسة الريادة الحديثة', companyNameAr: 'مؤسسة الريادة', branchNameAr: 'فرع الريادة', status: 'pending', lastLoginAt: '2026-05-10' },
  { id: 'usr-007', nameAr: 'محمد الزهراني',  email: 'm.zahrani@binaa.com',  roleCode: 'TEAM_MANAGER',    roleNameAr: 'مدير فريق',         brandNameAr: 'مجموعة البناء والتطوير', status: 'inactive', lastLoginAt: '2025-12-15' },
  { id: 'usr-008', nameAr: 'لمياء السعيد',   email: 'l.saeed@itqan.com',    roleCode: 'CUSTOMER_CARE',   roleNameAr: 'خدمة عملاء',        brandNameAr: 'شركة الإتقان للخدمات',  branchNameAr: 'فرع الإتقان — الرياض', status: 'active',  lastLoginAt: '2026-05-20' },
];

// ─── Roles ───────────────────────────────────────────────────────────────────

export const mockPlatformRoles: PlatformRole[] = [
  { id: 'role-01', nameAr: 'مالك المنصة',          code: 'PLATFORM_OWNER',  scope: 'platform', usersCount:  1, descriptionAr: 'صلاحيات كاملة على جميع البراندات والإعدادات' },
  { id: 'role-02', nameAr: 'مالك براند',            code: 'BRAND_OWNER',     scope: 'brand',    usersCount:  3, descriptionAr: 'إدارة كاملة لبراند محدد' },
  { id: 'role-03', nameAr: 'مدير عام',              code: 'GENERAL_MANAGER', scope: 'company',  usersCount:  5, descriptionAr: 'إدارة شركة بعينها' },
  { id: 'role-04', nameAr: 'مدير فريق',             code: 'TEAM_MANAGER',    scope: 'branch',   usersCount:  8, descriptionAr: 'إدارة فرع محدد' },
  { id: 'role-05', nameAr: 'مندوب مبيعات',          code: 'SALES_AGENT',     scope: 'branch',   usersCount: 24, descriptionAr: 'صلاحيات المبيعات والتحصيل' },
  { id: 'role-06', nameAr: 'خدمة عملاء',            code: 'CUSTOMER_CARE',   scope: 'branch',   usersCount: 12, descriptionAr: 'متابعة العملاء والطلبات' },
  { id: 'role-07', nameAr: 'دعم فني',               code: 'SUPPORT',         scope: 'branch',   usersCount:  6, descriptionAr: 'دعم النظام والمستخدمين' },
  { id: 'role-08', nameAr: 'محاسب',                 code: 'ACCOUNTANT',      scope: 'branch',   usersCount: 18, descriptionAr: 'إدخال القيود والتقارير المالية' },
  { id: 'role-09', nameAr: 'مدير مالي',             code: 'FINANCE_MANAGER', scope: 'company',  usersCount:  4, descriptionAr: 'اعتماد القيود والتقارير المالية' },
  { id: 'role-10', nameAr: 'مدير النظام',            code: 'SYSTEM_ADMIN',    scope: 'platform', usersCount:  2, descriptionAr: 'إدارة إعدادات النظام والبنية التحتية' },
];

// ─── Permission Modules (default state for Platform Owner role) ──────────────

export const defaultPermissionModules: PermissionModule[] = [
  { id: 'sales',      nameAr: 'المبيعات',              permissions: { view: true,  create: true,  edit: true,  delete: true,  approve: true,  export: true  } },
  { id: 'purchases',  nameAr: 'المشتريات',              permissions: { view: true,  create: true,  edit: true,  delete: true,  approve: true,  export: true  } },
  { id: 'inventory',  nameAr: 'المخزون',               permissions: { view: true,  create: true,  edit: true,  delete: false, approve: false, export: true  } },
  { id: 'accounting', nameAr: 'المحاسبة',              permissions: { view: true,  create: true,  edit: true,  delete: false, approve: true,  export: true  } },
  { id: 'hr',         nameAr: 'الموارد البشرية',        permissions: { view: true,  create: true,  edit: true,  delete: false, approve: true,  export: false } },
  { id: 'reports',    nameAr: 'التقارير',              permissions: { view: true,  create: false, edit: false, delete: false, approve: false, export: true  } },
  { id: 'import',     nameAr: 'الاستيراد',             permissions: { view: true,  create: true,  edit: false, delete: false, approve: true,  export: false } },
  { id: 'settings',   nameAr: 'الإعدادات',             permissions: { view: true,  create: true,  edit: true,  delete: true,  approve: false, export: false } },
  { id: 'admin',      nameAr: 'إدارة المنصة',           permissions: { view: true,  create: true,  edit: true,  delete: true,  approve: true,  export: true  } },
];

// ─── KPI aggregates ──────────────────────────────────────────────────────────

export const platformKpis = {
  totalBrands:     mockPlatformBrands.length,
  activeBrands:    mockPlatformBrands.filter(b => b.status === 'active').length,
  inactiveBrands:  mockPlatformBrands.filter(b => b.status !== 'active').length,
  totalCompanies:  mockPlatformCompanies.length,
  totalBranches:   mockPlatformBranches.length,
  totalUsers:      mockPlatformUsers.length,
  lastActivity:    '2026-05-24',
};
