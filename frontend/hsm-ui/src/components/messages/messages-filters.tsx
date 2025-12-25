"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  X,
  Search,
  Building2,
  MapPin,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { MessageFilters } from "@/types/message";

const DEPARTMENTS = [
  "Emergency",
  "Surgery",
  "Pediatrics",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Radiology",
  "Laboratory",
];

const SECTIONS = [
  "ICU",
  "ER",
  "General",
  "OR",
  "CCU",
  "NICU",
  "Outpatient",
  "Inpatient",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

interface MessagesFiltersProps {
  onFilterChange: (filters: MessageFilters) => void;
  isLoading?: boolean;
}

export function MessagesFilters({
  onFilterChange,
  isLoading,
}: MessagesFiltersProps) {
  const [filters, setFilters] = useState<MessageFilters>({
    department: undefined,
    section: undefined,
    priority: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (
    key: keyof MessageFilters,
    value: string | undefined
  ) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: MessageFilters = {
      department: undefined,
      section: undefined,
      priority: undefined,
      startDate: undefined,
      endDate: undefined,
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-gray-600"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="rounded-lg border bg-white p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Department
              </Label>
              <Select
                value={filters.department || ""}
                onValueChange={(value) =>
                  handleFilterChange("department", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Section
              </Label>
              <Select
                value={filters.section || ""}
                onValueChange={(value) => handleFilterChange("section", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sections</SelectItem>
                  {SECTIONS.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Priority
              </Label>
              <Select
                value={filters.priority || ""}
                onValueChange={(value) => handleFilterChange("priority", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.department && (
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {filters.department}
                  <button
                    onClick={() => handleFilterChange("department", undefined)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.section && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {filters.section}
                  <button
                    onClick={() => handleFilterChange("section", undefined)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.priority && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {filters.priority}
                  <button
                    onClick={() => handleFilterChange("priority", undefined)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.startDate && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  From: {filters.startDate}
                  <button
                    onClick={() => handleFilterChange("startDate", undefined)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
