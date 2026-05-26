// Purchasing Module — Mock Data
// UI-only. No backend calls.

import { fDate } from '@/lib/format';

// ── Types ─────────────────────────────────────────────────────────────────────

export type VendorStatus = 'active' | 'inactive' | 'blacklisted';
export type PrStatus     = 'draft' | 'approved' | 'cancelled';
export type RfqStatus    = 'draft' | 'sent' | 'received' | 'cancelled';
export type PoStatus     = 'draft' | 'approved' | 'received' | 'invoiced' | 'paid' | 'cancelled';
export type PiStatus     = 'draft' | 'approved' | 'paid' | 'cancelled';
export type DnStatus     = 'draft' | 'approved' | 'paid' | 'cancelled';
export type PrRetStatus  = 'draft' | 'approved' | 'received' | 'cancelled';
export type VpStatus     = 'draft' | 'approved' | 'paid' | 'cancelled';

export const PR_STATUS_LABELS: Record<PrStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمد',
  cancelled: 'ملغي',
};

export const RFQ_STATUS_LABELS: Record<RfqStatus, string> = {
  draft:     'مسودة',
  sent:      'مُرسل',
  received:  'مستلم',
  cancelled: 'ملغي',
};

export const PO_STATUS_LABELS: Record<PoStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمد',
  received:  'مستلم',
  invoiced:  'مُفوتر',
  paid:      'مدفوع',
  cancelled: 'ملغي',
};

export const PI_STATUS_LABELS: Record<PiStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمدة',
  paid:      'مدفوعة',
  cancelled: 'ملغية',
};

export const DN_STATUS_LABELS: Record<DnStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمد',
  paid:      'مدفوع',
  cancelled: 'ملغي',
};

export const PR_RET_STATUS_LABELS: Record<PrRetStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمد',
  received:  'مستلم',
  cancelled: 'ملغي',
};

export const VP_STATUS_LABELS: Record<VpStatus, string> = {
  draft:     'مسودة',
  approved:  'معتمدة',
  paid:      'مدفوعة',
  cancelled: 'ملغية',
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  active:      'نشط',
  inactive:    'غير نشط',
  blacklisted: 'محظور',
};

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PurchaseLineItem {
  id: string;
  product: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Vendor {
  id: string;
  code: string;
  nameAr: string;
  phone: string;
  email: string;
  city: string;
  vatNumber: string;
  paymentTerms: string;
  creditLimit: number;
  currentBalance: number;
  totalPurchases: number;
  status: VendorStatus;
  createdDate: string;
  lastOrderDate: string;
  lastOrderDateIso: string;
  tags: string[];
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  vendorId: string;
  vendorName: string;
  requestedBy: string;
  department: string;
  totalAmount: number;
  currency: string;
  status: PrStatus;
  createdDate: string;
  createdDateIso: string;
  approvedDate?: string;
  notes?: string;
  items: PurchaseLineItem[];
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  prNumber?: string;
  vendorId: string;
  vendorName: string;
  status: RfqStatus;
  totalAmount: number;
  currency: string;
  issueDate: string;
  issueDateIso: string;
  validUntil: string;
  notes?: string;
  items: PurchaseLineItem[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqNumber?: string;
  vendorId: string;
  vendorName: string;
  status: PoStatus;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  orderDate: string;
  orderDateIso: string;
  expectedDate: string;
  receivedDate?: string;
  invoiceNumber?: string;
  paymentDate?: string;
  notes?: string;
  items: PurchaseLineItem[];
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  poNumber?: string;
  vendorId: string;
  vendorName: string;
  vendorInvoiceRef: string;
  status: PiStatus;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  invoiceDate: string;
  invoiceDateIso: string;
  dueDate: string;
  dueDateIso: string;
  paymentDate?: string;
  notes?: string;
}

export interface DebitNote {
  id: string;
  dnNumber: string;
  vendorId: string;
  vendorName: string;
  status: DnStatus;
  totalAmount: number;
  currency: string;
  issueDate: string;
  issueDateIso: string;
  reason: string;
  notes?: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  poNumber?: string;
  vendorId: string;
  vendorName: string;
  status: PrRetStatus;
  totalAmount: number;
  currency: string;
  returnDate: string;
  returnDateIso: string;
  reason: string;
  notes?: string;
  items: PurchaseLineItem[];
}

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  vendorId: string;
  vendorName: string;
  status: VpStatus;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentDateIso: string;
  paymentMethod: string;
  reference: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface VendorStatement {
  id: string;
  date: string;
  dateIso: string;
  docNumber: string;
  type: 'فاتورة' | 'دفعة' | 'إشعار مدين' | 'مرتجع' | 'رصيد افتتاحي';
  debit: number;
  credit: number;
  balance: number;
}

// ── Vendors ───────────────────────────────────────────────────────────────────

export const mockVendors: Vendor[] = [
  {
    id: 'v001', code: 'VND-001', nameAr: 'شركة الراجحي للتوريدات',
    phone: '+966 11 234 5678', email: 'info@alrajhi-supply.com',
    city: 'الرياض', vatNumber: '300100123400003',
    paymentTerms: '30 يوم', creditLimit: 500000, currentBalance: 128500, totalPurchases: 1245000,
    status: 'active', createdDate: '1 Jan 2024', lastOrderDate: '20 May 2026', lastOrderDateIso: '2026-05-20',
    tags: ['مُعتمد', 'رئيسي'],
  },
  {
    id: 'v002', code: 'VND-002', nameAr: 'مؤسسة العربية للأجهزة',
    phone: '+966 12 345 6789', email: 'orders@arabian-equip.com',
    city: 'جدة', vatNumber: '300200234500004',
    paymentTerms: '45 يوم', creditLimit: 300000, currentBalance: 67200, totalPurchases: 832000,
    status: 'active', createdDate: '15 Feb 2024', lastOrderDate: '18 May 2026', lastOrderDateIso: '2026-05-18',
    tags: ['مُعتمد'],
  },
  {
    id: 'v003', code: 'VND-003', nameAr: 'شركة صفوان للمواد الخام',
    phone: '+966 13 456 7890', email: 'supply@safwan.sa',
    city: 'الدمام', vatNumber: '300300345600005',
    paymentTerms: '60 يوم', creditLimit: 750000, currentBalance: 234000, totalPurchases: 2150000,
    status: 'active', createdDate: '10 Mar 2023', lastOrderDate: '22 May 2026', lastOrderDateIso: '2026-05-22',
    tags: ['استراتيجي', 'مُعتمد'],
  },
  {
    id: 'v004', code: 'VND-004', nameAr: 'مجموعة الخليج التجارية',
    phone: '+966 14 567 8901', email: 'trade@gulf-group.com',
    city: 'الرياض', vatNumber: '300400456700006',
    paymentTerms: '30 يوم', creditLimit: 200000, currentBalance: 45800, totalPurchases: 567000,
    status: 'active', createdDate: '5 Jun 2023', lastOrderDate: '15 May 2026', lastOrderDateIso: '2026-05-15',
    tags: ['مُعتمد'],
  },
  {
    id: 'v005', code: 'VND-005', nameAr: 'شركة نجد للتوريدات',
    phone: '+966 11 678 9012', email: 'info@najd-supply.sa',
    city: 'الرياض', vatNumber: '300500567800007',
    paymentTerms: '30 يوم', creditLimit: 400000, currentBalance: 112000, totalPurchases: 980000,
    status: 'active', createdDate: '20 Aug 2023', lastOrderDate: '10 May 2026', lastOrderDateIso: '2026-05-10',
    tags: ['مُعتمد', 'رئيسي'],
  },
  {
    id: 'v006', code: 'VND-006', nameAr: 'مؤسسة الأمانة للتجارة',
    phone: '+966 12 789 0123', email: 'amanah@trade.com',
    city: 'جدة', vatNumber: '300600678900008',
    paymentTerms: '15 يوم', creditLimit: 150000, currentBalance: 28600, totalPurchases: 345000,
    status: 'active', createdDate: '1 Sep 2023', lastOrderDate: '8 May 2026', lastOrderDateIso: '2026-05-08',
    tags: [],
  },
  {
    id: 'v007', code: 'VND-007', nameAr: 'شركة الشرق للكيماويات',
    phone: '+966 13 890 1234', email: 'chem@east-chem.sa',
    city: 'الدمام', vatNumber: '300700789000009',
    paymentTerms: '60 يوم', creditLimit: 600000, currentBalance: 189000, totalPurchases: 1780000,
    status: 'active', createdDate: '15 Jan 2023', lastOrderDate: '19 May 2026', lastOrderDateIso: '2026-05-19',
    tags: ['استراتيجي', 'مُعتمد'],
  },
  {
    id: 'v008', code: 'VND-008', nameAr: 'مجموعة الدرع للمقاولات',
    phone: '+966 11 901 2345', email: 'info@aldare.com',
    city: 'الرياض', vatNumber: '300800890100010',
    paymentTerms: '45 يوم', creditLimit: 250000, currentBalance: 0, totalPurchases: 420000,
    status: 'inactive', createdDate: '10 Apr 2023', lastOrderDate: '1 Feb 2026', lastOrderDateIso: '2026-02-01',
    tags: [],
  },
  {
    id: 'v009', code: 'VND-009', nameAr: 'شركة مدار للخدمات اللوجستية',
    phone: '+966 14 012 3456', email: 'logistics@madar.sa',
    city: 'المدينة المنورة', vatNumber: '300900901200011',
    paymentTerms: '30 يوم', creditLimit: 350000, currentBalance: 78400, totalPurchases: 654000,
    status: 'active', createdDate: '25 Oct 2023', lastOrderDate: '12 May 2026', lastOrderDateIso: '2026-05-12',
    tags: ['مُعتمد'],
  },
  {
    id: 'v010', code: 'VND-010', nameAr: 'مؤسسة الحضارة للإمداد',
    phone: '+966 16 123 4567', email: 'hadara@supply.sa',
    city: 'أبها', vatNumber: '301000012300012',
    paymentTerms: '30 يوم', creditLimit: 180000, currentBalance: 34200, totalPurchases: 287000,
    status: 'active', createdDate: '5 Dec 2023', lastOrderDate: '5 May 2026', lastOrderDateIso: '2026-05-05',
    tags: [],
  },
  {
    id: 'v011', code: 'VND-011', nameAr: 'شركة فارس للصناعات',
    phone: '+966 11 234 5670', email: 'faris@industries.sa',
    city: 'الرياض', vatNumber: '301100123400013',
    paymentTerms: '60 يوم', creditLimit: 500000, currentBalance: 156000, totalPurchases: 1120000,
    status: 'active', createdDate: '1 Mar 2023', lastOrderDate: '21 May 2026', lastOrderDateIso: '2026-05-21',
    tags: ['استراتيجي', 'مُعتمد'],
  },
  {
    id: 'v012', code: 'VND-012', nameAr: 'مؤسسة النور للتجارة',
    phone: '+966 12 345 6780', email: 'alnour@trade.sa',
    city: 'جدة', vatNumber: '301200234500014',
    paymentTerms: '30 يوم', creditLimit: 120000, currentBalance: 0, totalPurchases: 198000,
    status: 'blacklisted', createdDate: '20 Jun 2023', lastOrderDate: '10 Dec 2025', lastOrderDateIso: '2025-12-10',
    tags: ['محظور'],
  },
  {
    id: 'v013', code: 'VND-013', nameAr: 'شركة الإتحاد للأثاث',
    phone: '+966 13 456 7891', email: 'union@furniture.sa',
    city: 'الدمام', vatNumber: '301300345600015',
    paymentTerms: '30 يوم', creditLimit: 200000, currentBalance: 45000, totalPurchases: 412000,
    status: 'active', createdDate: '15 Jul 2023', lastOrderDate: '3 May 2026', lastOrderDateIso: '2026-05-03',
    tags: ['مُعتمد'],
  },
  {
    id: 'v014', code: 'VND-014', nameAr: 'مؤسسة رائد للتقنية',
    phone: '+966 11 567 8902', email: 'raed@tech.sa',
    city: 'الرياض', vatNumber: '301400456700016',
    paymentTerms: '30 يوم', creditLimit: 300000, currentBalance: 89000, totalPurchases: 723000,
    status: 'active', createdDate: '1 Aug 2023', lastOrderDate: '16 May 2026', lastOrderDateIso: '2026-05-16',
    tags: ['مُعتمد', 'تقنية'],
  },
  {
    id: 'v015', code: 'VND-015', nameAr: 'تعاونية المزارعين السعوديين',
    phone: '+966 11 678 9013', email: 'coop@farmers.sa',
    city: 'القصيم', vatNumber: '301500567800017',
    paymentTerms: '15 يوم', creditLimit: 100000, currentBalance: 12800, totalPurchases: 156000,
    status: 'active', createdDate: '10 Sep 2023', lastOrderDate: '25 Apr 2026', lastOrderDateIso: '2026-04-25',
    tags: [],
  },
];

// ── Purchase Requests ─────────────────────────────────────────────────────────

const prItems1: PurchaseLineItem[] = [
  { id: 'i1', product: 'لابتوب Dell XPS 15', qty: 5, unit: 'جهاز', unitPrice: 8500, discount: 0, total: 42500 },
  { id: 'i2', product: 'شاشة Samsung 27"', qty: 5, unit: 'شاشة', unitPrice: 1800, discount: 0, total: 9000 },
];

const prItems2: PurchaseLineItem[] = [
  { id: 'i3', product: 'أوراق A4 80g', qty: 100, unit: 'رزمة', unitPrice: 18, discount: 5, total: 1710 },
  { id: 'i4', product: 'أقلام حبر', qty: 200, unit: 'قلم', unitPrice: 3.5, discount: 0, total: 700 },
  { id: 'i5', product: 'دباسات مكتبية', qty: 20, unit: 'قطعة', unitPrice: 25, discount: 0, total: 500 },
];

export const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: 'pr001', prNumber: 'PR-2026-001', vendorId: 'v014', vendorName: 'مؤسسة رائد للتقنية',
    requestedBy: 'أحمد محمد', department: 'تقنية المعلومات',
    totalAmount: 51500, currency: 'SAR', status: 'approved',
    createdDate: '5 May 2026', createdDateIso: '2026-05-05', approvedDate: '7 May 2026',
    notes: 'طلب عاجل لتجهيز قسم التقنية الجديد', items: prItems1,
  },
  {
    id: 'pr002', prNumber: 'PR-2026-002', vendorId: 'v006', vendorName: 'مؤسسة الأمانة للتجارة',
    requestedBy: 'فاطمة علي', department: 'الإدارة',
    totalAmount: 2910, currency: 'SAR', status: 'approved',
    createdDate: '8 May 2026', createdDateIso: '2026-05-08', approvedDate: '9 May 2026',
    items: prItems2,
  },
  {
    id: 'pr003', prNumber: 'PR-2026-003', vendorId: 'v001', vendorName: 'شركة الراجحي للتوريدات',
    requestedBy: 'خالد إبراهيم', department: 'المستودعات',
    totalAmount: 125000, currency: 'SAR', status: 'draft',
    createdDate: '12 May 2026', createdDateIso: '2026-05-12',
    notes: 'مواد خام للربع الثالث',
    items: [
      { id: 'i6', product: 'ألومنيوم خام', qty: 500, unit: 'كج', unitPrice: 200, discount: 0, total: 100000 },
      { id: 'i7', product: 'نحاس خام', qty: 50, unit: 'كج', unitPrice: 500, discount: 0, total: 25000 },
    ],
  },
  {
    id: 'pr004', prNumber: 'PR-2026-004', vendorId: 'v007', vendorName: 'شركة الشرق للكيماويات',
    requestedBy: 'محمد السيد', department: 'الإنتاج',
    totalAmount: 87500, currency: 'SAR', status: 'approved',
    createdDate: '14 May 2026', createdDateIso: '2026-05-14', approvedDate: '15 May 2026',
    items: [
      { id: 'i8', product: 'مذيب صناعي A', qty: 200, unit: 'لتر', unitPrice: 250, discount: 5, total: 47500 },
      { id: 'i9', product: 'مادة معالجة B', qty: 100, unit: 'كج', unitPrice: 400, discount: 0, total: 40000 },
    ],
  },
  {
    id: 'pr005', prNumber: 'PR-2026-005', vendorId: 'v009', vendorName: 'شركة مدار للخدمات اللوجستية',
    requestedBy: 'سارة عبدالله', department: 'اللوجستيات',
    totalAmount: 34200, currency: 'SAR', status: 'draft',
    createdDate: '16 May 2026', createdDateIso: '2026-05-16',
    items: [
      { id: 'i10', product: 'خدمة شحن دولي', qty: 10, unit: 'شحنة', unitPrice: 3420, discount: 0, total: 34200 },
    ],
  },
  {
    id: 'pr006', prNumber: 'PR-2026-006', vendorId: 'v013', vendorName: 'شركة الإتحاد للأثاث',
    requestedBy: 'عمر القحطاني', department: 'الموارد البشرية',
    totalAmount: 68000, currency: 'SAR', status: 'cancelled',
    createdDate: '10 May 2026', createdDateIso: '2026-05-10',
    notes: 'تم الإلغاء لتجاوز الميزانية',
    items: [
      { id: 'i11', product: 'مكتب تنفيذي', qty: 4, unit: 'قطعة', unitPrice: 12000, discount: 0, total: 48000 },
      { id: 'i12', product: 'كرسي مكتب', qty: 20, unit: 'قطعة', unitPrice: 1000, discount: 0, total: 20000 },
    ],
  },
  {
    id: 'pr007', prNumber: 'PR-2026-007', vendorId: 'v003', vendorName: 'شركة صفوان للمواد الخام',
    requestedBy: 'نورة الشمري', department: 'الإنتاج',
    totalAmount: 198000, currency: 'SAR', status: 'approved',
    createdDate: '18 May 2026', createdDateIso: '2026-05-18', approvedDate: '19 May 2026',
    items: [
      { id: 'i13', product: 'بوليمر PVC', qty: 1000, unit: 'كج', unitPrice: 150, discount: 0, total: 150000 },
      { id: 'i14', product: 'مواد تعبئة', qty: 1200, unit: 'كرتون', unitPrice: 40, discount: 0, total: 48000 },
    ],
  },
  {
    id: 'pr008', prNumber: 'PR-2026-008', vendorId: 'v005', vendorName: 'شركة نجد للتوريدات',
    requestedBy: 'عبدالرحمن البلوي', department: 'الصيانة',
    totalAmount: 45600, currency: 'SAR', status: 'draft',
    createdDate: '20 May 2026', createdDateIso: '2026-05-20',
    items: [
      { id: 'i15', product: 'قطع غيار صناعية', qty: 30, unit: 'مجموعة', unitPrice: 1520, discount: 0, total: 45600 },
    ],
  },
];

// ── RFQs ──────────────────────────────────────────────────────────────────────

export const mockRFQs: RFQ[] = [
  {
    id: 'rfq001', rfqNumber: 'RFQ-2026-001', prNumber: 'PR-2026-001',
    vendorId: 'v014', vendorName: 'مؤسسة رائد للتقنية',
    status: 'received', totalAmount: 51500, currency: 'SAR',
    issueDate: '7 May 2026', issueDateIso: '2026-05-07', validUntil: '21 May 2026',
    items: prItems1,
  },
  {
    id: 'rfq002', rfqNumber: 'RFQ-2026-002', prNumber: 'PR-2026-004',
    vendorId: 'v007', vendorName: 'شركة الشرق للكيماويات',
    status: 'received', totalAmount: 87500, currency: 'SAR',
    issueDate: '15 May 2026', issueDateIso: '2026-05-15', validUntil: '29 May 2026',
    items: [
      { id: 'ri1', product: 'مذيب صناعي A', qty: 200, unit: 'لتر', unitPrice: 250, discount: 5, total: 47500 },
      { id: 'ri2', product: 'مادة معالجة B', qty: 100, unit: 'كج', unitPrice: 400, discount: 0, total: 40000 },
    ],
  },
  {
    id: 'rfq003', rfqNumber: 'RFQ-2026-003', prNumber: 'PR-2026-007',
    vendorId: 'v003', vendorName: 'شركة صفوان للمواد الخام',
    status: 'sent', totalAmount: 198000, currency: 'SAR',
    issueDate: '19 May 2026', issueDateIso: '2026-05-19', validUntil: '2 Jun 2026',
    items: [
      { id: 'ri3', product: 'بوليمر PVC', qty: 1000, unit: 'كج', unitPrice: 150, discount: 0, total: 150000 },
      { id: 'ri4', product: 'مواد تعبئة', qty: 1200, unit: 'كرتون', unitPrice: 40, discount: 0, total: 48000 },
    ],
  },
  {
    id: 'rfq004', rfqNumber: 'RFQ-2026-004',
    vendorId: 'v001', vendorName: 'شركة الراجحي للتوريدات',
    status: 'draft', totalAmount: 245000, currency: 'SAR',
    issueDate: '20 May 2026', issueDateIso: '2026-05-20', validUntil: '3 Jun 2026',
    items: [
      { id: 'ri5', product: 'ألواح فولاذية', qty: 200, unit: 'لوح', unitPrice: 1000, discount: 0, total: 200000 },
      { id: 'ri6', product: 'مسامير صناعية', qty: 5000, unit: 'كج', unitPrice: 9, discount: 0, total: 45000 },
    ],
  },
  {
    id: 'rfq005', rfqNumber: 'RFQ-2026-005',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    status: 'received', totalAmount: 134500, currency: 'SAR',
    issueDate: '12 May 2026', issueDateIso: '2026-05-12', validUntil: '26 May 2026',
    items: [
      { id: 'ri7', product: 'محركات كهربائية', qty: 10, unit: 'قطعة', unitPrice: 12000, discount: 5, total: 114000 },
      { id: 'ri8', product: 'لوحات تحكم', qty: 5, unit: 'قطعة', unitPrice: 4100, discount: 0, total: 20500 },
    ],
  },
  {
    id: 'rfq006', rfqNumber: 'RFQ-2026-006',
    vendorId: 'v004', vendorName: 'مجموعة الخليج التجارية',
    status: 'cancelled', totalAmount: 56000, currency: 'SAR',
    issueDate: '5 May 2026', issueDateIso: '2026-05-05', validUntil: '19 May 2026',
    notes: 'تم الإلغاء — تغيير المورد',
    items: [
      { id: 'ri9', product: 'معدات مطبخ صناعي', qty: 2, unit: 'طقم', unitPrice: 28000, discount: 0, total: 56000 },
    ],
  },
  {
    id: 'rfq007', rfqNumber: 'RFQ-2026-007',
    vendorId: 'v005', vendorName: 'شركة نجد للتوريدات',
    status: 'sent', totalAmount: 78400, currency: 'SAR',
    issueDate: '21 May 2026', issueDateIso: '2026-05-21', validUntil: '4 Jun 2026',
    items: [
      { id: 'ri10', product: 'أجهزة قياس دقيقة', qty: 8, unit: 'جهاز', unitPrice: 9800, discount: 0, total: 78400 },
    ],
  },
  {
    id: 'rfq008', rfqNumber: 'RFQ-2026-008',
    vendorId: 'v002', vendorName: 'مؤسسة العربية للأجهزة',
    status: 'received', totalAmount: 92000, currency: 'SAR',
    issueDate: '10 May 2026', issueDateIso: '2026-05-10', validUntil: '24 May 2026',
    items: [
      { id: 'ri11', product: 'كمبريسور صناعي', qty: 2, unit: 'قطعة', unitPrice: 35000, discount: 0, total: 70000 },
      { id: 'ri12', product: 'خراطيم ضغط عالي', qty: 40, unit: 'متر', unitPrice: 550, discount: 0, total: 22000 },
    ],
  },
];

// ── Purchase Orders ───────────────────────────────────────────────────────────

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po001', poNumber: 'PO-2026-001', rfqNumber: 'RFQ-2026-001',
    vendorId: 'v014', vendorName: 'مؤسسة رائد للتقنية',
    status: 'paid', totalAmount: 51500, paidAmount: 51500, currency: 'SAR',
    orderDate: '8 May 2026', orderDateIso: '2026-05-08',
    expectedDate: '15 May 2026', receivedDate: '14 May 2026',
    invoiceNumber: 'PI-2026-001', paymentDate: '20 May 2026',
    items: prItems1,
  },
  {
    id: 'po002', poNumber: 'PO-2026-002',
    vendorId: 'v001', vendorName: 'شركة الراجحي للتوريدات',
    status: 'invoiced', totalAmount: 128500, paidAmount: 0, currency: 'SAR',
    orderDate: '10 May 2026', orderDateIso: '2026-05-10',
    expectedDate: '25 May 2026', receivedDate: '24 May 2026',
    invoiceNumber: 'PI-2026-002',
    items: [
      { id: 'pi1', product: 'ألومنيوم خام', qty: 500, unit: 'كج', unitPrice: 200, discount: 0, total: 100000 },
      { id: 'pi2', product: 'نحاس خام', qty: 50, unit: 'كج', unitPrice: 500, discount: 0, total: 25000 },
      { id: 'pi3', product: 'فولاذ مقاوم للصدأ', qty: 10, unit: 'صفيحة', unitPrice: 350, discount: 0, total: 3500 },
    ],
  },
  {
    id: 'po003', poNumber: 'PO-2026-003', rfqNumber: 'RFQ-2026-002',
    vendorId: 'v007', vendorName: 'شركة الشرق للكيماويات',
    status: 'received', totalAmount: 87500, paidAmount: 0, currency: 'SAR',
    orderDate: '16 May 2026', orderDateIso: '2026-05-16',
    expectedDate: '28 May 2026', receivedDate: '25 May 2026',
    items: [
      { id: 'pi4', product: 'مذيب صناعي A', qty: 200, unit: 'لتر', unitPrice: 250, discount: 5, total: 47500 },
      { id: 'pi5', product: 'مادة معالجة B', qty: 100, unit: 'كج', unitPrice: 400, discount: 0, total: 40000 },
    ],
  },
  {
    id: 'po004', poNumber: 'PO-2026-004',
    vendorId: 'v003', vendorName: 'شركة صفوان للمواد الخام',
    status: 'approved', totalAmount: 198000, paidAmount: 0, currency: 'SAR',
    orderDate: '20 May 2026', orderDateIso: '2026-05-20',
    expectedDate: '5 Jun 2026',
    items: [
      { id: 'pi6', product: 'بوليمر PVC', qty: 1000, unit: 'كج', unitPrice: 150, discount: 0, total: 150000 },
      { id: 'pi7', product: 'مواد تعبئة', qty: 1200, unit: 'كرتون', unitPrice: 40, discount: 0, total: 48000 },
    ],
  },
  {
    id: 'po005', poNumber: 'PO-2026-005', rfqNumber: 'RFQ-2026-005',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    status: 'paid', totalAmount: 134500, paidAmount: 134500, currency: 'SAR',
    orderDate: '14 May 2026', orderDateIso: '2026-05-14',
    expectedDate: '22 May 2026', receivedDate: '21 May 2026',
    invoiceNumber: 'PI-2026-003', paymentDate: '25 May 2026',
    items: [
      { id: 'pi8', product: 'محركات كهربائية', qty: 10, unit: 'قطعة', unitPrice: 12000, discount: 5, total: 114000 },
      { id: 'pi9', product: 'لوحات تحكم', qty: 5, unit: 'قطعة', unitPrice: 4100, discount: 0, total: 20500 },
    ],
  },
  {
    id: 'po006', poNumber: 'PO-2026-006',
    vendorId: 'v005', vendorName: 'شركة نجد للتوريدات',
    status: 'approved', totalAmount: 112000, paidAmount: 0, currency: 'SAR',
    orderDate: '18 May 2026', orderDateIso: '2026-05-18',
    expectedDate: '1 Jun 2026',
    items: [
      { id: 'pi10', product: 'مواد تعبئة وتغليف', qty: 5000, unit: 'وحدة', unitPrice: 22.4, discount: 0, total: 112000 },
    ],
  },
  {
    id: 'po007', poNumber: 'PO-2026-007',
    vendorId: 'v004', vendorName: 'مجموعة الخليج التجارية',
    status: 'draft', totalAmount: 45800, paidAmount: 0, currency: 'SAR',
    orderDate: '22 May 2026', orderDateIso: '2026-05-22',
    expectedDate: '8 Jun 2026',
    items: [
      { id: 'pi11', product: 'أدوات مكتبية متنوعة', qty: 50, unit: 'طرد', unitPrice: 916, discount: 0, total: 45800 },
    ],
  },
  {
    id: 'po008', poNumber: 'PO-2026-008', rfqNumber: 'RFQ-2026-008',
    vendorId: 'v002', vendorName: 'مؤسسة العربية للأجهزة',
    status: 'invoiced', totalAmount: 92000, paidAmount: 0, currency: 'SAR',
    orderDate: '12 May 2026', orderDateIso: '2026-05-12',
    expectedDate: '20 May 2026', receivedDate: '19 May 2026',
    invoiceNumber: 'PI-2026-004',
    items: [
      { id: 'pi12', product: 'كمبريسور صناعي', qty: 2, unit: 'قطعة', unitPrice: 35000, discount: 0, total: 70000 },
      { id: 'pi13', product: 'خراطيم ضغط عالي', qty: 40, unit: 'متر', unitPrice: 550, discount: 0, total: 22000 },
    ],
  },
  {
    id: 'po009', poNumber: 'PO-2026-009',
    vendorId: 'v009', vendorName: 'شركة مدار للخدمات اللوجستية',
    status: 'paid', totalAmount: 78400, paidAmount: 78400, currency: 'SAR',
    orderDate: '5 May 2026', orderDateIso: '2026-05-05',
    expectedDate: '12 May 2026', receivedDate: '11 May 2026',
    invoiceNumber: 'PI-2026-005', paymentDate: '15 May 2026',
    items: [
      { id: 'pi14', product: 'خدمة شحن دولي', qty: 10, unit: 'شحنة', unitPrice: 7840, discount: 0, total: 78400 },
    ],
  },
  {
    id: 'po010', poNumber: 'PO-2026-010',
    vendorId: 'v010', vendorName: 'مؤسسة الحضارة للإمداد',
    status: 'cancelled', totalAmount: 34200, paidAmount: 0, currency: 'SAR',
    orderDate: '6 May 2026', orderDateIso: '2026-05-06',
    expectedDate: '20 May 2026',
    notes: 'تم الإلغاء — تغيير في متطلبات المشروع',
    items: [
      { id: 'pi15', product: 'مستلزمات طبية', qty: 100, unit: 'صندوق', unitPrice: 342, discount: 0, total: 34200 },
    ],
  },
  {
    id: 'po011', poNumber: 'PO-2026-011',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    status: 'received', totalAmount: 156000, paidAmount: 0, currency: 'SAR',
    orderDate: '19 May 2026', orderDateIso: '2026-05-19',
    expectedDate: '30 May 2026', receivedDate: '23 May 2026',
    items: [
      { id: 'pi16', product: 'خطوط إنتاج مخصصة', qty: 1, unit: 'طقم', unitPrice: 156000, discount: 0, total: 156000 },
    ],
  },
  {
    id: 'po012', poNumber: 'PO-2026-012',
    vendorId: 'v015', vendorName: 'تعاونية المزارعين السعوديين',
    status: 'paid', totalAmount: 12800, paidAmount: 12800, currency: 'SAR',
    orderDate: '1 May 2026', orderDateIso: '2026-05-01',
    expectedDate: '8 May 2026', receivedDate: '7 May 2026',
    invoiceNumber: 'PI-2026-006', paymentDate: '10 May 2026',
    items: [
      { id: 'pi17', product: 'منتجات زراعية متنوعة', qty: 200, unit: 'صندوق', unitPrice: 64, discount: 0, total: 12800 },
    ],
  },
];

// ── Purchase Invoices ─────────────────────────────────────────────────────────

export const mockPurchaseInvoices: PurchaseInvoice[] = [
  {
    id: 'pi001', invoiceNumber: 'PI-2026-001', poNumber: 'PO-2026-001',
    vendorId: 'v014', vendorName: 'مؤسسة رائد للتقنية',
    vendorInvoiceRef: 'INV-RT-4521',
    status: 'paid', totalAmount: 51500, paidAmount: 51500, currency: 'SAR',
    invoiceDate: '14 May 2026', invoiceDateIso: '2026-05-14',
    dueDate: '13 Jun 2026', dueDateIso: '2026-06-13', paymentDate: '20 May 2026',
  },
  {
    id: 'pi002', invoiceNumber: 'PI-2026-002', poNumber: 'PO-2026-002',
    vendorId: 'v001', vendorName: 'شركة الراجحي للتوريدات',
    vendorInvoiceRef: 'RAJ-INV-8834',
    status: 'approved', totalAmount: 128500, paidAmount: 0, currency: 'SAR',
    invoiceDate: '24 May 2026', invoiceDateIso: '2026-05-24',
    dueDate: '23 Jun 2026', dueDateIso: '2026-06-23',
    notes: 'مستحق خلال 30 يوم',
  },
  {
    id: 'pi003', invoiceNumber: 'PI-2026-003', poNumber: 'PO-2026-005',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    vendorInvoiceRef: 'FAR-8820',
    status: 'paid', totalAmount: 134500, paidAmount: 134500, currency: 'SAR',
    invoiceDate: '21 May 2026', invoiceDateIso: '2026-05-21',
    dueDate: '20 Jun 2026', dueDateIso: '2026-06-20', paymentDate: '25 May 2026',
  },
  {
    id: 'pi004', invoiceNumber: 'PI-2026-004', poNumber: 'PO-2026-008',
    vendorId: 'v002', vendorName: 'مؤسسة العربية للأجهزة',
    vendorInvoiceRef: 'AR-INV-2210',
    status: 'approved', totalAmount: 92000, paidAmount: 0, currency: 'SAR',
    invoiceDate: '19 May 2026', invoiceDateIso: '2026-05-19',
    dueDate: '3 Jul 2026', dueDateIso: '2026-07-03',
    notes: 'استحقاق 45 يوم',
  },
  {
    id: 'pi005', invoiceNumber: 'PI-2026-005', poNumber: 'PO-2026-009',
    vendorId: 'v009', vendorName: 'شركة مدار للخدمات اللوجستية',
    vendorInvoiceRef: 'MDR-1105',
    status: 'paid', totalAmount: 78400, paidAmount: 78400, currency: 'SAR',
    invoiceDate: '11 May 2026', invoiceDateIso: '2026-05-11',
    dueDate: '10 Jun 2026', dueDateIso: '2026-06-10', paymentDate: '15 May 2026',
  },
  {
    id: 'pi006', invoiceNumber: 'PI-2026-006', poNumber: 'PO-2026-012',
    vendorId: 'v015', vendorName: 'تعاونية المزارعين السعوديين',
    vendorInvoiceRef: 'COOP-990',
    status: 'paid', totalAmount: 12800, paidAmount: 12800, currency: 'SAR',
    invoiceDate: '7 May 2026', invoiceDateIso: '2026-05-07',
    dueDate: '22 May 2026', dueDateIso: '2026-05-22', paymentDate: '10 May 2026',
  },
  {
    id: 'pi007', invoiceNumber: 'PI-2026-007',
    vendorId: 'v003', vendorName: 'شركة صفوان للمواد الخام',
    vendorInvoiceRef: 'SFW-3301',
    status: 'approved', totalAmount: 234000, paidAmount: 0, currency: 'SAR',
    invoiceDate: '1 May 2026', invoiceDateIso: '2026-05-01',
    dueDate: '30 Jun 2026', dueDateIso: '2026-06-30',
    notes: 'استحقاق 60 يوم',
  },
  {
    id: 'pi008', invoiceNumber: 'PI-2026-008',
    vendorId: 'v007', vendorName: 'شركة الشرق للكيماويات',
    vendorInvoiceRef: 'ECH-7714',
    status: 'draft', totalAmount: 56000, paidAmount: 0, currency: 'SAR',
    invoiceDate: '22 May 2026', invoiceDateIso: '2026-05-22',
    dueDate: '21 Jul 2026', dueDateIso: '2026-07-21',
  },
  {
    id: 'pi009', invoiceNumber: 'PI-2026-009',
    vendorId: 'v005', vendorName: 'شركة نجد للتوريدات',
    vendorInvoiceRef: 'NJD-5542',
    status: 'cancelled', totalAmount: 22500, paidAmount: 0, currency: 'SAR',
    invoiceDate: '3 May 2026', invoiceDateIso: '2026-05-03',
    dueDate: '2 Jun 2026', dueDateIso: '2026-06-02',
    notes: 'تم الإلغاء — خطأ في البيانات',
  },
  {
    id: 'pi010', invoiceNumber: 'PI-2026-010',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    vendorInvoiceRef: 'FAR-9010',
    status: 'approved', totalAmount: 156000, paidAmount: 0, currency: 'SAR',
    invoiceDate: '23 May 2026', invoiceDateIso: '2026-05-23',
    dueDate: '22 Jul 2026', dueDateIso: '2026-07-22',
    notes: 'استحقاق 60 يوم',
  },
];

// ── Debit Notes ───────────────────────────────────────────────────────────────

export const mockDebitNotes: DebitNote[] = [
  {
    id: 'dn001', dnNumber: 'DN-2026-001',
    vendorId: 'v001', vendorName: 'شركة الراجحي للتوريدات',
    status: 'approved', totalAmount: 8500, currency: 'SAR',
    issueDate: '18 May 2026', issueDateIso: '2026-05-18',
    reason: 'خصم مخالفة شروط التسليم',
    notes: 'تأخر الشحن 5 أيام عن الموعد المحدد',
  },
  {
    id: 'dn002', dnNumber: 'DN-2026-002',
    vendorId: 'v007', vendorName: 'شركة الشرق للكيماويات',
    status: 'paid', totalAmount: 12000, currency: 'SAR',
    issueDate: '10 May 2026', issueDateIso: '2026-05-10',
    reason: 'منتجات غير مطابقة للمواصفات',
    notes: 'تم الخصم من الفاتورة PI-2026-004',
  },
  {
    id: 'dn003', dnNumber: 'DN-2026-003',
    vendorId: 'v003', vendorName: 'شركة صفوان للمواد الخام',
    status: 'draft', totalAmount: 5250, currency: 'SAR',
    issueDate: '22 May 2026', issueDateIso: '2026-05-22',
    reason: 'نقص في الكمية المُستلمة',
  },
  {
    id: 'dn004', dnNumber: 'DN-2026-004',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    status: 'approved', totalAmount: 18750, currency: 'SAR',
    issueDate: '15 May 2026', issueDateIso: '2026-05-15',
    reason: 'خصم جزافي متفق عليه',
    notes: 'وفقاً لملحق العقد رقم 3',
  },
  {
    id: 'dn005', dnNumber: 'DN-2026-005',
    vendorId: 'v002', vendorName: 'مؤسسة العربية للأجهزة',
    status: 'cancelled', totalAmount: 4500, currency: 'SAR',
    issueDate: '5 May 2026', issueDateIso: '2026-05-05',
    reason: 'خطأ في الفوترة',
    notes: 'تم الإلغاء — تسوية مباشرة مع المورد',
  },
  {
    id: 'dn006', dnNumber: 'DN-2026-006',
    vendorId: 'v009', vendorName: 'شركة مدار للخدمات اللوجستية',
    status: 'paid', totalAmount: 7800, currency: 'SAR',
    issueDate: '8 May 2026', issueDateIso: '2026-05-08',
    reason: 'تلف البضاعة أثناء الشحن',
    notes: 'تم خصم قيمة التلف وفق تقرير الفحص',
  },
];

// ── Purchase Returns ──────────────────────────────────────────────────────────

export const mockPurchaseReturns: PurchaseReturn[] = [
  {
    id: 'ret001', returnNumber: 'RET-2026-001', poNumber: 'PO-2026-002',
    vendorId: 'v001', vendorName: 'شركة الراجحي للتوريدات',
    status: 'approved', totalAmount: 12500, currency: 'SAR',
    returnDate: '20 May 2026', returnDateIso: '2026-05-20',
    reason: 'مواد غير مطابقة للمواصفات',
    items: [
      { id: 'ri1', product: 'فولاذ مقاوم للصدأ', qty: 10, unit: 'صفيحة', unitPrice: 1250, discount: 0, total: 12500 },
    ],
  },
  {
    id: 'ret002', returnNumber: 'RET-2026-002', poNumber: 'PO-2026-005',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    status: 'received', totalAmount: 24000, currency: 'SAR',
    returnDate: '24 May 2026', returnDateIso: '2026-05-24',
    reason: 'أجهزة معيبة',
    notes: 'تم إشعار المورد وتأكيد الاستلام',
    items: [
      { id: 'ri2', product: 'محركات كهربائية معيبة', qty: 2, unit: 'قطعة', unitPrice: 12000, discount: 0, total: 24000 },
    ],
  },
  {
    id: 'ret003', returnNumber: 'RET-2026-003',
    vendorId: 'v007', vendorName: 'شركة الشرق للكيماويات',
    status: 'draft', totalAmount: 7500, currency: 'SAR',
    returnDate: '25 May 2026', returnDateIso: '2026-05-25',
    reason: 'مواد منتهية الصلاحية',
    items: [
      { id: 'ri3', product: 'مذيب صناعي منتهي الصلاحية', qty: 30, unit: 'لتر', unitPrice: 250, discount: 0, total: 7500 },
    ],
  },
  {
    id: 'ret004', returnNumber: 'RET-2026-004', poNumber: 'PO-2026-012',
    vendorId: 'v015', vendorName: 'تعاونية المزارعين السعوديين',
    status: 'received', totalAmount: 1920, currency: 'SAR',
    returnDate: '9 May 2026', returnDateIso: '2026-05-09',
    reason: 'منتجات تالفة عند الاستلام',
    items: [
      { id: 'ri4', product: 'منتجات زراعية تالفة', qty: 30, unit: 'صندوق', unitPrice: 64, discount: 0, total: 1920 },
    ],
  },
  {
    id: 'ret005', returnNumber: 'RET-2026-005', poNumber: 'PO-2026-009',
    vendorId: 'v009', vendorName: 'شركة مدار للخدمات اللوجستية',
    status: 'cancelled', totalAmount: 15680, currency: 'SAR',
    returnDate: '13 May 2026', returnDateIso: '2026-05-13',
    reason: 'طلب مكرر',
    notes: 'تم الإلغاء — تسوية بالدفع',
    items: [
      { id: 'ri5', product: 'خدمة شحن', qty: 2, unit: 'شحنة', unitPrice: 7840, discount: 0, total: 15680 },
    ],
  },
];

// ── Vendor Payments ───────────────────────────────────────────────────────────

export const mockVendorPayments: VendorPayment[] = [
  {
    id: 'vp001', paymentNumber: 'VP-2026-001',
    vendorId: 'v014', vendorName: 'مؤسسة رائد للتقنية',
    status: 'paid', amount: 51500, currency: 'SAR',
    paymentDate: '20 May 2026', paymentDateIso: '2026-05-20',
    paymentMethod: 'تحويل بنكي', reference: 'TRF-8821144',
    invoiceNumber: 'PI-2026-001',
  },
  {
    id: 'vp002', paymentNumber: 'VP-2026-002',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    status: 'paid', amount: 134500, currency: 'SAR',
    paymentDate: '25 May 2026', paymentDateIso: '2026-05-25',
    paymentMethod: 'تحويل بنكي', reference: 'TRF-9920055',
    invoiceNumber: 'PI-2026-003',
  },
  {
    id: 'vp003', paymentNumber: 'VP-2026-003',
    vendorId: 'v009', vendorName: 'شركة مدار للخدمات اللوجستية',
    status: 'paid', amount: 78400, currency: 'SAR',
    paymentDate: '15 May 2026', paymentDateIso: '2026-05-15',
    paymentMethod: 'شيك', reference: 'CHQ-00442',
    invoiceNumber: 'PI-2026-005',
  },
  {
    id: 'vp004', paymentNumber: 'VP-2026-004',
    vendorId: 'v015', vendorName: 'تعاونية المزارعين السعوديين',
    status: 'paid', amount: 12800, currency: 'SAR',
    paymentDate: '10 May 2026', paymentDateIso: '2026-05-10',
    paymentMethod: 'نقدي', reference: 'CASH-331',
    invoiceNumber: 'PI-2026-006',
  },
  {
    id: 'vp005', paymentNumber: 'VP-2026-005',
    vendorId: 'v001', vendorName: 'شركة الراجحي للتوريدات',
    status: 'approved', amount: 128500, currency: 'SAR',
    paymentDate: '25 May 2026', paymentDateIso: '2026-05-25',
    paymentMethod: 'تحويل بنكي', reference: 'TRF-1003344',
    invoiceNumber: 'PI-2026-002',
    notes: 'في انتظار تنفيذ التحويل',
  },
  {
    id: 'vp006', paymentNumber: 'VP-2026-006',
    vendorId: 'v003', vendorName: 'شركة صفوان للمواد الخام',
    status: 'draft', amount: 100000, currency: 'SAR',
    paymentDate: '30 May 2026', paymentDateIso: '2026-05-30',
    paymentMethod: 'تحويل بنكي', reference: '',
    invoiceNumber: 'PI-2026-007',
    notes: 'دفعة جزئية',
  },
  {
    id: 'vp007', paymentNumber: 'VP-2026-007',
    vendorId: 'v007', vendorName: 'شركة الشرق للكيماويات',
    status: 'approved', amount: 56000, currency: 'SAR',
    paymentDate: '28 May 2026', paymentDateIso: '2026-05-28',
    paymentMethod: 'تحويل بنكي', reference: 'TRF-2004411',
    invoiceNumber: 'PI-2026-008',
  },
  {
    id: 'vp008', paymentNumber: 'VP-2026-008',
    vendorId: 'v011', vendorName: 'شركة فارس للصناعات',
    status: 'draft', amount: 156000, currency: 'SAR',
    paymentDate: '30 May 2026', paymentDateIso: '2026-05-30',
    paymentMethod: 'تحويل بنكي', reference: '',
    invoiceNumber: 'PI-2026-010',
  },
  {
    id: 'vp009', paymentNumber: 'VP-2026-009',
    vendorId: 'v002', vendorName: 'مؤسسة العربية للأجهزة',
    status: 'approved', amount: 92000, currency: 'SAR',
    paymentDate: '27 May 2026', paymentDateIso: '2026-05-27',
    paymentMethod: 'تحويل بنكي', reference: 'TRF-3005522',
    invoiceNumber: 'PI-2026-004',
  },
  {
    id: 'vp010', paymentNumber: 'VP-2026-010',
    vendorId: 'v007', vendorName: 'شركة الشرق للكيماويات',
    status: 'paid', amount: 12000, currency: 'SAR',
    paymentDate: '12 May 2026', paymentDateIso: '2026-05-12',
    paymentMethod: 'تحويل بنكي', reference: 'TRF-1998800',
    notes: 'تسوية إشعار مدين DN-2026-002',
  },
];

// ── Vendor Statements (for vendor v001) ───────────────────────────────────────

export function getVendorStatement(vendorId: string): VendorStatement[] {
  const allTransactions: VendorStatement[] = [];

  // Opening balance
  allTransactions.push({
    id: 'ob', date: '1 Jan 2026', dateIso: '2026-01-01',
    docNumber: 'رصيد افتتاحي', type: 'رصيد افتتاحي',
    debit: 0, credit: 0, balance: 0,
  });

  // Add POs (invoices) for this vendor
  mockPurchaseInvoices
    .filter(pi => pi.vendorId === vendorId && pi.status !== 'cancelled')
    .forEach(pi => {
      allTransactions.push({
        id: `pi-${pi.id}`, date: pi.invoiceDate, dateIso: pi.invoiceDateIso,
        docNumber: pi.invoiceNumber, type: 'فاتورة',
        debit: pi.totalAmount, credit: 0, balance: 0,
      });
    });

  // Add payments for this vendor
  mockVendorPayments
    .filter(vp => vp.vendorId === vendorId && vp.status !== 'cancelled')
    .forEach(vp => {
      allTransactions.push({
        id: `vp-${vp.id}`, date: vp.paymentDate, dateIso: vp.paymentDateIso,
        docNumber: vp.paymentNumber, type: 'دفعة',
        debit: 0, credit: vp.amount, balance: 0,
      });
    });

  // Add debit notes for this vendor
  mockDebitNotes
    .filter(dn => dn.vendorId === vendorId && dn.status !== 'cancelled')
    .forEach(dn => {
      allTransactions.push({
        id: `dn-${dn.id}`, date: dn.issueDate, dateIso: dn.issueDateIso,
        docNumber: dn.dnNumber, type: 'إشعار مدين',
        debit: 0, credit: dn.totalAmount, balance: 0,
      });
    });

  // Add returns for this vendor
  mockPurchaseReturns
    .filter(r => r.vendorId === vendorId && r.status !== 'cancelled')
    .forEach(r => {
      allTransactions.push({
        id: `ret-${r.id}`, date: r.returnDate, dateIso: r.returnDateIso,
        docNumber: r.returnNumber, type: 'مرتجع',
        debit: 0, credit: r.totalAmount, balance: 0,
      });
    });

  // Sort by date
  allTransactions.sort((a, b) => a.dateIso.localeCompare(b.dateIso));

  // Compute running balance (debit = we owe vendor, credit = reduces what we owe)
  let running = 0;
  allTransactions.forEach(t => {
    running += t.debit - t.credit;
    t.balance = running;
  });

  return allTransactions;
}

// ── Dashboard KPIs ────────────────────────────────────────────────────────────

export const purchaseKpis = [
  {
    id: 'total-pos',
    labelAr: 'إجمالي أوامر الشراء',
    value: String(mockPurchaseOrders.filter(p => p.status !== 'cancelled').length),
    trend: '+3',
    trendDirection: 'up' as const,
    trendLabel: 'هذا الشهر',
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
  },
  {
    id: 'pending-invoices',
    labelAr: 'فواتير معلقة',
    value: String(mockPurchaseInvoices.filter(p => p.status === 'approved').length),
    trend: '+2',
    trendDirection: 'down' as const,
    trendLabel: 'مقارنة بالأسبوع الماضي',
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
  },
  {
    id: 'payments-due',
    labelAr: 'مدفوعات مستحقة',
    value: '535,500 ر.س',
    trend: '-8.4%',
    trendDirection: 'up' as const,
    trendLabel: 'مقارنة بالشهر الماضي',
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
  },
  {
    id: 'monthly-spend',
    labelAr: 'إنفاق الشهر',
    value: '1,024,900 ر.س',
    trend: '+14.2%',
    trendDirection: 'down' as const,
    trendLabel: 'مقارنة بالشهر الماضي',
    iconColor: '#8b5cf6',
    iconBg: '#f5f3ff',
  },
];

// ── Payment method labels ──────────────────────────────────────────────────────

export const PAYMENT_METHODS = ['تحويل بنكي', 'شيك', 'نقدي', 'بطاقة ائتمانية'];

// Helper: use fDate
void fDate;
