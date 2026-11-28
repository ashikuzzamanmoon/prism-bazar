"use client";

import React, { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  ChevronsUpDown,
  Check,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  useGetAllProductsQuery,
  useGetAllQueryProductsQuery,
} from "@/redux/Api/productApi";
import { useAddProductVariantsMutation } from "@/redux/Api/productApi";
import { fileUpload } from "@/actions/file";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const productImageSchema = z.object({
  url: z.string().optional(), // will be filled after upload
  altText: z.string().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const productColorSchema = z.object({
  name: z.string().min(1, "Color name is required"),
  hexCode: z.string().optional(),
  stock: z.number().min(0, "Stock must be >= 0"),
  basePrice: z.number().min(0, "Base price must be >= 0"),
  isPublish: z.boolean().optional(),
  images: z.array(productImageSchema).optional(),
});

const productOptionValueSchema = z.object({
  value: z.string().min(1, "Value is required"),
  extraPrice: z.number().min(0, "Extra price must be >= 0"),
  isPublish: z.boolean().optional(),
});

const productOptionGroupSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["RAM", "STORAGE", "KEYBOARD"]),
  isPublish: z.boolean().optional(),
  options: z
    .array(productOptionValueSchema)
    .min(1, "Add at least one option value"),
});

const addVariantSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  colors: z.array(productColorSchema).optional(),
  options: z.array(productOptionGroupSchema).optional(),
});

type AddVariantFormValues = z.infer<typeof addVariantSchema>;

const OPTION_TYPES = ["RAM", "STORAGE", "KEYBOARD"] as const;

// ─── Single-select product combobox ──────────────────────────────────────────

interface ProductComboboxProps {
  options: { id: string; title: string }[];
  value: string;
  onChange: (id: string) => void;
}

const ProductCombobox = ({
  options,
  value,
  onChange,
}: ProductComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      options.filter((o) =>
        o.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );

  const selectedLabel = options.find((o) => o.id === value)?.title;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal h-10 px-3"
        >
          <span className="truncate text-left">
            {selectedLabel ? (
              <span className="text-gray-900">{selectedLabel}</span>
            ) : (
              <span className="text-muted-foreground">
                Search and select a product...
              </span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search products..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.title}
                  onSelect={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {opt.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ─── Color Section ────────────────────────────────────────────────────────────

interface ColorSectionProps {
  control: any;
  colorIdx: number;
  onRemove: () => void;
  colorFiles: File[];
  onColorFilesChange: (files: File[]) => void;
}

const ColorSection = ({
  control,
  colorIdx,
  onRemove,
  colorFiles,
  onColorFilesChange,
}: ColorSectionProps) => {
  const [imagePreviews, setImagePreviews] = useState<
    {
      file: File;
      preview: string;
      altText: string;
      isPrimary: boolean;
      sortOrder: number;
    }[]
  >([]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    if (!newFiles.length) return;

    const newPreviews = newFiles.map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      altText: "",
      isPrimary: imagePreviews.length === 0 && i === 0,
      sortOrder: imagePreviews.length + i + 1,
    }));

    const updated = [...imagePreviews, ...newPreviews];
    setImagePreviews(updated);
    onColorFilesChange(updated.map((p) => p.file));
  };

  const removeImage = (idx: number) => {
    const updated = imagePreviews.filter((_, i) => i !== idx);
    setImagePreviews(updated);
    onColorFilesChange(updated.map((p) => p.file));
  };

  const updatePreviewMeta = (
    idx: number,
    patch: Partial<{ altText: string; isPrimary: boolean; sortOrder: number }>,
  ) => {
    setImagePreviews((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...patch };
      if (patch.isPrimary) {
        updated.forEach((p, i) => {
          if (i !== idx) p.isPrimary = false;
        });
      }
      return updated;
    });
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-8">
        <FormField
          control={control}
          name={`colors.${colorIdx}.name`}
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
          name={`colors.${colorIdx}.hexCode`}
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
                      {...field}
                    />
                    {field.value && (
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
          name={`colors.${colorIdx}.stock`}
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
                  value={field.value ?? ""}
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
          name={`colors.${colorIdx}.basePrice`}
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
                    placeholder="0.00"
                    className="h-10 pl-7"
                    value={field.value ?? ""}
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

      {/* isPublish toggle */}
      <FormField
        control={control}
        name={`colors.${colorIdx}.isPublish`}
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

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {imagePreviews.map((item, imgIdx) => (
              <div
                key={imgIdx}
                className="flex gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <img
                  src={item.preview}
                  alt={`preview-${imgIdx}`}
                  className="w-16 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Alt text"
                    value={item.altText}
                    onChange={(e) =>
                      updatePreviewMeta(imgIdx, { altText: e.target.value })
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
                        updatePreviewMeta(imgIdx, {
                          sortOrder: e.target.valueAsNumber || imgIdx + 1,
                        })
                      }
                      className="h-8 text-sm w-20"
                    />
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={item.isPrimary}
                        onCheckedChange={(checked) =>
                          updatePreviewMeta(imgIdx, { isPrimary: checked })
                        }
                      />
                      <span className="text-xs text-gray-600">Primary</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 ml-auto"
                      onClick={() => removeImage(imgIdx)}
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
  );
};

// ─── Option Group Section ─────────────────────────────────────────────────────

interface OptionGroupSectionProps {
  control: any;
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
    name: `options.${groupIdx}.options`,
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

      {/* Title, Type, isPublish */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
        <FormField
          control={control}
          name={`options.${groupIdx}.title`}
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
          name={`options.${groupIdx}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
        name={`options.${groupIdx}.isPublish`}
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
            {/* Header row */}
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
                key={item.id}
                className="grid grid-cols-12 gap-3 items-center"
              >
                <FormField
                  control={control}
                  name={`options.${groupIdx}.options.${valueIdx}.value`}
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
                  name={`options.${groupIdx}.options.${valueIdx}.extraPrice`}
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
                            placeholder="0.00"
                            className="h-9 pl-6"
                            value={field.value ?? ""}
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
                  name={`options.${groupIdx}.options.${valueIdx}.isPublish`}
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
          name={`options.${groupIdx}.options`}
          render={() => <FormMessage />}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AddProductVariant = () => {
  const { data: productsRes, isLoading: productsLoading } =
    useGetAllQueryProductsQuery({});
  const [addProductVariants, { isLoading: submitting }] =
    useAddProductVariantsMutation();

  console.log("products query data", productsRes);

  // color image files per color index
  const [colorFilesByIndex, setColorFilesByIndex] = useState<
    Record<number, File[]>
  >({});

  const products = useMemo(() => {
    const raw =
      productsRes?.data?.data ?? productsRes?.data ?? productsRes ?? [];
    return raw.map((p: any) => ({ id: p.id, title: p.title }));
  }, [productsRes]);

  const form = useForm<AddVariantFormValues>({
    resolver: zodResolver(addVariantSchema) as any,
    defaultValues: {
      productId: "",
      colors: [],
      options: [],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({ control, name: "colors" });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: "options" });

  const selectedProduct = useMemo(() => {
    const raw =
      productsRes?.data?.data ?? productsRes?.data ?? productsRes ?? [];
    return raw.find((p: any) => p.id === form.watch("productId")) ?? null;
  }, [productsRes, form.watch("productId")]);

  const onSubmit = async (values: AddVariantFormValues) => {
    const toastId = toast.loading("Adding product variants...");
    try {
      // Upload images for each color
      const colorsWithImages = await Promise.all(
        (values.colors ?? []).map(async (color, colorIdx) => {
          const files = colorFilesByIndex[colorIdx] ?? [];
          let uploadedUrls: string[] = [];
          if (files.length > 0) {
            uploadedUrls = await fileUpload(files, "prism-bazar/variants");
          }
          return {
            ...color,
            images: uploadedUrls.map((url, i) => ({
              url,
              altText: color.images?.[i]?.altText ?? undefined,
              isPrimary: color.images?.[i]?.isPrimary ?? i === 0,
              sortOrder: color.images?.[i]?.sortOrder ?? i + 1,
            })),
          };
        }),
      );

      const payload = {
        productId: values.productId,
        colors: colorsWithImages,
        options: values.options ?? [],
      };

      const res = await addProductVariants(payload).unwrap();
      toast.success(res?.message ?? "Variants added successfully!", {
        id: toastId,
        duration: 2000,
      });
      form.reset();
      setColorFilesByIndex({});
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Something went wrong", {
        id: toastId,
      });
    }
  };

  const productId = form.watch("productId");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 uppercase">
          Add Product Variants
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Add color variants and option groups (RAM, Storage, Keyboard) to an
          existing product
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Selection */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-medium text-gray-900">
                Select Product
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <FormField
                control={control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Product <span className="text-red-500">*</span>
                    </FormLabel>
                    {productsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 h-10 px-3 border border-gray-200 rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading products...
                      </div>
                    ) : (
                      <ProductCombobox
                        options={products}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* ── Selected product preview card ── */}
              {selectedProduct && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {/* Image — first from productImages array */}
                  <img
                    src={
                      selectedProduct.productImages?.[0]?.url ??
                      "/placeholder.png"
                    }
                    alt={
                      selectedProduct.productImages?.[0]?.altText ??
                      selectedProduct.title
                    }
                    className="w-14 h-14 object-cover rounded-md border border-gray-200 shrink-0"
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedProduct.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500">
                        Condition:{" "}
                        <span
                          className={cn(
                            "font-medium",
                            selectedProduct.condition === "BRAND_NEW"
                              ? "text-green-600"
                              : "text-orange-500",
                          )}
                        >
                          {selectedProduct.condition?.replace("_", " ") ?? "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Color Variants */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-base font-medium text-gray-900">
                  Color Variants
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Define different colors with their own stock, price and images
                </p>
              </div>
            </div>
            <div className="p-6">
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
                      onRemove={() => {
                        removeColor(colorIdx);
                        setColorFilesByIndex((prev) => {
                          const updated: Record<number, File[]> = {};
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

              {/* Add Color button - right aligned at bottom */}
              <div
                className={`flex justify-end ${colorFields.length > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!productId}
                  onClick={() =>
                    appendColor({
                      name: "",
                      hexCode: "",
                      stock: 0,
                      basePrice: 0,
                      isPublish: false,
                      images: [],
                    })
                  }
                  className="h-8 text-sm hover:bg-primary hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Add Color
                </Button>
              </div>
            </div>
          </div>

          {/* Option Groups */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-base font-medium text-gray-900">
                  Option Groups
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add RAM, Storage, Keyboard or other configurable options
                </p>
              </div>
            </div>
            <div className="p-6">
              {optionFields.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="flex justify-center gap-2 mb-2 opacity-30 text-2xl font-bold tracking-widest">
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

              {/* Add Option Group button - right aligned at bottom */}
              <div
                className={`flex justify-end ${optionFields.length > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!productId}
                  onClick={() =>
                    appendOption({
                      title: "",
                      type: "RAM",
                      isPublish: false,
                      options: [{ value: "", extraPrice: 0, isPublish: false }],
                    })
                  }
                  className="h-8 text-sm hover:bg-primary hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option Group
                </Button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setColorFilesByIndex({});
              }}
              className="h-10 px-6 cursor-pointer"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 px-6 bg-primary/90 hover:bg-primary cursor-pointer text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Variants
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddProductVariant;
