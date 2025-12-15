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
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/client';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  findAll(@Query() query: QueryShiftDto, @Request() req) {
    return this.shiftsService.findAll(query, req.user.sub, req.user.role);
  }

  @Get('my-shifts')
  getMyShifts(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.shiftsService.getMyShifts(req.user.sub, startDate, endDate);
  }

  @Get('stats')
  getStats(@Request() req, @Query('userId') userId?: string) {
    // If user is not admin, force userId to be their own
    const targetUserId = req.user.role === Role.ADMIN ? userId : req.user.sub;
    return this.shiftsService.getStats(targetUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.shiftsService.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @Request() req,
  ) {
    return this.shiftsService.update(
      id,
      updateShiftDto,
      req.user.sub,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.shiftsService.remove(id, req.user.role);
  }
}
