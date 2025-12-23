"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useShiftAssignments } from "@/hooks/use-shift-assignments";
import { ShiftAssignment } from "@/types/shift-assignment";
import { Card } from "@/components/ui/card";
import { Loader2, CalendarX } from "lucide-react";
import { ShiftDetailModal } from "./shift-detail-modal";

interface ShiftCalendarProps {
  userId?: string;
  showLegend?: boolean;
}

export function ShiftCalendar({
  userId,
  showLegend = true,
}: ShiftCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftAssignment | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<{
    year: number;
    month: number;
  }>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  });

  const { assignments, isLoading, error, fetchMonthlyAssignments } =
    useShiftAssignments();

  // Fetch initial month's assignments when userId is available
  useEffect(() => {
    if (!userId) return;

    console.log(
      "✅ Fetching assignments for:",
      currentMonth.year,
      currentMonth.month
    );
    fetchMonthlyAssignments(currentMonth.year, currentMonth.month, userId);
  }, [userId, currentMonth.year, currentMonth.month]);

  // Transform assignments to FullCalendar events
  const events = assignments.map((assignment) => {
    const shiftStart = new Date(assignment.shift.startTime);
    const shiftEnd = new Date(assignment.shift.endTime);
    const assignmentDate = new Date(assignment.date);

    const eventStart = new Date(assignmentDate);
    eventStart.setHours(shiftStart.getHours(), shiftStart.getMinutes(), 0, 0);

    const eventEnd = new Date(assignmentDate);
    eventEnd.setHours(shiftEnd.getHours(), shiftEnd.getMinutes(), 0, 0);

    let backgroundColor = "#3b82f6";
    let borderColor = "#2563eb";

    switch (assignment.shift.shiftType) {
      case "OVERTIME":
        backgroundColor = "#f59e0b";
        borderColor = "#d97706";
        break;
      case "ON_CALL":
        backgroundColor = "#8b5cf6";
        borderColor = "#7c3aed";
        break;
      case "EMERGENCY":
        backgroundColor = "#ef4444";
        borderColor = "#dc2626";
        break;
    }

    return {
      id: assignment.id,
      title: assignment.shift.title,
      start: eventStart,
      end: eventEnd,
      backgroundColor,
      borderColor,
      extendedProps: {
        assignment,
      },
    };
  });

  console.log("📅 Calendar Events:", {
    userId,
    currentMonth,
    assignmentsCount: assignments.length,
    eventsCount: events.length,
  });

  const handleEventClick = (info: any) => {
    const assignment = info.event.extendedProps.assignment as ShiftAssignment;
    setSelectedShift(assignment);
    setIsModalOpen(true);
  };

  // Handle manual month navigation
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.year, prev.month - 2); // month - 2 because Date uses 0-indexed months
      return {
        year: newDate.getFullYear(),
        month: newDate.getMonth() + 1,
      };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.year, prev.month); // month is already 1-indexed
      return {
        year: newDate.getFullYear(),
        month: newDate.getMonth() + 1,
      };
    });
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  };

  if (isLoading && assignments.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading calendar...
          </span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">Failed to load calendar</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showLegend && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span>Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-amber-500" />
              <span>Overtime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-purple-500" />
              <span>On-Call</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-500" />
              <span>Emergency</span>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        {assignments.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarX className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Shifts Assigned</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You don't have any shifts assigned for this month.
            </p>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={new Date(currentMonth.year, currentMonth.month - 1, 1)}
            headerToolbar={{
              left: "title",
              center: "",
              right: "prev,next today",
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }}
            // ✅ DON'T USE datesSet - control navigation manually
            customButtons={{
              prev: {
                click: handlePrevMonth,
              },
              next: {
                click: handleNextMonth,
              },
              today: {
                text: "today",
                click: handleToday,
              },
            }}
          />
        )}
      </Card>

      <ShiftDetailModal
        assignment={selectedShift}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
