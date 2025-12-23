import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConventionValidatorService } from '../common/services/convention-validator.service';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto';
import { GetShiftAssignmentsDto } from './dto/get-shift-assignments.dto';

@Injectable()
export class ShiftAssignmentsService {
  constructor(
    private prisma: PrismaService,
    private conventionValidator: ConventionValidatorService,
  ) {}

  /**
   * Create a new shift assignment with convention validation
   */
  async create(dto: CreateShiftAssignmentDto, adminId: string) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Cannot assign shifts to inactive user');
    }

    // Verify shift exists
    const shift = await this.prisma.shift.findUnique({
      where: { id: dto.shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Parse date
    const assignmentDate = new Date(dto.date);
    assignmentDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Validate against user's conventions
    const validation = await this.conventionValidator.validateShiftAssignment(
      dto.userId,
      dto.shiftId,
      assignmentDate,
    );

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Shift assignment violates user conventions',
        violations: validation.violations,
      });
    }

    // Check for duplicate assignment
    const existing = await this.prisma.shiftAssignment.findUnique({
      where: {
        userId_shiftId_date: {
          userId: dto.userId,
          shiftId: dto.shiftId,
          date: assignmentDate,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'This shift is already assigned to the user on this date',
      );
    }

    // Create assignment
    return this.prisma.shiftAssignment.create({
      data: {
        userId: dto.userId,
        shiftId: dto.shiftId,
        date: assignmentDate,
        createdById: adminId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        shift: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Get shift assignments with optional filters
   */
  async findAll(
    query: GetShiftAssignmentsDto,
    requestUserId: string,
    isAdmin: boolean,
  ) {
    const { startDate, endDate, userId } = query;

    // Non-admin users can only see their own assignments
    const targetUserId = isAdmin && userId ? userId : requestUserId;

    const where: any = {
      userId: targetUserId,
    };

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    return this.prisma.shiftAssignment.findMany({
      where,
      include: {
        shift: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  /**
   * Get a single shift assignment by ID
   */
  async findOne(id: string, requestUserId: string, isAdmin: boolean) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id },
      include: {
        shift: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Shift assignment not found');
    }

    // Non-admin users can only see their own assignments
    if (!isAdmin && assignment.userId !== requestUserId) {
      throw new ForbiddenException(
        'You can only view your own shift assignments',
      );
    }

    return assignment;
  }

  /**
   * Update shift assignment (only date can be changed)
   */
  async update(id: string, dto: UpdateShiftAssignmentDto, adminId: string) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Shift assignment not found');
    }

    if (dto.date) {
      const newDate = new Date(dto.date);
      newDate.setHours(0, 0, 0, 0);

      // Validate new date against conventions
      const validation = await this.conventionValidator.validateShiftAssignment(
        assignment.userId,
        assignment.shiftId,
        newDate,
      );

      if (!validation.isValid) {
        throw new BadRequestException({
          message: 'New date violates user conventions',
          violations: validation.violations,
        });
      }

      return this.prisma.shiftAssignment.update({
        where: { id },
        data: {
          date: newDate,
        },
        include: {
          shift: true,
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });
    }

    return assignment;
  }

  /**
   * Delete shift assignment
   */
  async remove(id: string, requestUserId: string, isAdmin: boolean) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Shift assignment not found');
    }

    // Only admin can delete assignments
    if (!isAdmin) {
      throw new ForbiddenException(
        'Only administrators can delete shift assignments',
      );
    }

    await this.prisma.shiftAssignment.delete({
      where: { id },
    });

    return { message: 'Shift assignment deleted successfully' };
  }

  /**
   * Get user's shift assignments for a specific month (for calendar view)
   */
  async getMonthlyAssignments(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.shiftAssignment.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        shift: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  /**
   * Bulk create shift assignments
   */
  async bulkCreate(assignments: CreateShiftAssignmentDto[], adminId: string) {
    const results = {
      successful: [],
      failed: [],
    };

    for (const dto of assignments) {
      try {
        const assignment = await this.create(dto, adminId);
        results.successful.push(assignment);
      } catch (error) {
        results.failed.push({
          assignment: dto,
          error: error.message,
        });
      }
    }

    return results;
  }
}
