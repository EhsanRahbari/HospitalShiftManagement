"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateUserDialog } from "@/components/dashboard/create-user-dialog";
import { EditUserDialog } from "@/components/dashboard/edit-user-dialog";
import { DeleteUserDialog } from "@/components/dashboard/delete-user-dialog";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

export default function UsersPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { users, pagination, isLoading, error, fetchUsers } = useUsers();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log("🔍 Users Page Check:", {
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
      console.log("❌ Not admin");
      router.push("/dashboard");
      return;
    }

    console.log("✅ Admin authenticated, fetching users");
    fetchUsers(currentPage, 10);
  }, [mounted, user, isAuthenticated, currentPage, router]);

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // ⬇️ NEW: Handle row click to view user details
  const handleViewUser = (userId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    router.push(`/dashboard/users/${userId}`);
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

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => fetchUsers(currentPage, 10)} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {pagination
              ? `Showing ${users.length} of ${pagination.total} users`
              : "Loading users..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "ADMIN"
                                ? "default"
                                : user.role === "DOCTOR"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "destructive"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* ⬇️ NEW: View Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleViewUser(user.id, e)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <EditUserDialog user={user} />
                            <DeleteUserDialog user={user} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={
                        currentPage === pagination.totalPages || isLoading
                      }
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
