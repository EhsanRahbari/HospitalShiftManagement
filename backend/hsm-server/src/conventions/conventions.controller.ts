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
import { ConventionsService } from './conventions.service';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';
import {
  AssignConventionDto,
  RemoveConventionDto,
} from './dto/assign-convention.dto';
import { QueryConventionDto } from './dto/query-convention.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/client';

@Controller('conventions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConventionsController {
  constructor(private readonly conventionsService: ConventionsService) {}

  // ==================== CONVENTION CRUD ====================

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createConventionDto: CreateConventionDto, @Request() req) {
    return this.conventionsService.create(createConventionDto, req.user.sub);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: QueryConventionDto) {
    return this.conventionsService.findAll(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.conventionsService.getStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.conventionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateConventionDto: UpdateConventionDto,
  ) {
    return this.conventionsService.update(id, updateConventionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.conventionsService.remove(id);
  }

  @Delete(':id/hard')
  @Roles(Role.ADMIN)
  hardDelete(@Param('id') id: string) {
    return this.conventionsService.hardDelete(id);
  }

  // ==================== USER-CONVENTION ASSIGNMENT ====================

  @Post('users/:userId/assign')
  @Roles(Role.ADMIN)
  assignConventionsToUser(
    @Param('userId') userId: string,
    @Body() assignConventionDto: AssignConventionDto,
    @Request() req,
  ) {
    return this.conventionsService.assignConventionsToUser(
      userId,
      assignConventionDto,
      req.user.sub,
    );
  }

  @Delete('users/:userId/remove/:conventionId')
  @Roles(Role.ADMIN)
  removeConventionFromUser(
    @Param('userId') userId: string,
    @Param('conventionId') conventionId: string,
  ) {
    return this.conventionsService.removeConventionFromUser(
      userId,
      conventionId,
    );
  }

  @Get('users/:userId')
  @Roles(Role.ADMIN)
  getUserConventions(@Param('userId') userId: string) {
    return this.conventionsService.getUserConventions(userId);
  }
}
