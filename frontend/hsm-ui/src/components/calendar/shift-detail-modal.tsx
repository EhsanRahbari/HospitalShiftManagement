"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShiftAssignment } from "@/types/shift-assignment";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Briefcase, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ShiftDetailModalProps {
  assignment: ShiftAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShiftDetailModal({
  assignment,
  open,
  onOpenChange,
}: ShiftDetailModalProps) {
  if (!assignment) return null;

  const { shift, date, user } = assignment;

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case "REGULAR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "OVERTIME":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "ON_CALL":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "EMERGENCY":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "NO_SHOW":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM d, yyyy");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{shift.title}</DialogTitle>
          <DialogDescription>Shift assignment details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(date)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Time</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {/* Assigned User */}
            {user ? ( // ✅ Change to conditional rendering
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Assigned to</p>
                  <p className="text-sm text-muted-foreground">
                    {user.username} ({user.role})
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {shift.description && (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">
                  {shift.description}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className={getShiftTypeColor(shift.shiftType)}>
              {shift.shiftType}
            </Badge>
            <Badge className={getStatusColor(shift.status)}>
              {shift.status}
            </Badge>
          </div>

          {assignment.createdBy && (
            <div className="border-t pt-4 mt-4">
              <p className="text-xs text-muted-foreground">
                Assigned by {assignment.createdBy.username} on{" "}
                {format(new Date(assignment.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
