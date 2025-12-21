"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConventions } from "@/hooks/use-conventions";
import { useAuthStore } from "@/store/auth-store";
import {
  UserConvention,
  UserConventionStats,
  SelectionType,
} from "@/types/convention";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectConventionDialog } from "@/components/conventions/select-convention-dialog";
import { MyConventionsCard } from "@/components/conventions/my-conventions-card";
import { MyConventionsStats } from "@/components/conventions/my-conventions-stats";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyConventionsPage() {
  const [mounted, setMounted] = useState(false);
  const [myConventions, setMyConventions] = useState<UserConvention[]>([]);
  const [stats, setStats] = useState<UserConventionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getMyConventions, removeMyConvention, getMyConventionStats } =
    useConventions();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log("🔍 My Conventions Page Check:", {
      isAuthenticated,
      username: user?.username,
      role: user?.role,
    });

    if (!isAuthenticated || !user) {
      console.log("❌ Not authenticated");
      router.push("/login");
      return;
    }

    if (user.role === "ADMIN") {
      console.log("⚠️ Admins should use admin convention management");
      router.push("/dashboard/conventions");
      return;
    }

    console.log("✅ User authenticated, fetching conventions");
    fetchData();
  }, [mounted, user, isAuthenticated, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [conventionsData, statsData] = await Promise.all([
        getMyConventions(),
        getMyConventionStats(),
      ]);
      setMyConventions(conventionsData);
      setStats(statsData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Failed to load conventions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (conventionId: string) => {
    try {
      await removeMyConvention(conventionId);
      toast.success("Convention removed successfully");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Error removing convention:", error);
      toast.error(error.message || "Failed to remove convention");
    }
  };

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

  if (!isAuthenticated || !user || user.role === "ADMIN") {
    return null;
  }

  const adminAssigned = myConventions.filter(
    (uc) => uc.selectionType === SelectionType.ADMIN_ASSIGNED
  );
  const userSelected = myConventions.filter(
    (uc) => uc.selectionType === SelectionType.USER_SELECTED
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Conventions</h1>
          <p className="text-muted-foreground">
            Manage your shift assignment constraints and preferences
          </p>
        </div>
        <SelectConventionDialog onSuccess={fetchData} />
      </div>

      {/* Statistics */}
      <MyConventionsStats stats={stats} isLoading={isLoading} />

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">About Conventions</CardTitle>
          <CardDescription>
            Conventions help the system assign shifts that respect your
            constraints:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-primary">
              🛡️ Admin Assigned:
            </span>
            <span>
              Mandatory conventions assigned by administrators (cannot be
              removed by you)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-green-600">
              👤 Self Selected:
            </span>
            <span>
              Your personal preferences (you can add or remove these anytime)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Conventions Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({myConventions.length})</TabsTrigger>
          <TabsTrigger value="admin">
            Admin Assigned ({adminAssigned.length})
          </TabsTrigger>
          <TabsTrigger value="user">
            Self Selected ({userSelected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : myConventions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  No conventions selected yet
                </p>
                <SelectConventionDialog onSuccess={fetchData} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myConventions.map((userConvention) => (
                <MyConventionsCard
                  key={userConvention.id}
                  userConvention={userConvention}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : adminAssigned.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No admin-assigned conventions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {adminAssigned.map((userConvention) => (
                <MyConventionsCard
                  key={userConvention.id}
                  userConvention={userConvention}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : userSelected.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't selected any conventions yet
                </p>
                <SelectConventionDialog onSuccess={fetchData} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userSelected.map((userConvention) => (
                <MyConventionsCard
                  key={userConvention.id}
                  userConvention={userConvention}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
