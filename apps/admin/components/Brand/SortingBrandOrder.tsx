"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GripVertical, Loader2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllBrandsQuery,
  useUpdateBrandOrderingMutation,
} from "@/redux/Api/brandApi";
import { IBrand } from "./ManageBrands";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────

const SortableBrandRow = ({
  brand,
  index,
}: {
  brand: IBrand;
  index: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: brand.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-white transition-shadow ${
        isDragging
          ? "shadow-lg border-primary/40"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none shrink-0"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Sort order badge */}
      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
        {index + 1}
      </span>

      {/* Image */}
      <img
        src={brand.image}
        alt={brand.title}
        className="w-10 h-10 object-contain rounded-md border border-gray-100 shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder.png";
        }}
      />

      {/* Title */}
      <p className="text-sm font-medium text-gray-800 flex-1 truncate">
        {brand.title}
      </p>

      {/* Slug */}
      <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
        {brand.slug}
      </span>
    </div>
  );
};

// ─── Trigger Button ───────────────────────────────────────────────────────────

export const SortingBrandOrderButton = ({
  onClick,
}: {
  onClick: () => void;
}) => (
  <Button variant="outline" size="sm" className="h-9" onClick={onClick}>
    <ArrowUpDown className="h-4 w-4 mr-2" />
    Sort Order
  </Button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SortingBrandOrder = ({ open, onOpenChange }: Props) => {
  const [brands, setBrands] = useState<IBrand[]>([]);

  const { data: fetchData, isLoading } = useGetAllBrandsQuery(
    {},
    { skip: !open },
  );

  const [updateBrandOrdering, { isLoading: isSaving }] =
    useUpdateBrandOrderingMutation();

  // Populate & sort by existing order on data load
  useEffect(() => {
    if (fetchData?.data?.data) {
      const sorted = [...fetchData.data.data]
        .filter((b: IBrand) => !b.isDelete)
        .sort((a: IBrand, b: IBrand) => a.order - b.order);
      setBrands(sorted);
    }
  }, [fetchData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBrands((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    // Build payload: [{ id, order }]
    const orderingData = brands.map((b, index) => ({
      id: b.id,
      order: index + 1,
    }));

    const toastId = toast.loading("Saving sort order...");
    try {
      await updateBrandOrdering(orderingData).unwrap();
      toast.success("Brand order updated successfully", {
        id: toastId,
        duration: 1500,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update order", {
        id: toastId,
        duration: 1500,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-800">
            Sort Brand Order
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Drag to reorder brands. Changes apply after saving.
          </p>
        </DialogHeader>

        {/* Body */}
        <div className="py-2 max-h-105 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading brands...</span>
            </div>
          ) : brands.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">
              No brands found.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={brands.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {brands.map((brand, index) => (
                    <SortableBrandRow
                      key={brand.id}
                      brand={brand}
                      index={index}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <DialogFooter className="gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading || brands.length === 0}
            className="h-9 bg-primary/90 hover:bg-primary text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SortingBrandOrder;
