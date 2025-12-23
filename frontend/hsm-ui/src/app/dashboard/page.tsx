"use client";

import { useAuthStore } from "@/store/auth-store";
import { redirect } from "next/navigation";
import { ShiftCalendar } from "@/components/calendar/shift-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShifts } from "@/hooks/use-shifts";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { stats, fetchStats, isLoading } = useShifts();

  console.log("🔍 User Dashboard Check:", {
    isAuthenticated,
    username: user?.username,
    role: user?.role,
    userId: user?.id,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("❌ Not authenticated, redirecting to login");
      redirect("/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      console.log("🔄 Admin user, redirecting to admin dashboard");
      redirect("/dashboard/admin");
    }
  }, [user?.role]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("✅ User authenticated, fetching stats for:", user.id);
      fetchStats(user.id);
    }
  }, [isAuthenticated, user?.id]);

  // ✅ WAIT FOR USER TO LOAD BEFORE RENDERING
  if (!isAuthenticated || !user || !user.id) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  console.log("✅ User authenticated");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
        <p className="text-muted-foreground">Welcome back, {user.username}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.scheduled || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.completed || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.scheduled || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar - Only render when userId exists */}
      {user.id && <ShiftCalendar userId={user.id} showLegend={true} />}
    </div>
  );
}
