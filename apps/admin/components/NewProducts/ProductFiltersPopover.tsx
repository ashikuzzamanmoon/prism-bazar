import React, { useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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

export type ProductFiltersValue = {
  isPublish: boolean | undefined;
  sortByPrice: "asc" | "desc" | undefined;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
};

type ProductFiltersPopoverProps = {
  values: ProductFiltersValue;
  onChange: (changes: Partial<ProductFiltersValue>) => void;
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

const ProductFiltersPopover = ({
  values,
  onChange,
  onReset,
}: ProductFiltersPopoverProps) => {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeof values.isPublish === "boolean") count += 1;
    if (values.sortByPrice) count += 1;
    if (values.minPrice) count += 1;
    if (values.maxPrice) count += 1;
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
        className="w-[min(92vw,360px)] border-gray-200 p-3"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Select
              value={
                typeof values.isPublish === "boolean"
                  ? String(values.isPublish)
                  : "all"
              }
              onValueChange={(val) =>
                onChange({
                  isPublish: val === "all" ? undefined : val === "true",
                })
              }
            >
              <SelectTrigger className="h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Unpublished</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={values.sortByPrice || "default"}
              onValueChange={(val) =>
                onChange({
                  sortByPrice:
                    val === "default" ? undefined : (val as "asc" | "desc"),
                })
              }
            >
              <SelectTrigger className="h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors">
                <SelectValue placeholder="Sort by Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Sort by Price</SelectItem>
                <SelectItem value="asc">Low to High</SelectItem>
                <SelectItem value="desc">High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min price"
              value={values.minPrice}
              onChange={(e) => onChange({ minPrice: e.target.value })}
              className="h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors placeholder:text-gray-400"
            />

            <Input
              type="number"
              placeholder="Max price"
              value={values.maxPrice}
              onChange={(e) => onChange({ maxPrice: e.target.value })}
              className="h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors placeholder:text-gray-400"
            />

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

export default ProductFiltersPopover;
