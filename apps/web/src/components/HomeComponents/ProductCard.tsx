"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Heart, Layers, ShoppingCart } from "lucide-react";
import { IProduct, IProductColor, IProductOptionGroup } from "@/types/productTypes";
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

      toast.success(`${product.title} added to cart`);
    }
  };


  return (
    <div
      onClick={() => onView(product)}
      className="group w-full h-full border border-gray-100 p-1 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer bg-white flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg mb-3">
        <Image
          src={imageUrl.includes("example.com") ? "/product-placeholder.svg" : imageUrl}
          alt={product.title}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Discount badge */}
        {product.discount > 0 && (
          <div className="absolute top-1 left-1 bg-[#ff7200] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {product.discount}% OFF
          </div>
        )}

        {/* Condition badge — fades out + shrinks on card hover */}
        <div
          className={cn(
            "absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full",
            "transition-all duration-200 ease-in-out",
            "opacity-100 scale-100 pointer-events-auto",
            "group-hover:opacity-0 group-hover:scale-75 group-hover:pointer-events-none",
            product.condition === "BRAND_NEW"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700",
          )}
        >
          {product.condition === "BRAND_NEW" ? "New" : "Pre-owned"}
        </div>

        {/* Heart button — fades in + grows on card hover (always visible if in cart) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCartToggle(product);
          }}
          className={cn(
            "absolute  z-10 p-1.5 rounded-full backdrop-blur-sm",
            "transition-all duration-200 ease-in-out hover:scale-110",
            isInCart(product.id)
              ? // always visible when in cart
              "opacity-100 top-8 right-2 scale-100 bg-red-50"
              : // fade in on hover
              "opacity-0 top-2 right-2 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto bg-white/80 hover:bg-white shadow-sm",
          )}
          aria-label={
            isInCart(product.id) ? "Remove from wishlist" : "Add to wishlist"
          }
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              isInCart(product.id)
                ? "text-red-500 fill-red-500"
                : "text-gray-400 hover:text-red-400 hover:fill-red-100",
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-2">
        <h3 className="text-[13px] md:text-sm font-medium text-gray-800 line-clamp-2 mb-2">
          {product.title}
        </h3>

        <p className="text-[11px] text-gray-400 mb-1">
          Model: {product.modelNumber}
        </p>

        {/* Variants row */}
        {hasVariants && (
          <div className="flex justify-between flex-wrap items-center gap-2 mt-0.5 mb-2">
            {/* Color swatches */}
            {colors.length > 0 && (
              <div className="flex items-center gap-1">
                {visibleColors.map((color) => (
                  <span
                    key={color.id}
                    title={color.name}
                    className="w-4 h-4 rounded-full border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.12)] shrink-0"
                    style={{ backgroundColor: color.hexCode }}
                  />
                ))}
                {extraColors > 0 && (
                  <span className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200 text-[8px] font-bold text-gray-500 flex items-center justify-center shrink-0">
                    +{extraColors}
                  </span>
                )}
              </div>
            )}

            {/* Option group badge — single pill */}
            {optionGroups.length > 0 && (
              <span className="inline-flex items-center gap-0.5 bg-gray-100 text-gray-500 text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                <Layers className="w-2.5 h-2.5" />
                {optionGroups.length} Variant
                {optionGroups.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Bottom Section */}
        <div className="relative mt-auto min-h-13">
          {/* Price — hidden on hover (desktop) */}
          <div className="flex flex-col justify-center opacity-100 md:group-hover:opacity-0 transition-opacity duration-200 md:absolute md:inset-0">
            <div className="flex items-baseline gap-2">
              <span className="text-base md:text-lg font-bold text-[#ff7200]">
                ৳ {formatPrice(product.price)}
              </span>
              {product.basePrice &&
                Number(product.basePrice) > Number(product.price) && (
                  <span className="text-xs md:text-sm text-gray-400 line-through">
                    ৳ {formatPrice(product.basePrice)}
                  </span>
                )}
            </div>
          </div>

          {/* Buy Now — shown on hover (desktop) */}
          <div className="absolute inset-0 hidden items-center gap-2 opacity-0 transition-opacity duration-200 md:flex group-hover:opacity-100">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBuyNow(product);
              }}
              size="default"
              className="w-full text-xs font-semibold border border-primary/30 bg-primary/30 text-primary hover:text-white cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              Buy Now
            </Button>
          </div>

          {/* Buy Now — always visible on mobile */}
          <div className="mt-2 md:hidden flex gap-2">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBuyNow(product);
              }}
              className="w-full h-8 text-[11px] font-semibold border border-primary/30 bg-primary/30 text-primary hover:text-white cursor-pointer px-2"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
