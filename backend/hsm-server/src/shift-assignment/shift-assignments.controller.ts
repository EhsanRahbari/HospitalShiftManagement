import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShiftAssignmentsService } from './shift-assignments.service';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto';
import { GetShiftAssignmentsDto } from './dto/get-shift-assignments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/client';

@Controller('shift-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftAssignmentsController {
  constructor(
    private readonly shiftAssignmentsService: ShiftAssignmentsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDto: CreateShiftAssignmentDto, @Request() req) {
    return this.shiftAssignmentsService.create(createDto, req.user.id);
  }

  @Post('bulk')
  @Roles(Role.ADMIN)
  bulkCreate(
    @Body() body: { assignments: CreateShiftAssignmentDto[] },
    @Request() req,
  ) {
    return this.shiftAssignmentsService.bulkCreate(
      body.assignments,
      req.user.id,
    );
  }

  @Get()
  findAll(@Query() query: GetShiftAssignmentsDto, @Request() req) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.shiftAssignmentsService.findAll(query, req.user.id, isAdmin);
  }

  @Get('monthly/:year/:month')
  getMonthlyAssignments(
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('userId') userId: string,
    @Request() req,
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    const targetUserId = isAdmin && userId ? userId : req.user.id;

    return this.shiftAssignmentsService.getMonthlyAssignments(
      targetUserId,
      parseInt(year),
      parseInt(month),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.shiftAssignmentsService.findOne(id, req.user.id, isAdmin);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateShiftAssignmentDto,
    @Request() req,
  ) {
    return this.shiftAssignmentsService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.shiftAssignmentsService.remove(id, req.user.id, isAdmin);
  }
}
