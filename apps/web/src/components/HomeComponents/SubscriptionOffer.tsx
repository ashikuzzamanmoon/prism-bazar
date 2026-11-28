"use client";

import type React from "react";
import { useState } from "react";
import { Send, Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function SubscriptionOffer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl border border-emerald-700/30">
        {/* Ambient decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 gap-8">
          {/* Left Text & Form */}
          <div className="w-full lg:w-3/5 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>এক্সক্লুসিভ অফার ও আপডেট</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              নতুন অফার ও বিশেষ ছাড়ের তথ্য পেতে{" "}
              <span className="text-amber-300">যুক্ত থাকুন</span>
            </h2>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
              সুন্দরবনের খাঁটি মধু, তেল, ঘি এর সিজনাল অফার এবং শিক্ষার্থীদের নতুন মডেল টেস্ট ও পিডিএফ শিট প্রকাশের সাথে সাথেই আপডেট পেতে সাবস্ক্রাইব করুন।
            </p>

            {/* Email form */}
            {subscribed ? (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="text-sm font-semibold">
                  ধন্যবাদ! আপনি সফলভাবে প্রিজম বাজারের আপডেটের জন্য সাবস্ক্রাইব করেছেন।
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex items-center bg-white rounded-2xl p-1.5 sm:p-2 shadow-lg max-w-lg"
              >
                <input
                  type="email"
                  placeholder="আপনার ইমেইল অ্যাড্রেস লিখুন"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-grow bg-transparent px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center gap-2 shrink-0"
                >
                  <span>সাবস্ক্রাইব</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}

            <p className="text-[11px] sm:text-xs text-emerald-300/70">
              * কোনো ধরনের স্প্যাম পাঠানো হয় না। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।
            </p>
          </div>

          {/* Right Visual Image */}
          <div className="w-full lg:w-2/5 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-[16/10] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <Image
                src="/hero-banner-organic.jpg"
                alt="খাঁটি অর্গানিক খাদ্য সম্ভার - প্রিজম বাজার"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 450px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <p className="text-xs font-semibold uppercase text-amber-300 tracking-wider">
                    প্রিজম বাজার
                  </p>
                  <p className="text-sm font-bold">
                    বিশুদ্ধ খাদ্য ও নির্ভরযোগ্য শিক্ষা সামগ্রী
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
