import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";
import Image from "next/image";

export default function Footer() {
    const sslImages = [
        { name: "amex", src: "/ssl/amex.svg" },
        { name: "bkash", src: "/ssl/bkash.svg" },
        { name: "dinersclub", src: "/ssl/dinersclub.svg" },
        { name: "dmoney", src: "/ssl/dmoney.svg" },
        { name: "ipay", src: "/ssl/ipay.svg" },
        { name: "mastercard", src: "/ssl/mastercard.svg" },
        { name: "nagad", src: "/ssl/nagad.svg" },
        { name: "nexus", src: "/ssl/nexus.svg" },
        { name: "qcash", src: "/ssl/qcash.svg" },
        { name: "rocket", src: "/ssl/rocket.svg" },
        { name: "surecash", src: "/ssl/surecash.svg" },
        { name: "tapnpay", src: "/ssl/tapnpay.svg" },
        { name: "unionpay", src: "/ssl/unionpay.svg" },
        { name: "visa", src: "/ssl/visa.svg" },
    ];

    return (
        <footer className="bg-[#fafafa] mt-auto font-sans relative">
            {/* Top brand accent border */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#ff7200] via-orange-400 to-[#ff7200]"></div>

            {/* Main Content Section */}
            <div className="container mx-auto max-w-7xl px-4 md:px-6 pt-16 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

                    {/* Brand Info (Spans 4 columns) */}
                    <div className="lg:col-span-4 flex flex-col">
                        <Link href="/" className="inline-block transition-opacity duration-300 hover:opacity-80 -ml-2 -mt-10 mb-2">
                            <Image
                                src="/prism-bazar-logo.svg"
                                alt="Prism Bazar Logo"
                                width={180}
                                height={50}
                                className="w-40 md:w-48 h-auto object-contain"
                            />
                        </Link>
                        <p className="text-gray-600/90 text-[15px] leading-relaxed pr-4">
                            সিরাজগঞ্জ ও কাজীপুরসহ সারাদেশে খাঁটি অর্গানিক খাদ্য এবং শিক্ষার্থীদের শিক্ষা সহায়ক ও ডিজিটাল শিট সরবরাহকারী নির্ভরযোগ্য অনলাইন প্ল্যাটফর্ম।
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center space-x-3 pt-3">
                            {[
                                { link: "#", icon: "https://cdn-icons-png.flaticon.com/128/5968/5968764.png", alt: "Facebook" },
                                { link: "https://www.tiktok.com/@prismbazar?_t=ZS-8zLJWLWYsE8&_r=1", icon: "https://cdn-icons-png.flaticon.com/128/15789/15789316.png", alt: "TikTok" },
                                { link: "https://youtube.com/@prismbazar?si=jZwr3_XNhefbN_wW", icon: "https://cdn-icons-png.flaticon.com/128/3670/3670147.png", alt: "YouTube" },
                                { link: "#", icon: "https://cdn-icons-png.flaticon.com/128/3955/3955024.png", alt: "Instagram" }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.link}
                                    target={social.link.startsWith("http") ? "_blank" : undefined}
                                    rel={social.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#ff7200]/30 group transition-all duration-300 relative overflow-hidden"
                                >
                                    {/* Hover background fill */}
                                    <span className="absolute inset-0 w-full h-full bg-[#ff7200] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></span>

                                    <Image
                                        src={social.icon}
                                        alt="Social media"
                                        width={18}
                                        height={18}
                                        className="relative z-10 opacity-80 group-hover:opacity-100 group-hover:brightness-[200] group-hover:invert-0 transition-all duration-300"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links (Spans 2 columns) */}
                    <div className="lg:col-span-2">
                        <h3 className="text-[16px] font-bold text-gray-900 uppercase tracking-wide mb-6 relative inline-block">
                            Quick Links
                            <span className="absolute -bottom-2 left-0 w-1/2 h-[3px] bg-[#ff7200] rounded-full"></span>
                        </h3>
                        <ul className="space-y-3.5 mt-2">
                            {[
                                { name: "Home", path: "/" },
                                { name: "Products", path: "/products" },
                                { name: "About Us", path: "/about" },
                                { name: "Contact", path: "/contact" },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.path}
                                        className="text-gray-600 hover:text-[#ff7200] text-[15px] font-medium flex items-center group transition-colors duration-200"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -translate-x-3 text-[#ff7200] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        <span className="-ml-5 group-hover:ml-0 transition-all duration-300">{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories (Spans 2 columns) */}
                    <div className="lg:col-span-2">
                        <h3 className="text-[16px] font-bold text-gray-900 uppercase tracking-wide mb-6 relative inline-block">
                            Categories
                            <span className="absolute -bottom-2 left-0 w-1/2 h-[3px] bg-[#ff7200] rounded-full"></span>
                        </h3>
                        <ul className="space-y-3.5 mt-2">
                            {[
                                { name: "অর্গানিক মধু ও ঘি", path: "/category/honey-ghee" },
                                { name: "ঘানিভাঙা খাঁটি তেল", path: "/category/mustard-oil" },
                                { name: "শিক্ষা সহায়িকা ও গাইড", path: "/category/study-guides" },
                                { name: "ডিজিটাল শিট ও নোট", path: "/category/digital-notes" },
                            ].map((cat) => (
                                <li key={cat.name}>
                                    <Link
                                        href={cat.path}
                                        className="text-gray-600 hover:text-[#ff7200] text-[15px] font-medium flex items-center group transition-colors duration-200"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -translate-x-3 text-[#ff7200] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        <span className="-ml-5 group-hover:ml-0 transition-all duration-300">{cat.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info (Spans 4 columns) */}
                    <div className="lg:col-span-4">
                        <h3 className="text-[16px] font-bold text-gray-900 uppercase tracking-wide mb-6 relative inline-block">
                            Get In Touch
                            <span className="absolute -bottom-2 left-0 w-1/3 h-[3px] bg-[#ff7200] rounded-full"></span>
                        </h3>

                        <div className="space-y-4 mt-2">
                            {/* Address */}
                            <div className="flex items-start group">
                                <div className="bg-white shadow-sm border border-gray-100 p-2.5 rounded-xl mr-4 group-hover:border-[#ff7200]/30 group-hover:shadow-md transition-all duration-300">
                                    <MapPin className="w-5 h-5 text-[#ff7200]" />
                                </div>
                                <span className="text-gray-600 text-[14px] leading-relaxed pt-1">
                                    <strong className="text-gray-800 block mb-0.5">কাজীপুর, সিরাজগঞ্জ</strong>
                                    সিরাজগঞ্জ, বাংলাদেশ
                                </span>
                            </div>

                            {/* Phone */}
                            <a href="tel:+8801712714334" className="flex items-center group">
                                <div className="bg-white shadow-sm border border-gray-100 p-2.5 rounded-xl mr-4 group-hover:bg-primary transition-colors duration-300">
                                    <Phone className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Hotline</span>
                                    <span className="text-gray-800 text-[15px] font-bold tracking-wide group-hover:text-primary transition-colors">
                                        +88 01712-714334
                                    </span>
                                </div>
                            </a>

                            {/* Email */}
                            <a href="mailto:prismbazar@gmail.com" className="flex items-center group">
                                <div className="bg-white shadow-sm border border-gray-100 p-2.5 rounded-xl mr-4 group-hover:bg-[#ff7200] transition-colors duration-300">
                                    <Mail className="w-5 h-5 text-[#ff7200] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Email Us</span>
                                    <span className="text-gray-800 text-[15px] font-bold group-hover:text-[#ff7200] transition-colors line-clamp-1">
                                        prismbazar@gmail.com
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mt-12 pt-10 border-t border-gray-200/80">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="bg-orange-50/80 p-3 rounded-full">
                            <Truck className="w-6 h-6 text-[#ff7200]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-[14px]">Fast Delivery</h4>
                            <p className="text-gray-500 text-[12px] leading-snug mt-1">সিরাজগঞ্জ ও কাজীপুর: ২৪-৪৮ ঘণ্টা<br />সারাদেশে: ২-৪ কার্যদিবস</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="bg-orange-50/80 p-3 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-[#ff7200]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-[14px]">Verified Store</h4>
                            <p className="text-gray-500 text-[12px] leading-snug mt-1">কাজীপুর, সিরাজগঞ্জ<br /><span className="font-medium text-gray-700">১০০% খাঁটি ও গুণগত মান নিশ্চিত</span></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="bg-orange-50/80 p-3 rounded-full">
                            <Clock className="w-6 h-6 text-[#ff7200]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-[14px]">24/7 Support</h4>
                            <p className="text-gray-500 text-[12px] leading-snug mt-1">Dedicated support anytime<br />via phone or email</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white border-y border-gray-200/80">
                <div className="container mx-auto max-w-7xl px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <h4 className="text-[13px] font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                100% Secure Payments
                            </h4>
                            <div className="w-32 hover:scale-105 transition-transform duration-300">
                                <Image
                                    src={"/ssl/ssllogo.png"}
                                    alt="SSL Secure"
                                    width={140}
                                    height={50}
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-end items-center gap-2.5 max-w-2xl">
                            {sslImages.map((image) => (
                                <div key={image.name} className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg hover:shadow-md hover:border-gray-200 transition-all duration-300">
                                    <Image
                                        src={image.src}
                                        alt={image.name}
                                        width={42}
                                        height={28}
                                        className="h-6 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Credit Section */}
            <div className="bg-gray-900 text-gray-300 py-6">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[14px] text-gray-400">
                            © {new Date().getFullYear()} <span className="text-white font-bold tracking-wide">One<span className="text-[#ff7200]">Tech</span></span>. All rights reserved.
                        </p>

                        {/* Legal Links */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium">
                            <Link href="/privacy-policy" className="hover:text-[#ff7200] hover:-translate-y-0.5 transition-all duration-200">
                                Privacy Policy
                            </Link>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-700 hidden sm:block"></span>
                            <Link href="/terms-and-condition" className="hover:text-[#ff7200] hover:-translate-y-0.5 transition-all duration-200">
                                Terms & Condition
                            </Link>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-700 hidden sm:block"></span>
                            <Link href="/return-and-refund-policy" className="hover:text-[#ff7200] hover:-translate-y-0.5 transition-all duration-200">
                                Return & Refund Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
