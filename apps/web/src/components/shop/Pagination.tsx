"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function Pagination({ meta }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  if (!meta || meta.totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (meta.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= meta.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (meta.page <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", meta.totalPages);
      } else if (meta.page >= meta.totalPages - 2) {
        pages.push(
          1,
          "ellipsis",
          meta.totalPages - 3,
          meta.totalPages - 2,
          meta.totalPages - 1,
          meta.totalPages
        );
      } else {
        pages.push(
          1,
          "ellipsis",
          meta.page - 1,
          meta.page,
          meta.page + 1,
          "ellipsis",
          meta.totalPages
        );
      }
    }

    return pages.map((page, index) => {
      if (page === "ellipsis") {
        return (
          <span key={`ellipsis-${index}`} className="flex h-10 w-10 items-center justify-center">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </span>
        );
      }

      const isActive = page === meta.page;
      return (
        <Button
          key={page}
          variant={isActive ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(page as number)}
          className={`w-10 h-10 p-0 transition-colors ${
            isActive 
              ? "bg-[#ff7200] hover:bg-[#e66a00] text-white border-[#ff7200]" 
              : "text-gray-600 hover:bg-orange-50 hover:text-[#ff7200] hover:border-[#ff7200]"
          }`}
        >
          {page}
        </Button>
      );
    });
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8 md:mt-12 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(meta.page - 1)}
        disabled={meta.page <= 1}
        className="text-gray-600 w-10 h-10 p-0 hover:bg-orange-50 hover:text-[#ff7200] hover:border-[#ff7200]"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center space-x-1 sm:space-x-2">
        {renderPageNumbers()}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(meta.page + 1)}
        disabled={meta.page >= meta.totalPages}
        className="text-gray-600 w-10 h-10 p-0 hover:bg-orange-50 hover:text-[#ff7200] hover:border-[#ff7200]"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
