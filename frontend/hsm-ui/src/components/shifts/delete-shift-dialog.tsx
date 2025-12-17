"use client";

import { useState } from "react";
import { useShifts } from "@/hooks/use-shifts";
import { Shift } from "@/types/shift";
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
import { format } from "date-fns";

interface DeleteShiftDialogProps {
  shift: Shift;
}

export function DeleteShiftDialog({ shift }: DeleteShiftDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { deleteShift } = useShifts();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      console.log("Deleting shift:", shift.id);

      await deleteShift(shift.id);

      toast.success(`Shift "${shift.title}" cancelled successfully`);
      setOpen(false);
    } catch (error: any) {
      console.error("Error deleting shift:", error);
      toast.error(error.message || "Failed to cancel shift");
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
          <AlertDialogTitle>Cancel Shift?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cancel the shift <strong>"{shift.title}"</strong> assigned
            to <strong>{shift.user.username}</strong> scheduled for{" "}
            <strong>{format(new Date(shift.startTime), "PPP 'at' p")}</strong>
            .
            <br />
            <br />
            The shift will be marked as CANCELLED. This action can be undone by
            editing the shift status.
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
                Cancelling...
              </>
            ) : (
              "Cancel Shift"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
