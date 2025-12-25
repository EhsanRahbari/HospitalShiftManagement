"use client";

import { useState, useEffect } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { Message } from "@/types/message";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Inbox,
  CheckCircle2,
  Clock,
  Mail,
  MailOpen,
  User,
  Calendar,
  Building2,
  MapPin,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UserMessagesViewProps {
  onMessageRead?: () => void;
}

interface UserMessage extends Message {
  recipientInfo?: {
    isRead: boolean;
    readAt?: string;
  };
}

export function UserMessagesView({
  onMessageRead,
}: UserMessagesViewProps = {}) {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { getMyMessages, markAsRead } = useMessages();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const { refetch: refetchUnreadCount } = useUnreadMessages();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await getMyMessages();
      console.log("📩 Loaded messages:", data);
      setMessages(data);

      if (data.length > 0) {
        const firstUnread = data.find(
          (m: UserMessage) => !m.recipientInfo?.isRead
        );
        setSelectedMessage(firstUnread || data[0]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = async (message: UserMessage) => {
    setSelectedMessage(message);

    if (!message.recipientInfo?.isRead) {
      try {
        await markAsRead(message.id);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id
              ? {
                  ...m,
                  recipientInfo: {
                    ...m.recipientInfo,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  },
                }
              : m
          )
        );
        onMessageRead?.();
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const filteredMessages = messages.filter((message) => {
    if (filter === "unread") return !message.recipientInfo?.isRead;
    if (filter === "read") return message.recipientInfo?.isRead;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.recipientInfo?.isRead).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px] lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">
            View broadcast messages from administration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Mail className="h-3 w-3" />
            {messages.length} Total
          </Badge>
          {unreadCount > 0 && (
            <Badge className="gap-1 bg-orange-600">
              <MailOpen className="h-3 w-3" />
              {unreadCount} Unread
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
          className="rounded-b-none"
        >
          <Inbox className="mr-2 h-4 w-4" />
          All ({messages.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("unread")}
          className="rounded-b-none"
        >
          <Mail className="mr-2 h-4 w-4" />
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("read")}
          className="rounded-b-none"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Read ({messages.length - unreadCount})
        </Button>
      </div>

      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No messages found
            </h3>
            <p className="text-gray-600 text-center">
              {filter === "unread"
                ? "You have no unread messages"
                : filter === "read"
                ? "You have no read messages"
                : "You have no messages yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inbox</CardTitle>
              <CardDescription>
                {filteredMessages.length} message
                {filteredMessages.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-1 p-4 pt-0">
                  {filteredMessages.map((message) => {
                    const isUnread = !message.recipientInfo?.isRead;
                    const isSelected = selectedMessage?.id === message.id;

                    return (
                      <button
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          isSelected
                            ? "bg-primary/5 border-primary"
                            : "hover:bg-gray-50 border-transparent",
                          isUnread && "bg-blue-50/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4
                                className={cn(
                                  "text-sm line-clamp-1",
                                  isUnread ? "font-semibold" : "font-medium"
                                )}
                              >
                                {message.title}
                              </h4>
                              {isUnread && (
                                <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between">
                              {/* ✅ FIXED: Added safety check for sentBy */}
                              {message.sentBy ? (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <User className="h-3 w-3" />
                                  <span>{message.sentBy.username}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <User className="h-3 w-3" />
                                  <span>Admin</span>
                                </div>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(
                                  new Date(message.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Detail */}
          <Card className="lg:col-span-2">
            {selectedMessage ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {selectedMessage.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        {/* ✅ FIXED: Added safety check for sentBy */}
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>
                            From: {selectedMessage.sentBy?.username || "Admin"}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(selectedMessage.createdAt), "PPp")}
                          </span>
                        </div>
                        <span>•</span>
                        {selectedMessage.recipientInfo?.isRead ? (
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
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {/* Target Departments/Sections */}
                      {(selectedMessage.targetDepartments ||
                        selectedMessage.targetSections) && (
                        <div className="rounded-lg border bg-muted/50 p-4">
                          <h4 className="text-sm font-medium mb-2">
                            Target Recipients
                          </h4>
                          <div className="space-y-2">
                            {selectedMessage.targetDepartments &&
                              selectedMessage.targetDepartments.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs text-gray-600 mr-2">
                                    Departments:
                                  </span>
                                  {selectedMessage.targetDepartments.map(
                                    (dept) => (
                                      <Badge
                                        key={dept}
                                        variant="outline"
                                        className="gap-1 text-xs"
                                      >
                                        <Building2 className="h-3 w-3" />
                                        {dept}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              )}
                            {selectedMessage.targetSections &&
                              selectedMessage.targetSections.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs text-gray-600 mr-2">
                                    Sections:
                                  </span>
                                  {selectedMessage.targetSections.map(
                                    (section) => (
                                      <Badge
                                        key={section}
                                        variant="outline"
                                        className="gap-1 text-xs"
                                      >
                                        <MapPin className="h-3 w-3" />
                                        {section}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {selectedMessage.content}
                        </p>
                      </div>

                      {/* Read Status */}
                      {selectedMessage.recipientInfo?.readAt && (
                        <div className="pt-6 border-t">
                          <p className="text-sm text-gray-600">
                            <CheckCircle2 className="inline h-4 w-4 mr-1 text-green-600" />
                            Read on{" "}
                            {format(
                              new Date(selectedMessage.recipientInfo.readAt),
                              "PPp"
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-[500px]">
                <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No message selected
                </h3>
                <p className="text-gray-600 text-center">
                  Select a message from the list to view its contents
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
