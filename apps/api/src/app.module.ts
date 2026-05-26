import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [PrismaModule, HealthModule, IdentityModule, AuthModule],
})
export class AppModule {}
