"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useGetAllBrandsQuery } from "@/redux/Api/brandApi";
import { fileUpload } from "@/actions/file";
import MultipleFileUploader from "@/components/Dropdown/MultipleFileUploader";
import { useGetAllQueryCategoryQuery } from "@/redux/Api/categoryApi";
import { useGetAllQueryCollectionsQuery } from "@/redux/Api/collectionApi";
import { useGetAllQuerySubCategoryQuery } from "@/redux/Api/sub-categoryApi";
import { useGetUpdateProductMutation } from "@/redux/Api/productApi";
import { useGetAllProductTypesQuery } from "@/redux/Api/productTypeApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
  id?: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface ProductData {
  id: string;
  title: string;
  slug: string;
  description: string;
  brandId?: string;
  price: string | number;
  basePrice: string | number;
  discount?: string | number;
  prebookPrice?: string | number;
  deliveryCharge?: string | number;
  ratings?: number; // ── NEW ──
  view?: number; // ── NEW ──
  reviewsCount?: number;
  condition?: string;
  type?: string;
  typeId?: string | null;
  isPublish: boolean;
  isDeleted?: boolean;
  features?: { id?: number; key: string; value: string }[];
  productImages?: {
    id?: string;
    productId?: string;
    url: string;
    altText?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
    isDeleted?: boolean;
    colorId?: string | null;
  }[];
  productFeatures?: {
    id?: string;
    productId?: string;
    title: string;
    type: "HIGHLIGHT" | "SPECIFICATION";
    sortOrder: number;
    image?: string | null;
    features?: { id?: number; key: string; value: string }[];
  }[];
  productInventories?: { quantity: number }[];
  productCategories?: { categoryId: string }[];
  productSubCategories?: { subCategoryId: string }[];
  productCollections?: { collectionId: string }[];
  productColors?: any[];
  productOptionGroups?: any[];
}

interface UpdateProductProps {
  productData: ProductData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const featureItemSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const productFeatureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["HIGHLIGHT", "SPECIFICATION"]),
  sortOrder: z.number().int().min(0),
  image: z.string().optional(),
  features: z.array(featureItemSchema).min(1, "Add at least one feature item"),
});

const updateProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  brandId: z.string().min(1, "Brand is required"),
  price: z.number().min(0),
  basePrice: z.number().min(0),
  discount: z.number().min(0).optional(),
  prebookPrice: z.number().min(0).optional(),
  deliveryCharge: z.number().min(0).optional(),
  ratings: z.number().min(0).optional(), // ── NEW ──
  view: z.number().min(0).optional(), // ── NEW ──
  reviewsCount: z.number().min(0).optional(),
  inventoryQuantity: z.number().int().min(0).optional().default(0),
  condition: z.enum([
    "FRESH",
    "PACKAGED",
    "HANDMADE",
    "PRINTED",
    "DIGITAL",
    "BRAND_NEW",
    "PRE_OWNED",
  ]).optional().default("FRESH"),
  type: z.enum([
    "ORGANIC_FOOD",
    "EDUCATION_MATERIAL",
    "GENERAL",
    "ACCESSORY",
  ]).optional().default("ORGANIC_FOOD"),
  typeId: z.string().optional(),
  isDigital: z.boolean().default(false),
  author: z.string().optional(),
  publisher: z.string().optional(),
  ingredients: z.string().optional(),
  nutritionInfo: z.string().optional(),
  expiryDate: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  subCategoryIds: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
  features: z.array(featureItemSchema).optional(),
  productFeatures: z.array(productFeatureSchema).optional(),
  isPublish: z.boolean().default(false),
});

type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const CONDITIONS = [
  "FRESH",
  "PACKAGED",
  "HANDMADE",
  "PRINTED",
  "DIGITAL",
  "BRAND_NEW",
] as const;

const CONDITION_LABELS: Record<string, string> = {
  FRESH: "তাজা / খাঁটি (Fresh)",
  PACKAGED: "প্যাকেটজাত (Packaged)",
  HANDMADE: "হাতে তৈরি / ঘানিভাঙা (Handmade)",
  PRINTED: "মুদ্রিত / প্রিন্টেড বই (Printed)",
  DIGITAL: "ডিজিটাল শিট / PDF (Digital)",
  BRAND_NEW: "নতুন (Brand New)",
  PRE_OWNED: "স্ট্যান্ডার্ড / সাধারণ",
};

const TYPES = [
  "ORGANIC_FOOD",
  "EDUCATION_MATERIAL",
  "GENERAL",
  "ACCESSORY",
] as const;
const FEATURE_TYPES = ["HIGHLIGHT", "SPECIFICATION"] as const;

// ─── Multi-Select Combobox ────────────────────────────────────────────────────

interface MultiComboboxProps {
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

const MultiCombobox = ({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  emptyText = "No results found.",
  disabled = false,
}: MultiComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      options.filter((opt) =>
        opt.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectedLabels = options
    .filter((o) => selected.includes(o.id))
    .map((o) => o.name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal h-auto min-h-9 px-3 py-2"
        >
          <span className="truncate text-left">
            {selectedLabels.length > 0 ? (
              <span className="flex flex-wrap gap-1">
                {selectedLabels.map((label) => (
                  <span
                    key={label}
                    className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded"
                  >
                    {label}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filtered.map((opt) => {
                const isSelected = selected.includes(opt.id);
                return (
                  <CommandItem
                    key={opt.id}
                    value={opt.name}
                    onSelect={() => toggle(opt.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {opt.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ─── Feature Section Sub-component ───────────────────────────────────────────

interface FeatureSectionProps {
  control: any;
  pfIdx: number;
  featureFile: File | null;
  existingImage?: string;
  onFeatureFileChange: (file: File | null) => void;
  onRemove: () => void;
}

const FeatureSection = ({
  control,
  pfIdx,
  featureFile,
  existingImage,
  onFeatureFileChange,
  onRemove,
}: FeatureSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `productFeatures.${pfIdx}.features`,
  });

  const [preview, setPreview] = useState<string | null>(existingImage ?? null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFeatureFileChange(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(existingImage ?? null);
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-4 relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 text-destructive hover:text-destructive cursor-pointer"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8 mt-8">
        <FormField
          control={control}
          name={`productFeatures.${pfIdx}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Highlights" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`productFeatures.${pfIdx}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FEATURE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`productFeatures.${pfIdx}.sortOrder`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="1"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber;
                    field.onChange(isNaN(val) ? 0 : val);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Feature Image */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Feature Image</p>
        <div className="flex items-start gap-4">
          <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted transition-colors text-muted-foreground text-xs text-center gap-1">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Plus className="h-5 w-5" />
            {preview ? "Change Image" : "Upload Image"}
          </label>
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Feature preview"
                className="w-32 h-24 object-cover rounded-md border"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                onClick={() => {
                  onFeatureFileChange(null);
                  setPreview(existingImage ?? null);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Feature Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Features</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ key: "", value: "" })}
            className="hover:bg-primary hover:text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
          </Button>
        </div>
        {fields.map((item, itemIdx) => (
          <div key={item.id} className="flex gap-3 items-start">
            <FormField
              control={control}
              name={`productFeatures.${pfIdx}.features.${itemIdx}.key`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`productFeatures.${pfIdx}.features.${itemIdx}.value`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 text-destructive hover:text-destructive"
              onClick={() => remove(itemIdx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <FormField
          control={control}
          name={`productFeatures.${pfIdx}.features`}
          render={() => <FormMessage />}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UpdateProduct = ({
  productData,
  open,
  onOpenChange,
}: UpdateProductProps) => {
  // ── Image state ──
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [featureFiles, setFeatureFiles] = useState<Record<number, File | null>>(
    {},
  );

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  interface ImageMeta {
    altText: string;
    isPrimary: boolean;
    sortOrder: number;
  }
  const [newImageMeta, setNewImageMeta] = useState<ImageMeta[]>([]);

  // ── Form ──
  const form = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      brandId: "",
      price: undefined,
      basePrice: undefined,
      discount: undefined,
      prebookPrice: undefined,
      deliveryCharge: undefined,
      ratings: undefined, // ── NEW ──
      view: undefined, // ── NEW ──
      reviewsCount: undefined,
      inventoryQuantity: undefined,
      condition: "FRESH",
      type: "ORGANIC_FOOD",
      categoryIds: [],
      subCategoryIds: [],
      collectionIds: [],
      features: [],
      productFeatures: [],
      typeId: "",
      isPublish: false,
    },
  });

  const { control, watch, setValue, handleSubmit, reset } = form;

  // ── Watch dependent IDs ──
  const selectedCollectionIds = watch("collectionIds") ?? [];
  const selectedCategoryIds = watch("categoryIds") ?? [];
  const selectedProductType = watch("type") || "ORGANIC_FOOD";
  const titleValue = watch("title");

  // ── Queries ──
  const { data: brandsRes } = useGetAllBrandsQuery({});
  const { data: collectionsRes } = useGetAllQueryCollectionsQuery({});

  const { data: categoriesRes, isFetching: fetchingCategories } =
    useGetAllQueryCategoryQuery(
      { collectionIds: selectedCollectionIds },
      { skip: selectedCollectionIds.length === 0 },
    );

  const { data: subCategoriesRes, isFetching: fetchingSubCategories } =
    useGetAllQuerySubCategoryQuery(
      { categoryIds: selectedCategoryIds },
      { skip: selectedCategoryIds.length === 0 },
    );

  const { data: productTypesRes } = useGetAllProductTypesQuery(undefined);

  const [updateProduct, { isLoading: updating }] =
    useGetUpdateProductMutation();

  // ── Derived data ──
  const brands = brandsRes?.data?.data ?? brandsRes?.data ?? [];
  const collections = collectionsRes?.data ?? [];
  const categories = categoriesRes?.data ?? [];
  const subCategories = subCategoriesRes?.data ?? [];
  const productTypes = productTypesRes?.data ?? [];

  // ── Populate form when dialog opens ──
  useEffect(() => {
    if (open && productData) {
      const productOnlyImages = (productData.productImages ?? []).filter(
        (img) => img.colorId === null || img.colorId === undefined,
      );

      const collectionIds = (productData.productCollections ?? []).map(
        (c) => c.collectionId,
      );
      const categoryIds = (productData.productCategories ?? []).map(
        (c) => c.categoryId,
      );
      const subCategoryIds = (productData.productSubCategories ?? []).map(
        (s) => s.subCategoryId,
      );

      const inventoryQuantity =
        productData.productInventories?.[0]?.quantity ?? 0;

      reset({
        title: productData.title ?? "",
        slug: productData.slug ?? "",
        description: productData.description ?? "",
        brandId: productData.brandId ?? "",
        price:
          productData.price !== undefined && productData.price !== null
            ? Number(productData.price)
            : undefined,
        basePrice:
          productData.basePrice !== undefined && productData.basePrice !== null
            ? Number(productData.basePrice)
            : undefined,
        discount: productData.discount
          ? Number(productData.discount)
          : undefined,
        prebookPrice: productData.prebookPrice
          ? Number(productData.prebookPrice)
          : undefined,
        deliveryCharge: productData.deliveryCharge
          ? Number(productData.deliveryCharge)
          : undefined,
        ratings: productData.ratings ?? undefined, // ── NEW ──
        view: productData.view ?? undefined, // ── NEW ──
        reviewsCount: productData.reviewsCount ?? undefined,
        inventoryQuantity:
          inventoryQuantity !== undefined && inventoryQuantity !== null
            ? inventoryQuantity
            : undefined,
        condition: (productData.condition as any) ?? "FRESH",
        type: (productData.type as any) ?? "ORGANIC_FOOD",
        typeId: productData.typeId ?? "",
        isDigital: Boolean((productData as any).isDigital),
        author: (productData as any).author ?? "",
        publisher: (productData as any).publisher ?? "",
        ingredients: (productData as any).ingredients ?? "",
        nutritionInfo: (productData as any).nutritionInfo ?? "",
        expiryDate: (productData as any).expiryDate ? String((productData as any).expiryDate) : "",
        collectionIds,
        categoryIds,
        subCategoryIds,
        features: (productData.features ?? []).map(({ key, value }) => ({
          key,
          value,
        })),
        productFeatures: (productData.productFeatures ?? []).map((pf) => ({
          title: pf.title,
          type: pf.type,
          sortOrder: pf.sortOrder,
          image: pf.image ?? "",
          features: (pf.features ?? []).map(({ key, value }) => ({
            key,
            value,
          })),
        })),
        isPublish: productData.isPublish ?? false,
      });

      setExistingImages(productOnlyImages);
      setNewFiles([]);
      setNewImageMeta([]);
      setFeatureFiles({});
    }
  }, [open, productData, reset]);

  // ── Auto-generate slug only if title changed from original ──
  useEffect(() => {
    if (titleValue && titleValue !== productData?.title) {
      setValue("slug", generateSlug(titleValue));
    }
  }, [titleValue, setValue, productData?.title]);

  // ── Sync new image meta ──
  useEffect(() => {
    setNewImageMeta((prev) =>
      newFiles.map(
        (_, i) =>
          prev[i] ?? {
            altText: "",
            isPrimary: existingImages.length === 0 && i === 0,
            sortOrder: existingImages.length + i + 1,
          },
      ),
    );
  }, [newFiles, existingImages.length]);

  const updateNewImageMeta = (idx: number, patch: Partial<ImageMeta>) => {
    setNewImageMeta((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...patch };
      if (patch.isPrimary) {
        updated.forEach((m, i) => {
          if (i !== idx) m.isPrimary = false;
        });
      }
      return updated;
    });
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateExistingImageMeta = (
    idx: number,
    patch: Partial<ProductImage>,
  ) => {
    setExistingImages((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...patch };
      if (patch.isPrimary) {
        updated.map((img, i) =>
          i !== idx ? { ...img, isPrimary: false } : img,
        );
      }
      return updated;
    });
  };

  // ── Field arrays ──
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({ control, name: "features" });

  const {
    fields: productFeatureFields,
    append: appendProductFeature,
    remove: removeProductFeature,
  } = useFieldArray({ control, name: "productFeatures" });

  // ── Submit ──
  const onSubmit = async (values: UpdateProductFormValues) => {
    const toastId = toast.loading("Updating product...");
    try {
      let uploadedNewImages: string[] = [];
      if (newFiles.length > 0) {
        uploadedNewImages = await fileUpload(newFiles, "prism-bazar/products");
      }

      const productFeaturesWithImages = await Promise.all(
        (values.productFeatures ?? []).map(async (pf, idx) => {
          let imageUrl = pf.image ?? "";
          if (featureFiles[idx]) {
            const uploaded = await fileUpload(
              [featureFiles[idx] as File],
              "prism-bazar/features",
            );
            imageUrl = uploaded[0] ?? "";
          }
          return { ...pf, image: imageUrl, sortOrder: idx + 1 };
        }),
      );

      const allImages = [
        ...existingImages.map((img, i) => ({
          url: img.url,
          altText: img.altText ?? undefined,
          isPrimary: img.isPrimary ?? false,
          sortOrder: img.sortOrder ?? i + 1,
        })),
        ...uploadedNewImages.map((url, i) => ({
          url,
          altText: newImageMeta[i]?.altText || undefined,
          isPrimary: newImageMeta[i]?.isPrimary ?? false,
          sortOrder:
            newImageMeta[i]?.sortOrder ?? existingImages.length + i + 1,
        })),
      ];

      const payload = {
        slug: values.slug,
        title: values.title,
        description: values.description,
        brandId: values.brandId,
        price: values.price,
        basePrice: values.basePrice,
        discount: values.discount,
        prebookPrice: values.prebookPrice,
        deliveryCharge: values.deliveryCharge,
        ratings: values.ratings, // ── NEW ──
        view: values.view, // ── NEW ──
        reviewsCount: values.reviewsCount,
        condition: values.condition,
        type: values.type,
        typeId: values.typeId || undefined,
        isDigital: values.isDigital || false,
        author: values.author || undefined,
        publisher: values.publisher || undefined,
        ingredients: values.ingredients || undefined,
        nutritionInfo: values.nutritionInfo || undefined,
        expiryDate: values.expiryDate || undefined,
        isPublish: values.isPublish,
        features: values.features,
        inventory: { quantity: values.inventoryQuantity },
        images: allImages,
        categoryIds: values.categoryIds,
        subCategoryIds: values.subCategoryIds ?? [],
        collectionIds: values.collectionIds ?? [],
        productFeatures: productFeaturesWithImages,
      };

      const res = await updateProduct({
        id: productData.id,
        data: payload,
      }).unwrap();

      toast.success(res?.message ?? "Product updated!", {
        id: toastId,
        duration: 2000,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Something went wrong", {
        id: toastId,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl md:max-w-165! xl:max-w-180! 2xl:max-w-4xl! max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
          <DialogDescription>
            Update the product details below. Product variants (colors &
            options) are managed separately.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(70vh-160px)] md:max-h-[calc(80vh-160px)] lg:max-h-[calc(90vh-160px)] pr-4">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-2">
              {/* ── Basic Information ── */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-medium text-gray-900">
                    Basic Information
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Product Title{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. সুন্দরবনের খাঁটি মধু ৫০০ গ্রাম"
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Slug <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="pure-sundarban-honey-500g"
                              className="h-10 bg-gray-50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <FormField
                      control={control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Brand <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands.map((b: any) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Condition
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONDITIONS.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {CONDITION_LABELS[c] || c.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="typeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Product Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {productTypes.map((t: any) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dynamic Education Details */}
                  {selectedProductType === "EDUCATION_MATERIAL" && (
                    <div className="space-y-4 p-4 bg-amber-50/50 rounded-lg border border-amber-200/60">
                      <FormField
                        control={control}
                        name="isDigital"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium text-gray-700">ডিজিটাল সংস্করণ (PDF)</FormLabel>
                              <p className="text-xs text-gray-500">অনলাইন ডাউনলোডযোগ্য ফাইল হলে চালু করুন</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">লেখক / সংকলক (Author)</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন: ড. মুহাম্মদ জাফর ইকবাল" {...field} />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="publisher"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">প্রকাশক / প্রতিষ্ঠান (Publisher)</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন: অনুপম প্রকাশনী" {...field} />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic Organic Food Details */}
                  {selectedProductType !== "EDUCATION_MATERIAL" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
                      <FormField
                        control={control}
                        name="ingredients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">উপাদান (Ingredients)</FormLabel>
                            <FormControl>
                              <Input placeholder="যেমন: খাঁটি সরিষা বীজ" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="nutritionInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">পুষ্টিগুণ (Nutrition)</FormLabel>
                            <FormControl>
                              <Input placeholder="যেমন: ভিটামিন ই, ওমেগা ৩" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">মেয়াদ / Best Before</FormLabel>
                            <FormControl>
                              <Input placeholder="যেমন: উৎপাদন হতে ৬ মাস" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Description <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Enter detailed product description..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <FormField
                      control={control}
                      name="isPublish"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0 pb-1">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <Label className="text-sm text-gray-600 cursor-pointer">
                            Publish immediately
                          </Label>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* ── Pricing & Inventory ── */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-medium text-gray-900">
                    Pricing & Inventory
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Selling Price{" "}
                            <span className="text-red-500">*</span>
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
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Original Price{" "}
                            <span className="text-red-500">*</span>
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
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Discount (%)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              className="h-10"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="inventoryQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Stock Quantity{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              placeholder="0"
                              className="h-10"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="prebookPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Pre-book Price
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
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="deliveryCharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Delivery Charge
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
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    {/* ── NEW: Ratings ── */}
                    <FormField
                      control={control}
                      name="ratings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Ratings
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="0.0"
                              className="h-10"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    {/* ── NEW: View ── */}
                    <FormField
                      control={control}
                      name="view"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            View Count
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              className="h-10"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="reviewsCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Review Count
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              className="h-10"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* ── Collections, Categories & Sub-Categories ── */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-medium text-gray-900">
                    Collections, Categories & Sub-Categories
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={control}
                      name="collectionIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Collections
                          </FormLabel>
                          <MultiCombobox
                            options={collections.map(
                              (c: { id: string; name: string }) => ({
                                id: c.id,
                                name: c.name,
                              }),
                            )}
                            selected={field.value ?? []}
                            onChange={(ids) => {
                              field.onChange(ids);
                              setValue("categoryIds", []);
                              setValue("subCategoryIds", []);
                            }}
                            placeholder="Select collections..."
                          />
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Categories <span className="text-red-500">*</span>
                          </FormLabel>
                          <MultiCombobox
                            options={categories.map(
                              (c: { id: string; name: string }) => ({
                                id: c.id,
                                name: c.name,
                              }),
                            )}
                            selected={field.value ?? []}
                            onChange={(ids) => {
                              field.onChange(ids);
                              setValue("subCategoryIds", []);
                            }}
                            placeholder={
                              !selectedCollectionIds.length
                                ? "Select a collection first"
                                : fetchingCategories
                                  ? "Loading categories..."
                                  : "Select categories..."
                            }
                            emptyText="No categories found for selected collections."
                            disabled={
                              !selectedCollectionIds.length ||
                              fetchingCategories
                            }
                          />
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="subCategoryIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Sub-Categories
                          </FormLabel>
                          <MultiCombobox
                            options={subCategories.map(
                              (sc: { id: string; name: string }) => ({
                                id: sc.id,
                                name: sc.name,
                              }),
                            )}
                            selected={field.value ?? []}
                            onChange={field.onChange}
                            placeholder={
                              !selectedCategoryIds.length
                                ? "Select a category first"
                                : fetchingSubCategories
                                  ? "Loading sub-categories..."
                                  : "Select sub-categories..."
                            }
                            emptyText="No sub-categories found for selected categories."
                            disabled={
                              !selectedCategoryIds.length ||
                              fetchingSubCategories
                            }
                          />
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* ── Product Images ── */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-medium text-gray-900">
                    Product Images
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {existingImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Current Images
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {existingImages.map((img, idx) => (
                          <div
                            key={img.id ?? idx}
                            className="flex gap-3 p-3 border border-gray-200 rounded-lg"
                          >
                            <img
                              src={img.url}
                              alt={img.altText ?? `image-${idx}`}
                              className="w-16 h-16 object-cover rounded-md border border-gray-200 shrink-0"
                            />
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Alt text"
                                value={img.altText ?? ""}
                                onChange={(e) =>
                                  updateExistingImageMeta(idx, {
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
                                  value={img.sortOrder ?? idx + 1}
                                  onChange={(e) =>
                                    updateExistingImageMeta(idx, {
                                      sortOrder:
                                        e.target.valueAsNumber || idx + 1,
                                    })
                                  }
                                  className="h-8 text-sm w-20"
                                />
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={img.isPrimary ?? false}
                                    onCheckedChange={(checked) =>
                                      updateExistingImageMeta(idx, {
                                        isPrimary: checked,
                                      })
                                    }
                                  />
                                  <span className="text-xs text-gray-600">
                                    Primary
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 ml-auto"
                                  onClick={() => removeExistingImage(idx)}
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

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Add New Images
                    </p>
                    <MultipleFileUploader
                      file={newFiles}
                      setFile={setNewFiles}
                      title="Upload Images"
                      required={false}
                      maxSizeInMB={20}
                      acceptedFileTypes={["image/*"]}
                      showPreview={false}
                    />
                    {newFiles.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {newFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/30"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`new-preview-${idx}`}
                              className="w-16 h-16 object-cover rounded-md border border-gray-200 shrink-0"
                            />
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Alt text"
                                value={newImageMeta[idx]?.altText ?? ""}
                                onChange={(e) =>
                                  updateNewImageMeta(idx, {
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
                                  value={
                                    newImageMeta[idx]?.sortOrder ??
                                    existingImages.length + idx + 1
                                  }
                                  onChange={(e) => {
                                    const val = e.target.valueAsNumber;
                                    updateNewImageMeta(idx, {
                                      sortOrder: isNaN(val)
                                        ? existingImages.length + idx + 1
                                        : val,
                                    });
                                  }}
                                  className="h-8 text-sm w-20"
                                />
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={
                                      newImageMeta[idx]?.isPrimary ?? false
                                    }
                                    onCheckedChange={(checked) =>
                                      updateNewImageMeta(idx, {
                                        isPrimary: checked,
                                      })
                                    }
                                  />
                                  <span className="text-xs text-gray-600">
                                    Primary
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
            onClick={handleSubmit(onSubmit, (errors) => {
              console.error("Update product validation errors:", errors);
              const firstKey = Object.keys(errors)[0];
              const msg = (errors as any)[firstKey]?.message || `Please check ${firstKey}`;
              toast.error(`ফর্ম পূরণ অসম্পূর্ণ: ${msg}`);
            })}
            disabled={updating}
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProduct;
