import { Module } from '@nestjs/common';
import { UserRolesController } from './user-roles.controller.js';
import { UserRolesService } from './user-roles.service.js';
import { UserRolesRepository } from './user-roles.repository.js';
import { UsersModule } from '../users/users.module.js';
import { RolesModule } from '../roles/roles.module.js';

@Module({
  imports: [UsersModule, RolesModule],
  controllers: [UserRolesController],
  providers: [UserRolesService, UserRolesRepository],
  exports: [UserRolesService, UserRolesRepository],
})
export class UserRolesModule {}
