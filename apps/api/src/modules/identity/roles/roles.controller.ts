import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRoleSchema } from './dto/create-role.dto.js';

@Controller('identity/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = CreateRoleSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.rolesService.create(result.data);
  }

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }
}
