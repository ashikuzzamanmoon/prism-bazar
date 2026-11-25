import React, { useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CollectionFiltersValue = {
  isActive: "all" | "true" | "false";
  startDate: string;
  endDate: string;
};

type CollectionFiltersPopoverProps = {
  values: CollectionFiltersValue;
  onChange: (changes: Partial<CollectionFiltersValue>) => void;
  onReset: () => void;
};

const DatePickerField = ({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const dateValue = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left text-sm font-normal bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors",
            !value && "text-gray-400",
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">
            {dateValue ? format(dateValue, "dd MMM yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-lg border-gray-200"
        align="start"
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          initialFocus
        />
        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-500 hover:text-red-500"
              onClick={() => onChange("")}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const CollectionFiltersPopover = ({
  values,
  onChange,
  onReset,
}: CollectionFiltersPopoverProps) => {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (values.isActive !== "all") count += 1;
    if (values.startDate) count += 1;
    if (values.endDate) count += 1;
    return count;
  }, [values]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 border-gray-200 hover:border-gray-300"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,340px)] border-gray-200 p-3"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <Select
              value={values.isActive}
              onValueChange={(val) =>
                onChange({ isActive: val as "all" | "true" | "false" })
              }
            >
              <SelectTrigger className="h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <DatePickerField
              value={values.startDate}
              onChange={(v) => onChange({ startDate: v })}
              placeholder="Start date"
            />

            <DatePickerField
              value={values.endDate}
              onChange={(v) => onChange({ endDate: v })}
              placeholder="End date"
            />
          </div>

          <div className="flex justify-end border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-sm text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 transition-colors px-3"
              onClick={onReset}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CollectionFiltersPopover;
