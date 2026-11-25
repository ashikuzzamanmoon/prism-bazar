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
import { Badge } from "@/components/ui/badge";
import { GripVertical, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  useGetProductFeaturesQuery,
  useGetFeaturesFromProductFeatureQuery,
  useUpdateFeaturesFromProductFeatureMutation,
} from "@/redux/Api/productApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureGroup {
  id: string;
  title: string;
  image: string;
  type: string;
  sortOrder: number;
}

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

// ─── Sortable Item Row ────────────────────────────────────────────────────────

const SortableItemRow = ({
  item,
  index,
}: {
  item: FeatureItem;
  index: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
        isDragging
          ? "shadow-lg border-primary/40"
          : "border-gray-200 hover:border-gray-300"
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

// ─── Step 2: Inner sorter — separate component so it remounts fresh each time ─

const FeatureItemSorter = ({
  groupId,
  onBack,
  onSaved,
}: {
  groupId: string;
  onBack: () => void;
  onSaved: () => void;
}) => {
  const { data: groupRes, isLoading: itemsLoading } =
    useGetFeaturesFromProductFeatureQuery(groupId);

  const apiItems: FeatureItem[] = groupRes?.data?.feature?.features ?? [];

  // Sync once from API into local state (guard with synced flag)
  const [items, setItems] = useState<FeatureItem[]>([]);
  const [synced, setSynced] = useState(false);

  if (!synced && apiItems.length > 0) {
    setItems(apiItems);
    setSynced(true);
  }

  const [updateSorting, { isLoading: isSaving }] =
    useUpdateFeaturesFromProductFeatureMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
      await updateSorting({ id: groupId, data: { sortedFeatures } }).unwrap();
      toast.success("Feature items sorted successfully", {
        id: toastId,
        duration: 1500,
      });
      onSaved();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update sorting", {
        id: toastId,
        duration: 1500,
      });
    }
  };

  if (itemsLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading items...</span>
      </div>
    );
  }

  if (!itemsLoading && items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-10">
        No items found in this feature group.
      </p>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <SortableItemRow key={item.id} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSaving}
          className="h-9"
        >
          Back
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
      </div>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UpdateFeaturesFromProductFeature = ({
  open,
  onOpenChange,
  productId,
}: Props) => {
  const [selectedGroup, setSelectedGroup] = useState<FeatureGroup | null>(null);

  const { data: featuresRes, isLoading: groupsLoading } =
    useGetProductFeaturesQuery(productId, {
      skip: !open || !productId,
    });

  const featureGroups: FeatureGroup[] = featuresRes?.data?.features
    ? [...featuresRes.data.features].sort(
        (a: FeatureGroup, b: FeatureGroup) => a.sortOrder - b.sortOrder,
      )
    : [];

  const handleClose = () => {
    onOpenChange(false);
    setSelectedGroup(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {selectedGroup && (
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <DialogTitle className="text-base font-semibold text-gray-800">
                {selectedGroup
                  ? `Sort: ${selectedGroup.title}`
                  : "Select Feature Group"}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedGroup
                  ? "Drag to reorder items. Save when done."
                  : "Choose a feature group to reorder its items."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 max-h-[420px] overflow-y-auto pr-1">
          {/* Step 1 — group picker */}
          {!selectedGroup && (
            <>
              {groupsLoading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading feature groups...</span>
                </div>
              ) : featureGroups.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">
                  No feature groups found.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {featureGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-all text-left w-full group"
                    >
                      {group.image && (
                        <img
                          src={group.image}
                          alt={group.title}
                          className="w-11 h-11 object-cover rounded-md border border-gray-100 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.png";
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {group.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          Sort order: {group.sortOrder}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          group.type === "SPECIFICATION"
                            ? "border-blue-200 text-blue-700 bg-blue-50 text-xs flex-shrink-0"
                            : "border-purple-200 text-purple-700 bg-purple-50 text-xs flex-shrink-0"
                        }
                      >
                        {group.type}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 2 — key prop forces full remount on every group entry */}
          {selectedGroup && (
            <FeatureItemSorter
              key={selectedGroup.id}
              groupId={selectedGroup.id}
              onBack={() => setSelectedGroup(null)}
              onSaved={handleClose}
            />
          )}
        </div>

        {!selectedGroup && (
          <DialogFooter className="pt-1">
            <Button variant="outline" onClick={handleClose} className="h-9">
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateFeaturesFromProductFeature;
