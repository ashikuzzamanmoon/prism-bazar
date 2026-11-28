"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Heart, Layers, ShoppingCart } from "lucide-react";
import {
  IProduct,
  IProductColor,
  IProductOptionGroup,
} from "@/types/productTypes";
import { cn } from "@/utils/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { addToCart, removeFromCart } from "@/redux/slice/cartSlice";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking";
import { useRouter } from "next/navigation";

interface IProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

const getPrimaryImage = (images: IProductImage[]): string => {
  if (!images || images.length === 0) return "/placeholder.svg";
  const primary = images.find((img) => img.isPrimary);
  return primary?.url || images[0]?.url || "/placeholder.svg";
};

const formatPrice = (price: string | number) =>
  Number(price).toLocaleString("en-BD");

const MAX_COLORS_SHOWN = 3;

interface ProductCardProps {
  product: IProduct;
  onBuyNow: (product: IProduct) => void;
  onView: (product: IProduct) => void;
}

const getConditionBadge = (product: IProduct) => {
  if (product.type === "ORGANIC_FOOD") {
    return {
      text: "খাঁটি অর্গানিক",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
  if (
    product.type === "EDUCATION_MATERIAL" ||
    product.condition === "DIGITAL" ||
    product.condition === "PRINTED"
  ) {
    return {
      text: product.condition === "DIGITAL" ? "ডিজিটাল PDF" : "শিক্ষা সহায়ক",
      className: "bg-blue-50 text-blue-800 border-blue-200",
    };
  }
  if (product.condition === "FRESH") {
    return {
      text: "তাজা / ফ্রেশ",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
  if (product.condition === "PACKAGED") {
    return {
      text: "প্যাকেটজাত",
      className: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return {
    text: "নতুন",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
};

const ProductCard = ({ product, onBuyNow, onView }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const router = useRouter();

  const imageUrl = getPrimaryImage(product.productImages as IProductImage[]);
  const colors = (product.productColors ?? []) as IProductColor[];
  const optionGroups = (product.productOptionGroups ??
    []) as IProductOptionGroup[];

  const visibleColors = colors.slice(0, MAX_COLORS_SHOWN);
  const extraColors = colors.length - MAX_COLORS_SHOWN;
  const hasVariants = colors.length > 0 || optionGroups.length > 0;

  const isInCart = (productId: string) =>
    cartItems.some((item) => item.id === productId);

  const handleAddToCartToggle = (product: IProduct) => {
    if (isInCart(product.id)) {
      dispatch(removeFromCart({ id: product.id }));
      toast.error(`${product.title} removed from cart`);
    } else {
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

      // Tracking
      trackEvent({
        eventName: "AddToCart",
        eventData: {
          content_name: product.title,
          content_ids: [product.id],
          value: Number(product.price),
          currency: "BDT",
          content_type: "product",
          quantity: 1,
        },
      });

      toast.success(`${product.title} কার্টে যোগ করা হয়েছে`);
    }
  };

  const badgeInfo = getConditionBadge(product);

  return (
    <div
      onClick={() => onView(product)}
      className="group w-full h-full rounded-2xl border border-gray-200/80 p-3 hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 cursor-pointer bg-white flex flex-col justify-between"
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl mb-3 bg-gray-50 flex items-center justify-center">
          <Image
            src={
              imageUrl.includes("example.com")
                ? "/product-placeholder.svg"
                : imageUrl
            }
            alt={product.title}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Discount badge */}
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.discount}% OFF
            </div>
          )}

          {/* Type / Condition badge */}
          <div
            className={cn(
              "absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm",
              "transition-all duration-200 ease-in-out",
              badgeInfo.className,
              "group-hover:opacity-0 group-hover:scale-75 pointer-events-none",
            )}
          >
            {badgeInfo.text}
          </div>

          {/* Heart / Wishlist toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCartToggle(product);
            }}
            className={cn(
              "absolute z-10 p-2 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-110",
              isInCart(product.id)
                ? "opacity-100 top-2 right-2 scale-100 bg-red-50 text-red-500 border border-red-200"
                : "opacity-0 top-2 right-2 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto bg-white/90 hover:bg-white text-gray-500 hover:text-red-500 border border-gray-100",
            )}
            aria-label={
              isInCart(product.id) ? "Remove from cart" : "Add to cart"
            }
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors duration-200",
                isInCart(product.id)
                  ? "text-red-500 fill-red-500"
                  : "text-gray-400 hover:text-red-500 hover:fill-red-100",
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col px-1">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1.5 group-hover:text-emerald-700 transition-colors">
            {product.title}
          </h3>

          {/* Variants row */}
          {hasVariants && (
            <div className="flex justify-between flex-wrap items-center gap-2 mt-0.5 mb-2">
              {colors.length > 0 && (
                <div className="flex items-center gap-1">
                  {visibleColors.map((color) => (
                    <span
                      key={color.id}
                      title={color.name}
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.12)] shrink-0"
                      style={{ backgroundColor: color.hexCode || "#16a34a" }}
                    />
                  ))}
                  {extraColors > 0 && (
                    <span className="text-[10px] text-gray-500 font-medium ml-0.5">
                      +{extraColors}
                    </span>
                  )}
                </div>
              )}

              {optionGroups.length > 0 && (
                <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                  <Layers className="w-2.5 h-2.5" />
                  {optionGroups.length} ভ্যারিয়েন্ট
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative mt-2 pt-2 border-t border-gray-100 px-1">
        {/* Price display (visible on normal desktop, fades on hover for Buy Now) */}
        <div className="flex flex-col justify-center opacity-100 md:group-hover:opacity-0 transition-opacity duration-200 md:absolute md:inset-0">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-emerald-700">
              ৳ {formatPrice(product.price)}
            </span>
            {product.basePrice &&
              Number(product.basePrice) > Number(product.price) && (
                <span className="text-xs text-gray-400 line-through">
                  ৳ {formatPrice(product.basePrice)}
                </span>
              )}
          </div>
        </div>

        {/* Buy Now — shown on hover (desktop) */}
        <div className="absolute inset-0 hidden items-center opacity-0 transition-opacity duration-200 md:flex group-hover:opacity-100">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBuyNow(product);
            }}
            size="sm"
            className="w-full text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer h-9"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            অর্ডার করুন
          </Button>
        </div>

        {/* Buy Now — always visible on mobile */}
        <div className="mt-2 md:hidden">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBuyNow(product);
            }}
            className="w-full h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-2"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            অর্ডার করুন
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
