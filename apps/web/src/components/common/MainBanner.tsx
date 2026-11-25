"use client";

import { useMemo } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import NextImage from "next/image";

interface IBanner {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  isPublish: boolean;
  isSide: boolean;
  link?: string;
}

const defaultMainBanners: IBanner[] = [
  {
    id: "default-banner-1",
    title: "খাঁটি অর্গানিক খাদ্য সামগ্রী",
    slug: "organic-food",
    description: "সুন্দরবনের প্রাকৃতিক খাঁটি মধু, ঘানিভাঙা সরিষার তেল ও খাঁটি গাওয়া ঘি। সিরাজগঞ্জ ও কাজীপুর এলাকায় দ্রুত হোম ডেলিভারি।",
    image: "/hero-banner-organic.jpg",
    isPublish: true,
    isSide: false,
    link: "/products",
  },
  {
    id: "default-banner-2",
    title: "শিক্ষার্থীদের সহায়িকা ও ডিজিটাল শিট",
    slug: "education-materials",
    description: "এসএসসি, এইচএসসি ও বিভিন্ন শ্রেণির পূর্ণাঙ্গ স্টাডি গাইড, মডেল টেস্ট ও ডাউনলোডযোগ্য স্পেশাল পিডিএফ শিট।",
    image: "/hero-banner-education.jpg",
    isPublish: true,
    isSide: false,
    link: "/products",
  },
];

const defaultSideBanners: IBanner[] = [
  {
    id: "default-side-1",
    title: "খাঁটি মধু ও সরিষার তেল",
    slug: "honey-oil",
    description: "১০০% প্রাকৃতিক ও ফ্রেশ",
    image: "/side-banner-1.jpg",
    isPublish: true,
    isSide: true,
    link: "/products",
  },
  {
    id: "default-side-2",
    title: "ডিজিটাল শিট ডাউনলোড",
    slug: "digital-sheets",
    description: "ইনস্ট্যান্ট পিডিএফ অ্যাক্সেস",
    image: "/side-banner-2.jpg",
    isPublish: true,
    isSide: true,
    link: "/products",
  },
];

const Banner = ({ bannerData = [] }: { bannerData?: IBanner[] }) => {
  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 4000, stopOnInteraction: true }),
    [],
  );

  const rawPublishBanner = bannerData?.filter(
    (banner) => banner?.isPublish === true && banner?.isSide !== true,
  ) || [];

  const publishBanner = rawPublishBanner.length > 0 ? rawPublishBanner : defaultMainBanners;

  const rawSideBanner = bannerData?.filter((banner) => banner?.isSide === true) || [];
  const sideBanner = rawSideBanner.length > 0 ? rawSideBanner : defaultSideBanners;
  return (
    <div className="">
      <div className="w-full overflow-hidden max-w-7xl mx-auto px-2 md:px-0">
        <div className="grid grid-cols-12 gap-3 md:gap-4">
          <div className="col-span-12 md:col-span-9 h-full">
            <Carousel
              plugins={[autoplayPlugin]}
              className="w-full h-full"
              onMouseEnter={() => autoplayPlugin.stop()}
              onMouseLeave={() => autoplayPlugin.reset()}
            >
              <CarouselContent className="h-full">
                {publishBanner?.map((item) => (
                  <CarouselItem key={item.id} className="h-full pl-4">
                    <Link
                      href={item.link || "#"}
                      className="block h-full w-full"
                    >
                      <div className="relative w-full h-full overflow-hidden aspect-[16/9] rounded-xl md:rounded-2xl">
                        <NextImage
                          src={item.image}
                          alt={item.title}
                          fill
                          priority
                          className="rounded-xl object-cover md:rounded-2xl"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative h-full flex flex-col items-center justify-center text-center text-[#ff7200] p-6 z-10">
                          <div className="max-w-2xl space-y-2.5 md:space-y-4 px-4">
                            {/* Content here */}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 hidden md:flex text-white border-white bg-black/30 hover:bg-[#16a34a] hover:border-[#16a34a] hover:text-white" />
              <CarouselNext className="right-4 hidden md:flex text-white border-white bg-black/30 hover:bg-[#16a34a] hover:border-[#16a34a] hover:text-white" />
            </Carousel>
          </div>

          {/* Side Banners */}
          <div className="col-span-12 md:col-span-3 grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-4 h-full">
            {sideBanner[0] && (
              <Link
                href={sideBanner[0].link || "#"}
                className="relative w-full aspect-[4/3] md:aspect-auto md:h-full md:min-h-50 rounded-xl overflow-hidden block"
              >
                <NextImage
                  src={sideBanner[0].image}
                  alt="Side Banner 1"
                  fill
                  className="rounded-xl object-cover"
                />
              </Link>
            )}

            {sideBanner[1] && (
              <Link
                href={sideBanner[1].link || "#"}
                className="relative w-full aspect-[4/3] md:aspect-auto md:h-full md:min-h-50 rounded-xl overflow-hidden block"
              >
                <NextImage
                  src={sideBanner[1].image}
                  alt="Side Banner 2"
                  fill
                  className="rounded-xl object-cover"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
