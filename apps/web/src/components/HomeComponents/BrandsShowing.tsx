"use client"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselApi
} from "@/components/ui/carousel";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface IBrand {
    id: string;
    title: string;
    slug: string;
    image: string;
    isDelete: boolean;
    isPublish: boolean;
    createdAt: string;
    updatedAt: string;
    order: number;
}

const BrandsShowing = ({ brandData }: { brandData: IBrand[] }) => {
    const [api, setApi] = useState<CarouselApi>();

    const scrollPrev = useCallback(() => {
        if (api) api.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
        if (api) api.scrollNext();
    }, [api]);

    const brandList: IBrand[] = Array.isArray(brandData)
        ? brandData
        : (brandData as any)?.data && Array.isArray((brandData as any).data)
            ? (brandData as any).data
            : [];

    const visibleBrands: IBrand[] = brandList
        .filter((brand: IBrand) => !brand.isDelete && brand.isPublish)
        .sort((a: IBrand, b: IBrand) => a.order - b.order);

    if (!visibleBrands.length) return null;

    return (
        <div className="w-full bg-white py-3 md:py-6">
            <div className="container max-w-7xl px-4 md:px-0 mx-auto">
                <div className="relative">

                    <div className="w-full flex justify-between items-center mb-6">
                        <h2 className="text-xl font-medium text-primary">
                            All Brands
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={scrollPrev}
                                className="bg-primary hover:bg-primary/90 rounded-full text-white border-primary h-8 w-8"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={scrollNext}
                                className="bg-primary hover:bg-primary/90 rounded-full text-white border-primary h-8 w-8"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: "start",
                            loop: true,
                            dragFree: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {visibleBrands.map((brand) => (
                                <CarouselItem
                                    key={brand.id}
                                    className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-[12.5%]"
                                >
                                    <a
                                        href={`/products?brand=${brand.slug}`}
                                        className="flex flex-col justify-between items-center p-2 md:p-3 border border-gray-100 text-gray-800 rounded-lg cursor-pointer transition-all duration-300 hover:border-[#ff7200] hover:shadow-md group"
                                    >
                                        {/* Brand image */}
                                        <div className="flex items-center justify-center mb-2 w-16 h-16 overflow-hidden">
                                            <Image
                                                src={brand.image}
                                                alt={brand.title}
                                                width={80}
                                                height={80}
                                                className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Brand name */}
                                        <span className="text-sm font-semibold text-center text-gray-700 group-hover:text-[#ff7200] transition-colors duration-300">
                                            {brand.title}
                                        </span>
                                    </a>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
            </div>
        </div>
    )
}

export default BrandsShowing