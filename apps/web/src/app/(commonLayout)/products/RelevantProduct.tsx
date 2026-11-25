"use client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { IProduct } from "@/types/productTypes";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { useCallback, useState } from "react";
import { addToCart } from "@/redux/slice/cartSlice";
import ProductCard from "@/components/HomeComponents/ProductCard";
import { trackEvent } from "@/lib/tracking";

export default function RelevantProduct({
  relevantProductData = [],
}: {
  relevantProductData?: IProduct[];
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
            ? "/prism-bazar.jpg"
            : product.productImages?.[0]?.url || "/placeholder.svg",
          quantity: 1,
          deliveryCharge: Number(product?.deliveryCharge) || 0,
          color: defaultColor
            ? { id: defaultColor.id, name: defaultColor.name }
            : undefined,
          options: defaultOptions.length > 0 ? defaultOptions : undefined,
        }),
      );
      
      // Tracking
      trackEvent({
        eventName: "AddToCart",
        eventData: {
          content_name: product.title,
          content_ids: [product.id],
          value: Number(product.price),
          currency: "BDT",
          content_type: "product",
          quantity: 1
        }
      });
      
    }
    router.push("/checkout");
  };

  const handleView = (product: IProduct) => {
    router.push(`/products/${product.slug}`);
  };

  return (
    <section className=" bg-white">
      <div className="max-w-7xl mx-auto px-2 md:px-0">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary ">
              Relevant Product
            </h2>
            <p className="text-gray-600 mt-1">
              You might also like these high-performance laptops
            </p>
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-5">
            {relevantProductData?.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-1/2 pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/5"
              >
                <ProductCard
                  product={product}
                  onBuyNow={handleBuyNow}
                  onView={handleView}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-8">
            <CarouselPrevious className="relative inset-auto rounded-full bg-[#FF7200] text-white border-none" />
            <CarouselNext className="relative inset-auto rounded-full bg-[#FF7200] text-white border-none" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
