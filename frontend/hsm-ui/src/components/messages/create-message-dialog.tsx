"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMessages } from "@/hooks/use-messages";
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
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Send, Building2, MapPin, AlertCircle } from "lucide-react";

const DEPARTMENTS = [
  "Emergency",
  "Surgery",
  "Pediatrics",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Radiology",
  "Laboratory",
];

const SECTIONS = [
  "ICU",
  "ER",
  "General",
  "OR",
  "CCU",
  "NICU",
  "Outpatient",
  "Inpatient",
];

// Updated schema to match backend expectations
const messageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  targetDepartments: z
    .array(z.string())
    .min(1, "At least one department must be selected"),
  targetSections: z.array(z.string()).optional(),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export function CreateMessageDialog() {
  const [open, setOpen] = useState(false);
  const { createMessage, isLoading } = useMessages();

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      title: "",
      content: "",
      targetDepartments: [],
      targetSections: [],
    },
  });

  const onSubmit = async (data: MessageFormValues) => {
    try {
      console.log("📤 Submitting message:", data);

      const payload = {
        title: data.title,
        content: data.content,
        targetDepartments: data.targetDepartments,
        ...(data.targetSections &&
          data.targetSections.length > 0 && {
            targetSections: data.targetSections,
          }),
      };

      console.log("📤 Payload:", payload);

      await createMessage(payload);

      toast.success("Message sent successfully", {
        description: "Your broadcast message has been sent to recipients.",
      });

      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("❌ Create message error:", error);
      toast.error("Failed to send message", {
        description:
          error.message || "An error occurred while sending the message.",
      });
    }
  };

  const selectedDepartments = form.watch("targetDepartments") || [];
  const selectedSections = form.watch("targetSections") || [];

  const toggleDepartment = (department: string) => {
    const current = selectedDepartments;
    const updated = current.includes(department)
      ? current.filter((d) => d !== department)
      : [...current, department];
    form.setValue("targetDepartments", updated);
  };

  const toggleSection = (section: string) => {
    const current = selectedSections;
    const updated = current.includes(section)
      ? current.filter((s) => s !== section)
      : [...current, section];
    form.setValue("targetSections", updated);
  };

  const selectAllDepartments = () => {
    form.setValue("targetDepartments", DEPARTMENTS);
  };

  const clearAllDepartments = () => {
    form.setValue("targetDepartments", []);
  };

  const selectAllSections = () => {
    form.setValue("targetSections", SECTIONS);
  };

  const clearAllSections = () => {
    form.setValue("targetSections", []);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Send Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Broadcast Message</DialogTitle>
          <DialogDescription>
            Send a message to staff members. Select target departments and
            sections.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Schedule Change Notification"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A clear and concise title for your message
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your message here..."
                      className="min-h-[150px] resize-none"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    The full content of your broadcast message
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Departments */}
            <FormField
              control={form.control}
              name="targetDepartments"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Target Departments *</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllDepartments}
                        disabled={isLoading}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllDepartments}
                        disabled={isLoading}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4 space-y-2">
                    {DEPARTMENTS.map((department) => (
                      <div
                        key={department}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`dept-${department}`}
                          checked={selectedDepartments.includes(department)}
                          onCheckedChange={() => toggleDepartment(department)}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor={`dept-${department}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {department}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Select at least one department to send this message to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Sections */}
            <FormField
              control={form.control}
              name="targetSections"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Target Sections (Optional)</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllSections}
                        disabled={isLoading}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllSections}
                        disabled={isLoading}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4 space-y-2">
                    {SECTIONS.map((section) => (
                      <div
                        key={section}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`sect-${section}`}
                          checked={selectedSections.includes(section)}
                          onCheckedChange={() => toggleSection(section)}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor={`sect-${section}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {section}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Optionally filter by specific sections
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Recipients Preview
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  This message will be sent to:
                </p>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedDepartments.length > 0 ? (
                      selectedDepartments.map((dept) => (
                        <Badge key={dept} variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          {dept}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="destructive">
                        No departments selected
                      </Badge>
                    )}
                  </div>
                  {selectedSections.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedSections.map((section) => (
                        <Badge
                          key={section}
                          variant="outline"
                          className="gap-1"
                        >
                          <MapPin className="h-3 w-3" />
                          {section}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
