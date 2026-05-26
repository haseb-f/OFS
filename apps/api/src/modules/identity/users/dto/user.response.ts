export interface UserResponse {
  id: string;
  email: string;
  phone: string | null;
  nameAr: string;
  nameEn: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
