"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsers } from "@/hooks/use-users";
import { useShifts } from "@/hooks/use-shifts";
import { useShiftAssignments } from "@/hooks/use-shift-assignments";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function BulkAssignForm() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [result, setResult] = useState<any>(null);

  const { users, getAllUsers } = useUsers();
  const { shifts, getAllShifts } = useShifts();
  const { bulkCreateAssignments, isLoading } = useShiftAssignments();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      getAllUsers();
      getAllShifts();
    }
  }, [token]);

  const handleShiftToggle = (shiftId: string) => {
    setSelectedShiftIds((prev) =>
      prev.includes(shiftId)
        ? prev.filter((id) => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  const handleSubmit = async () => {
    if (
      !selectedUserId ||
      selectedShiftIds.length === 0 ||
      !startDate ||
      !endDate
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (startDate > endDate) {
      toast.error("End date must be after start date");
      return;
    }

    // Generate assignments for each day in range
    const assignments = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      selectedShiftIds.forEach((shiftId) => {
        assignments.push({
          userId: selectedUserId,
          shiftId,
          date: new Date(currentDate).toISOString(),
        });
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    try {
      const result = await bulkCreateAssignments(assignments);
      setResult(result);

      if (result.failed.length === 0) {
        toast.success("All assignments created successfully!", {
          description: `${result.successful.length} shift(s) assigned`,
        });
      } else {
        toast.warning("Some assignments failed", {
          description: `${result.successful.length} succeeded, ${result.failed.length} failed`,
        });
      }
    } catch (error: any) {
      toast.error("Bulk assignment failed", {
        description: error.message,
      });
    }
  };

  const activeUsers = users.filter((u) => u.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Assign Shifts</CardTitle>
        <CardDescription>
          Assign multiple shifts to a user across a date range
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Selection */}
        <div className="space-y-2">
          <Label>User</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {activeUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.username} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shift Selection */}
        <div className="space-y-2">
          <Label>Shifts (select multiple)</Label>
          <div className="border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex items-center space-x-2">
                <Checkbox
                  id={shift.id}
                  checked={selectedShiftIds.includes(shift.id)}
                  onCheckedChange={() => handleShiftToggle(shift.id)}
                />
                <label
                  htmlFor={shift.id}
                  className="flex-1 flex items-center justify-between cursor-pointer"
                >
                  <span>{shift.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {format(new Date(shift.startTime), "h:mm a")} -{" "}
                    {format(new Date(shift.endTime), "h:mm a")}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
          {selectedShiftIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedShiftIds.length} shift(s) selected
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    (startDate ? date < startDate : false)
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Result */}
        {result && (
          <Alert variant={result.failed.length > 0 ? "destructive" : "default"}>
            {result.failed.length === 0 ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  ✅ {result.successful.length} assignments created
                </p>
                {result.failed.length > 0 && (
                  <div>
                    <p className="font-medium text-destructive">
                      ❌ {result.failed.length} assignments failed:
                    </p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {result.failed
                        .slice(0, 5)
                        .map((failure: any, idx: number) => (
                          <li key={idx}>{failure.error}</li>
                        ))}
                      {result.failed.length > 5 && (
                        <li>... and {result.failed.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={
            !selectedUserId ||
            selectedShiftIds.length === 0 ||
            !startDate ||
            !endDate ||
            isLoading
          }
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Create Bulk Assignments"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
