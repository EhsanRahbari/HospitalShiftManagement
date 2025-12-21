"use client";

import { Convention, ConventionType } from "@/types/convention";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Ban, Scale, Stethoscope, Settings } from "lucide-react";

interface ConventionBrowserProps {
  conventions: Convention[];
  selectedIds: string[];
  onToggle: (conventionId: string) => void;
  disabled?: boolean;
}

export function ConventionBrowser({
  conventions,
  selectedIds,
  onToggle,
  disabled = false,
}: ConventionBrowserProps) {
  const getTypeIcon = (type: ConventionType) => {
    const iconProps = { className: "h-5 w-5" };

    switch (type) {
      case ConventionType.AVAILABILITY:
        return <Clock {...iconProps} className="h-5 w-5 text-blue-600" />;
      case ConventionType.RESTRICTION:
        return <Ban {...iconProps} className="h-5 w-5 text-orange-600" />;
      case ConventionType.LEGAL:
        return <Scale {...iconProps} className="h-5 w-5 text-purple-600" />;
      case ConventionType.MEDICAL:
        return <Stethoscope {...iconProps} className="h-5 w-5 text-red-600" />;
      case ConventionType.CUSTOM:
        return <Settings {...iconProps} className="h-5 w-5 text-gray-600" />;
      default:
        return <Settings {...iconProps} />;
    }
  };

  const getTypeBadge = (type: ConventionType) => {
    const colors: Record<ConventionType, string> = {
      [ConventionType.AVAILABILITY]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      [ConventionType.RESTRICTION]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      [ConventionType.LEGAL]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      [ConventionType.MEDICAL]:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      [ConventionType.CUSTOM]:
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };

    return (
      <Badge variant="outline" className={colors[type]}>
        {type}
      </Badge>
    );
  };

  // Group conventions by type
  const groupedConventions = conventions.reduce((acc, convention) => {
    if (!acc[convention.type]) {
      acc[convention.type] = [];
    }
    acc[convention.type].push(convention);
    return acc;
  }, {} as Record<ConventionType, Convention[]>);

  const typeOrder = [
    ConventionType.AVAILABILITY,
    ConventionType.RESTRICTION,
    ConventionType.LEGAL,
    ConventionType.MEDICAL,
    ConventionType.CUSTOM,
  ];

  if (conventions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No conventions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {typeOrder.map((type) => {
        const typeConventions = groupedConventions[type];
        if (!typeConventions || typeConventions.length === 0) return null;

        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              {getTypeIcon(type)}
              <h3 className="font-semibold">{type}</h3>
              <span className="text-sm text-muted-foreground">
                ({typeConventions.length})
              </span>
            </div>

            <div className="grid gap-3">
              {typeConventions.map((convention) => {
                const isSelected = selectedIds.includes(convention.id);

                return (
                  <Card
                    key={convention.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !disabled && onToggle(convention.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              !disabled && onToggle(convention.id)
                            }
                            disabled={disabled}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              {convention.title}
                            </CardTitle>
                            {convention.description && (
                              <CardDescription className="mt-1">
                                {convention.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        {getTypeBadge(convention.type)}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
