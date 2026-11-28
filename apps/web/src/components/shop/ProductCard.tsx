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
  const primaryImage = product.productImages.find((img) => img.isPrimary);

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
          photo: imgUrl.includes("example.com") ? "/product-placeholder.svg" : imgUrl,
          quantity: 1,
          deliveryCharge: Number(prodAny.deliveryCharge) || 0,
          color: defaultColor
            ? { id: defaultColor.id, name: defaultColor.name }
            : undefined,
          options: defaultOptions.length > 0 ? defaultOptions : undefined,
        })
      );
      
      // Tracking
      trackEvent({
        eventName: "AddToCart",
        eventData: {
          content_name: product.title,
          content_ids: [product.id],
          value: Number(product.price),
          currency: "BDT",
          content_type: "product"
        }
      });
    }
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 hover:border-orange-200 overflow-hidden hover:shadow-md transition group w-full ">
      <div className="relative">
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            {product.discount}% OFF
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <div className="relative h-48 md:h-52 w-full p-2">
            <Image
              src={primaryImage?.url || "/placeholder.png"}
              alt={primaryImage?.altText || product.title}
              fill
              className="object-contain group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>
      </div>

      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-orange-500 transition-colors">
            {product.title}
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-orange-500 font-bold text-lg">
            ৳{parseInt(product.price).toLocaleString()}
          </p>
          {product.basePrice &&
            parseInt(product.basePrice) > parseInt(product.price) && (
              <p className="text-gray-400 text-xs line-through">
                ৳{parseInt(product.basePrice).toLocaleString()}
              </p>
            )}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-orange-500 text-sm py-1.5 hover:bg-primary hover:text-white rounded-lg cursor-pointer transition font-medium">
            Buy Now
          </button>

          <Link
            href={`/products/${product.slug}`}
            className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-orange-500 text-sm py-1.5 hover:bg-primary hover:text-white rounded-lg cursor-pointer transition font-semibold"
          >
            See more
          </Link>
        </div>
      </div>
    </div>
  );
}
