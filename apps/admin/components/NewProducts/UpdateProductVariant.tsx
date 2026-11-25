"use client";

import React, { useEffect, useState } from "react";
import {
  Control,
  FieldArrayWithId,
  FieldValues,
  Path,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { fileUpload } from "@/actions/file";
import {
  useGetUpdateProductMutation,
  useGetUpdateProductVariantMutation,
} from "@/redux/Api/productApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExistingColorImage {
  id?: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface ExistingColor {
  id: string;
  name: string;
  hexCode?: string;
  stock: number;
  basePrice: string | number;
  isPublish?: boolean;
  images?: ExistingColorImage[];
}

interface ExistingOptionValue {
  id: string;
  value: string;
  extraPrice: string | number;
  isPublish?: boolean;
}

interface ExistingOptionGroup {
  id: string;
  title: string;
  type: "RAM" | "STORAGE" | "KEYBOARD";
  isPublish?: boolean;
  options?: ExistingOptionValue[];
}

interface ProductVariantData {
  id: string;
  title: string;
  productColors?: ExistingColor[];
  productOptionGroups?: ExistingOptionGroup[];
}

interface UpdateProductVariantProps {
  productData: ProductVariantData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const colorImageSchema = z.object({
  url: z.string().optional(),
  altText: z.string().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const colorSchema = z.object({
  name: z.string().min(1, "Color name is required"),
  hexCode: z.string().optional(),
  stock: z.number().int().min(0, "Stock must be >= 0"),
  basePrice: z.number().min(0, "Base price must be >= 0"),
  isPublish: z.boolean().optional(),
  images: z.array(colorImageSchema).optional(),
});

const optionValueSchema = z.object({
  value: z.string().min(1, "Value is required"),
  extraPrice: z.number().min(0, "Extra price must be >= 0"),
  isPublish: z.boolean().optional(),
});

const optionGroupSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["RAM", "STORAGE", "KEYBOARD"]),
  isPublish: z.boolean().optional(),
  options: z.array(optionValueSchema).min(1, "Add at least one option value"),
});

const updateVariantSchema = z.object({
  // NOTE: useFieldArray expects arrays in form state; we still keep these optional in schema,
  // but defaultValues provide [] so the form stays consistent.
  colors: z.array(colorSchema).optional(),
  options: z.array(optionGroupSchema).optional(),
});

type UpdateVariantFormValues = z.infer<typeof updateVariantSchema>;

const OPTION_TYPES = ["RAM", "STORAGE", "KEYBOARD"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

type NewPreview = {
  file: File;
  preview: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
};

type UploadedColorImage = {
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
};

// ─── Color Section ────────────────────────────────────────────────────────────

interface ColorSectionProps {
  control: Control<UpdateVariantFormValues>;
  colorIdx: number;
  onRemove: () => void;
  // New files uploaded in this session
  colorFiles: File[];
  onColorFilesChange: (files: File[]) => void;
  // Existing images from API
  existingImages: ExistingColorImage[];
  onExistingImagesChange: (images: ExistingColorImage[]) => void;
}

const ColorSection = ({
  control,
  colorIdx,
  onRemove,
  colorFiles,
  onColorFilesChange,
  existingImages,
  onExistingImagesChange,
}: ColorSectionProps) => {
  const [newPreviews, setNewPreviews] = useState<NewPreview[]>([]);

  // prevent unused var errors in strict lint setups
  void colorFiles;

  // cleanup object URLs
  useEffect(() => {
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [newPreviews]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const previews: NewPreview[] = files.map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      altText: "",
      isPrimary:
        existingImages.length === 0 && newPreviews.length === 0 && i === 0,
      sortOrder: existingImages.length + newPreviews.length + i + 1,
    }));

    const updated = [...newPreviews, ...previews];
    setNewPreviews(updated);
    onColorFilesChange(updated.map((p) => p.file));

    // reset input so re-selecting the same files triggers onChange again
    e.target.value = "";
  };

  const removeNewImage = (idx: number) => {
    const toRemove = newPreviews[idx];
    if (toRemove) URL.revokeObjectURL(toRemove.preview);

    const updated = newPreviews.filter((_, i) => i !== idx);
    setNewPreviews(updated);
    onColorFilesChange(updated.map((p) => p.file));
  };

  const updateNewPreviewMeta = (
    idx: number,
    patch: Partial<Pick<NewPreview, "altText" | "isPrimary" | "sortOrder">>,
  ) => {
    setNewPreviews((prev) => {
      const updated = [...prev];
      const current = updated[idx];
      if (!current) return prev;

      updated[idx] = { ...current, ...patch };

      if (patch.isPrimary) {
        updated.forEach((p, i) => {
          if (i !== idx) p.isPrimary = false;
        });
        // also unset primary on existing
        onExistingImagesChange(
          existingImages.map((img) => ({ ...img, isPrimary: false })),
        );
      }

      return updated;
    });
  };

  const removeExistingImage = (idx: number) => {
    onExistingImagesChange(existingImages.filter((_, i) => i !== idx));
  };

  const updateExistingImageMeta = (
    idx: number,
    patch: Partial<ExistingColorImage>,
  ) => {
    const updated = [...existingImages];
    const current = updated[idx];
    if (!current) return;

    updated[idx] = { ...current, ...patch };

    if (patch.isPrimary) {
      updated.forEach((img, i) => {
        if (i !== idx) img.isPrimary = false;
      });
      // also unset primary on new previews
      setNewPreviews((prev) => prev.map((p) => ({ ...p, isPrimary: false })));
    }

    onExistingImagesChange(updated);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4 relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Color Name, Hex, Stock, Base Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
        <FormField
          control={control}
          name={`colors.${colorIdx}.name` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Color Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Silver" className="h-10" {...field} />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`colors.${colorIdx}.hexCode` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Hex Code
              </FormLabel>
              <FormControl>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Input
                      placeholder="#C0C0C0"
                      className="h-10 pr-10"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                    {!!field.value && (
                      <span
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: field.value }}
                      />
                    )}
                  </div>
                  <input
                    type="color"
                    value={field.value ?? "#000000"}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border border-gray-300 p-1"
                    title="Pick color"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`colors.${colorIdx}.stock` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Stock <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="h-10"
                  value={field.value ?? 0}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? "" : e.target.valueAsNumber);
                  }}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`colors.${colorIdx}.basePrice` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Base Price <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
                    ৳
                  </span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="h-10 pl-7"
                    value={field.value ?? 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? "" : e.target.valueAsNumber);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
      </div>

      {/* isPublish */}
      <FormField
        control={control}
        name={`colors.${colorIdx}.isPublish` as any}
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 space-y-0">
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <Label className="text-sm text-gray-600 cursor-pointer">
              Publish this color variant
            </Label>
          </FormItem>
        )}
      />

      <Separator />

      {/* Images */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Color Images</p>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Current Images</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {existingImages.map((img, imgIdx) => (
                <div
                  key={img.id ?? `${img.url}-${imgIdx}`}
                  className="flex gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <img
                    src={img.url}
                    alt={img.altText ?? `image-${imgIdx}`}
                    className="w-16 h-16 object-cover rounded-md border border-gray-200 shrink-0"
                  />
                  <div className="w-[75%] space-y-2">
                    <Input
                      placeholder="Alt text"
                      value={img.altText ?? ""}
                      onChange={(e) =>
                        updateExistingImageMeta(imgIdx, {
                          altText: e.target.value,
                        })
                      }
                      className="h-8 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Order"
                        value={img.sortOrder ?? imgIdx + 1}
                        onChange={(e) =>
                          updateExistingImageMeta(imgIdx, {
                            sortOrder: e.target.valueAsNumber || imgIdx + 1,
                          })
                        }
                        className="h-8 text-sm w-20"
                      />
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={img.isPrimary ?? false}
                          onCheckedChange={(checked) =>
                            updateExistingImageMeta(imgIdx, {
                              isPrimary: checked,
                            })
                          }
                        />
                        <span className="text-xs text-gray-600">Primary</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 ml-auto"
                        onClick={() => removeExistingImage(imgIdx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New image upload */}
        <div className="space-y-2">
          {existingImages.length > 0 && (
            <p className="text-xs text-gray-500 font-medium">Add New Images</p>
          )}
          <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-sm gap-1">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />
            <Plus className="h-5 w-5" />
            <span>Upload Images (multiple allowed)</span>
          </label>

          {newPreviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {newPreviews.map((item, imgIdx) => (
                <div
                  key={item.preview}
                  className="flex gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/30"
                >
                  <img
                    src={item.preview}
                    alt={`new-preview-${imgIdx}`}
                    className="w-16 h-16 object-cover rounded-md border border-gray-200 shrink-0"
                  />
                  <div className="w-[75%] space-y-2">
                    <Input
                      placeholder="Alt text"
                      value={item.altText}
                      onChange={(e) =>
                        updateNewPreviewMeta(imgIdx, {
                          altText: e.target.value,
                        })
                      }
                      className="h-8 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Order"
                        value={item.sortOrder}
                        onChange={(e) =>
                          updateNewPreviewMeta(imgIdx, {
                            sortOrder: e.target.valueAsNumber || imgIdx + 1,
                          })
                        }
                        className="h-8 text-sm w-20"
                      />
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={item.isPrimary}
                          onCheckedChange={(checked) =>
                            updateNewPreviewMeta(imgIdx, { isPrimary: checked })
                          }
                        />
                        <span className="text-xs text-gray-600">Primary</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 ml-auto"
                        onClick={() => removeNewImage(imgIdx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Option Group Section ─────────────────────────────────────────────────────

interface OptionGroupSectionProps {
  control: Control<UpdateVariantFormValues>;
  groupIdx: number;
  onRemove: () => void;
}

const OptionGroupSection = ({
  control,
  groupIdx,
  onRemove,
}: OptionGroupSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `options.${groupIdx}.options` as const,
  });

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4 relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
        <FormField
          control={control}
          name={`options.${groupIdx}.title` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Option Title <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. RAM" className="h-10" {...field} />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`options.${groupIdx}.type` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? "RAM"}
              >
                <FormControl>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {OPTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`options.${groupIdx}.isPublish` as any}
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 space-y-0">
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <Label className="text-sm text-gray-600 cursor-pointer">
              Publish this option group
            </Label>
          </FormItem>
        )}
      />

      <Separator />

      {/* Option Values */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Option Values</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ value: "", extraPrice: 0, isPublish: false })
            }
            className="h-8 text-sm hover:bg-primary hover:text-white cursor-pointer"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Value
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-3">
            No values yet. Click "Add Value" to get started.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-3 px-1">
              <span className="col-span-5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Value
              </span>
              <span className="col-span-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Extra Price
              </span>
              <span className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Publish
              </span>
              <span className="col-span-1" />
            </div>

            {fields.map((item, valueIdx) => (
              <div
                key={(item as any).id ?? valueIdx}
                className="grid grid-cols-12 gap-3 items-center"
              >
                <FormField
                  control={control}
                  name={`options.${groupIdx}.options.${valueIdx}.value` as any}
                  render={({ field }) => (
                    <FormItem className="col-span-5 space-y-0">
                      <FormControl>
                        <Input
                          placeholder="e.g. 8GB"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={
                    `options.${groupIdx}.options.${valueIdx}.extraPrice` as any
                  }
                  render={({ field }) => (
                    <FormItem className="col-span-4 space-y-0">
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-base">
                            ৳
                          </span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-9 pl-6"
                            value={field.value ?? 0}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(
                                val === "" ? "" : e.target.valueAsNumber,
                              );
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={
                    `options.${groupIdx}.options.${valueIdx}.isPublish` as any
                  }
                  render={({ field }) => (
                    <FormItem className="col-span-2 space-y-0 flex justify-center">
                      <FormControl>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-500 hover:text-red-600"
                    onClick={() => remove(valueIdx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <FormField
          control={control}
          name={`options.${groupIdx}.options` as Path<UpdateVariantFormValues>}
          render={() => <FormMessage />}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UpdateProductVariant = ({
  productData,
  open,
  onOpenChange,
}: UpdateProductVariantProps) => {
  const [updateProductVariants, { isLoading: updating }] =
    useGetUpdateProductVariantMutation();

  // Per-color: new files + existing images state
  const [colorFilesByIndex, setColorFilesByIndex] = useState<
    Record<number, File[]>
  >({});
  const [existingImagesByIndex, setExistingImagesByIndex] = useState<
    Record<number, ExistingColorImage[]>
  >({});

  // ── Form ──
  const form = useForm<UpdateVariantFormValues>({
    resolver: zodResolver(updateVariantSchema),
    defaultValues: {
      colors: [],
      options: [],
    },
    mode: "onSubmit",
  });

  const { control, handleSubmit, reset } = form;

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control,
    name: "colors",
  });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: "options",
  });

  // ── Populate form when dialog opens ──
  useEffect(() => {
    if (open && productData) {
      reset({
        colors: (productData.productColors ?? []).map((c) => ({
          name: c.name,
          hexCode: c.hexCode ?? "",
          stock: Number(c.stock) || 0,
          basePrice: Number(c.basePrice) || 0,
          isPublish: c.isPublish ?? false,
          images: [],
        })),
        options: (productData.productOptionGroups ?? []).map((og) => ({
          title: og.title,
          type: og.type,
          isPublish: og.isPublish ?? false,
          options: (og.options ?? []).map((opt) => ({
            value: opt.value,
            extraPrice: Number(opt.extraPrice) || 0,
            isPublish: opt.isPublish ?? false,
          })),
        })),
      });

      // Populate existing images per color index
      const existingImgs: Record<number, ExistingColorImage[]> = {};
      (productData.productColors ?? []).forEach((color, idx) => {
        existingImgs[idx] = (color.images ?? []).map((img, i) => ({
          id: img.id,
          url: img.url,
          altText: img.altText ?? "",
          isPrimary: img.isPrimary ?? false,
          sortOrder: img.sortOrder ?? i + 1,
        }));
      });

      setExistingImagesByIndex(existingImgs);
      setColorFilesByIndex({});
    }
  }, [open, productData, reset]);

  // ── Submit ──
  const onSubmit = async (values: UpdateVariantFormValues) => {
    const toastId = toast.loading("Updating product variants...");
    try {
      const colorsWithImages = await Promise.all(
        (values.colors ?? []).map(async (color, colorIdx) => {
          const newFiles = colorFilesByIndex[colorIdx] ?? [];
          const existing = existingImagesByIndex[colorIdx] ?? [];

          let uploadedUrls: string[] = [];
          if (newFiles.length > 0) {
            // expected to return string[]
            uploadedUrls = (await fileUpload(
              newFiles,
              "prism-bazar/variants",
            )) as string[];
          }

          const existingMapped: UploadedColorImage[] = existing.map(
            (img, i) => ({
              url: img.url,
              altText: img.altText ?? undefined,
              isPrimary: img.isPrimary ?? false,
              sortOrder: img.sortOrder ?? i + 1,
            }),
          );

          const newMapped: UploadedColorImage[] = uploadedUrls.map(
            (url, i) => ({
              url,
              altText: undefined,
              isPrimary: existing.length === 0 && i === 0,
              sortOrder: existing.length + i + 1,
            }),
          );

          return {
            ...color,
            images: [...existingMapped, ...newMapped],
          };
        }),
      );

      const payload = {
        colors: colorsWithImages,
        options: values.options ?? [],
      };

      const res = await updateProductVariants({
        id: productData.id,
        data: payload,
      }).unwrap();

      toast.success((res as any)?.message ?? "Variants updated successfully!", {
        id: toastId,
        duration: 2000,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as any;
      toast.error(e?.data?.message ?? e?.message ?? "Something went wrong", {
        id: toastId,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl md:max-w-165! xl:max-w-180! 2xl:max-w-4xl! max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Update Product Variants</DialogTitle>
          <DialogDescription>
            Update color variants and option groups for{" "}
            <span className="font-medium text-gray-900">
              {productData?.title}
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(70vh-160px)] md:max-h-[calc(80vh-160px)] lg:max-h-[calc(90vh-160px)] pr-4">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-2">
              {/* ── Color Variants ── */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-medium text-gray-900">
                      Color Variants
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Update existing colors or add new ones
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newIdx = colorFields.length;
                      appendColor({
                        name: "",
                        hexCode: "",
                        stock: 0,
                        basePrice: 0,
                        isPublish: false,
                        images: [],
                      });
                      setExistingImagesByIndex((prev) => ({
                        ...prev,
                        [newIdx]: [],
                      }));
                    }}
                    className="h-8 text-sm hover:bg-primary hover:text-white cursor-pointer"
                  >
                    <Palette className="h-3 w-3 mr-1" />
                    Add Color
                  </Button>
                </div>

                <div className="p-4">
                  {colorFields.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Palette className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        No color variants yet. Click "Add Color" to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {colorFields.map((field, colorIdx) => (
                        <ColorSection
                          key={field.id}
                          control={control}
                          colorIdx={colorIdx}
                          colorFiles={colorFilesByIndex[colorIdx] ?? []}
                          onColorFilesChange={(files) =>
                            setColorFilesByIndex((prev) => ({
                              ...prev,
                              [colorIdx]: files,
                            }))
                          }
                          existingImages={existingImagesByIndex[colorIdx] ?? []}
                          onExistingImagesChange={(images) =>
                            setExistingImagesByIndex((prev) => ({
                              ...prev,
                              [colorIdx]: images,
                            }))
                          }
                          onRemove={() => {
                            removeColor(colorIdx);

                            // Re-index remaining colors
                            setColorFilesByIndex((prev) => {
                              const updated: Record<number, File[]> = {};
                              Object.entries(prev).forEach(([k, v]) => {
                                const ki = Number(k);
                                if (ki < colorIdx) updated[ki] = v;
                                else if (ki > colorIdx) updated[ki - 1] = v;
                              });
                              return updated;
                            });

                            setExistingImagesByIndex((prev) => {
                              const updated: Record<
                                number,
                                ExistingColorImage[]
                              > = {};
                              Object.entries(prev).forEach(([k, v]) => {
                                const ki = Number(k);
                                if (ki < colorIdx) updated[ki] = v;
                                else if (ki > colorIdx) updated[ki - 1] = v;
                              });
                              return updated;
                            });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Option Groups ── */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-medium text-gray-900">
                      Option Groups
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Update RAM, Storage, Keyboard or other configurable
                      options
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendOption({
                        title: "",
                        type: "RAM",
                        isPublish: false,
                        options: [
                          { value: "", extraPrice: 0, isPublish: false },
                        ],
                      })
                    }
                    className="h-8 text-sm hover:bg-primary hover:text-white cursor-pointer"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option Group
                  </Button>
                </div>

                <div className="p-6">
                  {optionFields.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="flex justify-center mb-2 opacity-30 text-2xl font-bold tracking-widest">
                        RAM
                      </div>
                      <p className="text-sm">
                        No option groups yet. Click "Add Option Group" to get
                        started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {optionFields.map((field, groupIdx) => (
                        <OptionGroupSection
                          key={field.id}
                          control={control}
                          groupIdx={groupIdx}
                          onRemove={() => removeOption(groupIdx)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updating}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={updating}
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Variants
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProductVariant;
