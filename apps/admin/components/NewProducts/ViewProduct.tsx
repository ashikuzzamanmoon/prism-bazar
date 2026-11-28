"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Tag,
  Package,
  Layers,
  Settings,
  DollarSign,
  Hash,
  Star,
  Truck,
  BarChart2,
  Eye,
  Image as ImageIcon,
} from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}
interface ProductFeatureItem {
  id: number;
  key: string;
  value: string;
}
interface ProductFeature {
  id: string;
  title: string;
  image: string;
  type: string;
  sortOrder: number;
  features: ProductFeatureItem[];
}
interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  stock: number;
  basePrice: string;
  isPublish: boolean;
  images: ProductImage[];
}
interface ProductOptionGroup {
  id: string;
  title: string;
  type: string;
  isPublish: boolean;
  options: {
    id: string;
    value: string;
    extraPrice: string;
    isPublish: boolean;
  }[];
}
interface IViewProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  basePrice: string;
  discount: number;
  prebookPrice: string;
  deliveryCharge: string;
  ratings?: number; // ── NEW ──
  view?: number; // ── NEW ──
  reviewsCount?: number;
  condition: string;
  type: string;
  typeEntity?: { id: string; name: string };
  isPublish: boolean;
  isDeleted: boolean;
  features: ProductFeatureItem[];
  createdAt: string;
  updatedAt: string;
  productImages: ProductImage[];
  productFeatures: ProductFeature[];
  productColors: ProductColor[];
  productOptionGroups: ProductOptionGroup[];
  productCategories: { categoryId: string }[];
  productSubCategories: { subCategoryId: string }[];
  productCollections: { collectionId: string }[];
}

interface ViewProductProps {
  productData?: IViewProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

// ---- Sub Components ----

const InfoCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number | null | undefined;
}) => (
  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="p-1.5 sm:p-2 rounded-md bg-gray-100 shrink-0">
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xs sm:text-sm font-medium text-gray-900 mt-1 wrap-break-word">
        {value !== null && value !== undefined && value !== "" ? value : "—"}
      </p>
    </div>
  </div>
);

const StatusIndicator = ({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) => (
  <div className="flex items-center gap-1.5 sm:gap-2">
    <div
      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
        active ? "bg-green-500" : "bg-gray-300"
      }`}
    />
    <span className="text-xs sm:text-sm text-gray-600">{label}</span>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
    <div className="w-1 h-4 bg-primary rounded-full" />
    <span className="truncate">{children}</span>
  </h3>
);

// ---- Main Component ----

const ViewProduct = ({
  productData,
  open,
  onOpenChange,
  isLoading,
}: ViewProductProps) => {
  if (!open) return null;

  if (isLoading || !productData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Product Details
            </DialogTitle>
            <DialogDescription className="text-sm">
              Loading product information...
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 sm:py-6 text-sm text-gray-600">
            Loading product details...
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="sm:size-default">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const conditionLabel: Record<string, string> = {
    FRESH: "তাজা / খাঁটি (Fresh)",
    PACKAGED: "প্যাকেটজাত (Packaged)",
    HANDMADE: "হাতে তৈরি / ঘানিভাঙা (Handmade)",
    PRINTED: "মুদ্রিত / প্রিন্টেড বই (Printed)",
    DIGITAL: "ডিজিটাল শিট / PDF (Digital)",
    BRAND_NEW: "নতুন (Brand New)",
    PRE_OWNED: "স্ট্যান্ডার্ড",
  };

  // Safe accessors
  const images = (productData.productImages ?? []).slice().sort((a, b) => {
    const ao = a.sortOrder ?? 0;
    const bo = b.sortOrder ?? 0;
    if (a.isPrimary === b.isPrimary) return ao - bo;
    return a.isPrimary ? -1 : 1;
  });

  const features = productData.features ?? [];
  const productColors = productData.productColors ?? [];
  const productOptionGroups = productData.productOptionGroups ?? [];
  const productFeatures = (productData.productFeatures ?? [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const productCategories = productData.productCategories ?? [];
  const productSubCategories = productData.productSubCategories ?? [];
  const productCollections = productData.productCollections ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl lg:max-w-4xl mx-auto p-0 gap-0 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Product Details
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-500">
              Complete information about this product
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 max-h-[70vh] xl:max-h-[75vh] overflow-y-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Images */}
            <div className="space-y-2 sm:space-y-3">
              <SectionTitle>Product Images</SectionTitle>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {images.length > 0 ? (
                  images.map((img) => (
                    <div
                      key={img.id}
                      className={`relative rounded-lg overflow-hidden border-2 ${
                        img.isPrimary ? "border-primary" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.altText ?? productData.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover"
                        loading="lazy"
                      />
                      {img.isPrimary && (
                        <span className="absolute bottom-1 left-1 text-[8px] sm:text-[10px] bg-primary text-white px-1 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Title & Status */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </p>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 wrap-break-word">
                {productData.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                <StatusIndicator
                  active={productData.isPublish}
                  label="Published"
                />
                <StatusIndicator
                  active={!productData.isDeleted}
                  label="Active"
                />
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-xs border-gray-300 text-gray-600"
                >
                  {conditionLabel[productData.condition] ??
                    productData.condition}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-xs border-gray-300 text-gray-600"
                >
                  {productData.typeEntity?.name || productData.type}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {productData.description && (
              <div className="space-y-2">
                <SectionTitle>Description</SectionTitle>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 wrap-break-word">
                  {productData.description}
                </p>
              </div>
            )}

            {/* Slug */}
            <div className="space-y-2">
              <SectionTitle>Slug / URL Path</SectionTitle>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
                <code className="text-xs sm:text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200 flex-1 truncate">
                  {productData.slug}
                </code>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2 sm:space-y-3">
              <SectionTitle>Pricing</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                <InfoCard
                  icon={DollarSign}
                  label="Price"
                  value={
                    productData.price ? `৳ ${productData.price}` : undefined
                  }
                />
                <InfoCard
                  icon={DollarSign}
                  label="Base Price"
                  value={
                    productData.basePrice
                      ? `৳ ${productData.basePrice}`
                      : undefined
                  }
                />
                <InfoCard
                  icon={BarChart2}
                  label="Discount"
                  value={
                    productData.discount !== undefined
                      ? `${productData.discount}%`
                      : undefined
                  }
                />
                {productData.prebookPrice && (
                  <InfoCard
                    icon={DollarSign}
                    label="Pre-book Price"
                    value={`৳ ${productData.prebookPrice}`}
                  />
                )}
                {productData.deliveryCharge && (
                  <InfoCard
                    icon={Truck}
                    label="Delivery Charge"
                    value={`৳ ${productData.deliveryCharge}`}
                  />
                )}

                {/* ── NEW: Ratings ── */}
                <InfoCard
                  icon={Star}
                  label="Ratings"
                  value={
                    productData.ratings !== undefined &&
                    productData.ratings !== null
                      ? productData.ratings
                      : undefined
                  }
                />
                {/* ── NEW: View Count ── */}
                <InfoCard
                  icon={Eye}
                  label="View Count"
                  value={
                    productData.view !== undefined && productData.view !== null
                      ? productData.view
                      : undefined
                  }
                />
                <InfoCard
                  icon={BarChart2}
                  label="Review Count"
                  value={
                    productData.reviewsCount !== undefined &&
                    productData.reviewsCount !== null
                      ? productData.reviewsCount
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Quick Features */}
            {features.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <SectionTitle>Quick Features</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {features.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 bg-white"
                    >
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium w-16 sm:w-20 shrink-0 truncate">
                        {f.key}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-800 font-medium truncate">
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colors & Variants */}
            {productColors.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <SectionTitle>Colors & Variants</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {productColors.map((color) => (
                    <div
                      key={color.id}
                      className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-md shrink-0"
                        style={{ backgroundColor: color.hexCode }}
                        title={color.hexCode}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {color.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          Stock: {color.stock} | ৳ {color.basePrice}
                        </p>
                        {color.images?.length ? (
                          <div className="mt-2 flex gap-1 sm:gap-2 flex-wrap">
                            {color.images.slice(0, 3).map((img) => (
                              <img
                                key={img.id}
                                src={img.url}
                                alt={img.altText ?? color.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded border border-gray-200"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <StatusIndicator active={color.isPublish} label="Live" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Option Groups */}
            {productOptionGroups.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <SectionTitle>Option Groups</SectionTitle>
                <div className="space-y-2 sm:space-y-3">
                  {productOptionGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {group.title}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] sm:text-xs ml-auto"
                        >
                          {group.type}
                        </Badge>
                        <StatusIndicator
                          active={group.isPublish}
                          label="Active"
                        />
                      </div>

                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {group.options?.map((opt) => (
                          <div
                            key={opt.id}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-200 rounded-full text-[10px] sm:text-xs"
                          >
                            <span className="font-medium text-gray-800">
                              {opt.value}
                            </span>
                            {opt.extraPrice && (
                              <span className="text-gray-400">
                                +৳{opt.extraPrice}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications (Product Features) */}
            {productFeatures.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <SectionTitle>Specifications</SectionTitle>

                {productFeatures.map((pf) => (
                  <div
                    key={pf.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4"
                  >
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3">
                      {pf.image ? (
                        <FeatureImage url={pf.image} alt={pf.title} />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-400 shrink-0">
                          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {pf.type}
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {pf.title}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs shrink-0"
                      >
                        {pf.features?.length ?? 0} items
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pf.features?.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 bg-white"
                        >
                          <span className="text-[10px] sm:text-xs text-gray-500 font-medium w-16 sm:w-20 shrink-0 truncate">
                            {f.key}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-800 font-medium truncate">
                            {f.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Relations */}
            {(productCategories.length > 0 ||
              productSubCategories.length > 0 ||
              productCollections.length > 0) && (
              <div className="space-y-2 sm:space-y-3">
                <SectionTitle>Relations</SectionTitle>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <InfoCard
                    icon={Layers}
                    label="Categories"
                    value={productCategories.length}
                  />
                  <InfoCard
                    icon={Layers}
                    label="Sub Categories"
                    value={productSubCategories.length}
                  />
                  <InfoCard
                    icon={Package}
                    label="Collections"
                    value={productCollections.length}
                  />
                </div>
              </div>
            )}

            {/* Modification */}
            <div className="space-y-2 sm:space-y-3">
              <SectionTitle>Modification</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <InfoCard
                  icon={Calendar}
                  label="Created At"
                  value={formatDate(productData.createdAt)}
                />
                {productData.updatedAt && (
                  <InfoCard
                    icon={Clock}
                    label="Last Updated"
                    value={formatDate(productData.updatedAt)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProduct;

function FeatureImage({ url, alt }: { url: string; alt: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-400 shrink-0">
        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md border border-gray-200 bg-white shrink-0"
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}
