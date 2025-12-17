import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';
import { Role, ShiftStatus, ShiftType } from '../../generated/client';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createShiftDto: CreateShiftDto) {
    const { startTime, endTime, userId, ...rest } = createShiftDto;

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    // Verify user exists and is staff (DOCTOR or NURSE)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Cannot assign shift to inactive user');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot assign shifts to admin users');
    }

    // Check for overlapping shifts
    const overlapping = await this.prisma.shift.findFirst({
      where: {
        userId,
        status: { not: ShiftStatus.CANCELLED },
        OR: [
          {
            AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
          },
          {
            AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
          },
          {
            AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        `User already has a shift scheduled during this time (${overlapping.title})`,
      );
    }

    const shift = await this.prisma.shift.create({
      data: {
        ...rest,
        userId,
        startTime: start,
        endTime: end,
        shiftType: rest.shiftType || ShiftType.REGULAR,
        status: rest.status || ShiftStatus.SCHEDULED,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    console.log('✅ Shift created:', shift.title, 'for', user.username);

    return shift;
  }

  async findAll(
    query: QueryShiftDto,
    requestUserId: string,
    requestUserRole: Role,
  ) {
    const {
      page = 1,
      limit = 10,
      userId,
      status,
      shiftType,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Non-admin users can only see their own shifts
    if (requestUserRole !== Role.ADMIN) {
      where.userId = requestUserId;
    } else if (userId) {
      // Admin can filter by userId
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (shiftType) {
      where.shiftType = shiftType;
    }

    if (startDate || endDate) {
      where.AND = [];

      if (startDate) {
        where.AND.push({ startTime: { gte: new Date(startDate) } });
      }

      if (endDate) {
        where.AND.push({ endTime: { lte: new Date(endDate) } });
      }
    }

    const [shifts, total] = await Promise.all([
      this.prisma.shift.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      }),
      this.prisma.shift.count({ where }),
    ]);

    console.log(`📋 Found ${shifts.length} shifts out of ${total} total`);

    return {
      data: shifts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyShifts(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.AND = [];

      if (startDate) {
        where.AND.push({ startTime: { gte: new Date(startDate) } });
      }

      if (endDate) {
        where.AND.push({ endTime: { lte: new Date(endDate) } });
      }
    }

    const shifts = await this.prisma.shift.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    console.log(`📅 Found ${shifts.length} shifts for user`);

    return shifts;
  }

  async findOne(id: string, requestUserId: string, requestUserRole: Role) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    // Non-admin users can only view their own shifts
    if (requestUserRole !== Role.ADMIN && shift.userId !== requestUserId) {
      throw new ForbiddenException('You can only view your own shifts');
    }

    return shift;
  }

  async update(
    id: string,
    updateShiftDto: UpdateShiftDto,
    requestUserId: string,
    requestUserRole: Role,
  ) {
    // Check if shift exists
    const existingShift = await this.prisma.shift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    // Only admin can update shifts
    if (requestUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update shifts');
    }

    const { startTime, endTime, userId, ...rest } = updateShiftDto;

    // Validate time range if both provided
    const start = startTime ? new Date(startTime) : existingShift.startTime;
    const end = endTime ? new Date(endTime) : existingShift.endTime;

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check if user exists if userId is provided
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isActive: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.isActive) {
        throw new BadRequestException('Cannot assign shift to inactive user');
      }

      if (user.role === Role.ADMIN) {
        throw new BadRequestException('Cannot assign shifts to admin users');
      }

      // Check for overlapping shifts (excluding current shift)
      const overlapping = await this.prisma.shift.findFirst({
        where: {
          id: { not: id },
          userId,
          status: { not: ShiftStatus.CANCELLED },
          OR: [
            {
              AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
            },
            {
              AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
            },
            {
              AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          `User already has a shift scheduled during this time (${overlapping.title})`,
        );
      }
    }

    const updateData: any = { ...rest };

    if (startTime) updateData.startTime = start;
    if (endTime) updateData.endTime = end;
    if (userId) updateData.userId = userId;

    const shift = await this.prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    console.log('✅ Shift updated:', shift.title);

    return shift;
  }

  async remove(id: string, requestUserRole: Role) {
    // Check if shift exists
    const shift = await this.prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    // Only admin can delete shifts
    if (requestUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete shifts');
    }

    // Soft delete - set status to CANCELLED
    const updatedShift = await this.prisma.shift.update({
      where: { id },
      data: { status: ShiftStatus.CANCELLED },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    console.log('✅ Shift cancelled:', updatedShift.title);

    return { message: 'Shift cancelled successfully', shift: updatedShift };
  }

  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, scheduled, completed, cancelled, noShow] = await Promise.all([
      this.prisma.shift.count({ where }),
      this.prisma.shift.count({
        where: { ...where, status: ShiftStatus.SCHEDULED },
      }),
      this.prisma.shift.count({
        where: { ...where, status: ShiftStatus.COMPLETED },
      }),
      this.prisma.shift.count({
        where: { ...where, status: ShiftStatus.CANCELLED },
      }),
      this.prisma.shift.count({
        where: { ...where, status: ShiftStatus.NO_SHOW },
      }),
    ]);

    const byType = await this.prisma.shift.groupBy({
      by: ['shiftType'],
      _count: true,
      where: { ...where, status: ShiftStatus.SCHEDULED },
    });

    const stats = {
      total,
      scheduled,
      completed,
      cancelled,
      noShow,
      byType: {
        regular:
          byType.find((t) => t.shiftType === ShiftType.REGULAR)?._count || 0,
        overtime:
          byType.find((t) => t.shiftType === ShiftType.OVERTIME)?._count || 0,
        onCall:
          byType.find((t) => t.shiftType === ShiftType.ON_CALL)?._count || 0,
        emergency:
          byType.find((t) => t.shiftType === ShiftType.EMERGENCY)?._count || 0,
      },
    };

    console.log('📊 Stats calculated:', stats);

    return stats;
  }
}
