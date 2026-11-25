"use client";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import UpdateProductFrom from "@/components/Products/UpdateProductFrom";
import { useGetSingleProductQuery } from "@/redux/Api/productApi";
import { IProduct } from "@/types/products.type";
import { useParams } from "next/navigation";
import React from "react";

const ProductUpdatePage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetSingleProductQuery(id as string);
  if (isLoading) {
    return (
      <div>
        <TableSkeleton />
      </div>
    );
  }
  const productData: IProduct = data?.data;
  console.log("Product Data", productData);
  return (
    <div className=" bg-white p-4">
      <UpdateProductFrom  productData={productData} />
    </div>
  );
};

export default ProductUpdatePage;
