"use client";

import { User } from "@/types/auth";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  Stethoscope,
  HeartPulse,
  Building2,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

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

export function UserTable({
  users,
  isLoading,
  onEdit,
  onDelete,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-gray-600">No users found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const RoleIcon = roleIcons[user.role];
            const initials = user.username
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const userWithDept = user as any;

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-gray-500">
                        {user.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={roleColors[user.role]} variant="secondary">
                    <RoleIcon className="mr-1 h-3 w-3" />
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {userWithDept.department ? (
                    <Badge variant="outline" className="gap-1">
                      <Building2 className="h-3 w-3" />
                      {userWithDept.department}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {userWithDept.section ? (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {userWithDept.section}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
