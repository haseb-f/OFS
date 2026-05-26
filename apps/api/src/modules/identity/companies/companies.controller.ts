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
import { CompaniesService } from './companies.service.js';
import { CreateCompanySchema } from './dto/create-company.dto.js';

@Controller('identity')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('companies')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = CreateCompanySchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.companiesService.create(result.data);
  }

  @Get('brands/:brandId/companies')
  async findByBrand(
    @Param('brandId') brandId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.companiesService.findByBrand(brandId, {
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 20,
    });
  }

  @Get('companies/:id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Delete('companies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.companiesService.remove(id);
  }
}
