import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConventionType } from '../../../generated/client';

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  warnings: string[];
}

@Injectable()
export class ConventionValidatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validates if a shift assignment violates user's conventions
   * @param userId - User to validate
   * @param shiftId - Shift being assigned
   * @param date - Date of assignment
   * @returns ValidationResult with violations and warnings
   */
  async validateShiftAssignment(
    userId: string,
    shiftId: string,
    date: Date,
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      violations: [],
      warnings: [],
    };

    // Get user's conventions
    const userConventions = await this.prisma.userConvention.findMany({
      where: { userId },
      include: {
        convention: true,
      },
    });

    if (userConventions.length === 0) {
      return result; // No conventions to validate
    }

    // Get shift details
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      result.isValid = false;
      result.violations.push('Shift not found');
      return result;
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const shiftStart = new Date(shift.startTime);
    const shiftEnd = new Date(shift.endTime);
    const shiftHour = shiftStart.getHours();

    // Validate each convention
    for (const uc of userConventions) {
      const convention = uc.convention;
      const title = convention.title.toLowerCase();
      const description = convention.description?.toLowerCase() || '';
      const combinedText = `${title} ${description}`;

      // Check for weekend restrictions
      if (this.containsKeyword(combinedText, ['weekend', 'weekends'])) {
        if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
          result.violations.push(
            `Convention "${convention.title}" restricts weekend work`,
          );
        }
      }

      // Check for specific day restrictions
      const days = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      for (const day of days) {
        if (
          this.containsKeyword(combinedText, [day]) &&
          this.containsKeyword(combinedText, [
            'cannot',
            'no',
            'restrict',
            'unavailable',
          ])
        ) {
          if (dayOfWeek.toLowerCase() === day) {
            result.violations.push(
              `Convention "${convention.title}" restricts work on ${day}`,
            );
          }
        }
      }

      // Check for night shift restrictions
      if (
        this.containsKeyword(combinedText, [
          'night',
          'overnight',
          'late evening',
        ])
      ) {
        if (shiftHour >= 22 || shiftHour < 6) {
          result.violations.push(
            `Convention "${convention.title}" restricts night shifts`,
          );
        }
      }

      // Check for morning shift restrictions
      if (this.containsKeyword(combinedText, ['morning', 'early'])) {
        if (shiftHour >= 5 && shiftHour < 12) {
          if (
            this.containsKeyword(combinedText, ['cannot', 'no', 'restrict'])
          ) {
            result.violations.push(
              `Convention "${convention.title}" restricts morning shifts`,
            );
          }
        }
      }

      // Check for afternoon/evening restrictions
      if (this.containsKeyword(combinedText, ['afternoon', 'evening'])) {
        if (shiftHour >= 12 && shiftHour < 22) {
          if (
            this.containsKeyword(combinedText, ['cannot', 'no', 'restrict'])
          ) {
            result.violations.push(
              `Convention "${convention.title}" restricts afternoon/evening shifts`,
            );
          }
        }
      }

      // Check for consecutive shift restrictions
      if (
        this.containsKeyword(combinedText, [
          'consecutive',
          'back-to-back',
          'double',
        ])
      ) {
        const hasAdjacentShift = await this.hasAdjacentShift(userId, date);
        if (hasAdjacentShift) {
          result.violations.push(
            `Convention "${convention.title}" restricts consecutive shifts`,
          );
        }
      }

      // Check max hours per week
      const maxHoursMatch = combinedText.match(/(\d+)\s*hours?\s*per\s*week/);
      if (maxHoursMatch) {
        const maxHours = parseInt(maxHoursMatch[1]);
        const weeklyHours = await this.getWeeklyHours(userId, date);
        const shiftDuration =
          (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

        if (weeklyHours + shiftDuration > maxHours) {
          result.violations.push(
            `Convention "${convention.title}" limits to ${maxHours} hours/week. Current: ${weeklyHours}h, Adding: ${shiftDuration}h`,
          );
        }
      }

      // Check max shifts per week
      const maxShiftsMatch = combinedText.match(/(\d+)\s*shifts?\s*per\s*week/);
      if (maxShiftsMatch) {
        const maxShifts = parseInt(maxShiftsMatch[1]);
        const weeklyShifts = await this.getWeeklyShifts(userId, date);

        if (weeklyShifts >= maxShifts) {
          result.violations.push(
            `Convention "${convention.title}" limits to ${maxShifts} shifts/week. Current: ${weeklyShifts}`,
          );
        }
      }
    }

    result.isValid = result.violations.length === 0;
    return result;
  }

  /**
   * Check if text contains any of the keywords
   */
  private containsKeyword(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Check if user has shifts on adjacent days
   */
  private async hasAdjacentShift(userId: string, date: Date): Promise<boolean> {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const adjacentShifts = await this.prisma.shiftAssignment.findFirst({
      where: {
        userId,
        date: {
          in: [yesterday, tomorrow],
        },
      },
    });

    return !!adjacentShifts;
  }

  /**
   * Calculate total hours worked in the week containing the given date
   */
  private async getWeeklyHours(userId: string, date: Date): Promise<number> {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const assignments = await this.prisma.shiftAssignment.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      include: {
        shift: true,
      },
    });

    let totalHours = 0;
    for (const assignment of assignments) {
      const start = new Date(assignment.shift.startTime);
      const end = new Date(assignment.shift.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
    }

    return totalHours;
  }

  /**
   * Count shifts in the week containing the given date
   */
  private async getWeeklyShifts(userId: string, date: Date): Promise<number> {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return await this.prisma.shiftAssignment.count({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  private getWeekStart(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }
}
