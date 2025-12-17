"use client";

import { useEffect } from "react";
import { useShifts } from "@/hooks/use-shifts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Briefcase,
  PhoneCall,
  AlertTriangle,
} from "lucide-react";

export function ShiftStats() {
  const { stats, isLoading, fetchStats } = useShifts();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statusCards = [
    {
      title: "Total Shifts",
      value: stats.total,
      description: "All shifts in the system",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Scheduled",
      value: stats.scheduled,
      description: "Upcoming shifts",
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Completed",
      value: stats.completed,
      description: "Finished shifts",
      icon: CheckCircle2,
      color: "text-purple-600",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      description: "Cancelled shifts",
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  const typeCards = [
    {
      title: "Regular",
      value: stats.byType.regular,
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      title: "Overtime",
      value: stats.byType.overtime,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "On Call",
      value: stats.byType.onCall,
      icon: PhoneCall,
      color: "text-purple-600",
    },
    {
      title: "Emergency",
      value: stats.byType.emergency,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Shift Status</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Type Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Scheduled by Type</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {typeCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">Active shifts</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
