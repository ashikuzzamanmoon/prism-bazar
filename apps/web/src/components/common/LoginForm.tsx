"use client";

import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { userRegister } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

type InputField = {
    phone: string;
};

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<InputField>();
    const router = useRouter();
    const searchParams = useSearchParams();
    let redirect = searchParams.get("redirect") || "";

    // Extract final redirect destination if it's in the format /otp?redirect=/checkout
    if (redirect.includes("redirect=")) {
        const match = redirect.match(/redirect=([^&]*)/);
        if (match) {
            redirect = decodeURIComponent(match[1]);
        }
    }

    const handleLoginForm: SubmitHandler<InputField> = async (data) => {
        const phoneNumber = data.phone.trim();

        try {
            const toastId = toast.loading("Processing...");
            const response = await userRegister(phoneNumber);
            // console.log("login repsonse", response)
            if (response?.statusCode === 201) {
                toast.success(response?.data?.message || "OTP sent successfully!", {
                    id: toastId,
                });
                const phoneNumber = response?.data?.phoneNumber;
                // Pass only the final redirect destination to OTP page
                const redirectParam = redirect ? `&redirect=${encodeURIComponent(redirect)}` : "";
                router.push(`/otp?phone=${phoneNumber}${redirectParam}`);
            } else {
                toast.error("Something went wrong!", { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to login");
        }
    };

    return (
        <div className="max-w-4xl mx-auto min-h-screen flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit(handleLoginForm)}
                className="w-full max-w-md bg-white rounded-2xl py-8 px-6 md:px-10 border border-gray-100"
            >
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link
                        href="/"
                        className="flex items-center justify-center cursor-pointer mb-5"
                    >
                        <Image
                            src="/white bg letter logo.png"
                            alt="Prism Bazar"
                            width={200}
                            height={60}
                            className="w-36 sm:w-48 md:w-56 lg:w-60 h-auto object-contain"
                            priority
                        />
                    </Link>

                    <p className="text-slate-800 font-medium text-lg mt-2">
                        লগইন করতে আপনার মোবাইল নাম্বার দিন
                    </p>
                </div>

                {/* Phone Number Field */}
                <div className="mb-8">
                    <label className="text-slate-900 text-[15px] font-medium mb-2 block">
                        মোবাইল নাম্বার
                    </label>

                    <input
                        {...register("phone", {
                            required: "মোবাইল নাম্বার দিতে হবে",
                            validate: {
                                isPhone: (value) =>
                                    /^01\d{9}$/.test(value.trim()) ||
                                    "সঠিক ১১ ডিজিটের নাম্বার দিন (০১ দিয়ে শুরু)",
                            },
                        })}
                        className="w-full bg-slate-50 border border-gray-200 px-4 py-3.5 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary2 focus:border-transparent 
            transition-all duration-200 hover:bg-slate-100"
                        type="tel"
                        maxLength={11}
                        placeholder="০১XXXXXXXXX"
                    />

                    {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                    )}
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    className="w-full bg-linear-to-r from-blue-50 to-white 
          text-primary3 font-semibold py-3 rounded-xl border border-gray-300
          hover:border-primary3 transition-colors duration-300 
          flex items-center justify-center gap-2 cursor-pointer"
                >
                    লগইন করুন
                    <svg
                        className="w-4 h-4 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Login;
