"use client"
import { IProduct } from "@/types/productTypes";
import ProductCard from "./ProductCard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { addToCart } from "@/redux/slice/cartSlice";

export default function LaptopsCollection({
    productData,
    title = "জনপ্রিয় পণ্যসমূহ",
}: {
    productData: IProduct[];
    title?: string;
}) {
     const dispatch = useAppDispatch();
      const cartItems = useAppSelector((state: RootState) => state.cart.items);
      const router = useRouter();

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

    return (
        <div className="w-full max-w-7xl mx-auto px-2 md:px-0 py-4">
            <div className="mb-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <div className="h-0.5 w-10 bg-[#16a34a] rounded-full mt-1" />
            </div>
            {productData?.length === 0 ? (
                <div>
                    <p className="text-center bg-red-50 text-red-500 py-10">
                        No new products available.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                    {productData.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onBuyNow={handleBuyNow}
                            onView={handleView}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
