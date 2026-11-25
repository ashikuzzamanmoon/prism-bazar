"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/redux/hooks";
import { CartItem } from "@/redux/slice/cartSlice";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

interface OrderProps {
  productShow: boolean;
  setProductShow: React.Dispatch<React.SetStateAction<boolean>>;
  promoApplyData: {
    promoId: string;
    code: string;
    discount: number;
  } | null;
  orderLoading?: boolean;
  deliveryCharge?: number;
  isDigitalOnly?: boolean;
}

const Order = ({
  productShow,
  setProductShow,
  promoApplyData,
  orderLoading,
  deliveryCharge,
  isDigitalOnly = false,
}: OrderProps) => {
  const { register, watch } = useFormContext();
  const selectedPaymentMethod = watch("paymentMethod", "CASH_ON_DELIVERY");
  const cartItemData = useAppSelector(
    (state) => state.cart.items as CartItem[],
  );
  const { user, token } = useAuth();
  const router = useRouter();

  // Calculate subtotal
  const subtotal: number =
    cartItemData?.reduce(
      (acc: number, item: CartItem) => acc + item.price * item.quantity,
      0,
    ) ?? 0;

  const defaultShipping: number =
    cartItemData?.reduce(
      (acc: number, item: CartItem) => acc + (item.deliveryCharge || 0),
      0,
    ) ?? 0;

  const shipping: number = isDigitalOnly
    ? 0
    : deliveryCharge !== undefined
    ? deliveryCharge
    : defaultShipping;

  const discount: number = promoApplyData?.discount ?? 0;
  const total: number = Math.max(0, subtotal + shipping - discount);

  const logos = [
    {
      src: "https://www.logo.wine/a/logo/BKash/BKash-bKash-Logo.wine.svg",
      alt: "bKash",
    },
    {
      src: "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg",
      alt: "Nagad",
    },
    {
      src: "https://static.vecteezy.com/system/resources/previews/020/574/330/non_2x/cash-on-delivery-badge-pack-free-png.png",
      alt: "Cash on Delivery",
    },
  ];

  const handleToggle = () => {
    const isAuthenticated = token && (user?.id || user?.phoneNumber);
    if (!isAuthenticated) {
      router.push("/login?redirect=/otp?redirect=/checkout");
    } else {
      setProductShow((prev) => !prev);
    }
  };

  return (
    <div className="bg-white rounded-lg px-4 py-5 sm:px-5 xl:p-6 border border-gray-100 shadow-sm">
      <h1 className="text-xl font-medium text-[#1A1A1A] pb-1.5">
        অর্ডার সারসংক্ষেপ (Order Summary)
      </h1>

      {/* payment logos */}
      <div className="flex flex-wrap gap-3 items-center justify-start bg-gray-50 rounded-sm p-2 sm:p-3">
        {logos.map((logo, index) => (
          <div key={index} className="relative h-10 w-14 sm:h-12 sm:w-16">
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <section className="pt-2 text-sm text-gray-700">
        <h1>মোট পণ্য: <span className="font-semibold text-primary">{cartItemData.length} টি</span></h1>
      </section>

      {/* pricing */}
      <section className="text-sm mt-0">
        <div className="flex justify-between py-3 border-b">
          <p className="text-[#4D4D4D]">সাবটোটাল (Subtotal)</p>
          <p className="font-medium">৳ {Math.round(subtotal)}</p>
        </div>
        <div className="flex justify-between py-3 border-b">
          <p className="text-[#4D4D4D]">ডেলিভারি চার্জ (Delivery)</p>
          {shipping === 0 ? (
            <p className="font-medium text-green-600">ফ্রি (Free)</p>
          ) : (
            <p className="font-medium">৳ {Math.round(shipping)}</p>
          )}
        </div>
        {discount > 0 && (
          <div className="flex justify-between py-3 border-b">
            <p className="text-[#4D4D4D]">ডিসকাউন্ট ({promoApplyData?.code})</p>
            <p className="font-medium text-green-600">
              - ৳ {Math.round(discount)}
            </p>
          </div>
        )}
        <div className="flex justify-between py-3">
          <p className="text-[#4D4D4D] font-medium">সর্বমোট (Total)</p>
          <p className="font-bold text-lg text-primary">৳ {Math.round(total)}</p>
        </div>
      </section>

      {/* payment method */}
      {!productShow && (
        <section className="mt-6 border-t pt-4">
          <h1 className="text-base font-semibold text-[#1A1A1A] mb-3">পেমেন্ট মেথড বেছে নিন</h1>
          <div className="grid gap-2.5">
            {paymentMethods.map((pm) => (
              <label
                key={pm.id}
                htmlFor={pm.value}
                className="flex items-center gap-2.5 p-2 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
              >
                <input
                  type="radio"
                  id={pm.value}
                  value={pm.value}
                  {...register("paymentMethod", { required: true })}
                  className="w-4 h-4 text-primary focus:ring-primary"
                  defaultChecked={pm.value === "CASH_ON_DELIVERY"}
                />
                <span className="text-sm text-gray-800 font-medium">
                  {pm.method}
                </span>
              </label>
            ))}
          </div>

          {/* Manual Payment Details Box */}
          {(selectedPaymentMethod === "BKASH_MANUAL" || selectedPaymentMethod === "NAGAD_MANUAL") && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs md:text-sm">
              <p className="font-semibold text-amber-900 mb-1">
                {selectedPaymentMethod === "BKASH_MANUAL" ? "বিকাশ" : "নগদ"} পার্সোনাল নম্বর:{" "}
                <span className="text-primary font-bold text-base">01706473787</span>
              </p>
              <p className="text-amber-800 mb-2">
                উপরের নম্বরে মোট ৳{Math.round(total)} Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন:
              </p>
              <input
                type="text"
                placeholder="TrxID (যেমন: 9K72AXMNP)"
                {...register("transactionId", {
                  required: "ট্রানজেকশন আইডি প্রদান করুন",
                })}
                className="w-full h-10 border border-gray-300 rounded px-3 text-sm uppercase bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </section>
      )}

      {/* agreement checkbox */}
      {!productShow && (
        <section className="mt-4 mb-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("agreeToTerms", { required: true })}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-xs text-gray-600">
              আমি প্রিজম বাজারের{" "}
              <Link
                href="/terms-and-condition"
                className="text-primary hover:underline"
                target="_blank"
              >
                শর্তাবলী
              </Link>
              ,{" "}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline"
                target="_blank"
              >
                গোপনীয়তা নীতি
              </Link>
              , এবং{" "}
              <Link
                href="/return-and-refund-policy"
                className="text-primary hover:underline"
                target="_blank"
              >
                রিটার্ন পলিসির
              </Link>{" "}
              সাথে একমত পোষণ করছি।
            </span>
          </label>
        </section>
      )}

      {/* buttons */}
      <div className="mt-4 flex justify-end">
        {productShow ? (
          <button
            type="button"
            onClick={handleToggle}
            className="py-3 rounded-md bg-primary hover:bg-primary/90 text-white font-semibold w-full transition shadow-sm"
          >
            অর্ডার নিশ্চিতকরণে এগিয়ে যান
          </button>
        ) : (
          <button
            type="submit"
            disabled={orderLoading}
            className="py-3 disabled:opacity-50 text-sm rounded-md bg-primary hover:bg-primary/90 text-white font-semibold w-full transition shadow-sm"
          >
            {orderLoading ? "অর্ডার প্রসেস হচ্ছে..." : "অর্ডার প্লেস করুন"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Order;

const paymentMethods = [
  { id: 1, value: "CASH_ON_DELIVERY", method: "ক্যাশ অন ডেলিভারি (Cash on Delivery)" },
  { id: 2, value: "BKASH_MANUAL", method: "বিকাশ পেমেন্ট (Send Money / TrxID)" },
  { id: 3, value: "NAGAD_MANUAL", method: "নগদ পেমেন্ট (Send Money / TrxID)" },
];
