"use client";

import { TableSkeleton } from "@/components/Common/TableSkeleton";
import { useGetSingleProductQuery } from "@/redux/Api/productApi";
import type { IProduct } from "@/types/products.type";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Package,
  Star,
  DollarSign,
  Monitor,
  Cpu,
  HardDrive,
  Smartphone,
  Shield,
  Weight,
  Eye,
  Tag,
  Layers,
} from "lucide-react";
import Image from "next/image";

const ViewProductDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetSingleProductQuery(id as string);

  if (isLoading) return <TableSkeleton />;

  const productData: IProduct = data?.data;

  if (!productData)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Product Images */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> Product Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productData.mainImages?.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={typeof image === "string" ? image : image?.url || "/placeholder.svg"}
                  alt={`${productData.title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Brand</label>
              <p className="text-lg">{productData.brandEntity?.title || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Model</label>
              <p className="text-lg">{productData.model || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Slug</label>
              <p className="text-lg font-mono">{productData.slug}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stock</label>
              <p className="text-lg flex items-center gap-2">
                <Package className="h-4 w-4" />
                {productData.stock ?? 0} units
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm mt-1 leading-relaxed">{productData.description || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Pricing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Original Price</label>
              <p className="text-lg font-semibold">
                {formatPrice(productData.originalPrice ?? 0)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Discount</label>
              <p className="text-lg font-semibold text-green-600">{productData.discount ?? 0}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Final Price</label>
              <p className="text-xl font-bold text-primary">
                {formatPrice(productData.finalPrice ?? 0)}
              </p>
            </div>
            {productData.prebookPrice != null && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prebook Price</label>
                <p className="text-lg font-semibold">{formatPrice(productData.prebookPrice)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productData.processor && (
              <div className="flex items-center gap-3">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Processor</label>
                  <p>{productData.processor}</p>
                </div>
              </div>
            )}
            {productData.ram && (
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">RAM</label>
                  <p>{productData.ram}</p>
                </div>
              </div>
            )}
            {productData.storage && (
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Storage</label>
                  <p>{productData.storage}</p>
                </div>
              </div>
            )}
            {productData.screenSize && (
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Screen Size</label>
                  <p>{productData.screenSize}</p>
                </div>
              </div>
            )}
            {productData.graphicsCard && (
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Graphics Card</label>
                  <p>{productData.graphicsCard}</p>
                </div>
              </div>
            )}
            {productData.os && (
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Operating System</label>
                  <p>{productData.os}</p>
                </div>
              </div>
            )}
            {productData.warranty && (
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Warranty</label>
                  <p>{productData.warranty}</p>
                </div>
              </div>
            )}
            {productData.weight && (
              <div className="flex items-center gap-3">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Weight</label>
                  <p>{productData.weight}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      {productData.features && Object.keys(productData.features).length > 0 && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(productData.features).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{key}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" /> Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Main Category</label>
            <Badge variant="outline" className="text-sm mt-1">
              {productData.category?.name || "N/A"}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Sub Category</label>
            <Badge variant="secondary" className="text-sm mt-1">
              {productData.subCategory?.name || "N/A"}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nested Sub Category</label>
            <Badge variant="secondary" className="text-sm mt-1">
              {productData.nestedSubCategory?.name || "N/A"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Ratings & Reviews */}
      {(productData.ratings != null || productData.reviewsCount != null) && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" /> Reviews & Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {productData.ratings != null && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < productData.ratings! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{productData.ratings}/5</span>
                </div>
              )}
              {productData.reviewsCount != null && (
                <div>
                  <span className="text-muted-foreground">
                    {productData.reviewsCount} review{productData.reviewsCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="text-sm">{formatDate(productData.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Updated At</label>
              <p className="text-sm">{formatDate(productData.updatedAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Color Variant</label>
              <Badge variant={productData.isColorVariant ? "default" : "secondary"}>
                {productData.isColorVariant ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={productData.isDelete ? "destructive" : "default"}>
                {productData.isDelete ? "Deleted" : "Active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewProductDetails;
