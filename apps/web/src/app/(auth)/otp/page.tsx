"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resendOtp, userVerifyOtp } from "@/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";

const RESEND_COOLDOWN = 120;
const STORAGE_KEY = "otpResendTimer";

const OtpPage = () => {
    const searchParams = useSearchParams();
    const phone = searchParams.get("phone") || "";

    console.log("Pre user phone", phone);
    const otpLength = 4;
    const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [timer, setTimer] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const initializeTimer = () => {
            const savedTime = localStorage.getItem(STORAGE_KEY);

            if (!savedTime) {
                console.log("No saved timer, enabling resend");
                setResendDisabled(false);
                setTimer(0);
                setIsInitialized(true);
                return;
            }

            const expiryTimestamp = Number(savedTime);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const remaining = expiryTimestamp - currentTimestamp;


            if (remaining > 0) {
                setTimer(remaining);
                setResendDisabled(true);
            } else {
                console.log("Timer expired, enabling resend");
                localStorage.removeItem(STORAGE_KEY);
                setResendDisabled(false);
                setTimer(0);
            }

            setIsInitialized(true);
        };

        initializeTimer();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        if (timer <= 0) {
            console.log("Timer reached 0");
            setResendDisabled(false);
            localStorage.removeItem(STORAGE_KEY);
            return;
        }
        const interval = setInterval(() => {
            const savedTime = localStorage.getItem(STORAGE_KEY);

            if (!savedTime) {
                setTimer(0);
                setResendDisabled(false);
                clearInterval(interval);
                return;
            }

            const expiryTimestamp = Number(savedTime);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const remaining = expiryTimestamp - currentTimestamp;
            if (remaining <= 0) {
                setTimer(0);
                setResendDisabled(false);
                localStorage.removeItem(STORAGE_KEY);
                clearInterval(interval);
            } else {
                setTimer(remaining);
                setResendDisabled(true);
            }
        }, 1000);

        return () => {
            console.log("Cleaning up interval");
            clearInterval(interval);
        };
    }, [timer, isInitialized]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otpLength - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join("");
        if (otpString.length !== otpLength) {
            toast.error("সম্পূর্ণ OTP লিখুন");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                phoneNumber: phone,
                code: otpString,
            };

            const response = await userVerifyOtp(payload);
            if (response?.statusCode === 200) {
                toast.success("OTP যাচাই সফল হয়েছে!");
                localStorage.removeItem(STORAGE_KEY);
                setTimer(0);
                setResendDisabled(false);

                // Get the redirect parameter and decode it
                let redirect = searchParams.get("redirect") || "/";
                if (redirect) {
                    redirect = decodeURIComponent(redirect);
                }
                console.log("Redirecting to:", redirect);
                router.push(redirect);
            } else {
                toast.error(response?.message || "OTP সঠিক নয়");
            }
        } catch (err: any) {
            console.log("response error", err);
            toast.error(err?.message || "OTP যাচাই ব্যর্থ");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        const savedTime = localStorage.getItem(STORAGE_KEY);
        if (savedTime) {
            const expiryTimestamp = Number(savedTime);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const remaining = expiryTimestamp - currentTimestamp;

            if (remaining > 0) {
                console.log("Resend blocked - timer still active:", remaining);
                toast.error(`অনুগ্রহ করে ${remaining} সেকেন্ড অপেক্ষা করুন`);
                // Force update state
                setTimer(remaining);
                setResendDisabled(true);
                return;
            }
        }

        if (resending || resendDisabled) {
            console.log("Resend blocked - button state:", {
                resending,
                resendDisabled,
            });
            return;
        }

        try {
            setResending(true);
            setResendDisabled(true);

            const response = await resendOtp(phone);
            console.log("resend otp check response", response);

            if (response?.statusCode === 200) {
                const expiryTimestamp = Math.floor(Date.now() / 1000) + RESEND_COOLDOWN;
                console.log("OTP sent successfully, setting timer:", RESEND_COOLDOWN);
                // Save to localStorage first
                localStorage.setItem(STORAGE_KEY, expiryTimestamp.toString());
                // Then update state
                setTimer(RESEND_COOLDOWN);
                setResendDisabled(true);

                toast.success("OTP পুনরায় পাঠানো হয়েছে!");
            } else {
                toast.error(response?.message || "OTP পাঠাতে ব্যর্থ");
                setResendDisabled(false);
            }
        } catch (err: any) {
            console.log("Resend error:", err);
            toast.error(err?.message || "OTP পাঠাতে ব্যর্থ");
            setResendDisabled(false);
        } finally {
            setResending(false);
        }
    };

    const isVerifyDisabled = otp.join("").length !== otpLength || loading;

    // Format timer display
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="max-w-4xl mx-auto min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg py-8 px-6 md:px-10 border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary3 to-primary2">
                        OTP যাচাই
                    </h2>
                    <p className="text-slate-700 mt-2">OTP পাঠানো হয়েছে: {phone}</p>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, index) => (
                        <Input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            className="w-12 h-12 text-center text-lg font-semibold rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary2"
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <Button
                    onClick={handleVerify}
                    disabled={isVerifyDisabled}
                    className={`w-full bg-linear-to-r from-primary3 to-primary2 text-white font-semibold py-3 rounded-xl mb-3 hover:opacity-90 transition-opacity ${isVerifyDisabled ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                >
                    {loading ? "যাচাই করা হচ্ছে..." : "OTP যাচাই করুন"}
                </Button>

                {/* Resend OTP Button */}
                <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={resendDisabled || resending}
                    className={`w-full py-4 shadow-none rounded-xl hover:bg-orange-500 transition-colors ${resendDisabled || resending ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                >
                    {resending
                        ? "পুনরায় পাঠানো হচ্ছে..."
                        : resendDisabled && timer > 0
                            ? `পুনরায় পাঠান (${formatTime(timer)})`
                            : "OTP পুনরায় পাঠান"}
                </Button>
            </div>
        </div>
    );
};

export default OtpPage;
