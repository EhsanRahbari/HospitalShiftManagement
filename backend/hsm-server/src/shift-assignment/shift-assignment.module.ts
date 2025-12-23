import { Module } from '@nestjs/common';
import { ShiftAssignmentsController } from './shift-assignments.controller';
import { ShiftAssignmentsService } from './shift-assignments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConventionValidatorService } from '../common/services/convention-validator.service';

@Module({
  imports: [PrismaModule],
  controllers: [ShiftAssignmentsController],
  providers: [ShiftAssignmentsService, ConventionValidatorService],
  exports: [ShiftAssignmentsService],
})
export class ShiftAssignmentsModule {}
