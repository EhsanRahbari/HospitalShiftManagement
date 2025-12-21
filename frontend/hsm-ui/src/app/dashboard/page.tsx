"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ShiftCalendar } from "@/components/shifts/shift-calendar";
import { ShiftStats } from "@/components/shifts/shift-stats";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log("🔍 User Dashboard Check:", {
      isAuthenticated,
      username: user?.username,
      role: user?.role,
    });

    if (!isAuthenticated || !user) {
      console.log("❌ Not authenticated");
      router.push("/login");
      return;
    }

    if (user.role === "ADMIN") {
      console.log("🔄 Admin detected, redirecting");
      router.push("/dashboard/admin");
      return;
    }

    console.log("✅ User authenticated");
  }, [mounted, user, isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role === "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user.username}!
        </h1>
        <p className="text-muted-foreground">
          View your shifts and schedule ({user.role})
        </p>
      </div>

      <ShiftStats />
      <ShiftCalendar />
    </div>
  );
}
