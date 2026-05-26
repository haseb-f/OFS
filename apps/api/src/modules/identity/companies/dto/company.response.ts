export interface CompanyResponse {
  id: string;
  brandId: string;
  nameAr: string;
  nameEn: string | null;
  taxNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
