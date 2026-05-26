import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller.js';
import { BranchesService } from './branches.service.js';
import { BranchesRepository } from './branches.repository.js';

@Module({
  controllers: [BranchesController],
  providers: [BranchesService, BranchesRepository],
  exports: [BranchesService, BranchesRepository],
})
export class BranchesModule {}
