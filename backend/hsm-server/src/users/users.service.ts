import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user (Admin only)
   */
  async create(
    createUserDto: CreateUserDto,
    createdById: string,
  ): Promise<UserResponseDto> {
    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException(
        `Username '${createUserDto.username}' already exists`,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS,
    );

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role,
        isActive: createUserDto.isActive ?? true,
        department: createUserDto.department, // ✅ ADD THIS
        section: createUserDto.section, // ✅ ADD THIS
        createdById,
      },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        department: true, // ✅ ADD THIS
        section: true, // ✅ ADD THIS
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return user;
  }

  /**
   * Get all users with pagination and filtering
   */
  async findAll(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
    department?: string; // ✅ ADD THIS
    section?: string; // ✅ ADD THIS
  }): Promise<{
    data: UserResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (params?.role) {
      where.role = params.role;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params?.search) {
      where.username = {
        contains: params.search,
        mode: 'insensitive',
      };
    }

    // ✅ ADD DEPARTMENT FILTER
    if (params?.department) {
      where.department = params.department;
    }

    // ✅ ADD SECTION FILTER
    if (params?.section) {
      where.section = params.section;
    }

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get users
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        department: true, // ✅ ADD THIS
        section: true, // ✅ ADD THIS
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        department: true, // ✅ ADD THIS
        section: true, // ✅ ADD THIS
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    return user;
  }

  /**
   * Update user (Admin only)
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    // Check if username is being changed and already exists
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (usernameExists) {
        throw new ConflictException(
          `Username '${updateUserDto.username}' already exists`,
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (updateUserDto.username) {
      updateData.username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(
        updateUserDto.password,
        SALT_ROUNDS,
      );
    }

    if (updateUserDto.role) {
      updateData.role = updateUserDto.role;
    }

    if (updateUserDto.isActive !== undefined) {
      updateData.isActive = updateUserDto.isActive;
    }

    // ✅ ADD DEPARTMENT UPDATE
    if (updateUserDto.department !== undefined) {
      updateData.department = updateUserDto.department;
    }

    // ✅ ADD SECTION UPDATE
    if (updateUserDto.section !== undefined) {
      updateData.section = updateUserDto.section;
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        department: true, // ✅ ADD THIS
        section: true, // ✅ ADD THIS
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return user;
  }

  /**
   * Delete user (Admin only)
   * Note: This is a soft delete (sets isActive to false)
   */
  async remove(id: string): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    // Prevent deleting yourself
    // This check will be done in controller with current user

    // Soft delete (deactivate)
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: `User '${user.username}' has been deactivated`,
    };
  }

  /**
   * Hard delete user (Admin only - dangerous)
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: `User '${user.username}' has been permanently deleted`,
    };
  }

  /**
   * Get user statistics (Admin only)
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: {
      admin: number;
      doctor: number;
      nurse: number;
    };
    byDepartment?: Record<string, number>; // ✅ ADD THIS
  }> {
    const [total, active, admins, doctors, nurses] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'DOCTOR' } }),
      this.prisma.user.count({ where: { role: 'NURSE' } }),
    ]);

    // ✅ ADD DEPARTMENT STATS
    const usersByDepartment = await this.prisma.user.groupBy({
      by: ['department'],
      where: {
        department: { not: null },
      },
      _count: true,
    });

    const byDepartment: Record<string, number> = {};
    usersByDepartment.forEach((item) => {
      if (item.department) {
        byDepartment[item.department] = item._count;
      }
    });

    return {
      total,
      active,
      inactive: total - active,
      byRole: {
        admin: admins,
        doctor: doctors,
        nurse: nurses,
      },
      byDepartment, // ✅ ADD THIS
    };
  }

  /**
   * ✅ NEW METHOD: Get all unique departments
   */
  async getDepartments(): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: {
        department: { not: null },
      },
      select: {
        department: true,
      },
      distinct: ['department'],
    });

    return users
      .map((u) => u.department)
      .filter((d): d is string => d !== null)
      .sort();
  }

  /**
   * ✅ NEW METHOD: Get all unique sections (optionally filtered by department)
   */
  async getSections(department?: string): Promise<string[]> {
    const where: any = {
      section: { not: null },
    };

    if (department) {
      where.department = department;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        section: true,
      },
      distinct: ['section'],
    });

    return users
      .map((u) => u.section)
      .filter((s): s is string => s !== null)
      .sort();
  }
}
