"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConventions } from "@/hooks/use-conventions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateConventionDialog } from "@/components/conventions/create-convention-dialog";
import { EditConventionDialog } from "@/components/conventions/edit-convention-dialog";
import { DeleteConventionDialog } from "@/components/conventions/delete-convention-dialog";
import { ConventionStats } from "@/components/conventions/convention-stats";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { format } from "date-fns";
import { ConventionType } from "@/types/convention";

export default function ConventionsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { conventions, pagination, isLoading, error, fetchConventions } =
    useConventions();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log("🔍 Conventions Page Check:", {
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

    console.log("✅ Admin authenticated, fetching conventions");

    const filters: any = {};
    if (typeFilter !== "all") filters.type = typeFilter;
    if (statusFilter !== "all")
      filters.isActive = statusFilter === "active" ? "true" : "false";

    fetchConventions(currentPage, 10, filters);
  }, [
    mounted,
    user,
    isAuthenticated,
    currentPage,
    typeFilter,
    statusFilter,
    router,
  ]);

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

  const getTypeBadge = (type: ConventionType) => {
    const colors: Record<ConventionType, string> = {
      [ConventionType.AVAILABILITY]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      [ConventionType.RESTRICTION]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      [ConventionType.LEGAL]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      [ConventionType.MEDICAL]:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      [ConventionType.CUSTOM]:
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };

    return (
      <Badge variant="outline" className={colors[type]}>
        {type}
      </Badge>
    );
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
          <Button
            onClick={() => fetchConventions(currentPage, 10)}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Convention Management</h1>
          <p className="text-muted-foreground">
            Define and manage user conventions (rules, constraints, and
            conditions)
          </p>
        </div>
        <CreateConventionDialog />
      </div>

      {/* Statistics */}
      <ConventionStats />

      {/* Conventions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Conventions</CardTitle>
              <CardDescription>
                {pagination
                  ? `Showing ${conventions.length} of ${pagination.total} conventions`
                  : "Loading conventions..."}
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ConventionType.AVAILABILITY}>
                    Availability
                  </SelectItem>
                  <SelectItem value={ConventionType.RESTRICTION}>
                    Restriction
                  </SelectItem>
                  <SelectItem value={ConventionType.LEGAL}>Legal</SelectItem>
                  <SelectItem value={ConventionType.MEDICAL}>
                    Medical
                  </SelectItem>
                  <SelectItem value={ConventionType.CUSTOM}>Custom</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : conventions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No conventions found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conventions.map((convention) => (
                      <TableRow key={convention.id}>
                        <TableCell className="font-medium">
                          {convention.title}
                        </TableCell>
                        <TableCell>{getTypeBadge(convention.type)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {convention.description || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{convention.userCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              convention.isActive ? "default" : "secondary"
                            }
                          >
                            {convention.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {format(new Date(convention.createdAt), "PP")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              by {convention.createdBy?.username || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditConventionDialog convention={convention} />
                            <DeleteConventionDialog convention={convention} />
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
