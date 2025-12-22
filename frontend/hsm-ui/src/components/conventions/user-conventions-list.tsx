"use client";

import { useState } from "react";
import {
  UserConvention,
  SelectionType,
  ConventionType,
} from "@/types/convention";
import { useConventions } from "@/hooks/use-conventions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Trash2,
  Shield,
  User,
  Clock,
  Ban,
  Scale,
  Stethoscope,
  Settings,
  Loader2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

interface UserConventionsListProps {
  conventions: UserConvention[];
  isLoading: boolean;
  onUpdate: () => void;
}

export function UserConventionsList({
  conventions,
  isLoading,
  onUpdate,
}: UserConventionsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { removeConventionFromUser } = useConventions();

  const getTypeIcon = (type: ConventionType) => {
    const iconProps = { className: "h-5 w-5" };

    switch (type) {
      case ConventionType.AVAILABILITY:
        return <Clock {...iconProps} className="h-5 w-5 text-blue-600" />;
      case ConventionType.RESTRICTION:
        return <Ban {...iconProps} className="h-5 w-5 text-orange-600" />;
      case ConventionType.LEGAL:
        return <Scale {...iconProps} className="h-5 w-5 text-purple-600" />;
      case ConventionType.MEDICAL:
        return <Stethoscope {...iconProps} className="h-5 w-5 text-red-600" />;
      case ConventionType.CUSTOM:
        return <Settings {...iconProps} className="h-5 w-5 text-gray-600" />;
      default:
        return <Settings {...iconProps} />;
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

  const getSelectionBadge = (selectionType: SelectionType) => {
    if (selectionType === SelectionType.ADMIN_ASSIGNED) {
      return (
        <Badge variant="default" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin Assigned
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <User className="h-3 w-3" />
        Self Selected
      </Badge>
    );
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const convention = conventions.find((c) => c.id === deletingId);
    if (!convention) return;

    try {
      setIsDeleting(true);
      await removeConventionFromUser(
        convention.userId,
        convention.conventionId
      );
      toast.success("Convention removed successfully");
      setDeletingId(null);
      onUpdate();
    } catch (error: any) {
      console.error("Error removing convention:", error);
      toast.error(error.message || "Failed to remove convention");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (conventions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Conventions</h3>
            <p className="text-muted-foreground mb-4">
              This user hasn't been assigned any conventions yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by selection type
  const adminAssigned = conventions.filter(
    (c) => c.selectionType === SelectionType.ADMIN_ASSIGNED
  );
  const userSelected = conventions.filter(
    (c) => c.selectionType === SelectionType.USER_SELECTED
  );

  return (
    <div className="space-y-6">
      {/* Admin Assigned */}
      {adminAssigned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              Admin Assigned Conventions
            </h3>
            <Badge variant="secondary">{adminAssigned.length}</Badge>
          </div>
          <div className="space-y-4">
            {adminAssigned.map((assignment) => {
              const convention = assignment.convention;
              if (!convention) return null;

              return (
                <Card key={assignment.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getTypeIcon(convention.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">
                              {convention.title}
                            </CardTitle>
                            {getSelectionBadge(assignment.selectionType)}
                          </div>
                          {convention.description && (
                            <CardDescription>
                              {convention.description}
                            </CardDescription>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>
                              Assigned:{" "}
                              {format(new Date(assignment.assignedAt), "PPP")}
                            </span>
                            {assignment.assignedBy && (
                              <span>
                                By:{" "}
                                <strong>
                                  {assignment.assignedBy.username}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(convention.type)}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* User Selected */}
      {userSelected.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Self Selected Conventions</h3>
            <Badge variant="secondary">{userSelected.length}</Badge>
          </div>
          <div className="space-y-4">
            {userSelected.map((assignment) => {
              const convention = assignment.convention;
              if (!convention) return null;

              return (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getTypeIcon(convention.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">
                              {convention.title}
                            </CardTitle>
                            {getSelectionBadge(assignment.selectionType)}
                          </div>
                          {convention.description && (
                            <CardDescription>
                              {convention.description}
                            </CardDescription>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>
                              Selected:{" "}
                              {format(new Date(assignment.assignedAt), "PPP")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(convention.type)}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Convention?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this convention from the user?
              This will affect their shift assignment preferences.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Convention"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
