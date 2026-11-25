"use server"
import { API_ENDPOINTS } from "@/apiService/config";
import { cookies } from "next/headers";


export const userRegister = async (phoneNumber: string) => {
    try {
        const trimmedPhone = phoneNumber.trim();
        const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber: trimmedPhone }),
        });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("User registration failed:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw new Error("User registration failed due to unknown error");
        }

    }
};

interface IOTP {
    phoneNumber: string;
    code: string;
}

export const userVerifyOtp = async (payload: IOTP) => {
    try {
        const response = await fetch(API_ENDPOINTS.AUTH.OtpVerify, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || `Server error: ${response.status}`);
        }

        const isVerified = data?.data?.user?.isVerified;
        const accessToken = data?.data?.token?.accessToken;

        if (isVerified && accessToken) {
            (await cookies()).set("pbToken", accessToken, {
                secure: true,
                sameSite: "none",
                maxAge: 60 * 24 * 60 * 30,
            });
        }

        return data;

    } catch (error: any) {
        console.log("error checking", error);
        throw error;
    }
};

export const resendOtp = async (phoneNumber: string) => {
    try {
        const response = await fetch(API_ENDPOINTS.AUTH.ResendOtp, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ phoneNumber }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || `Server error: ${response.status}`);
        }

        return data;
    } catch (error: any) {
        console.log("Resend OTP error:", error);
        throw error;
    }
};

