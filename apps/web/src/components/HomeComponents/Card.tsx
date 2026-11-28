"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart, removeFromCart } from "@/redux/slice/cartSlice";
import { RootState } from "@/redux/store";
import { IProduct } from "@/types/productTypes";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const Card = ({ productData }: { productData: IProduct }) => {
    const dispatch = useAppDispatch();
    const cardItems = useAppSelector((state: RootState) => state.cart.items);
    const [isHovered, setIsHovered] = useState(false);

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

    const getImageUrl = (image: any): string => {
        if (image?.url) {
            return image.url.includes("example.com") ? "/product-placeholder.svg" : image.url;
        }
        return "/placeholder.svg";
    };

    const images = productData.productImages || [];
    const primaryImg = getImageUrl(images[0]);
    const secondImg = images.length > 1 ? getImageUrl(images[1]) : primaryImg;

    // Calculate total stock from productInventories
    let totalStock = 0;
    if ((productData as any)?.productInventories && (productData as any).productInventories.length > 0) {
        totalStock = (productData as any).productInventories.reduce((sum: number, inventory: any) => sum + (Number(inventory.quantity) || 0), 0);
    } else if (productData?.productColors && productData.productColors.length > 0) {
        // Fallback to colors if no inventories
        totalStock = productData.productColors.reduce((sum, color) => sum + (Number(color.stock) || 0), 0);
    } else {
        // Fallback if stock is stored on the main product directly
        totalStock = Number((productData as any)?.stock) || 0;
    }
    const isDigital = Boolean(productData?.isDigital);
    const isOutOfStock = !isDigital && totalStock <= 0;

    return (
        <Link
            href={`/products/${productData.slug}`}
            className="block h-full"
        >
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`h-full relative bg-[#f5f3f0] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer hover:shadow-lg ${isOutOfStock ? "opacity-75 grayscale-[30%]" : ""}`}
            >
                {/* Heart Icon - Top Left */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isOutOfStock) handleAddToCartToggle(productData);
                    }}
                    className={`absolute top-3 left-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isInCart(productData.id)
                        ? "bg-red-50 shadow-md"
                        : "bg-white/60 backdrop-blur-sm hover:bg-white shadow-sm"
                        }`}
                    aria-label="Add to wishlist"
                >
                    <Heart
                        className={`w-[18px] h-[18px] transition-all duration-300 ${isInCart(productData.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-500 hover:text-red-400"
                            }`}
                        strokeWidth={1.5}
                    />
                </button>

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="bg-red-500/90 text-white font-bold tracking-wider uppercase text-sm px-5 py-1.5 rounded-lg -rotate-12 shadow-lg">
                            Stockout
                        </div>
                    </div>
                )}

                {/* Image Section */}
                <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center p-6">
                    {/* Primary Image */}
                    <div
                        className={`absolute inset-0 p-6 flex items-center justify-center transition-opacity duration-500 ease-in-out ${isHovered ? "opacity-0" : "opacity-100"
                            }`}
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={primaryImg}
                                alt={productData.title}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                        </div>
                    </div>

                    {/* Hover Image */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${isHovered ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={secondImg}
                                alt={`${productData.title} - alternate view`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="px-4 pb-5 pt-2 text-center flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                        {productData.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                        {productData.discount && productData.discount > 0 && productData.basePrice ? (
                            <span className="text-xs text-gray-400 line-through">
                                ৳ {Number(productData.basePrice).toLocaleString("en-BD")}
                            </span>
                        ) : null}
                        <span className="text-base font-bold text-[#ff7200]">
                            ৳ {Number(productData.price).toLocaleString("en-BD")}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default Card;
