"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Props {
  children: React.ReactNode;
  activeFilterCount?: number;
}

export default function MobileFilterDrawer({
  children,
  activeFilterCount = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const [prevSearchString, setPrevSearchString] = useState(searchString);

  // Close drawer on filter change (URL update)
  if (searchString !== prevSearchString) {
    setPrevSearchString(searchString);
    setOpen(false);
  }

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 w-full px-4 rounded-md border border-orange-300 bg-white text-sm font-medium text-gray-700 hover:border-orange-400 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4 text-orange-500" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold leading-none">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-64 max-w-[85vw] bg-white z-50 shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-sm text-gray-800">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content (scrollable) */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
