"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShifts } from "@/hooks/use-shifts";
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
import { CreateShiftDialog } from "@/components/shifts/create-shift-dialog";
import { EditShiftDialog } from "@/components/shifts/edit-shift-dialog";
import { DeleteShiftDialog } from "@/components/shifts/delete-shift-dialog";
import { ShiftStats } from "@/components/shifts/shift-stats";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ShiftStatus, ShiftType } from "@/types/shift";

export default function ShiftsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { shifts, pagination, isLoading, error, fetchShifts } = useShifts();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log("🔍 Shifts Page Check:", {
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

    console.log("✅ Admin authenticated, fetching shifts");

    const filters: any = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (typeFilter !== "all") filters.shiftType = typeFilter;

    fetchShifts(currentPage, 10, filters);
  }, [
    mounted,
    user,
    isAuthenticated,
    currentPage,
    statusFilter,
    typeFilter,
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

  const getStatusBadge = (status: ShiftStatus) => {
    const variants: Record<ShiftStatus, { variant: any; label: string }> = {
      [ShiftStatus.SCHEDULED]: { variant: "default", label: "Scheduled" },
      [ShiftStatus.COMPLETED]: { variant: "secondary", label: "Completed" },
      [ShiftStatus.CANCELLED]: { variant: "destructive", label: "Cancelled" },
      [ShiftStatus.NO_SHOW]: { variant: "outline", label: "No Show" },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: ShiftType) => {
    const colors: Record<ShiftType, string> = {
      [ShiftType.REGULAR]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      [ShiftType.OVERTIME]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      [ShiftType.ON_CALL]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      [ShiftType.EMERGENCY]:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <Badge variant="outline" className={colors[type]}>
        {type.replace("_", " ")}
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
          <Button onClick={() => fetchShifts(currentPage, 10)} className="mt-4">
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
          <h1 className="text-3xl font-bold">Shift Management</h1>
          <p className="text-muted-foreground">
            Manage and assign shifts to staff members
          </p>
        </div>
        <CreateShiftDialog />
      </div>

      {/* Statistics */}
      <ShiftStats />

      {/* Shifts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Shifts</CardTitle>
              <CardDescription>
                {pagination
                  ? `Showing ${shifts.length} of ${pagination.total} shifts`
                  : "Loading shifts..."}
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={ShiftStatus.SCHEDULED}>
                    Scheduled
                  </SelectItem>
                  <SelectItem value={ShiftStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                  <SelectItem value={ShiftStatus.CANCELLED}>
                    Cancelled
                  </SelectItem>
                  <SelectItem value={ShiftStatus.NO_SHOW}>No Show</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ShiftType.REGULAR}>Regular</SelectItem>
                  <SelectItem value={ShiftType.OVERTIME}>Overtime</SelectItem>
                  <SelectItem value={ShiftType.ON_CALL}>On Call</SelectItem>
                  <SelectItem value={ShiftType.EMERGENCY}>Emergency</SelectItem>
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
          ) : shifts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No shifts found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
                          {shift.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {shift.user.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {shift.user.role}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(shift.startTime), "PPp")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(shift.endTime), "PPp")}
                        </TableCell>
                        <TableCell>{getTypeBadge(shift.shiftType)}</TableCell>
                        <TableCell>{getStatusBadge(shift.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditShiftDialog shift={shift} />
                            <DeleteShiftDialog shift={shift} />
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
