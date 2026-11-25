"use client";
import CustomInput from "@/components/ui/custom-input";
import { useFormContext } from "react-hook-form";

interface BillingProps {
  promoCode: string;
  setPromoCode: (value: string) => void;
  handleApplyPromo: () => void;
  promoApplyData?: { promoId: string; code: string; discount: number } | null;
  promoMessage?: string;
  promoLoading: boolean;
  deliveryZones?: any[];
  selectedZoneId?: string;
  setSelectedZoneId?: (zoneId: string) => void;
  isDigitalOnly?: boolean;
}

const Billing = ({
  promoCode,
  setPromoCode,
  handleApplyPromo,
  promoApplyData,
  promoMessage,
  promoLoading,
  deliveryZones = [],
  selectedZoneId = "",
  setSelectedZoneId,
  isDigitalOnly = false,
}: BillingProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-white rounded-lg p-4 sm:p-5">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <h2 className="text-xl font-medium primaryColor pb-6">
          Billing Information
        </h2>
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <CustomInput
              label="Name"
              placeholder="Name"
              required
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div>
            <CustomInput
              label="Email"
              type="email"
              placeholder="example@email.com"
              {...register("email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {/* {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message as string}
              </p>
            )} */}
          </div>

          <div>
            <CustomInput
              label="Phone"
              type="text"
              required
              placeholder="01XXXXXXXXX"
              {...register("phoneNumber", {
                required: "Phone number is required",
                validate: {
                  startsWithZeroOne: (value) =>
                    value.startsWith("01") || "Phone must start with 01",
                  exactLength: (value) =>
                    value.length === 11 || "Phone must be exactly 11 digits",
                  onlyNumbers: (value) =>
                    /^\d+$/.test(value) || "Phone must contain only numbers",
                },
              })}
              maxLength={11}
              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                // Only allow numbers
                e.currentTarget.value = e.currentTarget.value.replace(
                  /[^0-9]/g,
                  "",
                );
              }}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber.message as string}
              </p>
            )}
          </div>

          <div>
            <CustomInput
              label="Street Address"
              placeholder="Street Address / গ্রাম / এলাকা"
              required
              {...register("address", {
                required: "Address is required",
              })}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {errors.address.message as string}
              </p>
            )}
          </div>

          {/* Delivery Zone Selection */}
          {isDigitalOnly ? (
            <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              ℹ️ আপনার কার্টের পণ্যগুলো ডিজিটাল ডাউনলোডযোগ্য। কোনো ডেলিভারি চার্জ প্রযোজ্য নয়।
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ডেলিভারি এলাকা নির্বাচন করুন (Delivery Zone) <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId && setSelectedZoneId(e.target.value)}
              >
                <option value="">-- ডেলিভারি এলাকা নির্বাচন করুন --</option>
                {deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.area}) — ৳{zone.deliveryCharge} {zone.estimatedTime ? `[${zone.estimatedTime}]` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                * সিরাজগঞ্জ ও কাজিপুরে দ্রুত হোম ডেলিভারি এবং সারা দেশে কুরিয়ার সার্ভিস সুবিধা রয়েছে।
              </p>
            </div>
          )}

          <div>
            <CustomInput
              label="Notes"
              placeholder="অর্ডার সংক্রান্ত বিশেষ নির্দেশ বা ঠিকানা"
              {...register("notes")}
            />
          </div>

          <div className="space-y-2">
            <h1>Apply Promo Code</h1>

            {promoMessage || promoApplyData ? (
              <>
                <p
                  className={`text-sm mt-1 ${
                    promoApplyData
                      ? "text-green-600 bg-green-50 border border-green-100 p-2 rounded-md"
                      : "text-red-600 bg-red-50 border border-red-100 p-2 rounded-md"
                  }`}
                >
                  {promoMessage}{" "}
                  {promoApplyData && `(৳ ${promoApplyData.discount})`}
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="h-9 flex-1 border border-gray-300 rounded-md px-3 text-sm min-w-0"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className={`h-9 rounded-md bg-gray-800 px-4 text-white transition flex items-center justify-center sm:min-w-24 ${
                      promoLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {promoLoading ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
