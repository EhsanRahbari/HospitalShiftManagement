export enum ConventionType {
  AVAILABILITY = "AVAILABILITY",
  RESTRICTION = "RESTRICTION",
  LEGAL = "LEGAL",
  MEDICAL = "MEDICAL",
  CUSTOM = "CUSTOM",
}

export enum SelectionType {
  ADMIN_ASSIGNED = "ADMIN_ASSIGNED",
  USER_SELECTED = "USER_SELECTED",
}

export interface Convention {
  id: string;
  title: string;
  description?: string;
  type: ConventionType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    username: string;
    role: string;
  };
  userCount?: number;
  userConventions?: UserConvention[];
}

export interface UserConvention {
  id: string;
  userId: string;
  conventionId: string;
  assignedAt: string;
  selectionType: SelectionType;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  convention?: Convention;
  assignedBy?: {
    id: string;
    username: string;
  };
}

export interface ConventionStats {
  total: number;
  active: number;
  inactive: number;
  byType: {
    availability: number;
    restriction: number;
    legal: number;
    medical: number;
    custom: number;
  };
}

export interface UserConventionStats {
  total: number;
  adminAssigned: number;
  userSelected: number;
}

export interface CreateConventionData {
  title: string;
  description?: string;
  type: ConventionType;
  isActive?: boolean;
}

export interface UpdateConventionData {
  title?: string;
  description?: string;
  type?: ConventionType;
  isActive?: boolean;
}

export interface AssignConventionData {
  conventionIds: string[];
}

export interface UserSelectConventionData {
  conventionIds: string[];
}
