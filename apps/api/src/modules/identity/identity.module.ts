import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { UserRolesModule } from './user-roles/user-roles.module.js';
import { BrandsModule } from './brands/brands.module.js';
import { CompaniesModule } from './companies/companies.module.js';
import { BranchesModule } from './branches/branches.module.js';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PermissionsModule,
    UserRolesModule,
    BrandsModule,
    CompaniesModule,
    BranchesModule,
  ],
  exports: [
    UsersModule,
    RolesModule,
    PermissionsModule,
    UserRolesModule,
    BrandsModule,
    CompaniesModule,
    BranchesModule,
  ],
})
export class IdentityModule {}
