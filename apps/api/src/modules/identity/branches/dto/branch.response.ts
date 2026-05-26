export interface BranchResponse {
  id: string;
  companyId: string;
  nameAr: string;
  nameEn: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
