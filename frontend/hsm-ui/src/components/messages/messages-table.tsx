"use client";

import { Message } from "@/types/message";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Eye,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

interface MessagesTableProps {
  messages: Message[];
  isLoading: boolean;
  onViewDetails: (message: Message) => void;
}

export function MessagesTable({
  messages,
  isLoading,
  onViewDetails,
}: MessagesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No messages found
          </h3>
          <p className="text-gray-600 text-center">
            No messages match your current filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message</TableHead>
              <TableHead>Target Departments</TableHead>
              <TableHead>Target Sections</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => {
              const totalRecipients = message.recipients?.length || 0;
              const readCount =
                message.recipients?.filter((r) => r.isRead).length || 0;

              return (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{message.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {message.targetDepartments &&
                      message.targetDepartments.length > 0 ? (
                        message.targetDepartments.map((dept) => (
                          <Badge
                            key={dept}
                            variant="outline"
                            className="text-xs"
                          >
                            <Building2 className="mr-1 h-3 w-3" />
                            {dept}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          All
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {message.targetSections &&
                      message.targetSections.length > 0 ? (
                        message.targetSections.map((section) => (
                          <Badge
                            key={section}
                            variant="outline"
                            className="text-xs"
                          >
                            <MapPin className="mr-1 h-3 w-3" />
                            {section}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          All
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{totalRecipients}</span>
                      {totalRecipients > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-gray-600">
                            {readCount}/{totalRecipients}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(message.createdAt), "MMM d, yyyy")}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(message)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
