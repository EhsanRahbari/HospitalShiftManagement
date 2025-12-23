"use client";

import { useAuthStore } from "@/store/auth-store";
import { redirect, useSearchParams } from "next/navigation";
import { ShiftCalendar } from "@/components/calendar/shift-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShifts } from "@/hooks/use-shifts";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMessagesView } from "@/components/messages/user-messages-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar } from "lucide-react";

export default function UserDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { stats, fetchStats, isLoading } = useShifts();
  const searchParams = useSearchParams();

  // Handle tab from URL or default to schedule
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "schedule");

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

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.username}</p>
      </div>

      {/* Tabs for Schedule and Messages */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            My Schedule
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab - Your Existing Content */}
        <TabsContent value="schedule" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Shifts
                </CardTitle>
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
        </TabsContent>

        {/* Messages Tab - New */}
        <TabsContent value="messages" className="space-y-6">
          <UserMessagesView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
