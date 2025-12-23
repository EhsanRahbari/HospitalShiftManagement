"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Shield,
  FileText,
  ChevronDown,
  User2,
  CalendarClock,
  ClipboardList,
  CalendarCheck,
  UserCog,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Admin navigation sections
const adminSections = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/admin",
        icon: LayoutDashboard,
        description: "System overview and statistics",
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
        description: "Manage system users",
      },
      {
        title: "User Conventions",
        url: "/dashboard/conventions",
        icon: FileText,
        description: "Manage work restrictions",
      },
    ],
  },
  {
    label: "Shift Management",
    items: [
      {
        title: "Shift Templates",
        url: "/dashboard/shifts",
        icon: Calendar,
        description: "Create and edit shifts",
      },
      {
        title: "Shift Assignments",
        url: "/dashboard/admin#assign",
        icon: CalendarClock,
        description: "Assign shifts to users",
        badge: "New",
      },
      {
        title: "Schedule Calendar",
        url: "/dashboard/admin#calendar",
        icon: CalendarCheck,
        description: "Visual calendar view",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        description: "System configuration",
      },
    ],
  },
];

// User navigation sections (Doctor, Nurse)
const userSections = [
  {
    label: "My Dashboard",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
        description: "My shift calendar",
      },
    ],
  },
  {
    label: "My Schedule",
    items: [
      {
        title: "My Shifts",
        url: "/dashboard/my-shifts",
        icon: CalendarCheck,
        description: "View assigned shifts",
      },
      {
        title: "My Conventions",
        url: "/dashboard/my-conventions",
        icon: FileText,
        description: "My work preferences",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        description: "Account settings",
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Determine which sections to show based on role
  const navigationSections =
    user?.role === "ADMIN" ? adminSections : userSections;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "DOCTOR":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "NURSE":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-base truncate">HSM System</span>
            <span className="text-xs text-muted-foreground truncate">
              Hospital Shift Management
            </span>
          </div>
        </div>
        <SidebarSeparator />
        {/* User Info Card */}
        <div className="px-4 py-3 bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <Badge
                variant="outline"
                className={`text-xs ${getRoleBadgeColor(user?.role || "")}`}
              >
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationSections.map((section, index) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.url ||
                    (item.url.includes("#") &&
                      pathname === item.url.split("#")[0]);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="group"
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-3"
                        >
                          <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{item.title}</span>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <span className="text-xs text-muted-foreground truncate block">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {index < navigationSections.length - 1 && <SidebarSeparator />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">
                        {user?.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-auto shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                {user?.role !== "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/my-conventions"
                      className="cursor-pointer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      My Conventions
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
