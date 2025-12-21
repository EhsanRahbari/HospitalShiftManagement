import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';
import {
  AssignConventionDto,
  RemoveConventionDto,
} from './dto/assign-convention.dto';
import { QueryConventionDto } from './dto/query-convention.dto';
import { Role } from '../../generated/client';

@Injectable()
export class ConventionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CONVENTION CRUD ====================

  async create(createConventionDto: CreateConventionDto, createdById: string) {
    const convention = await this.prisma.convention.create({
      data: {
        ...createConventionDto,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    console.log('✅ Convention created:', convention.title);

    return convention;
  }

  async findAll(query: QueryConventionDto) {
    const { page = 1, limit = 10, type, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [conventions, total] = await Promise.all([
      this.prisma.convention.findMany({
        skip,
        take: limit,
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
          userConventions: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.convention.count({ where }),
    ]);

    // Add user count to each convention
    const conventionsWithCount = conventions.map((convention) => ({
      ...convention,
      userCount: convention.userConventions.length,
    }));

    console.log(
      `📋 Found ${conventions.length} conventions out of ${total} total`,
    );

    return {
      data: conventionsWithCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const convention = await this.prisma.convention.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        userConventions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!convention) {
      throw new NotFoundException(`Convention with ID ${id} not found`);
    }

    return convention;
  }

  async update(id: string, updateConventionDto: UpdateConventionDto) {
    // Check if convention exists
    const existingConvention = await this.prisma.convention.findUnique({
      where: { id },
    });

    if (!existingConvention) {
      throw new NotFoundException(`Convention with ID ${id} not found`);
    }

    const convention = await this.prisma.convention.update({
      where: { id },
      data: updateConventionDto,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    console.log('✅ Convention updated:', convention.title);

    return convention;
  }

  async remove(id: string) {
    // Check if convention exists
    const convention = await this.prisma.convention.findUnique({
      where: { id },
      include: {
        userConventions: true,
      },
    });

    if (!convention) {
      throw new NotFoundException(`Convention with ID ${id} not found`);
    }

    // Check if convention is assigned to any users
    if (convention.userConventions.length > 0) {
      throw new BadRequestException(
        `Cannot delete convention "${convention.title}" because it is assigned to ${convention.userConventions.length} user(s). Please remove all assignments first.`,
      );
    }

    // Soft delete - set isActive to false
    const updatedConvention = await this.prisma.convention.update({
      where: { id },
      data: { isActive: false },
    });

    console.log('✅ Convention deactivated:', updatedConvention.title);

    return {
      message: 'Convention deactivated successfully',
      convention: updatedConvention,
    };
  }

  async hardDelete(id: string) {
    // Check if convention exists
    const convention = await this.prisma.convention.findUnique({
      where: { id },
      include: {
        userConventions: true,
      },
    });

    if (!convention) {
      throw new NotFoundException(`Convention with ID ${id} not found`);
    }

    // Check if convention is assigned to any users
    if (convention.userConventions.length > 0) {
      throw new BadRequestException(
        `Cannot delete convention "${convention.title}" because it is assigned to ${convention.userConventions.length} user(s). Please remove all assignments first.`,
      );
    }

    await this.prisma.convention.delete({
      where: { id },
    });

    console.log('✅ Convention permanently deleted:', convention.title);

    return { message: 'Convention deleted permanently' };
  }

  // ==================== USER-CONVENTION ASSIGNMENT ====================

  async assignConventionsToUser(
    userId: string,
    assignConventionDto: AssignConventionDto,
    assignedById: string,
  ) {
    // Verify user exists and is staff
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException(
        'Cannot assign conventions to inactive user',
      );
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot assign conventions to admin users');
    }

    // Verify all conventions exist and are active
    const conventions = await this.prisma.convention.findMany({
      where: {
        id: { in: assignConventionDto.conventionIds },
      },
    });

    if (conventions.length !== assignConventionDto.conventionIds.length) {
      throw new NotFoundException('One or more conventions not found');
    }

    const inactiveConventions = conventions.filter((c) => !c.isActive);
    if (inactiveConventions.length > 0) {
      throw new BadRequestException(
        `Cannot assign inactive conventions: ${inactiveConventions.map((c) => c.title).join(', ')}`,
      );
    }

    // Get existing assignments
    const existingAssignments = await this.prisma.userConvention.findMany({
      where: {
        userId,
        conventionId: { in: assignConventionDto.conventionIds },
      },
    });

    const existingConventionIds = existingAssignments.map(
      (a) => a.conventionId,
    );
    const newConventionIds = assignConventionDto.conventionIds.filter(
      (id) => !existingConventionIds.includes(id),
    );

    if (newConventionIds.length === 0) {
      throw new BadRequestException(
        'All conventions are already assigned to this user',
      );
    }

    // Create new assignments
    const assignments = await this.prisma.$transaction(
      newConventionIds.map((conventionId) =>
        this.prisma.userConvention.create({
          data: {
            userId,
            conventionId,
            assignedById,
          },
          include: {
            convention: true,
            user: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        }),
      ),
    );

    console.log(
      `✅ Assigned ${assignments.length} conventions to ${user.username}`,
    );

    return assignments;
  }

  async removeConventionFromUser(userId: string, conventionId: string) {
    // Verify assignment exists
    const assignment = await this.prisma.userConvention.findFirst({
      where: {
        userId,
        conventionId,
      },
      include: {
        convention: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Convention assignment not found');
    }

    await this.prisma.userConvention.delete({
      where: {
        id: assignment.id,
      },
    });

    console.log(
      `✅ Removed convention "${assignment.convention.title}" from ${assignment.user.username}`,
    );

    return {
      message: 'Convention removed from user successfully',
      convention: assignment.convention,
    };
  }

  async getUserConventions(userId: string) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const assignments = await this.prisma.userConvention.findMany({
      where: { userId },
      include: {
        convention: true,
        assignedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    console.log(
      `📋 Found ${assignments.length} conventions for ${user.username}`,
    );

    return assignments;
  }

  // ==================== STATISTICS ====================

  async getStats() {
    const [total, active, inactive, byType] = await Promise.all([
      this.prisma.convention.count(),
      this.prisma.convention.count({ where: { isActive: true } }),
      this.prisma.convention.count({ where: { isActive: false } }),
      this.prisma.convention.groupBy({
        by: ['type'],
        _count: true,
        where: { isActive: true },
      }),
    ]);

    const stats = {
      total,
      active,
      inactive,
      byType: {
        availability:
          byType.find((t) => t.type === 'AVAILABILITY')?._count || 0,
        restriction: byType.find((t) => t.type === 'RESTRICTION')?._count || 0,
        legal: byType.find((t) => t.type === 'LEGAL')?._count || 0,
        medical: byType.find((t) => t.type === 'MEDICAL')?._count || 0,
        custom: byType.find((t) => t.type === 'CUSTOM')?._count || 0,
      },
    };

    console.log('📊 Convention stats calculated:', stats);

    return stats;
  }
  // ==================== USER CONVENTION SELECTION ====================

  /**
   * Get all active conventions available for user selection
   */
  async getAvailableConventions() {
    const conventions = await this.prisma.convention.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ type: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log(
      `📋 Found ${conventions.length} available conventions for user selection`,
    );

    return conventions;
  }

  /**
   * Get conventions selected by the current user (both admin-assigned and user-selected)
   */
  async getMyConventions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const assignments = await this.prisma.userConvention.findMany({
      where: { userId },
      include: {
        convention: true,
        assignedBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: [
        { selectionType: 'asc' }, // ADMIN_ASSIGNED first
        { assignedAt: 'desc' },
      ],
    });

    console.log(
      `📋 Found ${assignments.length} conventions for user ${user.username}`,
    );

    return assignments;
  }

  /**
   * User selects conventions for themselves
   */
  async selectConventionsForSelf(userId: string, conventionIds: string[]) {
    // Verify user exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException(
        'Your account is inactive. Please contact an administrator.',
      );
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException(
        'Admin users cannot select conventions for themselves. Use admin assignment instead.',
      );
    }

    // Verify all conventions exist and are active
    const conventions = await this.prisma.convention.findMany({
      where: {
        id: { in: conventionIds },
      },
    });

    if (conventions.length !== conventionIds.length) {
      throw new NotFoundException('One or more conventions not found');
    }

    const inactiveConventions = conventions.filter((c) => !c.isActive);
    if (inactiveConventions.length > 0) {
      throw new BadRequestException(
        `Cannot select inactive conventions: ${inactiveConventions.map((c) => c.title).join(', ')}`,
      );
    }

    // Check for existing assignments
    const existingAssignments = await this.prisma.userConvention.findMany({
      where: {
        userId,
        conventionId: { in: conventionIds },
      },
    });

    const existingConventionIds = existingAssignments.map(
      (a) => a.conventionId,
    );
    const newConventionIds = conventionIds.filter(
      (id) => !existingConventionIds.includes(id),
    );

    if (newConventionIds.length === 0) {
      throw new BadRequestException(
        'All selected conventions are already assigned to you',
      );
    }

    // Create new user selections
    const assignments = await this.prisma.$transaction(
      newConventionIds.map((conventionId) =>
        this.prisma.userConvention.create({
          data: {
            userId,
            conventionId,
            selectionType: 'USER_SELECTED',
            assignedById: userId, // User assigned to themselves
          },
          include: {
            convention: true,
            user: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
          },
        }),
      ),
    );

    console.log(
      `✅ User ${user.username} selected ${assignments.length} conventions`,
    );

    return assignments;
  }

  /**
   * User removes their own selected convention
   * Cannot remove admin-assigned conventions
   */
  async removeMyConvention(userId: string, conventionId: string) {
    // Verify assignment exists
    const assignment = await this.prisma.userConvention.findFirst({
      where: {
        userId,
        conventionId,
      },
      include: {
        convention: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Convention assignment not found');
    }

    // Check if user is trying to remove admin-assigned convention
    if (assignment.selectionType === 'ADMIN_ASSIGNED') {
      throw new ForbiddenException(
        `Cannot remove admin-assigned convention "${assignment.convention.title}". Please contact an administrator.`,
      );
    }

    // Delete the assignment
    await this.prisma.userConvention.delete({
      where: {
        id: assignment.id,
      },
    });

    console.log(
      `✅ User ${assignment.user.username} removed convention "${assignment.convention.title}"`,
    );

    return {
      message: 'Convention removed successfully',
      convention: assignment.convention,
    };
  }

  /**
   * Get statistics about user convention selections
   */
  async getUserConventionStats(userId: string) {
    const [total, adminAssigned, userSelected] = await Promise.all([
      this.prisma.userConvention.count({
        where: { userId },
      }),
      this.prisma.userConvention.count({
        where: {
          userId,
          selectionType: 'ADMIN_ASSIGNED',
        },
      }),
      this.prisma.userConvention.count({
        where: {
          userId,
          selectionType: 'USER_SELECTED',
        },
      }),
    ]);

    return {
      total,
      adminAssigned,
      userSelected,
    };
  }
}
