"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useShifts } from "@/hooks/use-shifts";
import { useUsers } from "@/hooks/use-users";
import { Shift, ShiftType, ShiftStatus } from "@/types/shift";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  description: z.string().optional(),
  shiftType: z.nativeEnum(ShiftType),
  status: z.nativeEnum(ShiftStatus),
});

interface EditShiftDialogProps {
  shift: Shift;
}

export function EditShiftDialog({ shift }: EditShiftDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateShift } = useShifts();
  const { users, fetchUsers } = useUsers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: shift.userId,
      title: shift.title,
      startTime: format(new Date(shift.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(shift.endTime), "yyyy-MM-dd'T'HH:mm"),
      description: shift.description || "",
      shiftType: shift.shiftType,
      status: shift.status,
    },
  });

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers(1, 100);
    }
  }, [open, fetchUsers]);

  // Reset form when shift changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        userId: shift.userId,
        title: shift.title,
        startTime: format(new Date(shift.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(shift.endTime), "yyyy-MM-dd'T'HH:mm"),
        description: shift.description || "",
        shiftType: shift.shiftType,
        status: shift.status,
      });
    }
  }, [open, shift, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log("Updating shift:", shift.id, values);

      await updateShift(shift.id, values);

      toast.success("Shift updated successfully");
      setOpen(false);
    } catch (error: any) {
      console.error("Error updating shift:", error);
      toast.error(error.message || "Failed to update shift");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter only staff users (DOCTOR and NURSE)
  const staffUsers = users.filter(
    (user) => user.role === "DOCTOR" || user.role === "NURSE"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
          <DialogDescription>
            Update shift details. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to User *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a staff member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staffUsers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No staff members available
                        </div>
                      ) : (
                        staffUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username} ({user.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Morning Shift - Emergency"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shiftType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ShiftType.REGULAR}>
                          Regular
                        </SelectItem>
                        <SelectItem value={ShiftType.OVERTIME}>
                          Overtime
                        </SelectItem>
                        <SelectItem value={ShiftType.ON_CALL}>
                          On Call
                        </SelectItem>
                        <SelectItem value={ShiftType.EMERGENCY}>
                          Emergency
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ShiftStatus.SCHEDULED}>
                          Scheduled
                        </SelectItem>
                        <SelectItem value={ShiftStatus.COMPLETED}>
                          Completed
                        </SelectItem>
                        <SelectItem value={ShiftStatus.CANCELLED}>
                          Cancelled
                        </SelectItem>
                        <SelectItem value={ShiftStatus.NO_SHOW}>
                          No Show
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes or instructions..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Shift"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
