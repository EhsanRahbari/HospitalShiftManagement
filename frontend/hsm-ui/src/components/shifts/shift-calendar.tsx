"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { getMyShifts } from "@/lib/api/shifts";
import { Shift, ShiftStatus, ShiftType } from "@/types/shift";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { Clock, Calendar as CalendarIcon } from "lucide-react";

export function ShiftCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token && date) {
      fetchShifts();
    }
  }, [token, date]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      if (!token || !date) return;

      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const data = await getMyShifts(
        token,
        start.toISOString(),
        end.toISOString()
      );
      setShifts(data);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftsForDate = (targetDate: Date) => {
    return shifts.filter((shift) =>
      isSameDay(new Date(shift.startTime), targetDate)
    );
  };

  const selectedDateShifts = date ? getShiftsForDate(date) : [];

  const getShiftTypeColor = (type: ShiftType) => {
    switch (type) {
      case ShiftType.REGULAR:
        return "bg-blue-500";
      case ShiftType.OVERTIME:
        return "bg-orange-500";
      case ShiftType.ON_CALL:
        return "bg-purple-500";
      case ShiftType.EMERGENCY:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getShiftStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.SCHEDULED:
        return "default";
      case ShiftStatus.COMPLETED:
        return "success";
      case ShiftStatus.CANCELLED:
        return "destructive";
      case ShiftStatus.NO_SHOW:
        return "secondary";
      default:
        return "default";
    }
  };

  const modifiers = {
    hasShift: (day: Date) => {
      return shifts.some((shift) => isSameDay(new Date(shift.startTime), day));
    },
  };

  const modifiersStyles = {
    hasShift: {
      fontWeight: "bold",
      textDecoration: "underline",
      color: "#3b82f6",
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Shift Calendar
          </CardTitle>
          <CardDescription>Select a date to view your shifts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          )}
        </CardContent>
      </Card>

      {/* Shift Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {date ? format(date, "MMMM d, yyyy") : "Select a date"}
          </CardTitle>
          <CardDescription>
            {selectedDateShifts.length > 0
              ? `${selectedDateShifts.length} shift${selectedDateShifts.length > 1 ? "s" : ""} scheduled`
              : "No shifts scheduled"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedDateShifts.length > 0 ? (
            <div className="space-y-4">
              {selectedDateShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div
                    className={`mt-1 h-3 w-3 rounded-full ${getShiftTypeColor(shift.shiftType)}`}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{shift.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {format(new Date(shift.startTime), "h:mm a")} -{" "}
                          {format(new Date(shift.endTime), "h:mm a")}
                        </div>
                      </div>
                      <Badge variant={getShiftStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
                    </div>
                    {shift.description && (
                      <p className="text-sm text-muted-foreground">
                        {shift.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {shift.shiftType}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
              <div>
                <CalendarIcon className="mx-auto h-8 w-8 opacity-50" />
                <p className="mt-2 text-sm">
                  No shifts scheduled for this date
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
