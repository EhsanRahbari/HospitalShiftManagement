"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsers } from "@/hooks/use-users";
import { useShifts } from "@/hooks/use-shifts";
import { useShiftAssignments } from "@/hooks/use-shift-assignments";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AssignmentFormData {
  userId: string;
  shiftId: string;
  date: Date;
}

export function AssignShiftForm() {
  const [date, setDate] = useState<Date>();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    violations: string[];
  } | null>(null);

  const { users, getAllUsers } = useUsers();
  const { shifts, getAllShifts } = useShifts();
  const { createAssignment, isLoading } = useShiftAssignments();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      getAllUsers();
      getAllShifts();
    }
  }, [token]);

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedShift = shifts.find((s) => s.id === selectedShiftId);

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedShiftId || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createAssignment({
        userId: selectedUserId,
        shiftId: selectedShiftId,
        date: date.toISOString(),
      });

      toast.success("Shift assigned successfully!", {
        description: `${selectedShift?.title} assigned to ${selectedUser?.username}`,
      });

      // Reset form
      setSelectedUserId("");
      setSelectedShiftId("");
      setDate(undefined);
      setValidationResult(null);
    } catch (error: any) {
      // Check if it's a convention violation
      if (error.message.includes("violates") && error.violations) {
        setValidationResult({
          isValid: false,
          violations: error.violations,
        });
        toast.error("Cannot assign shift", {
          description: "Shift violates user's conventions",
        });
      } else {
        toast.error("Failed to assign shift", {
          description: error.message,
        });
      }
    }
  };

  const activeUsers = users.filter((u) => u.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Shift to User</CardTitle>
        <CardDescription>
          Select a user, shift, and date. The system will validate against
          user's conventions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Selection */}
        <div className="space-y-2">
          <Label htmlFor="user">User</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger id="user">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {activeUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>{user.username}</span>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Show user's conventions if selected */}
        {selectedUser &&
          selectedUser.userConventions &&
          selectedUser.userConventions.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">
                    User has {selectedUser.userConventions.length}{" "}
                    convention(s):
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedUser.userConventions.map((uc: any) => (
                      <li key={uc.id}>
                        {uc.convention.title}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {uc.selectionType === "USER_SELECTED"
                            ? "Preference"
                            : "Required"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* Shift Selection */}
        <div className="space-y-2">
          <Label htmlFor="shift">Shift</Label>
          <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
            <SelectTrigger id="shift">
              <SelectValue placeholder="Select a shift" />
            </SelectTrigger>
            <SelectContent>
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  <div className="flex items-center gap-2">
                    <span>{shift.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(shift.startTime), "h:mm a")} -{" "}
                      {format(new Date(shift.endTime), "h:mm a")}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Assignment Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Validation Result */}
        {validationResult && !validationResult.isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Convention Violations:</p>
                <ul className="list-disc list-inside text-sm">
                  {validationResult.violations.map((violation, index) => (
                    <li key={index}>{violation}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedUserId || !selectedShiftId || !date || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Assign Shift
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
