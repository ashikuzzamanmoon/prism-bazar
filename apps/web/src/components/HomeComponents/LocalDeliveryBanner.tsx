import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Download, Clock, ArrowRight } from "lucide-react";

export default function LocalDeliveryBanner() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 md:my-6">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 md:p-10 shadow-lg border border-emerald-700/30">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Truck className="w-3.5 h-3.5" /> লোকাল এক্সপ্রেস ডেলিভারি
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              সিরাজগঞ্জ ও কাজিপুরে দ্রুততম হোম ডেলিভারি
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              সেরা মানের খাঁটি অর্গানিক খাদ্যপণ্য এবং শিক্ষার্থীদের বিভিন্ন শ্রেণির প্রিন্ট শিট ও বই পৌঁছে দিচ্ছি আপনার দোরগোড়ায়। ডিজিটাল শিট ডাউনলোড করুন নিমেষেই।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm sm:text-base shadow-md hover:bg-emerald-50 transition-all duration-200 hover:scale-[1.02]"
            >
              <span>পণ্যসমূহ দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-950/80 text-white font-medium text-sm sm:text-base border border-emerald-500/30 backdrop-blur-sm transition-all duration-200"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>

        {/* Feature Badges Row */}
        <div className="mt-8 pt-6 border-t border-emerald-500/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <p className="font-semibold text-white">১০০% খাঁটি ও বিশুদ্ধ</p>
              <p className="text-emerald-200/80 text-[11px]">গুণমানে আপোষহীন</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <Download className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <p className="font-semibold text-white">ইনস্ট্যান্ট PDF শিট</p>
              <p className="text-emerald-200/80 text-[11px]">তাত্ক্ষণিক ডাউনলোড</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <Clock className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <p className="font-semibold text-white">সিরাজগঞ্জ-কাজিপুর</p>
              <p className="text-emerald-200/80 text-[11px]">দ্রুত হোম ডেলিভারি</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <Truck className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <p className="font-semibold text-white">ক্যাশ অন ডেলিভারি</p>
              <p className="text-emerald-200/80 text-[11px]">হাতে পেয়ে মূল্য পরিশোধ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
