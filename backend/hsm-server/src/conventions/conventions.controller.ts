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
import { UserSelectConventionDto } from './dto/user-select-convention.dto';

@Controller('conventions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConventionsController {
  constructor(private readonly conventionsService: ConventionsService) {}

  // ==================== USER CONVENTION SELECTION ====================
  // ⚠️ CRITICAL: These MUST come BEFORE any dynamic routes like /:id

  /**
   * Get all active conventions available for selection
   * Accessible by all authenticated users
   */
  @Get('available')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  getAvailableConventions() {
    return this.conventionsService.getAvailableConventions();
  }

  /**
   * Get my convention statistics
   * Accessible by all authenticated users
   * MUST be before /my-conventions to avoid matching as /:id
   */
  @Get('my-conventions/stats')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  getUserConventionStats(@Request() req) {
    return this.conventionsService.getUserConventionStats(req.user.sub);
  }

  /**
   * Get my conventions (both admin-assigned and user-selected)
   * Accessible by all authenticated users
   */
  @Get('my-conventions')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  getMyConventions(@Request() req) {
    return this.conventionsService.getMyConventions(req.user.sub);
  }

  /**
   * Select conventions for myself
   * Accessible by non-admin users only
   */
  @Post('my-conventions/select')
  @Roles(Role.DOCTOR, Role.NURSE)
  selectConventionsForSelf(
    @Body() userSelectConventionDto: UserSelectConventionDto,
    @Request() req,
  ) {
    return this.conventionsService.selectConventionsForSelf(
      req.user.sub,
      userSelectConventionDto.conventionIds,
    );
  }

  /**
   * Remove my selected convention
   * Cannot remove admin-assigned conventions
   * Accessible by non-admin users only
   */
  @Delete('my-conventions/:conventionId')
  @Roles(Role.DOCTOR, Role.NURSE)
  removeMyConvention(
    @Param('conventionId') conventionId: string,
    @Request() req,
  ) {
    return this.conventionsService.removeMyConvention(
      req.user.sub,
      conventionId,
    );
  }

  // ==================== ADMIN CONVENTION MANAGEMENT ====================

  /**
   * Get convention statistics
   * Admin only
   */
  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.conventionsService.getStats();
  }

  /**
   * Get conventions assigned to a specific user
   * Admin only
   */
  @Get('users/:userId')
  @Roles(Role.ADMIN)
  getUserConventions(@Param('userId') userId: string) {
    return this.conventionsService.getUserConventions(userId);
  }

  /**
   * Assign conventions to a user
   * Admin only
   */
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

  /**
   * Remove a convention from a user
   * Admin only
   */
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

  // ==================== CONVENTION CRUD ====================

  /**
   * Create a new convention
   * Admin only
   */
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createConventionDto: CreateConventionDto, @Request() req) {
    return this.conventionsService.create(createConventionDto, req.user.sub);
  }

  /**
   * Get all conventions (with pagination and filters)
   * Admin only
   */
  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: QueryConventionDto) {
    return this.conventionsService.findAll(query);
  }

  /**
   * Get a single convention by ID
   * Admin only
   * ⚠️ CRITICAL: This MUST be after all specific routes
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.conventionsService.findOne(id);
  }

  /**
   * Update a convention
   * Admin only
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateConventionDto: UpdateConventionDto,
  ) {
    return this.conventionsService.update(id, updateConventionDto);
  }

  /**
   * Soft delete a convention
   * Admin only
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.conventionsService.remove(id);
  }

  /**
   * Hard delete a convention
   * Admin only
   */
  @Delete(':id/hard')
  @Roles(Role.ADMIN)
  hardDelete(@Param('id') id: string) {
    return this.conventionsService.hardDelete(id);
  }
}
