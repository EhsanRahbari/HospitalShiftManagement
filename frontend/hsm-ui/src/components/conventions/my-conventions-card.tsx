"use client";

import {
  UserConvention,
  SelectionType,
  ConventionType,
} from "@/types/convention";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  Ban,
  Scale,
  Stethoscope,
  Settings,
  Shield,
  User,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface MyConventionsCardProps {
  userConvention: UserConvention;
  onRemove: (conventionId: string) => Promise<void>;
}

export function MyConventionsCard({
  userConvention,
  onRemove,
}: MyConventionsCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { convention, selectionType, assignedBy, assignedAt } = userConvention;

  if (!convention) return null;

  const isAdminAssigned = selectionType === SelectionType.ADMIN_ASSIGNED;
  const canRemove = !isAdminAssigned;

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

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await onRemove(convention.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card className={isAdminAssigned ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getTypeIcon(convention.type)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{convention.title}</CardTitle>
                {getTypeBadge(convention.type)}
              </div>
              {convention.description && (
                <CardDescription className="mt-1">
                  {convention.description}
                </CardDescription>
              )}
            </div>
          </div>

          {canRemove && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isRemoving}
                  className="shrink-0"
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Convention?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove{" "}
                    <strong>"{convention.title}"</strong> from your conventions?
                    This action can be undone by re-adding it later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemove}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {isAdminAssigned ? (
              <>
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Admin Assigned</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>Self Selected</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span>Added {format(new Date(assignedAt), "PP")}</span>
            {assignedBy && (
              <span>
                by <strong>{assignedBy.username}</strong>
              </span>
            )}
          </div>
        </div>

        {isAdminAssigned && (
          <div className="mt-3 p-2 rounded-md bg-primary/10 text-sm text-primary">
            This convention was assigned by an administrator and cannot be
            removed.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
