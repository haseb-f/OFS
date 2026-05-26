export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  name: string;
  roleCode: string;
  brandId: string | null;
}

export interface RegisterBrandDto {
  // Step 1 — Owner info
  ownerNameAr: string;
  ownerNameEn?: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerPassword: string;
  // Step 2 — Brand info
  brandNameAr: string;
  brandNameEn?: string;
  brandSlug: string;
  // Step 3 — First company
  companyNameAr: string;
  companyNameEn?: string;
  taxNumber?: string;
  // Step 4 — Plan (stored in settings JSON)
  plan: 'basic' | 'professional' | 'enterprise';
}

export interface RegisterBrandResponse {
  userId: string;
  brandId: string;
  companyId: string;
  branchId: string;
}
