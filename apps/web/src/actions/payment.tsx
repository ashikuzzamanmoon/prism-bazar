import { API_ENDPOINTS } from "@/apiService/config";
import Cookies from "js-cookie";


export const cashOnPaymentOrder = async (data: any) => {
  try {
    const token = Cookies.get("pbToken");
    if (!token) {
      return { error: true, message: "Unauthorized" };
    }

    const response = await fetch(
      API_ENDPOINTS.ORDER.CASH_ON_DELIVERY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return {
          error: true,
          data: {
            message: errorData?.message || `HTTP ${response.status}: Order failed`,
          },
        };
      } catch {
        return {
          error: true,
          data: {
            message: `HTTP ${response.status}: Order failed`,
          },
        };
      }
    }

    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    console.error("Cash on delivery order error:", error);
    return {
      error: true,
      success: false,
      data: {
        message: error?.message === "Failed to fetch" 
          ? "Network error. Please check your connection and try again." 
          : error?.message || "Something went wrong",
      },
    };
  }
};
