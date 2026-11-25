import { buildMetadata } from "@/lib/seo/site";
import Checkout from "@/components/Checkout/Checkout";

export const metadata = buildMetadata({
  title: "Checkout",
  path: "/checkout",
  noIndex: true,
});

const CheckoutPage = () => {
  return (
    <div className=" bg-gray-50 h-full pb-12 md:pb-24">
      <Checkout />
    </div>
  );
};

export default CheckoutPage;
