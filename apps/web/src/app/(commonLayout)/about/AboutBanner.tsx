"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, HeartHandshake, ShieldCheck, Truck, BookOpen, Sparkles } from "lucide-react";

const AboutBanner = () => {
  return (
    <div className="w-full bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative w-full min-h-[420px] md:min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-banner-organic.jpg"
            alt="Prism Bazar Organic Foods"
            fill
            className="object-cover opacity-35 scale-105"
            priority
          />
        </div>

        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8 max-w-5xl mx-auto py-20">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/30 text-[#22c55e] font-semibold text-xs md:text-sm tracking-wide uppercase">
              <Sparkles className="w-4 h-4" />
              প্রিজম বাজার পরিচিতি
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              খাঁটি খাদ্য ও মানসম্মত <span className="text-[#22c55e]">শিক্ষা সামগ্রী</span>
            </h1>
            <p className="text-base md:text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
              সিরাজগঞ্জ ও কাজীপুরসহ সারাদেশে শতভাগ খাঁটি অর্গানিক খাদ্যদ্রব্য এবং শিক্ষার্থীদের সিলেবাসভিত্তিক শিক্ষা সহায়ক ও ডিজিটাল শিট পৌঁছে দেওয়ার নির্ভরযোগ্য মাধ্যম।
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-7xl">
        {/* Intro Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div className="relative h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl group border border-gray-100">
            <Image
              src="/hero-banner-education.jpg"
              alt="Prism Bazar Education & Organic"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 z-20">
              <p className="text-white font-bold text-2xl">প্রিজম বাজার</p>
              <p className="text-gray-300 text-sm mt-1">কাজীপুর ও সিরাজগঞ্জ থেকে সারা বাংলাদেশ</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm tracking-wide uppercase">
              আমাদের লক্ষ্য ও উদ্দেশ্য
            </div>
            <h2 className="text-foreground leading-tight tracking-tight font-extrabold text-3xl md:text-4xl lg:text-5xl">
              খাঁটি পণ্যের নিশ্চয়তা ও <span className="text-primary">শিক্ষার পাশে</span> প্রিজম বাজার
            </h2>
            <div className="space-y-6 text-muted-foreground md:text-lg leading-relaxed">
              <p>
                আমরা বিশ্বাস করি সুস্থ জীবনযাপনে খাঁটি ও ভেজালমুক্ত খাদ্যের কোনো বিকল্প নেই। সুন্দরবনের ও সরিষা ফুলের প্রাকৃতিক মধু, ঘানিভাঙা সরিষার তেল এবং দেশি গাওয়া ঘি সরাসরি কৃষক ও নিজস্ব তত্ত্বাবধানে সংগ্রহ করে গ্রাহকের কাছে পৌঁছে দেওয়া আমাদের প্রধান অঙ্গীকার।
              </p>
              <p>
                একই সাথে সিরাজগঞ্জ ও কাজিপুর অঞ্চলের শিক্ষার্থীসহ দেশের যেকোনো প্রান্তের শিক্ষার্থীদের জন্য মানসম্মত স্টাডি গাইড, মডেল টেস্ট এবং ডিজিটাল শিট সহজলভ্য করতে প্রিজম বাজার কাজ করে যাচ্ছে।
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us & Mission/Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Why Choose Us */}
          <div className="col-span-1 lg:col-span-5 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-xl text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="font-extrabold text-3xl mb-8 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary rounded-full block"></span>
                কেন প্রিজম বাজার বেছে নেবেন?
              </h2>
              <ul className="space-y-5">
                {[
                  "সিরাজগঞ্জ ও কাজীপুরে লোকাল হোম ডেলিভারি মাত্র ৪০-৫০৳",
                  "শতভাগ খাঁটি ও পরীক্ষিত প্রাকৃতিক অর্গানিক খাদ্য",
                  "অভিজ্ঞ শিক্ষকদের তৈরি ডিজিটাল নোট ও পরীক্ষার শিট",
                  "দ্রুততম ডেলিভারি ও সুরক্ষিত প্যাকেজিং",
                  "সহজ রিটার্ন পলিসি ও সার্বক্ষণিক কাস্টমার কেয়ার",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-200 text-base md:text-lg leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="col-span-1 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-bold text-card-foreground text-2xl mb-4">
                আমাদের মিশন
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                ঘরে ঘরে ভেজালমুক্ত ও পুষ্টিকর খাবার সরবরাহ করা এবং দেশের প্রতিটি শিক্ষার্থীর পড়ালেখার পথকে সহজ ও ফলপ্রসূ করতে সহায়ক উপাদান নিশ্চিত করা।
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <HeartHandshake className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-bold text-card-foreground text-2xl mb-4">
                আমাদের ভিশন
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                সততা ও গুণমানের নিশ্চয়তায় উত্তরবঙ্গের তথা সমগ্র বাংলাদেশের গ্রাহকদের আস্থা অর্জন করে একটি আদর্শ ও বিশ্বস্ত ই-কমার্স প্ল্যাটফর্মে পরিণত হওয়া।
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Categories */}
        <div className="py-12 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">আমাদের প্রধান ক্যাটাগরি</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">প্রয়োজনীয় অর্গানিক খাবার ও শিক্ষা উপকরণ সংগ্রহ করুন এক জায়গা থেকেই।</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Organic Food */}
            <div className="bg-card border border-border/80 hover:border-primary/40 transition-all duration-300 p-8 rounded-3xl text-center shadow-sm hover:shadow-md">
              <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6 text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">খাঁটি অর্গানিক খাদ্য</h3>
              <p className="text-muted-foreground leading-relaxed">
                সুন্দরবনের খাঁটি মধু, গাওয়া ঘি, কাঠের ঘানিভাঙা খাঁটি সরিষার তেল এবং স্বাস্থ্যকর ড্রাই ফ্রুটস।
              </p>
            </div>

            {/* Books & Guides */}
            <div className="bg-card border border-border/80 hover:border-primary/40 transition-all duration-300 p-8 rounded-3xl text-center shadow-sm hover:shadow-md">
              <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6 text-primary">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">শিক্ষা সহায়িকা ও বই</h3>
              <p className="text-muted-foreground leading-relaxed">
                প্রাথমিক, মাধ্যমিক ও উচ্চ মাধ্যমিক শ্রেণির সিলেবাসভিত্তিক মডেল টেস্ট এবং সহায়ক প্রস্তুতিমূলক বই।
              </p>
            </div>

            {/* Fast Delivery */}
            <div className="bg-card border border-border/80 hover:border-primary/40 transition-all duration-300 p-8 rounded-3xl text-center shadow-sm hover:shadow-md">
              <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6 text-primary">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">লোকাল হোম ডেলিভারি</h3>
              <p className="text-muted-foreground leading-relaxed">
                কাজীপুর ও সিরাজগঞ্জে দ্রুততম সময়ে হোম ডেলিভারি এবং সারাদেশের জন্য নির্ভরযোগ্য কুরিয়ার সার্ভিস।
              </p>
            </div>
          </div>
        </div>

        {/* Management Team Section */}
        <div className="py-16 mt-12 mb-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-border">
          <div className="text-center mb-12 px-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm tracking-wide uppercase mb-4">
              নেতৃত্ব
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">ম্যানেজমেন্ট টিম</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              প্রিজম বাজারকে মানুষের বিশ্বস্ত প্ল্যাটফর্ম হিসেবে গড়ে তুলতে কাজ করে যাচ্ছেন আমাদের নিবেদিতপ্রাণ দল।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 md:px-12">
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                <Image
                  src="/about/rafi.webp"
                  alt="MD Rafiul Islam"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full object-top"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">MD Rafiul Islam</h3>
              <p className="text-primary font-medium">Co-Owner</p>
            </div>

            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                <Image
                  src="/about/habib.webp"
                  alt="Habibur Rahman"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Habibur Rahman</h3>
              <p className="text-primary font-medium">Co-Owner</p>
            </div>

            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10 group-hover:border-primary/30 transition-colors bg-primary/5 flex items-center justify-center">
                <Image
                  src="/prism-bazar-icon.svg"
                  alt="MD Tushar Ahmed"
                  width={72}
                  height={72}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">MD Tushar Ahmed</h3>
              <p className="text-primary font-medium">Co-Owner</p>
            </div>

            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10 group-hover:border-primary/30 transition-colors bg-primary/5 flex items-center justify-center">
                <Image
                  src="/prism-bazar-icon.svg"
                  alt="Abu Saleh Mohammad Nayem"
                  width={72}
                  height={72}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Abu Saleh Mohammad Nayem</h3>
              <p className="text-primary font-medium">Co-Owner</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutBanner;
