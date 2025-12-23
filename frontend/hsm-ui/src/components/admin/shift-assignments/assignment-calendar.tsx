"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShiftCalendar } from "@/components/calendar/shift-calendar";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";

export function AssignmentsCalendar() {
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const { users, fetchUsers } = useUsers();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const activeUsers = users.filter((u) => u.isActive);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>
            View shift assignments across all users or filter by specific user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Filter by User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {activeUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <ShiftCalendar
        userId={selectedUserId === "all" ? undefined : selectedUserId}
        showLegend={true}
      />
    </div>
  );
}
