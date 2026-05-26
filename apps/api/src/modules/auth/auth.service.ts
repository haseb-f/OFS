import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto, LoginResponse, RegisterBrandDto, RegisterBrandResponse } from './dto/login.dto.js';

const TAG = '[AuthService]';

const USER_WITH_ROLES_QUERY = {
  where: {} as Record<string, unknown>,
  include: {
    userRoles: {
      where: { isActive: true },
      include: { role: true },
      take: 1,
      orderBy: { grantedAt: 'desc' as const },
    },
  },
} as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    console.log(`${TAG} login() — email: ${dto.email}`);

    const user = await this.prisma.user
      .findFirst({
        where: { email: dto.email, isActive: true, deletedAt: null },
        include: USER_WITH_ROLES_QUERY.include,
      })
      .catch((dbErr: unknown) => {
        console.error(`${TAG} DB error during login:`, dbErr);
        throw dbErr;
      });

    console.log(`${TAG} DB lookup — user found: ${!!user}${user ? ` | id: ${user.id}` : ''}`);

    if (!user) {
      console.warn(`${TAG} No active user for email: ${dto.email}`);
      throw new UnauthorizedException('بريد إلكتروني أو كلمة مرور غير صحيحة');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    console.log(`${TAG} Password check — valid: ${valid}`);
    if (!valid) throw new UnauthorizedException('بريد إلكتروني أو كلمة مرور غير صحيحة');

    const primaryRole = user.userRoles[0]?.role;
    console.log(`${TAG} Primary role: ${primaryRole?.code ?? 'none'}`);

    if (!primaryRole) throw new UnauthorizedException('لم يتم تعيين دور للمستخدم');

    if (primaryRole.code === 'PLATFORM_OWNER') {
      console.warn(`${TAG} PLATFORM_OWNER attempted brand login — rejected`);
      throw new UnauthorizedException('يرجى استخدام بوابة المنصة لتسجيل الدخول');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const result: LoginResponse = {
      userId:   user.id,
      email:    user.email,
      name:     (user.nameEn ?? user.nameAr ?? user.email) as string,
      roleCode: primaryRole.code,
      brandId:  user.userRoles[0]?.brandId ?? null,
    };
    console.log(`${TAG} login() success — userId: ${result.userId} | role: ${result.roleCode} | brandId: ${result.brandId ?? 'null'}`);
    return result;
  }

  async platformLogin(dto: LoginDto): Promise<LoginResponse> {
    console.log(`${TAG} platformLogin() — email: ${dto.email}`);

    const user = await this.prisma.user
      .findFirst({
        where: { email: dto.email, isActive: true, deletedAt: null },
        include: USER_WITH_ROLES_QUERY.include,
      })
      .catch((dbErr: unknown) => {
        console.error(`${TAG} DB error during platformLogin:`, dbErr);
        throw dbErr;
      });

    console.log(`${TAG} DB lookup — user found: ${!!user}${user ? ` | id: ${user.id}` : ''}`);

    if (!user) {
      console.warn(`${TAG} No active user for email: ${dto.email}`);
      throw new UnauthorizedException('بريد إلكتروني أو كلمة مرور غير صحيحة');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    console.log(`${TAG} Password check — valid: ${valid}`);
    if (!valid) throw new UnauthorizedException('بريد إلكتروني أو كلمة مرور غير صحيحة');

    const primaryRole = user.userRoles[0]?.role;
    console.log(`${TAG} Primary role: ${primaryRole?.code ?? 'none'}`);

    if (!primaryRole || primaryRole.code !== 'PLATFORM_OWNER') {
      console.warn(`${TAG} Non-PLATFORM_OWNER attempted platform login — role: ${primaryRole?.code ?? 'none'}`);
      throw new UnauthorizedException('هذه البوابة مخصصة لمالكي المنصة فقط');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const result: LoginResponse = {
      userId:   user.id,
      email:    user.email,
      name:     (user.nameEn ?? user.nameAr ?? user.email) as string,
      roleCode: primaryRole.code,
      brandId:  null,
    };
    console.log(`${TAG} platformLogin() success — userId: ${result.userId}`);
    return result;
  }

  async registerBrand(dto: RegisterBrandDto): Promise<RegisterBrandResponse> {
    const existingUser = await this.prisma.user.findFirst({ where: { email: dto.ownerEmail } });
    if (existingUser) throw new ConflictException('البريد الإلكتروني مسجّل بالفعل');

    const existingBrand = await this.prisma.brand.findFirst({ where: { slug: dto.brandSlug } });
    if (existingBrand) throw new ConflictException('معرّف البراند المختصر مأخوذ بالفعل');

    const adminRole = await this.prisma.role.findUniqueOrThrow({ where: { code: 'ADMIN' } });
    const passwordHash = await bcrypt.hash(dto.ownerPassword, 12);

    return this.prisma.$transaction(async (tx) => {
      const brand = await tx.brand.create({
        data: {
          nameAr: dto.brandNameAr,
          nameEn: dto.brandNameEn ?? null,
          slug: dto.brandSlug,
          isActive: true,
          settings: { plan: dto.plan },
        },
      });

      const company = await tx.company.create({
        data: {
          brandId: brand.id,
          nameAr: dto.companyNameAr,
          nameEn: dto.companyNameEn ?? null,
          taxNumber: dto.taxNumber ?? null,
          isActive: true,
        },
      });

      const branch = await tx.branch.create({
        data: {
          companyId: company.id,
          nameAr: 'الفرع الرئيسي',
          nameEn: 'Main Branch',
          isActive: true,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.ownerEmail,
          nameAr: dto.ownerNameAr,
          nameEn: dto.ownerNameEn ?? null,
          phone: dto.ownerPhone ?? null,
          passwordHash,
          isActive: true,
          isVerified: false,
          userRoles: {
            create: {
              roleId: adminRole.id,
              scopeType: 'BRAND',
              brandId: brand.id,
            },
          },
        },
      });

      return { userId: user.id, brandId: brand.id, companyId: company.id, branchId: branch.id };
    });
  }
}
