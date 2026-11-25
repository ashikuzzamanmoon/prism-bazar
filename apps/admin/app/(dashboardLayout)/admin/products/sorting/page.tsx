"use client";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import { useGetAllSortingProductsQuery } from "@/redux/Api/productApi";
import React from "react";
import SortableProduct from "./ProductSorting";

const SortingProductPage = () => {
  const { data, isLoading } = useGetAllSortingProductsQuery({});
  if (isLoading) {
    return <TableSkeleton />;
  }
  const productData = data?.data || [];

  return (
    <div className="max-w-3xl mx-auto bg-white p-3">
      <SortableProduct productData={productData} />
    </div>
  );
};

export default SortingProductPage;
