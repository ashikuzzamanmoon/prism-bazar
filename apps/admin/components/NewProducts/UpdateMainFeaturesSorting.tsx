"use client";

import React, { useState } from "react";
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
import { GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetSingleProductQuery,
  useUpdateMainFeaturesMutation,
} from "@/redux/Api/productApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureItem {
  id: number;
  key: string;
  value: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string;
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────

const SortableRow = ({ item, index }: { item: FeatureItem; index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-white transition-shadow ${
        isDragging ? "shadow-lg border-primary/40" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none flex-shrink-0"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.key}</p>
        <p className="text-xs text-gray-400 truncate">{item.value}</p>
      </div>
    </div>
  );
};

// ─── Inner component — remounts fresh per open ────────────────────────────────

const Sorter = ({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) => {
  const { data: productRes, isLoading } = useGetSingleProductQuery(productId);
  const apiFeatures: FeatureItem[] = productRes?.data?.features ?? [];

  const [items, setItems] = useState<FeatureItem[]>([]);
  const [synced, setSynced] = useState(false);

  if (!synced && apiFeatures.length > 0) {
    setItems(apiFeatures);
    setSynced(true);
  }

  const [updateMainFeatures, { isLoading: isSaving }] = useUpdateMainFeaturesMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    const sortedFeatures = items.map((item, index) => ({
      id: index + 1,
      key: item.key,
      value: item.value,
    }));

    const toastId = toast.loading("Saving sort order...");
    try {
      await updateMainFeatures({ id: productId, data: { sortedFeatures } }).unwrap();
      toast.success("Main features sorted successfully", { id: toastId, duration: 1500 });
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update sorting", { id: toastId, duration: 1500 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading features...</span>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-10">
        No features found for this product.
      </p>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <SortableRow key={item.id} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <DialogFooter className="gap-2 pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving} className="h-9">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
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
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UpdateMainFeaturesSorting = ({ open, onOpenChange, productId }: Props) => {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-800">
            Update Main Features Sorting
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Drag to reorder features. Changes apply after saving.
          </p>
        </DialogHeader>

        <div className="py-2 max-h-[420px] overflow-y-auto pr-1">
          {/* key forces full remount on every open so state is always fresh */}
          {open && (
            <Sorter key={`${productId}-${open}`} productId={productId} onClose={handleClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMainFeaturesSorting;