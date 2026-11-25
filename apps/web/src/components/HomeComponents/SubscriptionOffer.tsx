"use client";

import type React from "react";
import { useState } from "react";
import { Send } from "lucide-react";
import Image from "next/image";

export default function SubscriptionOffer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    setEmail("");
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-[#1a1a2e] rounded-3xl overflow-hidden min-h-[320px] md:min-h-[380px]">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center h-full">
            {/* Left Content */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16">
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-2">
                Stay Updated,
              </h2>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold italic leading-tight mb-5">
                <span className="text-primary">Stay Healthy & Smart</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                খাঁটি অর্গানিক খাদ্যের নতুন অফার, সিজনাল ডিসকাউন্ট এবং শিক্ষার্থীদের গুরুত্বপূর্ণ স্টাডি মেটেরিয়ালসের আপডেট সরাসরি পেতে সাবস্ক্রাইব করুন।
              </p>

              {/* Email form - pill style like reference */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center bg-white rounded-full w-full max-w-md overflow-hidden shadow-lg shadow-black/20 p-1 sm:p-1.5 mx-auto md:mx-0"
              >
                <input
                  type="email"
                  placeholder="আপনার ইমেইল দিন"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-grow bg-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-1.5 sm:gap-2 shrink-0"
                >
                  <span className="hidden xs:inline">Subscribe</span>
                  <span className="xs:hidden">Subscribe</span>
                  <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </form>
            </div>

            {/* Right Image */}
            <div className="hidden md:flex w-1/2 h-full items-end justify-center relative self-stretch min-h-[380px]">
              {/* Glow behind the image */}
              <div className="absolute bottom-8 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image
                  src="/hero-banner-organic.jpg"
                  alt="খাঁটি অর্গানিক খাদ্য ও শিক্ষা সামগ্রী - প্রিজম বাজার"
                  width={500}
                  height={320}
                  className="object-cover h-64 w-full drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-700 rounded-2xl border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
