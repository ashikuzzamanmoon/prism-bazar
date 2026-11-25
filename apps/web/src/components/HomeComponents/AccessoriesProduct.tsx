"use client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types/productTypes";
import ProductCard from "./ProductCard";
import { addToCart } from "@/redux/slice/cartSlice";
import Link from "next/link";

const AccessoriesProduct = ({ productData }: { productData: IProduct[] }) => {
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

  // Filter only published, non-deleted products

  return (
    <div className="max-w-7xl px-4 md:px-0 mx-auto pb-12">
      <div className="relative mt-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Accessories</h2>
            <div className="h-0.5 w-10 bg-[#ff7200] rounded-full mt-1" />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/products?collection=gadgets-and-accessories"
              className="text-sm font-medium text-[#ff7200] hover:text-[#e66a00] hover:underline transition-all"
            >
              View All
            </Link>
            <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="bg-[#ff7200] hover:bg-[#e66a00] rounded-full text-white border-[#ff7200] hover:border-[#e66a00] h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="bg-[#ff7200] hover:bg-[#e66a00] rounded-full text-white border-[#ff7200] hover:border-[#e66a00] h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            </div>
          </div>
        </div>

        {productData.length === 0 ? (
          <p className="text-center bg-red-50 text-red-500 py-10 rounded-lg">
            No accessories available.
          </p>
        ) : (
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {productData.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 flex"
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
        )}
      </div>
    </div>
  );
};

export default AccessoriesProduct;
