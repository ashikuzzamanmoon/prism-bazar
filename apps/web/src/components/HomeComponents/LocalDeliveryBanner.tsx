import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, BookOpen, Clock } from "lucide-react";

export default function LocalDeliveryBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 my-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 text-white p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Truck className="w-3.5 h-3.5" /> লোকাল এক্সপ্রেস ডেলিভারি
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              সিরাজগঞ্জ টু কাজিপুর দ্রুত হোম ডেলিভারি
            </h2>
            <p className="text-green-100 text-sm md:text-base max-w-xl">
              সেরা মানের খাঁটি অর্গানিক খাদ্যপণ্য এবং শিক্ষার্থীদের বিভিন্ন শ্রেণির প্রিন্ট শিট ও বই পৌঁছে দিচ্ছি আপনার দোরগোড়ায়।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-lg bg-white text-green-800 font-bold text-sm shadow hover:bg-green-50 transition-colors"
            >
              পণ্যসমূহ দেখুন
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg bg-green-900/60 hover:bg-green-900/80 text-white font-medium text-sm border border-white/20 transition-colors"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>

        {/* Feature Badges Row */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-300 shrink-0" />
            <span>১০০% খাঁটি ও অর্গানিক</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-300 shrink-0" />
            <span>প্রিন্ট শিট ও ডিজিটাল PDF</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-300 shrink-0" />
            <span>সিরাজগঞ্জ-কাজিপুর সেম-ডে</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-300 shrink-0" />
            <span>ক্যাশ অন ডেলিভারি সুবিধা</span>
          </div>
        </div>
      </div>
    </div>
  );
}
