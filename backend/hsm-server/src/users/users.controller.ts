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
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * Create a new user (Admin only)
   */
  @Post()
  @Roles('ADMIN')
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.create(createUserDto, currentUser.id);
  }

  /**
   * GET /users
   * Get all users with pagination and filters (Admin only)
   * Query params: page, limit, role, isActive, search, department, section
   */
  @Get()
  @Roles('ADMIN')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('department') department?: string, // ✅ ADD THIS
    @Query('section') section?: string, // ✅ ADD THIS
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      role,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
      department, // ✅ ADD THIS
      section, // ✅ ADD THIS
    });
  }

  /**
   * GET /users/stats
   * Get user statistics (Admin only)
   */
  @Get('stats')
  @Roles('ADMIN')
  getStats() {
    return this.usersService.getStats();
  }

  /**
   * ✅ NEW ENDPOINT
   * GET /users/departments
   * Get all unique departments (Admin only)
   */
  @Get('departments')
  @Roles('ADMIN')
  getDepartments() {
    return this.usersService.getDepartments();
  }

  /**
   * ✅ NEW ENDPOINT
   * GET /users/sections
   * Get all unique sections, optionally filtered by department (Admin only)
   * Query params: department (optional)
   */
  @Get('sections')
  @Roles('ADMIN')
  getSections(@Query('department') department?: string) {
    return this.usersService.getSections(department);
  }

  /**
   * GET /users/:id
   * Get user by ID (Admin only)
   */
  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /users/:id
   * Update user (Admin only)
   */
  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id
   * Soft delete user (Admin only)
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    // Prevent admin from deleting themselves
    if (id === currentUser.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    return this.usersService.remove(id);
  }

  /**
   * DELETE /users/:id/hard
   * Hard delete user permanently (Admin only - dangerous)
   */
  @Delete(':id/hard')
  @Roles('ADMIN')
  hardDelete(@Param('id') id: string, @CurrentUser() currentUser: any) {
    // Prevent admin from deleting themselves
    if (id === currentUser.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    return this.usersService.hardDelete(id);
  }
}
