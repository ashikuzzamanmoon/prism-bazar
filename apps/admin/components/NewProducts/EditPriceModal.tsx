"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useUpdateProductPriceStockMutation } from "@/redux/Api/productApi";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const inventoryUpdateSchema = z.object({
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Price must be a positive number",
    }),
  inventoryQuantity: z
    .string()
    .min(1, "Inventory quantity is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Quantity must be a non-negative number",
    }),
  colorStocks: z
    .array(
      z.object({
        colorId: z.string().min(1, "Color ID is required"),
        colorName: z.string().optional(), // display only, not sent to backend
        stock: z
          .string()
          .min(1, "Stock is required")
          .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: "Stock must be a non-negative number",
          }),
      }),
    )
    .optional(),
});

export type InventoryUpdateFormValues = z.infer<typeof inventoryUpdateSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColorStock {
  colorId: string;
  colorName?: string;
  stock: number;
}

interface EditPriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productData: {
    id: string;
    title: string;
    price: string;
    inventoryQuantity?: number;
    colorStocks?: ColorStock[];
  };
  onSuccess?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EditPriceModal = ({
  open,
  onOpenChange,
  productData,
  onSuccess,
}: EditPriceModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateInventory] = useUpdateProductPriceStockMutation();

  const form = useForm<InventoryUpdateFormValues>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      price: "",
      inventoryQuantity: "",
      colorStocks: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "colorStocks",
  });

  // Pre-fill with current product data whenever dialog opens
  useEffect(() => {
    if (open && productData) {
      form.reset({
        price: productData.price ?? "",
        inventoryQuantity: productData.inventoryQuantity?.toString() ?? "0",
        colorStocks:
          productData.colorStocks?.map((cs) => ({
            colorId: cs.colorId,
            colorName: cs.colorName ?? "",
            stock: cs.stock.toString(),
          })) ?? [],
      });
    }
  }, [open, productData, form]);

  const handleSubmit = async (data: InventoryUpdateFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating inventory...");

    try {
      // Only send colorId + stock — colorName is display-only
      const payload = {
        price: Number(data.price),
        inventoryQuantity: Number(data.inventoryQuantity),
        colorStocks: data.colorStocks?.map((cs) => ({
          colorId: cs.colorId,
          stock: Number(cs.stock),
        })),
      };

      const response = await updateInventory({
        id: productData.id,
        data: payload,
      }).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        onOpenChange(false);
        form.reset();
        toast.success(response?.message || "Inventory updated successfully!", {
          id: toastId,
          duration: 1000,
        });
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to update inventory",
        { id: toastId, duration: 1000 },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Product Inventory</DialogTitle>
          <DialogDescription asChild>
            <span className="font-semibold text-gray-700">
              {productData?.title}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Price <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      {...field}
                      disabled={isSubmitting}
                      className="py-6"
                      min="0"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Inventory Quantity */}
            <FormField
              control={form.control}
              name="inventoryQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Total Inventory Quantity{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter total quantity"
                      {...field}
                      disabled={isSubmitting}
                      className="py-6"
                      min="0"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Stocks — fixed list, only stock is editable */}
            {fields.length > 0 && (
              <div className="space-y-3">
                <FormLabel>Color Stocks</FormLabel>

                {fields.map((field, index) => {
                  const colorName = form.watch(`colorStocks.${index}.colorName`);

                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                    >
                      {/* Color label (read-only) */}
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Color</p>
                        <p className="text-sm font-medium text-gray-800">
                          {colorName || "—"}
                        </p>
                      </div>

                      {/* Stock input */}
                      <div className="w-36">
                        <FormField
                          control={form.control}
                          name={`colorStocks.${index}.stock`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Stock</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  disabled={isSubmitting}
                                  min="0"
                                  step="1"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceModal;