"use client";

import { UserConventionStats } from "@/types/convention";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Shield, User } from "lucide-react";

interface MyConventionsStatsProps {
  stats: UserConventionStats | null;
  isLoading: boolean;
}

export function MyConventionsStats({
  stats,
  isLoading,
}: MyConventionsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
      description: "All active conventions",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Admin Assigned",
      value: stats.adminAssigned,
      description: "Mandatory conventions",
      icon: Shield,
      color: "text-primary",
    },
    {
      title: "Self Selected",
      value: stats.userSelected,
      description: "Your preferences",
      icon: User,
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
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
  );
}
