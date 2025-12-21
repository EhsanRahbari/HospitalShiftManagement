"use client";

import { useState, useEffect } from "react";
import { useConventions } from "@/hooks/use-conventions";
import { Convention } from "@/types/convention";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { ConventionBrowser } from "./convention-browser";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SelectConventionDialogProps {
  onSuccess?: () => void;
}

export function SelectConventionDialog({
  onSuccess,
}: SelectConventionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [availableConventions, setAvailableConventions] = useState<
    Convention[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { getAvailableConventions, selectConventionsForSelf } =
    useConventions();

  useEffect(() => {
    if (open) {
      fetchAvailableConventions();
    }
  }, [open]);

  const fetchAvailableConventions = async () => {
    try {
      setIsFetching(true);
      const data = await getAvailableConventions();
      setAvailableConventions(data);
    } catch (error: any) {
      console.error("Error fetching available conventions:", error);
      toast.error(error.message || "Failed to fetch available conventions");
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggle = (conventionId: string) => {
    setSelectedIds((prev) =>
      prev.includes(conventionId)
        ? prev.filter((id) => id !== conventionId)
        : [...prev, conventionId]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one convention");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Submitting convention selection:", selectedIds);

      await selectConventionsForSelf(selectedIds);

      toast.success(`${selectedIds.length} convention(s) added successfully`);
      setSelectedIds([]);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error selecting conventions:", error);
      toast.error(error.message || "Failed to select conventions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Conventions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Your Conventions</DialogTitle>
          <DialogDescription>
            Choose conventions that apply to you. These help ensure shift
            assignments respect your constraints and preferences.
          </DialogDescription>
        </DialogHeader>

        {selectedIds.length > 5 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've selected {selectedIds.length} conventions. Having too many
              may limit your shift assignment flexibility.
            </AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ConventionBrowser
              conventions={availableConventions}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              disabled={isLoading}
            />
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedIds.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${
                selectedIds.length > 0 ? `(${selectedIds.length})` : ""
              } Conventions`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
