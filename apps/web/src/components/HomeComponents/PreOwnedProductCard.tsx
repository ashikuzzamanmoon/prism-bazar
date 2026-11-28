"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart, removeFromCart } from "@/redux/slice/cartSlice";
import { RootState } from "@/redux/store";
import { IProduct } from "@/types/productTypes";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PreOwnedProductCard = ({ productData }: { productData: IProduct }) => {
    const dispatch = useAppDispatch();
    const cardItems = useAppSelector((state: RootState) => state.cart.items);
    const router = useRouter();

    const isInCart = (productId: string) =>
        cardItems.some((item) => item.id === productId);

    const handleAddToCartToggle = (product: IProduct) => {
        if (isInCart(product.id)) {
            dispatch(removeFromCart({ id: product.id }));
            toast.error(`${product.title} removed from cart`);
        } else {
            const defaultColor = product.productColors?.[0];
            const defaultOptions = product.productOptionGroups?.map(group => {
                const opt = group.options[0];
                return opt ? { id: opt.id, type: group.type || group.title, value: opt.value } : null;
            }).filter(Boolean) as { id: string, type: string, value: string }[] || [];

            dispatch(
                addToCart({
                    id: product.id,
                    name: product.title,
                    price: Number(product.price),
                    photo: product.productImages?.[0]?.url?.includes("example.com")
                        ? "/product-placeholder.svg"
                        : (product.productImages?.[0]?.url || "/placeholder.svg"),
                    quantity: 1,
                    deliveryCharge: Number(product?.deliveryCharge) || 0,
                    color: defaultColor ? { id: defaultColor.id, name: defaultColor.name } : undefined,
                    options: defaultOptions.length > 0 ? defaultOptions : undefined
                })
            );
            toast.success(`${product.title} added to cart`);
        }
    };

    const handleAddToBuy = (product: IProduct) => {
        if (!isInCart(product.id)) {
            const defaultColor = product.productColors?.[0];
            const defaultOptions = product.productOptionGroups?.map(group => {
                const opt = group.options[0];
                return opt ? { id: opt.id, type: group.type || group.title, value: opt.value } : null;
            }).filter(Boolean) as { id: string, type: string, value: string }[] || [];

            dispatch(
                addToCart({
                    id: product.id,
                    name: product.title,
                    price: Number(product.price),
                    photo: product.productImages?.[0]?.url?.includes("example.com")
                        ? "/product-placeholder.svg"
                        : (product.productImages?.[0]?.url || "/placeholder.svg"),
                    quantity: 1,
                    deliveryCharge: Number(product?.deliveryCharge) || 0,
                    color: defaultColor ? { id: defaultColor.id, name: defaultColor.name } : undefined,
                    options: defaultOptions.length > 0 ? defaultOptions : undefined
                })
            );
        }
        router.push("/checkout");
    };



    return (
        <div className={`h-full group relative bg-white border border-gray-100 hover:border-orange-200 rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col cursor-pointer`}>

            {productData.condition === "PRE_OWNED" && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#ff7200]/80 text-white text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        Pre-owned
                    </span>
                </div>
            )}


            {/* Heart Icon (Add to Cart Toggle) - Hidden if out of stock */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCartToggle(productData);
                }}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${isInCart(productData.id)
                    ? "bg-red-50 shadow-sm"
                    : "bg-white/70 shadow-sm hover:bg-white opacity-0 group-hover:opacity-100 md:opacity-0"
                    }`}
                aria-label="Add to cart"
            >
                <Heart
                    className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${isInCart(productData.id)
                        ? "text-red-500 fill-red-500"
                        : "text-gray-500 hover:text-red-500 hover:fill-red-500"
                        }`}
                />
            </button>

            <Link href={`/products/${productData.slug}`} className="cursor-pointer flex flex-col h-full bg-white relative">
                {/* Out of Stock Image Overlay */}

                {/* Image Section */}
                <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden bg-gray-50 group-hover:bg-white transition-colors duration-500 p-2 md:p-6 flex items-center justify-center">
                    <div className="relative w-[90%] h-[90%] md:w-full md:h-full transition-transform duration-500 ease-out ">
                        <Image
                            src={
                                productData.productImages?.[0]
                                    ? productData.productImages[0].url.includes("example.com")
                                        ? "/product-placeholder.svg"
                                        : productData.productImages[0].url
                                    : "/placeholder.svg"
                            }
                            alt={productData.title}
                            fill
                            className="object-contain mix-blend-multiply"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col grow  p-2 relative z-20">
                    {/* Brand */}
                    {productData.brand && (
                      <p className="text-[11px] md:text-xs text-gray-400 font-medium tracking-wide uppercase mb-1.5 flex items-center gap-2">
                        <span className="truncate">{productData.brand}</span>
                      </p>
                    )}

                    {/* Title */}
                    <h3 className="text-[13px] md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-3 group-hover:text-[#ff7200] transition-colors duration-200">
                        {productData.title}
                    </h3>

                    <div className="mt-auto ">
                        {/* Price Area */}
                        <div className="flex items-center justify-between  mb-2">
                            <div className="flex  items-center gap-2">

                                <span className="text-base md:text-lg font-bold text-[#ff7200] leading-none">
                                    ৳ {Number(productData.price).toLocaleString("en-BD")}
                                </span>
                                <span className="text-[11px] md:text-sm text-gray-400 line-through leading-none mb-1">
                                    ৳ {Number(productData.basePrice).toLocaleString("en-BD")}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className=" mt-auto">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddToBuy(productData);
                                }}
                                className="w-full py-1.5 px-1 rounded-lg text-xs md:text-sm font-medium text-white bg-[#ff7200] hover:bg-[#e66a00] border border-transparent transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default PreOwnedProductCard;
