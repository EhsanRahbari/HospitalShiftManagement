export enum ShiftType {
  REGULAR = "REGULAR",
  OVERTIME = "OVERTIME",
  ON_CALL = "ON_CALL",
  EMERGENCY = "EMERGENCY",
}

export enum ShiftStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export interface Shift {
  id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  shiftType: ShiftType;
  status: ShiftStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export interface ShiftStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}
