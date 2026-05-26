import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserSchema } from './dto/create-user.dto.js';
import { UpdateUserSchema } from './dto/update-user.dto.js';

@Controller('identity/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = CreateUserSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.usersService.create(result.data);
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const result = UpdateUserSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.usersService.update(id, result.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}
