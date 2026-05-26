import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service.js';
import { AssignRoleSchema } from './dto/assign-role.dto.js';

@Controller('identity/users/:userId/roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async assign(@Param('userId') userId: string, @Body() body: unknown) {
    const result = AssignRoleSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.userRolesService.assign(userId, result.data);
  }

  @Get()
  async findByUser(@Param('userId') userId: string) {
    return this.userRolesService.findByUser(userId);
  }

  @Delete(':userRoleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param('userId') userId: string, @Param('userRoleId') userRoleId: string) {
    await this.userRolesService.revoke(userId, userRoleId);
  }
}
