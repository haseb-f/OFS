import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { LoginDto, RegisterBrandDto } from './dto/login.dto.js';

const TAG = '[AuthController]';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    console.log(`${TAG} POST /auth/login — email: ${body.email}`);
    if (!body.email || !body.password) {
      throw new BadRequestException('البريد الإلكتروني وكلمة المرور مطلوبان');
    }
    try {
      return await this.auth.login(body);
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        console.warn(`${TAG} Unauthorized — ${err.message}`);
        throw err;
      }
      console.error(`${TAG} Unexpected error in login:`, err);
      throw new UnauthorizedException('بريد إلكتروني أو كلمة مرور غير صحيحة');
    }
  }

  @Post('platform-login')
  @HttpCode(HttpStatus.OK)
  async platformLogin(@Body() body: LoginDto) {
    console.log(`${TAG} POST /auth/platform-login — email: ${body.email}`);
    if (!body.email || !body.password) {
      throw new BadRequestException('البريد الإلكتروني وكلمة المرور مطلوبان');
    }
    try {
      return await this.auth.platformLogin(body);
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        console.warn(`${TAG} Unauthorized — ${err.message}`);
        throw err;
      }
      console.error(`${TAG} Unexpected error in platformLogin:`, err);
      throw new UnauthorizedException('بريد إلكتروني أو كلمة مرور غير صحيحة');
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterBrandDto) {
    if (!body.ownerEmail || !body.ownerPassword || !body.brandSlug) {
      throw new BadRequestException('البيانات المطلوبة غير مكتملة');
    }
    try {
      return await this.auth.registerBrand(body);
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      console.error(`${TAG} Unexpected error in register:`, err);
      throw new BadRequestException('حدث خطأ أثناء إنشاء الحساب');
    }
  }
}
