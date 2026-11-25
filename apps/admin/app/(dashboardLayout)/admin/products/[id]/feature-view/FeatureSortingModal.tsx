"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { IProductFeatures } from "./page";
import { useUpdateProductFeatureOrderingMutation } from "@/redux/Api/productApi";
import { toast } from "sonner";

interface Feature {
  id: string;
  title: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // extra fields like image
}

interface FeatureSortingModalProps {
  features: Feature[];
}

const SortableFeatureItem = ({ feature }: { feature: Feature }) => {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="text-sm font-medium flex-1">{feature.title}</span>
    </div>
  );
};

const FeatureSortingModal = ({
  features,
}: {
  features: IProductFeatures[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortedFeatures, setSortedFeatures] = useState<Feature[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [updateProductFeaturesOrdering, { isLoading }] =
    useUpdateProductFeatureOrderingMutation();

  useEffect(() => {
    // Sort by order initially
    const sorted = [...features].sort((a, b) => a.order - b.order);
    setSortedFeatures(sorted);
  }, [features]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSortedFeatures((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const updated = arrayMove(items, oldIndex, newIndex);

      // Update order based on new position
      return updated.map((item, index) => ({ ...item, order: index + 1 }));
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toastId = toast.loading("Updating product order...");
      const payload = sortedFeatures.map(({ id, order }) => ({ id, order }));
      const response = await updateProductFeaturesOrdering(payload).unwrap();
      if (response?.statusCode === 200) {
        toast.success(response?.message, { id: toastId });
        setIsOpen(false);
      } else {
        toast.error(response?.message, { id: toastId });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      const sorted = [...features].sort((a, b) => a.order - b.order);
      setSortedFeatures(sorted);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="bg-primary text-white">
          Sorting
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sort Features</DialogTitle>
          <DialogDescription>
            Drag and drop to reorder features. The order will be saved when you
            click Save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-72 overflow-y-auto">
          {sortedFeatures.length ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedFeatures.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedFeatures.map((feature) => (
                  <SortableFeatureItem key={feature.id} feature={feature} />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              No features to sort
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-primary text-white"
          >
            {isSaving ? "Saving..." : "Save Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureSortingModal;
