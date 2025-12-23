export interface ShiftAssignment {
  id: string;
  userId: string;
  shiftId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
  shift: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    shiftType: string;
    status: string;
    department?: string;
  };
  createdBy?: {
    id: string;
    username: string;
  };
}

export interface CreateShiftAssignmentData {
  userId: string;
  shiftId: string;
  date: string;
}

export interface GetShiftAssignmentsParams {
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface BulkCreateResult {
  successful: ShiftAssignment[];
  failed: Array<{
    assignment: CreateShiftAssignmentData;
    error: string;
  }>;
}

export interface ValidationViolation {
  message: string;
  violations: string[];
}
