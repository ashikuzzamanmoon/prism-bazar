"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IProduct } from "@/types/productTypes";
import { addToCart } from "@/redux/slice/cartSlice";
import ProductCard from "../HomeComponents/ProductCard";
import { trackEvent } from "@/lib/tracking";

interface Props {
  products: IProduct[];
}

export default function ProductGrid({ products }: Props) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const handleClearAllFilters = () => {
    if (searchParams.toString()) {
      router.replace(pathname, { scroll: false });
    }
  };

  if (products?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <p className="text-gray-500 font-medium">কোনো পণ্য পাওয়া যায়নি</p>
        <button
          onClick={handleClearAllFilters}
          className="mt-3 text-sm font-semibold text-emerald-700 hover:underline cursor-pointer"
        >
          ফিল্টার ক্লিয়ার করে সব পণ্য দেখুন
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onBuyNow={handleBuyNow}
          onView={handleView}
        />
      ))}
    </div>
  );
}
