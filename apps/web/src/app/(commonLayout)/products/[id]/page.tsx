import React from "react";
import {
  getRelevantProducts,
  getSingleProduct,
  getAllCategories,
} from "@/apiService/apiService";
import { IProduct } from "@/types/productTypes";
import { ProductDetail } from "./ProductDetails";
import RelevantProduct from "../RelevantProduct";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, buildProductSchema } from "@/lib/seo/schema";
import { buildMetadata, sanitizeKeywords } from "@/lib/seo/site";

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
      product.title,
    ]),
    images: product.productImages?.[0]?.url
      ? [product.productImages[0].url]
      : undefined,
  });
}

const page = async ({ params }: ProductPageProps) => {
  const { id } = await params;
  const productData: IProduct | null = await getSingleProduct(id);

  if (!productData) {
    notFound();
  }

  // Fetch all categories and find matching name
  const firstCategoryId = productData.productCategories?.[0]?.categoryId ?? "";
  const firstCollectionId =
    productData.productCollections?.[0]?.collectionId ?? "";

  const [categories, relevantProductData] = await Promise.all([
    getAllCategories(),
    firstCategoryId || firstCollectionId
      ? getRelevantProducts(firstCategoryId, firstCollectionId)
      : Promise.resolve([]),
  ]);

  const categoryName =
    categories.find((c) => c.id === firstCategoryId)?.name ?? "Product";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: categoryName, path: "/products" },
    { name: productData.title, path: `/products/${productData.slug}` },
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-0 py-8 pt-4">
      <JsonLd data={buildProductSchema(productData)} />
      <JsonLd data={breadcrumbSchema} />
      <ProductDetail productData={productData} categoryName={categoryName} />
      <div className="mt-8 w-full bg-primary/10 border border-primary/20 py-4 px-6 rounded-xl text-center">
        <p className="text-primary font-bold text-sm md:text-base">
          * প্রিজম বাজারে আমরা সবসময় খাঁটি, মানসম্মত পণ্য ও দ্রুত লোকাল ডেলিভারি সরবরাহে প্রতিশ্রুতিবদ্ধ। *
        </p>
      </div>
      <div className="mt-8">
        <RelevantProduct 
          relevantProductData={relevantProductData?.filter((p: IProduct) => p.id !== productData.id)} 
        />
      </div>
    </div>
  );
};

export default page;
