"use client";

import { FormProvider, useForm } from "react-hook-form";
import Billing from "./Billing/Billing";
import { useState, useEffect } from "react";
import ProductInformation from "./ProductInfo/ProductInformation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import {
  applyPromoCode,
  createCashOrder,
  createManualPaymentOrder,
  getActiveDeliveryZones,
} from "@/apiService/apiService";
import { clearCart } from "@/redux/slice/cartSlice";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Order from "./Order/Order";
import { trackEvent } from "@/lib/tracking";

const Checkout = () => {
  const [productShow, setProductShow] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const cartItemData = useAppSelector((state: RootState) => state.cart.items);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAuth();

  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");

  const isDigitalOnly =
    cartItemData.length > 0 && cartItemData.every((item: any) => item.isDigital);

  const [promoCode, setPromoCode] = useState("");
  const [promoApplyData, setPromoApplyData] = useState<{
    promoId: string;
    code: string;
    discount: number;
  } | null>(null);

  const [promoMessage, setPromoMessage] = useState<string>("");
  const [promoLoading, setPromoLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      name: "",
      notes: "",
      address: "",
      email: "",
      phoneNumber: user?.phoneNumber || "",
      deliveryZoneId: "",
      transactionId: "",
      paymentMethod: "CASH_ON_DELIVERY",
    },
  });

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zones = await getActiveDeliveryZones();
        if (Array.isArray(zones) && zones.length > 0) {
          setDeliveryZones(zones);
          if (!selectedZoneId) {
            setSelectedZoneId(zones[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch delivery zones", err);
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    if (user) {
      methods.reset({
        name: "",
        notes: "",
        address: "",
        email: "",
        phoneNumber: user?.phoneNumber || "",
        deliveryZoneId: selectedZoneId || "",
        transactionId: "",
        paymentMethod: "CASH_ON_DELIVERY",
      });
    }
  }, [user, methods, selectedZoneId]);

  // Track Initiate Checkout
  useEffect(() => {
    if (cartItemData.length > 0) {
      const totalValue = cartItemData.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      trackEvent({
        eventName: "InitiateCheckout",
        eventData: {
          content_ids: cartItemData.map((i) => i.id.split("-")[0]),
          value: totalValue,
          currency: "BDT",
          num_items: cartItemData.length,
        },
      });
    }
  }, [cartItemData]);

  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const selectedDeliveryCharge = isDigitalOnly
    ? 0
    : selectedZone
    ? Number(selectedZone.deliveryCharge)
    : 0;

  const { handleSubmit } = methods;

  const onSubmit = async (data: any) => {
    if (cartItemData.length === 0) {
      toast.error("আপনার কার্ট খালি!");
      return;
    }

    if (!isDigitalOnly && !selectedZoneId) {
      toast.warning("অনুগ্রহ করে ডেলিভারি এলাকা নির্বাচন করুন!");
      return;
    }

    if (
      (data.paymentMethod === "BKASH_MANUAL" ||
        data.paymentMethod === "NAGAD_MANUAL") &&
      (!data.transactionId || data.transactionId.trim() === "")
    ) {
      toast.warning("অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) প্রদান করুন!");
      return;
    }

    setOrderLoading(true);

    try {
      const items = cartItemData.map((item) => {
        const baseProductId = item.id.split("-")[0];

        return {
          productId: baseProductId,
          colorId: item.color?.id,
          quantity: item.quantity,
          options: item.options?.map((opt) => ({ optionId: opt.id })) || [],
        };
      });

      const payload = {
        name: data.name,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber,
        address: data.address,
        notes: data.notes || undefined,
        promoId: promoApplyData?.promoId || undefined,
        deliveryZoneId: isDigitalOnly ? undefined : selectedZoneId || undefined,
        transactionId: data.transactionId?.trim() || undefined,
        paymentMethod: data.paymentMethod,
        items,
      };

      if (data.paymentMethod === "CASH_ON_DELIVERY") {
        const orderResponse = await createCashOrder(payload);

        if (orderResponse?.success && orderResponse?.redirectUrl) {
          setPromoApplyData(null);
          dispatch(clearCart());
          toast.success("অর্ডার সফলভাবে গ্রহণ করা হয়েছে!");
          window.location.href = orderResponse.redirectUrl;
        } else {
          toast.error(
            orderResponse?.data?.message ||
              orderResponse?.message ||
              "Order creation failed",
          );
        }
      } else if (
        data.paymentMethod === "BKASH_MANUAL" ||
        data.paymentMethod === "NAGAD_MANUAL"
      ) {
        const orderResponse = await createManualPaymentOrder(payload);

        if (orderResponse?.success && orderResponse?.redirectUrl) {
          setPromoApplyData(null);
          dispatch(clearCart());
          toast.success("পেমেন্ট তথ্য সহ অর্ডার জমা হয়েছে! শীঘ্রই যাচাই করা হবে।");
          window.location.href = orderResponse.redirectUrl;
        } else {
          toast.error(
            orderResponse?.data?.message ||
              orderResponse?.message ||
              "Order submission failed",
          );
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Order creation failed");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    if (promoCode.trim() === "") {
      toast.warning("Please enter a promo code!");
      return;
    }
    setPromoLoading(true);

    try {
      const response = await applyPromoCode(promoCode);
      if (response.statusCode === 200) {
        setPromoApplyData({
          promoId: response.data.id,
          code: response.data.code,
          discount: response.data.discount,
        });
        setPromoMessage("Promo code applied successfully!");
        toast.success("Promo code applied successfully!");
      } else {
        toast.error("Invalid promo code!");
        setPromoApplyData(null);
        setPromoMessage("Promo code is invalid.");
      }
    } catch (error) {
      console.error(error);
      setPromoApplyData(null);
      setPromoMessage("Promo code has no discount.");
      toast.error("Something went wrong!");
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-8 pt-3 px-4">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {productShow ? (
            <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-6 w-full">
              {/* Product Info Section */}
              <div className="w-full rounded-xl bg-white lg:min-w-0 lg:flex-1">
                <ProductInformation />
              </div>

              {/* Billing Info Section */}
              <div className="w-full lg:basis-[30%] lg:max-w-[360px]">
                <Order
                  productShow={productShow}
                  setProductShow={setProductShow}
                  promoApplyData={promoApplyData}
                  orderLoading={orderLoading}
                  deliveryCharge={selectedDeliveryCharge}
                  isDigitalOnly={isDigitalOnly}
                />
              </div>
            </section>
          ) : (
            <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-6 w-full">
              <div className="w-full bg-white rounded-xl lg:basis-[70%] lg:min-w-0">
                <Billing
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  handleApplyPromo={handleApplyPromo}
                  promoApplyData={promoApplyData}
                  promoMessage={promoMessage}
                  promoLoading={promoLoading}
                  deliveryZones={deliveryZones}
                  selectedZoneId={selectedZoneId}
                  setSelectedZoneId={setSelectedZoneId}
                  isDigitalOnly={isDigitalOnly}
                />
              </div>
              {/* Billing Info Section */}
              <div className="w-full lg:basis-[30%] lg:max-w-[360px]">
                <Order
                  productShow={productShow}
                  setProductShow={setProductShow}
                  promoApplyData={promoApplyData}
                  orderLoading={orderLoading}
                  deliveryCharge={selectedDeliveryCharge}
                  isDigitalOnly={isDigitalOnly}
                />
              </div>
            </section>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default Checkout;
