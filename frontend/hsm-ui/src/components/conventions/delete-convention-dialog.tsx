"use client";

import { useState } from "react";
import { useConventions } from "@/hooks/use-conventions";
import { Convention } from "@/types/convention";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteConventionDialogProps {
  convention: Convention;
}

export function DeleteConventionDialog({
  convention,
}: DeleteConventionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { deleteConvention } = useConventions();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      console.log("Deleting convention:", convention.id);

      await deleteConvention(convention.id);

      toast.success(
        `Convention "${convention.title}" deactivated successfully`
      );
      setOpen(false);
    } catch (error: any) {
      console.error("Error deleting convention:", error);
      toast.error(error.message || "Failed to delete convention");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Convention?</AlertDialogTitle>
          <AlertDialogDescription>
            This will deactivate the convention{" "}
            <strong>"{convention.title}"</strong>.
            <br />
            <br />
            {convention.userCount && convention.userCount > 0 ? (
              <>
                <span className="text-red-600 font-semibold">
                  Warning: This convention is currently assigned to{" "}
                  {convention.userCount} user(s).
                </span>
                <br />
                Please remove all user assignments before deleting.
              </>
            ) : (
              <>
                The convention will be marked as inactive and cannot be assigned
                to users.
                <br />
                This action can be undone by editing the convention and setting
                it to active.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              "Deactivate Convention"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
