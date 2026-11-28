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
import { ArrowRight, Sparkles, ShoppingBag, BookOpen } from "lucide-react";

interface IBanner {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  isPublish: boolean;
  isSide?: boolean;
  link?: string;
  tagline?: string;
  badge?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  secondaryLink?: string;
}

const defaultMainBanners: IBanner[] = [
  {
    id: "default-banner-1",
    badge: "১০০% প্রাকৃতিক ও বিশুদ্ধ অর্গানিক খাদ্য",
    title: "স্বাস্থ্য ও স্বাদের মেলবন্ধন, খাঁটি খাদ্য সম্ভার",
    slug: "organic-food",
    description:
      "সুন্দরবনের প্রাকৃতিক চাকের মধু, খাঁটি গাওয়া ঘি ও ঘানিভাঙা সরিষার তেল। সিরাজগঞ্জ ও কাজীপুর এলাকায় সরাসরি হোম ডেলিভারি।",
    image: "/hero-banner-organic.jpg",
    isPublish: true,
    link: "/products?type=ORGANIC_FOOD",
    ctaText: "অর্গানিক ফুড এক্সপ্লোর করুন",
    secondaryCtaText: "খাঁটি মধু ও ঘি",
    secondaryLink: "/products?category=pure-honey-and-ghee",
  },
  {
    id: "default-banner-2",
    badge: "সেরা প্রস্তুতি ও তাৎক্ষণিক ডাউনলোড",
    title: "শিক্ষার্থীদের পূর্ণাঙ্গ সহায়িকা ও ডিজিটাল শিট",
    slug: "education-materials",
    description:
      "এসএসসি, এইচএসসি ও বিভিন্ন ক্লাসের স্পেশাল হ্যান্ডনোট, মডেল টেস্ট এবং নির্ভরযোগ্য শিক্ষা সামগ্রী—এক ক্লিকেই ঘরে বসেই সংগ্রহ করুন।",
    image: "/hero-banner-education.jpg",
    isPublish: true,
    link: "/products?type=DIGITAL_PRODUCT",
    ctaText: "ডিজিটাল শিট দেখুন",
    secondaryCtaText: "শিক্ষা সহায়ক বই",
    secondaryLink: "/products?category=education-books-guides",
  },
];

const Banner = ({ bannerData = [] }: { bannerData?: IBanner[] }) => {
  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: true }),
    [],
  );

  const rawPublishBanner =
    bannerData?.filter(
      (banner) => banner?.isPublish === true && banner?.isSide !== true,
    ) || [];

  const publishBanner =
    rawPublishBanner.length > 0 ? rawPublishBanner : defaultMainBanners;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
      <Carousel
        plugins={[autoplayPlugin]}
        className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-emerald-950/10 group"
        onMouseEnter={() => autoplayPlugin.stop()}
        onMouseLeave={() => autoplayPlugin.reset()}
      >
        <CarouselContent className="-ml-0">
          {publishBanner.map((item, index) => {
            const fallbackBadge =
              item.badge ||
              (index === 0
                ? "১০০% প্রাকৃতিক ও বিশুদ্ধ অর্গানিক খাদ্য"
                : "সেরা প্রস্তুতি ও তাৎক্ষণিক ডাউনলোড");
            const ctaText = item.ctaText || "পণ্যসমূহ দেখুন";
            const ctaLink = item.link || "/products";
            const secondaryCtaText =
              item.secondaryCtaText ||
              (index === 0 ? "মধু ও ঘি কালেকশন" : "শিক্ষা সহায়ক বই");
            const secondaryLink =
              item.secondaryLink ||
              (index === 0
                ? "/products?category=pure-honey-and-ghee"
                : "/products?category=education-books-guides");

            return (
              <CarouselItem key={item.id} className="pl-0">
                <div className="relative w-full min-h-[360px] sm:min-h-[420px] md:min-h-[460px] lg:h-[480px] overflow-hidden flex items-center">
                  {/* Background Image */}
                  <NextImage
                    src={item.image}
                    alt={item.title}
                    fill
                    priority={index === 0}
                    className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 1280px"
                  />

                  {/* Gradient Overlays for contrast & legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/75 to-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />

                  {/* Content Container */}
                  <div className="relative z-10 w-full max-w-3xl px-6 sm:px-10 md:px-14 py-8 text-white space-y-4 md:space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md text-emerald-200 text-xs sm:text-sm font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{fallbackBadge}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm">
                      {item.title}
                    </h1>

                    {/* Description */}
                    <p className="text-sm sm:text-base md:text-lg text-emerald-50/90 max-w-2xl leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {item.description}
                    </p>

                    {/* Dual Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href={ctaLink}
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-emerald-900/40 hover:shadow-emerald-600/30 transition-all duration-200"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{ctaText}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>

                      <Link
                        href={secondaryLink}
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base border border-white/20 backdrop-blur-sm transition-all duration-200"
                      >
                        <BookOpen className="w-4 h-4 text-emerald-300" />
                        <span>{secondaryCtaText}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Carousel Navigation Buttons */}
        <CarouselPrevious className="left-4 hidden md:flex text-white border-white/30 bg-emerald-950/40 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white backdrop-blur-sm transition-all" />
        <CarouselNext className="right-4 hidden md:flex text-white border-white/30 bg-emerald-950/40 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white backdrop-blur-sm transition-all" />
      </Carousel>
    </section>
  );
};

export default Banner;
