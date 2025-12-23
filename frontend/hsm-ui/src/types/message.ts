export enum MessagePriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Message {
  id: string;
  title: string;
  content: string;
  priority?: MessagePriority; // Make optional if backend doesn't use it
  targetDepartments?: string[]; // Changed to array
  targetSections?: string[]; // Changed to array
  sentBy: {
    id: string;
    username: string;
    role: string;
  };
  recipients?: MessageRecipient[];
  createdAt: string;
  updatedAt: string;
  recipientInfo?: {
    isRead: boolean;
    readAt?: string;
  };
}

export interface MessageRecipient {
  id: string;
  isRead: boolean;
  readAt?: string;
  user: {
    id: string;
    username: string;
    role: string;
    department?: string;
    section?: string;
  };
}

export interface CreateMessageDto {
  title: string;
  content: string;
  targetDepartments: string[]; // Changed to array (required)
  targetSections?: string[]; // Changed to array (optional)
}

export interface MessageFilters {
  department?: string;
  section?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}
