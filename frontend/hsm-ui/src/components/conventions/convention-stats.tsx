"use client";

import { useEffect } from "react";
import { useConventions } from "@/hooks/use-conventions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Scale,
  Stethoscope,
  Settings,
} from "lucide-react";

export function ConventionStats() {
  const { stats, isLoading, fetchStats } = useConventions();

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
      title: "Total Conventions",
      value: stats.total,
      description: "All conventions in system",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Active",
      value: stats.active,
      description: "Currently active",
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Inactive",
      value: stats.inactive,
      description: "Deactivated conventions",
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Most Common",
      value: Math.max(
        stats.byType.availability,
        stats.byType.restriction,
        stats.byType.legal,
        stats.byType.medical,
        stats.byType.custom
      ),
      description: "Highest type count",
      icon: Settings,
      color: "text-purple-600",
    },
  ];

  const typeCards = [
    {
      title: "Availability",
      value: stats.byType.availability,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Restriction",
      value: stats.byType.restriction,
      icon: Ban,
      color: "text-orange-600",
    },
    {
      title: "Legal",
      value: stats.byType.legal,
      icon: Scale,
      color: "text-purple-600",
    },
    {
      title: "Medical",
      value: stats.byType.medical,
      icon: Stethoscope,
      color: "text-red-600",
    },
    {
      title: "Custom",
      value: stats.byType.custom,
      icon: Settings,
      color: "text-gray-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Overview</h3>
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
        <h3 className="text-lg font-semibold mb-4">By Type</h3>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
                  <p className="text-xs text-muted-foreground">
                    Active conventions
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
