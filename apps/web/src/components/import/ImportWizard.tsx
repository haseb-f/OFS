'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ImportSource, ImportTarget } from '@/lib/mock-data';
import { IMPORT_TARGET_LABELS } from '@/lib/mock-data';

// ── Static data ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, labelAr: 'رفع الملف' },
  { id: 2, labelAr: 'ربط الحقول' },
  { id: 3, labelAr: 'التحقق' },
  { id: 4, labelAr: 'المعاينة' },
  { id: 5, labelAr: 'الموافقة' },
  { id: 6, labelAr: 'النتيجة' },
];

const SOURCE_COLS: Record<string, string[]> = {
  customers: ['Name', 'Phone Number', 'Email', 'Country', 'City', 'Address', 'VAT Number', 'Credit Limit', 'Notes'],
  orders:    ['Order Date', 'Customer Name', 'Product', 'Quantity', 'Unit Price', 'Paid Amount', 'Currency', 'Payment Method', 'Notes'],
  leads:     ['Customer Name', 'Mobile', 'Product / Service', 'Order Date', 'Budget', 'Country', 'City', 'Notes'],
  products:  ['Product Name', 'SKU', 'Unit Price', 'Category', 'Stock', 'Description'],
};

const AUTO_MAP: Record<string, Record<string, string>> = {
  customers: { 'Name': 'nameAr', 'Phone Number': 'phone', 'Email': 'email', 'Country': 'country', 'City': 'city', 'Address': 'address', 'VAT Number': 'taxNumber', 'Credit Limit': 'creditLimit' },
  orders:    { 'Order Date': 'orderDate', 'Customer Name': 'customerName', 'Product': 'product', 'Quantity': 'quantity', 'Unit Price': 'unitPrice', 'Paid Amount': 'paidAmount', 'Currency': 'currency', 'Payment Method': 'paymentMethod' },
  leads:     { 'Customer Name': 'customerName', 'Mobile': 'phone', 'Product / Service': 'product', 'Order Date': 'orderDate', 'Budget': 'paidAmount', 'Country': 'country', 'City': 'city' },
  products:  { 'Product Name': 'nameAr', 'SKU': 'sku', 'Unit Price': 'price', 'Category': 'category', 'Stock': 'stock' },
};

const TARGET_FIELDS: Record<string, { key: string; labelAr: string; required: boolean }[]> = {
  customers: [
    { key: 'nameAr',      labelAr: 'الاسم',                   required: true  },
    { key: 'phone',       labelAr: 'الهاتف',                  required: true  },
    { key: 'email',       labelAr: 'البريد الإلكتروني',        required: false },
    { key: 'country',     labelAr: 'الدولة',                  required: false },
    { key: 'city',        labelAr: 'المدينة',                  required: false },
    { key: 'address',     labelAr: 'العنوان',                  required: false },
    { key: 'taxNumber',   labelAr: 'الرقم الضريبي',            required: false },
    { key: 'creditLimit', labelAr: 'حد الائتمان',             required: false },
  ],
  orders: [
    { key: 'orderDate',    labelAr: 'تاريخ الطلب (DD MMM YYYY)', required: true  },
    { key: 'customerName', labelAr: 'اسم العميل',               required: true  },
    { key: 'product',      labelAr: 'المنتج',                   required: true  },
    { key: 'quantity',     labelAr: 'الكمية',                   required: true  },
    { key: 'unitPrice',    labelAr: 'سعر الوحدة',               required: false },
    { key: 'paidAmount',   labelAr: 'المبلغ المدفوع',            required: false },
    { key: 'currency',     labelAr: 'العملة',                   required: false },
    { key: 'paymentMethod',labelAr: 'طريقة الدفع',              required: false },
  ],
  leads: [
    { key: 'customerName', labelAr: 'اسم العميل',              required: true  },
    { key: 'phone',        labelAr: 'الهاتف',                  required: true  },
    { key: 'product',      labelAr: 'المنتج / الخدمة',          required: false },
    { key: 'orderDate',    labelAr: 'التاريخ (DD MMM YYYY)',   required: false },
    { key: 'paidAmount',   labelAr: 'الميزانية',               required: false },
    { key: 'country',      labelAr: 'الدولة',                  required: false },
    { key: 'city',         labelAr: 'المدينة',                  required: false },
  ],
  products: [
    { key: 'nameAr',   labelAr: 'اسم المنتج',    required: true  },
    { key: 'sku',      labelAr: 'رمز المنتج',    required: true  },
    { key: 'price',    labelAr: 'السعر',          required: true  },
    { key: 'category', labelAr: 'الفئة',          required: false },
    { key: 'stock',    labelAr: 'المخزون',        required: false },
  ],
};

const MOCK_ISSUES: Record<string, { row: number; field: string; fieldAr: string; value: string; type: 'error' | 'warning'; messageAr: string; suggestedFix?: string }[]> = {
  customers: [
    { row: 3,  field: 'email',       fieldAr: 'البريد الإلكتروني', value: 'ahmed.gmail.com', type: 'error',   messageAr: 'صيغة البريد الإلكتروني غير صحيحة',              suggestedFix: 'ahmed@gmail.com' },
    { row: 7,  field: 'phone',       fieldAr: 'الهاتف',            value: '0501',            type: 'error',   messageAr: 'رقم الهاتف قصير جداً — يجب 10 أرقام على الأقل' },
    { row: 12, field: 'creditLimit', fieldAr: 'حد الائتمان',       value: '-500',            type: 'error',   messageAr: 'حد الائتمان لا يمكن أن يكون سالباً',            suggestedFix: '500' },
    { row: 5,  field: 'email',       fieldAr: 'البريد الإلكتروني', value: '',                type: 'warning', messageAr: 'البريد الإلكتروني فارغ (حقل اختياري)' },
    { row: 9,  field: 'email',       fieldAr: 'البريد الإلكتروني', value: '',                type: 'warning', messageAr: 'البريد الإلكتروني فارغ (حقل اختياري)' },
    { row: 15, field: 'city',        fieldAr: 'المدينة',           value: 'riyadh',          type: 'warning', messageAr: 'يُفضّل الإدخال بالعربية',                        suggestedFix: 'الرياض' },
  ],
  orders: [
    { row: 5,  field: 'orderDate',  fieldAr: 'تاريخ الطلب', value: '2024-01-15',  type: 'error',   messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '15 يناير 2024' },
    { row: 10, field: 'quantity',   fieldAr: 'الكمية',       value: '-3',          type: 'error',   messageAr: 'الكمية لا يمكن أن تكون سالبة',                          suggestedFix: '3' },
    { row: 22, field: 'orderDate',  fieldAr: 'تاريخ الطلب', value: '01/05/2024',  type: 'error',   messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '01 مايو 2024' },
    { row: 8,  field: 'currency',   fieldAr: 'العملة',       value: 'QR',          type: 'warning', messageAr: 'رمز عملة غير معروف — سيُستخدم SAR افتراضياً',           suggestedFix: 'QAR' },
    { row: 14, field: 'paidAmount', fieldAr: 'المبلغ المدفوع', value: '',          type: 'warning', messageAr: 'المبلغ المدفوع فارغ — سيُعامل كـ 0' },
  ],
  leads: [
    { row: 2,  field: 'phone',        fieldAr: 'الهاتف',     value: '123',        type: 'error',   messageAr: 'رقم الهاتف غير صحيح' },
    { row: 6,  field: 'customerName', fieldAr: 'اسم العميل', value: '',           type: 'error',   messageAr: 'اسم العميل مطلوب ولا يمكن أن يكون فارغاً' },
    { row: 11, field: 'orderDate',    fieldAr: 'التاريخ',    value: '2024/03/10', type: 'error',   messageAr: 'تنسيق التاريخ غير صحيح — الصيغة المقبولة: DD MMM YYYY', suggestedFix: '10 مارس 2024' },
    { row: 4,  field: 'city',         fieldAr: 'المدينة',    value: '',           type: 'warning', messageAr: 'المدينة فارغة (حقل اختياري)' },
    { row: 8,  field: 'city',         fieldAr: 'المدينة',    value: '',           type: 'warning', messageAr: 'المدينة فارغة (حقل اختياري)' },
  ],
  products: [
    { row: 3,  field: 'price', fieldAr: 'السعر',     value: 'N/A', type: 'error',   messageAr: 'السعر يجب أن يكون رقماً',     suggestedFix: '0' },
    { row: 7,  field: 'stock', fieldAr: 'المخزون',   value: '-10', type: 'warning', messageAr: 'قيمة المخزون سالبة — يرجى المراجعة' },
    { row: 12, field: 'sku',   fieldAr: 'رمز المنتج', value: '',   type: 'error',   messageAr: 'رمز المنتج مطلوب ولا يمكن أن يكون فارغاً' },
  ],
};

const MOCK_PREVIEW: Record<string, { headers: string[]; rows: { cells: string[]; rowStatus: 'ok' | 'error' | 'warning' }[] }> = {
  customers: {
    headers: ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'المدينة'],
    rows: [
      { cells: ['مجموعة الأفق للتجارة', '+966 11 234 5678', 'info@ufq.com', 'الرياض'],        rowStatus: 'ok' },
      { cells: ['سعيد الزهراني',         '+966 55 123 4567', 'saeed@mail.com', 'جدة'],          rowStatus: 'ok' },
      { cells: ['أحمد التقنية',          '+966 11 999 0001', 'ahmed.gmail.com', 'الرياض'],      rowStatus: 'error' },
      { cells: ['شركة النور',            '+966 13 456 7890', 'info@alnoor.sa', 'الدمام'],       rowStatus: 'ok' },
      { cells: ['نورة الراشد',           '+966 50 234 5678', '', 'الرياض'],                     rowStatus: 'warning' },
      { cells: ['فيصل القحطاني',         '+966 50 789 0123', 'faisal@mail.com', 'الرياض'],     rowStatus: 'ok' },
      { cells: ['مؤسسة العمران',         '+966 12 345 7890', 'info@omran.sa', 'مكة المكرمة'], rowStatus: 'ok' },
      { cells: ['الوادي للتجارة',        '0501', 'wadi@mail.com', 'الطائف'],                   rowStatus: 'error' },
    ],
  },
  orders: {
    headers: ['تاريخ الطلب', 'العميل', 'المنتج', 'الكمية', 'المبلغ'],
    rows: [
      { cells: ['05 يناير 2026',  'مجموعة الأفق',   'طقم مكاتب',    '10',  '25,000 ر.س'],  rowStatus: 'ok' },
      { cells: ['12 يناير 2026',  'سعيد الزهراني',  'حاسوب محمول',  '5',   '16,000 ر.س'],  rowStatus: 'ok' },
      { cells: ['2024-01-15',     'شركة النور',      'طابعات',       '3',   '9,000 ر.س'],   rowStatus: 'error' },
      { cells: ['20 يناير 2026',  'الوادي للتجارة', 'أثاث مكتبي',   '2',   '15,000 ر.س'],  rowStatus: 'ok' },
      { cells: ['25 يناير 2026',  'مؤسسة العمران',  'معدات حفر',    '-3',  '12,000 ر.س'],  rowStatus: 'error' },
      { cells: ['01/05/2024',     'فيصل القحطاني',  'كاميرات IP',   '1',   '28,000 ر.س'],  rowStatus: 'error' },
      { cells: ['05 فبراير 2026', 'شركة الصفوة',    'مواد بناء',    '100', '120,000 ر.س'], rowStatus: 'ok' },
      { cells: ['10 فبراير 2026', 'شركة ديناميك',   'معدات شبكات',  '20',  '17,000 ر.س'],  rowStatus: 'ok' },
    ],
  },
  leads: {
    headers: ['اسم العميل', 'الهاتف', 'المنتج', 'التاريخ', 'الميزانية'],
    rows: [
      { cells: ['مجموعة المواد',   '+966 11 987 6543', 'مواد بناء',   '05 يناير 2026', '50,000'], rowStatus: 'ok' },
      { cells: ['—',               '123',               'أجهزة',        '10 يناير 2026', '8,000'],  rowStatus: 'error' },
      { cells: ['شركة الوادي',     '+966 55 987 1234', 'أثاث',        '15 يناير 2026', '15,000'], rowStatus: 'ok' },
      { cells: ['نورة الراشد',     '+966 50 234 5678', 'إلكترونيات',  '2024/03/10',    '12,500'], rowStatus: 'error' },
      { cells: ['فيصل القحطاني',   '+966 50 789 0123', 'كاميرات',     '20 يناير 2026', '28,000'], rowStatus: 'ok' },
    ],
  },
  products: {
    headers: ['اسم المنتج', 'رمز المنتج', 'السعر', 'الفئة', 'المخزون'],
    rows: [
      { cells: ['مكتب تنفيذي',  'DESK-001',   '2,500', 'أثاث',   '50'],  rowStatus: 'ok' },
      { cells: ['حاسوب محمول',  'LAPTOP-PRO', '3,200', 'أجهزة',  '30'],  rowStatus: 'ok' },
      { cells: ['طابعة ليزر',   'PRINT-001',  'N/A',   'مكتبية', '20'],  rowStatus: 'error' },
      { cells: ['شاشة 27"',     'MON-27HD',   '1,800', 'أجهزة',  '45'],  rowStatus: 'ok' },
      { cells: ['كرسي مكتبي',   'CHAIR-EXE',  '950',   'أثاث',   '-10'], rowStatus: 'warning' },
      { cells: ['—',            '',            '0',     'مكتبية', '10'],  rowStatus: 'error' },
    ],
  },
};

const TARGET_ICONS: Record<ImportTarget, string> = {
  customers: '👥',
  orders:    '📋',
  leads:     '🎯',
  products:  '📦',
};

const TOTAL_MOCK_ROWS: Record<string, number> = {
  customers: 50, orders: 85, leads: 40, products: 120,
};

// ── Wizard Component ──────────────────────────────────────────────────────────

interface Props { backHref: string }

export default function ImportWizard({ backHref }: Props) {
  const router = useRouter();

  const [step,         setStep]         = useState(1);
  const [source,       setSource]       = useState<ImportSource | ''>('');
  const [target,       setTarget]       = useState<ImportTarget | ''>('');
  const [fileName,     setFileName]     = useState('');
  const [sheetUrl,     setSheetUrl]     = useState('');
  const [sheetLoaded,  setSheetLoaded]  = useState(false);
  const [mappings,     setMappings]     = useState<Record<string, string>>({});
  const [validating,   setValidating]   = useState(false);
  const [validated,    setValidated]    = useState(false);
  const [bypassErrors, setBypassErrors] = useState(false);
  const [importName,   setImportName]   = useState('');
  const [notes,        setNotes]        = useState('');
  const [confirmed,    setConfirmed]    = useState(false);
  const [processing,   setProcessing]   = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [done,         setDone]         = useState(false);

  const issues      = target ? (MOCK_ISSUES[target] ?? [])   : [];
  const previewData = target ? (MOCK_PREVIEW[target] ?? null) : null;
  const sourceCols  = target ? (SOURCE_COLS[target] ?? [])   : [];
  const targetFlds  = target ? (TARGET_FIELDS[target] ?? []) : [];
  const totalRows   = target ? (TOTAL_MOCK_ROWS[target] ?? 0) : 0;

  const errorCount   = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const validCount   = totalRows - errorCount;
  const hasDateIssues = issues.some(i => i.messageAr.includes('DD MMM YYYY'));

  const canProceedStep3 = errorCount === 0 || bypassErrors;

  // Auto-map all columns
  const doAutoMap = useCallback(() => {
    if (!target) return;
    const map = AUTO_MAP[target] ?? {};
    setMappings(
      Object.fromEntries(sourceCols.map(col => [col, map[col] ?? '']))
    );
  }, [target, sourceCols]);

  // Simulate validation delay on entering step 3
  useEffect(() => {
    if (step === 3 && !validated) {
      setValidating(true);
      const t = setTimeout(() => { setValidating(false); setValidated(true); }, 1600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [step, validated]);

  // Simulate import progress on step 6
  useEffect(() => {
    if (step === 6 && processing && !done) {
      const iv = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(iv); setProcessing(false); setDone(true); return 100; }
          return p + 5;
        });
      }, 120);
      return () => clearInterval(iv);
    }
    return undefined;
  }, [step, processing, done]);

  // Auto-set import name
  useEffect(() => {
    if (target && !importName) {
      const today = new Date().toLocaleDateString('ar-SA', { day: '2-digit', month: 'long', year: 'numeric' });
      setImportName(`استيراد ${IMPORT_TARGET_LABELS[target]} — ${today}`);
    }
  }, [target, importName]);

  function goNext() {
    if (step === 5) {
      setStep(6);
      setProcessing(true);
    } else {
      setStep(s => Math.min(6, s + 1));
    }
  }

  function goBack() { setStep(s => Math.max(1, s - 1)); }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function handleLoadSheet() {
    if (sheetUrl.trim()) setSheetLoaded(true);
  }

  const canStep1 = source !== '' && target !== '' && (source === 'google_sheets' ? sheetLoaded : fileName !== '');
  const canStep2 = targetFlds.filter(f => f.required).every(f => Object.values(mappings).includes(f.key));
  const canStep5 = confirmed && importName.trim() !== '';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="ofs-card" style={{ overflow: 'hidden' }}>

      {/* Step bar */}
      <div className="wizard-step-bar">
        {STEPS.map(s => (
          <div
            key={s.id}
            className={`wizard-step${s.id === step ? ' active' : ''}${s.id < step ? ' completed' : ''}`}
          >
            <div className="wizard-step-num">
              {s.id < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : s.id}
            </div>
            <span className="wizard-step-label">{s.labelAr}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={{ padding: 'var(--space-6)' }}>

        {/* ── Step 1: Upload ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', marginBlockEnd: 'var(--space-1)' }}>
                اختر مصدر البيانات
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-4)' }}>
                حدد الطريقة التي ستستورد منها البيانات
              </p>
              <div className="import-source-cards">
                {([
                  { id: 'google_sheets', label: 'Google Sheets', icon: '🟢', desc: 'استيراد من جدول Google' },
                  { id: 'excel',         label: 'Excel',          icon: '📗', desc: 'ملفات .xlsx و .xls' },
                  { id: 'csv',           label: 'CSV',            icon: '📄', desc: 'ملفات .csv نصية' },
                ] as { id: ImportSource; label: string; icon: string; desc: string }[]).map(s => (
                  <div
                    key={s.id}
                    className={`import-source-card${source === s.id ? ' selected' : ''}`}
                    onClick={() => { setSource(s.id); setFileName(''); setSheetLoaded(false); setSheetUrl(''); }}
                  >
                    <div className="import-source-icon"
                      style={{ background: source === s.id ? 'color-mix(in srgb, var(--color-primary) 15%, #fff)' : 'var(--color-surface-raised)' }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>{s.label}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 2 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File input / URL */}
            {source === 'google_sheets' && (
              <div>
                <label className="form-label">رابط جدول Google Sheets</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetUrl}
                    onChange={e => { setSheetUrl(e.target.value); setSheetLoaded(false); }}
                    dir="ltr"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-outline"
                    onClick={handleLoadSheet}
                    disabled={!sheetUrl.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {sheetLoaded ? '✓ تم التحميل' : 'تحميل الجدول'}
                  </button>
                </div>
                {sheetLoaded && (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-status-active)', marginBlockStart: 'var(--space-2)' }}>
                    ✓ تم تحميل الجدول — تم اكتشاف {sourceCols.length || '—'} عمود
                  </p>
                )}
              </div>
            )}

            {(source === 'excel' || source === 'csv') && (
              <div>
                <label className="form-label">رفع الملف</label>
                <label
                  className={`import-dropzone${fileName ? ' has-file' : ''}`}
                  htmlFor="file-upload"
                  style={{ cursor: 'pointer' }}
                >
                  {fileName ? (
                    <>
                      <span style={{ fontSize: 32 }}>📄</span>
                      <div>
                        <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-status-active)', margin: 0 }}>{fileName}</p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 4 }}>
                          انقر لتغيير الملف
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <div>
                        <p style={{ fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>اسحب الملف هنا أو انقر للاختيار</p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 4 }}>
                          {source === 'excel' ? 'ملفات Excel (.xlsx, .xls)' : 'ملفات CSV (.csv)'}
                        </p>
                      </div>
                    </>
                  )}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept={source === 'excel' ? '.xlsx,.xls' : '.csv'}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {/* Target module */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', marginBlockEnd: 'var(--space-1)' }}>
                وجهة الاستيراد
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-4)' }}>
                حدد نوع البيانات التي ستستوردها
              </p>
              <div className="import-target-cards">
                {(Object.keys(IMPORT_TARGET_LABELS) as ImportTarget[]).map(t => (
                  <div
                    key={t}
                    className={`import-target-card${target === t ? ' selected' : ''}`}
                    onClick={() => { setTarget(t); setMappings({}); setValidated(false); setImportName(''); }}
                  >
                    <span style={{ fontSize: 28 }}>{TARGET_ICONS[t]}</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {IMPORT_TARGET_LABELS[t]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Mapping ── */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBlockEnd: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', marginBlockEnd: 'var(--space-1)' }}>
                  ربط الحقول
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  تم اكتشاف <strong>{sourceCols.length}</strong> عمود — ربط كل عمود بالحقل المقابل في النظام
                </p>
              </div>
              <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }} onClick={doAutoMap}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineEnd: 6 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                ربط تلقائي
              </button>
            </div>

            {/* Required fields reminder */}
            <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', marginBlockEnd: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <span style={{ color: '#b91c1c', fontSize: 'var(--font-size-xs)' }}>●</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                الحقول المطلوبة: {targetFlds.filter(f => f.required).map(f => f.labelAr).join('، ')}
              </span>
            </div>

            {/* Mapping rows header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr 80px', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBlockEnd: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)' }}>
              <span>عمود الملف</span>
              <span></span>
              <span>حقل النظام</span>
              <span></span>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderBlockStart: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflow: 'hidden' }}>
              {sourceCols.map(col => {
                const mapped    = mappings[col] ?? '';
                const fieldDef  = targetFlds.find(f => f.key === mapped);
                return (
                  <div key={col} className="mapping-row">
                    <div className="mapping-source-col">{col}</div>
                    <span style={{ color: 'var(--color-text-muted)', textAlign: 'center', fontSize: 18 }}>←</span>
                    <select
                      className="form-select"
                      style={{ blockSize: 36, fontSize: 'var(--font-size-sm)' }}
                      value={mapped}
                      onChange={e => setMappings(prev => ({ ...prev, [col]: e.target.value }))}
                    >
                      <option value="">— غير مرتبط —</option>
                      {targetFlds.map(f => (
                        <option key={f.key} value={f.key}>
                          {f.labelAr}{f.required ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {fieldDef?.required
                        ? <span className="mapping-required-badge">مطلوب</span>
                        : mapped
                          ? <span className="mapping-optional-badge">اختياري</span>
                          : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {!canStep2 && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: '#b91c1c', marginBlockStart: 'var(--space-3)' }}>
                يجب ربط جميع الحقول المطلوبة للمتابعة
              </p>
            )}
          </div>
        )}

        {/* ── Step 3: Validation ── */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', marginBlockEnd: 'var(--space-1)' }}>
              التحقق من البيانات
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-5)' }}>
              فحص {totalRows} سجل بحثاً عن أخطاء ومشاكل محتملة
            </p>

            {validating ? (
              <div style={{ textAlign: 'center', paddingBlock: 'var(--space-10)' }}>
                <div style={{ display: 'inline-block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  <div className="import-progress-track" style={{ inlineSize: 280, marginBlock: 'var(--space-3) auto' }}>
                    <div className="import-progress-fill" style={{ inlineSize: '60%', animation: 'none' }} />
                  </div>
                  <p style={{ marginBlockStart: 'var(--space-3)' }}>جارٍ التحقق من البيانات...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="validation-summary">
                  <div className="validation-summary-card errors">
                    <div className="validation-count">{errorCount}</div>
                    <div className="validation-summary-label">خطأ</div>
                  </div>
                  <div className="validation-summary-card warnings">
                    <div className="validation-count">{warningCount}</div>
                    <div className="validation-summary-label">تحذير</div>
                  </div>
                  <div className="validation-summary-card valid">
                    <div className="validation-count">{validCount}</div>
                    <div className="validation-summary-label">سجل صالح</div>
                  </div>
                </div>

                {/* Date format notice */}
                {hasDateIssues && (
                  <div className="date-format-notice">
                    <svg className="date-format-notice-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <div>
                      <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', margin: '0 0 4px' }}>
                        تنسيق التاريخ المقبول الوحيد: DD MMM YYYY
                      </p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                        مثال صحيح: <code>15 يناير 2026</code> — <code>01 مارس 2025</code>
                        <br />
                        مرفوض: <code>2024-01-15</code> — <code>01/15/2024</code> — <code>Jan 15, 2024</code>
                      </p>
                    </div>
                  </div>
                )}

                {/* Issues list */}
                {issues.length > 0 && (
                  <div className="validation-issue-list">
                    <div className="validation-issue-header">
                      <span>السطر</span>
                      <span>الحقل</span>
                      <span>القيمة الحالية</span>
                      <span>المشكلة</span>
                      <span>الإصلاح المقترح</span>
                    </div>
                    {issues.map((issue, i) => (
                      <div key={i} className={`validation-issue-row ${issue.type === 'error' ? 'is-error' : 'is-warning'}`}>
                        <span style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>صف {issue.row}</span>
                        <span>
                          <span className={`issue-type-badge ${issue.type}`}>
                            {issue.type === 'error' ? '✗ خطأ' : '⚠ تحذير'}
                          </span>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 2 }}>{issue.fieldAr}</div>
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: issue.value ? 'var(--color-text)' : 'var(--color-text-subtle)', wordBreak: 'break-all' }}>
                          {issue.value || '(فارغ)'}
                        </span>
                        <span style={{ color: 'var(--color-text)' }}>{issue.messageAr}</span>
                        <span>
                          {issue.suggestedFix
                            ? <span className="issue-fix">→ {issue.suggestedFix}</span>
                            : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>—</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error bypass */}
                {errorCount > 0 && (
                  <div style={{ marginBlockStart: 'var(--space-4)', padding: 'var(--space-4)', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: '#b91c1c', fontWeight: 'var(--font-weight-medium)', marginBlockEnd: 'var(--space-3)' }}>
                      يوجد {errorCount} {errorCount === 1 ? 'خطأ' : 'أخطاء'} — السجلات المعطوبة ستُتخطى أثناء الاستيراد
                    </p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                      <input
                        type="checkbox"
                        checked={bypassErrors}
                        onChange={e => setBypassErrors(e.target.checked)}
                      />
                      أفهم أن السجلات المعطوبة ستُتخطى وأرغب في المتابعة
                    </label>
                  </div>
                )}

                {warningCount > 0 && errorCount === 0 && (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: '#b45309', marginBlockStart: 'var(--space-3)' }}>
                    التحذيرات لا توقف الاستيراد — ستُستورد السجلات كما هي
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Step 4: Preview ── */}
        {step === 4 && previewData && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBlockEnd: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', marginBlockEnd: 'var(--space-1)' }}>
                  معاينة البيانات
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  سيتم استيراد <strong style={{ color: 'var(--color-primary)' }}>{validCount}</strong> سجل
                  {errorCount > 0 && <span style={{ color: '#b91c1c' }}> — تخطي {errorCount} سجل بسبب أخطاء</span>}
                </p>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ inlineSize: 12, blockSize: 12, background: 'color-mix(in srgb, #ef4444 6%, #fff)', border: '1px solid #fecaca', borderRadius: 2, display: 'inline-block' }} />
                  خطأ — سيُتخطى
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ inlineSize: 12, blockSize: 12, background: 'color-mix(in srgb, #f59e0b 6%, #fff)', border: '1px solid #fde68a', borderRadius: 2, display: 'inline-block' }} />
                  تحذير — سيُستورد
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ inlineSize: 12, blockSize: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, display: 'inline-block' }} />
                  صالح
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ofs-table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>السطر</th>
                    {previewData.headers.map(h => <th key={h}>{h}</th>)}
                    <th style={{ width: 80 }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={row.rowStatus === 'error' ? 'row-preview-error' : row.rowStatus === 'warning' ? 'row-preview-warning' : undefined}
                    >
                      <td style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-xs)' }}>
                        {i + 1}
                      </td>
                      {row.cells.map((c, j) => (
                        <td key={j} style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c || <span style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>فارغ</span>}
                        </td>
                      ))}
                      <td>
                        {row.rowStatus === 'error'
                          ? <span className="issue-type-badge error">✗ خطأ</span>
                          : row.rowStatus === 'warning'
                            ? <span className="issue-type-badge warning">⚠</span>
                            : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-status-active)' }}>✓</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalRows > previewData.rows.length && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginBlockStart: 'var(--space-3)' }}>
                عرض أول {previewData.rows.length} سجل من أصل {totalRows}
              </p>
            )}
          </div>
        )}

        {/* ── Step 5: Approval ── */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', marginBlockEnd: 'var(--space-1)' }}>
              مراجعة وموافقة
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-5)' }}>
              راجع ملخص الاستيراد وأكد الموافقة قبل البدء
            </p>

            {/* Summary */}
            <div className="import-approval-grid">
              <div className="import-approval-cell">
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{totalRows}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 4 }}>إجمالي السجلات</div>
              </div>
              <div className="import-approval-cell">
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-status-active)' }}>{validCount}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 4 }}>سيُستورد</div>
              </div>
              <div className="import-approval-cell">
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: errorCount > 0 ? '#b91c1c' : 'var(--color-text-muted)' }}>{errorCount}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 4 }}>سيُتخطى</div>
              </div>
            </div>

            {/* Import name */}
            <div className="form-group" style={{ marginBlockEnd: 'var(--space-4)' }}>
              <label className="form-label">اسم عملية الاستيراد <span className="form-required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={importName}
                onChange={e => setImportName(e.target.value)}
                placeholder="أدخل اسماً للتعرف على هذه العملية لاحقاً"
              />
            </div>

            <div className="form-group" style={{ marginBlockEnd: 'var(--space-5)' }}>
              <label className="form-label">ملاحظات (اختياري)</label>
              <textarea
                className="form-textarea form-input"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية حول هذه العملية..."
                rows={3}
              />
            </div>

            {/* Confirmation */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-4)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                style={{ marginBlockStart: 2 }}
              />
              <span style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
                أؤكد أنني راجعت البيانات وأن المعلومات صحيحة، وأوافق على بدء عملية الاستيراد.
                السجلات المعطوبة ({errorCount}) ستُتخطى تلقائياً.
              </span>
            </label>
          </div>
        )}

        {/* ── Step 6: Result ── */}
        {step === 6 && (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-4)' }}>
            {processing ? (
              <div style={{ maxInlineSize: 400, marginInline: 'auto' }}>
                <div style={{ fontSize: 48, marginBlockEnd: 'var(--space-4)' }}>⏳</div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBlockEnd: 'var(--space-2)' }}>
                  جارٍ الاستيراد...
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-5)' }}>
                  يُرجى الانتظار، لا تغلق هذه الصفحة
                </p>
                <div className="import-progress-track" style={{ marginBlockEnd: 'var(--space-2)' }}>
                  <div className="import-progress-fill" style={{ inlineSize: `${progress}%` }} />
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {progress}%
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 64, marginBlockEnd: 'var(--space-4)' }}>
                  {errorCount > validCount / 2 ? '⚠️' : '✅'}
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBlockEnd: 'var(--space-2)' }}>
                  {errorCount === 0 ? 'تم الاستيراد بنجاح!' : `اكتمل الاستيراد${errorCount > 0 ? ' مع تخطي بعض السجلات' : ''}`}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-6)' }}>
                  {importName}
                </p>

                <div className="import-result-stats" style={{ marginBlockEnd: 'var(--space-6)', textAlign: 'center' }}>
                  <div className="import-result-stat">
                    <div className="import-result-stat-number" style={{ color: 'var(--color-primary)' }}>{totalRows}</div>
                    <div className="import-result-stat-label">إجمالي السجلات</div>
                  </div>
                  <div className="import-result-stat">
                    <div className="import-result-stat-number" style={{ color: 'var(--color-status-active)' }}>{validCount}</div>
                    <div className="import-result-stat-label">تم استيراده</div>
                  </div>
                  <div className="import-result-stat">
                    <div className="import-result-stat-number" style={{ color: errorCount > 0 ? '#b91c1c' : 'var(--color-text-muted)' }}>{errorCount}</div>
                    <div className="import-result-stat-label">تم تخطيه</div>
                  </div>
                  <div className="import-result-stat">
                    <div className="import-result-stat-number" style={{ color: warningCount > 0 ? '#b45309' : 'var(--color-text-muted)' }}>{warningCount}</div>
                    <div className="import-result-stat-label">تحذيرات</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={`/ar/sales/${target ?? 'customers'}`}
                    className="btn-cta"
                    style={{ textDecoration: 'none' }}
                  >
                    عرض {IMPORT_TARGET_LABELS[target as ImportTarget] ?? 'السجلات'} المستوردة
                  </a>
                  <button
                    className="btn-outline"
                    onClick={() => {
                      setStep(1); setSource(''); setTarget(''); setFileName(''); setSheetUrl('');
                      setSheetLoaded(false); setMappings({}); setValidated(false); setBypassErrors(false);
                      setImportName(''); setNotes(''); setConfirmed(false);
                      setProcessing(false); setProgress(0); setDone(false);
                    }}
                  >
                    استيراد جديد
                  </button>
                  {errorCount > 0 && (
                    <button className="btn-ghost">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      تنزيل تقرير الأخطاء
                    </button>
                  )}
                  <button className="btn-ghost" onClick={() => router.push(backHref)}>
                    العودة إلى لوحة الاستيراد
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step < 6 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6)',
          borderBlockStart: '1px solid var(--color-border)',
          background: 'var(--color-surface-raised)',
        }}>
          <button
            className="btn-ghost"
            onClick={step === 1 ? () => router.push(backHref) : goBack}
          >
            {step === 1 ? 'إلغاء' : 'رجوع'}
          </button>
          <button
            className="btn-cta"
            onClick={goNext}
            disabled={
              (step === 1 && !canStep1) ||
              (step === 2 && !canStep2) ||
              (step === 3 && (validating || !canProceedStep3)) ||
              (step === 5 && !canStep5)
            }
          >
            {step === 3 ? 'معاينة البيانات'
              : step === 4 ? 'المتابعة للموافقة'
                : step === 5 ? 'ابدأ الاستيراد'
                  : 'التالي'}
          </button>
        </div>
      )}
    </div>
  );
}
