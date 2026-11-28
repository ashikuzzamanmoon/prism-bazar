import React from "react";
import type { Metadata } from "next";
import { Shield, Sparkles, BookOpen, Download, Truck, PhoneCall, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "পণ্যের মান ও বিশুদ্ধতার নিশ্চয়তা নীতি | প্রিজম বাজার",
  description: "প্রিজম বাজারের অর্গানিক খাদ্যপণ্য, শিক্ষা উপকরণ ও ডিজিটাল ফাইল সংক্রান্ত মান নিয়ন্ত্রণ ও গ্যারান্টি নীতিমালা।",
};

const WarrantyPolicyPage = () => {
  const sections = [
    {
      id: "organic-food-guarantee",
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "১. ১০০% বিশুদ্ধ ও অর্গানিক খাদ্যের নিশ্চয়তা",
      content: (
        <ul className="space-y-3 mb-6">
          {[
            "প্রিজম বাজারের প্রতিটি অর্গানিক খাদ্যপণ্য (যেমন: খাঁটি সরিষার তেল, ঘি, মধু, চাল, ডাল) নিজস্ব তদারকিতে প্রস্তুত ও সংগৃহীত।",
            "আমরা কোনো প্রকার ক্ষতিকর রাসায়নিক, কৃত্রিম রঙ বা প্রিজারভেটিভ ব্যবহার করি না।",
            "প্যাকেজিং ছেঁড়া, ফুটো বা গুণগত মানে কোনো অসঙ্গতি পরিলক্ষিত হলে ডেলিভারি ম্যানের সামনেই বিনা মূল্যে পরিবর্তন অথবা সম্পূর্ণ রিফান্ডের নিশ্চয়তা রয়েছে।",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-muted-foreground">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "education-materials-policy",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      title: "২. শিক্ষা উপকরণ ও বই সংক্রান্ত নিশ্চয়তা",
      content: (
        <ul className="space-y-3 mb-6">
          {[
            "সকল বই, গাইড, শিট ও লেকচার নোট শতভাগ মূল প্রকাশনী ও অভিজ্ঞ শিক্ষকবৃন্দের প্রস্তুতকৃত।",
            "প্রিন্টেড হার্ডকপিতে কোনো পাতা মিসিং, অস্পষ্ট ছাপা বা বাঁধাই ত্রুটি থাকলে ৭ দিনের মধ্যে ফ্রিতে নতুন কপি সরবরাহ করা হবে।",
            "শিক্ষার্থীদের পরীক্ষার প্রস্তুতি নির্বিঘ্ন রাখতে দ্রুততম সময়ে বই ও শিট পৌঁছে দেওয়ার নিশ্চয়তা প্রদান করা হয়।",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-muted-foreground">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "digital-downloads-support",
      icon: <Download className="w-6 h-6 text-primary" />,
      title: "৩. ডিজিটাল ডাউনলোড (PDF) নীতিমালা",
      content: (
        <ul className="space-y-3 mb-6">
          {[
            "ডিজিটাল নোট, শিট ও ই-বুক পেমেন্ট নিশ্চিতকরণের সাথে সাথে ড্যাশবোর্ড থেকে তাৎক্ষণিক ডাউনলোড করা যায়।",
            "ফাইল ডাউনলোডে কোনো কারিগরি ত্রুটি দেখা দিলে আমাদের সাপোর্ট টিমের মাধ্যমে তাৎক্ষণিক ইমেইল অথবা হোয়াটসঅ্যাপে ফাইল পাঠানো হবে।",
            "একবার ক্রয়কৃত ডিজিটাল ফাইল আজীবন আপনার প্রিজম বাজার অ্যাকাউন্টে সংরক্ষিত থাকবে।",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-muted-foreground">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "regional-delivery-assurance",
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "৪. সিরাজগঞ্জ টু কাজিপুর এক্সপ্রেস ডেলিভারি",
      content: (
        <ul className="space-y-3 mb-6">
          {[
            "সিরাজগঞ্জ সদর ও কাজিপুর উপজেলার আওতাধীন এলাকায় আমাদের নিজস্ব রাইডারের মাধ্যমে ১২ থেকে ২৪ ঘণ্টার মধ্যে হোম ডেলিভারি প্রদান করা হয়।",
            "দেশের অন্যান্য সকল জেলা ও উপজেলায় বিশ্বস্ত কুরিয়ার সার্ভিসের মাধ্যমে ২ থেকে ৪ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।",
            "ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে মূল্য পরিশোধের পূর্ণ নিশ্চয়তা রয়েছে।",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-muted-foreground">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "customer-support",
      icon: <PhoneCall className="w-6 h-6 text-primary" />,
      title: "৫. অভিযোগ ও হেল্পলাইন সাপোর্ট",
      content: (
        <ul className="space-y-3 mb-6">
          {[
            "যেকোনো অনুসন্ধান বা অভিযোগের জন্য আমাদের হেল্পলাইন নম্বর: 01712714334 (সকাল ৯টা - রাত ১০টা)।",
            "হোয়াটসঅ্যাপে সরাসরি মেসেজ পাঠিয়েও পণ্যের বিস্তারিত জানা এবং অর্ডার ট্র্যাক করা যাবে।",
            "গ্রাহক সন্তুষ্টিই প্রিজম বাজারের মূল লক্ষ্য — যেকোনো ন্যায্য দাবিতে আমরা পাশে আছি।",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-muted-foreground">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <Shield className="w-4 h-4" /> শতভাগ মান ও খাঁটি পণ্যের অঙ্গীকার
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          পণ্যের মান ও বিশুদ্ধতার নিশ্চয়তা নীতি
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          প্রিজম বাজারে আমরা অর্গানিক খাদ্যপণ্য এবং শিক্ষার্থীদের প্রয়োজনীয় শিক্ষা সামগ্রীর সর্বোচ্চ গুণগত মান বজায় রাখতে প্রতিশ্রুতিবদ্ধ।
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-xl border border-gray-200/80 p-5 md:p-6 shadow-xs hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-primary/10">
                {section.icon}
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                {section.title}
              </h2>
            </div>
            {section.content}
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
        <h3 className="text-base font-semibold text-emerald-900 mb-1 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> বিশ্বস্ততার সাথে কেনাকাটা করুন
        </h3>
        <p className="text-sm text-emerald-800">
          প্রিজম বাজারের যেকোনো পণ্য নিয়ে আপনার মতামত বা পরামর্শ জানাতে আমাদের ফেসবুক পেজ বা হেল্পলাইনে যোগাযোগ করতে পারেন।
        </p>
      </div>
    </div>
  );
};

export default WarrantyPolicyPage;
