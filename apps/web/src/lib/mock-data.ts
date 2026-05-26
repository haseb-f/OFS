// Mock data only — no backend, no API calls.
// Replace with real data fetching in Phase 3.

export interface KpiItem {
  id: string;
  labelAr: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  trendLabel: string;
  iconColor: string;
  iconBg: string;
}

export interface ActivityItem {
  id: string;
  typeAr: string;
  type: string;
  descriptionAr: string;
  description: string;
  customerAr: string;
  customer: string;
  amount: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'active';
  statusAr: string;
}

export interface QuickAction {
  id: string;
  labelAr: string;
  label: string;
  iconColor: string;
  iconBg: string;
  href: string;
}

// ── KPI Cards ─────────────────────────────────────────────────────────────────

export const kpiData: KpiItem[] = [
  {
    id: 'total-leads',
    labelAr: 'إجمالي العملاء المحتملين',
    label: 'Total Leads',
    value: '1,248',
    trend: '+12.5%',
    trendDirection: 'up',
    trendLabel: 'مقارنة بالشهر الماضي',
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
  },
  {
    id: 'active-customers',
    labelAr: 'العملاء النشطون',
    label: 'Active Customers',
    value: '342',
    trend: '+8.1%',
    trendDirection: 'up',
    trendLabel: 'مقارنة بالشهر الماضي',
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
  },
  {
    id: 'todays-orders',
    labelAr: "طلبات اليوم",
    label: "Today's Orders",
    value: '47',
    trend: '-3.2%',
    trendDirection: 'down',
    trendLabel: 'مقارنة بالأمس',
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
  },
  {
    id: 'collected-amount',
    labelAr: 'المبالغ المحصّلة',
    label: 'Collected Amount',
    value: '127,450 ر.س',
    trend: '+22.4%',
    trendDirection: 'up',
    trendLabel: 'مقارنة بالشهر الماضي',
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
  },
  {
    id: 'pending-followups',
    labelAr: 'المتابعات المعلّقة',
    label: 'Pending Follow Ups',
    value: '18',
    trend: '+5',
    trendDirection: 'down',
    trendLabel: 'منذ الأمس',
    iconColor: '#8b5cf6',
    iconBg: '#f5f3ff',
  },
];

// ── Recent Activities ──────────────────────────────────────────────────────────

export const recentActivities: ActivityItem[] = [
  {
    id: '1',
    typeAr: 'طلب جديد',
    type: 'New Order',
    descriptionAr: 'طلب معدات مكتبية — 24 وحدة',
    description: 'Office equipment order — 24 units',
    customerAr: 'شركة النخبة للتجارة',
    customer: 'Al Nukhba Trading Co.',
    amount: '18,500 ر.س',
    date: '24 May 2026',
    status: 'pending',
    statusAr: 'قيد المعالجة',
  },
  {
    id: '2',
    typeAr: 'عميل محتمل',
    type: 'Lead',
    descriptionAr: 'اهتمام بخدمات الاستيراد',
    description: 'Interest in import services',
    customerAr: 'أحمد محمد السالم',
    customer: 'Ahmed M. Al-Salim',
    amount: '—',
    date: '24 May 2026',
    status: 'active',
    statusAr: 'نشط',
  },
  {
    id: '3',
    typeAr: 'دفعة مستلمة',
    type: 'Payment',
    descriptionAr: 'دفعة جزئية — فاتورة رقم 1042',
    description: 'Partial payment — Invoice #1042',
    customerAr: 'مؤسسة الربيع',
    customer: 'Al-Rabie Est.',
    amount: '45,000 ر.س',
    date: '23 May 2026',
    status: 'completed',
    statusAr: 'مكتمل',
  },
  {
    id: '4',
    typeAr: 'طلب جديد',
    type: 'New Order',
    descriptionAr: 'أجهزة إلكترونية — 8 وحدات',
    description: 'Electronics — 8 units',
    customerAr: 'شركة التقنية الحديثة',
    customer: 'Modern Tech Co.',
    amount: '32,800 ر.س',
    date: '23 May 2026',
    status: 'completed',
    statusAr: 'مكتمل',
  },
  {
    id: '5',
    typeAr: 'طلب ملغي',
    type: 'Cancelled Order',
    descriptionAr: 'إلغاء بناءً على طلب العميل',
    description: 'Cancelled by customer request',
    customerAr: 'محمد عبدالله',
    customer: 'Mohammed Abdullah',
    amount: '5,200 ر.س',
    date: '22 May 2026',
    status: 'cancelled',
    statusAr: 'ملغي',
  },
  {
    id: '6',
    typeAr: 'عميل محتمل',
    type: 'Lead',
    descriptionAr: 'طلب عرض أسعار — مواد البناء',
    description: 'Quote request — Building materials',
    customerAr: 'مجموعة البناء والتشييد',
    customer: 'Construction Group',
    amount: '—',
    date: '22 May 2026',
    status: 'pending',
    statusAr: 'قيد المعالجة',
  },
];

// ── Quick Actions ──────────────────────────────────────────────────────────────

export const quickActions: QuickAction[] = [
  {
    id: 'add-lead',
    labelAr: 'عميل محتمل جديد',
    label: 'Add Lead',
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    href: '/ar/leads/new',
  },
  {
    id: 'new-order',
    labelAr: 'طلب جديد',
    label: 'New Order',
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
    href: '/ar/orders/new',
  },
  {
    id: 'add-customer',
    labelAr: 'إضافة عميل',
    label: 'Add Customer',
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
    href: '/ar/customers/new',
  },
  {
    id: 'generate-report',
    labelAr: 'إنشاء تقرير',
    label: 'Generate Report',
    iconColor: '#8b5cf6',
    iconBg: '#f5f3ff',
    href: '/ar/reports/new',
  },
];

// ── CRM Leads ──────────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'in_progress' | 'pending' | 'won' | 'lost' | 'cancelled';
export type LeadCurrency = 'SAR' | 'USD' | 'EUR' | 'AED' | 'KWD' | 'QAR' | 'BHD';
export type LeadPaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'installment';

export interface LeadTimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'assigned' | 'note' | 'call';
  descriptionAr: string;
  author: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  externalOrderId: string;
  orderDate: string;
  customerName: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  product: string;
  quantity: number;
  paidAmount: number;
  currency: LeadCurrency;
  paymentMethod: LeadPaymentMethod;
  receipt?: string;
  notes?: string;
  status: LeadStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  timeline: LeadTimelineEvent[];
}

export const LEAD_PAYMENT_LABELS: Record<LeadPaymentMethod, string> = {
  cash:          'نقداً',
  bank_transfer: 'تحويل بنكي',
  card:          'بطاقة ائتمانية',
  installment:   'أقساط',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new:         'جديد',
  in_progress: 'قيد المعالجة',
  pending:     'معلق',
  won:         'مُحوّل',
  lost:        'خسارة',
  cancelled:   'ملغي',
};

export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    externalOrderId: 'ORD-2026-0041',
    orderDate: '22 مايو 2026',
    customerName: 'محمد أحمد العمري',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    address: 'حي العليا، شارع التخصصي، مبنى 42',
    phone: '+966 50 123 4567',
    product: 'معدات مكتبية - طقم كامل',
    quantity: 5,
    paidAmount: 18500,
    currency: 'SAR',
    paymentMethod: 'bank_transfer',
    receipt: 'REC-2026-0041',
    notes: 'العميل مهتم بالتوسع في طلب المزيد بعد تجربة الشحنة الأولى. يفضّل التواصل بعد الساعة 10 صباحاً.',
    status: 'in_progress',
    assignedTo: 'سالم الخالدي',
    createdAt: '20 مايو 2026',
    updatedAt: '22 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',                           author: 'سارة الأحمد',   timestamp: '20 مايو 2026، 09:14' },
      { id: 't2', type: 'assigned',      descriptionAr: 'تم التعيين إلى سالم الخالدي',                       author: 'سارة الأحمد',   timestamp: '20 مايو 2026، 09:16' },
      { id: 't3', type: 'call',          descriptionAr: 'تواصل مع العميل — مهتم ويطلب عرض أسعار تفصيلي',    author: 'سالم الخالدي',  timestamp: '21 مايو 2026، 11:30' },
      { id: 't4', type: 'status_change', descriptionAr: 'تغيير الحالة: جديد ← قيد المعالجة',                author: 'سالم الخالدي',  timestamp: '22 مايو 2026، 08:00' },
    ],
  },
  {
    id: 'lead-002',
    externalOrderId: 'ORD-2026-0039',
    orderDate: '21 مايو 2026',
    customerName: 'نورة سعد المطيري',
    country: 'الكويت',
    city: 'مدينة الكويت',
    address: 'منطقة الشويخ الصناعية، قطعة 7، مبنى 19',
    phone: '+965 9912 3456',
    product: 'أجهزة إلكترونية - لابتوب Dell',
    quantity: 12,
    paidAmount: 34200,
    currency: 'KWD',
    paymentMethod: 'card',
    status: 'new',
    assignedTo: 'نورا المطيري',
    createdAt: '21 مايو 2026',
    updatedAt: '21 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',  descriptionAr: 'تم إنشاء العميل المحتمل عبر النموذج الإلكتروني', author: 'النظام',         timestamp: '21 مايو 2026، 14:22' },
      { id: 't2', type: 'assigned', descriptionAr: 'تم التعيين إلى نورا المطيري',                     author: 'مدير المبيعات', timestamp: '21 مايو 2026، 14:30' },
    ],
  },
  {
    id: 'lead-003',
    externalOrderId: 'ORD-2026-0037',
    orderDate: '19 مايو 2026',
    customerName: 'عبدالرحمن يوسف الهاجري',
    country: 'قطر',
    city: 'الدوحة',
    address: 'شارع الكورنيش، برج قطر الأول، الطابق 8',
    phone: '+974 5533 7788',
    product: 'مستلزمات طبية - أجهزة قياس',
    quantity: 30,
    paidAmount: 52000,
    currency: 'QAR',
    paymentMethod: 'bank_transfer',
    receipt: 'REC-2026-0037',
    notes: 'العميل يطلب شهادة مطابقة المواصفات الخليجية مع الشحنة.',
    status: 'pending',
    assignedTo: 'أحمد القحطاني',
    createdAt: '18 مايو 2026',
    updatedAt: '19 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',                          author: 'أحمد القحطاني', timestamp: '18 مايو 2026، 10:05' },
      { id: 't2', type: 'call',          descriptionAr: 'مكالمة أولى — مهتم ويشترط شهادة المطابقة',         author: 'أحمد القحطاني', timestamp: '18 مايو 2026، 15:20' },
      { id: 't3', type: 'status_change', descriptionAr: 'تغيير الحالة: جديد ← معلق (بانتظار الوثائق)',      author: 'أحمد القحطاني', timestamp: '19 مايو 2026، 09:00' },
    ],
  },
  {
    id: 'lead-004',
    externalOrderId: 'ORD-2026-0035',
    orderDate: '17 مايو 2026',
    customerName: 'فاطمة علي الزهراني',
    country: 'المملكة العربية السعودية',
    city: 'جدة',
    address: 'حي الروضة، طريق الملك فهد، مجمع 14',
    phone: '+966 55 987 6543',
    product: 'أثاث مكتبي - مجموعة كاملة',
    quantity: 8,
    paidAmount: 28000,
    currency: 'SAR',
    paymentMethod: 'installment',
    notes: 'دفعة أولى 50% عند الاستلام، المتبقي خلال 30 يوم.',
    status: 'won',
    assignedTo: 'فاطمة الزهراني',
    createdAt: '15 مايو 2026',
    updatedAt: '17 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',               author: 'فاطمة الزهراني', timestamp: '15 مايو 2026، 08:30' },
      { id: 't2', type: 'call',          descriptionAr: 'اتصال أول — اهتمام واضح بالمنتج',        author: 'فاطمة الزهراني', timestamp: '15 مايو 2026، 14:00' },
      { id: 't3', type: 'note',          descriptionAr: 'تم إرسال عرض السعر التفصيلي للعميل',      author: 'فاطمة الزهراني', timestamp: '16 مايو 2026، 10:00' },
      { id: 't4', type: 'status_change', descriptionAr: 'تم التحويل — العميل وافق على الطلب',      author: 'فاطمة الزهراني', timestamp: '17 مايو 2026، 11:45' },
    ],
  },
  {
    id: 'lead-005',
    externalOrderId: 'ORD-2026-0033',
    orderDate: '16 مايو 2026',
    customerName: 'خالد منصور العنزي',
    country: 'الإمارات العربية المتحدة',
    city: 'دبي',
    address: 'منطقة الجميرا، شارع 2ب، فيلا 78',
    phone: '+971 50 444 5566',
    product: 'مواد بناء - بورسلان فاخر',
    quantity: 500,
    paidAmount: 15000,
    currency: 'AED',
    paymentMethod: 'cash',
    receipt: 'REC-2026-0033',
    status: 'won',
    assignedTo: 'سالم الخالدي',
    createdAt: '14 مايو 2026',
    updatedAt: '16 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',                    author: 'سالم الخالدي',  timestamp: '14 مايو 2026، 09:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'تغيير الحالة: جديد ← مُحوّل (دفع نقدي)',     author: 'سالم الخالدي',  timestamp: '16 مايو 2026، 16:20' },
    ],
  },
  {
    id: 'lead-006',
    externalOrderId: 'ORD-2026-0031',
    orderDate: '15 مايو 2026',
    customerName: 'سلمى جاسم البحراني',
    country: 'البحرين',
    city: 'المنامة',
    address: 'منطقة السيف، برج البحرين، مكتب 305',
    phone: '+973 3366 9900',
    product: 'ملابس عمل - يونيفورم موظفين',
    quantity: 150,
    paidAmount: 4500,
    currency: 'BHD',
    paymentMethod: 'bank_transfer',
    status: 'in_progress',
    assignedTo: 'نورا المطيري',
    createdAt: '14 مايو 2026',
    updatedAt: '15 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',  descriptionAr: 'تم إنشاء العميل المحتمل',              author: 'نورا المطيري',  timestamp: '14 مايو 2026، 13:00' },
      { id: 't2', type: 'call',     descriptionAr: 'تم التواصل — يحتاج عينات قبل الطلب',   author: 'نورا المطيري',  timestamp: '15 مايو 2026، 11:00' },
    ],
  },
  {
    id: 'lead-007',
    externalOrderId: 'ORD-2026-0029',
    orderDate: '13 مايو 2026',
    customerName: 'عمر فيصل الشمري',
    country: 'المملكة العربية السعودية',
    city: 'الدمام',
    address: 'حي الشاطئ، طريق الملك عبدالعزيز',
    phone: '+966 53 222 1100',
    product: 'إكسسوارات - حقائب جلدية',
    quantity: 40,
    paidAmount: 9600,
    currency: 'SAR',
    paymentMethod: 'card',
    receipt: 'REC-2026-0029',
    status: 'cancelled',
    createdAt: '12 مايو 2026',
    updatedAt: '13 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',                           author: 'أحمد القحطاني', timestamp: '12 مايو 2026، 10:00' },
      { id: 't2', type: 'call',          descriptionAr: 'تم التواصل — يطلب تخفيض إضافي',                    author: 'أحمد القحطاني', timestamp: '12 مايو 2026، 15:30' },
      { id: 't3', type: 'status_change', descriptionAr: 'إلغاء — العميل وجد سعراً أفضل لدى منافس',          author: 'أحمد القحطاني', timestamp: '13 مايو 2026، 09:00' },
    ],
  },
  {
    id: 'lead-008',
    externalOrderId: 'ORD-2026-0027',
    orderDate: '11 مايو 2026',
    customerName: 'ريم عبدالله الدوسري',
    country: 'الإمارات العربية المتحدة',
    city: 'أبوظبي',
    address: 'جزيرة الريم، برج الواحة، شقة 1204',
    phone: '+971 55 778 8990',
    product: 'مواد غذائية - زيت زيتون فاخر',
    quantity: 200,
    paidAmount: 12000,
    currency: 'AED',
    paymentMethod: 'bank_transfer',
    notes: 'العميل مطعم راقٍ — يطلب عرض منتظم كل 3 أشهر.',
    status: 'pending',
    assignedTo: 'فاطمة الزهراني',
    createdAt: '10 مايو 2026',
    updatedAt: '11 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',  descriptionAr: 'تم إنشاء العميل المحتمل',                    author: 'فاطمة الزهراني', timestamp: '10 مايو 2026، 08:00' },
      { id: 't2', type: 'note',     descriptionAr: 'إرسال catalog المنتجات للعميل',              author: 'فاطمة الزهراني', timestamp: '10 مايو 2026، 09:30' },
      { id: 't3', type: 'call',     descriptionAr: 'مكالمة متابعة — ينتظر موافقة إدارة المطعم', author: 'فاطمة الزهراني', timestamp: '11 مايو 2026، 12:00' },
    ],
  },
  {
    id: 'lead-009',
    externalOrderId: 'ORD-2026-0025',
    orderDate: '09 مايو 2026',
    customerName: 'بدر سلطان القحطاني',
    country: 'المملكة العربية السعودية',
    city: 'مكة المكرمة',
    address: 'حي العزيزية، طريق الهجرة',
    phone: '+966 56 333 7744',
    product: 'أجهزة تكييف - سبليت 3 طن',
    quantity: 20,
    paidAmount: 76000,
    currency: 'SAR',
    paymentMethod: 'installment',
    status: 'new',
    createdAt: '09 مايو 2026',
    updatedAt: '09 مايو 2026',
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء العميل المحتمل عبر الموقع', author: 'النظام', timestamp: '09 مايو 2026، 16:45' },
    ],
  },
  {
    id: 'lead-010',
    externalOrderId: 'ORD-2026-0023',
    orderDate: '08 مايو 2026',
    customerName: 'منيرة حمد الرشيدي',
    country: 'الكويت',
    city: 'الفروانية',
    address: 'منطقة الفروانية، قطعة 12',
    phone: '+965 6644 2233',
    product: 'مستلزمات مدرسية - حقائب وأدوات',
    quantity: 300,
    paidAmount: 9000,
    currency: 'KWD',
    paymentMethod: 'cash',
    receipt: 'REC-2026-0023',
    status: 'won',
    assignedTo: 'سالم الخالدي',
    createdAt: '07 مايو 2026',
    updatedAt: '08 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',             author: 'سالم الخالدي',  timestamp: '07 مايو 2026، 10:10' },
      { id: 't2', type: 'status_change', descriptionAr: 'تحويل سريع — العميل دفع نقداً فوراً', author: 'سالم الخالدي',  timestamp: '08 مايو 2026، 14:00' },
    ],
  },
  {
    id: 'lead-011',
    externalOrderId: 'ORD-2026-0021',
    orderDate: '06 مايو 2026',
    customerName: 'وليد حسن الغامدي',
    country: 'المملكة العربية السعودية',
    city: 'المدينة المنورة',
    address: 'حي المناخة، بجانب المسجد النبوي',
    phone: '+966 59 555 8800',
    product: 'تجهيزات فنادق - أدوات مطبخ',
    quantity: 60,
    paidAmount: 22500,
    currency: 'SAR',
    paymentMethod: 'bank_transfer',
    notes: 'فندق 5 نجوم — يطلب ضمان سنة كاملة.',
    status: 'in_progress',
    assignedTo: 'أحمد القحطاني',
    createdAt: '05 مايو 2026',
    updatedAt: '06 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',                      author: 'أحمد القحطاني', timestamp: '05 مايو 2026، 09:00' },
      { id: 't2', type: 'call',          descriptionAr: 'اتصال مع مدير المشتريات — مهتم جداً',           author: 'أحمد القحطاني', timestamp: '05 مايو 2026، 11:30' },
      { id: 't3', type: 'status_change', descriptionAr: 'جديد ← قيد المعالجة',                          author: 'أحمد القحطاني', timestamp: '06 مايو 2026، 08:00' },
    ],
  },
  {
    id: 'lead-012',
    externalOrderId: 'ORD-2026-0019',
    orderDate: '04 مايو 2026',
    customerName: 'سامي راشد العجمي',
    country: 'قطر',
    city: 'الريان',
    address: 'منطقة الريان، شارع لسيل',
    phone: '+974 7733 4455',
    product: 'معدات رياضية - أجهزة جيم',
    quantity: 15,
    paidAmount: 45000,
    currency: 'QAR',
    paymentMethod: 'installment',
    status: 'lost',
    assignedTo: 'نورا المطيري',
    createdAt: '03 مايو 2026',
    updatedAt: '04 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',                              author: 'نورا المطيري',  timestamp: '03 مايو 2026، 13:00' },
      { id: 't2', type: 'call',          descriptionAr: 'مكالمتان متابعة — توقف العميل عن الرد',                author: 'نورا المطيري',  timestamp: '04 مايو 2026، 10:00' },
      { id: 't3', type: 'status_change', descriptionAr: 'خسارة — لم يستجب بعد المتابعة المتكررة',               author: 'نورا المطيري',  timestamp: '04 مايو 2026، 16:00' },
    ],
  },
  {
    id: 'lead-013',
    externalOrderId: 'ORD-2026-0017',
    orderDate: '02 مايو 2026',
    customerName: 'أميرة ناصر المزروعي',
    country: 'الإمارات العربية المتحدة',
    city: 'الشارقة',
    address: 'المنطقة الصناعية الثانية، مبنى 33',
    phone: '+971 56 111 2345',
    product: 'مواد تنظيف - مستلزمات شركات',
    quantity: 1000,
    paidAmount: 8000,
    currency: 'AED',
    paymentMethod: 'card',
    receipt: 'REC-2026-0017',
    status: 'won',
    assignedTo: 'فاطمة الزهراني',
    createdAt: '01 مايو 2026',
    updatedAt: '02 مايو 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',               author: 'فاطمة الزهراني', timestamp: '01 مايو 2026، 08:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'مُحوّل — دفع بالبطاقة فوراً',           author: 'فاطمة الزهراني', timestamp: '02 مايو 2026، 10:30' },
    ],
  },
  {
    id: 'lead-014',
    externalOrderId: 'ORD-2026-0015',
    orderDate: '30 أبريل 2026',
    customerName: 'ماجد صالح الصبيحي',
    country: 'المملكة العربية السعودية',
    city: 'الطائف',
    address: 'حي السلامة، بالقرب من مستشفى الطائف',
    phone: '+966 52 888 7766',
    product: 'أجهزة طبية - جهاز ضغط رقمي',
    quantity: 50,
    paidAmount: 17500,
    currency: 'SAR',
    paymentMethod: 'bank_transfer',
    status: 'new',
    createdAt: '30 أبريل 2026',
    updatedAt: '30 أبريل 2026',
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء العميل المحتمل', author: 'النظام', timestamp: '30 أبريل 2026، 11:00' },
    ],
  },
  {
    id: 'lead-015',
    externalOrderId: 'ORD-2026-0013',
    orderDate: '28 أبريل 2026',
    customerName: 'دانة محمد الصباح',
    country: 'الكويت',
    city: 'حولي',
    address: 'منطقة حولي، شارع تونس، مبنى 5',
    phone: '+965 5500 1122',
    product: 'ديكور داخلي - ستائر وإكسسوارات',
    quantity: 25,
    paidAmount: 6800,
    currency: 'KWD',
    paymentMethod: 'installment',
    notes: 'عميلة متكررة — تطلب الخدمة كل موسم.',
    status: 'in_progress',
    assignedTo: 'نورا المطيري',
    createdAt: '27 أبريل 2026',
    updatedAt: '28 أبريل 2026',
    timeline: [
      { id: 't1', type: 'created',  descriptionAr: 'تم إنشاء العميل المحتمل — عميلة متكررة',   author: 'نورا المطيري',  timestamp: '27 أبريل 2026، 09:30' },
      { id: 't2', type: 'call',     descriptionAr: 'تواصل — تختار الألوان وتطلب عينات',         author: 'نورا المطيري',  timestamp: '28 أبريل 2026، 14:00' },
    ],
  },
  {
    id: 'lead-016',
    externalOrderId: 'ORD-2026-0011',
    orderDate: '25 أبريل 2026',
    customerName: 'جاسم خليل الكواري',
    country: 'قطر',
    city: 'الوكرة',
    address: 'منطقة الوكرة الجديدة، منزل 88',
    phone: '+974 4455 6677',
    product: 'مواد غذائية - تمور فاخرة',
    quantity: 100,
    paidAmount: 9500,
    currency: 'QAR',
    paymentMethod: 'cash',
    receipt: 'REC-2026-0011',
    status: 'won',
    assignedTo: 'أحمد القحطاني',
    createdAt: '24 أبريل 2026',
    updatedAt: '25 أبريل 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',                author: 'أحمد القحطاني', timestamp: '24 أبريل 2026، 10:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'تحويل فوري — دفع نقداً عند الاستلام', author: 'أحمد القحطاني', timestamp: '25 أبريل 2026، 15:00' },
    ],
  },
  {
    id: 'lead-017',
    externalOrderId: 'ORD-2026-0009',
    orderDate: '22 أبريل 2026',
    customerName: 'هيا عبدالعزيز الفارسي',
    country: 'البحرين',
    city: 'المحرق',
    address: 'شارع الميناء، منطقة حفر، مبنى 44',
    phone: '+973 3900 8877',
    product: 'إلكترونيات - شاشات عرض',
    quantity: 10,
    paidAmount: 25000,
    currency: 'BHD',
    paymentMethod: 'bank_transfer',
    status: 'pending',
    assignedTo: 'سالم الخالدي',
    createdAt: '21 أبريل 2026',
    updatedAt: '22 أبريل 2026',
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء العميل المحتمل',                        author: 'سالم الخالدي',  timestamp: '21 أبريل 2026، 11:00' },
      { id: 't2', type: 'call',    descriptionAr: 'مكالمة متابعة — تنتظر اعتماد الميزانية',          author: 'سالم الخالدي',  timestamp: '22 أبريل 2026، 10:00' },
    ],
  },
  {
    id: 'lead-018',
    externalOrderId: 'ORD-2026-0007',
    orderDate: '20 أبريل 2026',
    customerName: 'طارق محمد الشيخ',
    country: 'الإمارات العربية المتحدة',
    city: 'عجمان',
    address: 'منطقة الصناعية الثانية، عجمان',
    phone: '+971 52 999 0011',
    product: 'معدات لحام وتشغيل معادن',
    quantity: 7,
    paidAmount: 33600,
    currency: 'AED',
    paymentMethod: 'bank_transfer',
    receipt: 'REC-2026-0007',
    status: 'lost',
    assignedTo: 'فاطمة الزهراني',
    createdAt: '19 أبريل 2026',
    updatedAt: '20 أبريل 2026',
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء العميل المحتمل',                       author: 'فاطمة الزهراني', timestamp: '19 أبريل 2026، 08:00' },
      { id: 't2', type: 'call',          descriptionAr: 'تواصل — مهتم لكن السعر مرتفع حسب رأيه',         author: 'فاطمة الزهراني', timestamp: '19 أبريل 2026، 14:00' },
      { id: 't3', type: 'note',          descriptionAr: 'تم تقديم عرض خاص بخصم 10%',                   author: 'فاطمة الزهراني', timestamp: '20 أبريل 2026، 09:00' },
      { id: 't4', type: 'status_change', descriptionAr: 'خسارة — اختار المنافس رغم العرض الخاص',         author: 'فاطمة الزهراني', timestamp: '20 أبريل 2026، 17:00' },
    ],
  },
];

// ── Customers ──────────────────────────────────────────────────────────────────

export type CustomerStatus = 'active' | 'inactive' | 'blocked';
export type CustomerType   = 'individual' | 'company' | 'government';

export interface CustomerNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface CustomerAttachment {
  id: string;
  name: string;
  fileType: 'pdf' | 'image' | 'excel' | 'word';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CustomerContact {
  id: string;
  nameAr: string;
  role?: string;
  phone: string;
  email?: string;
}

export interface CustomerTimelineEvent {
  id: string;
  type: 'created' | 'order' | 'payment' | 'note' | 'status_change' | 'contact';
  descriptionAr: string;
  author: string;
  timestamp: string;
  amount?: number;
  currency?: string;
}

export interface Customer {
  id: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  type: CustomerType;
  status: CustomerStatus;
  tags: string[];
  phone: string;
  phone2?: string;
  email?: string;
  country: string;
  city: string;
  district?: string;
  street?: string;
  taxNumber?: string;
  commercialRegNumber?: string;
  currency: string;
  creditLimit?: number;
  totalOrders: number;
  totalOrderValue: number;
  totalPaid: number;
  outstanding: number;
  lastOrderDate?: string;
  lastPaymentDate?: string;
  assignedSalesperson?: string;
  contacts: CustomerContact[];
  notes: CustomerNote[];
  attachments: CustomerAttachment[];
  timeline: CustomerTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface StatementEntry {
  id: string;
  date: string;
  type: 'invoice' | 'payment' | 'credit_note' | 'debit_note' | 'return';
  reference: string;
  descriptionAr: string;
  debit: number;
  credit: number;
  balance: number;
}

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active:   'نشط',
  inactive: 'غير نشط',
  blocked:  'محظور',
};

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  individual: 'فرد',
  company:    'شركة',
  government: 'جهة حكومية',
};

export const CUSTOMER_TAGS = [
  'عميل رئيسي',
  'عميل جديد',
  'دفع منتظم',
  'تأخر دفع',
  'أولوية عالية',
  'موسمي',
  'بالجملة',
  'مُحال',
];

export const TAG_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'عميل رئيسي':  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'عميل جديد':   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'دفع منتظم':   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'تأخر دفع':    { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  'أولوية عالية':{ bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
  'موسمي':       { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'بالجملة':     { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  'مُحال':       { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
};

export const mockCustomers: Customer[] = [
  {
    id: 'cus-001',
    code: 'CUS-0001',
    nameAr: 'شركة النخبة للتجارة',
    nameEn: 'Al-Nukhba Trading Co.',
    type: 'company',
    status: 'active',
    tags: ['عميل رئيسي', 'دفع منتظم'],
    phone: '+966 11 234 5678',
    phone2: '+966 50 111 2233',
    email: 'info@nukhba.sa',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    district: 'حي العليا',
    street: 'شارع التخصصي، مبنى 42',
    taxNumber: '300123456700003',
    commercialRegNumber: '1010123456',
    currency: 'SAR',
    creditLimit: 200000,
    totalOrders: 47,
    totalOrderValue: 1245000,
    totalPaid: 1209500,
    outstanding: 35500,
    lastOrderDate: '20 مايو 2026',
    lastPaymentDate: '05 مايو 2026',
    assignedSalesperson: 'سالم الخالدي',
    contacts: [
      { id: 'c1', nameAr: 'عبدالعزيز النخبة', role: 'مدير المشتريات', phone: '+966 50 111 2233', email: 'aziz@nukhba.sa' },
      { id: 'c2', nameAr: 'هند السالم',        role: 'المحاسبة',      phone: '+966 55 333 4455' },
    ],
    notes: [
      { id: 'n1', text: 'العميل يفضل التواصل صباحاً. لديه صلاحية الاعتماد حتى 50,000 ريال دون الرجوع للإدارة.', author: 'سالم الخالدي', createdAt: '10 مارس 2026' },
      { id: 'n2', text: 'طلب تمديد حد الائتمان إلى 250,000 ريال — بانتظار موافقة المدير المالي.', author: 'محمد العمري', createdAt: '01 مايو 2026' },
    ],
    attachments: [
      { id: 'a1', name: 'عقد الإطار التجاري 2026.pdf',          fileType: 'pdf',   size: '1.4 MB', uploadedAt: '01 يناير 2026',   uploadedBy: 'محمد العمري' },
      { id: 'a2', name: 'شهادة التسجيل الضريبي.pdf',             fileType: 'pdf',   size: '420 KB', uploadedAt: '01 يناير 2026',   uploadedBy: 'محمد العمري' },
      { id: 'a3', name: 'السجل التجاري.pdf',                     fileType: 'pdf',   size: '380 KB', uploadedAt: '01 يناير 2026',   uploadedBy: 'محمد العمري' },
    ],
    timeline: [
      { id: 't1', type: 'created',      descriptionAr: 'تم إنشاء حساب العميل',                                author: 'محمد العمري',    timestamp: '01 يناير 2026، 09:00' },
      { id: 't2', type: 'order',        descriptionAr: 'طلب جديد INV-0201 بقيمة 25,000 ر.س',                  author: 'سالم الخالدي',  timestamp: '05 يناير 2026، 11:00', amount: 25000, currency: 'SAR' },
      { id: 't3', type: 'payment',      descriptionAr: 'دفعة مستلمة REC-0301 بقيمة 30,000 ر.س',               author: 'سارة الأحمد',   timestamp: '12 يناير 2026، 10:00', amount: 30000, currency: 'SAR' },
      { id: 't4', type: 'order',        descriptionAr: 'طلب جديد INV-0215 بقيمة 18,500 ر.س',                  author: 'سالم الخالدي',  timestamp: '18 فبراير 2026، 14:00', amount: 18500, currency: 'SAR' },
      { id: 't5', type: 'payment',      descriptionAr: 'دفعة مستلمة REC-0315 بقيمة 20,000 ر.س',               author: 'سارة الأحمد',   timestamp: '15 مارس 2026، 09:00', amount: 20000, currency: 'SAR' },
      { id: 't6', type: 'order',        descriptionAr: 'طلب جديد INV-0241 بقيمة 12,000 ر.س',                  author: 'سالم الخالدي',  timestamp: '20 مايو 2026، 14:00', amount: 12000, currency: 'SAR' },
    ],
    createdAt: '01 يناير 2026',
    updatedAt: '20 مايو 2026',
  },
  {
    id: 'cus-002',
    code: 'CUS-0002',
    nameAr: 'محمد أحمد الزهراني',
    type: 'individual',
    status: 'active',
    tags: ['عميل جديد'],
    phone: '+966 55 987 6543',
    email: 'mzahrani@gmail.com',
    country: 'المملكة العربية السعودية',
    city: 'جدة',
    district: 'حي الروضة',
    currency: 'SAR',
    totalOrders: 8,
    totalOrderValue: 67500,
    totalPaid: 67500,
    outstanding: 0,
    lastOrderDate: '18 مايو 2026',
    lastPaymentDate: '18 مايو 2026',
    assignedSalesperson: 'نورا المطيري',
    contacts: [],
    notes: [],
    attachments: [],
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء حساب العميل',             author: 'نورا المطيري',  timestamp: '14 مارس 2026، 10:00' },
      { id: 't2', type: 'order',   descriptionAr: 'طلب أول INV-0320 بقيمة 8,500 ر.س', author: 'نورا المطيري',  timestamp: '14 مارس 2026، 10:30', amount: 8500,  currency: 'SAR' },
      { id: 't3', type: 'payment', descriptionAr: 'دفعة كاملة REC-0410 بقيمة 8,500 ر.س', author: 'سارة الأحمد', timestamp: '14 مارس 2026، 12:00', amount: 8500, currency: 'SAR' },
    ],
    createdAt: '14 مارس 2026',
    updatedAt: '18 مايو 2026',
  },
  {
    id: 'cus-003',
    code: 'CUS-0003',
    nameAr: 'مستشفى الحياة التخصصي',
    nameEn: 'Al-Hayah Specialist Hospital',
    type: 'government',
    status: 'active',
    tags: ['عميل رئيسي', 'أولوية عالية'],
    phone: '+966 11 456 7890',
    email: 'procurement@hayah-hospital.sa',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    district: 'حي المروج',
    street: 'شارع الملك فهد',
    taxNumber: '300987654300003',
    commercialRegNumber: '1010987654',
    currency: 'SAR',
    creditLimit: 500000,
    totalOrders: 124,
    totalOrderValue: 4850000,
    totalPaid: 4780000,
    outstanding: 70000,
    lastOrderDate: '22 مايو 2026',
    lastPaymentDate: '01 مايو 2026',
    assignedSalesperson: 'أحمد القحطاني',
    contacts: [
      { id: 'c1', nameAr: 'د. خالد العمري',   role: 'مدير المشتريات الطبية', phone: '+966 55 456 7890', email: 'k.omari@hayah-hospital.sa' },
      { id: 'c2', nameAr: 'سارة الشهراني',    role: 'المحاسبة والمالية',      phone: '+966 50 789 0123' },
    ],
    notes: [
      { id: 'n1', text: 'العروض يجب أن تكون مصحوبة بشهادات مطابقة للمواصفات السعودية. مدة الدفع النظامي 60 يوماً.', author: 'أحمد القحطاني', createdAt: '15 يناير 2026' },
    ],
    attachments: [
      { id: 'a1', name: 'عقد التوريد السنوي 2026.pdf',     fileType: 'pdf',   size: '2.1 MB', uploadedAt: '01 يناير 2026', uploadedBy: 'محمد العمري' },
      { id: 'a2', name: 'شروط ومواصفات المستلزمات.xlsx',   fileType: 'excel', size: '850 KB', uploadedAt: '05 يناير 2026', uploadedBy: 'أحمد القحطاني' },
    ],
    timeline: [
      { id: 't1', type: 'created',  descriptionAr: 'تم إنشاء حساب العميل المؤسسي',         author: 'محمد العمري',    timestamp: '01 يناير 2026، 09:00' },
      { id: 't2', type: 'contact',  descriptionAr: 'تحديث بيانات الاتصال — إضافة مدير المشتريات', author: 'أحمد القحطاني', timestamp: '05 يناير 2026، 11:00' },
      { id: 't3', type: 'order',    descriptionAr: 'طلب مستلزمات طبية INV-0105 بقيمة 85,000 ر.س', author: 'أحمد القحطاني', timestamp: '10 يناير 2026، 14:00', amount: 85000, currency: 'SAR' },
      { id: 't4', type: 'payment',  descriptionAr: 'دفعة مستلمة REC-0201 بقيمة 100,000 ر.س', author: 'سارة الأحمد',   timestamp: '01 مارس 2026، 10:00', amount: 100000, currency: 'SAR' },
    ],
    createdAt: '01 يناير 2026',
    updatedAt: '22 مايو 2026',
  },
  {
    id: 'cus-004',
    code: 'CUS-0004',
    nameAr: 'شركة البناء الحديث',
    nameEn: 'Modern Construction Co.',
    type: 'company',
    status: 'inactive',
    tags: ['موسمي'],
    phone: '+971 4 567 8901',
    email: 'info@modern-build.ae',
    country: 'الإمارات العربية المتحدة',
    city: 'دبي',
    district: 'منطقة الجبل علي',
    taxNumber: '100234567800003',
    commercialRegNumber: '2000123456',
    currency: 'AED',
    creditLimit: 150000,
    totalOrders: 15,
    totalOrderValue: 620000,
    totalPaid: 620000,
    outstanding: 0,
    lastOrderDate: '30 نوفمبر 2025',
    lastPaymentDate: '15 ديسمبر 2025',
    assignedSalesperson: 'سالم الخالدي',
    contacts: [
      { id: 'c1', nameAr: 'مهندس رامي السعدي', role: 'مدير المشاريع', phone: '+971 50 567 8901' },
    ],
    notes: [
      { id: 'n1', text: 'العميل يعمل بشكل موسمي — نشط خلال موسم البناء (مارس-نوفمبر) فقط.', author: 'سالم الخالدي', createdAt: '01 ديسمبر 2025' },
    ],
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',      descriptionAr: 'تم إنشاء حساب العميل',                     author: 'محمد العمري',   timestamp: '01 مارس 2025، 09:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'تغيير الحالة: نشط ← غير نشط (خارج الموسم)', author: 'سالم الخالدي', timestamp: '01 ديسمبر 2025، 09:00' },
    ],
    createdAt: '01 مارس 2025',
    updatedAt: '01 ديسمبر 2025',
  },
  {
    id: 'cus-005',
    code: 'CUS-0005',
    nameAr: 'نورة عبدالله المطيري',
    type: 'individual',
    status: 'active',
    tags: ['دفع منتظم'],
    phone: '+965 9912 3456',
    email: 'noura.m@gmail.com',
    country: 'الكويت',
    city: 'الكويت',
    district: 'منطقة السالمية',
    currency: 'KWD',
    totalOrders: 22,
    totalOrderValue: 145000,
    totalPaid: 145000,
    outstanding: 0,
    lastOrderDate: '10 مايو 2026',
    lastPaymentDate: '10 مايو 2026',
    assignedSalesperson: 'نورا المطيري',
    contacts: [],
    notes: [],
    attachments: [],
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء حساب العميل', author: 'نورا المطيري', timestamp: '01 يونيو 2025، 10:00' },
      { id: 't2', type: 'order',   descriptionAr: 'طلب جديد INV-0501 بقيمة 7,200 د.ك',  author: 'نورا المطيري', timestamp: '05 يونيو 2025، 11:00', amount: 7200, currency: 'KWD' },
      { id: 't3', type: 'payment', descriptionAr: 'دفعة مستلمة REC-0601 بقيمة 7,200 د.ك', author: 'سارة الأحمد', timestamp: '05 يونيو 2025، 14:00', amount: 7200, currency: 'KWD' },
    ],
    createdAt: '01 يونيو 2025',
    updatedAt: '10 مايو 2026',
  },
  {
    id: 'cus-006',
    code: 'CUS-0006',
    nameAr: 'شركة التقنية المتقدمة',
    nameEn: 'Advanced Tech Solutions',
    type: 'company',
    status: 'active',
    tags: ['عميل رئيسي', 'بالجملة'],
    phone: '+974 4 234 5678',
    email: 'orders@advtech.qa',
    country: 'قطر',
    city: 'الدوحة',
    district: 'منطقة الدفنة',
    street: 'برج قطر الثاني',
    taxNumber: '500345678900003',
    commercialRegNumber: '3000234567',
    currency: 'QAR',
    creditLimit: 300000,
    totalOrders: 63,
    totalOrderValue: 2180000,
    totalPaid: 2100000,
    outstanding: 80000,
    lastOrderDate: '21 مايو 2026',
    lastPaymentDate: '10 مايو 2026',
    assignedSalesperson: 'أحمد القحطاني',
    contacts: [
      { id: 'c1', nameAr: 'عمر الفيلالي',    role: 'مدير الشراء',   phone: '+974 55 234 5678', email: 'o.filali@advtech.qa' },
      { id: 'c2', nameAr: 'ليلى محمود',      role: 'الحسابات',      phone: '+974 55 678 9012' },
    ],
    notes: [
      { id: 'n1', text: 'العميل يفضل الفواتير الإلكترونية. مدة الدفع المتفق عليها 45 يوماً من تاريخ الفاتورة.', author: 'أحمد القحطاني', createdAt: '20 يناير 2026' },
    ],
    attachments: [
      { id: 'a1', name: 'اتفاقية الأسعار 2026.pdf', fileType: 'pdf', size: '980 KB', uploadedAt: '01 يناير 2026', uploadedBy: 'أحمد القحطاني' },
    ],
    timeline: [
      { id: 't1', type: 'created',  descriptionAr: 'تم إنشاء حساب العميل',                      author: 'محمد العمري',    timestamp: '15 أغسطس 2025، 09:00' },
      { id: 't2', type: 'order',    descriptionAr: 'طلب INV-0601 بقيمة 45,000 ر.ق',              author: 'أحمد القحطاني', timestamp: '01 سبتمبر 2025، 11:00', amount: 45000, currency: 'QAR' },
      { id: 't3', type: 'payment',  descriptionAr: 'دفعة REC-0701 بقيمة 45,000 ر.ق',            author: 'سارة الأحمد',   timestamp: '15 أكتوبر 2025، 10:00', amount: 45000, currency: 'QAR' },
    ],
    createdAt: '15 أغسطس 2025',
    updatedAt: '21 مايو 2026',
  },
  {
    id: 'cus-007',
    code: 'CUS-0007',
    nameAr: 'وزارة الشؤون البلدية والقروية',
    type: 'government',
    status: 'active',
    tags: ['عميل رئيسي', 'أولوية عالية'],
    phone: '+966 11 555 6677',
    email: 'tenders@momra.gov.sa',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    district: 'حي العليا',
    street: 'طريق الملك فهد',
    taxNumber: '300111222300003',
    commercialRegNumber: 'GOV-0007',
    currency: 'SAR',
    creditLimit: 1000000,
    totalOrders: 8,
    totalOrderValue: 3200000,
    totalPaid: 3000000,
    outstanding: 200000,
    lastOrderDate: '15 مايو 2026',
    lastPaymentDate: '01 أبريل 2026',
    assignedSalesperson: 'فاطمة الزهراني',
    contacts: [
      { id: 'c1', nameAr: 'م. عبدالله القرني',  role: 'مدير المنافسات',    phone: '+966 55 555 6677' },
      { id: 'c2', nameAr: 'هنوف الشمري',        role: 'الشؤون المالية',    phone: '+966 50 111 9988' },
    ],
    notes: [
      { id: 'n1', text: 'الدفع عبر أوامر الدفع الحكومية فقط. مدة الدفع 90 يوماً من تاريخ استلام البضاعة ورفع الفاتورة.', author: 'فاطمة الزهراني', createdAt: '01 فبراير 2026' },
    ],
    attachments: [
      { id: 'a1', name: 'عقد رقم 2026/GOV-07.pdf',    fileType: 'pdf',   size: '3.2 MB', uploadedAt: '15 يناير 2026', uploadedBy: 'فاطمة الزهراني' },
      { id: 'a2', name: 'شروط المنافسة والمواصفات.pdf', fileType: 'pdf', size: '1.8 MB', uploadedAt: '10 يناير 2026', uploadedBy: 'محمد العمري' },
    ],
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء حساب العميل الحكومي',           author: 'محمد العمري',    timestamp: '10 يناير 2026، 09:00' },
      { id: 't2', type: 'order',   descriptionAr: 'طلب حكومي INV-0701 بقيمة 800,000 ر.س',   author: 'فاطمة الزهراني', timestamp: '15 يناير 2026، 11:00', amount: 800000, currency: 'SAR' },
      { id: 't3', type: 'payment', descriptionAr: 'أمر دفع حكومي REC-0801 بقيمة 800,000 ر.س', author: 'سارة الأحمد',  timestamp: '01 أبريل 2026، 10:00', amount: 800000, currency: 'SAR' },
    ],
    createdAt: '10 يناير 2026',
    updatedAt: '15 مايو 2026',
  },
  {
    id: 'cus-008',
    code: 'CUS-0008',
    nameAr: 'خالد منصور العنزي',
    type: 'individual',
    status: 'blocked',
    tags: ['تأخر دفع'],
    phone: '+966 50 444 5566',
    country: 'المملكة العربية السعودية',
    city: 'الدمام',
    currency: 'SAR',
    totalOrders: 5,
    totalOrderValue: 42000,
    totalPaid: 24000,
    outstanding: 18000,
    lastOrderDate: '01 فبراير 2026',
    lastPaymentDate: '20 يناير 2026',
    contacts: [],
    notes: [
      { id: 'n1', text: 'تم تجميد الحساب بسبب تأخر السداد المتكرر. لا يُسمح بأي طلبات جديدة حتى تسوية الرصيد المستحق (18,000 ريال).', author: 'محمد العمري', createdAt: '10 مارس 2026' },
    ],
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء حساب العميل',                                 author: 'أحمد القحطاني', timestamp: '01 أكتوبر 2025، 09:00' },
      { id: 't2', type: 'note',          descriptionAr: 'تنبيه: تأخر السداد الثاني',                             author: 'سارة الأحمد',   timestamp: '01 فبراير 2026، 10:00' },
      { id: 't3', type: 'status_change', descriptionAr: 'تغيير الحالة: نشط ← محظور بسبب تأخر السداد',           author: 'محمد العمري',   timestamp: '10 مارس 2026، 09:00' },
    ],
    createdAt: '01 أكتوبر 2025',
    updatedAt: '10 مارس 2026',
  },
  {
    id: 'cus-009',
    code: 'CUS-0009',
    nameAr: 'شركة الخليج للإلكترونيات',
    nameEn: 'Gulf Electronics LLC',
    type: 'company',
    status: 'active',
    tags: ['بالجملة', 'دفع منتظم'],
    phone: '+971 4 678 9012',
    email: 'orders@gulf-elec.ae',
    country: 'الإمارات العربية المتحدة',
    city: 'دبي',
    district: 'منطقة الجميرا',
    taxNumber: '100567890100003',
    commercialRegNumber: '2000567890',
    currency: 'AED',
    creditLimit: 250000,
    totalOrders: 38,
    totalOrderValue: 980000,
    totalPaid: 940000,
    outstanding: 40000,
    lastOrderDate: '19 مايو 2026',
    lastPaymentDate: '30 أبريل 2026',
    assignedSalesperson: 'سالم الخالدي',
    contacts: [
      { id: 'c1', nameAr: 'فيصل الشامي',   role: 'مدير المبيعات',  phone: '+971 50 678 9012', email: 'f.shami@gulf-elec.ae' },
    ],
    notes: [],
    attachments: [
      { id: 'a1', name: 'قائمة الأسعار المتفق عليها Q2-2026.xlsx', fileType: 'excel', size: '1.1 MB', uploadedAt: '01 أبريل 2026', uploadedBy: 'سالم الخالدي' },
    ],
    timeline: [
      { id: 't1', type: 'created',  descriptionAr: 'تم إنشاء حساب العميل',                       author: 'محمد العمري',   timestamp: '01 سبتمبر 2024، 09:00' },
      { id: 't2', type: 'order',    descriptionAr: 'طلب INV-0901 بقيمة 28,000 د.إ',              author: 'سالم الخالدي', timestamp: '10 سبتمبر 2024، 11:00', amount: 28000, currency: 'AED' },
      { id: 't3', type: 'payment',  descriptionAr: 'دفعة REC-1001 بقيمة 28,000 د.إ',             author: 'سارة الأحمد',  timestamp: '25 أكتوبر 2024، 10:00', amount: 28000, currency: 'AED' },
    ],
    createdAt: '01 سبتمبر 2024',
    updatedAt: '19 مايو 2026',
  },
  {
    id: 'cus-010',
    code: 'CUS-0010',
    nameAr: 'ريم محمد الدوسري',
    type: 'individual',
    status: 'inactive',
    tags: [],
    phone: '+973 3900 8877',
    country: 'البحرين',
    city: 'المنامة',
    currency: 'BHD',
    totalOrders: 3,
    totalOrderValue: 12000,
    totalPaid: 12000,
    outstanding: 0,
    lastOrderDate: '20 ديسمبر 2025',
    lastPaymentDate: '25 ديسمبر 2025',
    contacts: [],
    notes: [],
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء حساب العميل',              author: 'نورا المطيري',  timestamp: '01 أكتوبر 2025، 10:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'تغيير الحالة: نشط ← غير نشط',       author: 'محمد العمري',   timestamp: '01 يناير 2026، 09:00' },
    ],
    createdAt: '01 أكتوبر 2025',
    updatedAt: '01 يناير 2026',
  },
  {
    id: 'cus-011',
    code: 'CUS-0011',
    nameAr: 'شركة الفجر للمقاولات',
    nameEn: 'Al-Fajr Contracting Co.',
    type: 'company',
    status: 'active',
    tags: ['عميل رئيسي', 'مُحال'],
    phone: '+966 12 345 6789',
    email: 'contracts@alfajr.sa',
    country: 'المملكة العربية السعودية',
    city: 'مكة المكرمة',
    taxNumber: '300222333400003',
    commercialRegNumber: '4000222333',
    currency: 'SAR',
    creditLimit: 400000,
    totalOrders: 29,
    totalOrderValue: 1850000,
    totalPaid: 1730000,
    outstanding: 120000,
    lastOrderDate: '23 مايو 2026',
    lastPaymentDate: '15 مايو 2026',
    assignedSalesperson: 'فاطمة الزهراني',
    contacts: [
      { id: 'c1', nameAr: 'م. سامر الفجري', role: 'مدير المشتريات', phone: '+966 55 345 6789', email: 's.fajri@alfajr.sa' },
    ],
    notes: [
      { id: 'n1', text: 'محال من شريك العمل عبدالرحمن الغامدي. عميل واعد مع خطط توسع كبيرة في 2026.', author: 'فاطمة الزهراني', createdAt: '01 فبراير 2026' },
    ],
    attachments: [
      { id: 'a1', name: 'عقد إطار 2026 - الفجر.pdf', fileType: 'pdf', size: '1.6 MB', uploadedAt: '05 فبراير 2026', uploadedBy: 'فاطمة الزهراني' },
    ],
    timeline: [
      { id: 't1', type: 'created',  descriptionAr: 'تم إنشاء حساب العميل — إحالة من شريك',    author: 'فاطمة الزهراني', timestamp: '01 فبراير 2026، 09:00' },
      { id: 't2', type: 'order',    descriptionAr: 'طلب أول INV-1101 بقيمة 180,000 ر.س',       author: 'فاطمة الزهراني', timestamp: '10 فبراير 2026، 11:00', amount: 180000, currency: 'SAR' },
      { id: 't3', type: 'payment',  descriptionAr: 'دفعة جزئية REC-1201 بقيمة 100,000 ر.س',  author: 'سارة الأحمد',    timestamp: '01 مارس 2026، 10:00', amount: 100000, currency: 'SAR' },
    ],
    createdAt: '01 فبراير 2026',
    updatedAt: '23 مايو 2026',
  },
  {
    id: 'cus-012',
    code: 'CUS-0012',
    nameAr: 'سعد عبدالرحمن الغامدي',
    type: 'individual',
    status: 'active',
    tags: ['عميل جديد', 'دفع منتظم'],
    phone: '+966 56 333 7744',
    email: 'saad.ghamdi@email.com',
    country: 'المملكة العربية السعودية',
    city: 'المدينة المنورة',
    currency: 'SAR',
    totalOrders: 4,
    totalOrderValue: 28000,
    totalPaid: 28000,
    outstanding: 0,
    lastOrderDate: '14 مايو 2026',
    lastPaymentDate: '14 مايو 2026',
    assignedSalesperson: 'نورا المطيري',
    contacts: [],
    notes: [],
    attachments: [],
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء حساب العميل',              author: 'نورا المطيري', timestamp: '10 أبريل 2026، 10:00' },
      { id: 't2', type: 'order',   descriptionAr: 'طلب أول INV-1201 بقيمة 7,000 ر.س', author: 'نورا المطيري', timestamp: '10 أبريل 2026، 11:00', amount: 7000, currency: 'SAR' },
      { id: 't3', type: 'payment', descriptionAr: 'دفعة REC-1301 بقيمة 7,000 ر.س',    author: 'سارة الأحمد',  timestamp: '10 أبريل 2026، 14:00', amount: 7000, currency: 'SAR' },
    ],
    createdAt: '10 أبريل 2026',
    updatedAt: '14 مايو 2026',
  },
];

// Statement entries for CUS-0001 (opening balance = 15,000 SAR carried from 2025)
export const mockStatementEntries: Record<string, StatementEntry[]> = {
  'cus-001': [
    { id: 's0',  date: '',              type: 'invoice',     reference: '—',         descriptionAr: 'رصيد مرحّل من الفترة السابقة',            debit: 0,      credit: 0,     balance: 15000  },
    { id: 's1',  date: '05 يناير 2026', type: 'invoice',     reference: 'INV-0201',  descriptionAr: 'فاتورة مبيعات — معدات مكتبية',             debit: 25000,  credit: 0,     balance: 40000  },
    { id: 's2',  date: '12 يناير 2026', type: 'payment',     reference: 'REC-0301',  descriptionAr: 'دفعة مستلمة — تحويل بنكي',                 debit: 0,      credit: 30000, balance: 10000  },
    { id: 's3',  date: '18 فبراير 2026',type: 'invoice',     reference: 'INV-0215',  descriptionAr: 'فاتورة مبيعات — أثاث مكتبي',               debit: 18500,  credit: 0,     balance: 28500  },
    { id: 's4',  date: '01 مارس 2026',  type: 'credit_note', reference: 'CN-0041',   descriptionAr: 'إشعار دائن — مرتجع بضاعة',                  debit: 0,      credit: 2500,  balance: 26000  },
    { id: 's5',  date: '15 مارس 2026',  type: 'payment',     reference: 'REC-0315',  descriptionAr: 'دفعة مستلمة — تحويل بنكي',                 debit: 0,      credit: 20000, balance: 6000   },
    { id: 's6',  date: '10 أبريل 2026', type: 'invoice',     reference: 'INV-0230',  descriptionAr: 'فاتورة مبيعات — أجهزة إلكترونية',          debit: 32000,  credit: 0,     balance: 38000  },
    { id: 's7',  date: '22 أبريل 2026', type: 'debit_note',  reference: 'DN-0012',   descriptionAr: 'إشعار مدين — رسوم تأخير سداد',              debit: 500,    credit: 0,     balance: 38500  },
    { id: 's8',  date: '05 مايو 2026',  type: 'payment',     reference: 'REC-0330',  descriptionAr: 'دفعة مستلمة — نقداً',                       debit: 0,      credit: 15000, balance: 23500  },
    { id: 's9',  date: '20 مايو 2026',  type: 'invoice',     reference: 'INV-0241',  descriptionAr: 'فاتورة مبيعات — مستلزمات مكتبية',          debit: 12000,  credit: 0,     balance: 35500  },
  ],
};

// ── Quotations ─────────────────────────────────────────────────────────────────

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface QuotationItem {
  id: string;
  productName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerId: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  status: QuotationStatus;
  issueDateIso: string;
  issueDate: string;
  validUntilIso: string;
  validUntil: string;
  items: QuotationItem[];
  assignedTo?: string;
  notes?: string;
}

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft:    'مسودة',
  sent:     'مُرسل',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  expired:  'منتهي الصلاحية',
};

export const mockQuotations: Quotation[] = [
  {
    id: 'quo-001', quoteNumber: 'QUO-2026-001',
    customerName: 'شركة النخبة للتجارة', customerId: 'cus-001',
    currency: 'SAR', subtotal: 45000, discount: 2250, tax: 6413, totalAmount: 49163,
    status: 'accepted', issueDateIso: '2026-05-01', issueDate: '01 May 2026',
    validUntilIso: '2026-05-31', validUntil: '31 May 2026',
    assignedTo: 'سالم الخالدي',
    items: [
      { id: 'i1', productName: 'طقم مكاتب تنفيذية', qty: 10, unitPrice: 2500, discount: 5, total: 23750 },
      { id: 'i2', productName: 'كراسي مكتبية فاخرة', qty: 20, unitPrice: 850, discount: 5, total: 16150 },
      { id: 'i3', productName: 'خزائن ملفات فولاذية', qty: 5, unitPrice: 1020, discount: 0, total: 5100 },
    ],
  },
  {
    id: 'quo-002', quoteNumber: 'QUO-2026-002',
    customerName: 'مستشفى الحياة التخصصي', customerId: 'cus-003',
    currency: 'SAR', subtotal: 180000, discount: 9000, tax: 25650, totalAmount: 196650,
    status: 'sent', issueDateIso: '2026-05-10', issueDate: '10 May 2026',
    validUntilIso: '2026-06-10', validUntil: '10 Jun 2026',
    assignedTo: 'أحمد القحطاني',
    items: [
      { id: 'i1', productName: 'أجهزة قياس ضغط الدم', qty: 50, unitPrice: 1800, discount: 5, total: 85500 },
      { id: 'i2', productName: 'أسرّة طبية متحركة', qty: 30, unitPrice: 3150, discount: 5, total: 89775 },
    ],
  },
  {
    id: 'quo-003', quoteNumber: 'QUO-2026-003',
    customerName: 'شركة التقنية المتقدمة', customerId: 'cus-006',
    currency: 'QAR', subtotal: 92000, discount: 0, tax: 13800, totalAmount: 105800,
    status: 'draft', issueDateIso: '2026-05-18', issueDate: '18 May 2026',
    validUntilIso: '2026-06-18', validUntil: '18 Jun 2026',
    assignedTo: 'أحمد القحطاني',
    items: [
      { id: 'i1', productName: 'خوادم Dell PowerEdge', qty: 4, unitPrice: 18000, discount: 0, total: 72000 },
      { id: 'i2', productName: 'ذواكر تخزين SSD 4TB', qty: 20, unitPrice: 1000, discount: 0, total: 20000 },
    ],
  },
  {
    id: 'quo-004', quoteNumber: 'QUO-2026-004',
    customerName: 'شركة البناء الحديث', customerId: 'cus-004',
    currency: 'AED', subtotal: 320000, discount: 16000, tax: 45600, totalAmount: 349600,
    status: 'rejected', issueDateIso: '2026-04-20', issueDate: '20 Apr 2026',
    validUntilIso: '2026-05-20', validUntil: '20 May 2026',
    assignedTo: 'سالم الخالدي',
    notes: 'العميل رفض بسبب أسعار المنافسين',
    items: [
      { id: 'i1', productName: 'رافعة شوكية هيدروليكية', qty: 5, unitPrice: 32000, discount: 5, total: 152000 },
      { id: 'i2', productName: 'معدات بناء متنوعة', qty: 1, unitPrice: 168000, discount: 5, total: 159600 },
    ],
  },
  {
    id: 'quo-005', quoteNumber: 'QUO-2026-005',
    customerName: 'محمد أحمد الزهراني', customerId: 'cus-002',
    currency: 'SAR', subtotal: 14500, discount: 0, tax: 2175, totalAmount: 16675,
    status: 'expired', issueDateIso: '2026-04-01', issueDate: '01 Apr 2026',
    validUntilIso: '2026-04-30', validUntil: '30 Apr 2026',
    assignedTo: 'نورا المطيري',
    items: [
      { id: 'i1', productName: 'أثاث منزلي متكامل', qty: 1, unitPrice: 14500, discount: 0, total: 14500 },
    ],
  },
  {
    id: 'quo-006', quoteNumber: 'QUO-2026-006',
    customerName: 'شركة الفجر للمقاولات', customerId: 'cus-011',
    currency: 'SAR', subtotal: 256000, discount: 12800, tax: 36480, totalAmount: 279680,
    status: 'sent', issueDateIso: '2026-05-20', issueDate: '20 May 2026',
    validUntilIso: '2026-06-20', validUntil: '20 Jun 2026',
    assignedTo: 'فاطمة الزهراني',
    items: [
      { id: 'i1', productName: 'مواد بناء متنوعة', qty: 100, unitPrice: 1280, discount: 5, total: 121600 },
      { id: 'i2', productName: 'حديد تسليح', qty: 200, unitPrice: 672, discount: 5, total: 127680 },
    ],
  },
  {
    id: 'quo-007', quoteNumber: 'QUO-2026-007',
    customerName: 'شركة الخليج للإلكترونيات', customerId: 'cus-009',
    currency: 'AED', subtotal: 74000, discount: 3700, tax: 10545, totalAmount: 80845,
    status: 'accepted', issueDateIso: '2026-05-15', issueDate: '15 May 2026',
    validUntilIso: '2026-06-15', validUntil: '15 Jun 2026',
    assignedTo: 'سالم الخالدي',
    items: [
      { id: 'i1', productName: 'شاشات عرض Samsung 55"', qty: 20, unitPrice: 1850, discount: 5, total: 35150 },
      { id: 'i2', productName: 'أجهزة لابتوب HP ProBook', qty: 15, unitPrice: 2580, discount: 5, total: 36765 },
    ],
  },
  {
    id: 'quo-008', quoteNumber: 'QUO-2026-008',
    customerName: 'وزارة الشؤون البلدية', customerId: 'cus-007',
    currency: 'SAR', subtotal: 520000, discount: 26000, tax: 74100, totalAmount: 568100,
    status: 'draft', issueDateIso: '2026-05-23', issueDate: '23 May 2026',
    validUntilIso: '2026-07-23', validUntil: '23 Jul 2026',
    assignedTo: 'فاطمة الزهراني',
    items: [
      { id: 'i1', productName: 'آليات وتجهيزات بلدية', qty: 10, unitPrice: 52000, discount: 5, total: 494000 },
    ],
  },
];

// ── Invoices ───────────────────────────────────────────────────────────────────

export type SalesInvoiceStatus = 'draft' | 'approved' | 'posted' | 'cancelled';
export type SalesInvoiceSource = 'order_based' | 'collection_based' | 'manual';

export interface SalesInvoiceLineItem {
  id: string;
  productName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  status: SalesInvoiceStatus;
  source: SalesInvoiceSource;
  issueDateIso: string;
  issueDate: string;
  dueDateIso: string;
  dueDate: string;
  referenceOrderId?: string;
  referenceCollectionId?: string;
  items: SalesInvoiceLineItem[];
  assignedTo?: string;
  notes?: string;
}

export const SALES_INVOICE_STATUS_LABELS: Record<SalesInvoiceStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمد',
  posted:    'مُرحَّل',
  cancelled: 'ملغي',
};

export const SALES_INVOICE_SOURCE_LABELS: Record<SalesInvoiceSource, string> = {
  order_based:      'مبني على طلب',
  collection_based: 'مبني على تحصيل',
  manual:           'يدوي',
};

export const mockSalesInvoices: SalesInvoice[] = [
  {
    id: 'inv-001', invoiceNumber: 'INV-2026-001',
    customerName: 'شركة النخبة للتجارة', customerId: 'cus-001',
    currency: 'SAR', subtotal: 25000, discount: 0, tax: 3750, totalAmount: 28750,
    paidAmount: 28750,
    status: 'posted', source: 'order_based',
    issueDateIso: '2026-01-05', issueDate: '05 Jan 2026',
    dueDateIso: '2026-02-05', dueDate: '05 Feb 2026',
    referenceOrderId: 'ORD-2026-001',
    assignedTo: 'سالم الخالدي',
    items: [{ id: 'i1', productName: 'طقم مكاتب تنفيذية', qty: 10, unitPrice: 2500, discount: 0, tax: 15, total: 28750 }],
  },
  {
    id: 'inv-002', invoiceNumber: 'INV-2026-002',
    customerName: 'مستشفى الحياة التخصصي', customerId: 'cus-003',
    currency: 'SAR', subtotal: 160000, discount: 0, tax: 24000, totalAmount: 184000,
    paidAmount: 184000,
    status: 'posted', source: 'order_based',
    issueDateIso: '2026-01-18', issueDate: '18 Jan 2026',
    dueDateIso: '2026-03-18', dueDate: '18 Mar 2026',
    referenceOrderId: 'ORD-2026-002',
    assignedTo: 'أحمد القحطاني',
    items: [{ id: 'i1', productName: 'أجهزة حاسوب محمول Dell ProBook', qty: 50, unitPrice: 3200, discount: 0, tax: 15, total: 184000 }],
  },
  {
    id: 'inv-003', invoiceNumber: 'INV-2026-003',
    customerName: 'شركة التقنية المتقدمة', customerId: 'cus-006',
    currency: 'QAR', subtotal: 68000, discount: 3400, tax: 9690, totalAmount: 74290,
    paidAmount: 0,
    status: 'approved', source: 'manual',
    issueDateIso: '2026-05-10', issueDate: '10 May 2026',
    dueDateIso: '2026-06-24', dueDate: '24 Jun 2026',
    assignedTo: 'أحمد القحطاني',
    items: [
      { id: 'i1', productName: 'خوادم Dell PowerEdge', qty: 3, unitPrice: 18000, discount: 5, tax: 15, total: 58995 },
      { id: 'i2', productName: 'ذواكر تخزين SSD', qty: 5, unitPrice: 1000, discount: 0, tax: 15, total: 5750 },
    ],
    notes: 'مدة الدفع 45 يوم',
  },
  {
    id: 'inv-004', invoiceNumber: 'INV-2026-004',
    customerName: 'وزارة الشؤون البلدية', customerId: 'cus-007',
    currency: 'SAR', subtotal: 800000, discount: 0, tax: 120000, totalAmount: 920000,
    paidAmount: 800000,
    status: 'posted', source: 'order_based',
    issueDateIso: '2026-01-15', issueDate: '15 Jan 2026',
    dueDateIso: '2026-04-15', dueDate: '15 Apr 2026',
    referenceOrderId: 'ORD-2026-GOV-01',
    assignedTo: 'فاطمة الزهراني',
    items: [{ id: 'i1', productName: 'آليات وتجهيزات حكومية', qty: 1, unitPrice: 800000, discount: 0, tax: 15, total: 920000 }],
  },
  {
    id: 'inv-005', invoiceNumber: 'INV-2026-005',
    customerName: 'شركة الفجر للمقاولات', customerId: 'cus-011',
    currency: 'SAR', subtotal: 180000, discount: 9000, tax: 25650, totalAmount: 196650,
    paidAmount: 100000,
    status: 'posted', source: 'order_based',
    issueDateIso: '2026-02-10', issueDate: '10 Feb 2026',
    dueDateIso: '2026-03-10', dueDate: '10 Mar 2026',
    referenceOrderId: 'ORD-2026-011',
    assignedTo: 'فاطمة الزهراني',
    items: [{ id: 'i1', productName: 'مواد بناء متنوعة', qty: 100, unitPrice: 1800, discount: 5, tax: 15, total: 196650 }],
  },
  {
    id: 'inv-006', invoiceNumber: 'INV-2026-006',
    customerName: 'شركة الخليج للإلكترونيات', customerId: 'cus-009',
    currency: 'AED', subtotal: 120000, discount: 6000, tax: 17100, totalAmount: 131100,
    paidAmount: 131100,
    status: 'posted', source: 'collection_based',
    issueDateIso: '2026-03-15', issueDate: '15 Mar 2026',
    dueDateIso: '2026-04-30', dueDate: '30 Apr 2026',
    referenceCollectionId: 'COL-2026-009',
    assignedTo: 'سالم الخالدي',
    items: [{ id: 'i1', productName: 'شاشات وأجهزة إلكترونية', qty: 1, unitPrice: 120000, discount: 5, tax: 15, total: 131100 }],
  },
  {
    id: 'inv-007', invoiceNumber: 'INV-2026-007',
    customerName: 'نورة عبدالله المطيري', customerId: 'cus-005',
    currency: 'KWD', subtotal: 8200, discount: 0, tax: 0, totalAmount: 8200,
    paidAmount: 8200,
    status: 'posted', source: 'manual',
    issueDateIso: '2026-04-20', issueDate: '20 Apr 2026',
    dueDateIso: '2026-05-20', dueDate: '20 May 2026',
    assignedTo: 'نورا المطيري',
    items: [{ id: 'i1', productName: 'مستلزمات متنوعة', qty: 1, unitPrice: 8200, discount: 0, tax: 0, total: 8200 }],
  },
  {
    id: 'inv-008', invoiceNumber: 'INV-2026-008',
    customerName: 'سعد عبدالرحمن الغامدي', customerId: 'cus-012',
    currency: 'SAR', subtotal: 14500, discount: 0, tax: 2175, totalAmount: 16675,
    paidAmount: 16675,
    status: 'posted', source: 'manual',
    issueDateIso: '2026-04-10', issueDate: '10 Apr 2026',
    dueDateIso: '2026-05-10', dueDate: '10 May 2026',
    assignedTo: 'نورا المطيري',
    items: [{ id: 'i1', productName: 'أثاث منزلي', qty: 1, unitPrice: 14500, discount: 0, tax: 15, total: 16675 }],
  },
  {
    id: 'inv-009', invoiceNumber: 'INV-2026-009',
    customerName: 'محمد أحمد الزهراني', customerId: 'cus-002',
    currency: 'SAR', subtotal: 32000, discount: 1600, tax: 4560, totalAmount: 34960,
    paidAmount: 0,
    status: 'draft', source: 'manual',
    issueDateIso: '2026-05-22', issueDate: '22 May 2026',
    dueDateIso: '2026-06-22', dueDate: '22 Jun 2026',
    assignedTo: 'نورا المطيري',
    items: [{ id: 'i1', productName: 'أجهزة إلكترونية متنوعة', qty: 4, unitPrice: 8000, discount: 5, tax: 15, total: 34960 }],
  },
  {
    id: 'inv-010', invoiceNumber: 'INV-2026-010',
    customerName: 'شركة البناء الحديث', customerId: 'cus-004',
    currency: 'AED', subtotal: 95000, discount: 0, tax: 14250, totalAmount: 109250,
    paidAmount: 109250,
    status: 'cancelled', source: 'order_based',
    issueDateIso: '2026-03-01', issueDate: '01 Mar 2026',
    dueDateIso: '2026-04-01', dueDate: '01 Apr 2026',
    notes: 'تم الإلغاء بناءً على طلب العميل',
    assignedTo: 'سالم الخالدي',
    items: [{ id: 'i1', productName: 'مواد بناء', qty: 1, unitPrice: 95000, discount: 0, tax: 15, total: 109250 }],
  },
];

// ── Credit Notes ───────────────────────────────────────────────────────────────

export type CreditNoteStatus = 'draft' | 'approved' | 'posted' | 'cancelled';

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerName: string;
  customerId: string;
  currency: string;
  totalAmount: number;
  status: CreditNoteStatus;
  invoiceRef: string;
  reason: string;
  issueDateIso: string;
  issueDate: string;
}

export const CREDIT_NOTE_STATUS_LABELS: Record<CreditNoteStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمد',
  posted:    'مُرحَّل',
  cancelled: 'ملغي',
};

export const mockCreditNotes: CreditNote[] = [
  { id: 'cn-001', creditNoteNumber: 'CN-2026-001', customerName: 'شركة النخبة للتجارة',    customerId: 'cus-001', currency: 'SAR', totalAmount: 2500,   status: 'posted',    invoiceRef: 'INV-2026-001', reason: 'مرتجع بضاعة — عيب في التصنيع',       issueDateIso: '2026-03-01', issueDate: '01 Mar 2026' },
  { id: 'cn-002', creditNoteNumber: 'CN-2026-002', customerName: 'مستشفى الحياة التخصصي', customerId: 'cus-003', currency: 'SAR', totalAmount: 18400,  status: 'posted',    invoiceRef: 'INV-2026-002', reason: 'تعديل سعر متفق عليه لاحقاً',           issueDateIso: '2026-02-15', issueDate: '15 Feb 2026' },
  { id: 'cn-003', creditNoteNumber: 'CN-2026-003', customerName: 'شركة التقنية المتقدمة',  customerId: 'cus-006', currency: 'QAR', totalAmount: 7429,   status: 'approved',  invoiceRef: 'INV-2026-003', reason: 'خصم كمية بعد التسوية',                 issueDateIso: '2026-05-18', issueDate: '18 May 2026' },
  { id: 'cn-004', creditNoteNumber: 'CN-2026-004', customerName: 'شركة الفجر للمقاولات',   customerId: 'cus-011', currency: 'SAR', totalAmount: 9833,   status: 'posted',    invoiceRef: 'INV-2026-005', reason: 'مرتجع جزئي — بضاعة تالفة',             issueDateIso: '2026-03-20', issueDate: '20 Mar 2026' },
  { id: 'cn-005', creditNoteNumber: 'CN-2026-005', customerName: 'شركة الخليج للإلكترونيات', customerId: 'cus-009', currency: 'AED', totalAmount: 13110, status: 'posted',  invoiceRef: 'INV-2026-006', reason: 'تصحيح سعر فاتورة',                      issueDateIso: '2026-04-05', issueDate: '05 Apr 2026' },
  { id: 'cn-006', creditNoteNumber: 'CN-2026-006', customerName: 'نورة عبدالله المطيري',   customerId: 'cus-005', currency: 'KWD', totalAmount: 820,    status: 'draft',     invoiceRef: 'INV-2026-007', reason: 'تصحيح خطأ في الكمية',                  issueDateIso: '2026-05-21', issueDate: '21 May 2026' },
  { id: 'cn-007', creditNoteNumber: 'CN-2026-007', customerName: 'محمد أحمد الزهراني',     customerId: 'cus-002', currency: 'SAR', totalAmount: 3496,   status: 'approved',  invoiceRef: 'INV-2026-009', reason: 'خصم ولاء عميل',                         issueDateIso: '2026-05-23', issueDate: '23 May 2026' },
  { id: 'cn-008', creditNoteNumber: 'CN-2026-008', customerName: 'شركة البناء الحديث',     customerId: 'cus-004', currency: 'AED', totalAmount: 10925,  status: 'cancelled', invoiceRef: 'INV-2026-010', reason: 'إلغاء الفاتورة الأصلية',               issueDateIso: '2026-03-05', issueDate: '05 Mar 2026' },
];

// ── Sales Returns ──────────────────────────────────────────────────────────────

export type ReturnStatus = 'draft' | 'approved' | 'posted' | 'cancelled';
export type ReturnType   = 'with_inventory' | 'without_inventory';

export interface ReturnLineItem {
  id: string;
  productName: string;
  qty: number;
  unitPrice: number;
  total: number;
  reason: string;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  customerName: string;
  customerId: string;
  currency: string;
  totalAmount: number;
  status: ReturnStatus;
  returnType: ReturnType;
  orderRef: string;
  invoiceRef: string;
  issueDateIso: string;
  issueDate: string;
  reason: string;
  items: ReturnLineItem[];
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمد',
  posted:    'مُرحَّل',
  cancelled: 'ملغي',
};

export const RETURN_TYPE_LABELS: Record<ReturnType, string> = {
  with_inventory:    'مع إرجاع مخزون',
  without_inventory: 'بدون إرجاع مخزون',
};

export const mockSalesReturns: SalesReturn[] = [
  {
    id: 'ret-001', returnNumber: 'RET-2026-001',
    customerName: 'شركة النخبة للتجارة', customerId: 'cus-001',
    currency: 'SAR', totalAmount: 5000, status: 'posted', returnType: 'with_inventory',
    orderRef: 'ORD-2026-001', invoiceRef: 'INV-2026-001',
    issueDateIso: '2026-03-10', issueDate: '10 Mar 2026',
    reason: 'عيب في المنتج — كراسي مكتبية',
    items: [{ id: 'i1', productName: 'كرسي مكتبي', qty: 2, unitPrice: 2500, total: 5000, reason: 'عيب في التصنيع' }],
  },
  {
    id: 'ret-002', returnNumber: 'RET-2026-002',
    customerName: 'مستشفى الحياة التخصصي', customerId: 'cus-003',
    currency: 'SAR', totalAmount: 9600, status: 'posted', returnType: 'without_inventory',
    orderRef: 'ORD-2026-002', invoiceRef: 'INV-2026-002',
    issueDateIso: '2026-02-20', issueDate: '20 Feb 2026',
    reason: 'تغيير في المواصفات المطلوبة',
    items: [{ id: 'i1', productName: 'أجهزة حاسوب محمول', qty: 3, unitPrice: 3200, total: 9600, reason: 'تغيير مواصفات' }],
  },
  {
    id: 'ret-003', returnNumber: 'RET-2026-003',
    customerName: 'شركة الفجر للمقاولات', customerId: 'cus-011',
    currency: 'SAR', totalAmount: 18000, status: 'approved', returnType: 'with_inventory',
    orderRef: 'ORD-2026-011', invoiceRef: 'INV-2026-005',
    issueDateIso: '2026-04-15', issueDate: '15 Apr 2026',
    reason: 'مواد بناء لا تطابق المواصفات',
    items: [
      { id: 'i1', productName: 'مواد بناء — باطون', qty: 10, unitPrice: 1200, total: 12000, reason: 'عدم مطابقة جودة' },
      { id: 'i2', productName: 'حديد تسليح', qty: 5, unitPrice: 1200, total: 6000, reason: 'عدم مطابقة مواصفات' },
    ],
  },
  {
    id: 'ret-004', returnNumber: 'RET-2026-004',
    customerName: 'شركة الخليج للإلكترونيات', customerId: 'cus-009',
    currency: 'AED', totalAmount: 7400, status: 'posted', returnType: 'with_inventory',
    orderRef: 'ORD-2026-009', invoiceRef: 'INV-2026-006',
    issueDateIso: '2026-04-22', issueDate: '22 Apr 2026',
    reason: 'أجهزة وصلت تالفة',
    items: [{ id: 'i1', productName: 'شاشات عرض', qty: 4, unitPrice: 1850, total: 7400, reason: 'تلف أثناء الشحن' }],
  },
  {
    id: 'ret-005', returnNumber: 'RET-2026-005',
    customerName: 'محمد أحمد الزهراني', customerId: 'cus-002',
    currency: 'SAR', totalAmount: 3200, status: 'draft', returnType: 'without_inventory',
    orderRef: 'ORD-2026-004', invoiceRef: 'INV-2026-009',
    issueDateIso: '2026-05-22', issueDate: '22 May 2026',
    reason: 'تغيير رأي العميل',
    items: [{ id: 'i1', productName: 'جهاز لابتوب', qty: 1, unitPrice: 3200, total: 3200, reason: 'تغيير رأي' }],
  },
  {
    id: 'ret-006', returnNumber: 'RET-2026-006',
    customerName: 'شركة التقنية المتقدمة', customerId: 'cus-006',
    currency: 'QAR', totalAmount: 18000, status: 'approved', returnType: 'with_inventory',
    orderRef: 'ORD-2026-006', invoiceRef: 'INV-2026-003',
    issueDateIso: '2026-05-20', issueDate: '20 May 2026',
    reason: 'خادم لم يعمل بالمواصفات المطلوبة',
    items: [{ id: 'i1', productName: 'خادم Dell PowerEdge', qty: 1, unitPrice: 18000, total: 18000, reason: 'عيب وظيفي' }],
  },
];

// ── Collections ────────────────────────────────────────────────────────────────

export type CollectionMatchingStatus = 'unmatched' | 'matched' | 'partial';
export type CollectionPaymentMethod  = 'cash' | 'bank_transfer' | 'card' | 'check';

export interface SalesCollection {
  id: string;
  collectionNumber: string;
  customerName: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: CollectionPaymentMethod;
  matchingStatus: CollectionMatchingStatus;
  status: CollectionStatus;
  collectionDateIso: string;
  collectionDate: string;
  reference?: string;
  invoiceRef?: string;
  notes?: string;
  bankAccount?: string;
  checkNumber?: string;
}

export const COLLECTION_MATCHING_LABELS: Record<CollectionMatchingStatus, string> = {
  unmatched: 'غير مرتبط',
  matched:   'مرتبط',
  partial:   'مرتبط جزئياً',
};

export const COLLECTION_PAYMENT_LABELS: Record<CollectionPaymentMethod, string> = {
  cash:          'نقداً',
  bank_transfer: 'تحويل بنكي',
  card:          'بطاقة ائتمانية',
  check:         'شيك',
};

export const mockSalesCollections: SalesCollection[] = [
  { id: 'col-001', collectionNumber: 'COL-2026-001', customerName: 'شركة النخبة للتجارة',       customerId: 'cus-001', amount: 28750,  currency: 'SAR', paymentMethod: 'bank_transfer', matchingStatus: 'matched',   status: 'posted',   collectionDateIso: '2026-01-12', collectionDate: '12 Jan 2026', reference: 'REC-0301',   invoiceRef: 'INV-2026-001', bankAccount: 'IBAN SA20 1000 0000 0012 3456 7890' },
  { id: 'col-002', collectionNumber: 'COL-2026-002', customerName: 'مستشفى الحياة التخصصي',    customerId: 'cus-003', amount: 184000, currency: 'SAR', paymentMethod: 'bank_transfer', matchingStatus: 'matched',   status: 'posted',   collectionDateIso: '2026-01-25', collectionDate: '25 Jan 2026', reference: 'REC-GOV',    invoiceRef: 'INV-2026-002', bankAccount: 'IBAN SA30 2000 0000 0023 4567 8901' },
  { id: 'col-003', collectionNumber: 'COL-2026-003', customerName: 'شركة الفجر للمقاولات',      customerId: 'cus-011', amount: 100000, currency: 'SAR', paymentMethod: 'bank_transfer', matchingStatus: 'partial',   status: 'posted',   collectionDateIso: '2026-03-01', collectionDate: '01 Mar 2026', reference: 'REC-1201',   invoiceRef: 'INV-2026-005', bankAccount: 'IBAN SA40 3000 0000 0034 5678 9012' },
  { id: 'col-004', collectionNumber: 'COL-2026-004', customerName: 'شركة الخليج للإلكترونيات',  customerId: 'cus-009', amount: 131100, currency: 'AED', paymentMethod: 'bank_transfer', matchingStatus: 'matched',   status: 'posted',   collectionDateIso: '2026-03-30', collectionDate: '30 Mar 2026', reference: 'REC-0901',   invoiceRef: 'INV-2026-006', bankAccount: 'IBAN AE07 0331 2345 6789 0123 456' },
  { id: 'col-005', collectionNumber: 'COL-2026-005', customerName: 'نورة عبدالله المطيري',      customerId: 'cus-005', amount: 8200,   currency: 'KWD', paymentMethod: 'cash',          matchingStatus: 'matched',   status: 'posted',   collectionDateIso: '2026-04-20', collectionDate: '20 Apr 2026', reference: 'REC-0501',   invoiceRef: 'INV-2026-007' },
  { id: 'col-006', collectionNumber: 'COL-2026-006', customerName: 'سعد عبدالرحمن الغامدي',    customerId: 'cus-012', amount: 16675,  currency: 'SAR', paymentMethod: 'card',          matchingStatus: 'matched',   status: 'posted',   collectionDateIso: '2026-04-14', collectionDate: '14 Apr 2026', reference: 'REC-1201-B', invoiceRef: 'INV-2026-008' },
  { id: 'col-007', collectionNumber: 'COL-2026-007', customerName: 'شركة النخبة للتجارة',       customerId: 'cus-001', amount: 15000,  currency: 'SAR', paymentMethod: 'bank_transfer', matchingStatus: 'partial',   status: 'posted',   collectionDateIso: '2026-05-05', collectionDate: '05 May 2026', reference: 'REC-0330',   invoiceRef: 'INV-2026-001', bankAccount: 'IBAN SA20 1000 0000 0012 3456 7890' },
  { id: 'col-008', collectionNumber: 'COL-2026-008', customerName: 'شركة التقنية المتقدمة',     customerId: 'cus-006', amount: 45000,  currency: 'QAR', paymentMethod: 'bank_transfer', matchingStatus: 'unmatched', status: 'approved', collectionDateIso: '2026-05-20', collectionDate: '20 May 2026', reference: 'REC-0601-B', notes: 'دفعة مقدمة — لم تُحدد الفاتورة بعد', bankAccount: 'IBAN QA04 QNBA 0000 0000 6931 2345 6789 0' },
  { id: 'col-009', collectionNumber: 'COL-2026-009', customerName: 'وزارة الشؤون البلدية',      customerId: 'cus-007', amount: 800000, currency: 'SAR', paymentMethod: 'bank_transfer', matchingStatus: 'partial',   status: 'posted',   collectionDateIso: '2026-04-01', collectionDate: '01 Apr 2026', reference: 'REC-0801',   invoiceRef: 'INV-2026-004', bankAccount: 'IBAN SA50 4000 0000 0045 6789 0123' },
  { id: 'col-010', collectionNumber: 'COL-2026-010', customerName: 'محمد أحمد الزهراني',        customerId: 'cus-002', amount: 8500,   currency: 'SAR', paymentMethod: 'cash',          matchingStatus: 'unmatched', status: 'approved', collectionDateIso: '2026-05-23', collectionDate: '23 May 2026', reference: 'REC-1001-C', notes: 'دفعة نقدية مسبقة — بانتظار إنشاء الفاتورة' },
  { id: 'col-011', collectionNumber: 'COL-2026-011', customerName: 'شركة الفجر للمقاولات',      customerId: 'cus-011', amount: 80000,  currency: 'SAR', paymentMethod: 'check',         matchingStatus: 'unmatched', status: 'approved', collectionDateIso: '2026-05-24', collectionDate: '24 May 2026', reference: 'CHQ-0022',   checkNumber: 'CHQ-0022', notes: 'شيك مُسلّم — قيد التحصيل' },
  { id: 'col-012', collectionNumber: 'COL-2026-012', customerName: 'شركة الخليج للإلكترونيات',  customerId: 'cus-009', amount: 40000,  currency: 'AED', paymentMethod: 'bank_transfer', matchingStatus: 'unmatched', status: 'approved', collectionDateIso: '2026-05-24', collectionDate: '24 May 2026', reference: 'REC-0902',   notes: 'دفعة جزئية — الفاتورة الجديدة قيد الإعداد', bankAccount: 'IBAN AE07 0331 2345 6789 0123 456' },
];

// ── Settings mock ──────────────────────────────────────────────────────────────

export const mockUser = {
  nameAr: 'محمد العمري',
  name: 'Mohammed Al-Omari',
  email: 'admin@ofs.app',
  roleAr: 'مدير النظام',
  role: 'System Admin',
  initials: 'م',
};

export const mockTenant = {
  nameAr: 'شركة النجاح للتجارة',
  name: 'Al-Najah Trading Co.',
  subdomain: 'alnajah',
  planAr: 'الخطة المحترفة',
  plan: 'Professional Plan',
};

// ── Orders ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'draft' | 'confirmed' | 'processing' | 'shipped'
  | 'delivered' | 'completed' | 'cancelled' | 'returned';

export interface OrderAttachment {
  id: string; name: string; fileType: 'pdf' | 'image' | 'excel';
  size: string; uploadedAt: string; uploadedBy: string;
}

export interface OrderTimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'payment' | 'shipped' | 'note' | 'assigned';
  descriptionAr: string; author: string; timestamp: string;
}

export interface Order {
  id: string; orderNumber: string; externalOrderId?: string;
  orderDate: string; orderDateIso: string;
  customerId?: string; customerName: string;
  country: string; city: string; address: string; phone: string;
  product: string; quantity: number; unitPrice: number; totalAmount: number;
  paidAmount: number; currency: string; paymentMethod: string; receipt?: string;
  notes?: string; status: OrderStatus; assignedTo?: string;
  shippingMethod?: string; shippingTrackingNumber?: string;
  expectedDeliveryDate?: string; deliveredDate?: string;
  attachments: OrderAttachment[]; timeline: OrderTimelineEvent[];
  createdAt: string; updatedAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft:      'مسودة',
  confirmed:  'مؤكد',
  processing: 'قيد التجهيز',
  shipped:    'تم الشحن',
  delivered:  'تم التسليم',
  completed:  'مكتمل',
  cancelled:  'ملغي',
  returned:   'مُرتجع',
};

export const ORDER_PAYMENT_LABELS: Record<string, string> = {
  cash:          'نقداً',
  bank_transfer: 'تحويل بنكي',
  card:          'بطاقة ائتمانية',
  installment:   'أقساط',
  cheque:        'شيك',
};

export const ORDER_CURRENCIES = ['SAR', 'USD', 'EUR', 'AED', 'KWD', 'QAR', 'BHD'];

export const ORDER_SHIPPING_LABELS: Record<string, string> = {
  ground:  'شحن بري',
  air:     'شحن جوي',
  sea:     'شحن بحري',
  express: 'شحن سريع',
  pickup:  'استلام مباشر',
};

export const mockOrders: Order[] = [
  {
    id: 'ord-001', orderNumber: 'ORD-2026-001', externalOrderId: 'EXT-10045',
    orderDate: '05 يناير 2026', orderDateIso: '2026-01-05',
    customerId: 'cus-001', customerName: 'مجموعة الأفق للتجارة',
    country: 'السعودية', city: 'الرياض',
    address: 'طريق الملك فهد، حي العليا، مبنى 14', phone: '+966 11 234 5678',
    product: 'طقم مكاتب تنفيذية', quantity: 10, unitPrice: 2500, totalAmount: 25000,
    paidAmount: 25000, currency: 'SAR', paymentMethod: 'bank_transfer', receipt: 'REC-0301',
    status: 'completed', assignedTo: 'أحمد محمد',
    shippingMethod: 'ground', shippingTrackingNumber: 'TRK-2026-001',
    expectedDeliveryDate: '15 يناير 2026', deliveredDate: '13 يناير 2026',
    notes: 'تم التسليم قبل الموعد المحدد، العميل راضٍ تماماً',
    attachments: [
      { id: 'a1', name: 'فاتورة-ORD-001.pdf', fileType: 'pdf', size: '245 ك.ب', uploadedAt: '05 يناير 2026', uploadedBy: 'أحمد محمد' },
    ],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                           author: 'أحمد محمد',  timestamp: '05 يناير 2026، 09:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'تم تأكيد الطلب',                           author: 'أحمد محمد',  timestamp: '05 يناير 2026، 10:30' },
      { id: 't3', type: 'payment',       descriptionAr: 'استلام دفعة كاملة 25,000 ر.س — REC-0301', author: 'سارة الأحمد', timestamp: '06 يناير 2026، 11:00' },
      { id: 't4', type: 'shipped',       descriptionAr: 'شحن الطلب — TRK-2026-001',                author: 'محمد الفهد',  timestamp: '10 يناير 2026، 08:00' },
      { id: 't5', type: 'status_change', descriptionAr: 'تم الاستلام وإتمام الطلب',                 author: 'محمد الفهد',  timestamp: '13 يناير 2026، 16:00' },
    ],
    createdAt: '05 يناير 2026', updatedAt: '13 يناير 2026',
  },
  {
    id: 'ord-002', orderNumber: 'ORD-2026-002', externalOrderId: 'GOV-20045',
    orderDate: '18 يناير 2026', orderDateIso: '2026-01-18',
    customerId: 'cus-003', customerName: 'وزارة التعليم — قطاع المشتريات',
    country: 'السعودية', city: 'الرياض',
    address: 'حي السفارات، مبنى الوزارة الرئيسي', phone: '+966 11 401 0000',
    product: 'أجهزة حاسوب محمول Dell ProBook', quantity: 50, unitPrice: 3200, totalAmount: 160000,
    paidAmount: 160000, currency: 'SAR', paymentMethod: 'bank_transfer', receipt: 'REC-GOV-2026',
    status: 'completed', assignedTo: 'خالد العمري',
    shippingMethod: 'ground', shippingTrackingNumber: 'TRK-2026-GOV',
    expectedDeliveryDate: '05 فبراير 2026', deliveredDate: '03 فبراير 2026',
    notes: 'طلب حكومي — يتطلب فاتورة ضريبية رسمية',
    attachments: [
      { id: 'a1', name: 'عقد-الشراء-GOV.pdf',       fileType: 'pdf', size: '1.2 م.ب', uploadedAt: '18 يناير 2026', uploadedBy: 'خالد العمري' },
      { id: 'a2', name: 'مواصفات-الأجهزة.pdf',      fileType: 'pdf', size: '380 ك.ب', uploadedAt: '18 يناير 2026', uploadedBy: 'خالد العمري' },
    ],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب الحكومي',                    author: 'خالد العمري', timestamp: '18 يناير 2026، 10:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'تم تأكيد العقد الحكومي',                    author: 'خالد العمري', timestamp: '20 يناير 2026، 12:00' },
      { id: 't3', type: 'payment',       descriptionAr: 'استلام 160,000 ر.س — حوالة حكومية',         author: 'سارة الأحمد', timestamp: '25 يناير 2026، 09:00' },
      { id: 't4', type: 'shipped',       descriptionAr: 'شحن الطلب — TRK-2026-GOV',                 author: 'محمد الفهد',  timestamp: '01 فبراير 2026، 08:00' },
      { id: 't5', type: 'status_change', descriptionAr: 'تم التسليم والاستلام الرسمي',               author: 'خالد العمري', timestamp: '03 فبراير 2026، 14:00' },
    ],
    createdAt: '18 يناير 2026', updatedAt: '03 فبراير 2026',
  },
  {
    id: 'ord-003', orderNumber: 'ORD-2026-003',
    orderDate: '10 فبراير 2026', orderDateIso: '2026-02-10',
    customerId: 'cus-007', customerName: 'شركة ديناميك للتقنية',
    country: 'السعودية', city: 'الرياض',
    address: 'طريق الأمير محمد بن عبدالعزيز، برج المملكة التجاري', phone: '+966 11 567 8901',
    product: 'راوترات Cisco وسويتشات شبكات', quantity: 20, unitPrice: 850, totalAmount: 17000,
    paidAmount: 17000, currency: 'SAR', paymentMethod: 'bank_transfer', receipt: 'REC-0345',
    status: 'completed', assignedTo: 'أحمد محمد',
    shippingMethod: 'express',
    expectedDeliveryDate: '18 فبراير 2026', deliveredDate: '16 فبراير 2026',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                  author: 'أحمد محمد',  timestamp: '10 فبراير 2026، 09:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام 17,000 ر.س — تحويل بنكي',  author: 'سارة الأحمد', timestamp: '11 فبراير 2026، 11:00' },
      { id: 't3', type: 'shipped',       descriptionAr: 'شحن سريع للطلب',                   author: 'محمد الفهد',  timestamp: '14 فبراير 2026، 08:00' },
      { id: 't4', type: 'status_change', descriptionAr: 'تم التسليم وإتمام الطلب',          author: 'أحمد محمد',  timestamp: '16 فبراير 2026، 15:00' },
    ],
    createdAt: '10 فبراير 2026', updatedAt: '16 فبراير 2026',
  },
  {
    id: 'ord-004', orderNumber: 'ORD-2026-004', externalOrderId: 'EXT-10098',
    orderDate: '05 أبريل 2026', orderDateIso: '2026-04-05',
    customerId: 'cus-002', customerName: 'سعيد عبدالله الزهراني',
    country: 'السعودية', city: 'جدة',
    address: 'حي الرحاب، شارع التحلية، منزل 45', phone: '+966 55 123 4567',
    product: 'شاشات Samsung 55" UHD', quantity: 5, unitPrice: 4200, totalAmount: 21000,
    paidAmount: 21000, currency: 'SAR', paymentMethod: 'card', receipt: 'REC-0398',
    status: 'delivered', assignedTo: 'فاطمة السيد',
    shippingMethod: 'ground', shippingTrackingNumber: 'TRK-2026-098',
    expectedDeliveryDate: '20 أبريل 2026', deliveredDate: '18 أبريل 2026',
    attachments: [
      { id: 'a1', name: 'فاتورة-ORD-004.pdf', fileType: 'pdf', size: '198 ك.ب', uploadedAt: '05 أبريل 2026', uploadedBy: 'فاطمة السيد' },
    ],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                    author: 'فاطمة السيد', timestamp: '05 أبريل 2026، 10:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'دفع بالبطاقة 21,000 ر.س — REC-0398', author: 'فاطمة السيد', timestamp: '05 أبريل 2026، 10:30' },
      { id: 't3', type: 'shipped',       descriptionAr: 'شحن الطلب — TRK-2026-098',          author: 'محمد الفهد',  timestamp: '12 أبريل 2026، 09:00' },
      { id: 't4', type: 'status_change', descriptionAr: 'تم التسليم للعميل',                  author: 'محمد الفهد',  timestamp: '18 أبريل 2026، 14:00' },
    ],
    createdAt: '05 أبريل 2026', updatedAt: '18 أبريل 2026',
  },
  {
    id: 'ord-005', orderNumber: 'ORD-2026-005',
    orderDate: '12 أبريل 2026', orderDateIso: '2026-04-12',
    customerId: 'cus-010', customerName: 'شركة النهضة للأغذية',
    country: 'السعودية', city: 'الدمام',
    address: 'المنطقة الصناعية الثانية، مستودع 7', phone: '+966 13 888 2233',
    product: 'معدات تعبئة وتغليف — خط إنتاج', quantity: 1, unitPrice: 85000, totalAmount: 85000,
    paidAmount: 85000, currency: 'SAR', paymentMethod: 'bank_transfer', receipt: 'REC-0412',
    status: 'delivered', assignedTo: 'خالد العمري',
    shippingMethod: 'ground', shippingTrackingNumber: 'TRK-2026-NAHDA',
    expectedDeliveryDate: '30 أبريل 2026', deliveredDate: '28 أبريل 2026',
    notes: 'يشمل التركيب والتشغيل التجريبي',
    attachments: [
      { id: 'a1', name: 'عقد-التوريد-005.pdf', fileType: 'pdf', size: '2.1 م.ب', uploadedAt: '12 أبريل 2026', uploadedBy: 'خالد العمري' },
    ],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                       author: 'خالد العمري', timestamp: '12 أبريل 2026، 09:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'تأكيد العقد والدفعة المقدمة',           author: 'سارة الأحمد', timestamp: '13 أبريل 2026، 11:00' },
      { id: 't3', type: 'shipped',       descriptionAr: 'بدء شحن المعدات الثقيلة',               author: 'محمد الفهد',  timestamp: '20 أبريل 2026، 08:00' },
      { id: 't4', type: 'status_change', descriptionAr: 'تم التسليم والتركيب بنجاح',             author: 'خالد العمري', timestamp: '28 أبريل 2026، 16:00' },
    ],
    createdAt: '12 أبريل 2026', updatedAt: '28 أبريل 2026',
  },
  {
    id: 'ord-006', orderNumber: 'ORD-2026-006', externalOrderId: 'EXT-10120',
    orderDate: '02 مايو 2026', orderDateIso: '2026-05-02',
    customerId: 'cus-004', customerName: 'شركة الصفوة للمقاولات',
    country: 'السعودية', city: 'الدمام',
    address: 'شارع الأمير نايف، حي الفيصلية، مبنى 22', phone: '+966 13 456 7890',
    product: 'مواد بناء — حديد تسليح وأسمنت', quantity: 100, unitPrice: 1200, totalAmount: 120000,
    paidAmount: 60000, currency: 'SAR', paymentMethod: 'bank_transfer', receipt: 'REC-0502',
    status: 'shipped', assignedTo: 'أحمد محمد',
    shippingMethod: 'ground', shippingTrackingNumber: 'TRK-2026-SAFWA',
    expectedDeliveryDate: '15 مايو 2026',
    notes: 'دفعة أولى 60% — الباقي عند الاستلام',
    attachments: [
      { id: 'a1', name: 'مواصفات-المواد.pdf', fileType: 'pdf', size: '560 ك.ب', uploadedAt: '02 مايو 2026', uploadedBy: 'أحمد محمد' },
    ],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                       author: 'أحمد محمد',  timestamp: '02 مايو 2026، 09:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام دفعة أولى 60,000 ر.س',           author: 'سارة الأحمد', timestamp: '03 مايو 2026، 10:00' },
      { id: 't3', type: 'status_change', descriptionAr: 'تأكيد الطلب وبدء التجهيز',              author: 'أحمد محمد',  timestamp: '04 مايو 2026، 08:00' },
      { id: 't4', type: 'shipped',       descriptionAr: 'شحن — TRK-2026-SAFWA',                  author: 'محمد الفهد',  timestamp: '08 مايو 2026، 07:00' },
    ],
    createdAt: '02 مايو 2026', updatedAt: '08 مايو 2026',
  },
  {
    id: 'ord-007', orderNumber: 'ORD-2026-007',
    orderDate: '05 مايو 2026', orderDateIso: '2026-05-05',
    customerId: 'cus-009', customerName: 'جامعة الملك عبدالعزيز',
    country: 'السعودية', city: 'جدة',
    address: 'شارع عبدالله السليمان، الحرم الجامعي الرئيسي', phone: '+966 12 695 2000',
    product: 'معدات مختبر علمي — أجهزة قياس متخصصة', quantity: 15, unitPrice: 3500, totalAmount: 52500,
    paidAmount: 52500, currency: 'SAR', paymentMethod: 'bank_transfer', receipt: 'REC-UNIV-007',
    status: 'shipped', assignedTo: 'خالد العمري',
    shippingMethod: 'express', shippingTrackingNumber: 'TRK-2026-KAU',
    expectedDeliveryDate: '18 مايو 2026',
    notes: 'معدات بحثية حساسة — يتطلب تخليص جمركي',
    attachments: [
      { id: 'a1', name: 'أمر-شراء-جامعي.pdf', fileType: 'pdf', size: '1.5 م.ب', uploadedAt: '05 مايو 2026', uploadedBy: 'خالد العمري' },
    ],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب الجامعي',              author: 'خالد العمري', timestamp: '05 مايو 2026، 10:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام الدفعة الكاملة 52,500 ر.س',     author: 'سارة الأحمد', timestamp: '07 مايو 2026، 09:00' },
      { id: 't3', type: 'shipped',       descriptionAr: 'شحن سريع — TRK-2026-KAU',              author: 'محمد الفهد',  timestamp: '10 مايو 2026، 08:00' },
    ],
    createdAt: '05 مايو 2026', updatedAt: '10 مايو 2026',
  },
  {
    id: 'ord-008', orderNumber: 'ORD-2026-008', externalOrderId: 'INT-5023',
    orderDate: '08 مايو 2026', orderDateIso: '2026-05-08',
    customerName: 'Gulf Medical Supplies LLC',
    country: 'الإمارات', city: 'دبي',
    address: 'Dubai Healthcare City, Building 64', phone: '+971 4 362 1100',
    product: 'أجهزة طبية — مقاييس ضغط وجلوكومترات', quantity: 200, unitPrice: 55, totalAmount: 11000,
    paidAmount: 11000, currency: 'USD', paymentMethod: 'bank_transfer', receipt: 'REC-INT-5023',
    status: 'shipped', assignedTo: 'فاطمة السيد',
    shippingMethod: 'air', shippingTrackingNumber: 'TRK-AIR-5023',
    expectedDeliveryDate: '18 مايو 2026',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب الدولي',              author: 'فاطمة السيد', timestamp: '08 مايو 2026، 11:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'تأكيد التحويل الدولي 11,000 USD',    author: 'سارة الأحمد', timestamp: '09 مايو 2026، 09:00' },
      { id: 't3', type: 'shipped',       descriptionAr: 'شحن جوي — TRK-AIR-5023',             author: 'محمد الفهد',  timestamp: '12 مايو 2026، 06:00' },
    ],
    createdAt: '08 مايو 2026', updatedAt: '12 مايو 2026',
  },
  {
    id: 'ord-009', orderNumber: 'ORD-2026-009',
    orderDate: '10 مايو 2026', orderDateIso: '2026-05-10',
    customerId: 'cus-006', customerName: 'مؤسسة العمران للتطوير',
    country: 'السعودية', city: 'مكة المكرمة',
    address: 'حي العزيزية، طريق المسجد الحرام الدائري', phone: '+966 12 345 7890',
    product: 'مواد عازلة ومقاومة للرطوبة', quantity: 500, unitPrice: 85, totalAmount: 42500,
    paidAmount: 20000, currency: 'SAR', paymentMethod: 'installment',
    status: 'processing', assignedTo: 'أحمد محمد',
    shippingMethod: 'ground',
    expectedDeliveryDate: '25 مايو 2026',
    notes: 'دفع على ثلاثة أقساط — القسط الأول مُسدَّد',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                      author: 'أحمد محمد',  timestamp: '10 مايو 2026، 09:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام القسط الأول 20,000 ر.س',        author: 'سارة الأحمد', timestamp: '11 مايو 2026، 10:00' },
      { id: 't3', type: 'status_change', descriptionAr: 'بدء تجهيز الطلب في المستودع',          author: 'محمد الفهد',  timestamp: '12 مايو 2026، 08:00' },
    ],
    createdAt: '10 مايو 2026', updatedAt: '12 مايو 2026',
  },
  {
    id: 'ord-010', orderNumber: 'ORD-2026-010', externalOrderId: 'EXT-10155',
    orderDate: '12 مايو 2026', orderDateIso: '2026-05-12',
    customerId: 'cus-012', customerName: 'مجموعة المواد الإنشائية',
    country: 'السعودية', city: 'الرياض',
    address: 'المدينة الصناعية، طريق الخرج، مستودع 15', phone: '+966 11 987 6543',
    product: 'رافعات شوكية وجسور متحركة', quantity: 3, unitPrice: 45000, totalAmount: 135000,
    paidAmount: 67500, currency: 'SAR', paymentMethod: 'bank_transfer', receipt: 'REC-0512',
    status: 'processing', assignedTo: 'خالد العمري',
    shippingMethod: 'ground',
    expectedDeliveryDate: '30 مايو 2026',
    notes: '50% مقدم — الباقي عند الاستلام',
    attachments: [
      { id: 'a1', name: 'عقد-التوريد-0510.pdf', fileType: 'pdf', size: '890 ك.ب', uploadedAt: '12 مايو 2026', uploadedBy: 'خالد العمري' },
    ],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                     author: 'خالد العمري', timestamp: '12 مايو 2026، 10:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام دفعة مقدمة 67,500 ر.س',        author: 'سارة الأحمد', timestamp: '13 مايو 2026، 11:00' },
      { id: 't3', type: 'status_change', descriptionAr: 'تأكيد الطلب وبدء التجهيز',            author: 'خالد العمري', timestamp: '14 مايو 2026، 09:00' },
    ],
    createdAt: '12 مايو 2026', updatedAt: '14 مايو 2026',
  },
  {
    id: 'ord-011', orderNumber: 'ORD-2026-011',
    orderDate: '15 مايو 2026', orderDateIso: '2026-05-15',
    customerName: 'شركة الوادي للتجارة',
    country: 'السعودية', city: 'الطائف',
    address: 'حي الشهداء، شارع الوادي 12', phone: '+966 55 987 1234',
    product: 'طقم غرف اجتماعات — طاولة وكراسي', quantity: 2, unitPrice: 18500, totalAmount: 37000,
    paidAmount: 37000, currency: 'SAR', paymentMethod: 'cash',
    status: 'processing', assignedTo: 'فاطمة السيد',
    shippingMethod: 'ground',
    expectedDeliveryDate: '28 مايو 2026',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                        author: 'فاطمة السيد', timestamp: '15 مايو 2026، 11:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام كامل المبلغ نقداً 37,000 ر.س',    author: 'سارة الأحمد', timestamp: '15 مايو 2026، 14:00' },
      { id: 't3', type: 'status_change', descriptionAr: 'بدء التجهيز في المستودع',                author: 'محمد الفهد',  timestamp: '17 مايو 2026، 08:00' },
    ],
    createdAt: '15 مايو 2026', updatedAt: '17 مايو 2026',
  },
  {
    id: 'ord-012', orderNumber: 'ORD-2026-012',
    orderDate: '18 مايو 2026', orderDateIso: '2026-05-18',
    customerId: 'cus-005', customerName: 'نورة خالد الراشد',
    country: 'السعودية', city: 'الرياض',
    address: 'حي المروج، شارع الأمير سلطان، فيلا 8', phone: '+966 50 234 5678',
    product: 'نظام تحكم منزلي ذكي — باقة متكاملة', quantity: 1, unitPrice: 12500, totalAmount: 12500,
    paidAmount: 12500, currency: 'SAR', paymentMethod: 'card',
    status: 'confirmed', assignedTo: 'فاطمة السيد',
    expectedDeliveryDate: '28 مايو 2026',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',          author: 'فاطمة السيد', timestamp: '18 مايو 2026، 10:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'دفع بالبطاقة 12,500 ر.س', author: 'سارة الأحمد', timestamp: '18 مايو 2026، 10:30' },
      { id: 't3', type: 'status_change', descriptionAr: 'تم تأكيد الطلب',           author: 'فاطمة السيد', timestamp: '18 مايو 2026، 11:00' },
    ],
    createdAt: '18 مايو 2026', updatedAt: '18 مايو 2026',
  },
  {
    id: 'ord-013', orderNumber: 'ORD-2026-013', externalOrderId: 'EXT-10180',
    orderDate: '19 مايو 2026', orderDateIso: '2026-05-19',
    customerId: 'cus-008', customerName: 'فيصل إبراهيم القحطاني',
    country: 'السعودية', city: 'الرياض',
    address: 'حي قرطبة، شارع عثمان بن عفان، منزل 31', phone: '+966 50 789 0123',
    product: 'نظام كاميرات مراقبة — 32 كاميرا IP', quantity: 1, unitPrice: 28000, totalAmount: 28000,
    paidAmount: 14000, currency: 'SAR', paymentMethod: 'installment',
    status: 'confirmed', assignedTo: 'أحمد محمد',
    expectedDeliveryDate: '01 يونيو 2026',
    notes: 'قسطان — الأول مُسدَّد والثاني عند التركيب',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                author: 'أحمد محمد',  timestamp: '19 مايو 2026، 09:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام القسط الأول 14,000 ر.س',  author: 'سارة الأحمد', timestamp: '19 مايو 2026، 11:00' },
      { id: 't3', type: 'status_change', descriptionAr: 'تأكيد الطلب',                   author: 'أحمد محمد',  timestamp: '20 مايو 2026، 09:00' },
    ],
    createdAt: '19 مايو 2026', updatedAt: '20 مايو 2026',
  },
  {
    id: 'ord-014', orderNumber: 'ORD-2026-014',
    orderDate: '20 مايو 2026', orderDateIso: '2026-05-20',
    customerId: 'cus-011', customerName: 'هيثم محمد الدوسري',
    country: 'السعودية', city: 'الرياض',
    address: 'حي النزهة، شارع الأندلس، شقة 5', phone: '+966 55 321 0987',
    product: 'طابعات ليزر ملونة A3 + مواد طباعة', quantity: 3, unitPrice: 3200, totalAmount: 9600,
    paidAmount: 9600, currency: 'SAR', paymentMethod: 'cash',
    status: 'confirmed', assignedTo: 'فاطمة السيد',
    expectedDeliveryDate: '28 مايو 2026',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',            author: 'فاطمة السيد', timestamp: '20 مايو 2026، 14:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام المبلغ نقداً 9,600 ر.س', author: 'سارة الأحمد', timestamp: '20 مايو 2026، 14:30' },
      { id: 't3', type: 'status_change', descriptionAr: 'تأكيد الطلب',                 author: 'فاطمة السيد', timestamp: '21 مايو 2026، 09:00' },
    ],
    createdAt: '20 مايو 2026', updatedAt: '21 مايو 2026',
  },
  {
    id: 'ord-015', orderNumber: 'ORD-2026-015',
    orderDate: '21 مايو 2026', orderDateIso: '2026-05-21',
    customerName: 'شركة الأصيل للخدمات',
    country: 'السعودية', city: 'الرياض',
    address: 'حي السليمانية، شارع عبدالرحمن الغافقي', phone: '+966 11 445 6677',
    product: 'برامج إدارة مخازن — 5 تراخيص + تدريب', quantity: 5, unitPrice: 2800, totalAmount: 14000,
    paidAmount: 0, currency: 'SAR', paymentMethod: 'bank_transfer',
    status: 'draft', assignedTo: 'أحمد محمد',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء المسودة', author: 'أحمد محمد', timestamp: '21 مايو 2026، 10:00' },
    ],
    createdAt: '21 مايو 2026', updatedAt: '21 مايو 2026',
  },
  {
    id: 'ord-016', orderNumber: 'ORD-2026-016',
    orderDate: '22 مايو 2026', orderDateIso: '2026-05-22',
    customerId: 'cus-002', customerName: 'سعيد عبدالله الزهراني',
    country: 'السعودية', city: 'جدة',
    address: 'حي الرحاب، شارع التحلية، منزل 45', phone: '+966 55 123 4567',
    product: 'نظام صوتيات احترافي — مكبرات وميكسر', quantity: 1, unitPrice: 16500, totalAmount: 16500,
    paidAmount: 0, currency: 'SAR', paymentMethod: 'cash',
    status: 'draft', assignedTo: 'فاطمة السيد',
    notes: 'بانتظار تأكيد المواصفات من العميل',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created', descriptionAr: 'تم إنشاء المسودة',                           author: 'فاطمة السيد', timestamp: '22 مايو 2026، 15:00' },
      { id: 't2', type: 'note',    descriptionAr: 'بانتظار تأكيد المواصفات من العميل',            author: 'فاطمة السيد', timestamp: '23 مايو 2026، 09:00' },
    ],
    createdAt: '22 مايو 2026', updatedAt: '23 مايو 2026',
  },
  {
    id: 'ord-017', orderNumber: 'ORD-2026-017', externalOrderId: 'EXT-10088',
    orderDate: '15 مارس 2026', orderDateIso: '2026-03-15',
    customerId: 'cus-001', customerName: 'مجموعة الأفق للتجارة',
    country: 'السعودية', city: 'الرياض',
    address: 'طريق الملك فهد، حي العليا، مبنى 14', phone: '+966 11 234 5678',
    product: 'طابعات صناعية واسعة الطيف', quantity: 5, unitPrice: 8500, totalAmount: 42500,
    paidAmount: 0, currency: 'SAR', paymentMethod: 'bank_transfer',
    status: 'cancelled', assignedTo: 'خالد العمري',
    notes: 'إلغاء بطلب العميل — قرار تغيير الموردين',
    attachments: [],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                      author: 'خالد العمري', timestamp: '15 مارس 2026، 10:00' },
      { id: 't2', type: 'status_change', descriptionAr: 'تأكيد الطلب',                         author: 'خالد العمري', timestamp: '16 مارس 2026، 09:00' },
      { id: 't3', type: 'note',          descriptionAr: 'العميل طلب التأخير لأسبوعين',           author: 'خالد العمري', timestamp: '25 مارس 2026، 11:00' },
      { id: 't4', type: 'status_change', descriptionAr: 'إلغاء الطلب بطلب العميل',              author: 'خالد العمري', timestamp: '30 مارس 2026، 14:00' },
    ],
    createdAt: '15 مارس 2026', updatedAt: '30 مارس 2026',
  },
  {
    id: 'ord-018', orderNumber: 'ORD-2026-018',
    orderDate: '20 أبريل 2026', orderDateIso: '2026-04-20',
    customerId: 'cus-004', customerName: 'شركة الصفوة للمقاولات',
    country: 'السعودية', city: 'الدمام',
    address: 'شارع الأمير نايف، حي الفيصلية، مبنى 22', phone: '+966 13 456 7890',
    product: 'معدات حفر — مثاقب وأدوات ثقيلة', quantity: 8, unitPrice: 3750, totalAmount: 30000,
    paidAmount: 30000, currency: 'SAR', paymentMethod: 'cash', receipt: 'REC-RET-018',
    status: 'returned', assignedTo: 'أحمد محمد',
    deliveredDate: '28 أبريل 2026',
    notes: 'مرتجع — المعدات لا تطابق المواصفات المطلوبة',
    attachments: [
      { id: 'a1', name: 'محضر-مرتجع-018.pdf', fileType: 'pdf', size: '320 ك.ب', uploadedAt: '05 مايو 2026', uploadedBy: 'أحمد محمد' },
    ],
    timeline: [
      { id: 't1', type: 'created',       descriptionAr: 'تم إنشاء الطلب',                               author: 'أحمد محمد',  timestamp: '20 أبريل 2026، 09:00' },
      { id: 't2', type: 'payment',       descriptionAr: 'استلام المبلغ كاملاً 30,000 ر.س نقداً',         author: 'سارة الأحمد', timestamp: '20 أبريل 2026، 11:00' },
      { id: 't3', type: 'shipped',       descriptionAr: 'شحن وتسليم الطلب',                              author: 'محمد الفهد',  timestamp: '25 أبريل 2026، 08:00' },
      { id: 't4', type: 'status_change', descriptionAr: 'طلب إرجاع — عدم مطابقة المواصفات',              author: 'أحمد محمد',  timestamp: '05 مايو 2026، 10:00' },
      { id: 't5', type: 'status_change', descriptionAr: 'اكتمال إجراءات المرتجع وإعادة المبلغ',          author: 'سارة الأحمد', timestamp: '10 مايو 2026، 14:00' },
    ],
    createdAt: '20 أبريل 2026', updatedAt: '10 مايو 2026',
  },
];

// ── Import Center ──────────────────────────────────────────────────────────────

export type ImportStatus = 'completed' | 'partial' | 'failed' | 'processing' | 'draft';
export type ImportSource = 'google_sheets' | 'excel' | 'csv';
export type ImportTarget = 'customers' | 'orders' | 'leads' | 'products';

export const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  completed:  'مكتمل',
  partial:    'جزئي',
  failed:     'فاشل',
  processing: 'جاري المعالجة',
  draft:      'مسودة',
};

export const IMPORT_SOURCE_LABELS: Record<ImportSource, string> = {
  google_sheets: 'Google Sheets',
  excel:         'Excel',
  csv:           'CSV',
};

export const IMPORT_TARGET_LABELS: Record<ImportTarget, string> = {
  customers: 'العملاء',
  orders:    'الطلبات',
  leads:     'العملاء المحتملون',
  products:  'المنتجات',
};

export interface ImportFieldMap {
  sourceColumn:  string;
  targetField:   string;
  targetLabelAr: string;
  required:      boolean;
}

export interface ImportValidationIssue {
  row:           number;
  field:         string;
  fieldAr:       string;
  value:         string;
  type:          'error' | 'warning';
  messageAr:     string;
  suggestedFix?: string;
}

export interface ImportRecord {
  id:           string;
  name:         string;
  source:       ImportSource;
  target:       ImportTarget;
  status:       ImportStatus;
  fileName?:    string;
  fileSize?:    string;
  sheetUrl?:    string;
  totalRows:    number;
  successRows:  number;
  errorRows:    number;
  warningRows:  number;
  skippedRows:  number;
  fieldMappings:    ImportFieldMap[];
  validationIssues: ImportValidationIssue[];
  createdBy:    string;
  createdAt:    string;
  completedAt?: string;
  notes?:       string;
}

export const mockImports: ImportRecord[] = [
  {
    id: 'imp-001', name: 'استيراد عملاء — أبريل 2026',
    source: 'excel', target: 'customers', status: 'completed',
    fileName: 'customers-april-2026.xlsx', fileSize: '145 ك.ب',
    totalRows: 50, successRows: 47, errorRows: 3, warningRows: 5, skippedRows: 3,
    fieldMappings: [
      { sourceColumn: 'Name',          targetField: 'nameAr',      targetLabelAr: 'الاسم',               required: true  },
      { sourceColumn: 'Phone Number',  targetField: 'phone',       targetLabelAr: 'الهاتف',              required: true  },
      { sourceColumn: 'Email',         targetField: 'email',       targetLabelAr: 'البريد الإلكتروني',   required: false },
      { sourceColumn: 'City',          targetField: 'city',        targetLabelAr: 'المدينة',             required: false },
      { sourceColumn: 'Credit Limit',  targetField: 'creditLimit', targetLabelAr: 'حد الائتمان',         required: false },
    ],
    validationIssues: [
      { row: 3,  field: 'email',       fieldAr: 'البريد الإلكتروني', value: 'ahmed.gmail.com', type: 'error',   messageAr: 'صيغة البريد الإلكتروني غير صحيحة',              suggestedFix: 'ahmed@gmail.com' },
      { row: 7,  field: 'phone',       fieldAr: 'الهاتف',            value: '0501',            type: 'error',   messageAr: 'رقم الهاتف قصير جداً — يجب 10 أرقام على الأقل' },
      { row: 12, field: 'creditLimit', fieldAr: 'حد الائتمان',       value: '-500',            type: 'error',   messageAr: 'حد الائتمان لا يمكن أن يكون سالباً',            suggestedFix: '500' },
      { row: 5,  field: 'email',       fieldAr: 'البريد الإلكتروني', value: '',                type: 'warning', messageAr: 'البريد الإلكتروني فارغ (حقل اختياري)' },
      { row: 15, field: 'city',        fieldAr: 'المدينة',           value: 'riyadh',          type: 'warning', messageAr: 'يُفضّل الإدخال بالعربية',                        suggestedFix: 'الرياض' },
    ],
    createdBy: 'أحمد محمد', createdAt: '01 أبريل 2026', completedAt: '01 أبريل 2026',
  },
  {
    id: 'imp-002', name: 'استيراد طلبات — أبريل 2026',
    source: 'csv', target: 'orders', status: 'completed',
    fileName: 'orders-april-2026.csv', fileSize: '89 ك.ب',
    totalRows: 120, successRows: 115, errorRows: 5, warningRows: 8, skippedRows: 5,
    fieldMappings: [
      { sourceColumn: 'Order Date',    targetField: 'orderDate',    targetLabelAr: 'تاريخ الطلب (DD MMM YYYY)', required: true  },
      { sourceColumn: 'Customer Name', targetField: 'customerName', targetLabelAr: 'اسم العميل',               required: true  },
      { sourceColumn: 'Product',       targetField: 'product',      targetLabelAr: 'المنتج',                   required: true  },
      { sourceColumn: 'Quantity',      targetField: 'quantity',     targetLabelAr: 'الكمية',                   required: true  },
      { sourceColumn: 'Paid Amount',   targetField: 'paidAmount',   targetLabelAr: 'المبلغ المدفوع',           required: false },
    ],
    validationIssues: [
      { row: 5,  field: 'orderDate', fieldAr: 'تاريخ الطلب', value: '2024-01-15',  type: 'error',   messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '15 يناير 2024' },
      { row: 10, field: 'quantity',  fieldAr: 'الكمية',       value: '-3',          type: 'error',   messageAr: 'الكمية لا يمكن أن تكون سالبة',                          suggestedFix: '3' },
      { row: 22, field: 'orderDate', fieldAr: 'تاريخ الطلب', value: '01/05/2024',  type: 'error',   messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '01 مايو 2024' },
      { row: 8,  field: 'currency',  fieldAr: 'العملة',       value: 'QR',          type: 'warning', messageAr: 'رمز عملة غير معروف — سيُستخدم SAR افتراضياً',           suggestedFix: 'QAR' },
      { row: 14, field: 'paidAmount',fieldAr: 'المبلغ المدفوع',value: '',           type: 'warning', messageAr: 'المبلغ المدفوع فارغ — سيُعامل كـ 0' },
    ],
    createdBy: 'سارة الأحمد', createdAt: '10 أبريل 2026', completedAt: '10 أبريل 2026',
  },
  {
    id: 'imp-003', name: 'استيراد عملاء محتملون — Google Sheets',
    source: 'google_sheets', target: 'leads', status: 'partial',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
    totalRows: 80, successRows: 60, errorRows: 20, warningRows: 10, skippedRows: 20,
    fieldMappings: [
      { sourceColumn: 'Client',       targetField: 'customerName', targetLabelAr: 'اسم العميل',         required: true  },
      { sourceColumn: 'Mobile',       targetField: 'phone',        targetLabelAr: 'الهاتف',             required: true  },
      { sourceColumn: 'Service',      targetField: 'product',      targetLabelAr: 'المنتج / الخدمة',    required: false },
      { sourceColumn: 'Date',         targetField: 'orderDate',    targetLabelAr: 'التاريخ (DD MMM YYYY)', required: false },
      { sourceColumn: 'Budget',       targetField: 'paidAmount',   targetLabelAr: 'الميزانية',           required: false },
    ],
    validationIssues: [
      { row: 2,  field: 'phone',        fieldAr: 'الهاتف',     value: '123',        type: 'error',   messageAr: 'رقم الهاتف غير صحيح' },
      { row: 6,  field: 'customerName', fieldAr: 'اسم العميل', value: '',           type: 'error',   messageAr: 'اسم العميل مطلوب' },
      { row: 11, field: 'orderDate',    fieldAr: 'التاريخ',    value: '2024/03/10', type: 'error',   messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '10 مارس 2024' },
      { row: 4,  field: 'city',         fieldAr: 'المدينة',    value: '',           type: 'warning', messageAr: 'المدينة فارغة (حقل اختياري)' },
    ],
    createdBy: 'خالد العمري', createdAt: '20 أبريل 2026', completedAt: '20 أبريل 2026',
    notes: 'تم استيراد 60 سجلاً بنجاح وتخطي 20 سجلاً بسبب أخطاء التحقق',
  },
  {
    id: 'imp-004', name: 'استيراد عملاء — قالب خاطئ',
    source: 'excel', target: 'customers', status: 'failed',
    fileName: 'wrong-template.xlsx', fileSize: '320 ك.ب',
    totalRows: 200, successRows: 0, errorRows: 200, warningRows: 0, skippedRows: 200,
    fieldMappings: [
      { sourceColumn: 'Full Name', targetField: 'nameAr', targetLabelAr: 'الاسم', required: true },
      { sourceColumn: 'Tel',       targetField: 'phone',  targetLabelAr: 'الهاتف', required: true },
    ],
    validationIssues: [
      { row: 1, field: 'nameAr', fieldAr: 'الاسم', value: 'NULL', type: 'error', messageAr: 'قيمة فارغة في حقل مطلوب — كل الصفوف تحتوي على قيم فارغة في عمود الاسم' },
      { row: 1, field: 'phone',  fieldAr: 'الهاتف', value: 'NULL', type: 'error', messageAr: 'قيمة فارغة في حقل مطلوب — يبدو أن القالب المستخدم غير صحيح' },
    ],
    createdBy: 'أحمد محمد', createdAt: '28 أبريل 2026',
    notes: 'فشل الاستيراد بالكامل — القالب المستخدم لا يتوافق مع متطلبات النظام',
  },
  {
    id: 'imp-005', name: 'استيراد عملاء جدد — مايو 2026',
    source: 'csv', target: 'customers', status: 'completed',
    fileName: 'new-customers-may.csv', fileSize: '42 ك.ب',
    totalRows: 30, successRows: 30, errorRows: 0, warningRows: 0, skippedRows: 0,
    fieldMappings: [
      { sourceColumn: 'Name',   targetField: 'nameAr', targetLabelAr: 'الاسم',  required: true },
      { sourceColumn: 'Phone',  targetField: 'phone',  targetLabelAr: 'الهاتف', required: true },
      { sourceColumn: 'City',   targetField: 'city',   targetLabelAr: 'المدينة',required: false },
    ],
    validationIssues: [],
    createdBy: 'فاطمة السيد', createdAt: '05 مايو 2026', completedAt: '05 مايو 2026',
  },
  {
    id: 'imp-006', name: 'استيراد طلبات — جاري المعالجة',
    source: 'google_sheets', target: 'orders', status: 'processing',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123def456',
    totalRows: 90, successRows: 45, errorRows: 2, warningRows: 3, skippedRows: 0,
    fieldMappings: [
      { sourceColumn: 'Date',     targetField: 'orderDate',    targetLabelAr: 'تاريخ الطلب', required: true },
      { sourceColumn: 'Customer', targetField: 'customerName', targetLabelAr: 'اسم العميل',  required: true },
      { sourceColumn: 'Product',  targetField: 'product',      targetLabelAr: 'المنتج',       required: true },
      { sourceColumn: 'Qty',      targetField: 'quantity',     targetLabelAr: 'الكمية',       required: true },
    ],
    validationIssues: [],
    createdBy: 'خالد العمري', createdAt: '24 مايو 2026',
  },
  {
    id: 'imp-007', name: 'استيراد عملاء محتملون — Excel',
    source: 'excel', target: 'leads', status: 'completed',
    fileName: 'leads-q1-2026.xlsx', fileSize: '78 ك.ب',
    totalRows: 45, successRows: 44, errorRows: 1, warningRows: 3, skippedRows: 1,
    fieldMappings: [
      { sourceColumn: 'Customer Name', targetField: 'customerName', targetLabelAr: 'اسم العميل', required: true },
      { sourceColumn: 'Mobile',        targetField: 'phone',        targetLabelAr: 'الهاتف',     required: true },
      { sourceColumn: 'Product',       targetField: 'product',      targetLabelAr: 'المنتج',     required: false },
      { sourceColumn: 'Date',          targetField: 'orderDate',    targetLabelAr: 'التاريخ',    required: false },
    ],
    validationIssues: [
      { row: 18, field: 'phone', fieldAr: 'الهاتف', value: '9665', type: 'error', messageAr: 'رقم الهاتف غير مكتمل' },
      { row: 7,  field: 'orderDate', fieldAr: 'التاريخ', value: '2025-11-20', type: 'warning', messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '20 نوفمبر 2025' },
    ],
    createdBy: 'أحمد محمد', createdAt: '10 مايو 2026', completedAt: '10 مايو 2026',
  },
  {
    id: 'imp-008', name: 'استيراد المنتجات — كتالوج 2026',
    source: 'csv', target: 'products', status: 'completed',
    fileName: 'products-catalog-2026.csv', fileSize: '210 ك.ب',
    totalRows: 150, successRows: 148, errorRows: 2, warningRows: 5, skippedRows: 2,
    fieldMappings: [
      { sourceColumn: 'Product Name', targetField: 'nameAr',   targetLabelAr: 'اسم المنتج',   required: true },
      { sourceColumn: 'SKU',          targetField: 'sku',       targetLabelAr: 'رمز المنتج',   required: true },
      { sourceColumn: 'Price',        targetField: 'price',     targetLabelAr: 'السعر',         required: true },
      { sourceColumn: 'Category',     targetField: 'category',  targetLabelAr: 'الفئة',        required: false },
      { sourceColumn: 'Stock',        targetField: 'stock',     targetLabelAr: 'المخزون',      required: false },
    ],
    validationIssues: [
      { row: 3,  field: 'price', fieldAr: 'السعر',     value: 'N/A', type: 'error',   messageAr: 'السعر يجب أن يكون رقماً',     suggestedFix: '0' },
      { row: 7,  field: 'stock', fieldAr: 'المخزون',   value: '-10', type: 'warning', messageAr: 'قيمة المخزون سالبة' },
      { row: 12, field: 'sku',   fieldAr: 'رمز المنتج', value: '',   type: 'error',   messageAr: 'رمز المنتج مطلوب' },
    ],
    createdBy: 'خالد العمري', createdAt: '15 مايو 2026', completedAt: '15 مايو 2026',
  },
  {
    id: 'imp-009', name: 'استيراد عملاء — مسودة',
    source: 'excel', target: 'customers', status: 'draft',
    fileName: 'customers-draft.xlsx', fileSize: '95 ك.ب',
    totalRows: 0, successRows: 0, errorRows: 0, warningRows: 0, skippedRows: 0,
    fieldMappings: [],
    validationIssues: [],
    createdBy: 'سارة الأحمد', createdAt: '22 مايو 2026',
    notes: 'مسودة — لم يُكتمل ربط الحقول بعد',
  },
  {
    id: 'imp-010', name: 'استيراد طلبات — بيانات جزئية',
    source: 'csv', target: 'orders', status: 'partial',
    fileName: 'orders-partial-may.csv', fileSize: '67 ك.ب',
    totalRows: 60, successRows: 45, errorRows: 15, warningRows: 6, skippedRows: 15,
    fieldMappings: [
      { sourceColumn: 'Order Date',    targetField: 'orderDate',    targetLabelAr: 'تاريخ الطلب', required: true },
      { sourceColumn: 'Customer',      targetField: 'customerName', targetLabelAr: 'اسم العميل',  required: true },
      { sourceColumn: 'Product',       targetField: 'product',      targetLabelAr: 'المنتج',      required: true },
    ],
    validationIssues: [
      { row: 4,  field: 'orderDate', fieldAr: 'تاريخ الطلب', value: '2025-08-10', type: 'error',   messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '10 أغسطس 2025' },
      { row: 9,  field: 'orderDate', fieldAr: 'تاريخ الطلب', value: '12-25-2025', type: 'error',   messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '25 ديسمبر 2025' },
      { row: 15, field: 'quantity',  fieldAr: 'الكمية',       value: '',           type: 'error',   messageAr: 'الكمية مطلوبة' },
      { row: 6,  field: 'paidAmount',fieldAr: 'المدفوع',      value: '',           type: 'warning', messageAr: 'المبلغ المدفوع فارغ — سيُعامل كـ 0' },
    ],
    createdBy: 'فاطمة السيد', createdAt: '18 مايو 2026', completedAt: '18 مايو 2026',
  },
  {
    id: 'imp-011', name: 'استيراد عملاء — فشل كامل (أخطاء تاريخ)',
    source: 'google_sheets', target: 'customers', status: 'failed',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1xyz789',
    totalRows: 100, successRows: 0, errorRows: 100, warningRows: 0, skippedRows: 100,
    fieldMappings: [
      { sourceColumn: 'الاسم',    targetField: 'nameAr', targetLabelAr: 'الاسم',  required: true },
      { sourceColumn: 'الهاتف',   targetField: 'phone',  targetLabelAr: 'الهاتف', required: true },
      { sourceColumn: 'تاريخ التسجيل', targetField: 'createdAt', targetLabelAr: 'تاريخ التسجيل', required: true },
    ],
    validationIssues: [
      { row: 1, field: 'createdAt', fieldAr: 'تاريخ التسجيل', value: '2024-01-05', type: 'error', messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '05 يناير 2024' },
      { row: 2, field: 'createdAt', fieldAr: 'تاريخ التسجيل', value: '2024-02-10', type: 'error', messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '10 فبراير 2024' },
      { row: 3, field: 'createdAt', fieldAr: 'تاريخ التسجيل', value: '2024-03-15', type: 'error', messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '15 مارس 2024' },
    ],
    createdBy: 'أحمد محمد', createdAt: '20 مايو 2026',
    notes: 'فشل بسبب تنسيق التاريخ — جميع التواريخ بصيغة YYYY-MM-DD غير مقبولة',
  },
  {
    id: 'imp-012', name: 'استيراد عملاء — اليوم',
    source: 'excel', target: 'customers', status: 'completed',
    fileName: 'customers-24may2026.xlsx', fileSize: '38 ك.ب',
    totalRows: 25, successRows: 25, errorRows: 0, warningRows: 0, skippedRows: 0,
    fieldMappings: [
      { sourceColumn: 'Name',  targetField: 'nameAr', targetLabelAr: 'الاسم',  required: true },
      { sourceColumn: 'Phone', targetField: 'phone',  targetLabelAr: 'الهاتف', required: true },
      { sourceColumn: 'Email', targetField: 'email',  targetLabelAr: 'البريد', required: false },
      { sourceColumn: 'City',  targetField: 'city',   targetLabelAr: 'المدينة',required: false },
    ],
    validationIssues: [],
    createdBy: 'سارة الأحمد', createdAt: '24 مايو 2026', completedAt: '24 مايو 2026',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTING
// ─────────────────────────────────────────────────────────────────────────────

export type AccountType   = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type AccountNature = 'debit' | 'credit';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset:     'أصول',
  liability: 'خصوم',
  equity:    'حقوق ملكية',
  revenue:   'إيرادات',
  expense:   'مصروفات',
};

export interface Account {
  code: string;
  nameAr: string;
  type: AccountType;
  nature: AccountNature;
  level: number;
  parentCode?: string;
  isHeader: boolean;
  balance: number;
  currency: string;
  isActive: boolean;
}

export const mockAccounts: Account[] = [
  { code: '1',      nameAr: 'الأصول',                        type: 'asset',     nature: 'debit',  level: 1, isHeader: true,  balance: 485200,  currency: 'SAR', isActive: true },
  { code: '11',     nameAr: 'الأصول المتداولة',               type: 'asset',     nature: 'debit',  level: 2, parentCode: '1',    isHeader: true,  balance: 362700,  currency: 'SAR', isActive: true },
  { code: '1101',   nameAr: 'النقدية والبنوك',                type: 'asset',     nature: 'debit',  level: 3, parentCode: '11',   isHeader: true,  balance: 185400,  currency: 'SAR', isActive: true },
  { code: '110101', nameAr: 'الصندوق',                        type: 'asset',     nature: 'debit',  level: 4, parentCode: '1101', isHeader: false, balance:  12400,  currency: 'SAR', isActive: true },
  { code: '110102', nameAr: 'البنك الأهلي',                   type: 'asset',     nature: 'debit',  level: 4, parentCode: '1101', isHeader: false, balance:  98000,  currency: 'SAR', isActive: true },
  { code: '110103', nameAr: 'بنك الراجحي',                    type: 'asset',     nature: 'debit',  level: 4, parentCode: '1101', isHeader: false, balance:  75000,  currency: 'SAR', isActive: true },
  { code: '1102',   nameAr: 'الذمم المدينة',                  type: 'asset',     nature: 'debit',  level: 3, parentCode: '11',   isHeader: true,  balance: 142300,  currency: 'SAR', isActive: true },
  { code: '110201', nameAr: 'عملاء محليون',                   type: 'asset',     nature: 'debit',  level: 4, parentCode: '1102', isHeader: false, balance:  98300,  currency: 'SAR', isActive: true },
  { code: '110202', nameAr: 'عملاء خليجيون',                  type: 'asset',     nature: 'debit',  level: 4, parentCode: '1102', isHeader: false, balance:  44000,  currency: 'SAR', isActive: true },
  { code: '1103',   nameAr: 'المخزون',                        type: 'asset',     nature: 'debit',  level: 3, parentCode: '11',   isHeader: true,  balance:  35000,  currency: 'SAR', isActive: true },
  { code: '110301', nameAr: 'بضاعة للبيع',                    type: 'asset',     nature: 'debit',  level: 4, parentCode: '1103', isHeader: false, balance:  35000,  currency: 'SAR', isActive: true },
  { code: '12',     nameAr: 'الأصول الثابتة',                 type: 'asset',     nature: 'debit',  level: 2, parentCode: '1',    isHeader: true,  balance: 122500,  currency: 'SAR', isActive: true },
  { code: '1201',   nameAr: 'الأصول الثابتة بالتكلفة',        type: 'asset',     nature: 'debit',  level: 3, parentCode: '12',   isHeader: true,  balance: 154000,  currency: 'SAR', isActive: true },
  { code: '120101', nameAr: 'أثاث ومعدات',                    type: 'asset',     nature: 'debit',  level: 4, parentCode: '1201', isHeader: false, balance:  54000,  currency: 'SAR', isActive: true },
  { code: '120102', nameAr: 'أجهزة حاسب آلي',                 type: 'asset',     nature: 'debit',  level: 4, parentCode: '1201', isHeader: false, balance: 100000,  currency: 'SAR', isActive: true },
  { code: '1202',   nameAr: 'مجمع الاستهلاك',                 type: 'asset',     nature: 'credit', level: 3, parentCode: '12',   isHeader: true,  balance: -31500,  currency: 'SAR', isActive: true },
  { code: '120201', nameAr: 'استهلاك أثاث ومعدات',            type: 'asset',     nature: 'credit', level: 4, parentCode: '1202', isHeader: false, balance: -12500,  currency: 'SAR', isActive: true },
  { code: '120202', nameAr: 'استهلاك أجهزة حاسب',             type: 'asset',     nature: 'credit', level: 4, parentCode: '1202', isHeader: false, balance: -19000,  currency: 'SAR', isActive: true },
  { code: '2',      nameAr: 'الخصوم',                         type: 'liability', nature: 'credit', level: 1, isHeader: true,  balance: 198600,  currency: 'SAR', isActive: true },
  { code: '21',     nameAr: 'الخصوم المتداولة',               type: 'liability', nature: 'credit', level: 2, parentCode: '2',    isHeader: true,  balance: 198600,  currency: 'SAR', isActive: true },
  { code: '2101',   nameAr: 'الذمم الدائنة',                  type: 'liability', nature: 'credit', level: 3, parentCode: '21',   isHeader: true,  balance:  87500,  currency: 'SAR', isActive: true },
  { code: '210101', nameAr: 'موردون محليون',                   type: 'liability', nature: 'credit', level: 4, parentCode: '2101', isHeader: false, balance:  87500,  currency: 'SAR', isActive: true },
  { code: '2102',   nameAr: 'مصروفات مستحقة',                 type: 'liability', nature: 'credit', level: 3, parentCode: '21',   isHeader: true,  balance:  58600,  currency: 'SAR', isActive: true },
  { code: '210201', nameAr: 'رواتب مستحقة',                   type: 'liability', nature: 'credit', level: 4, parentCode: '2102', isHeader: false, balance:  58600,  currency: 'SAR', isActive: true },
  { code: '2103',   nameAr: 'ضريبة القيمة المضافة',           type: 'liability', nature: 'credit', level: 3, parentCode: '21',   isHeader: true,  balance:  52500,  currency: 'SAR', isActive: true },
  { code: '210301', nameAr: 'ضريبة ق.م.م المستحقة',           type: 'liability', nature: 'credit', level: 4, parentCode: '2103', isHeader: false, balance:  52500,  currency: 'SAR', isActive: true },
  { code: '3',      nameAr: 'حقوق الملكية',                   type: 'equity',    nature: 'credit', level: 1, isHeader: true,  balance: 168400,  currency: 'SAR', isActive: true },
  { code: '31',     nameAr: 'رأس المال',                      type: 'equity',    nature: 'credit', level: 2, parentCode: '3',    isHeader: true,  balance: 150000,  currency: 'SAR', isActive: true },
  { code: '310101', nameAr: 'رأس مال الشركاء',                type: 'equity',    nature: 'credit', level: 3, parentCode: '31',   isHeader: false, balance: 150000,  currency: 'SAR', isActive: true },
  { code: '32',     nameAr: 'الأرباح المحتجزة',               type: 'equity',    nature: 'credit', level: 2, parentCode: '3',    isHeader: true,  balance:  18400,  currency: 'SAR', isActive: true },
  { code: '320101', nameAr: 'أرباح محتجزة',                   type: 'equity',    nature: 'credit', level: 3, parentCode: '32',   isHeader: false, balance:  18400,  currency: 'SAR', isActive: true },
  { code: '4',      nameAr: 'الإيرادات',                      type: 'revenue',   nature: 'credit', level: 1, isHeader: true,  balance: 350500,  currency: 'SAR', isActive: true },
  { code: '41',     nameAr: 'إيرادات المبيعات',               type: 'revenue',   nature: 'credit', level: 2, parentCode: '4',    isHeader: true,  balance: 340000,  currency: 'SAR', isActive: true },
  { code: '410101', nameAr: 'مبيعات محلية',                   type: 'revenue',   nature: 'credit', level: 3, parentCode: '41',   isHeader: false, balance: 240000,  currency: 'SAR', isActive: true },
  { code: '410102', nameAr: 'مبيعات خليجية',                  type: 'revenue',   nature: 'credit', level: 3, parentCode: '41',   isHeader: false, balance: 100000,  currency: 'SAR', isActive: true },
  { code: '42',     nameAr: 'إيرادات أخرى',                   type: 'revenue',   nature: 'credit', level: 2, parentCode: '4',    isHeader: true,  balance:  10500,  currency: 'SAR', isActive: true },
  { code: '420101', nameAr: 'أرباح متفرقة',                   type: 'revenue',   nature: 'credit', level: 3, parentCode: '42',   isHeader: false, balance:  10500,  currency: 'SAR', isActive: true },
  { code: '5',      nameAr: 'المصروفات',                      type: 'expense',   nature: 'debit',  level: 1, isHeader: true,  balance: 182200,  currency: 'SAR', isActive: true },
  { code: '51',     nameAr: 'مصروفات التشغيل',                type: 'expense',   nature: 'debit',  level: 2, parentCode: '5',    isHeader: true,  balance: 143200,  currency: 'SAR', isActive: true },
  { code: '510101', nameAr: 'الرواتب والأجور',                type: 'expense',   nature: 'debit',  level: 3, parentCode: '51',   isHeader: false, balance:  87000,  currency: 'SAR', isActive: true },
  { code: '510102', nameAr: 'الإيجار',                        type: 'expense',   nature: 'debit',  level: 3, parentCode: '51',   isHeader: false, balance:  24000,  currency: 'SAR', isActive: true },
  { code: '510103', nameAr: 'الكهرباء والمياه',               type: 'expense',   nature: 'debit',  level: 3, parentCode: '51',   isHeader: false, balance:   8400,  currency: 'SAR', isActive: true },
  { code: '510104', nameAr: 'الاتصالات',                      type: 'expense',   nature: 'debit',  level: 3, parentCode: '51',   isHeader: false, balance:   4800,  currency: 'SAR', isActive: true },
  { code: '510105', nameAr: 'الإعلان والتسويق',               type: 'expense',   nature: 'debit',  level: 3, parentCode: '51',   isHeader: false, balance:  12000,  currency: 'SAR', isActive: true },
  { code: '510106', nameAr: 'الوقود والمواصلات',              type: 'expense',   nature: 'debit',  level: 3, parentCode: '51',   isHeader: false, balance:   7000,  currency: 'SAR', isActive: true },
  { code: '52',     nameAr: 'مصروفات مالية',                  type: 'expense',   nature: 'debit',  level: 2, parentCode: '5',    isHeader: true,  balance:  18000,  currency: 'SAR', isActive: true },
  { code: '520101', nameAr: 'فوائد بنكية',                    type: 'expense',   nature: 'debit',  level: 3, parentCode: '52',   isHeader: false, balance:  12000,  currency: 'SAR', isActive: true },
  { code: '520102', nameAr: 'عمولات بنكية',                   type: 'expense',   nature: 'debit',  level: 3, parentCode: '52',   isHeader: false, balance:   6000,  currency: 'SAR', isActive: true },
  { code: '53',     nameAr: 'مصروفات إدارية',                 type: 'expense',   nature: 'debit',  level: 2, parentCode: '5',    isHeader: true,  balance:  21000,  currency: 'SAR', isActive: true },
  { code: '530101', nameAr: 'قرطاسية ومكتبية',               type: 'expense',   nature: 'debit',  level: 3, parentCode: '53',   isHeader: false, balance:   3600,  currency: 'SAR', isActive: true },
  { code: '530102', nameAr: 'صيانة وإصلاح',                   type: 'expense',   nature: 'debit',  level: 3, parentCode: '53',   isHeader: false, balance:   9000,  currency: 'SAR', isActive: true },
  { code: '530103', nameAr: 'استهلاك الأصول',                 type: 'expense',   nature: 'debit',  level: 3, parentCode: '53',   isHeader: false, balance:   8400,  currency: 'SAR', isActive: true },
];

// ── Cost Centers ─────────────────────────────────────────────────────────────

export interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  parentId?: string;
  level: number;
  budget: number;
  actual: number;
  currency: string;
  isActive: boolean;
  manager?: string;
  description?: string;
}

export const mockCostCenters: CostCenter[] = [
  { id: 'cc-001', code: '100', nameAr: 'الشركة الرئيسية',      level: 1,                   budget: 500000, actual: 421800, currency: 'SAR', isActive: true, manager: 'خالد العمري',    description: 'المركز الرئيسي للشركة' },
  { id: 'cc-002', code: '110', nameAr: 'المركز الرئيسي',       level: 2, parentId: 'cc-001', budget: 180000, actual: 148200, currency: 'SAR', isActive: true, manager: 'خالد العمري' },
  { id: 'cc-003', code: '111', nameAr: 'الإدارة العامة',        level: 3, parentId: 'cc-002', budget:  60000, actual:  52400, currency: 'SAR', isActive: true, manager: 'نورة الشمري' },
  { id: 'cc-004', code: '112', nameAr: 'الموارد البشرية',       level: 3, parentId: 'cc-002', budget:  50000, actual:  44800, currency: 'SAR', isActive: true, manager: 'ريم الحربي' },
  { id: 'cc-005', code: '113', nameAr: 'المالية والمحاسبة',     level: 3, parentId: 'cc-002', budget:  70000, actual:  51000, currency: 'SAR', isActive: true, manager: 'فيصل الدوسري' },
  { id: 'cc-006', code: '120', nameAr: 'قسم المبيعات',          level: 2, parentId: 'cc-001', budget: 200000, actual: 182600, currency: 'SAR', isActive: true, manager: 'عمر القحطاني' },
  { id: 'cc-007', code: '121', nameAr: 'مبيعات الرياض',         level: 3, parentId: 'cc-006', budget:  80000, actual:  74200, currency: 'SAR', isActive: true, manager: 'محمد الغامدي' },
  { id: 'cc-008', code: '122', nameAr: 'مبيعات جدة',            level: 3, parentId: 'cc-006', budget:  80000, actual:  71400, currency: 'SAR', isActive: true, manager: 'سلمى العتيبي' },
  { id: 'cc-009', code: '123', nameAr: 'المبيعات الإلكترونية',  level: 3, parentId: 'cc-006', budget:  40000, actual:  37000, currency: 'SAR', isActive: true, manager: 'أحمد الزهراني' },
  { id: 'cc-010', code: '130', nameAr: 'العمليات واللوجستيات',  level: 2, parentId: 'cc-001', budget: 120000, actual:  91000, currency: 'SAR', isActive: true, manager: 'ناصر المطيري' },
];

// ── Journal Entries ──────────────────────────────────────────────────────────

export type JournalEntryStatus = 'draft' | 'posted' | 'void';

export const JOURNAL_STATUS_LABELS: Record<JournalEntryStatus, string> = {
  draft:  'مسودة',
  posted: 'مرحّل',
  void:   'ملغي',
};

export interface JournalLine {
  accountCode: string;
  accountNameAr: string;
  descriptionAr?: string;
  debit: number;
  credit: number;
  costCenterId?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  dateIso: string;
  reference?: string;
  descriptionAr: string;
  status: JournalEntryStatus;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  createdAt: string;
  postedAt?: string;
  notes?: string;
}

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'je-001', entryNumber: 'QJ-2026-001',
    date: '01 يناير 2026', dateIso: '2026-01-01',
    descriptionAr: 'قيد الافتتاح — رصيد أول المدة',
    status: 'posted', reference: 'OPEN-2026',
    lines: [
      { accountCode: '110102', accountNameAr: 'البنك الأهلي',         debit: 80000, credit: 0,      costCenterId: 'cc-005' },
      { accountCode: '110103', accountNameAr: 'بنك الراجحي',          debit: 50000, credit: 0,      costCenterId: 'cc-005' },
      { accountCode: '110101', accountNameAr: 'الصندوق',              debit:  8000, credit: 0 },
      { accountCode: '110301', accountNameAr: 'بضاعة للبيع',          debit: 25000, credit: 0,      costCenterId: 'cc-010' },
      { accountCode: '120101', accountNameAr: 'أثاث ومعدات',          debit: 54000, credit: 0 },
      { accountCode: '120102', accountNameAr: 'أجهزة حاسب آلي',       debit: 80000, credit: 0 },
      { accountCode: '310101', accountNameAr: 'رأس مال الشركاء',      debit: 0,     credit: 150000 },
      { accountCode: '320101', accountNameAr: 'أرباح محتجزة',         debit: 0,     credit:  18400 },
      { accountCode: '210101', accountNameAr: 'موردون محليون',         debit: 0,     credit:  87500 },
      { accountCode: '210201', accountNameAr: 'رواتب مستحقة',         debit: 0,     credit:  41100 },
    ],
    totalDebit: 297000, totalCredit: 297000,
    createdBy: 'فيصل الدوسري', createdAt: '01 يناير 2026', postedAt: '01 يناير 2026',
  },
  {
    id: 'je-002', entryNumber: 'QJ-2026-002',
    date: '05 يناير 2026', dateIso: '2026-01-05',
    descriptionAr: 'إيراد مبيعات محلية — فاتورة INV-0101',
    status: 'posted', reference: 'INV-0101',
    lines: [
      { accountCode: '110201', accountNameAr: 'عملاء محليون',         debit: 46000, credit: 0,      costCenterId: 'cc-007' },
      { accountCode: '410101', accountNameAr: 'مبيعات محلية',         debit: 0,     credit: 40000,  costCenterId: 'cc-007' },
      { accountCode: '210301', accountNameAr: 'ضريبة ق.م.م المستحقة', debit: 0,     credit:  6000 },
    ],
    totalDebit: 46000, totalCredit: 46000,
    createdBy: 'فيصل الدوسري', createdAt: '05 يناير 2026', postedAt: '05 يناير 2026',
  },
  {
    id: 'je-003', entryNumber: 'QJ-2026-003',
    date: '10 يناير 2026', dateIso: '2026-01-10',
    descriptionAr: 'صرف رواتب شهر يناير',
    status: 'posted', reference: 'PAY-JAN-2026',
    lines: [
      { accountCode: '510101', accountNameAr: 'الرواتب والأجور',      debit: 29000, credit: 0,      costCenterId: 'cc-003' },
      { accountCode: '110102', accountNameAr: 'البنك الأهلي',         debit: 0,     credit: 29000,  costCenterId: 'cc-003' },
    ],
    totalDebit: 29000, totalCredit: 29000,
    createdBy: 'فيصل الدوسري', createdAt: '10 يناير 2026', postedAt: '10 يناير 2026',
  },
  {
    id: 'je-004', entryNumber: 'QJ-2026-004',
    date: '15 يناير 2026', dateIso: '2026-01-15',
    descriptionAr: 'دفع إيجار المكتب — يناير 2026',
    status: 'posted', reference: 'RENT-JAN-2026',
    lines: [
      { accountCode: '510102', accountNameAr: 'الإيجار',              debit: 8000, credit: 0,       costCenterId: 'cc-003' },
      { accountCode: '110102', accountNameAr: 'البنك الأهلي',         debit: 0,    credit: 8000,    costCenterId: 'cc-003' },
    ],
    totalDebit: 8000, totalCredit: 8000,
    createdBy: 'فيصل الدوسري', createdAt: '15 يناير 2026', postedAt: '15 يناير 2026',
  },
  {
    id: 'je-005', entryNumber: 'QJ-2026-005',
    date: '20 يناير 2026', dateIso: '2026-01-20',
    descriptionAr: 'مشتريات بضاعة من مورد محلي',
    status: 'posted', reference: 'PO-0045',
    lines: [
      { accountCode: '110301', accountNameAr: 'بضاعة للبيع',          debit: 18000, credit: 0,      costCenterId: 'cc-010' },
      { accountCode: '210101', accountNameAr: 'موردون محليون',         debit: 0,     credit: 18000,  costCenterId: 'cc-010' },
    ],
    totalDebit: 18000, totalCredit: 18000,
    createdBy: 'فيصل الدوسري', createdAt: '20 يناير 2026', postedAt: '20 يناير 2026',
  },
  {
    id: 'je-006', entryNumber: 'QJ-2026-006',
    date: '01 فبراير 2026', dateIso: '2026-02-01',
    descriptionAr: 'إيراد مبيعات خليجية — فاتورة INV-0202',
    status: 'posted', reference: 'INV-0202',
    lines: [
      { accountCode: '110202', accountNameAr: 'عملاء خليجيون',        debit: 57500, credit: 0,      costCenterId: 'cc-008' },
      { accountCode: '410102', accountNameAr: 'مبيعات خليجية',        debit: 0,     credit: 50000,  costCenterId: 'cc-008' },
      { accountCode: '210301', accountNameAr: 'ضريبة ق.م.م المستحقة', debit: 0,     credit:  7500 },
    ],
    totalDebit: 57500, totalCredit: 57500,
    createdBy: 'فيصل الدوسري', createdAt: '01 فبراير 2026', postedAt: '01 فبراير 2026',
  },
  {
    id: 'je-007', entryNumber: 'QJ-2026-007',
    date: '10 فبراير 2026', dateIso: '2026-02-10',
    descriptionAr: 'صرف رواتب شهر فبراير',
    status: 'posted', reference: 'PAY-FEB-2026',
    lines: [
      { accountCode: '510101', accountNameAr: 'الرواتب والأجور',      debit: 29000, credit: 0,      costCenterId: 'cc-003' },
      { accountCode: '110102', accountNameAr: 'البنك الأهلي',         debit: 0,     credit: 29000,  costCenterId: 'cc-003' },
    ],
    totalDebit: 29000, totalCredit: 29000,
    createdBy: 'فيصل الدوسري', createdAt: '10 فبراير 2026', postedAt: '10 فبراير 2026',
  },
  {
    id: 'je-008', entryNumber: 'QJ-2026-008',
    date: '28 فبراير 2026', dateIso: '2026-02-28',
    descriptionAr: 'قيد الاستهلاك الشهري — فبراير 2026',
    status: 'posted', reference: 'DEP-FEB-2026',
    lines: [
      { accountCode: '530103', accountNameAr: 'استهلاك الأصول',       debit: 2800, credit: 0 },
      { accountCode: '120201', accountNameAr: 'استهلاك أثاث ومعدات',  debit: 0,    credit: 1200 },
      { accountCode: '120202', accountNameAr: 'استهلاك أجهزة حاسب',   debit: 0,    credit: 1600 },
    ],
    totalDebit: 2800, totalCredit: 2800,
    createdBy: 'فيصل الدوسري', createdAt: '28 فبراير 2026', postedAt: '28 فبراير 2026',
  },
  {
    id: 'je-009', entryNumber: 'QJ-2026-009',
    date: '05 مارس 2026', dateIso: '2026-03-05',
    descriptionAr: 'تسديد دفعة لمورد محلي',
    status: 'posted', reference: 'PAY-VND-0012',
    lines: [
      { accountCode: '210101', accountNameAr: 'موردون محليون',         debit: 30000, credit: 0,      costCenterId: 'cc-010' },
      { accountCode: '110102', accountNameAr: 'البنك الأهلي',         debit: 0,     credit: 30000,  costCenterId: 'cc-005' },
    ],
    totalDebit: 30000, totalCredit: 30000,
    createdBy: 'فيصل الدوسري', createdAt: '05 مارس 2026', postedAt: '05 مارس 2026',
  },
  {
    id: 'je-010', entryNumber: 'QJ-2026-010',
    date: '15 مارس 2026', dateIso: '2026-03-15',
    descriptionAr: 'مصروف تسويق وإعلان — مارس',
    status: 'posted', reference: 'MKT-MAR-2026',
    lines: [
      { accountCode: '510105', accountNameAr: 'الإعلان والتسويق',     debit: 4000, credit: 0,       costCenterId: 'cc-009' },
      { accountCode: '110101', accountNameAr: 'الصندوق',              debit: 0,    credit: 4000 },
    ],
    totalDebit: 4000, totalCredit: 4000,
    createdBy: 'فيصل الدوسري', createdAt: '15 مارس 2026', postedAt: '15 مارس 2026',
  },
  {
    id: 'je-011', entryNumber: 'QJ-2026-011',
    date: '01 أبريل 2026', dateIso: '2026-04-01',
    descriptionAr: 'تحصيل من عملاء محليين',
    status: 'posted', reference: 'REC-APR-001',
    lines: [
      { accountCode: '110103', accountNameAr: 'بنك الراجحي',          debit: 25000, credit: 0,      costCenterId: 'cc-005' },
      { accountCode: '110201', accountNameAr: 'عملاء محليون',         debit: 0,     credit: 25000,  costCenterId: 'cc-007' },
    ],
    totalDebit: 25000, totalCredit: 25000,
    createdBy: 'أحمد محمد', createdAt: '01 أبريل 2026', postedAt: '01 أبريل 2026',
  },
  {
    id: 'je-012', entryNumber: 'QJ-2026-012',
    date: '10 أبريل 2026', dateIso: '2026-04-10',
    descriptionAr: 'مصروفات كهرباء ومياه — الربع الأول',
    status: 'posted', reference: 'UTIL-Q1-2026',
    lines: [
      { accountCode: '510103', accountNameAr: 'الكهرباء والمياه',     debit: 2800, credit: 0,       costCenterId: 'cc-003' },
      { accountCode: '110101', accountNameAr: 'الصندوق',              debit: 0,    credit: 2800 },
    ],
    totalDebit: 2800, totalCredit: 2800,
    createdBy: 'أحمد محمد', createdAt: '10 أبريل 2026', postedAt: '10 أبريل 2026',
  },
  {
    id: 'je-013', entryNumber: 'QJ-2026-013',
    date: '20 أبريل 2026', dateIso: '2026-04-20',
    descriptionAr: 'إيراد مبيعات محلية — فاتورة INV-0415',
    status: 'posted', reference: 'INV-0415',
    lines: [
      { accountCode: '110201', accountNameAr: 'عملاء محليون',         debit: 34500, credit: 0,      costCenterId: 'cc-007' },
      { accountCode: '410101', accountNameAr: 'مبيعات محلية',         debit: 0,     credit: 30000,  costCenterId: 'cc-007' },
      { accountCode: '210301', accountNameAr: 'ضريبة ق.م.م المستحقة', debit: 0,     credit:  4500 },
    ],
    totalDebit: 34500, totalCredit: 34500,
    createdBy: 'أحمد محمد', createdAt: '20 أبريل 2026', postedAt: '20 أبريل 2026',
  },
  {
    id: 'je-014', entryNumber: 'QJ-2026-014',
    date: '05 مايو 2026', dateIso: '2026-05-05',
    descriptionAr: 'قيد اتصالات وإنترنت — مايو',
    status: 'posted', reference: 'TEL-MAY-2026',
    lines: [
      { accountCode: '510104', accountNameAr: 'الاتصالات',            debit: 1600, credit: 0,       costCenterId: 'cc-003' },
      { accountCode: '110101', accountNameAr: 'الصندوق',              debit: 0,    credit: 1600 },
    ],
    totalDebit: 1600, totalCredit: 1600,
    createdBy: 'أحمد محمد', createdAt: '05 مايو 2026', postedAt: '05 مايو 2026',
  },
  {
    id: 'je-015', entryNumber: 'QJ-2026-015',
    date: '18 مايو 2026', dateIso: '2026-05-18',
    descriptionAr: 'فوائد وعمولات بنكية — مايو',
    status: 'posted', reference: 'BANK-MAY-2026',
    lines: [
      { accountCode: '520101', accountNameAr: 'فوائد بنكية',          debit: 4000, credit: 0,       costCenterId: 'cc-005' },
      { accountCode: '520102', accountNameAr: 'عمولات بنكية',         debit: 2000, credit: 0,       costCenterId: 'cc-005' },
      { accountCode: '110102', accountNameAr: 'البنك الأهلي',         debit: 0,    credit: 6000,    costCenterId: 'cc-005' },
    ],
    totalDebit: 6000, totalCredit: 6000,
    createdBy: 'أحمد محمد', createdAt: '18 مايو 2026', postedAt: '18 مايو 2026',
  },
  {
    id: 'je-016', entryNumber: 'QJ-2026-016',
    date: '22 مايو 2026', dateIso: '2026-05-22',
    descriptionAr: 'مسودة — قيد مستحقات موظفين',
    status: 'draft', reference: 'HR-MAY-2026',
    lines: [
      { accountCode: '510101', accountNameAr: 'الرواتب والأجور',      debit: 29000, credit: 0,      costCenterId: 'cc-003' },
      { accountCode: '210201', accountNameAr: 'رواتب مستحقة',         debit: 0,     credit: 29000,  costCenterId: 'cc-004' },
    ],
    totalDebit: 29000, totalCredit: 29000,
    createdBy: 'أحمد محمد', createdAt: '22 مايو 2026',
    notes: 'في انتظار اعتماد الإدارة المالية',
  },
  {
    id: 'je-017', entryNumber: 'QJ-2026-017',
    date: '03 مارس 2026', dateIso: '2026-03-03',
    descriptionAr: 'إلغاء — قيد خاطئ',
    status: 'void', reference: 'VOID-0003',
    lines: [
      { accountCode: '510102', accountNameAr: 'الإيجار',              debit: 8000, credit: 0 },
      { accountCode: '110101', accountNameAr: 'الصندوق',              debit: 0,    credit: 8000 },
    ],
    totalDebit: 8000, totalCredit: 8000,
    createdBy: 'فيصل الدوسري', createdAt: '03 مارس 2026',
    notes: 'تم الإلغاء — الدفع تم عبر البنك وليس الصندوق',
  },
];

// ── General Ledger ───────────────────────────────────────────────────────────

export interface LedgerEntry {
  id: string;
  date: string;
  dateIso: string;
  journalEntryId: string;
  entryNumber: string;
  descriptionAr: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerAccount {
  accountCode: string;
  accountNameAr: string;
  openingBalance: number;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export const mockLedger: LedgerAccount[] = [
  {
    accountCode: '110102', accountNameAr: 'البنك الأهلي', openingBalance: 80000,
    entries: [
      { id: 'le-001', date: '10 يناير 2026',  dateIso: '2026-01-10', journalEntryId: 'je-003', entryNumber: 'QJ-2026-003', descriptionAr: 'صرف رواتب يناير',      reference: 'PAY-JAN-2026',  debit: 0,     credit: 29000, balance: 51000  },
      { id: 'le-002', date: '15 يناير 2026',  dateIso: '2026-01-15', journalEntryId: 'je-004', entryNumber: 'QJ-2026-004', descriptionAr: 'دفع إيجار يناير',       reference: 'RENT-JAN-2026', debit: 0,     credit: 8000,  balance: 43000  },
      { id: 'le-003', date: '10 فبراير 2026', dateIso: '2026-02-10', journalEntryId: 'je-007', entryNumber: 'QJ-2026-007', descriptionAr: 'صرف رواتب فبراير',      reference: 'PAY-FEB-2026',  debit: 0,     credit: 29000, balance: 14000  },
      { id: 'le-004', date: '05 مارس 2026',   dateIso: '2026-03-05', journalEntryId: 'je-009', entryNumber: 'QJ-2026-009', descriptionAr: 'تسديد دفعة لمورد',      reference: 'PAY-VND-0012',  debit: 0,     credit: 30000, balance: -16000 },
      { id: 'le-005', date: '18 مايو 2026',   dateIso: '2026-05-18', journalEntryId: 'je-015', entryNumber: 'QJ-2026-015', descriptionAr: 'فوائد وعمولات بنكية',   reference: 'BANK-MAY-2026', debit: 0,     credit: 6000,  balance: -22000 },
    ],
    totalDebit: 0, totalCredit: 102000, closingBalance: -22000,
  },
  {
    accountCode: '110201', accountNameAr: 'عملاء محليون', openingBalance: 0,
    entries: [
      { id: 'le-010', date: '05 يناير 2026', dateIso: '2026-01-05', journalEntryId: 'je-002', entryNumber: 'QJ-2026-002', descriptionAr: 'إيراد مبيعات INV-0101', reference: 'INV-0101',    debit: 46000, credit: 0,     balance: 46000 },
      { id: 'le-011', date: '01 أبريل 2026', dateIso: '2026-04-01', journalEntryId: 'je-011', entryNumber: 'QJ-2026-011', descriptionAr: 'تحصيل من عميل',          reference: 'REC-APR-001', debit: 0,     credit: 25000, balance: 21000 },
      { id: 'le-012', date: '20 أبريل 2026', dateIso: '2026-04-20', journalEntryId: 'je-013', entryNumber: 'QJ-2026-013', descriptionAr: 'إيراد مبيعات INV-0415', reference: 'INV-0415',    debit: 34500, credit: 0,     balance: 55500 },
    ],
    totalDebit: 80500, totalCredit: 25000, closingBalance: 55500,
  },
  {
    accountCode: '410101', accountNameAr: 'مبيعات محلية', openingBalance: 0,
    entries: [
      { id: 'le-020', date: '05 يناير 2026', dateIso: '2026-01-05', journalEntryId: 'je-002', entryNumber: 'QJ-2026-002', descriptionAr: 'إيراد مبيعات INV-0101', reference: 'INV-0101', debit: 0, credit: 40000, balance: 40000 },
      { id: 'le-021', date: '20 أبريل 2026', dateIso: '2026-04-20', journalEntryId: 'je-013', entryNumber: 'QJ-2026-013', descriptionAr: 'إيراد مبيعات INV-0415', reference: 'INV-0415', debit: 0, credit: 30000, balance: 70000 },
    ],
    totalDebit: 0, totalCredit: 70000, closingBalance: 70000,
  },
  {
    accountCode: '510101', accountNameAr: 'الرواتب والأجور', openingBalance: 0,
    entries: [
      { id: 'le-030', date: '10 يناير 2026',  dateIso: '2026-01-10', journalEntryId: 'je-003', entryNumber: 'QJ-2026-003', descriptionAr: 'رواتب يناير',  reference: 'PAY-JAN-2026', debit: 29000, credit: 0, balance: 29000 },
      { id: 'le-031', date: '10 فبراير 2026', dateIso: '2026-02-10', journalEntryId: 'je-007', entryNumber: 'QJ-2026-007', descriptionAr: 'رواتب فبراير', reference: 'PAY-FEB-2026', debit: 29000, credit: 0, balance: 58000 },
    ],
    totalDebit: 58000, totalCredit: 0, closingBalance: 58000,
  },
  {
    accountCode: '210101', accountNameAr: 'موردون محليون', openingBalance: 87500,
    entries: [
      { id: 'le-040', date: '20 يناير 2026', dateIso: '2026-01-20', journalEntryId: 'je-005', entryNumber: 'QJ-2026-005', descriptionAr: 'مشتريات بضاعة PO-0045',   reference: 'PO-0045',      debit: 0,     credit: 18000, balance: 105500 },
      { id: 'le-041', date: '05 مارس 2026',  dateIso: '2026-03-05', journalEntryId: 'je-009', entryNumber: 'QJ-2026-009', descriptionAr: 'تسديد دفعة للمورد',       reference: 'PAY-VND-0012', debit: 30000, credit: 0,     balance:  75500 },
    ],
    totalDebit: 30000, totalCredit: 18000, closingBalance: 75500,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTION CENTER
// ─────────────────────────────────────────────────────────────────────────────

export type CollectionStatus =
  | 'imported'
  | 'suggested_match'
  | 'matched'
  | 'approved'
  | 'invoice_created'
  | 'receipt_created'
  | 'posted'
  | 'rejected';

export type CollectionMatchType = 'automatic' | 'manual';
export type MatchRuleKey = 'order_number' | 'customer_phone' | 'payment_phone' | 'customer_name' | 'amount' | 'date';

export const COLLECTION_STATUS_LABELS: Record<CollectionStatus, string> = {
  imported:        'مستورد',
  suggested_match: 'مقترح للمطابقة',
  matched:         'مطابق',
  approved:        'معتمد',
  invoice_created: 'فاتورة مُنشأة',
  receipt_created: 'إيصال مُنشأ',
  posted:          'مرحّل',
  rejected:        'مرفوض',
};

export const COLLECTION_MATCH_TYPE_LABELS: Record<CollectionMatchType, string> = {
  automatic: 'مطابقة تلقائية',
  manual:    'مطابقة يدوية',
};

export const MATCH_RULE_LABELS: Record<MatchRuleKey, string> = {
  order_number:   'رقم الطلب',
  customer_phone: 'هاتف العميل',
  payment_phone:  'هاتف الدفع',
  customer_name:  'اسم العميل',
  amount:         'المبلغ',
  date:           'التاريخ',
};

export interface MatchRuleScore {
  rule:        MatchRuleKey;
  score:       number;
  weight:      number;
  matched:     boolean;
  sourceValue: string;
  targetValue: string;
}

export interface CollectionMatch {
  orderId:      string;
  orderNumber:  string;
  customerName: string;
  orderAmount:  number;
  currency:     string;
  orderDate:    string;
  totalScore:   number;
  matchType:    CollectionMatchType;
  rules:        MatchRuleScore[];
}

export interface Collection {
  id:                  string;
  reference:           string;
  customerName:        string;
  customerPhone?:      string;
  paymentPhone?:       string;
  amount:              number;
  currency:            string;
  paymentDate:         string;
  paymentDateIso:      string;
  paymentMethod:       'bank_transfer' | 'cash' | 'card' | 'cheque';
  bank?:               string;
  transactionRef?:     string;
  notes?:              string;
  status:              CollectionStatus;
  sourceOrderNumber?:  string;
  match?:              CollectionMatch;
  createdAt:           string;
  importedFrom?:       string;
}

export const COLLECTION_PAYMENT_METHOD_LABELS: Record<Collection['paymentMethod'], string> = {
  bank_transfer: 'تحويل بنكي',
  cash:          'نقداً',
  card:          'بطاقة',
  cheque:        'شيك',
};

export const mockCollections: Collection[] = [
  {
    id: 'col-001',
    reference: 'COL-2026-0001',
    customerName: 'شركة النخبة للتجارة',
    customerPhone: '+966 11 234 5678',
    paymentPhone: '+966 50 111 2233',
    amount: 18500,
    currency: 'SAR',
    paymentDate: '20 مايو 2026',
    paymentDateIso: '2026-05-20',
    paymentMethod: 'bank_transfer',
    bank: 'البنك الأهلي',
    transactionRef: 'TXN-9985442',
    sourceOrderNumber: 'ORD-2026-0041',
    status: 'posted',
    match: {
      orderId: 'lead-001',
      orderNumber: 'ORD-2026-0041',
      customerName: 'شركة النخبة للتجارة',
      orderAmount: 18500,
      currency: 'SAR',
      orderDate: '22 مايو 2026',
      totalScore: 97,
      matchType: 'automatic',
      rules: [
        { rule: 'order_number',   score: 100, weight: 30, matched: true,  sourceValue: 'ORD-2026-0041',       targetValue: 'ORD-2026-0041' },
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '18,500 ر.س',           targetValue: '18,500 ر.س' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'شركة النخبة للتجارة',  targetValue: 'شركة النخبة للتجارة' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+966 11 234 5678',     targetValue: '+966 11 234 5678' },
        { rule: 'payment_phone',  score: 100, weight: 10, matched: true,  sourceValue: '+966 50 111 2233',     targetValue: '+966 50 111 2233' },
        { rule: 'date',           score:  40, weight:  5, matched: false, sourceValue: '20 مايو 2026',        targetValue: '22 مايو 2026' },
      ],
    },
    createdAt: '20 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-002',
    reference: 'COL-2026-0002',
    customerName: 'مستشفى الحياة التخصصي',
    customerPhone: '+966 11 456 7890',
    paymentPhone: '+966 55 456 7890',
    amount: 45000,
    currency: 'SAR',
    paymentDate: '19 مايو 2026',
    paymentDateIso: '2026-05-19',
    paymentMethod: 'bank_transfer',
    bank: 'بنك الراجحي',
    transactionRef: 'TXN-7734821',
    status: 'receipt_created',
    match: {
      orderId: 'lead-003-ref',
      orderNumber: 'ORD-2026-0037',
      customerName: 'مستشفى الحياة التخصصي',
      orderAmount: 45000,
      currency: 'SAR',
      orderDate: '19 مايو 2026',
      totalScore: 94,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '45,000 ر.س',           targetValue: '45,000 ر.س' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'مستشفى الحياة التخصصي', targetValue: 'مستشفى الحياة التخصصي' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+966 11 456 7890',     targetValue: '+966 11 456 7890' },
        { rule: 'payment_phone',  score: 100, weight: 10, matched: true,  sourceValue: '+966 55 456 7890',     targetValue: '+966 55 456 7890' },
        { rule: 'date',           score: 100, weight:  5, matched: true,  sourceValue: '19 مايو 2026',        targetValue: '19 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',                   targetValue: 'ORD-2026-0037' },
      ],
    },
    createdAt: '19 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-003',
    reference: 'COL-2026-0003',
    customerName: 'محمد أحمد الزهراني',
    customerPhone: '+966 55 987 6543',
    amount: 8500,
    currency: 'SAR',
    paymentDate: '18 مايو 2026',
    paymentDateIso: '2026-05-18',
    paymentMethod: 'cash',
    status: 'invoice_created',
    notes: 'دفعة نقدية — تم التحقق من الهوية',
    match: {
      orderId: 'cus-002-ref',
      orderNumber: 'ORD-2026-0020',
      customerName: 'محمد أحمد الزهراني',
      orderAmount: 8500,
      currency: 'SAR',
      orderDate: '18 مايو 2026',
      totalScore: 88,
      matchType: 'manual',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '8,500 ر.س',   targetValue: '8,500 ر.س' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'محمد أحمد الزهراني', targetValue: 'محمد الزهراني' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+966 55 987 6543', targetValue: '+966 55 987 6543' },
        { rule: 'date',           score: 100, weight:  5, matched: true,  sourceValue: '18 مايو 2026', targetValue: '18 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0020' },
        { rule: 'payment_phone',  score:   0, weight: 10, matched: false, sourceValue: '—',            targetValue: '—' },
      ],
    },
    createdAt: '18 مايو 2026',
    importedFrom: 'manual',
  },
  {
    id: 'col-004',
    reference: 'COL-2026-0004',
    customerName: 'مؤسسة الربيع',
    customerPhone: '+966 12 555 0001',
    paymentPhone: '+966 50 333 7788',
    amount: 32800,
    currency: 'SAR',
    paymentDate: '17 مايو 2026',
    paymentDateIso: '2026-05-17',
    paymentMethod: 'bank_transfer',
    bank: 'البنك الأهلي',
    transactionRef: 'TXN-6612904',
    status: 'approved',
    match: {
      orderId: 'order-004-ref',
      orderNumber: 'ORD-2026-0035',
      customerName: 'مؤسسة الربيع',
      orderAmount: 32800,
      currency: 'SAR',
      orderDate: '16 مايو 2026',
      totalScore: 91,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '32,800 ر.س',  targetValue: '32,800 ر.س' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'مؤسسة الربيع', targetValue: 'مؤسسة الربيع' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+966 12 555 0001', targetValue: '+966 12 555 0001' },
        { rule: 'payment_phone',  score:  80, weight: 10, matched: true,  sourceValue: '+966 50 333 7788', targetValue: '+966 50 333 9988' },
        { rule: 'date',           score:  60, weight:  5, matched: false, sourceValue: '17 مايو 2026', targetValue: '16 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0035' },
      ],
    },
    createdAt: '17 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-005',
    reference: 'COL-2026-0005',
    customerName: 'شركة التقنية الحديثة',
    customerPhone: '+966 11 700 5500',
    amount: 12000,
    currency: 'SAR',
    paymentDate: '16 مايو 2026',
    paymentDateIso: '2026-05-16',
    paymentMethod: 'card',
    bank: 'بنك الراجحي',
    status: 'approved',
    match: {
      orderId: 'order-005-ref',
      orderNumber: 'ORD-2026-0033',
      customerName: 'شركة التقنية الحديثة',
      orderAmount: 12000,
      currency: 'SAR',
      orderDate: '15 مايو 2026',
      totalScore: 85,
      matchType: 'manual',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '12,000 ر.س',  targetValue: '12,000 ر.س' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'شركة التقنية الحديثة', targetValue: 'التقنية الحديثة' },
        { rule: 'customer_phone', score:  80, weight: 10, matched: true,  sourceValue: '+966 11 700 5500', targetValue: '+966 11 700 5522' },
        { rule: 'date',           score:  60, weight:  5, matched: false, sourceValue: '16 مايو 2026', targetValue: '15 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0033' },
        { rule: 'payment_phone',  score:   0, weight: 10, matched: false, sourceValue: '—',            targetValue: '—' },
      ],
    },
    createdAt: '16 مايو 2026',
    importedFrom: 'manual',
  },
  {
    id: 'col-006',
    reference: 'COL-2026-0006',
    customerName: 'خالد منصور العنزي',
    customerPhone: '+971 50 444 5566',
    paymentPhone: '+971 50 444 5566',
    amount: 15000,
    currency: 'AED',
    paymentDate: '15 مايو 2026',
    paymentDateIso: '2026-05-15',
    paymentMethod: 'cash',
    status: 'matched',
    match: {
      orderId: 'lead-005',
      orderNumber: 'ORD-2026-0033',
      customerName: 'خالد منصور العنزي',
      orderAmount: 15000,
      currency: 'AED',
      orderDate: '16 مايو 2026',
      totalScore: 76,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '15,000 د.إ',   targetValue: '15,000 د.إ' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+971 50 444 5566', targetValue: '+971 50 444 5566' },
        { rule: 'payment_phone',  score: 100, weight: 10, matched: true,  sourceValue: '+971 50 444 5566', targetValue: '+971 50 444 5566' },
        { rule: 'customer_name',  score:  80, weight: 20, matched: true,  sourceValue: 'خالد منصور العنزي', targetValue: 'خالد العنزي' },
        { rule: 'date',           score:  60, weight:  5, matched: false, sourceValue: '15 مايو 2026', targetValue: '16 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0033' },
      ],
    },
    createdAt: '15 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-007',
    reference: 'COL-2026-0007',
    customerName: 'فاطمة علي الزهراني',
    customerPhone: '+966 55 987 6543',
    amount: 28000,
    currency: 'SAR',
    paymentDate: '14 مايو 2026',
    paymentDateIso: '2026-05-14',
    paymentMethod: 'bank_transfer',
    bank: 'بنك الراجحي',
    transactionRef: 'TXN-5540012',
    status: 'matched',
    notes: 'دفعة أولى 50% — تم التحقق من عقد الأقساط',
    match: {
      orderId: 'lead-004',
      orderNumber: 'ORD-2026-0035',
      customerName: 'فاطمة علي الزهراني',
      orderAmount: 28000,
      currency: 'SAR',
      orderDate: '17 مايو 2026',
      totalScore: 92,
      matchType: 'manual',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '28,000 ر.س', targetValue: '28,000 ر.س' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'فاطمة علي الزهراني', targetValue: 'فاطمة الزهراني' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+966 55 987 6543', targetValue: '+966 55 987 6543' },
        { rule: 'date',           score:  60, weight:  5, matched: false, sourceValue: '14 مايو 2026', targetValue: '17 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0035' },
        { rule: 'payment_phone',  score:   0, weight: 10, matched: false, sourceValue: '—',            targetValue: '—' },
      ],
    },
    createdAt: '14 مايو 2026',
    importedFrom: 'manual',
  },
  {
    id: 'col-008',
    reference: 'COL-2026-0008',
    customerName: 'سلمى جاسم البحراني',
    customerPhone: '+973 3366 9900',
    paymentPhone: '+973 3366 9900',
    amount: 4500,
    currency: 'BHD',
    paymentDate: '13 مايو 2026',
    paymentDateIso: '2026-05-13',
    paymentMethod: 'bank_transfer',
    bank: 'بنك البحرين',
    transactionRef: 'TXN-4421007',
    status: 'suggested_match',
    match: {
      orderId: 'lead-006',
      orderNumber: 'ORD-2026-0031',
      customerName: 'سلمى جاسم البحراني',
      orderAmount: 4500,
      currency: 'BHD',
      orderDate: '15 مايو 2026',
      totalScore: 82,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '4,500 د.ب',  targetValue: '4,500 د.ب' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'سلمى جاسم البحراني', targetValue: 'سلمى البحراني' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+973 3366 9900', targetValue: '+973 3366 9900' },
        { rule: 'payment_phone',  score: 100, weight: 10, matched: true,  sourceValue: '+973 3366 9900', targetValue: '+973 3366 9900' },
        { rule: 'date',           score:  40, weight:  5, matched: false, sourceValue: '13 مايو 2026', targetValue: '15 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0031' },
      ],
    },
    createdAt: '13 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-009',
    reference: 'COL-2026-0009',
    customerName: 'عبدالرحمن يوسف الهاجري',
    customerPhone: '+974 5533 7788',
    amount: 52000,
    currency: 'QAR',
    paymentDate: '12 مايو 2026',
    paymentDateIso: '2026-05-12',
    paymentMethod: 'bank_transfer',
    bank: 'QNB',
    transactionRef: 'TXN-3309872',
    status: 'suggested_match',
    match: {
      orderId: 'lead-003',
      orderNumber: 'ORD-2026-0037',
      customerName: 'عبدالرحمن يوسف الهاجري',
      orderAmount: 52000,
      currency: 'QAR',
      orderDate: '19 مايو 2026',
      totalScore: 65,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '52,000 ر.ق', targetValue: '52,000 ر.ق' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+974 5533 7788', targetValue: '+974 5533 7788' },
        { rule: 'customer_name',  score:  80, weight: 20, matched: true,  sourceValue: 'عبدالرحمن الهاجري', targetValue: 'عبدالرحمن يوسف الهاجري' },
        { rule: 'date',           score:   0, weight:  5, matched: false, sourceValue: '12 مايو 2026', targetValue: '19 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0037' },
        { rule: 'payment_phone',  score:   0, weight: 10, matched: false, sourceValue: '—',            targetValue: '—' },
      ],
    },
    createdAt: '12 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-010',
    reference: 'COL-2026-0010',
    customerName: 'بدر سلطان القحطاني',
    customerPhone: '+966 56 333 7744',
    paymentPhone: '+966 56 333 7744',
    amount: 76000,
    currency: 'SAR',
    paymentDate: '11 مايو 2026',
    paymentDateIso: '2026-05-11',
    paymentMethod: 'bank_transfer',
    bank: 'البنك الأهلي',
    transactionRef: 'TXN-2218443',
    status: 'suggested_match',
    match: {
      orderId: 'lead-009',
      orderNumber: 'ORD-2026-0025',
      customerName: 'بدر سلطان القحطاني',
      orderAmount: 76000,
      currency: 'SAR',
      orderDate: '09 مايو 2026',
      totalScore: 73,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '76,000 ر.س',  targetValue: '76,000 ر.س' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+966 56 333 7744', targetValue: '+966 56 333 7744' },
        { rule: 'payment_phone',  score: 100, weight: 10, matched: true,  sourceValue: '+966 56 333 7744', targetValue: '+966 56 333 7744' },
        { rule: 'customer_name',  score:  80, weight: 20, matched: true,  sourceValue: 'بدر القحطاني', targetValue: 'بدر سلطان القحطاني' },
        { rule: 'date',           score:  40, weight:  5, matched: false, sourceValue: '11 مايو 2026', targetValue: '09 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0025' },
      ],
    },
    createdAt: '11 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-011',
    reference: 'COL-2026-0011',
    customerName: 'وليد حسن الغامدي',
    customerPhone: '+966 59 555 8800',
    amount: 22500,
    currency: 'SAR',
    paymentDate: '10 مايو 2026',
    paymentDateIso: '2026-05-10',
    paymentMethod: 'card',
    bank: 'بنك الراجحي',
    status: 'suggested_match',
    match: {
      orderId: 'lead-011',
      orderNumber: 'ORD-2026-0021',
      customerName: 'وليد حسن الغامدي',
      orderAmount: 22500,
      currency: 'SAR',
      orderDate: '06 مايو 2026',
      totalScore: 55,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '22,500 ر.س',  targetValue: '22,500 ر.س' },
        { rule: 'customer_name',  score:  70, weight: 20, matched: true,  sourceValue: 'وليد الغامدي', targetValue: 'وليد حسن الغامدي' },
        { rule: 'customer_phone', score:  60, weight: 10, matched: false, sourceValue: '+966 59 555 8800', targetValue: '+966 59 555 7700' },
        { rule: 'date',           score:   0, weight:  5, matched: false, sourceValue: '10 مايو 2026', targetValue: '06 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0021' },
        { rule: 'payment_phone',  score:   0, weight: 10, matched: false, sourceValue: '—',            targetValue: '—' },
      ],
    },
    createdAt: '10 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-012',
    reference: 'COL-2026-0012',
    customerName: 'ريم عبدالله الدوسري',
    customerPhone: '+971 55 778 8990',
    paymentPhone: '+971 55 778 8990',
    amount: 12000,
    currency: 'AED',
    paymentDate: '09 مايو 2026',
    paymentDateIso: '2026-05-09',
    paymentMethod: 'bank_transfer',
    bank: 'Emirates NBD',
    transactionRef: 'TXN-1104567',
    status: 'suggested_match',
    match: {
      orderId: 'lead-008',
      orderNumber: 'ORD-2026-0027',
      customerName: 'ريم عبدالله الدوسري',
      orderAmount: 12000,
      currency: 'AED',
      orderDate: '11 مايو 2026',
      totalScore: 91,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '12,000 د.إ',   targetValue: '12,000 د.إ' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'ريم عبدالله الدوسري', targetValue: 'ريم الدوسري' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+971 55 778 8990', targetValue: '+971 55 778 8990' },
        { rule: 'payment_phone',  score: 100, weight: 10, matched: true,  sourceValue: '+971 55 778 8990', targetValue: '+971 55 778 8990' },
        { rule: 'date',           score:  40, weight:  5, matched: false, sourceValue: '09 مايو 2026', targetValue: '11 مايو 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0027' },
      ],
    },
    createdAt: '09 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-013',
    reference: 'COL-2026-0013',
    customerName: 'دانة محمد الصباح',
    customerPhone: '+965 5500 1122',
    amount: 6800,
    currency: 'KWD',
    paymentDate: '08 مايو 2026',
    paymentDateIso: '2026-05-08',
    paymentMethod: 'bank_transfer',
    bank: 'بنك الكويت',
    transactionRef: 'TXN-0987321',
    status: 'imported',
    notes: 'لم يُعثر على طلب مطابق — يحتاج مراجعة يدوية',
    createdAt: '08 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-014',
    reference: 'COL-2026-0014',
    customerName: 'جاسم خليل الكواري',
    customerPhone: '+974 4455 6677',
    amount: 9500,
    currency: 'QAR',
    paymentDate: '07 مايو 2026',
    paymentDateIso: '2026-05-07',
    paymentMethod: 'cash',
    status: 'imported',
    createdAt: '07 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-015',
    reference: 'COL-2026-0015',
    customerName: 'طارق محمد الشيخ',
    customerPhone: '+971 52 999 0011',
    paymentPhone: '+971 52 999 0011',
    amount: 33600,
    currency: 'AED',
    paymentDate: '06 مايو 2026',
    paymentDateIso: '2026-05-06',
    paymentMethod: 'bank_transfer',
    bank: 'ADIB',
    transactionRef: 'TXN-8800443',
    status: 'imported',
    createdAt: '06 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-016',
    reference: 'COL-2026-0016',
    customerName: 'عمر فيصل الشمري',
    customerPhone: '+966 53 222 1100',
    amount: 9600,
    currency: 'SAR',
    paymentDate: '05 مايو 2026',
    paymentDateIso: '2026-05-05',
    paymentMethod: 'card',
    status: 'rejected',
    notes: 'مبلغ مخالف للطلب — تحويل خاطئ من العميل',
    createdAt: '05 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-017',
    reference: 'COL-2026-0017',
    customerName: 'أميرة ناصر المزروعي',
    customerPhone: '+971 56 111 2345',
    amount: 8000,
    currency: 'AED',
    paymentDate: '04 مايو 2026',
    paymentDateIso: '2026-05-04',
    paymentMethod: 'card',
    status: 'rejected',
    notes: 'دفعة مكررة — تم استرداد المبلغ',
    createdAt: '04 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-018',
    reference: 'COL-2026-0018',
    customerName: 'هيا عبدالعزيز الفارسي',
    customerPhone: '+973 3900 8877',
    amount: 25000,
    currency: 'BHD',
    paymentDate: '03 مايو 2026',
    paymentDateIso: '2026-05-03',
    paymentMethod: 'bank_transfer',
    bank: 'بنك البحرين الوطني',
    transactionRef: 'TXN-7721334',
    status: 'posted',
    match: {
      orderId: 'lead-017',
      orderNumber: 'ORD-2026-0009',
      customerName: 'هيا عبدالعزيز الفارسي',
      orderAmount: 25000,
      currency: 'BHD',
      orderDate: '22 أبريل 2026',
      totalScore: 88,
      matchType: 'manual',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '25,000 د.ب',  targetValue: '25,000 د.ب' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'هيا الفارسي', targetValue: 'هيا عبدالعزيز الفارسي' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+973 3900 8877', targetValue: '+973 3900 8877' },
        { rule: 'date',           score:   0, weight:  5, matched: false, sourceValue: '03 مايو 2026',  targetValue: '22 أبريل 2026' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',             targetValue: 'ORD-2026-0009' },
        { rule: 'payment_phone',  score:   0, weight: 10, matched: false, sourceValue: '—',             targetValue: '—' },
      ],
    },
    createdAt: '03 مايو 2026',
    importedFrom: 'manual',
  },
  {
    id: 'col-019',
    reference: 'COL-2026-0019',
    customerName: 'نورة سعد المطيري',
    customerPhone: '+965 9912 3456',
    paymentPhone: '+965 9912 3456',
    amount: 34200,
    currency: 'KWD',
    paymentDate: '02 مايو 2026',
    paymentDateIso: '2026-05-02',
    paymentMethod: 'bank_transfer',
    bank: 'بنك الكويت الوطني',
    transactionRef: 'TXN-6634892',
    status: 'receipt_created',
    sourceOrderNumber: 'ORD-2026-0039',
    match: {
      orderId: 'lead-002',
      orderNumber: 'ORD-2026-0039',
      customerName: 'نورة سعد المطيري',
      orderAmount: 34200,
      currency: 'KWD',
      orderDate: '21 مايو 2026',
      totalScore: 94,
      matchType: 'automatic',
      rules: [
        { rule: 'order_number',   score: 100, weight: 30, matched: true,  sourceValue: 'ORD-2026-0039', targetValue: 'ORD-2026-0039' },
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '34,200 د.ك', targetValue: '34,200 د.ك' },
        { rule: 'customer_name',  score: 100, weight: 20, matched: true,  sourceValue: 'نورة سعد المطيري', targetValue: 'نورة المطيري' },
        { rule: 'customer_phone', score: 100, weight: 10, matched: true,  sourceValue: '+965 9912 3456', targetValue: '+965 9912 3456' },
        { rule: 'payment_phone',  score: 100, weight: 10, matched: true,  sourceValue: '+965 9912 3456', targetValue: '+965 9912 3456' },
        { rule: 'date',           score:   0, weight:  5, matched: false, sourceValue: '02 مايو 2026', targetValue: '21 مايو 2026' },
      ],
    },
    createdAt: '02 مايو 2026',
    importedFrom: 'import',
  },
  {
    id: 'col-020',
    reference: 'COL-2026-0020',
    customerName: 'ماجد صالح الصبيحي',
    customerPhone: '+966 52 888 7766',
    amount: 17500,
    currency: 'SAR',
    paymentDate: '01 مايو 2026',
    paymentDateIso: '2026-05-01',
    paymentMethod: 'cheque',
    bank: 'البنك الأهلي',
    transactionRef: 'CHQ-004432',
    status: 'suggested_match',
    notes: 'شيك بنكي — بانتظار التحقق',
    match: {
      orderId: 'lead-014',
      orderNumber: 'ORD-2026-0015',
      customerName: 'ماجد صالح الصبيحي',
      orderAmount: 17500,
      currency: 'SAR',
      orderDate: '30 أبريل 2026',
      totalScore: 44,
      matchType: 'automatic',
      rules: [
        { rule: 'amount',         score: 100, weight: 25, matched: true,  sourceValue: '17,500 ر.س',  targetValue: '17,500 ر.س' },
        { rule: 'customer_name',  score:  60, weight: 20, matched: false, sourceValue: 'ماجد الصبيحي', targetValue: 'ماجد صالح الصبيحي' },
        { rule: 'date',           score:  60, weight:  5, matched: false, sourceValue: '01 مايو 2026', targetValue: '30 أبريل 2026' },
        { rule: 'customer_phone', score:  50, weight: 10, matched: false, sourceValue: '+966 52 888 7766', targetValue: '+966 52 888 0066' },
        { rule: 'order_number',   score:   0, weight: 30, matched: false, sourceValue: '—',            targetValue: 'ORD-2026-0015' },
        { rule: 'payment_phone',  score:   0, weight: 10, matched: false, sourceValue: '—',            targetValue: '—' },
      ],
    },
    createdAt: '01 مايو 2026',
    importedFrom: 'import',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────────────────────────────────────

export type InvoiceType   = 'product' | 'service';
export type InvoiceSource = 'order' | 'collection' | 'manual';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled';

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  product: 'فاتورة منتجات',
  service: 'فاتورة خدمات',
};

export const INVOICE_SOURCE_LABELS: Record<InvoiceSource, string> = {
  order:      'مبني على طلب',
  collection: 'مبني على تحصيل',
  manual:     'يدوي',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft:     'مسودة',
  issued:    'صادرة',
  paid:      'مدفوعة',
  cancelled: 'ملغاة',
};

export const INVOICE_TAX_RATES = [0, 5, 10, 15];
export const INVOICE_CURRENCIES = ['SAR', 'USD', 'EUR', 'AED', 'KWD', 'QAR', 'BHD'];

export interface InvoiceLineItem {
  id:            string;
  description:   string;
  quantity:      number;
  unitPrice:     number;
  taxable:       boolean;
  taxRate:       number;
  costCenterId?: string;
}

export interface Invoice {
  id:                        string;
  invoiceNumber:             string;
  type:                      InvoiceType;
  source:                    InvoiceSource;
  collectionId?:             string;
  collectionRef?:            string;
  orderId?:                  string;
  orderNumber?:              string;
  customerId?:               string;
  customerName:              string;
  customerPhone?:            string;
  customerAddress?:          string;
  customerTaxNumber?:        string;
  issueDate:                 string;
  issueDateIso:              string;
  dueDate?:                  string;
  currency:                  string;
  lines:                     InvoiceLineItem[];
  subtotal:                  number;
  totalTax:                  number;
  grandTotal:                number;
  generateReceiptVoucher:    boolean;
  generateAccountingEntries: boolean;
  notes?:                    string;
  termsAndConditions?:       string;
  status:                    InvoiceStatus;
  createdAt:                 string;
  createdBy:                 string;
}

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-0001',
    type: 'product',
    source: 'collection',
    collectionId: 'col-001',
    collectionRef: 'COL-2026-0001',
    orderId: 'lead-001',
    orderNumber: 'ORD-2026-0041',
    customerId: 'cus-001',
    customerName: 'شركة النخبة للتجارة',
    customerPhone: '+966 11 234 5678',
    customerAddress: 'حي العليا، شارع التخصصي، مبنى 42، الرياض',
    customerTaxNumber: '300123456700003',
    issueDate: '22 مايو 2026',
    issueDateIso: '2026-05-22',
    dueDate: '21 يونيو 2026',
    currency: 'SAR',
    lines: [
      { id: 'l1', description: 'معدات مكتبية — طقم كامل (5 وحدات)', quantity: 5, unitPrice: 3200, taxable: true, taxRate: 15, costCenterId: 'cc-006' },
      { id: 'l2', description: 'خدمة التركيب والتجهيز',               quantity: 1, unitPrice: 500,  taxable: true, taxRate: 15, costCenterId: 'cc-006' },
    ],
    subtotal: 16500,
    totalTax: 2475,
    grandTotal: 18975,
    generateReceiptVoucher: true,
    generateAccountingEntries: true,
    notes: 'شامل التوصيل والتركيب. الدفع تم عبر تحويل بنكي TXN-9985442.',
    termsAndConditions: 'البضاعة المباعة لا تُستبدل ولا تُرد إلا بعيب مُصنِّع موثّق.',
    status: 'paid',
    createdAt: '22 مايو 2026',
    createdBy: 'أحمد محمد',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-0002',
    type: 'service',
    source: 'collection',
    collectionId: 'col-002',
    collectionRef: 'COL-2026-0002',
    customerId: 'cus-003',
    customerName: 'مستشفى الحياة التخصصي',
    customerPhone: '+966 11 456 7890',
    customerAddress: 'حي المروج، شارع الملك فهد، الرياض',
    customerTaxNumber: '300987654300003',
    issueDate: '20 مايو 2026',
    issueDateIso: '2026-05-20',
    dueDate: '19 يونيو 2026',
    currency: 'SAR',
    lines: [
      { id: 'l1', description: 'مستلزمات طبية — أجهزة قياس (30 وحدة)', quantity: 30, unitPrice: 1300, taxable: true,  taxRate: 15, costCenterId: 'cc-006' },
      { id: 'l2', description: 'خدمة الصيانة الأولية (مرة واحدة)',      quantity: 1,  unitPrice: 500,  taxable: false, taxRate: 0,  costCenterId: 'cc-005' },
    ],
    subtotal: 39500,
    totalTax: 5850,
    grandTotal: 45350,
    generateReceiptVoucher: true,
    generateAccountingEntries: true,
    notes: 'تم التحقق من شهادة مطابقة المواصفات الخليجية.',
    status: 'issued',
    createdAt: '20 مايو 2026',
    createdBy: 'فيصل الدوسري',
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-0003',
    type: 'product',
    source: 'manual',
    customerName: 'محمد أحمد الزهراني',
    customerPhone: '+966 55 987 6543',
    customerAddress: 'حي الروضة، جدة',
    issueDate: '18 مايو 2026',
    issueDateIso: '2026-05-18',
    currency: 'SAR',
    lines: [
      { id: 'l1', description: 'أثاث مكتبي متنوع', quantity: 1, unitPrice: 7391.30, taxable: true, taxRate: 15, costCenterId: 'cc-007' },
    ],
    subtotal: 7391.30,
    totalTax: 1108.70,
    grandTotal: 8500,
    generateReceiptVoucher: false,
    generateAccountingEntries: true,
    status: 'draft',
    createdAt: '18 مايو 2026',
    createdBy: 'سارة الأحمد',
  },
];

// ── Import v2 — Source-Connected Imports ─────────────────────────────────────

export type ImportModuleType =
  | 'collection_deposit'
  | 'payments'
  | 'payroll'
  | 'customers_import'
  | 'vendors_import'
  | 'products_import'
  | 'customer_opening_balances'
  | 'vendor_opening_balances'
  | 'opening_entries';

export type ImportReviewStatus   = 'ready' | 'needs_review' | 'duplicate' | 'error';
export type ImportApprovalStatus = 'pending' | 'approved' | 'rejected';

export const IMPORT_MODULE_LABELS: Record<ImportModuleType, string> = {
  collection_deposit:        'تحصيلات وإيداعات',
  payments:                  'مدفوعات',
  payroll:                   'رواتب',
  customers_import:          'عملاء',
  vendors_import:            'موردون',
  products_import:           'منتجات وخدمات',
  customer_opening_balances: 'أرصدة افتتاحية — عملاء',
  vendor_opening_balances:   'أرصدة افتتاحية — موردون',
  opening_entries:           'قيود الافتتاح',
};

export const IMPORT_REVIEW_STATUS_LABELS: Record<ImportReviewStatus, string> = {
  ready:        'جاهز',
  needs_review: 'يحتاج مراجعة',
  duplicate:    'مكرر',
  error:        'خطأ',
};

export interface ImportSourceConfigV2 {
  id: string;
  name: string;
  moduleType: ImportModuleType;
  sheetUrl: string;
  sheetName?: string;
  companyId: string;
  companyName: string;
  branchId: string;
  branchName: string;
  currency: string;
  status: 'connected' | 'disconnected' | 'error';
  lastRefreshed?: string;
  totalRows?: number;
  createdAt: string;
}

export interface SmartMatchSuggestion {
  confidence: number;
  matchType: 'exact' | 'high' | 'medium' | 'low';
  matchedOn: string[];
  suggestedCustomerName: string;
  suggestedCustomerId?: string;
  suggestedOrderId?: string;
  suggestedInvoiceId?: string;
  suggestedAmount?: number;
  overrideApplied?: boolean;
}

export interface ImportValidationMessage {
  field: string;
  fieldAr: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ImportReviewRecordV2 {
  id: string;
  rowNumber: number;
  sourceConfigId: string;
  moduleType: ImportModuleType;
  reviewStatus: ImportReviewStatus;
  approvalStatus: ImportApprovalStatus;
  fields: Record<string, string>;
  validationMessages: ImportValidationMessage[];
  smartMatch?: SmartMatchSuggestion;
  notes?: string;
  createdAt: string;
}

export const mockImportSourceConfigs: ImportSourceConfigV2[] = [
  {
    id: 'src-001', name: 'تحصيلات مايو 2026', moduleType: 'collection_deposit',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc', sheetName: 'Collections',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'connected', lastRefreshed: '24 مايو 2026، 09:15', totalRows: 47, createdAt: '01 مايو 2026',
  },
  {
    id: 'src-002', name: 'مدفوعات الموردين — مايو', moduleType: 'payments',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/2def', sheetName: 'Payments',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'connected', lastRefreshed: '23 مايو 2026، 14:00', totalRows: 18, createdAt: '01 مايو 2026',
  },
  {
    id: 'src-003', name: 'رواتب مايو 2026', moduleType: 'payroll',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/3ghi', sheetName: 'Payroll',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'connected', lastRefreshed: '22 مايو 2026، 11:30', totalRows: 34, createdAt: '01 مايو 2026',
  },
  {
    id: 'src-004', name: 'قاعدة العملاء', moduleType: 'customers_import',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/4jkl', sheetName: 'Customers',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'connected', lastRefreshed: '20 مايو 2026، 10:00', totalRows: 120, createdAt: '15 أبريل 2026',
  },
  {
    id: 'src-005', name: 'قائمة الموردين', moduleType: 'vendors_import',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/5mno', sheetName: 'Vendors',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'disconnected', createdAt: '15 أبريل 2026',
  },
  {
    id: 'src-006', name: 'كتالوج المنتجات', moduleType: 'products_import',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/6pqr', sheetName: 'Products',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'connected', lastRefreshed: '18 مايو 2026، 08:45', totalRows: 89, createdAt: '01 أبريل 2026',
  },
  {
    id: 'src-007', name: 'أرصدة العملاء الافتتاحية', moduleType: 'customer_opening_balances',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/7stu', sheetName: 'Customer OB',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'connected', lastRefreshed: '10 مايو 2026، 09:00', totalRows: 45, createdAt: '01 يناير 2026',
  },
  {
    id: 'src-008', name: 'أرصدة الموردين الافتتاحية', moduleType: 'vendor_opening_balances',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/8vwx', sheetName: 'Vendor OB',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'connected', lastRefreshed: '10 مايو 2026، 09:05', totalRows: 22, createdAt: '01 يناير 2026',
  },
  {
    id: 'src-009', name: 'قيود الافتتاح', moduleType: 'opening_entries',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/9yza', sheetName: 'Opening Entries',
    companyId: 'co-01', companyName: 'الشركة الرئيسية', branchId: 'br-01', branchName: 'الفرع الرئيسي',
    currency: 'SAR', status: 'connected', lastRefreshed: '10 مايو 2026، 09:10', totalRows: 30, createdAt: '01 يناير 2026',
  },
];

export const mockCollectionReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'cr-001', rowNumber: 2, sourceConfigId: 'src-001', moduleType: 'collection_deposit',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { transaction_date: '01 مايو 2026', customer_name: 'أحمد محمد العلي', phone: '0501234567', amount: '1500.00', currency: 'SAR', payment_method: 'تحويل بنكي', reference: 'TXN-001' },
    validationMessages: [],
    smartMatch: { confidence: 97, matchType: 'exact', matchedOn: ['phone', 'amount', 'reference'], suggestedCustomerName: 'أحمد محمد العلي', suggestedCustomerId: 'cust-012', suggestedOrderId: 'ORD-2026-089', suggestedAmount: 1500 },
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cr-002', rowNumber: 3, sourceConfigId: 'src-001', moduleType: 'collection_deposit',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { transaction_date: '02 مايو 2026', customer_name: 'سارة خالد المنصور', phone: '0559876543', amount: '3200.00', currency: 'SAR', payment_method: 'بطاقة', reference: 'TXN-002' },
    validationMessages: [],
    smartMatch: { confidence: 89, matchType: 'high', matchedOn: ['phone', 'amount'], suggestedCustomerName: 'سارة خالد المنصور', suggestedCustomerId: 'cust-034', suggestedInvoiceId: 'INV-2026-112', suggestedAmount: 3200 },
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cr-003', rowNumber: 4, sourceConfigId: 'src-001', moduleType: 'collection_deposit',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { transaction_date: '03 مايو 2026', customer_name: 'عبدالله فهد', phone: '0531112222', amount: '750.00', currency: 'SAR', payment_method: 'نقد', reference: '' },
    validationMessages: [
      { field: 'reference', fieldAr: 'المرجع', message: 'رقم المرجع مفقود — يُنصح بإدخاله يدوياً', type: 'warning' },
      { field: 'customer_name', fieldAr: 'اسم العميل', message: 'تم العثور على أكثر من عميل بهذا الاسم', type: 'warning' },
    ],
    smartMatch: { confidence: 62, matchType: 'medium', matchedOn: ['phone'], suggestedCustomerName: 'عبدالله فهد السعيد', suggestedCustomerId: 'cust-056', suggestedAmount: 750 },
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cr-004', rowNumber: 5, sourceConfigId: 'src-001', moduleType: 'collection_deposit',
    reviewStatus: 'duplicate', approvalStatus: 'pending',
    fields: { transaction_date: '01 مايو 2026', customer_name: 'أحمد محمد العلي', phone: '0501234567', amount: '1500.00', currency: 'SAR', payment_method: 'تحويل بنكي', reference: 'TXN-001' },
    validationMessages: [
      { field: 'reference', fieldAr: 'المرجع', message: 'المرجع TXN-001 موجود مسبقاً في سجل cr-001', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cr-005', rowNumber: 6, sourceConfigId: 'src-001', moduleType: 'collection_deposit',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { transaction_date: '', customer_name: 'محمد سعد', phone: '055', amount: 'abc', currency: 'SAR', payment_method: '', reference: 'TXN-005' },
    validationMessages: [
      { field: 'transaction_date', fieldAr: 'تاريخ المعاملة', message: 'التاريخ مفقود أو غير صالح', type: 'error' },
      { field: 'amount', fieldAr: 'المبلغ', message: 'المبلغ يجب أن يكون رقماً صحيحاً', type: 'error' },
      { field: 'phone', fieldAr: 'رقم الهاتف', message: 'رقم الهاتف غير مكتمل', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cr-006', rowNumber: 7, sourceConfigId: 'src-001', moduleType: 'collection_deposit',
    reviewStatus: 'ready', approvalStatus: 'approved',
    fields: { transaction_date: '05 مايو 2026', customer_name: 'نورة العتيبي', phone: '0544556677', amount: '4800.00', currency: 'SAR', payment_method: 'تحويل بنكي', reference: 'TXN-006' },
    validationMessages: [],
    smartMatch: { confidence: 95, matchType: 'exact', matchedOn: ['phone', 'reference', 'amount'], suggestedCustomerName: 'نورة سالم العتيبي', suggestedCustomerId: 'cust-078', suggestedOrderId: 'ORD-2026-102', suggestedAmount: 4800 },
    createdAt: '23 مايو 2026',
  },
  {
    id: 'cr-007', rowNumber: 8, sourceConfigId: 'src-001', moduleType: 'collection_deposit',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { transaction_date: '06 مايو 2026', customer_name: 'شركة التقنية المتقدمة', phone: '0112345678', amount: '12500.00', currency: 'SAR', payment_method: 'تحويل بنكي', reference: 'TXN-007' },
    validationMessages: [
      { field: 'amount', fieldAr: 'المبلغ', message: 'المبلغ يتجاوز الحد المعتاد للعميل — يحتاج مراجعة', type: 'warning' },
    ],
    smartMatch: { confidence: 44, matchType: 'low', matchedOn: ['phone'], suggestedCustomerName: 'شركة التقنية المتقدمة ش.م.م', suggestedCustomerId: 'cust-091', suggestedAmount: 12500 },
    createdAt: '24 مايو 2026',
  },
];

export const mockPaymentReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'pr-001', rowNumber: 2, sourceConfigId: 'src-002', moduleType: 'payments',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { payment_date: '01 مايو 2026', vendor_name: 'مورد التوريدات العامة', amount: '8500.00', currency: 'SAR', reference: 'PY-001', bank: 'البنك الأهلي', notes: '' },
    validationMessages: [],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'pr-002', rowNumber: 3, sourceConfigId: 'src-002', moduleType: 'payments',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { payment_date: '03 مايو 2026', vendor_name: 'شركة الخدمات اللوجستية', amount: '15000.00', currency: 'SAR', reference: 'PY-002', bank: 'بنك الراجحي', notes: 'دفعة جزئية من فاتورة VND-2026-045' },
    validationMessages: [
      { field: 'vendor_name', fieldAr: 'اسم المورد', message: 'لم يتم العثور على المورد بهذا الاسم بدقة', type: 'warning' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'pr-003', rowNumber: 4, sourceConfigId: 'src-002', moduleType: 'payments',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { payment_date: '', vendor_name: 'مورد غير محدد', amount: '-500', currency: 'SAR', reference: '', bank: '', notes: '' },
    validationMessages: [
      { field: 'payment_date', fieldAr: 'تاريخ الدفع', message: 'التاريخ مفقود', type: 'error' },
      { field: 'amount', fieldAr: 'المبلغ', message: 'المبلغ لا يمكن أن يكون سالباً', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'pr-004', rowNumber: 5, sourceConfigId: 'src-002', moduleType: 'payments',
    reviewStatus: 'ready', approvalStatus: 'approved',
    fields: { payment_date: '05 مايو 2026', vendor_name: 'مؤسسة الصيانة الشاملة', amount: '3200.00', currency: 'SAR', reference: 'PY-004', bank: 'بنك سامبا', notes: '' },
    validationMessages: [],
    createdAt: '23 مايو 2026',
  },
];

export const mockPayrollReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'pay-001', rowNumber: 2, sourceConfigId: 'src-003', moduleType: 'payroll',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { employee_name: 'خالد محمد الشمري', employee_id: 'EMP-001', base_salary: '8000.00', allowances: '1500.00', deductions: '200.00', net_salary: '9300.00', payment_date: '28 مايو 2026' },
    validationMessages: [],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'pay-002', rowNumber: 3, sourceConfigId: 'src-003', moduleType: 'payroll',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { employee_name: 'فاطمة علي الزهراني', employee_id: 'EMP-002', base_salary: '6500.00', allowances: '1000.00', deductions: '0.00', net_salary: '7500.00', payment_date: '28 مايو 2026' },
    validationMessages: [],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'pay-003', rowNumber: 4, sourceConfigId: 'src-003', moduleType: 'payroll',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { employee_name: 'عمر سعيد الغامدي', employee_id: 'EMP-003', base_salary: '7200.00', allowances: '2000.00', deductions: '500.00', net_salary: '9200.00', payment_date: '28 مايو 2026' },
    validationMessages: [
      { field: 'net_salary', fieldAr: 'صافي الراتب', message: 'الصافي المحسوب يختلف عن القيمة المدخلة (8700 vs 9200)', type: 'warning' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'pay-004', rowNumber: 5, sourceConfigId: 'src-003', moduleType: 'payroll',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { employee_name: 'موظف غير موجود', employee_id: 'EMP-999', base_salary: '5000.00', allowances: '0.00', deductions: '0.00', net_salary: '5000.00', payment_date: '28 مايو 2026' },
    validationMessages: [
      { field: 'employee_id', fieldAr: 'رقم الموظف', message: 'رقم الموظف EMP-999 غير موجود في النظام', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
];

export const mockCustomerImportReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'cir-001', rowNumber: 2, sourceConfigId: 'src-004', moduleType: 'customers_import',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { name: 'محمد عبدالرحمن الحربي', phone: '0512345678', email: 'mharbi@email.com', country: 'المملكة العربية السعودية', city: 'الرياض', customer_type: 'أفراد' },
    validationMessages: [],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cir-002', rowNumber: 3, sourceConfigId: 'src-004', moduleType: 'customers_import',
    reviewStatus: 'duplicate', approvalStatus: 'pending',
    fields: { name: 'أحمد محمد العلي', phone: '0501234567', email: 'aali@email.com', country: 'المملكة العربية السعودية', city: 'جدة', customer_type: 'أفراد' },
    validationMessages: [
      { field: 'phone', fieldAr: 'رقم الهاتف', message: 'رقم الهاتف مسجل مسبقاً للعميل cust-012', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cir-003', rowNumber: 4, sourceConfigId: 'src-004', moduleType: 'customers_import',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { name: 'شركة الإنشاءات المتحدة', phone: '0114567890', email: 'info@uconstruct.sa', country: 'المملكة العربية السعودية', city: 'الدمام', customer_type: 'شركات' },
    validationMessages: [],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cir-004', rowNumber: 5, sourceConfigId: 'src-004', moduleType: 'customers_import',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { name: 'عميل بدون بريد', phone: '0567891234', email: '', country: 'المملكة العربية السعودية', city: '', customer_type: 'أفراد' },
    validationMessages: [
      { field: 'email', fieldAr: 'البريد الإلكتروني', message: 'البريد الإلكتروني مفقود', type: 'warning' },
      { field: 'city', fieldAr: 'المدينة', message: 'المدينة مفقودة', type: 'warning' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'cir-005', rowNumber: 6, sourceConfigId: 'src-004', moduleType: 'customers_import',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { name: '', phone: '', email: 'invalid-email', country: '', city: '', customer_type: '' },
    validationMessages: [
      { field: 'name', fieldAr: 'الاسم', message: 'الاسم مطلوب', type: 'error' },
      { field: 'phone', fieldAr: 'رقم الهاتف', message: 'رقم الهاتف مطلوب', type: 'error' },
      { field: 'email', fieldAr: 'البريد الإلكتروني', message: 'صيغة البريد الإلكتروني غير صحيحة', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
];

export const mockVendorImportReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'vir-001', rowNumber: 2, sourceConfigId: 'src-005', moduleType: 'vendors_import',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { name: 'مؤسسة التوريدات الصناعية', phone: '0114432100', email: 'info@ind-supplies.sa', country: 'المملكة العربية السعودية', city: 'الرياض', tax_number: '300123456700003', payment_terms: '30 يوم' },
    validationMessages: [],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'vir-002', rowNumber: 3, sourceConfigId: 'src-005', moduleType: 'vendors_import',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { name: 'شركة الخدمات المتكاملة', phone: '0126789012', email: '', country: 'المملكة العربية السعودية', city: 'جدة', tax_number: '', payment_terms: '60 يوم' },
    validationMessages: [
      { field: 'email', fieldAr: 'البريد الإلكتروني', message: 'البريد الإلكتروني مفقود', type: 'warning' },
      { field: 'tax_number', fieldAr: 'الرقم الضريبي', message: 'الرقم الضريبي مفقود — مطلوب للفواتير الضريبية', type: 'warning' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'vir-003', rowNumber: 4, sourceConfigId: 'src-005', moduleType: 'vendors_import',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { name: '', phone: '055', email: 'bad', country: '', city: '', tax_number: '123', payment_terms: '' },
    validationMessages: [
      { field: 'name', fieldAr: 'الاسم', message: 'اسم المورد مطلوب', type: 'error' },
      { field: 'phone', fieldAr: 'رقم الهاتف', message: 'رقم الهاتف غير مكتمل', type: 'error' },
      { field: 'tax_number', fieldAr: 'الرقم الضريبي', message: 'الرقم الضريبي يجب أن يكون 15 خانة', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
];

export const mockProductImportReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'prd-001', rowNumber: 2, sourceConfigId: 'src-006', moduleType: 'products_import',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { name: 'طابعة ليزر A4', sku: 'PRN-LA4-001', category: 'إلكترونيات', unit: 'قطعة', price: '850.00', cost: '620.00', tax_rate: '15' },
    validationMessages: [],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'prd-002', rowNumber: 3, sourceConfigId: 'src-006', moduleType: 'products_import',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { name: 'كرسي مكتبي قابل للتعديل', sku: 'CHR-ADJ-002', category: 'أثاث', unit: 'قطعة', price: '1200.00', cost: '890.00', tax_rate: '15' },
    validationMessages: [],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'prd-003', rowNumber: 4, sourceConfigId: 'src-006', moduleType: 'products_import',
    reviewStatus: 'duplicate', approvalStatus: 'pending',
    fields: { name: 'طابعة ليزر A4', sku: 'PRN-LA4-001', category: 'إلكترونيات', unit: 'قطعة', price: '870.00', cost: '630.00', tax_rate: '15' },
    validationMessages: [
      { field: 'sku', fieldAr: 'رمز المنتج', message: 'رمز المنتج PRN-LA4-001 موجود مسبقاً في النظام', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'prd-004', rowNumber: 5, sourceConfigId: 'src-006', moduleType: 'products_import',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { name: 'خدمة الصيانة السنوية', sku: 'SRV-ANN-001', category: 'خدمات', unit: 'خدمة', price: '2500.00', cost: '', tax_rate: '15' },
    validationMessages: [
      { field: 'cost', fieldAr: 'التكلفة', message: 'تكلفة الخدمة غير محددة', type: 'warning' },
    ],
    createdAt: '24 مايو 2026',
  },
  {
    id: 'prd-005', rowNumber: 6, sourceConfigId: 'src-006', moduleType: 'products_import',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { name: '', sku: '', category: '', unit: '', price: '-100', cost: '0', tax_rate: '25' },
    validationMessages: [
      { field: 'name', fieldAr: 'الاسم', message: 'اسم المنتج مطلوب', type: 'error' },
      { field: 'sku', fieldAr: 'رمز المنتج', message: 'رمز المنتج مطلوب', type: 'error' },
      { field: 'price', fieldAr: 'السعر', message: 'السعر لا يمكن أن يكون سالباً', type: 'error' },
      { field: 'tax_rate', fieldAr: 'نسبة الضريبة', message: 'نسبة الضريبة يجب أن تكون 0% أو 15%', type: 'error' },
    ],
    createdAt: '24 مايو 2026',
  },
];

// ── Accounting Operation Centers ──────────────────────────────────────────────

export type OperationPostingStatus  = 'unposted' | 'posting' | 'posted' | 'failed';
export type OperationApprovalStatus = 'pending'  | 'approved' | 'rejected';

export type IncomingSourceType =
  | 'customer_collection'
  | 'bank_deposit'
  | 'wallet_deposit'
  | 'payment_gateway'
  | 'other_income';

export type OutgoingSourceType =
  | 'vendor_payment'
  | 'payroll'
  | 'expense'
  | 'advance'
  | 'tax_payment'
  | 'operational_payment';

export const INCOMING_SOURCE_LABELS: Record<IncomingSourceType, string> = {
  customer_collection: 'تحصيل عميل',
  bank_deposit:        'إيداع بنكي',
  wallet_deposit:      'إيداع محفظة',
  payment_gateway:     'بوابة دفع',
  other_income:        'إيراد آخر',
};

export const OUTGOING_SOURCE_LABELS: Record<OutgoingSourceType, string> = {
  vendor_payment:      'سداد مورد',
  payroll:             'رواتب',
  expense:             'مصروف',
  advance:             'سلفة',
  tax_payment:         'سداد ضريبة',
  operational_payment: 'مدفوع تشغيلي',
};

export interface LinkedEntity {
  id: string;
  label: string;
  type: 'invoice' | 'customer' | 'vendor' | 'journal' | 'order';
}

export interface OperationRecord {
  id: string;
  rowNumber: number;
  sourceConfigId: string;
  sourceType: IncomingSourceType | OutgoingSourceType;
  transactionDate: string;
  valueDate?: string;
  amount: number;
  currency: string;
  reference: string;
  partyName: string;
  description?: string;
  postingStatus: OperationPostingStatus;
  approvalStatus: OperationApprovalStatus;
  postedAt?: string;
  postedBy?: string;
  journalEntryId?: string;
  linkedEntities: LinkedEntity[];
  notes?: string;
  importedAt: string;
  lastRefreshed: string;
}

export const mockIncomingOperations: OperationRecord[] = [
  {
    id: 'inc-001', rowNumber: 1, sourceConfigId: 'src-001', sourceType: 'customer_collection',
    transactionDate: '2026-05-20', valueDate: '2026-05-20',
    amount: 48500, currency: 'SAR', reference: 'COL-2026-0412', partyName: 'شركة الرياض التجارية',
    description: 'سداد فاتورة INV-2026-0089',
    postingStatus: 'posted', approvalStatus: 'approved',
    postedAt: '2026-05-21', postedBy: 'خالد المنصور', journalEntryId: 'JE-2026-1123',
    linkedEntities: [
      { id: 'inv-089', label: 'INV-2026-0089', type: 'invoice' },
      { id: 'cust-012', label: 'شركة الرياض التجارية', type: 'customer' },
      { id: 'je-1123', label: 'JE-2026-1123', type: 'journal' },
    ],
    importedAt: '2026-05-21', lastRefreshed: '2026-05-24',
  },
  {
    id: 'inc-002', rowNumber: 2, sourceConfigId: 'src-001', sourceType: 'customer_collection',
    transactionDate: '2026-05-21', valueDate: '2026-05-21',
    amount: 12750, currency: 'SAR', reference: 'COL-2026-0413', partyName: 'مؤسسة البناء الحديث',
    description: 'دفعة جزئية على فاتورة INV-2026-0091',
    postingStatus: 'unposted', approvalStatus: 'approved',
    linkedEntities: [
      { id: 'inv-091', label: 'INV-2026-0091', type: 'invoice' },
      { id: 'cust-019', label: 'مؤسسة البناء الحديث', type: 'customer' },
    ],
    importedAt: '2026-05-22', lastRefreshed: '2026-05-24',
  },
  {
    id: 'inc-003', rowNumber: 3, sourceConfigId: 'src-001', sourceType: 'bank_deposit',
    transactionDate: '2026-05-22', valueDate: '2026-05-22',
    amount: 75000, currency: 'SAR', reference: 'DEP-2026-0055', partyName: 'البنك الأهلي',
    description: 'إيداع من حساب العمليات',
    postingStatus: 'posted', approvalStatus: 'approved',
    postedAt: '2026-05-23', postedBy: 'سارة الأحمد', journalEntryId: 'JE-2026-1130',
    linkedEntities: [
      { id: 'je-1130', label: 'JE-2026-1130', type: 'journal' },
    ],
    importedAt: '2026-05-23', lastRefreshed: '2026-05-24',
  },
  {
    id: 'inc-004', rowNumber: 4, sourceConfigId: 'src-001', sourceType: 'customer_collection',
    transactionDate: '2026-05-22',
    amount: 33200, currency: 'SAR', reference: 'COL-2026-0414', partyName: 'شركة النخبة للتقنية',
    postingStatus: 'unposted', approvalStatus: 'pending',
    linkedEntities: [
      { id: 'cust-031', label: 'شركة النخبة للتقنية', type: 'customer' },
    ],
    importedAt: '2026-05-24', lastRefreshed: '2026-05-24',
  },
  {
    id: 'inc-005', rowNumber: 5, sourceConfigId: 'src-001', sourceType: 'payment_gateway',
    transactionDate: '2026-05-23',
    amount: 5840, currency: 'SAR', reference: 'PGW-2026-0287', partyName: 'Mada / STC Pay',
    description: 'تحصيلات بوابة الدفع الإلكتروني',
    postingStatus: 'failed', approvalStatus: 'approved',
    notes: 'فشل الترحيل: حساب الإيرادات غير محدد',
    linkedEntities: [],
    importedAt: '2026-05-24', lastRefreshed: '2026-05-24',
  },
  {
    id: 'inc-006', rowNumber: 6, sourceConfigId: 'src-001', sourceType: 'wallet_deposit',
    transactionDate: '2026-05-23',
    amount: 2100, currency: 'SAR', reference: 'WLT-2026-0091', partyName: 'محفظة STC Pay',
    postingStatus: 'unposted', approvalStatus: 'pending',
    linkedEntities: [],
    importedAt: '2026-05-24', lastRefreshed: '2026-05-24',
  },
  {
    id: 'inc-007', rowNumber: 7, sourceConfigId: 'src-001', sourceType: 'other_income',
    transactionDate: '2026-05-24',
    amount: 1500, currency: 'SAR', reference: 'OTH-2026-0012', partyName: 'غير محدد',
    description: 'إيراد متنوع',
    postingStatus: 'unposted', approvalStatus: 'pending',
    linkedEntities: [],
    importedAt: '2026-05-24', lastRefreshed: '2026-05-24',
  },
];

export const mockOutgoingOperations: OperationRecord[] = [
  {
    id: 'out-001', rowNumber: 1, sourceConfigId: 'src-002', sourceType: 'vendor_payment',
    transactionDate: '2026-05-19', valueDate: '2026-05-19',
    amount: 24000, currency: 'SAR', reference: 'PAY-2026-0203', partyName: 'مورد المكتبيات المتحدة',
    description: 'سداد فاتورة مشتريات PO-2026-0088',
    postingStatus: 'posted', approvalStatus: 'approved',
    postedAt: '2026-05-20', postedBy: 'خالد المنصور', journalEntryId: 'JE-2026-1095',
    linkedEntities: [
      { id: 'vnd-007', label: 'مورد المكتبيات المتحدة', type: 'vendor' },
      { id: 'je-1095', label: 'JE-2026-1095', type: 'journal' },
    ],
    importedAt: '2026-05-20', lastRefreshed: '2026-05-24',
  },
  {
    id: 'out-002', rowNumber: 2, sourceConfigId: 'src-002', sourceType: 'payroll',
    transactionDate: '2026-05-25',
    amount: 185000, currency: 'SAR', reference: 'SAL-2026-05', partyName: 'رواتب شهر مايو 2026',
    description: 'رواتب الموظفين - مايو 2026 (37 موظف)',
    postingStatus: 'unposted', approvalStatus: 'approved',
    linkedEntities: [],
    importedAt: '2026-05-24', lastRefreshed: '2026-05-24',
  },
  {
    id: 'out-003', rowNumber: 3, sourceConfigId: 'src-002', sourceType: 'expense',
    transactionDate: '2026-05-20',
    amount: 8500, currency: 'SAR', reference: 'EXP-2026-0441', partyName: 'شركة الاتصالات السعودية',
    description: 'فاتورة خدمات الاتصالات',
    postingStatus: 'posted', approvalStatus: 'approved',
    postedAt: '2026-05-21', postedBy: 'سارة الأحمد', journalEntryId: 'JE-2026-1108',
    linkedEntities: [
      { id: 'je-1108', label: 'JE-2026-1108', type: 'journal' },
    ],
    importedAt: '2026-05-21', lastRefreshed: '2026-05-24',
  },
  {
    id: 'out-004', rowNumber: 4, sourceConfigId: 'src-002', sourceType: 'tax_payment',
    transactionDate: '2026-05-22',
    amount: 62750, currency: 'SAR', reference: 'TAX-2026-Q1', partyName: 'هيئة الزكاة والضريبة',
    description: 'سداد ضريبة القيمة المضافة - الربع الأول 2026',
    postingStatus: 'unposted', approvalStatus: 'pending',
    linkedEntities: [],
    importedAt: '2026-05-22', lastRefreshed: '2026-05-24',
  },
  {
    id: 'out-005', rowNumber: 5, sourceConfigId: 'src-002', sourceType: 'advance',
    transactionDate: '2026-05-21',
    amount: 5000, currency: 'SAR', reference: 'ADV-2026-0031', partyName: 'أحمد السليمان',
    description: 'سلفة موظف',
    postingStatus: 'failed', approvalStatus: 'approved',
    notes: 'فشل الترحيل: حساب السلف الموظفين غير مرتبط',
    linkedEntities: [],
    importedAt: '2026-05-22', lastRefreshed: '2026-05-24',
  },
  {
    id: 'out-006', rowNumber: 6, sourceConfigId: 'src-002', sourceType: 'operational_payment',
    transactionDate: '2026-05-23',
    amount: 3200, currency: 'SAR', reference: 'OPR-2026-0077', partyName: 'خدمات التنظيف',
    description: 'رسوم خدمات النظافة الشهرية',
    postingStatus: 'unposted', approvalStatus: 'pending',
    linkedEntities: [],
    importedAt: '2026-05-23', lastRefreshed: '2026-05-24',
  },
];

export const mockCustomerOBReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'cob-001', rowNumber: 2, sourceConfigId: 'src-007', moduleType: 'customer_opening_balances',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { customer_name: 'أحمد محمد العلي', account_code: '1100-001', debit: '5000.00', credit: '0.00', date: '01 يناير 2026' },
    validationMessages: [],
    createdAt: '10 مايو 2026',
  },
  {
    id: 'cob-002', rowNumber: 3, sourceConfigId: 'src-007', moduleType: 'customer_opening_balances',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { customer_name: 'شركة الإنشاءات المتحدة', account_code: '1100-002', debit: '18500.00', credit: '0.00', date: '01 يناير 2026' },
    validationMessages: [],
    createdAt: '10 مايو 2026',
  },
  {
    id: 'cob-003', rowNumber: 4, sourceConfigId: 'src-007', moduleType: 'customer_opening_balances',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { customer_name: 'عميل غير معروف', account_code: '1100-003', debit: '2300.00', credit: '0.00', date: '01 يناير 2026' },
    validationMessages: [
      { field: 'customer_name', fieldAr: 'اسم العميل', message: 'العميل غير موجود في النظام — سيتم إنشاؤه تلقائياً', type: 'warning' },
    ],
    createdAt: '10 مايو 2026',
  },
  {
    id: 'cob-004', rowNumber: 5, sourceConfigId: 'src-007', moduleType: 'customer_opening_balances',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { customer_name: 'نورة العتيبي', account_code: '', debit: '1200.00', credit: '500.00', date: '01 يناير 2026' },
    validationMessages: [
      { field: 'account_code', fieldAr: 'رمز الحساب', message: 'رمز الحساب مطلوب', type: 'error' },
      { field: 'debit', fieldAr: 'مدين', message: 'لا يمكن أن يكون كلٌّ من المدين والدائن غير صفر في نفس الصف', type: 'error' },
    ],
    createdAt: '10 مايو 2026',
  },
];

export const mockVendorOBReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'vob-001', rowNumber: 2, sourceConfigId: 'src-008', moduleType: 'vendor_opening_balances',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { vendor_name: 'مؤسسة التوريدات الصناعية', account_code: '2100-001', debit: '0.00', credit: '12000.00', date: '01 يناير 2026' },
    validationMessages: [],
    createdAt: '10 مايو 2026',
  },
  {
    id: 'vob-002', rowNumber: 3, sourceConfigId: 'src-008', moduleType: 'vendor_opening_balances',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { vendor_name: 'مورد جديد', account_code: '2100-002', debit: '0.00', credit: '7500.00', date: '01 يناير 2026' },
    validationMessages: [
      { field: 'vendor_name', fieldAr: 'اسم المورد', message: 'المورد غير موجود في النظام — سيتم إنشاؤه تلقائياً', type: 'warning' },
    ],
    createdAt: '10 مايو 2026',
  },
  {
    id: 'vob-003', rowNumber: 4, sourceConfigId: 'src-008', moduleType: 'vendor_opening_balances',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { vendor_name: '', account_code: '2100-003', debit: '500.00', credit: '500.00', date: '' },
    validationMessages: [
      { field: 'vendor_name', fieldAr: 'اسم المورد', message: 'اسم المورد مطلوب', type: 'error' },
      { field: 'date', fieldAr: 'التاريخ', message: 'التاريخ مطلوب', type: 'error' },
      { field: 'debit', fieldAr: 'مدين', message: 'لا يمكن أن يكون كلٌّ من المدين والدائن غير صفر في نفس الصف', type: 'error' },
    ],
    createdAt: '10 مايو 2026',
  },
];

export const mockOpeningEntriesReviewRecords: ImportReviewRecordV2[] = [
  {
    id: 'oe-001', rowNumber: 2, sourceConfigId: 'src-009', moduleType: 'opening_entries',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { date: '01 يناير 2026', description: 'رصيد افتتاحي — نقدية', account_code: '1010', debit: '50000.00', credit: '0.00', reference: 'OE-2026-001' },
    validationMessages: [],
    createdAt: '10 مايو 2026',
  },
  {
    id: 'oe-002', rowNumber: 3, sourceConfigId: 'src-009', moduleType: 'opening_entries',
    reviewStatus: 'ready', approvalStatus: 'pending',
    fields: { date: '01 يناير 2026', description: 'رصيد افتتاحي — رأس المال', account_code: '3010', debit: '0.00', credit: '50000.00', reference: 'OE-2026-001' },
    validationMessages: [],
    createdAt: '10 مايو 2026',
  },
  {
    id: 'oe-003', rowNumber: 4, sourceConfigId: 'src-009', moduleType: 'opening_entries',
    reviewStatus: 'needs_review', approvalStatus: 'pending',
    fields: { date: '01 يناير 2026', description: 'رصيد افتتاحي — مخزون', account_code: '1400', debit: '35000.00', credit: '0.00', reference: 'OE-2026-002' },
    validationMessages: [
      { field: 'account_code', fieldAr: 'رمز الحساب', message: 'رمز الحساب 1400 لم يتم التحقق منه في دليل الحسابات', type: 'warning' },
    ],
    createdAt: '10 مايو 2026',
  },
  {
    id: 'oe-004', rowNumber: 5, sourceConfigId: 'src-009', moduleType: 'opening_entries',
    reviewStatus: 'error', approvalStatus: 'pending',
    fields: { date: '', description: '', account_code: 'INVALID', debit: 'abc', credit: '0.00', reference: '' },
    validationMessages: [
      { field: 'date', fieldAr: 'التاريخ', message: 'التاريخ مطلوب', type: 'error' },
      { field: 'account_code', fieldAr: 'رمز الحساب', message: 'رمز الحساب غير صالح', type: 'error' },
      { field: 'debit', fieldAr: 'مدين', message: 'المبلغ يجب أن يكون رقماً', type: 'error' },
    ],
    createdAt: '10 مايو 2026',
  },
];
