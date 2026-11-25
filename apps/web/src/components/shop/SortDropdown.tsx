"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { label: "Default Sorting", value: "" },
  { label: "Price: Low to High", value: "asc" },
  { label: "Price: High to Low", value: "desc" },
];

export default function SortDropdown({ activeSort }: { activeSort?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sortByPrice", value);
    else params.delete("sortByPrice");
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeLabel =
    SORT_OPTIONS.find((opt) => opt.value === (activeSort ?? ""))?.label ??
    "Default Sorting";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-w-45 cursor-pointer justify-between border-gray-300 text-gray-700 text-sm font-normal hover:text-primary hover:bg-white hover:border-orange-400 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {activeLabel}
          <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-45 p-1 shadow-md border border-gray-100"
      >
        {SORT_OPTIONS.map((opt) => {
          const isActive = (activeSort ?? "") === opt.value;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => handleSort(opt.value)}
              className={`flex items-center justify-between text-sm rounded-md px-3 py-2 cursor-pointer
                ${
                  isActive
                    ? "bg-orange-500 text-white focus:bg-orange-500 focus:text-white"
                    : "text-gray-700 focus:bg-gray-50 focus:text-gray-700"
                }
              `}
            >
              {opt.label}
              {isActive && <Check className="w-4 h-4 ml-2 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
