"use client";

import { IProduct } from "@/types/productTypes";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useCallback, useState } from "react";
import { addToCart } from "@/redux/slice/cartSlice";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrganicProductsShowcase({
  productData = [],
}: {
  productData: IProduct[];
}) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const router = useRouter();

  const [api, setApi] = useState<CarouselApi>();

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const isInCart = (productId: string) =>
    cartItems.some((item) => item.id === productId);

  const handleBuyNow = (product: IProduct) => {
    if (!isInCart(product.id)) {
      const defaultColor = product.productColors?.[0];
      const defaultOptions =
        (product.productOptionGroups
          ?.map((group) => {
            const opt = group.options[0];
            return opt
              ? {
                  id: opt.id,
                  type: group.type || group.title,
                  value: opt.value,
                }
              : null;
          })
          .filter(Boolean) as { id: string; type: string; value: string }[]) ||
        [];

      dispatch(
        addToCart({
          id: product.id,
          name: product.title,
          price: Number(product.price),
          photo: product.productImages?.[0]?.url?.includes("example.com")
            ? "/product-placeholder.svg"
            : product.productImages?.[0]?.url || "/placeholder.svg",
          quantity: 1,
          deliveryCharge: Number(product?.deliveryCharge) || 0,
          color: defaultColor
            ? { id: defaultColor.id, name: defaultColor.name }
            : undefined,
          options: defaultOptions.length > 0 ? defaultOptions : undefined,
        }),
      );
    }
    router.push("/checkout");
  };

  const handleView = (product: IProduct) => {
    router.push(`/products/${product.slug}`);
  };

  if (!productData || productData.length === 0) return null;

  return (
    <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto py-8 md:py-12">
      <div className="relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>১০০% খাঁটি ও প্রাকৃতিক</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              খাঁটি অর্গানিক সম্ভার
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              সুন্দরবনের চাকের মধু, খাঁটি গাওয়া ঘি ও ঘানিভাঙা সরিষার তেল
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products?type=ORGANIC_FOOD"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>সবগুলো দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-full text-white border-emerald-600 hover:border-emerald-700 h-8 w-8 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-full text-white border-emerald-600 hover:border-emerald-700 h-8 w-8 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {productData.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-3 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ProductCard
                  product={product}
                  onBuyNow={handleBuyNow}
                  onView={handleView}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
