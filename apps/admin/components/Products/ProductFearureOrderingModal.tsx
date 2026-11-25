import React, { useState, useEffect } from "react";
import { GripVertical, Check, X, Pencil } from "lucide-react";
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
import { Button } from "../ui/button";
import { useUpdateProductAdditionFeatureMutation } from "@/redux/Api/productApi";
import { toast } from "sonner";
import { IProduct } from "@/types/products.type";

// Types
interface Feature {
  key: string;
  value: string;
  id: string; // Added for dnd-kit
}

interface EditingFeature extends Feature {
  index: number;
}

interface ProductData {
  features: Record<string, string>;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface FeatureItemProps {
  feature: Feature;
  index: number;
  onEdit: () => void;
}

interface EditModalProps {
  feature: EditingFeature;
  onSave: (newValue: string) => void;
  onClose: () => void;
}

interface ProductFeatureOrderingModalProps {
  productData: IProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock Dialog components
const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div onClick={() => onOpenChange(false)} className="absolute inset-0" />
      <div className="relative">{children}</div>
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
}) => <div className={className}>{children}</div>;

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => (
  <h2 className="text-2xl font-semibold">{children}</h2>
);

const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className,
}) => <p className={className}>{children}</p>;

// Sortable Feature Item Component
const SortableFeatureItem: React.FC<FeatureItemProps> = ({
  feature,
  index,
  onEdit,
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${
        isDragging ? "shadow-lg z-50" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
      </div>

      <div className="flex-1">
        <div className="font-semibold text-gray-700">{feature.key}</div>
        <div className="text-sm text-gray-600">{feature.value}</div>
      </div>

      <button
        onClick={onEdit}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit value"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
};

// Edit Modal Component
const EditModal: React.FC<EditModalProps> = ({ feature, onSave, onClose }) => {
  const [value, setValue] = useState<string>(feature.value);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Edit {feature.key}</h3>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="Enter feature value..."
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(value)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Modal Component
const ProductFeatureOrderingModal: React.FC<
  ProductFeatureOrderingModalProps
> = ({ productData, open, onOpenChange }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [editingFeature, setEditingFeature] = useState<EditingFeature | null>(
    null
  );
  const [updatedProductFeatures, { isLoading }] =
    useUpdateProductAdditionFeatureMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (productData?.features) {
      const featuresArray: Feature[] = Object.entries(productData.features).map(
        ([key, value], index) => ({
          key,
          value,
          id: `${key}-${index}`, // Unique ID for dnd-kit
        })
      );
      setFeatures(featuresArray);
    }
  }, [productData]);

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFeatures((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEdit = (index: number, newValue: string): void => {
    const newFeatures = [...features];
    newFeatures[index].value = newValue;
    setFeatures(newFeatures);
    setEditingFeature(null);
  };

  const handleSave = async () => {
    const updatedFeatures: Record<string, string> = features.reduce(
      (acc, feature) => {
        acc[feature.key] = feature.value;
        return acc;
      },
      {} as Record<string, string>
    );
    const toastId = toast.loading("Updating....");
    try {
      const response = await updatedProductFeatures({
        id: productData.id,
        data: updatedFeatures,
      }).unwrap();
      console.log("response is", response)
      if (response?.statusCode === 200) {
        toast.success(response?.message, { id: toastId, duration: 1000 });
        onOpenChange(false);
      } else {
        toast.error(response?.message | response?.data?.message, {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      toast.error(error?.message | error?.data?.message, {
        id: toastId,
        duration: 1000,
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-white rounded-lg border-0 max-h-[90vh] overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>Product Features - Drag to Reorder</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 sr-only">
              Drag items by the grip handle to reorder, or click the pencil icon
              to edit values
            </DialogDescription>
          </DialogHeader>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={features.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 mt-6">
                {features.map((feature, index) => (
                  <SortableFeatureItem
                    key={feature.id}
                    feature={feature}
                    index={index}
                    onEdit={() => setEditingFeature({ ...feature, index })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className=" bg-red-100 text-red-500 hover:bg-red-50 hover:text-red-500"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {editingFeature && (
        <EditModal
          feature={editingFeature}
          onSave={(newValue) => handleEdit(editingFeature.index, newValue)}
          onClose={() => setEditingFeature(null)}
        />
      )}
    </>
  );
};

export default ProductFeatureOrderingModal;
