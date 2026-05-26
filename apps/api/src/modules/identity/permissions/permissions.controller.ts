import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { CreatePermissionSchema } from './dto/create-permission.dto.js';
import { z } from 'zod';

const AssignPermissionSchema = z.object({
  permissionId: z.string().cuid(),
  grantedBy: z.string().cuid().optional(),
});

@Controller('identity')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('permissions')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = CreatePermissionSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.permissionsService.create(result.data);
  }

  @Get('permissions')
  async findAll(@Query('resource') resource?: string) {
    return this.permissionsService.findAll(resource);
  }

  @Get('permissions/:id')
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Post('roles/:roleId/permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignToRole(@Param('roleId') roleId: string, @Body() body: unknown) {
    const result = AssignPermissionSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    await this.permissionsService.assignToRole(roleId, result.data.permissionId, result.data.grantedBy);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.permissionsService.revokeFromRole(roleId, permissionId);
  }

  @Get('roles/:roleId/permissions')
  async findByRole(@Param('roleId') roleId: string) {
    return this.permissionsService.findByRole(roleId);
  }
}
