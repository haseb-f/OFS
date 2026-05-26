import type { User } from '@prisma/client';
import type { UserResponse } from './dto/user.response.js';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    nameAr: user.nameAr,
    nameEn: user.nameEn,
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
