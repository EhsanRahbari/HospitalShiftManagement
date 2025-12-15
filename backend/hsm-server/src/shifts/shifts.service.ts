import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';
import { Role } from '../../generated/client';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async create(createShiftDto: CreateShiftDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createShiftDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.shift.create({
      data: {
        ...createShiftDto,
        startTime: new Date(createShiftDto.startTime),
        endTime: new Date(createShiftDto.endTime),
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
  }

  async findAll(query: QueryShiftDto, requestUserId: string, userRole: Role) {
    const { userId, startDate, endDate, shiftType, status, page, limit } =
      query;

    const where: any = {};

    // If user is not admin, they can only see their own shifts
    if (userRole !== Role.ADMIN) {
      where.userId = requestUserId;
    } else if (userId) {
      // Admin can filter by userId
      where.userId = userId;
    }

    if (shiftType) {
      where.shiftType = shiftType;
    }

    if (status) {
      where.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.shift.findMany({
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
        skip,
        take: limit,
      }),
      this.prisma.shift.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, requestUserId: string, userRole: Role) {
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
      throw new NotFoundException('Shift not found');
    }

    // Non-admin users can only see their own shifts
    if (userRole !== Role.ADMIN && shift.userId !== requestUserId) {
      throw new ForbiddenException('Access denied');
    }

    return shift;
  }

  async update(
    id: string,
    updateShiftDto: UpdateShiftDto,
    requestUserId: string,
    userRole: Role,
  ) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Only admin can update shifts
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update shifts');
    }

    const dataToUpdate: any = { ...updateShiftDto };

    if (updateShiftDto.startTime) {
      dataToUpdate.startTime = new Date(updateShiftDto.startTime);
    }

    if (updateShiftDto.endTime) {
      dataToUpdate.endTime = new Date(updateShiftDto.endTime);
    }

    return this.prisma.shift.update({
      where: { id },
      data: dataToUpdate,
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
  }

  async remove(id: string, userRole: Role) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Only admin can delete shifts
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete shifts');
    }

    return this.prisma.shift.delete({
      where: { id },
    });
  }

  async getMyShifts(userId: string, startDate?: string, endDate?: string) {
    const where: any = {
      userId,
    };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    return this.prisma.shift.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, scheduled, completed, cancelled] = await Promise.all([
      this.prisma.shift.count({ where }),
      this.prisma.shift.count({ where: { ...where, status: 'SCHEDULED' } }),
      this.prisma.shift.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.shift.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    return {
      total,
      scheduled,
      completed,
      cancelled,
    };
  }
}
