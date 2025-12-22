"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { useConventions } from "@/hooks/use-conventions";
import { UserConvention } from "@/types/convention";
import { User } from "@/types/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User as UserIcon,
  Shield,
  Calendar,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { UserConventionsList } from "@/components/conventions/user-conventions-list";
import { AssignConventionDialog } from "@/components/conventions/assign-convention-dialog";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailsPage({ params }: PageProps) {
  // ⬇️ FIXED: Unwrap params Promise using React.use()
  const { id } = use(params);

  const [user, setUser] = useState<User | null>(null);
  const [conventions, setConventions] = useState<UserConvention[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingConventions, setIsLoadingConventions] = useState(true);

  const router = useRouter();
  const { getUser } = useUsers();
  const { getUserConventions } = useConventions();

  useEffect(() => {
    if (id) {
      fetchUser();
      fetchConventions();
    }
  }, [id]); // ⬅️ Now using unwrapped id

  const fetchUser = async () => {
    try {
      setIsLoadingUser(true);
      const data = await getUser(id);
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const fetchConventions = async () => {
    try {
      setIsLoadingConventions(true);
      const data = await getUserConventions(id);
      setConventions(data);
    } catch (error) {
      console.error("Error fetching conventions:", error);
    } finally {
      setIsLoadingConventions(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      DOCTOR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      NURSE:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };

    return (
      <Badge variant="outline" className={colors[role] || ""}>
        {role}
      </Badge>
    );
  };

  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">User not found</p>
            <Button onClick={() => router.push("/dashboard/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const adminAssignedCount = conventions.filter(
    (c) => c.selectionType === "ADMIN_ASSIGNED"
  ).length;
  const userSelectedCount = conventions.filter(
    (c) => c.selectionType === "USER_SELECTED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground">User Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getRoleBadge(user.role)}
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Username
            </p>
            <p className="text-sm">{user.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p className="text-sm">{user.role}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm">{user.isActive ? "Active" : "Inactive"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Created At
            </p>
            <p className="text-sm">{format(new Date(user.createdAt), "PPP")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="conventions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conventions" className="gap-2">
            <FileText className="h-4 w-4" />
            Conventions ({conventions.length})
          </TabsTrigger>
          <TabsTrigger value="shifts" className="gap-2">
            <Calendar className="h-4 w-4" />
            Shifts
          </TabsTrigger>
        </TabsList>

        {/* Conventions Tab */}
        <TabsContent value="conventions" className="space-y-4">
          {/* Convention Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conventions
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conventions.length}</div>
                <p className="text-xs text-muted-foreground">
                  All active conventions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Admin Assigned
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminAssignedCount}</div>
                <p className="text-xs text-muted-foreground">
                  Mandatory conventions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Self Selected
                </CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userSelectedCount}</div>
                <p className="text-xs text-muted-foreground">
                  User preferences
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assign Convention Button */}
          <div className="flex justify-end">
            <AssignConventionDialog
              userId={id}
              existingConventionIds={conventions.map((c) => c.conventionId)}
              onSuccess={fetchConventions}
            />
          </div>

          {/* Conventions List */}
          <UserConventionsList
            conventions={conventions}
            isLoading={isLoadingConventions}
            onUpdate={fetchConventions}
          />
        </TabsContent>

        {/* Shifts Tab (Placeholder) */}
        <TabsContent value="shifts">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Shift management coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
