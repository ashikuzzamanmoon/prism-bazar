import getServerData from "@/apiService/apiService";
import { API_ENDPOINTS } from "@/apiService/config";
import { OrderTable } from "@/components/Order/OrderTable";
import React from "react";
import { buildMetadata } from "@/lib/seo/site";

export const metadata = buildMetadata({
  title: "Dashboard",
  path: "/dashboard",
  noIndex: true,
});

const DashboardPage = async () => {
  const myOrderData = await getServerData(API_ENDPOINTS.ORDER.GET_MY_ORDERS);
  return (
    <div>
      <OrderTable myOrderData={myOrderData} />
    </div>
  );
};

export default DashboardPage;
