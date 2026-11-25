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
import { Badge } from "@/components/ui/badge";
import { GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetProductFeaturesQuery,
  useUpdateProductFeaturesSortingMutation,
} from "@/redux/Api/productApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureItem {
  id: string;
  title: string;
  image: string;
  type: string;
  sortOrder: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string;
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────

const SortableFeatureRow = ({
  feature,
  index,
}: {
  feature: FeatureItem;
  index: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

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
      {feature.image && (
        <img
          src={feature.image}
          alt={feature.title}
          className="w-12 h-12 object-cover rounded-md border border-gray-100 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.png";
          }}
        />
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-800 flex-1 truncate">
        {feature.title}
      </p>

      {/* Type badge */}
      <Badge
        variant="outline"
        className={
          feature.type === "SPECIFICATION"
            ? "border-blue-200 text-blue-700 bg-blue-50 text-xs shrink-0"
            : "border-purple-200 text-purple-700 bg-purple-50 text-xs shrink-0"
        }
      >
        {feature.type}
      </Badge>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UpdateProductFeatureSorting = ({
  open,
  onOpenChange,
  productId,
}: Props) => {
  const [features, setFeatures] = useState<FeatureItem[]>([]);

  const { data: featuresRes, isLoading } = useGetProductFeaturesQuery(
    productId,
    {
      skip: !open || !productId,
    },
  );

  const [updateSorting, { isLoading: isSaving }] =
    useUpdateProductFeaturesSortingMutation();

  // Populate features on data load
  useEffect(() => {
    if (featuresRes?.data?.features) {
      const sorted = [...featuresRes.data.features].sort(
        (a: FeatureItem, b: FeatureItem) => a.sortOrder - b.sortOrder,
      );
      setFeatures(sorted);
    }
  }, [featuresRes]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFeatures((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    const sortingData = features.map((f, index) => ({
      featureId: f.id,
      sortOrder: index + 1,
    }));

    const toastId = toast.loading("Saving sort order...");
    try {
      await updateSorting({ id: productId, data: { sortingData } }).unwrap();
      toast.success("Feature sorting updated successfully", {
        id: toastId,
        duration: 1500,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update sorting", {
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
            Update Product Features Sorting
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Drag to reorder features. Changes apply after saving.
          </p>
        </DialogHeader>

        {/* Body */}
        <div className="py-2 max-h-105 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading features...</span>
            </div>
          ) : features.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">
              No features found for this product.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={features.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {features.map((feature, index) => (
                    <SortableFeatureRow
                      key={feature.id}
                      feature={feature}
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
            disabled={isSaving || isLoading || features.length === 0}
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

export default UpdateProductFeatureSorting;
