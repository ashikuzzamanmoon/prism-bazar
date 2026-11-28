"use client";
import Image from "next/image";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Check,
  Settings,
  Leaf,
  HeartPulse,
  BookOpen,
  Sparkles,
  ShieldCheck,
  FileText,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { addToCart, removeFromCart } from "@/redux/slice/cartSlice";
import { useRouter } from "next/navigation";
import {
  IProduct,
  IProductImage,
  IProductColor,
  IProductOption,
} from "@/types/productTypes";
import { ProductSpecs } from "./ProductSpecs";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking";

export function ProductDetail({
  productData,
  categoryName,
}: {
  productData: IProduct;
  categoryName?: string;
}) {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbsApi, setThumbsApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useAppDispatch();
  const cardItems = useAppSelector((state: RootState) => state.cart.items);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Variant Selection State
  const [selectedColor, setSelectedColor] = useState<IProductColor | null>(
    null,
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, IProductOption>
  >({});
  const [prevStock, setPrevStock] = useState<number | null>(null);

  const calculatePrice = () => {
    let current = Number(productData.price);
    let base = Number(productData.basePrice || productData.price);

    if (selectedColor && Number(selectedColor.basePrice) > 0) {
      current += Number(selectedColor.basePrice);
      base += Number(selectedColor.basePrice);
    }

    Object.values(selectedOptions).forEach((opt) => {
      if (Number(opt.extraPrice) > 0) {
        current += Number(opt.extraPrice);
        base += Number(opt.extraPrice);
      }
    });

    return { current, base };
  };

  const { current: currentPrice, base: originalPrice } = calculatePrice();

  const computeVariantId = () => {
    let vId = productData.id;
    if (selectedColor) vId += `-${selectedColor.id}`;
    const optionIds = Object.values(selectedOptions)
      .map((opt) => opt.id)
      .sort()
      .join("-");
    if (optionIds) vId += `-${optionIds}`;
    return vId;
  };

  const computeVariantName = () => {
    let name = productData.title;
    const subNames = [];
    if (selectedColor) subNames.push(selectedColor.name);
    const optNames = Object.values(selectedOptions).map((opt) => opt.value);
    if (optNames.length > 0) subNames.push(...optNames);
    if (subNames.length > 0) name += ` (${subNames.join(", ")})`;
    return name;
  };

  const currentVariantId = computeVariantId();

  const isInCart = (variantId: string) => {
    return cardItems.some((item) => item.id === variantId);
  };

  const isBaseProductInCart = (productId: string) => {
    return cardItems.some((item) => item.id.startsWith(productId));
  };

  const handleColorSelect = (color: IProductColor) => {
    setSelectedColor((prev) => (prev?.id === color.id ? null : color));
    // Reset carousel to first image when changing colors
    if (mainApi) {
      mainApi.scrollTo(0);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    if (!mainApi || !thumbsApi) return;
    const handleMainSelect = () => {
      const index = mainApi.selectedScrollSnap();
      setCurrentIndex(index);
      thumbsApi.scrollTo(index);
    };

    mainApi.on("select", handleMainSelect);
    return () => {
      mainApi.off("select", handleMainSelect);
    };
  }, [mainApi, thumbsApi]);

  // Handle thumbnail click
  const handleThumbClick = (index: number) => {
    if (mainApi) {
      mainApi.scrollTo(index);
    }
  };

  // Handle quantity changes
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Calculate total stock from productInventories
  let totalStock = 0;
  if (
    (productData as any)?.productInventories &&
    (productData as any).productInventories.length > 0
  ) {
    totalStock = (productData as any).productInventories.reduce(
      (sum: number, inventory: any) => sum + (Number(inventory.quantity) || 0),
      0,
    );
  } else if (
    productData?.productColors &&
    productData.productColors.length > 0
  ) {
    // Fallback to colors if no inventories
    totalStock = productData.productColors.reduce(
      (sum, color) => sum + (Number(color.stock) || 0),
      0,
    );
  } else {
    // Fallback if stock is stored on the main product directly
    totalStock = Number((productData as any)?.stock) || 0;
  }

  const isDigital = Boolean(productData?.isDigital);
  const isEducationProduct =
    productData?.type === "EDUCATION_MATERIAL" ||
    Boolean(productData?.author) ||
    Boolean(productData?.publisher);
  const isOrganicProduct =
    productData?.type === "ORGANIC_FOOD" ||
    Boolean(productData?.ingredients) ||
    Boolean(productData?.nutritionInfo);

  // If we have selected a color, only consider that color's stock
  const availableStock = isDigital
    ? 9999
    : selectedColor
    ? Number(selectedColor.stock) || 0
    : totalStock;
  const inStock = isDigital || availableStock > 0;

  const displayImages =
    selectedColor && selectedColor.images && selectedColor.images.length > 0
      ? selectedColor.images
      : productData?.productImages || [];

  // Update quantity constraint whenever stock changes
  if (availableStock !== prevStock) {
    setPrevStock(availableStock);
    if (quantity > availableStock && availableStock > 0) {
      setQuantity(availableStock);
    } else if (quantity < 1 && availableStock > 0) {
      setQuantity(1);
    } else if (availableStock === 0 && quantity !== 0) {
      setQuantity(0);
    }
  }

  if (!productData) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  const getImageUrl = (image: any): string => {
    if (image?.url) {
      return image.url.includes("example.com") ? "/product-placeholder.svg" : image.url;
    }
    return "/placeholder.svg";
  };

  const handleAddToCart = (product: IProduct) => {
    const existingItem = cardItems.find(
      (item) => item.id === currentVariantId || item.id.startsWith(product.id),
    );
    if (existingItem) {
      dispatch(removeFromCart({ id: existingItem.id }));
      toast.error(`${product.title} removed from cart`);
    } else {
      const cartPayload = {
        id: currentVariantId,
        name: computeVariantName(),
        price: currentPrice,
        photo: getImageUrl(
          (selectedColor?.images?.[0] as any) || product.productImages?.[0],
        ),
        quantity: quantity,
        deliveryCharge: Number(product.deliveryCharge) || 0,
        color: selectedColor
          ? {
            name: selectedColor.name,
            id: selectedColor.id,
          }
          : undefined,
        options: Object.entries(selectedOptions).map(([groupId, opt]) => {
          const group = product.productOptionGroups?.find(
            (g) => g.id === groupId,
          );
          return {
            type: group?.type || group?.title || "Option",
            value: opt.value,
            id: opt.id,
          };
        }),
      };

      dispatch(addToCart(cartPayload));

      // Tracking
      trackEvent({
        eventName: "AddToCart",
        eventData: {
          content_name: computeVariantName(),
          content_ids: [currentVariantId],
          value: currentPrice,
          currency: "BDT",
          content_type: "product",
          quantity: quantity,
        },
      });

      toast.success(`${computeVariantName()} added to cart`);
    }
  };

  const handleOrder = (product: IProduct) => {
    if (isInCart(currentVariantId)) {
      dispatch(removeFromCart({ id: currentVariantId }));
    } else {
      const orderPayload = {
        id: currentVariantId,
        name: computeVariantName(),
        price: currentPrice,
        photo: getImageUrl(
          (selectedColor?.images?.[0] as any) || product.productImages?.[0],
        ),
        quantity: quantity,
        deliveryCharge: Number(product.deliveryCharge) || 0,
        color: selectedColor
          ? {
            id: selectedColor.id,
            name: selectedColor.name,
          }
          : undefined,
        options: Object.entries(selectedOptions).map(([groupId, opt]) => {
          const group = product.productOptionGroups?.find(
            (g) => g.id === groupId,
          );
          return {
            id: opt.id,
            type: group?.type || group?.title || "Option",
            value: opt.value,
          };
        }),
      };

      dispatch(addToCart(orderPayload));

      // Tracking
      trackEvent({
        eventName: "AddToCart",
        eventData: {
          content_name: computeVariantName(),
          content_ids: [currentVariantId],
          value: currentPrice,
          currency: "BDT",
          content_type: "product",
          quantity: quantity,
        },
      });
    }
    router.push("/checkout");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
      console.error("Failed to copy:", err);
    }
  };


  const increaseQuantitySafe = () => {
    if (quantity < availableStock) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.warning(`Only ${availableStock} items available in stock`);
    }
  };

  return (
    <div className="">
      <div className="flex flex-wrap items-center text-sm text-gray-500 ">
        <ChevronRight className="h-4 w-4 mx-2" />
        <h1 className="hover:text-primary">{categoryName}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 h-auto md:h-full">
        {/* Left side - Product Images */}
        <div className="space-y-4">
          <Carousel
            setApi={setMainApi}
            className="w-full rounded-lg overflow-hidden bg-white"
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {displayImages.map((image: any, index: number) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-4/3 bg-white rounded-md overflow-hidden">
                    <Image
                      src={getImageUrl(image)}
                      alt={`Image ${index + 1}`}
                      fill
                      className=" object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:left-4 bg-primary text-white border-none" />
            <CarouselNext className="right-2 md:right-4 bg-primary text-white border-none" />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-10">
              {currentIndex + 1} / {displayImages.length || 0}
            </div>
          </Carousel>

          {/* Thumbnail Carousel - Show on ALL devices */}
          <div className="w-full">
            <Carousel
              setApi={setThumbsApi}
              className="w-full"
              opts={{
                containScroll: "keepSnaps",
                dragFree: true,
              }}
            >
              <CarouselContent className="-ml-2">
                {displayImages.map((image: any, index: number) => (
                  <CarouselItem
                    key={index}
                    className="pl-2 basis-1/4 md:basis-1/5 lg:basis-1/6"
                  >
                    <div
                      className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${currentIndex === index
                          ? "border-primary opacity-100"
                          : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"
                        }`}
                      onClick={() => handleThumbClick(index)}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={getImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* Right side - Product Information */}
        <div className="flex flex-col h-auto md:h-full">
          <div className="grow">
            {productData && (
              <div className="flex flex-wrap items-center gap-2">
                {productData.type === "ORGANIC_FOOD" && (
                  <Badge className="bg-emerald-600 text-white mb-2 py-1">
                    অর্গানিক ফুড
                  </Badge>
                )}
                {productData.type === "EDUCATION_MATERIAL" && (
                  <Badge className="bg-amber-600 text-white mb-2 py-1">
                    শিক্ষা উপকরণ
                  </Badge>
                )}
                {productData.isDigital && (
                  <Badge className="bg-blue-600 text-white mb-2 py-1">
                    ডিজিটাল ডাউনলোড (PDF)
                  </Badge>
                )}
                <Badge className="bg-primary text-white mb-2 py-1">
                  {productData.condition === "FRESH"
                    ? "টাটকা / সতেজ"
                    : productData.condition === "PACKAGED"
                    ? "প্যাকেটজাত"
                    : productData.condition === "HANDMADE"
                    ? "হাতে তৈরি"
                    : productData.condition === "PRINTED"
                    ? "প্রিন্ট কপি"
                    : productData.condition === "DIGITAL"
                    ? "ডিজিটাল কপি"
                    : productData.condition
                    ? productData.condition
                        .split("_")
                        .map(
                          (word: string) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join(" ")
                    : "নতুন পণ্য"}
                </Badge>
                <a
                  href={`https://wa.me/8801712714334?text=Hello! I'm interested in ${encodeURIComponent(
                    productData.title,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge className="bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white mb-2 flex items-center gap-1 border-0 shadow-none py-1 ">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.18-1.24-6.17-3.495-8.416" />
                    </svg>
                    Message
                  </Badge>
                </a>
              </div>
            )}

            <h1 className="mb-2 text-xl font-bold leading-tight sm:text-2xl">
              {productData.title}
            </h1>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(productData.ratings || 0)
                        ? "fill-amber-500 text-amber-500"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {productData.ratings || 0} ({productData.reviewsCount || 0}{" "}
                reviews)
              </span>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-2xl md:text-3xl font-bold text-primary break-words">
                  {currentPrice.toLocaleString("en-BD")} ৳
                </span>
                <span className="text-sm text-gray-500 line-through sm:text-base">
                  {originalPrice.toLocaleString("en-BD")} ৳
                </span>
              </div>
            </div>

            {/* Regional Delivery Promise */}
            <div className="mb-4 flex items-center gap-2 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs md:text-sm text-emerald-900 font-medium">
              <span className="text-base">🚚</span>
              <span>সিরাজগঞ্জ ও কাজিপুরে দ্রুত হোম ডেলিভারি এবং সারা দেশে কুরিয়ার সার্ভিস।</span>
            </div>

            {/* Organic Food Essentials */}
            {(productData.ingredients || productData.nutritionInfo) && (
              <div className="mb-5 p-3.5 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200/70 rounded-xl text-xs md:text-sm space-y-2">
                {productData.ingredients && (
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-bold text-emerald-900">🌿 উপাদান (Ingredients):</span>{" "}
                    {productData.ingredients}
                  </p>
                )}
                {productData.nutritionInfo && (
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-bold text-emerald-900">🍎 পুষ্টিগুণ:</span>{" "}
                    {productData.nutritionInfo}
                  </p>
                )}
              </div>
            )}

            {/* Book / Education Specific Details */}
            {isEducationProduct && (
              <div className="mb-5 p-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/70 rounded-xl text-xs md:text-sm space-y-2">
                {productData.author && (
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-bold text-amber-900">✍️ লেখক / সংকলক:</span>{" "}
                    {productData.author}
                  </p>
                )}
                {productData.publisher && (
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-bold text-amber-900">🏢 প্রকাশক / প্রতিষ্ঠান:</span>{" "}
                    {productData.publisher}
                  </p>
                )}
                <p className="text-gray-800 leading-relaxed">
                  <span className="font-bold text-amber-900">📚 সংস্করণ / ফরম্যাট:</span>{" "}
                  {productData.isDigital
                    ? "ডিজিটাল সংস্করণ (PDF ফাইল ডাউনলোড)"
                    : "মুদ্রিত বই (হার্ডকপি সংস্করণ)"}
                </p>
              </div>
            )}

            {/* Variant Selection: Colors */}
            {productData.productColors &&
              productData.productColors.filter((c) => c.isPublish).length >
              0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">
                    {productData.type === "ORGANIC_FOOD" ? "ভ্যারিয়েন্ট / সাইজ:" : "কালার / ভ্যারিয়েন্ট:"}{" "}
                    <span className="text-gray-500 font-normal">
                      {selectedColor?.name}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {productData.productColors
                      .filter((c) => c.isPublish)
                      .map((color) => (
                        <button
                          key={color.id}
                          onClick={() => handleColorSelect(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor?.id === color.id ? "border-primary ring-2 ring-primary/30 ring-offset-1" : "border-gray-200 hover:border-gray-300"}`}
                          style={{ backgroundColor: color.hexCode }}
                          title={color.name}
                        />
                      ))}
                  </div>
                </div>
              )}

            {/* Variant Selection: Option Groups */}
            {productData.productOptionGroups &&
              productData.productOptionGroups.filter((g) => g.isPublish)
                .length > 0 && (
                <div className="mb-6 space-y-4">
                  {productData.productOptionGroups
                    .filter((g) => g.isPublish)
                    .map((group) => {
                      const publishedOptions = group.options.filter(
                        (o) => o.isPublish,
                      );
                      if (publishedOptions.length === 0) return null;
                      return (
                        <div key={group.id}>
                          <h3 className="font-medium mb-3">
                            {group.title}:{" "}
                            <span className="text-gray-500 font-normal">
                              {selectedOptions[group.id]?.value}
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {publishedOptions.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() =>
                                  setSelectedOptions((prev) => {
                                    const newOpts = { ...prev };
                                    if (newOpts[group.id]?.id === opt.id) {
                                      delete newOpts[group.id];
                                    } else {
                                      newOpts[group.id] = opt;
                                    }
                                    return newOpts;
                                  })
                                }
                                className={`px-4 py-2 border rounded-md text-sm transition-all ${selectedOptions[group.id]?.id === opt.id ? "border-primary bg-primary/5 text-primary tracking-wide font-medium" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}
                              >
                                {opt.value}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

            <div className="mb-3 flex flex-wrap items-center gap-3 sm:gap-4">
              <h3 className="font-medium">Quantity:</h3>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={decreaseQuantity}
                  className="px-3 py-1 border-r hover:bg-gray-100 disabled:opacity-50"
                  disabled={!inStock || quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={increaseQuantitySafe}
                  className="px-3 py-1 border-l hover:bg-gray-100 disabled:opacity-50"
                  disabled={!inStock || quantity >= availableStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Availability Info */}
            <div className="mb-6">
              {inStock ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-700 font-semibold">স্টকে আছে (In Stock)</span>
                  {/* <span className="text-gray-500">({availableStock} items available)</span> */}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-red-600 font-medium">স্টক শেষ (Out of Stock)</span>
                </div>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto px-4 md:px-8 font-semibold rounded-md bg-primary text-white hover:bg-primary"
                disabled={!inStock}
                onClick={() => handleOrder(productData)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now
              </Button>
              <Button
                variant="outline"
                className={`w-full sm:w-auto flex items-center justify-center gap-2 shadow-none px-4 md:px-8 font-semibold rounded-md py-5 transition-colors duration-300 ${isBaseProductInCart(productData.id)
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    : "bg-white text-gray-700 hover:bg-primary hover:text-white"
                  }`}
                onClick={() => handleAddToCart(productData)}
              >
                <span>
                  {isBaseProductInCart(productData.id)
                    ? "Remove from cart"
                    : "Add to cart"}
                </span>
                <Heart
                  className={`w-5 h-5 transition-colors duration-300 ${isBaseProductInCart(productData.id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-400 group-hover:text-white"
                    }`}
                />
              </Button>

              {/* <Button
                size="icon"
                variant="outline"
                className="self-start rounded-full hover:bg-[#ff7200] hover:text-white hover:border-none sm:self-auto"
                onClick={handleShare}
                title="Share"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details (Organic Food / Education Materials) */}
      {(productData?.ingredients ||
        productData?.nutritionInfo ||
        (isEducationProduct && (productData?.author || productData?.publisher || productData?.isDigital !== undefined)) ||
        productData?.brand?.title) && (
        <div className="mt-8 border border-gray-100 rounded-2xl p-6 bg-white shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>প্রয়োজনীয় তথ্য ও স্পেসিফিকেশন</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productData.ingredients && (
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/80">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>উপাদান (Ingredients)</span>
                </div>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {productData.ingredients}
                </p>
              </div>
            )}
            {productData.nutritionInfo && (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/80">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                  <HeartPulse className="w-4 h-4 text-amber-600" />
                  <span>পুষ্টিগুণ (Nutrition Value)</span>
                </div>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {productData.nutritionInfo}
                </p>
              </div>
            )}
            {isOrganicProduct && (
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/80">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>পণ্যের অবস্থা ও প্যাকেজিং</span>
                </div>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {productData.condition === "FRESH"
                    ? "টাটকা ও নির্ভেজাল (Fresh & Pure)"
                    : productData.condition === "PACKAGED"
                    ? "প্রিমিয়াম বোতলজাত / বায়ুরোধী প্যাকেটজাত"
                    : "১০০% প্রাকৃতিক ও নিরাপদ খাদ্য"}
                </p>
              </div>
            )}
            {isEducationProduct && productData.author && (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/80">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>লেখক / সংকলক (Author)</span>
                </div>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {productData.author}
                </p>
              </div>
            )}
            {isEducationProduct && productData.publisher && (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/80">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>প্রকাশক / প্রতিষ্ঠান (Publisher)</span>
                </div>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {productData.publisher}
                </p>
              </div>
            )}
            {isEducationProduct && (
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100/80">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider mb-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>বইয়ের সংস্করণ / ফরম্যাট</span>
                </div>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {productData.isDigital
                    ? "ডিজিটাল সংস্করণ (PDF ফাইল ডাউনলোড)"
                    : "মুদ্রিত কপি (সরাসরি হোম ডেলিভারি)"}
                </p>
              </div>
            )}
            {productData.brand?.title && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>অফিসিয়াল ব্র্যান্ড</span>
                </div>
                <p className="text-sm text-gray-900 font-semibold">
                  {productData.brand.title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {productData?.productFeatures && productData.productFeatures.length > 0 && (
        <ProductSpecs features={productData?.productFeatures} />
      )}

      {/* Detailed Description */}
      <div className="mt-8 border border-gray-100 rounded-2xl p-6 bg-white shadow-xs">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
          বিস্তারিত বিবরণ
        </h2>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
          {productData?.description}
        </div>
      </div>
    </div>
  );
}
