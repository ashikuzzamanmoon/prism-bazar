"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { addToCart } from "@/redux/slice/cartSlice";
import { trackEvent } from "@/lib/tracking";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const primaryImage = product.productImages?.find((img) => img.isPrimary);

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const router = useRouter();

  const isInCart = (productId: string) =>
    cartItems.some((item) => item.id === productId);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isInCart(product.id)) {
      const defaultColor = product.productColors?.[0];
      const prodAny = product as any;
      const defaultOptions =
        prodAny.productOptionGroups
          ?.map((group: any) => {
            const opt = group.options[0];
            return opt
              ? { id: opt.id, type: group.type || group.title, value: opt.value }
              : null;
          })
          .filter(Boolean) || [];

      const imgUrl = primaryImage?.url || "/placeholder.png";

      dispatch(
        addToCart({
          id: product.id,
          name: product.title,
          price: Number(product.price),
          photo: imgUrl.includes("example.com")
            ? "/product-placeholder.svg"
            : imgUrl,
          quantity: 1,
          deliveryCharge: Number(prodAny.deliveryCharge) || 0,
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
        },
      });
    }
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 hover:border-emerald-500/40 overflow-hidden hover:shadow-lg transition-all duration-300 group w-full flex flex-col justify-between p-3">
      <div>
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center mb-3">
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
              {product.discount}% OFF
            </span>
          )}
          <Link href={`/products/${product.slug}`} className="block relative w-full h-full">
            <Image
              src={primaryImage?.url || "/placeholder.png"}
              alt={primaryImage?.altText || product.title}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </Link>
        </div>

        <div className="px-1">
          <Link href={`/products/${product.slug}`}>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-emerald-700 transition-colors">
              {product.title}
            </p>
          </Link>

          <div className="flex items-baseline gap-2">
            <span className="text-emerald-700 font-extrabold text-base sm:text-lg">
              ৳{parseInt(product.price).toLocaleString()}
            </span>
            {product.basePrice &&
              parseInt(product.basePrice) > parseInt(product.price) && (
                <span className="text-gray-400 text-xs line-through">
                  ৳{parseInt(product.basePrice).toLocaleString()}
                </span>
              )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 flex gap-2">
        <button
          onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-xs py-2 rounded-xl hover:bg-emerald-700 cursor-pointer transition font-bold shadow-sm"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>অর্ডার করুন</span>
        </button>

        <Link
          href={`/products/${product.slug}`}
          className="flex items-center justify-center px-3 border border-gray-200 text-gray-700 text-xs py-2 hover:border-emerald-500 hover:text-emerald-700 rounded-xl transition font-medium"
        >
          বিস্তারিত
        </Link>
      </div>
    </div>
  );
}
