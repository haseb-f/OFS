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
import { BranchesService } from './branches.service.js';
import { CreateBranchSchema } from './dto/create-branch.dto.js';

@Controller('identity')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = CreateBranchSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.branchesService.create(result.data);
  }

  @Get('companies/:companyId/branches')
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.branchesService.findByCompany(companyId, {
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 20,
    });
  }

  @Get('branches/:id')
  async findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Delete('branches/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.branchesService.remove(id);
  }
}
