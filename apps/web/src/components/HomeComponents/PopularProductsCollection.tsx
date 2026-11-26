"use client"
import { IProduct } from "@/types/productTypes";
import ProductCard from "./ProductCard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { addToCart } from "@/redux/slice/cartSlice";

export default function PopularProductsCollection({
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
        <section className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {productData?.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard
                                product={product}
                                onBuyNow={() => handleBuyNow(product)}
                                onView={() => handleView(product)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
