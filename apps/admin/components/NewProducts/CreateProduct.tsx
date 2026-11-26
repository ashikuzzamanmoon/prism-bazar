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
  useGetAllBrandsQuery,
  useGetAllQueryBrandQuery,
} from "@/redux/Api/brandApi";
import { useCreateNewProductMutation } from "@/redux/Api/productApi";
import { toast } from "sonner";
import { fileUpload } from "@/actions/file";
import MultipleFileUploader from "@/components/Dropdown/MultipleFileUploader";
import { useGetAllQueryCategoryQuery } from "@/redux/Api/categoryApi";
import { useGetAllQueryCollectionsQuery } from "@/redux/Api/collectionApi";
import { useGetAllQuerySubCategoryQuery } from "@/redux/Api/sub-categoryApi";
import { useGetAllProductTypesQuery } from "@/redux/Api/productTypeApi";

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

const productSchema = z.object({
  // Basic
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  modelNumber: z.string().min(1, "Model number is required"),
  description: z.string().min(1, "Description is required"),
  brandId: z.string().min(1, "Brand is required"),

  // Pricing
  price: z.number().min(0, "Price must be >= 0"),
  basePrice: z.number().min(0),
  discount: z.number().int().min(0).max(100).optional(),
  prebookPrice: z.number().min(0).optional(),
  deliveryCharge: z.number().min(0).optional(),

  // ── NEW ──
  ratings: z.number().min(0).optional(),
  view: z.number().min(0).optional(),
  reviewsCount: z.number().min(0).optional(),

  // Inventory
  inventoryQuantity: z.number().int().min(0, "Quantity must be >= 0"),

  // Enums
  condition: z.enum([
    "FRESH",
    "PACKAGED",
    "HANDMADE",
    "PRINTED",
    "DIGITAL",
    "BRAND_NEW",
    "PRE_OWNED",
  ]),
  type: z.enum([
    "ORGANIC_FOOD",
    "EDUCATION_MATERIAL",
    "GENERAL",
    "ACCESSORY",
  ]),
  typeId: z.string().optional(),

  // Organic Food & Educational Materials
  expiryDate: z.string().optional(),
  ingredients: z.string().optional(),
  nutritionInfo: z.string().optional(),
  isDigital: z.boolean().default(false),
  author: z.string().optional(),
  publisher: z.string().optional(),

  // Relations
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  subCategoryIds: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),

  // Key-value features stored on Product JSON
  features: z.array(featureItemSchema).optional(),

  // Product feature sections
  productFeatures: z.array(productFeatureSchema).optional(),

  // Booleans
  isPublish: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

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
  "PRE_OWNED",
] as const;

const CONDITION_LABELS: Record<string, string> = {
  FRESH: "তাজা / খাঁটি (Fresh)",
  PACKAGED: "প্যাকেটজাত (Packaged)",
  HANDMADE: "হাতে তৈরি / ঘানিভাঙা (Handmade)",
  PRINTED: "মুদ্রিত / প্রিন্টেড বই (Printed)",
  DIGITAL: "ডিজিটাল শিট / PDF (Digital)",
  BRAND_NEW: "নতুন (Brand New)",
  PRE_OWNED: "ব্যবহৃত (Pre-Owned)",
};
const TYPES = [
  "ORGANIC_FOOD",
  "EDUCATION_MATERIAL",
  "GENERAL",
  "ACCESSORY",
] as const;

// ─── Searchable Multi-Select Combobox ─────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateProduct = () => {
  // ── Image state ──
  const [files, setFiles] = useState<File[]>([]);
  const [featureFiles, setFeatureFiles] = useState<Record<number, File | null>>(
    {},
  );

  interface ImageMeta {
    altText: string;
    isPrimary: boolean;
    sortOrder: number;
  }
  const [imageMeta, setImageMeta] = useState<ImageMeta[]>([]);

  // ── Form ──
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      modelNumber: "",
      description: "",
      brandId: "",
      price: 0,
      basePrice: 0,
      discount: undefined,
      prebookPrice: undefined,
      deliveryCharge: undefined,
      ratings: undefined,
      view: undefined,
      reviewsCount: undefined,
      inventoryQuantity: 0,
      condition: "FRESH",
      type: "ORGANIC_FOOD",
      typeId: "",
      expiryDate: "",
      ingredients: "",
      nutritionInfo: "",
      isDigital: false,
      author: "",
      publisher: "",
      categoryIds: [],
      subCategoryIds: [],
      collectionIds: [],
      features: [],
      productFeatures: [],
      isPublish: false,
    },
  });

  const { control, watch, setValue, handleSubmit } = form;

  // ── Watch dependent IDs ──
  const selectedCollectionIds = watch("collectionIds") ?? [];
  const selectedCategoryIds = watch("categoryIds") ?? [];

  // ── Queries ──
  const { data: brandsRes } = useGetAllQueryBrandQuery({});
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

  const [createProduct, { isLoading: creating }] =
    useCreateNewProductMutation();

  // ── Derived data ──
  const brands = brandsRes?.data?.data ?? brandsRes?.data ?? [];
  const collections = collectionsRes?.data ?? [];
  const categories = categoriesRes?.data ?? [];
  const subCategories = subCategoriesRes?.data ?? [];
  const productTypes = productTypesRes?.data ?? [];

  // ── Image meta sync ──
  useEffect(() => {
    setImageMeta((prev) =>
      files.map(
        (_, i) =>
          prev[i] ?? { altText: "", isPrimary: i === 0, sortOrder: i + 1 },
      ),
    );
  }, [files]);

  const updateImageMeta = (idx: number, patch: Partial<ImageMeta>) => {
    setImageMeta((prev) => {
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

  // ── Auto-generate slug from title ──
  const titleValue = watch("title");
  useEffect(() => {
    if (titleValue) setValue("slug", generateSlug(titleValue));
  }, [titleValue, setValue]);

  // ── Submit ──
  const onSubmit = async (values: ProductFormValues) => {
    const toastId = toast.loading("Creating product...");
    try {
      let uploadedImages: string[] = [];
      if (files.length > 0) {
        uploadedImages = await fileUpload(files, "prism-bazar/products");
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

      const payload = {
        slug: values.slug,
        title: values.title,
        modelNumber: values.modelNumber,
        description: values.description,
        brandId: values.brandId,
        price: values.price,
        basePrice: values.basePrice,
        discount: values.discount,
        prebookPrice: values.prebookPrice,
        deliveryCharge: values.deliveryCharge,
        ratings: values.ratings,
        view: values.view,
        reviewsCount: values.reviewsCount,
        condition: values.condition,
        type: values.type,
        typeId: values.typeId || undefined,
        expiryDate: values.expiryDate || undefined,
        ingredients: values.ingredients || undefined,
        nutritionInfo: values.nutritionInfo || undefined,
        isDigital: values.isDigital || false,
        author: values.author || undefined,
        publisher: values.publisher || undefined,
        isPublish: values.isPublish,
        features: values.features,
        inventory: { quantity: values.inventoryQuantity },
        images: uploadedImages.map((url, i) => ({
          url,
          altText: imageMeta[i]?.altText || undefined,
          isPrimary: imageMeta[i]?.isPrimary ?? i === 0,
          sortOrder: imageMeta[i]?.sortOrder ?? i + 1,
        })),
        categoryIds: values.categoryIds,
        subCategoryIds: values.subCategoryIds ?? [],
        collectionIds: values.collectionIds ?? [],
        productFeatures: productFeaturesWithImages,
      };

      const res = await createProduct(payload).unwrap();
      toast.success(res?.message ?? "Product created!", {
        id: toastId,
        duration: 2000,
      });
      form.reset();
      setFiles([]);
      setFeatureFiles({});
      setImageMeta([]);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Something went wrong", {
        id: toastId,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 uppercase">
          Create New Product
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the information below to create a new product
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Basic Information ── */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-medium text-gray-900">
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Product Title <span className="text-red-500">*</span>
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

              {/* Model Number & Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="modelNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Model Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="HP250G10-I5-8GB"
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

              {/* Condition & Product Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Condition <span className="text-red-500">*</span>
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
                        Product Type <span className="text-red-500">*</span>
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

              {/* Product Category & Digital Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Product Category / Category Group <span className="text-red-500">*</span>
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
                          <SelectItem value="ORGANIC_FOOD">অর্গানিক ফুড (Organic Food)</SelectItem>
                          <SelectItem value="EDUCATION_MATERIAL">শিক্ষা উপকরণ / বই (Education Material)</SelectItem>
                          <SelectItem value="GENERAL">সাধারণ পণ্য (General)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="isDigital"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-blue-50/30">
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
              </div>

              {/* Specifics for Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-lg border border-amber-200/60">
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

              {/* Specifics for Food */}
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

              {/* Description */}
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

              {/* Publish toggle */}
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
                        Selling Price <span className="text-red-500">*</span>
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
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber || 0)
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
                        Original Price <span className="text-red-500">*</span>
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
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber || 0)
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
                          step="1"
                          min="0"
                          max="100"
                          placeholder="0"
                          className="h-10"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
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
                        Stock Quantity <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          className="h-10"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
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
                            placeholder="0.00"
                            className="h-10 pl-7"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
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
                            placeholder="0.00"
                            className="h-10 pl-7"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
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
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
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
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
                {/* reviewsCount */}
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
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
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
                {/* 1. Collections — always enabled */}
                <FormField
                  control={control}
                  name="collectionIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Collections <span className="text-red-500">*</span>
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

                {/* 2. Categories — fetched by collectionIds */}
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
                          !selectedCollectionIds.length || fetchingCategories
                        }
                      />
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* 3. Sub-Categories — fetched by categoryIds */}
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
                          !selectedCategoryIds.length || fetchingSubCategories
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
            <div className="p-6">
              <MultipleFileUploader
                file={files}
                setFile={setFiles}
                title="Upload Images"
                required={false}
                maxSizeInMB={20}
                acceptedFileTypes={["image/*"]}
                showPreview={false}
              />
              {files.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Image Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 p-3 border border-gray-200 rounded-lg"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${idx}`}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                        />
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Alt text"
                            value={imageMeta[idx]?.altText ?? ""}
                            onChange={(e) =>
                              updateImageMeta(idx, { altText: e.target.value })
                            }
                            className="h-8 text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              placeholder="Order"
                              value={imageMeta[idx]?.sortOrder ?? idx + 1}
                              onChange={(e) => {
                                const val = e.target.valueAsNumber;
                                updateImageMeta(idx, {
                                  sortOrder: isNaN(val) ? idx + 1 : val,
                                });
                              }}
                              className="h-8 text-sm w-20"
                            />
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={imageMeta[idx]?.isPrimary ?? idx === 0}
                                onCheckedChange={(checked) =>
                                  updateImageMeta(idx, { isPrimary: checked })
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
                </div>
              )}
            </div>
          </div>

          {/* ── Features ── */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-medium text-gray-900">Features</h2>
            </div>
            <div className="p-6">
              {featureFields.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No features added yet. Click "Add Feature" to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {featureFields.map((field, idx) => (
                    <div key={field.id} className="flex gap-3 items-start">
                      <FormField
                        control={control}
                        name={`features.${idx}.key`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="e.g. Processor" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`features.${idx}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="e.g. Intel Core i5"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-red-500 hover:text-red-500 cursor-pointer"
                        onClick={() => removeFeature(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`flex justify-end ${featureFields.length > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendFeature({ key: "", value: "" })}
                  className="h-8 text-sm hover:bg-primary hover:text-white cursor-pointer"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Feature
                </Button>
              </div>
            </div>
          </div>

          {/* ── Product Feature Sections ── */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-medium text-gray-900">
                Product Features
              </h2>
            </div>
            <div className="p-6">
              {productFeatureFields.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No feature sections added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {productFeatureFields.map((pf, pfIdx) => (
                    <FeatureSection
                      key={pf.id}
                      control={control}
                      pfIdx={pfIdx}
                      featureFile={featureFiles[pfIdx] ?? null}
                      onFeatureFileChange={(file) =>
                        setFeatureFiles((prev) => ({ ...prev, [pfIdx]: file }))
                      }
                      onRemove={() => removeProductFeature(pfIdx)}
                    />
                  ))}
                </div>
              )}

              <div
                className={`flex justify-end ${productFeatureFields.length > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendProductFeature({
                      title: "",
                      type: "HIGHLIGHT",
                      sortOrder: productFeatureFields.length + 1,
                      image: "",
                      features: [{ key: "", value: "" }],
                    })
                  }
                  className="h-8 text-sm hover:bg-primary hover:text-white cursor-pointer"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Section
                </Button>
              </div>
            </div>
          </div>

          {/* ── Form Actions ── */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              className="h-10 px-6 cursor-pointer"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="h-10 px-6 bg-primary/90 hover:bg-primary cursor-pointer text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateProduct;

// ─── Feature Section Sub-component ───────────────────────────────────────────

interface FeatureSectionProps {
  control: any;
  pfIdx: number;
  featureFile: File | null;
  onFeatureFileChange: (file: File | null) => void;
  onRemove: () => void;
}

const FEATURE_TYPES: string[] = ["HIGHLIGHT", "SPECIFICATION"];

const FeatureSection = ({
  control,
  pfIdx,
  featureFile,
  onFeatureFileChange,
  onRemove,
}: FeatureSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `productFeatures.${pfIdx}.features`,
  });

  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFeatureFileChange(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-4 relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 text-destructive hover:text-destructive cursor-pointer!"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4 md:h-5! md:w-5!" />
      </Button>

      {/* Title, Type, SortOrder */}
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

      {/* Feature Image Upload */}
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
            Upload Image
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
                  setPreview(null);
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
