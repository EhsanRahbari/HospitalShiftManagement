"use client";

import { useAuthStore } from "@/store/auth-store";
import { redirect, useSearchParams } from "next/navigation";
import { ShiftCalendar } from "@/components/calendar/shift-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useShifts } from "@/hooks/use-shifts";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMessagesView } from "@/components/messages/user-messages-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function UserDashboardPage() {
  const { user, isAuthenticated, token } = useAuthStore();
  const { stats, fetchStats, isLoading } = useShifts();
  const searchParams = useSearchParams();

  // Handle tab from URL or default to schedule
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "schedule");

  // ✅ Local state for unread count
  const [unreadCount, setUnreadCount] = useState(0);

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

  // ✅ Fetch unread count directly
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token || !user || user.role === "ADMIN") {
        console.log("⏭️ Skipping unread count (admin or no token)");
        setUnreadCount(0);
        return;
      }

      try {
        console.log("🔔 Fetching unread count from API...");
        const response = await fetch(`${API_URL}/messages/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("🔔 Unread count response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("🔔 Unread count API response:", data);

          // ✅ FIX: Handle both {count: X} and {unreadCount: X} formats
          const count = data.count ?? data.unreadCount ?? 0;
          console.log("🔔 Setting unread count to:", count);
          setUnreadCount(count);
        } else {
          console.error("❌ Failed to fetch unread count:", response.status);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("❌ Error fetching unread count:", error);
        setUnreadCount(0);
      }
    };

    // Only fetch if user is authenticated and not admin
    if (isAuthenticated && user && user.role !== "ADMIN") {
      fetchUnreadCount();

      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, user, isAuthenticated]);

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // ✅ Log unread count changes
  useEffect(() => {
    console.log("🔔 Unread count state updated to:", unreadCount);
  }, [unreadCount]);

  // ✅ WAIT FOR USER TO LOAD BEFORE RENDERING
  if (!isAuthenticated || !user || !user.id) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.username}</p>
      </div>

      {/* ✅ DEBUG INFO - Remove this after testing */}
      <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2 rounded text-sm">
        Debug: Unread count = {unreadCount} | Role = {user.role}
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
          <TabsTrigger
            value="messages"
            className="flex items-center gap-2 relative"
          >
            <MessageSquare className="h-4 w-4" />
            Messages
            {/* ✅ Show badge when unreadCount > 0 */}
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 min-w-[20px] rounded-full px-1.5 text-xs font-semibold"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
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
