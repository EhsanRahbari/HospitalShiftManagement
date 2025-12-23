"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Stethoscope,
  HeartPulse,
  CalendarClock,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignShiftForm } from "@/components/admin/shift-assignments/assign-shift-form";
import { AssignmentsList } from "@/components/admin/shift-assignments/assignment-list";
import { AssignmentsCalendar } from "@/components/admin/shift-assignments/assignment-calendar";
import { BulkAssignForm } from "@/components/admin/shift-assignments/bulk-assign-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Import messaging components
import { useMessages } from "@/hooks/use-messages";
import { Message, MessageFilters } from "@/types/message";
import { CreateMessageDialog } from "@/components/messages/create-message-dialog";
import { MessagesTable } from "@/components/messages/messages-table";
import { MessagesFilters } from "@/components/messages/messages-filters";
import { MessageDetailDialog } from "@/components/messages/message-detail-dialog";
import { CheckCircle2, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { stats, fetchStats } = useUsers();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Messages state
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const {
    messages,
    isLoading: isMessagesLoading,
    fetchMessages,
  } = useMessages();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log("🔍 Admin Dashboard Check:", {
      isAuthenticated,
      username: user?.username,
      role: user?.role,
    });

    if (!isAuthenticated || !user) {
      console.log("❌ Not authenticated");
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      console.log("❌ Not admin, redirecting");
      router.push("/dashboard");
      return;
    }

    console.log("✅ Admin authenticated, fetching stats");
    fetchStats();
    loadMessages();
  }, [mounted, user, isAuthenticated, router]);

  const loadMessages = async (filters?: MessageFilters) => {
    try {
      await fetchMessages(filters);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleFilterChange = (filters: MessageFilters) => {
    loadMessages(filters);
  };

  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);
  };

  // Calculate message statistics
  const totalMessages = messages.length;
  const totalRecipients = messages.reduce(
    (sum, msg) => sum + (msg.recipients?.length || 0),
    0
  );
  const totalRead = messages.reduce(
    (sum, msg) => sum + (msg.recipients?.filter((r) => r.isRead).length || 0),
    0
  );
  const readRate =
    totalRecipients > 0 ? Math.round((totalRead / totalRecipients) * 100) : 0;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null;
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user.username}! Manage users, shifts, and communications
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Assign Shift
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Bulk Assign
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inactive Users
                </CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">
                  Deactivated users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Administrators
                </CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byRole.admin}</div>
                <p className="text-xs text-muted-foreground">Admin accounts</p>
              </CardContent>
            </Card>
          </div>

          {/* Role Distribution */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                <Stethoscope className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byRole.doctor}</div>
                <p className="text-xs text-muted-foreground">Medical doctors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nurses</CardTitle>
                <HeartPulse className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byRole.nurse}</div>
                <p className="text-xs text-muted-foreground">Nursing staff</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Staff
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byRole.doctor + stats.byRole.nurse}
                </div>
                <p className="text-xs text-muted-foreground">
                  Medical personnel
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start p-4"
              >
                <Link href="/dashboard/users">
                  <Users className="h-6 w-6 mb-2" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Users</div>
                    <div className="text-xs text-muted-foreground">
                      Create, edit, and deactivate users
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => setActiveTab("messages")}
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">Broadcast Messages</div>
                  <div className="text-xs text-muted-foreground">
                    Send messages to staff members
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => setActiveTab("assign")}
              >
                <CalendarClock className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">Assign Shifts</div>
                  <div className="text-xs text-muted-foreground">
                    Assign shifts to users with convention validation
                  </div>
                </div>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start p-4"
              >
                <Link href="/dashboard/shifts">
                  <CalendarClock className="h-6 w-6 mb-2" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Shifts</div>
                    <div className="text-xs text-muted-foreground">
                      Create and edit shift templates
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start p-4"
              >
                <Link href="/dashboard/conventions">
                  <Shield className="h-6 w-6 mb-2" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Conventions</div>
                    <div className="text-xs text-muted-foreground">
                      Set up work restrictions and rules
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => setActiveTab("calendar")}
              >
                <CalendarClock className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">View Calendar</div>
                  <div className="text-xs text-muted-foreground">
                    See all shift assignments
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Broadcast Messages
              </h2>
              <p className="text-gray-600">
                Send and manage messages to staff members
              </p>
            </div>
            <CreateMessageDialog />
          </div>

          {/* Message Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Messages
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Broadcast messages sent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Recipients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRecipients}</div>
                <p className="text-xs text-muted-foreground">
                  Users who received messages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Messages Read
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRead}</div>
                <p className="text-xs text-muted-foreground">
                  Out of {totalRecipients} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Average read rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <MessagesFilters
            onFilterChange={handleFilterChange}
            isLoading={isMessagesLoading}
          />

          {/* Messages Table */}
          <MessagesTable
            messages={messages}
            isLoading={isMessagesLoading}
            onViewDetails={handleViewDetails}
          />

          {/* Message Detail Dialog */}
          <MessageDetailDialog
            message={selectedMessage}
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
          />
        </TabsContent>

        {/* Assign Shift Tab */}
        <TabsContent value="assign" className="space-y-4">
          <AssignShiftForm />
        </TabsContent>

        {/* Bulk Assign Tab */}
        <TabsContent value="bulk" className="space-y-4">
          <BulkAssignForm />
        </TabsContent>

        {/* Assignments List Tab */}
        <TabsContent value="list" className="space-y-4">
          <AssignmentsList />
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <AssignmentsCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
