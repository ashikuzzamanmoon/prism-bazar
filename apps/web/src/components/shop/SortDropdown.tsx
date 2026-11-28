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
  { label: "ডিফল্ট সাজানো", value: "" },
  { label: "মূল্য: কম থেকে বেশি", value: "asc" },
  { label: "মূল্য: বেশি থেকে কম", value: "desc" },
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
          className="min-w-45 cursor-pointer justify-between border-gray-200 text-gray-700 text-sm font-medium hover:text-emerald-700 hover:bg-emerald-50/50 hover:border-emerald-400 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    ? "bg-emerald-600 text-white focus:bg-emerald-600 focus:text-white"
                    : "text-gray-700 focus:bg-emerald-50 focus:text-emerald-800"
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
