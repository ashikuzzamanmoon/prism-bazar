"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Droplets,
  Nut,
  BookOpen,
  FileText,
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";

export interface ICategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  itemCount?: string;
}

interface CategoryGridProps {
  categories?: ICategoryItem[];
}

const defaultCategories = [
  {
    id: "cat-1",
    name: "খাঁটি মধু ও ঘি",
    slug: "pure-honey-and-ghee",
    subtitle: "সুন্দরবনের চাকের মধু ও গাওয়া ঘি",
    badge: "১০০% প্রাকৃতিক",
    icon: Sparkles,
    gradient: "from-amber-500/10 to-amber-600/5",
    borderHover: "hover:border-amber-400 group-hover:text-amber-600",
    badgeBg: "bg-amber-100 text-amber-800",
    iconBg: "bg-amber-500/15 text-amber-600",
  },
  {
    id: "cat-2",
    name: "ঘানিভাঙা তেল ও ভেষজ",
    slug: "pure-oil-and-herbs",
    subtitle: "খাঁটি সরিষার তেল ও কালোজিরা",
    badge: "স্বাস্থ্যসম্মত",
    icon: Droplets,
    gradient: "from-emerald-500/10 to-emerald-600/5",
    borderHover: "hover:border-emerald-400 group-hover:text-emerald-600",
    badgeBg: "bg-emerald-100 text-emerald-800",
    iconBg: "bg-emerald-500/15 text-emerald-600",
  },
  {
    id: "cat-3",
    name: "অর্গানিক ড্রাই ফ্রুটস ও বাদাম",
    slug: "organic-dry-fruits",
    subtitle: "কাঠবাদাম, কাজু ও পুষ্টিকর আখরোট",
    badge: "প্রিমিয়াম কোয়ালিটি",
    icon: Nut,
    gradient: "from-orange-500/10 to-orange-600/5",
    borderHover: "hover:border-orange-400 group-hover:text-orange-600",
    badgeBg: "bg-orange-100 text-orange-800",
    iconBg: "bg-orange-500/15 text-orange-600",
  },
  {
    id: "cat-4",
    name: "শিক্ষা সহায়ক বই ও গাইড",
    slug: "education-books-guides",
    subtitle: "পরীক্ষার প্রস্তুতি ও মডেল টেস্ট বুক",
    badge: "একাডেমিক",
    icon: BookOpen,
    gradient: "from-blue-500/10 to-blue-600/5",
    borderHover: "hover:border-blue-400 group-hover:text-blue-600",
    badgeBg: "bg-blue-100 text-blue-800",
    iconBg: "bg-blue-500/15 text-blue-600",
  },
  {
    id: "cat-5",
    name: "ডিজিটাল শিট ও হ্যান্ডনোট (পিডিএফ)",
    slug: "digital-sheets-pdf",
    subtitle: "তাত্ক্ষণিক ডাউনলোড ও সাজানো লেকচার",
    badge: "ইনস্ট্যান্ট এক্সেস",
    icon: FileText,
    gradient: "from-purple-500/10 to-purple-600/5",
    borderHover: "hover:border-purple-400 group-hover:text-purple-600",
    badgeBg: "bg-purple-100 text-purple-800",
    iconBg: "bg-purple-500/15 text-purple-600",
  },
];

export default function CategoryGrid({ categories }: CategoryGridProps) {
  // If dynamic categories are passed, map them with our visual styles
  const displayCategories = defaultCategories.map((item) => {
    const matched = categories?.find(
      (c) => c.slug === item.slug || c.name.includes(item.name.slice(0, 4)),
    );
    if (matched) {
      return {
        ...item,
        name: matched.name,
        slug: matched.slug,
      };
    }
    return item;
  });

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-emerald-700 font-semibold text-xs sm:text-sm uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ক্যাটাগরি ব্রাউজ করুন
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            জনপ্রিয় ক্যাটাগরি ও কালেকশন
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            আপনার পছন্দের খাঁটি খাদ্যপণ্য ও প্রয়োজনীয় শিক্ষা উপকরণ বেছে নিন
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 group"
        >
          <span>সবগুলো ক্যাটাগরি দেখুন</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* 5-Column Responsive Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {displayCategories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`group relative flex flex-col justify-between p-5 rounded-2xl border border-gray-200/80 bg-white hover:bg-gradient-to-br ${cat.gradient} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cat.borderHover} overflow-hidden`}
            >
              <div>
                {/* Icon & Badge Row */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.iconBg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md ${cat.badgeBg}`}
                  >
                    {cat.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-1 group-hover:text-emerald-800 transition-colors">
                  {cat.name}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {cat.subtitle}
                </p>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-emerald-700">
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> পণ্য দেখুন
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
