import type { MetadataRoute } from "next";
import { API_ENDPOINTS } from "@/apiService/config";
import { seoGuideSlugs } from "@/content/seo-guides";
import { absoluteUrl } from "@/lib/seo/site";
import type { IProduct } from "@/types/productTypes";

async function fetchSitemapProducts() {
  try {
    const response = await fetch(`${API_ENDPOINTS.PRODUCT.GetAll}?limit=200`, {
      next: { revalidate: 3600 },
    });
    const payload = await response.json();
    return (payload?.data?.data || payload?.data || []) as IProduct[];
  } catch {
    return [] as IProduct[];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchSitemapProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), priority: 1, changeFrequency: "daily" },
    { url: absoluteUrl("/products"), priority: 0.9, changeFrequency: "daily" },
    { url: absoluteUrl("/guides"), priority: 0.8, changeFrequency: "weekly" },
    { url: absoluteUrl("/about"), priority: 0.6, changeFrequency: "monthly" },
    { url: absoluteUrl("/contact"), priority: 0.6, changeFrequency: "monthly" },
    {
      url: absoluteUrl("/privacy-policy"),
      priority: 0.3,
      changeFrequency: "yearly",
    },
    {
      url: absoluteUrl("/return-and-refund-policy"),
      priority: 0.3,
      changeFrequency: "yearly",
    },
    {
      url: absoluteUrl("/terms-and-condition"),
      priority: 0.3,
      changeFrequency: "yearly",
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const guideRoutes: MetadataRoute.Sitemap = seoGuideSlugs.map((slug) => ({
    url: absoluteUrl(`/guides/${slug}`),
    lastModified: new Date(),
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...guideRoutes, ...productRoutes];
}
