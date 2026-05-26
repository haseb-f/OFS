// Lead Distribution System — Mock data only. No backend, no API calls.

// ── Types ─────────────────────────────────────────────────────────────────────

export type LeadDistStatus =
  | 'new'
  | 'assigned'
  | 'contacted'
  | 'qualified'
  | 'won'
  | 'lost';

export type DistributionMethod =
  | 'manual'
  | 'round_robin'
  | 'weighted'
  | 'team'
  | 'branch'
  | 'company'
  | 'skill';

export type RuleStatus = 'active' | 'inactive';

export interface DistributionAgent {
  id: string;
  name: string;
  initials: string;
  team: string;
  branch: string;
  skills: string[];
  weight: number;
  assignedCount: number;
  pendingCount: number;
  avgResponseHours: number;
  conversionRate: number;
}

export interface DistributionRule {
  id: string;
  name: string;
  method: DistributionMethod;
  description: string;
  status: RuleStatus;
  priority: number;
  conditions: string[];
  lastUsed: string;
  totalAssigned: number;
}

export interface QueuedLead {
  id: string;
  name: string;
  phone: string;
  source: string;
  company?: string;
  city: string;
  expectedValue: number;
  waitingMinutes: number;
  createdAt: string;
  preferredBranch?: string;
  preferredTeam?: string;
  requiredSkills?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface LeadOwnership {
  leadId: string;
  leadName: string;
  phone: string;
  company?: string;
  currentOwner: string;
  currentOwnerInitials: string;
  team: string;
  branch: string;
  status: LeadDistStatus;
  assignedAt: string;
  lastActivity: string;
  expectedValue: number;
}

export interface AssignmentRecord {
  id: string;
  leadId: string;
  leadName: string;
  method: DistributionMethod;
  fromAgent?: string;
  fromAgentInitials?: string;
  toAgent: string;
  toAgentInitials: string;
  timestamp: string;
  notes?: string;
  triggeredBy: string;
}

// ── Label Maps ────────────────────────────────────────────────────────────────

export const LEAD_DIST_STATUS_LABELS: Record<LeadDistStatus, string> = {
  new:       'جديد',
  assigned:  'مُعيَّن',
  contacted: 'تم التواصل',
  qualified: 'مؤهل',
  won:       'مُغلق (فوز)',
  lost:      'مُغلق (خسارة)',
};

export const DIST_METHOD_LABELS: Record<DistributionMethod, string> = {
  manual:      'يدوي',
  round_robin: 'التناوب الدوري',
  weighted:    'الوزن النسبي',
  team:        'حسب الفريق',
  branch:      'حسب الفرع',
  company:     'حسب الشركة',
  skill:       'حسب المهارة',
};

export const DIST_METHOD_COLORS: Record<DistributionMethod, { bg: string; color: string; border: string }> = {
  manual:      { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  round_robin: { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
  weighted:    { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  team:        { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' },
  branch:      { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' },
  company:     { bg: '#faf5ff', color: '#7c3aed', border: '#ddd6fe' },
  skill:       { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

export const LEAD_DIST_STATUS_COLORS: Record<LeadDistStatus, { bg: string; color: string; border: string }> = {
  new:       { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  assigned:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  contacted: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  qualified: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  won:       { bg: '#dcfce7', color: '#14532d', border: '#86efac' },
  lost:      { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};

// ── Mock Agents ───────────────────────────────────────────────────────────────

export const mockDistributionAgents: DistributionAgent[] = [
  {
    id: 'AG001',
    name: 'سارة العتيبي',
    initials: 'سع',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    skills: ['المبيعات المؤسسية', 'العملاء الكبار', 'التفاوض'],
    weight: 30,
    assignedCount: 42,
    pendingCount: 8,
    avgResponseHours: 2.5,
    conversionRate: 38,
  },
  {
    id: 'AG002',
    name: 'محمد القحطاني',
    initials: 'مق',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    skills: ['المبيعات التقنية', 'برامج المؤسسات', 'الدعم الفني'],
    weight: 25,
    assignedCount: 36,
    pendingCount: 5,
    avgResponseHours: 3.1,
    conversionRate: 31,
  },
  {
    id: 'AG003',
    name: 'عمر الدوسري',
    initials: 'عد',
    team: 'فريق المبيعات ب',
    branch: 'فرع جدة',
    skills: ['المبيعات الإقليمية', 'قطاع التجزئة'],
    weight: 20,
    assignedCount: 28,
    pendingCount: 6,
    avgResponseHours: 4.8,
    conversionRate: 29,
  },
  {
    id: 'AG004',
    name: 'نورة السلمي',
    initials: 'نس',
    team: 'فريق المبيعات ب',
    branch: 'فرع جدة',
    skills: ['المبيعات للأفراد', 'خدمة العملاء', 'التسويق الرقمي'],
    weight: 15,
    assignedCount: 21,
    pendingCount: 3,
    avgResponseHours: 1.9,
    conversionRate: 42,
  },
  {
    id: 'AG005',
    name: 'خالد الشهراني',
    initials: 'خش',
    team: 'فريق المبيعات ج',
    branch: 'فرع الدمام',
    skills: ['القطاع الصناعي', 'المقاولات', 'الطاقة'],
    weight: 10,
    assignedCount: 15,
    pendingCount: 1,
    avgResponseHours: 5.2,
    conversionRate: 27,
  },
];

// ── Mock Distribution Rules ───────────────────────────────────────────────────

export const mockDistributionRules: DistributionRule[] = [
  {
    id: 'RU001',
    name: 'التوزيع الدوري العام',
    method: 'round_robin',
    description: 'توزيع متساوٍ على جميع المندوبين النشطين بالتناوب',
    status: 'active',
    priority: 1,
    conditions: ['المصدر: جميع المصادر', 'الحالة: جديد', 'لا يوجد فرع مفضل'],
    lastUsed: '25 May 2026',
    totalAssigned: 186,
  },
  {
    id: 'RU002',
    name: 'التوزيع الوزني — الأداء العالي',
    method: 'weighted',
    description: 'توزيع نسبي بحسب وزن كل مندوب ومعدل تحويله',
    status: 'active',
    priority: 2,
    conditions: ['القيمة المتوقعة: > 50,000 ر.س', 'المصدر: إحالة أو معرض تجاري'],
    lastUsed: '24 May 2026',
    totalAssigned: 94,
  },
  {
    id: 'RU003',
    name: 'توزيع الفريق — المبيعات المؤسسية',
    method: 'team',
    description: 'إسناد عملاء الشركات الكبرى لفريق المبيعات المؤسسية',
    status: 'active',
    priority: 3,
    conditions: ['نوع العميل: شركة', 'القيمة المتوقعة: > 100,000 ر.س'],
    lastUsed: '23 May 2026',
    totalAssigned: 58,
  },
  {
    id: 'RU004',
    name: 'التوزيع الجغرافي — الفروع',
    method: 'branch',
    description: 'توزيع العملاء على المندوبين في نفس منطقتهم الجغرافية',
    status: 'active',
    priority: 4,
    conditions: ['المدينة: محددة', 'المندوب: في نفس فرع العميل'],
    lastUsed: '22 May 2026',
    totalAssigned: 127,
  },
  {
    id: 'RU005',
    name: 'توزيع الشركات — الحسابات الكبرى',
    method: 'company',
    description: 'ربط فروع الشركة بمندوب مختص يتعامل مع كل الحسابات المرتبطة',
    status: 'inactive',
    priority: 5,
    conditions: ['اسم الشركة: موجود', 'حساب سابق: نعم'],
    lastUsed: '10 May 2026',
    totalAssigned: 33,
  },
  {
    id: 'RU006',
    name: 'التوزيع بالمهارة — القطاع الصناعي',
    method: 'skill',
    description: 'إسناد العملاء الصناعيين لمندوبين يمتلكون مهارات القطاع المناسبة',
    status: 'active',
    priority: 6,
    conditions: ['القطاع: صناعي أو مقاولات أو طاقة', 'المهارة المطلوبة: محددة'],
    lastUsed: '21 May 2026',
    totalAssigned: 41,
  },
];

// ── Mock Queue ────────────────────────────────────────────────────────────────

export const mockQueuedLeads: QueuedLead[] = [
  {
    id: 'QL001',
    name: 'فهد عبدالله المطيري',
    phone: '0501112233',
    source: 'الموقع الإلكتروني',
    company: 'مؤسسة المطيري',
    city: 'الرياض',
    expectedValue: 85000,
    waitingMinutes: 12,
    createdAt: '25 May 2026',
    priority: 'high',
  },
  {
    id: 'QL002',
    name: 'أميرة حسن القرني',
    phone: '0552223344',
    source: 'وسائل التواصل',
    city: 'جدة',
    expectedValue: 22000,
    waitingMinutes: 34,
    createdAt: '25 May 2026',
    preferredBranch: 'فرع جدة',
    priority: 'medium',
  },
  {
    id: 'QL003',
    name: 'بندر علي الزهراني',
    phone: '0563334455',
    source: 'إحالة',
    company: 'شركة الزهراني للمقاولات',
    city: 'مكة',
    expectedValue: 180000,
    waitingMinutes: 8,
    createdAt: '25 May 2026',
    requiredSkills: ['المقاولات', 'القطاع الصناعي'],
    priority: 'high',
  },
  {
    id: 'QL004',
    name: 'منال خالد الرشيد',
    phone: '0594445566',
    source: 'حملة بريدية',
    city: 'الدمام',
    expectedValue: 14500,
    waitingMinutes: 67,
    createdAt: '25 May 2026',
    preferredBranch: 'فرع الدمام',
    priority: 'low',
  },
  {
    id: 'QL005',
    name: 'عادل محمد الغامدي',
    phone: '0505556677',
    source: 'معرض تجاري',
    company: 'الغامدي للتجارة الدولية',
    city: 'الرياض',
    expectedValue: 250000,
    waitingMinutes: 5,
    createdAt: '25 May 2026',
    preferredTeam: 'فريق المبيعات أ',
    requiredSkills: ['المبيعات المؤسسية', 'العملاء الكبار'],
    priority: 'high',
  },
  {
    id: 'QL006',
    name: 'هيفاء سعود البقمي',
    phone: '0556667788',
    source: 'اتصال بارد',
    city: 'جدة',
    expectedValue: 31000,
    waitingMinutes: 112,
    createdAt: '24 May 2026',
    priority: 'medium',
  },
  {
    id: 'QL007',
    name: 'وليد ناصر العنزي',
    phone: '0567778899',
    source: 'الموقع الإلكتروني',
    company: 'مجموعة العنزي',
    city: 'الرياض',
    expectedValue: 62000,
    waitingMinutes: 145,
    createdAt: '24 May 2026',
    priority: 'medium',
  },
  {
    id: 'QL008',
    name: 'ريان عبدالعزيز الشمري',
    phone: '0598889900',
    source: 'إحالة',
    city: 'القصيم',
    expectedValue: 9500,
    waitingMinutes: 210,
    createdAt: '24 May 2026',
    priority: 'low',
  },
];

// ── Mock Lead Ownership ───────────────────────────────────────────────────────

export const mockLeadOwnership: LeadOwnership[] = [
  {
    leadId: 'CL001',
    leadName: 'أحمد محمد الزهراني',
    phone: '0501234567',
    company: 'شركة الزهراني للتجارة',
    currentOwner: 'سارة العتيبي',
    currentOwnerInitials: 'سع',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    status: 'contacted',
    assignedAt: '20 May 2026',
    lastActivity: '24 May 2026',
    expectedValue: 45000,
  },
  {
    leadId: 'CL002',
    leadName: 'فيصل عبدالله الحربي',
    phone: '0552345678',
    company: 'مجموعة الحربي',
    currentOwner: 'محمد القحطاني',
    currentOwnerInitials: 'مق',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    status: 'qualified',
    assignedAt: '18 May 2026',
    lastActivity: '23 May 2026',
    expectedValue: 120000,
  },
  {
    leadId: 'CL003',
    leadName: 'نورة سالم البكري',
    phone: '0563456789',
    currentOwner: 'سارة العتيبي',
    currentOwnerInitials: 'سع',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    status: 'assigned',
    assignedAt: '15 May 2026',
    lastActivity: '22 May 2026',
    expectedValue: 28000,
  },
  {
    leadId: 'CL004',
    leadName: 'خالد ناصر الشمري',
    phone: '0594567890',
    company: 'الشمري للمقاولات',
    currentOwner: 'عمر الدوسري',
    currentOwnerInitials: 'عد',
    team: 'فريق المبيعات ب',
    branch: 'فرع جدة',
    status: 'contacted',
    assignedAt: '12 May 2026',
    lastActivity: '21 May 2026',
    expectedValue: 75000,
  },
  {
    leadId: 'CL005',
    leadName: 'منى عبدالرحمن العسيري',
    phone: '0505678901',
    currentOwner: 'محمد القحطاني',
    currentOwnerInitials: 'مق',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    status: 'qualified',
    assignedAt: '10 May 2026',
    lastActivity: '20 May 2026',
    expectedValue: 35000,
  },
  {
    leadId: 'CL006',
    leadName: 'عبدالعزيز يوسف الغامدي',
    phone: '0556789012',
    company: 'الغامدي للاستيراد',
    currentOwner: 'عمر الدوسري',
    currentOwnerInitials: 'عد',
    team: 'فريق المبيعات ب',
    branch: 'فرع جدة',
    status: 'qualified',
    assignedAt: '08 May 2026',
    lastActivity: '19 May 2026',
    expectedValue: 200000,
  },
  {
    leadId: 'CL007',
    leadName: 'ريم سعد المالكي',
    phone: '0567890123',
    currentOwner: 'سارة العتيبي',
    currentOwnerInitials: 'سع',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    status: 'qualified',
    assignedAt: '05 May 2026',
    lastActivity: '18 May 2026',
    expectedValue: 55000,
  },
  {
    leadId: 'CL008',
    leadName: 'طارق حسن العمري',
    phone: '0598901234',
    company: 'العمري للبناء',
    currentOwner: 'محمد القحطاني',
    currentOwnerInitials: 'مق',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    status: 'contacted',
    assignedAt: '03 May 2026',
    lastActivity: '17 May 2026',
    expectedValue: 88000,
  },
  {
    leadId: 'CL009',
    leadName: 'هند عبدالله الرشيدي',
    phone: '0509012345',
    currentOwner: 'نورة السلمي',
    currentOwnerInitials: 'نس',
    team: 'فريق المبيعات ب',
    branch: 'فرع جدة',
    status: 'contacted',
    assignedAt: '01 May 2026',
    lastActivity: '16 May 2026',
    expectedValue: 42000,
  },
  {
    leadId: 'CL010',
    leadName: 'سلطان محمد العنزي',
    phone: '0550123456',
    company: 'مجموعة العنزي',
    currentOwner: 'سارة العتيبي',
    currentOwnerInitials: 'سع',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    status: 'qualified',
    assignedAt: '28 Apr 2026',
    lastActivity: '15 May 2026',
    expectedValue: 150000,
  },
  {
    leadId: 'CL011',
    leadName: 'لمياء خالد البقمي',
    phone: '0561234568',
    currentOwner: 'محمد القحطاني',
    currentOwnerInitials: 'مق',
    team: 'فريق المبيعات أ',
    branch: 'فرع الرياض',
    status: 'won',
    assignedAt: '22 Apr 2026',
    lastActivity: '14 May 2026',
    expectedValue: 67000,
  },
  {
    leadId: 'CL012',
    leadName: 'عمر عبدالرحمن الجهني',
    phone: '0592345679',
    company: 'الجهني للتقنية',
    currentOwner: 'خالد الشهراني',
    currentOwnerInitials: 'خش',
    team: 'فريق المبيعات ج',
    branch: 'فرع الدمام',
    status: 'lost',
    assignedAt: '20 Apr 2026',
    lastActivity: '13 May 2026',
    expectedValue: 95000,
  },
];

// ── Mock Assignment History ───────────────────────────────────────────────────

export const mockAssignmentHistory: AssignmentRecord[] = [
  {
    id: 'AH001',
    leadId: 'CL001',
    leadName: 'أحمد محمد الزهراني',
    method: 'round_robin',
    toAgent: 'سارة العتيبي',
    toAgentInitials: 'سع',
    timestamp: '25 May 2026',
    triggeredBy: 'النظام التلقائي',
  },
  {
    id: 'AH002',
    leadId: 'CL002',
    leadName: 'فيصل عبدالله الحربي',
    method: 'weighted',
    toAgent: 'محمد القحطاني',
    toAgentInitials: 'مق',
    timestamp: '24 May 2026',
    triggeredBy: 'النظام التلقائي',
    notes: 'تم الاختيار بناءً على أعلى معدل تحويل',
  },
  {
    id: 'AH003',
    leadId: 'CL005',
    leadName: 'منى عبدالرحمن العسيري',
    method: 'manual',
    fromAgent: 'عمر الدوسري',
    fromAgentInitials: 'عد',
    toAgent: 'محمد القحطاني',
    toAgentInitials: 'مق',
    timestamp: '23 May 2026',
    triggeredBy: 'أحمد المدير',
    notes: 'إعادة تعيين بسبب غياب المندوب الأصلي',
  },
  {
    id: 'AH004',
    leadId: 'CL006',
    leadName: 'عبدالعزيز يوسف الغامدي',
    method: 'team',
    toAgent: 'عمر الدوسري',
    toAgentInitials: 'عد',
    timestamp: '23 May 2026',
    triggeredBy: 'النظام التلقائي',
    notes: 'عميل مؤسسي — تم توجيهه لفريق المبيعات ب',
  },
  {
    id: 'AH005',
    leadId: 'CL003',
    leadName: 'نورة سالم البكري',
    method: 'branch',
    toAgent: 'سارة العتيبي',
    toAgentInitials: 'سع',
    timestamp: '22 May 2026',
    triggeredBy: 'النظام التلقائي',
    notes: 'مطابقة جغرافية: الرياض',
  },
  {
    id: 'AH006',
    leadId: 'CL009',
    leadName: 'هند عبدالله الرشيدي',
    method: 'manual',
    toAgent: 'نورة السلمي',
    toAgentInitials: 'نس',
    timestamp: '22 May 2026',
    triggeredBy: 'أحمد المدير',
  },
  {
    id: 'AH007',
    leadId: 'CL007',
    leadName: 'ريم سعد المالكي',
    method: 'skill',
    toAgent: 'سارة العتيبي',
    toAgentInitials: 'سع',
    timestamp: '21 May 2026',
    triggeredBy: 'النظام التلقائي',
    notes: 'مطابقة مهارة: المبيعات المؤسسية',
  },
  {
    id: 'AH008',
    leadId: 'CL008',
    leadName: 'طارق حسن العمري',
    method: 'round_robin',
    toAgent: 'محمد القحطاني',
    toAgentInitials: 'مق',
    timestamp: '20 May 2026',
    triggeredBy: 'النظام التلقائي',
  },
  {
    id: 'AH009',
    leadId: 'CL004',
    leadName: 'خالد ناصر الشمري',
    method: 'company',
    toAgent: 'عمر الدوسري',
    toAgentInitials: 'عد',
    timestamp: '19 May 2026',
    triggeredBy: 'النظام التلقائي',
    notes: 'ربط بحساب شركة موجود مسبقاً',
  },
  {
    id: 'AH010',
    leadId: 'CL010',
    leadName: 'سلطان محمد العنزي',
    method: 'weighted',
    toAgent: 'سارة العتيبي',
    toAgentInitials: 'سع',
    timestamp: '18 May 2026',
    triggeredBy: 'النظام التلقائي',
  },
  {
    id: 'AH011',
    leadId: 'CL011',
    leadName: 'لمياء خالد البقمي',
    method: 'manual',
    toAgent: 'محمد القحطاني',
    toAgentInitials: 'مق',
    timestamp: '17 May 2026',
    triggeredBy: 'سارة العتيبي',
    notes: 'تحويل من طلب العميل',
  },
  {
    id: 'AH012',
    leadId: 'CL012',
    leadName: 'عمر عبدالرحمن الجهني',
    method: 'branch',
    toAgent: 'خالد الشهراني',
    toAgentInitials: 'خش',
    timestamp: '16 May 2026',
    triggeredBy: 'النظام التلقائي',
    notes: 'مطابقة جغرافية: الدمام',
  },
];

// ── Summary Metrics ───────────────────────────────────────────────────────────

export const distributionMetrics = {
  totalAssigned: 142,
  pendingQueue: 8,
  avgResponseHours: 3.7,
  conversionRate: 34,
  totalLeads: 150,
  assignedToday: 12,
  reassignedTotal: 18,
};
