"use client";
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProductOrderingMutation } from "@/redux/Api/productApi";

interface IProduct {
  id: string;
  title: string;
  mainImages: string[];
  order: number;
}

interface SortableItemProps {
  product: IProduct;
  index: number;
}

const SortableItem = ({ product, index }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between border rounded-lg p-3 mb-2 bg-white cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-3">
        <span className="w-6 text-gray-500 font-semibold">{index + 1}.</span>
        <img
          src={product.mainImages[0]}
          alt={product.title}
          className="w-12 h-12 object-contain rounded"
        />
        <span className="font-medium text-gray-800">{product.title}</span>
      </div>
      <span className="text-gray-400 text-sm">↕</span>
    </div>
  );
};

const SortableProduct = ({ productData }: { productData: IProduct[] }) => {
  const [updateOrdering, { isLoading }] = useUpdateProductOrderingMutation();

  const [products, setProducts] = useState<IProduct[]>(
    productData.map((p, i) => ({ ...p, order: i + 1 }))
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const newOrder = arrayMove(products, oldIndex, newIndex).map((p, i) => ({
        ...p,
        order: i + 1,
      }));

      setProducts(newOrder);
    }
  };

  const handleSave = async () => {
    const toastId = toast.loading("Updating product order...");
    const payload = products.map((p) => ({ id: p.id, order: p.order }));

    const response = await updateOrdering(payload).unwrap();
    if (response?.statusCode === 200) {
      toast.success(response?.message, { id: toastId });
    } else {
      toast.error(response?.message, { id: toastId });
    }
  };

  return (
    <div className="p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={products}
          strategy={verticalListSortingStrategy}
        >
          {products.map((product, index) => (
            <SortableItem key={product.id} product={product} index={index} />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex items-center justify-between gap-4 mt-4">
        <button className="w-1/2 flex items-center justify-center gap-2 px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleSave}
          className="w-1/2 flex items-center justify-center gap-2 px-5 py-2 bg-primary text-white rounded-md hover:bg-primary transition-all"
        >
          <Save className="w-4 h-4" />
          Save Order
        </button>
      </div>
    </div>
  );
};

export default SortableProduct;
