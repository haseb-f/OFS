import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller.js';
import { BrandsService } from './brands.service.js';
import { BrandsRepository } from './brands.repository.js';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository],
  exports: [BrandsService, BrandsRepository],
})
export class BrandsModule {}
