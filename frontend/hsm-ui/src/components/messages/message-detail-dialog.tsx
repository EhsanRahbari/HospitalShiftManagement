"use client";

import { useState, useEffect } from "react";
import { Message, MessageRecipient } from "@/types/message";
import { useMessages } from "@/hooks/use-messages";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Info,
  AlertTriangle,
  MessageSquare,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Shield,
  Stethoscope,
  HeartPulse,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface MessageDetailDialogProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityConfig = {
  LOW: {
    icon: Info,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Low Priority",
  },
  MEDIUM: {
    icon: MessageSquare,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Medium Priority",
  },
  HIGH: {
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "High Priority",
  },
  URGENT: {
    icon: AlertCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Urgent Priority",
  },
};

const roleIcons = {
  ADMIN: Shield,
  DOCTOR: Stethoscope,
  NURSE: HeartPulse,
};

const roleColors = {
  ADMIN: "bg-blue-100 text-blue-800",
  DOCTOR: "bg-purple-100 text-purple-800",
  NURSE: "bg-pink-100 text-pink-800",
};

export function MessageDetailDialog({
  message,
  open,
  onOpenChange,
}: MessageDetailDialogProps) {
  const [detailedMessage, setDetailedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getMessageById } = useMessages();

  useEffect(() => {
    if (open && message) {
      loadMessageDetails();
    }
  }, [open, message]);

  const loadMessageDetails = async () => {
    if (!message) return;

    try {
      setIsLoading(true);
      const details = await getMessageById(message.id);
      setDetailedMessage(details);
    } catch (error) {
      console.error("Error loading message details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!message) return null;

  const priority = priorityConfig[message.priority];
  const PriorityIcon = priority.icon;

  const totalRecipients = detailedMessage?.recipients?.length || 0;
  const readCount =
    detailedMessage?.recipients?.filter((r) => r.isRead).length || 0;
  const unreadCount = totalRecipients - readCount;
  const readPercentage =
    totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PriorityIcon className="h-5 w-5" />
            Message Details
          </DialogTitle>
          <DialogDescription>
            View complete message information and recipient status
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Message Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {message.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Sent by {message.sentBy.username}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(message.createdAt), "PPp")}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`${priority.color} border px-3 py-1`}
                >
                  <PriorityIcon className="mr-1 h-4 w-4" />
                  {priority.label}
                </Badge>
              </div>

              {/* Message Content */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>

            <Separator />

            {/* Filters Applied */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Target Filters
              </h4>
              <div className="flex flex-wrap gap-2">
                {message.department ? (
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    Department: {message.department}
                  </Badge>
                ) : (
                  <Badge variant="secondary">All Departments</Badge>
                )}
                {message.section ? (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    Section: {message.section}
                  </Badge>
                ) : (
                  <Badge variant="secondary">All Sections</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Recipients Statistics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recipients Overview
              </h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalRecipients}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="rounded-lg border bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Read</p>
                      <p className="text-2xl font-bold text-green-900">
                        {readCount}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="rounded-lg border bg-orange-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700">Unread</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {unreadCount}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Read Rate</span>
                  <span className="font-medium text-gray-900">
                    {readPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      readPercentage === 100 ? "bg-green-600" : "bg-orange-600"
                    }`}
                    style={{ width: `${readPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Recipients List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                All Recipients ({totalRecipients})
              </h4>

              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Read At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedMessage?.recipients?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-gray-500">No recipients found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        detailedMessage?.recipients?.map((recipient) => {
                          const RoleIcon =
                            roleIcons[
                              recipient.user.role as keyof typeof roleIcons
                            ];
                          const initials = recipient.user.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);

                          return (
                            <TableRow key={recipient.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {recipient.user.username}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {recipient.user.id.slice(0, 8)}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge
                                  className={
                                    roleColors[
                                      recipient.user
                                        .role as keyof typeof roleColors
                                    ]
                                  }
                                  variant="secondary"
                                >
                                  {RoleIcon && (
                                    <RoleIcon className="mr-1 h-3 w-3" />
                                  )}
                                  {recipient.user.role}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                {recipient.user.department ? (
                                  <Badge variant="outline" className="gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {recipient.user.department}
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    -
                                  </span>
                                )}
                              </TableCell>

                              <TableCell>
                                {recipient.user.section ? (
                                  <Badge variant="outline" className="gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {recipient.user.section}
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    -
                                  </span>
                                )}
                              </TableCell>

                              <TableCell>
                                {recipient.isRead ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Read
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    <Clock className="mr-1 h-3 w-3" />
                                    Unread
                                  </Badge>
                                )}
                              </TableCell>

                              <TableCell className="text-sm text-gray-600">
                                {recipient.readAt ? (
                                  <div>
                                    <div>
                                      {format(
                                        new Date(recipient.readAt),
                                        "MMM d, yyyy"
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {format(
                                        new Date(recipient.readAt),
                                        "HH:mm"
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
