"use client";

import { useState, useEffect } from "react";
import { useConventions } from "@/hooks/use-conventions";
import { Convention, ConventionType } from "@/types/convention";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Plus,
  Clock,
  Ban,
  Scale,
  Stethoscope,
  Settings,
  AlertCircle,
} from "lucide-react";

interface AssignConventionDialogProps {
  userId: string;
  existingConventionIds: string[];
  onSuccess: () => void;
}

export function AssignConventionDialog({
  userId,
  existingConventionIds,
  onSuccess,
}: AssignConventionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [availableConventions, setAvailableConventions] = useState<
    Convention[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const { getAvailableConventions, assignConventionsToUser } = useConventions();

  useEffect(() => {
    if (open) {
      fetchConventions();
    }
  }, [open]);

  const fetchConventions = async () => {
    try {
      setIsLoading(true);
      const data = await getAvailableConventions();
      // Filter out conventions user already has
      const filtered = data.filter(
        (c) => !existingConventionIds.includes(c.id)
      );
      setAvailableConventions(filtered);
    } catch (error) {
      console.error("Error fetching conventions:", error);
      toast.error("Failed to load conventions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one convention");
      return;
    }

    console.log("🔍 handleAssign - selectedIds:", selectedIds);

    try {
      setIsAssigning(true);

      // ⬇️ Pass as object
      await assignConventionsToUser(userId, { conventionIds: selectedIds });

      toast.success(
        `${selectedIds.length} convention(s) assigned successfully`
      );
      setSelectedIds([]);
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("❌ Error assigning conventions:", error);
      toast.error(error.message || "Failed to assign conventions");
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleConvention = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getTypeIcon = (type: ConventionType) => {
    const iconProps = { className: "h-4 w-4" };

    switch (type) {
      case ConventionType.AVAILABILITY:
        return <Clock {...iconProps} />;
      case ConventionType.RESTRICTION:
        return <Ban {...iconProps} />;
      case ConventionType.LEGAL:
        return <Scale {...iconProps} />;
      case ConventionType.MEDICAL:
        return <Stethoscope {...iconProps} />;
      case ConventionType.CUSTOM:
        return <Settings {...iconProps} />;
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

  // Group by type
  const groupedConventions = availableConventions.reduce((acc, convention) => {
    if (!acc[convention.type]) {
      acc[convention.type] = [];
    }
    acc[convention.type].push(convention);
    return acc;
  }, {} as Record<ConventionType, Convention[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Assign Conventions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Conventions</DialogTitle>
          <DialogDescription>
            Select conventions to assign to this user. These will be marked as
            admin-assigned and will be mandatory for the user.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        ) : availableConventions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No conventions available to assign. The user already has all
              available conventions.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedConventions).map(([type, conventions]) => (
              <div key={type}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  {getTypeIcon(type as ConventionType)}
                  {type}
                  <Badge variant="secondary">{conventions.length}</Badge>
                </h3>
                <div className="space-y-2">
                  {conventions.map((convention) => (
                    <div
                      key={convention.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => toggleConvention(convention.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(convention.id)}
                        onCheckedChange={() => toggleConvention(convention.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{convention.title}</p>
                          {getTypeBadge(convention.type)}
                        </div>
                        {convention.description && (
                          <p className="text-sm text-muted-foreground">
                            {convention.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedIds.length === 0 || isAssigning}
          >
            {isAssigning
              ? "Assigning..."
              : `Assign ${
                  selectedIds.length > 0 ? `(${selectedIds.length})` : ""
                } Convention${selectedIds.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
