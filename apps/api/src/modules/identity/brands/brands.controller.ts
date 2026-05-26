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
import { BrandsService } from './brands.service.js';
import { CreateBrandSchema } from './dto/create-brand.dto.js';

@Controller('identity/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = CreateBrandSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.brandsService.create(result.data);
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.brandsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.brandsService.remove(id);
  }
}
