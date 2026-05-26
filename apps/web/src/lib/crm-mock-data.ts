// CRM Module — Mock data only. No backend, no API calls.

export type CrmLeadStage =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'qualified'
  | 'proposal_sent'
  | 'won'
  | 'lost';

export type CrmLeadSource =
  | 'website'
  | 'referral'
  | 'social_media'
  | 'email_campaign'
  | 'cold_call'
  | 'trade_show'
  | 'other';

export type CrmActivityType =
  | 'call'
  | 'meeting'
  | 'whatsapp'
  | 'email'
  | 'visit'
  | 'followup';

export type CrmActivityStatus = 'scheduled' | 'completed' | 'cancelled';

export type CrmTaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type CrmTaskStatus = 'open' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';

export type CrmCustomerStatus = 'active' | 'inactive' | 'prospect' | 'churned';

// ── CRM Lead ──────────────────────────────────────────────────────────────────

export interface CrmLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  source: CrmLeadSource;
  assignedUser: string;
  assignedUserInitials: string;
  lastActivity: string;
  expectedValue: number;
  currency: string;
  stage: CrmLeadStage;
  city?: string;
  notes?: string;
  createdAt: string;
}

// ── CRM Activity ──────────────────────────────────────────────────────────────

export interface CrmActivity {
  id: string;
  type: CrmActivityType;
  subject: string;
  customerName: string;
  customerId: string;
  assignedUser: string;
  assignedUserInitials: string;
  date: string;
  status: CrmActivityStatus;
  notes?: string;
  duration?: number;
}

// ── CRM Task ──────────────────────────────────────────────────────────────────

export interface CrmTask {
  id: string;
  name: string;
  customerName: string;
  customerId: string;
  assignedUser: string;
  assignedUserInitials: string;
  priority: CrmTaskPriority;
  dueDate: string;
  status: CrmTaskStatus;
  description?: string;
}

// ── CRM Customer ──────────────────────────────────────────────────────────────

export interface CrmCustomer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  status: CrmCustomerStatus;
  assignedUser: string;
  assignedUserInitials: string;
  lastActivity: string;
  totalOrders: number;
  totalRevenue: number;
  currency: string;
}

// ── Label Maps ────────────────────────────────────────────────────────────────

export const STAGE_LABELS: Record<CrmLeadStage, string> = {
  new:           'جديد',
  contacted:     'تم التواصل',
  interested:    'مهتم',
  qualified:     'مؤهل',
  proposal_sent: 'تم إرسال العرض',
  won:           'مُغلق (فوز)',
  lost:          'مُغلق (خسارة)',
};

export const SOURCE_LABELS: Record<CrmLeadSource, string> = {
  website:        'الموقع الإلكتروني',
  referral:       'إحالة',
  social_media:   'وسائل التواصل',
  email_campaign: 'حملة بريدية',
  cold_call:      'اتصال بارد',
  trade_show:     'معرض تجاري',
  other:          'أخرى',
};

export const ACTIVITY_TYPE_LABELS: Record<CrmActivityType, string> = {
  call:     'مكالمة',
  meeting:  'اجتماع',
  whatsapp: 'واتساب',
  email:    'بريد إلكتروني',
  visit:    'زيارة',
  followup: 'متابعة',
};

export const ACTIVITY_STATUS_LABELS: Record<CrmActivityStatus, string> = {
  scheduled: 'مجدول',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const TASK_PRIORITY_LABELS: Record<CrmTaskPriority, string> = {
  low:      'منخفضة',
  medium:   'متوسطة',
  high:     'عالية',
  critical: 'حرجة',
};

export const TASK_STATUS_LABELS: Record<CrmTaskStatus, string> = {
  open:        'مفتوح',
  in_progress: 'قيد التنفيذ',
  waiting:     'في الانتظار',
  completed:   'مكتمل',
  cancelled:   'ملغي',
};

export const CRM_CUSTOMER_STATUS_LABELS: Record<CrmCustomerStatus, string> = {
  active:   'نشط',
  inactive: 'غير نشط',
  prospect: 'مرشح',
  churned:  'مفقود',
};

// ── Mock Leads ────────────────────────────────────────────────────────────────

export const mockCrmLeads: CrmLead[] = [
  {
    id: 'CL001',
    name: 'أحمد محمد الزهراني',
    phone: '0501234567',
    email: 'ahmed@zahrani.com',
    company: 'شركة الزهراني للتجارة',
    source: 'website',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    lastActivity: '24 May 2026',
    expectedValue: 45000,
    currency: 'SAR',
    stage: 'new',
    city: 'الرياض',
    createdAt: '20 May 2026',
  },
  {
    id: 'CL002',
    name: 'فيصل عبدالله الحربي',
    phone: '0552345678',
    email: 'faisal@harbi.com',
    company: 'مجموعة الحربي',
    source: 'referral',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    lastActivity: '23 May 2026',
    expectedValue: 120000,
    currency: 'SAR',
    stage: 'new',
    city: 'جدة',
    createdAt: '18 May 2026',
  },
  {
    id: 'CL003',
    name: 'نورة سالم البكري',
    phone: '0563456789',
    email: 'noura@example.com',
    source: 'social_media',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    lastActivity: '22 May 2026',
    expectedValue: 28000,
    currency: 'SAR',
    stage: 'contacted',
    city: 'الدمام',
    createdAt: '15 May 2026',
  },
  {
    id: 'CL004',
    name: 'خالد ناصر الشمري',
    phone: '0594567890',
    company: 'الشمري للمقاولات',
    source: 'cold_call',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    lastActivity: '21 May 2026',
    expectedValue: 75000,
    currency: 'SAR',
    stage: 'contacted',
    city: 'مكة',
    createdAt: '12 May 2026',
  },
  {
    id: 'CL005',
    name: 'منى عبدالرحمن العسيري',
    phone: '0505678901',
    email: 'mona@example.com',
    source: 'email_campaign',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    lastActivity: '20 May 2026',
    expectedValue: 35000,
    currency: 'SAR',
    stage: 'interested',
    city: 'الرياض',
    createdAt: '10 May 2026',
  },
  {
    id: 'CL006',
    name: 'عبدالعزيز يوسف الغامدي',
    phone: '0556789012',
    company: 'الغامدي للاستيراد',
    source: 'trade_show',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    lastActivity: '19 May 2026',
    expectedValue: 200000,
    currency: 'SAR',
    stage: 'interested',
    city: 'جدة',
    createdAt: '08 May 2026',
  },
  {
    id: 'CL007',
    name: 'ريم سعد المالكي',
    phone: '0567890123',
    email: 'reem@maliki.com',
    source: 'referral',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    lastActivity: '18 May 2026',
    expectedValue: 55000,
    currency: 'SAR',
    stage: 'qualified',
    city: 'الرياض',
    createdAt: '05 May 2026',
  },
  {
    id: 'CL008',
    name: 'طارق حسن العمري',
    phone: '0598901234',
    company: 'العمري للبناء',
    source: 'website',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    lastActivity: '17 May 2026',
    expectedValue: 88000,
    currency: 'SAR',
    stage: 'qualified',
    city: 'المدينة',
    createdAt: '03 May 2026',
  },
  {
    id: 'CL009',
    name: 'هند عبدالله الرشيدي',
    phone: '0509012345',
    source: 'social_media',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    lastActivity: '16 May 2026',
    expectedValue: 42000,
    currency: 'SAR',
    stage: 'proposal_sent',
    city: 'الدمام',
    createdAt: '01 May 2026',
  },
  {
    id: 'CL010',
    name: 'سلطان محمد العنزي',
    phone: '0550123456',
    company: 'مجموعة العنزي',
    source: 'referral',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    lastActivity: '15 May 2026',
    expectedValue: 150000,
    currency: 'SAR',
    stage: 'proposal_sent',
    city: 'الرياض',
    createdAt: '28 Apr 2026',
  },
  {
    id: 'CL011',
    name: 'لمياء خالد البقمي',
    phone: '0561234568',
    email: 'lamia@baqmi.com',
    source: 'website',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    lastActivity: '14 May 2026',
    expectedValue: 67000,
    currency: 'SAR',
    stage: 'won',
    city: 'جدة',
    createdAt: '22 Apr 2026',
  },
  {
    id: 'CL012',
    name: 'عمر عبدالرحمن الجهني',
    phone: '0592345679',
    company: 'الجهني للتقنية',
    source: 'cold_call',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    lastActivity: '13 May 2026',
    expectedValue: 95000,
    currency: 'SAR',
    stage: 'lost',
    city: 'الرياض',
    createdAt: '20 Apr 2026',
  },
];

// ── Mock Activities ───────────────────────────────────────────────────────────

export const mockCrmActivities: CrmActivity[] = [
  {
    id: 'CA001',
    type: 'call',
    subject: 'مكالمة تعريفية بالمنتج',
    customerName: 'أحمد محمد الزهراني',
    customerId: 'CL001',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    date: '24 May 2026',
    status: 'completed',
    duration: 15,
  },
  {
    id: 'CA002',
    type: 'meeting',
    subject: 'اجتماع عرض الحل',
    customerName: 'عبدالعزيز يوسف الغامدي',
    customerId: 'CL006',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    date: '25 May 2026',
    status: 'scheduled',
    duration: 60,
  },
  {
    id: 'CA003',
    type: 'whatsapp',
    subject: 'إرسال كتيب المنتج',
    customerName: 'نورة سالم البكري',
    customerId: 'CL003',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    date: '23 May 2026',
    status: 'completed',
  },
  {
    id: 'CA004',
    type: 'email',
    subject: 'عرض سعر مفصّل',
    customerName: 'سلطان محمد العنزي',
    customerId: 'CL010',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    date: '22 May 2026',
    status: 'completed',
  },
  {
    id: 'CA005',
    type: 'visit',
    subject: 'زيارة ميدانية للعميل',
    customerName: 'فيصل عبدالله الحربي',
    customerId: 'CL002',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    date: '26 May 2026',
    status: 'scheduled',
    duration: 120,
  },
  {
    id: 'CA006',
    type: 'followup',
    subject: 'متابعة العرض المُرسَل',
    customerName: 'هند عبدالله الرشيدي',
    customerId: 'CL009',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    date: '25 May 2026',
    status: 'scheduled',
  },
  {
    id: 'CA007',
    type: 'call',
    subject: 'استفسار عن الدعم الفني',
    customerName: 'منى عبدالرحمن العسيري',
    customerId: 'CL005',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    date: '21 May 2026',
    status: 'completed',
    duration: 25,
  },
  {
    id: 'CA008',
    type: 'meeting',
    subject: 'مراجعة العقد النهائي',
    customerName: 'لمياء خالد البقمي',
    customerId: 'CL011',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    date: '14 May 2026',
    status: 'completed',
    duration: 90,
  },
  {
    id: 'CA009',
    type: 'whatsapp',
    subject: 'تأكيد موعد الاجتماع',
    customerName: 'خالد ناصر الشمري',
    customerId: 'CL004',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    date: '20 May 2026',
    status: 'cancelled',
  },
  {
    id: 'CA010',
    type: 'email',
    subject: 'إرسال دراسة الحالة',
    customerName: 'طارق حسن العمري',
    customerId: 'CL008',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    date: '17 May 2026',
    status: 'completed',
  },
  {
    id: 'CA011',
    type: 'call',
    subject: 'مناقشة شروط العقد',
    customerName: 'ريم سعد المالكي',
    customerId: 'CL007',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    date: '18 May 2026',
    status: 'completed',
    duration: 35,
  },
  {
    id: 'CA012',
    type: 'followup',
    subject: 'متابعة قرار الشراء',
    customerName: 'طارق حسن العمري',
    customerId: 'CL008',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    date: '27 May 2026',
    status: 'scheduled',
  },
];

// ── Mock Tasks ────────────────────────────────────────────────────────────────

export const mockCrmTasks: CrmTask[] = [
  {
    id: 'CT001',
    name: 'إعداد عرض الأسعار لشركة الغامدي',
    customerName: 'عبدالعزيز يوسف الغامدي',
    customerId: 'CL006',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    priority: 'high',
    dueDate: '26 May 2026',
    status: 'in_progress',
  },
  {
    id: 'CT002',
    name: 'إرسال عينة المنتج للعميل',
    customerName: 'فيصل عبدالله الحربي',
    customerId: 'CL002',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    priority: 'medium',
    dueDate: '28 May 2026',
    status: 'open',
  },
  {
    id: 'CT003',
    name: 'متابعة عقد العنزي',
    customerName: 'سلطان محمد العنزي',
    customerId: 'CL010',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    priority: 'critical',
    dueDate: '25 May 2026',
    status: 'waiting',
    description: 'في انتظار موافقة الإدارة القانونية',
  },
  {
    id: 'CT004',
    name: 'تسجيل الاتصالات في النظام',
    customerName: 'أحمد محمد الزهراني',
    customerId: 'CL001',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    priority: 'low',
    dueDate: '30 May 2026',
    status: 'open',
  },
  {
    id: 'CT005',
    name: 'تحضير عرض تقديمي للعميل',
    customerName: 'ريم سعد المالكي',
    customerId: 'CL007',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    priority: 'high',
    dueDate: '27 May 2026',
    status: 'in_progress',
  },
  {
    id: 'CT006',
    name: 'تجديد عقد الخدمة',
    customerName: 'لمياء خالد البقمي',
    customerId: 'CL011',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    priority: 'medium',
    dueDate: '01 Jun 2026',
    status: 'completed',
  },
  {
    id: 'CT007',
    name: 'تحليل احتياجات العميل',
    customerName: 'طارق حسن العمري',
    customerId: 'CL008',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    priority: 'medium',
    dueDate: '29 May 2026',
    status: 'open',
  },
  {
    id: 'CT008',
    name: 'إغلاق فرصة البيع',
    customerName: 'هند عبدالله الرشيدي',
    customerId: 'CL009',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    priority: 'critical',
    dueDate: '24 May 2026',
    status: 'cancelled',
  },
  {
    id: 'CT009',
    name: 'تقديم عرض مراجعة الأسعار',
    customerName: 'خالد ناصر الشمري',
    customerId: 'CL004',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    priority: 'high',
    dueDate: '28 May 2026',
    status: 'open',
  },
  {
    id: 'CT010',
    name: 'إرسال تقرير الأداء الشهري',
    customerName: 'منى عبدالرحمن العسيري',
    customerId: 'CL005',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    priority: 'low',
    dueDate: '31 May 2026',
    status: 'open',
  },
];

// ── Mock CRM Customers ────────────────────────────────────────────────────────

export const mockCrmCustomers: CrmCustomer[] = [
  {
    id: 'CC001',
    code: 'CUST-001',
    name: 'لمياء خالد البقمي',
    phone: '0561234568',
    email: 'lamia@baqmi.com',
    city: 'جدة',
    status: 'active',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    lastActivity: '14 May 2026',
    totalOrders: 8,
    totalRevenue: 145000,
    currency: 'SAR',
  },
  {
    id: 'CC002',
    code: 'CUST-002',
    name: 'شركة الحربي للتجارة',
    phone: '0552345678',
    email: 'info@harbi.com',
    city: 'الرياض',
    status: 'active',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    lastActivity: '20 May 2026',
    totalOrders: 15,
    totalRevenue: 380000,
    currency: 'SAR',
  },
  {
    id: 'CC003',
    code: 'CUST-003',
    name: 'منى عبدالرحمن العسيري',
    phone: '0505678901',
    city: 'الدمام',
    status: 'prospect',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    lastActivity: '18 May 2026',
    totalOrders: 2,
    totalRevenue: 28000,
    currency: 'SAR',
  },
  {
    id: 'CC004',
    code: 'CUST-004',
    name: 'مجموعة الغامدي للاستيراد',
    phone: '0556789012',
    email: 'info@ghamdi.com',
    city: 'جدة',
    status: 'active',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    lastActivity: '22 May 2026',
    totalOrders: 24,
    totalRevenue: 620000,
    currency: 'SAR',
  },
  {
    id: 'CC005',
    code: 'CUST-005',
    name: 'ريم سعد المالكي',
    phone: '0567890123',
    city: 'الرياض',
    status: 'active',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    lastActivity: '16 May 2026',
    totalOrders: 5,
    totalRevenue: 95000,
    currency: 'SAR',
  },
  {
    id: 'CC006',
    code: 'CUST-006',
    name: 'عمر عبدالرحمن الجهني',
    phone: '0592345679',
    email: 'omar@jahni.com',
    city: 'مكة',
    status: 'inactive',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    lastActivity: '05 Apr 2026',
    totalOrders: 3,
    totalRevenue: 42000,
    currency: 'SAR',
  },
  {
    id: 'CC007',
    code: 'CUST-007',
    name: 'طارق حسن العمري',
    phone: '0598901234',
    city: 'المدينة',
    status: 'prospect',
    assignedUser: 'محمد القحطاني',
    assignedUserInitials: 'مق',
    lastActivity: '15 May 2026',
    totalOrders: 1,
    totalRevenue: 18000,
    currency: 'SAR',
  },
  {
    id: 'CC008',
    code: 'CUST-008',
    name: 'سلطان محمد العنزي',
    phone: '0550123456',
    email: 'sultan@anazi.com',
    city: 'الرياض',
    status: 'active',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    lastActivity: '23 May 2026',
    totalOrders: 11,
    totalRevenue: 255000,
    currency: 'SAR',
  },
  {
    id: 'CC009',
    code: 'CUST-009',
    name: 'نورة سالم البكري',
    phone: '0563456789',
    email: 'noura@bakri.com',
    city: 'الدمام',
    status: 'prospect',
    assignedUser: 'سارة العتيبي',
    assignedUserInitials: 'سع',
    lastActivity: '22 May 2026',
    totalOrders: 0,
    totalRevenue: 0,
    currency: 'SAR',
  },
  {
    id: 'CC010',
    code: 'CUST-010',
    name: 'الشمري للمقاولات',
    phone: '0594567890',
    city: 'مكة',
    status: 'churned',
    assignedUser: 'عمر الدوسري',
    assignedUserInitials: 'عد',
    lastActivity: '10 Feb 2026',
    totalOrders: 6,
    totalRevenue: 112000,
    currency: 'SAR',
  },
];

// ── KPI Summary ───────────────────────────────────────────────────────────────

export const crmKpiData = {
  totalLeads: 48,
  newLeads: 12,
  qualifiedLeads: 8,
  customers: 124,
  openTasks: 23,
  completedTasks: 156,
};
