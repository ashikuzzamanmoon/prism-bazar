import React from "react";
import { notFound } from "next/navigation";
import { buildMetadata, sanitizeKeywords } from "@/lib/seo/site";
import { getSingleProduct } from "@/apiService/apiService";
import { IProduct } from "@/types/productTypes";
import CompareProductShow from "@/components/Compare/CompareProductShow";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getSingleProduct(id);

  if (!product) {
    return buildMetadata({
      title: "Product not found",
      path: `/products/${id}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: product.title,
    description:
      product.description?.slice(0, 155) ||
      `${product.title} available with fast delivery and official warranty support.`,
    path: `/products/${product.slug}`,
    keywords: sanitizeKeywords([
      product.brand?.title,
      product.modelNumber,
      product.title,
      product.features?.flatMap((feature: { key: string; value: string }) =>
        feature.key.toLowerCase().includes("processor") ? [feature.value] : [],
      )?.[0],
    ]),
    images: product.productImages?.[0]?.url
      ? [product.productImages[0].url]
      : undefined,
  });
}

const ProductCompare = async ({ params }: ProductPageProps) => {
  const { id } = await params;
  const productData: IProduct | null = await getSingleProduct(id);
  if (!productData) {
    notFound();
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-0 py-8 pt-4">
      <CompareProductShow productData={productData} />
    </div>
  );
};

export default ProductCompare;
