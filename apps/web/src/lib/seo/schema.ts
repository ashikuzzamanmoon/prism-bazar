import { absoluteUrl, siteConfig } from "@/lib/seo/site";
import type { IProduct } from "@/types/productTypes";

interface SchemaFaq {
  question: string;
  answer: string;
}

interface ArticleSchemaInput {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  keywords?: string[];
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.domain,
    logo: absoluteUrl("/prism-bazar-logo.svg"),
    sameAs: [
      "https://www.facebook.com/prismbazar",
      "https://www.instagram.com/prismbazar",
    ],
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.domain,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildProductSchema(product: IProduct) {
  const totalStock = product.productColors?.reduce(
    (sum, color) => sum + Number(color.stock || 0),
    0,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    sku: product.slug || product.id,
    image: product.productImages?.map((image) => image.url),
    description: product.description,
    brand: product.brand?.title
      ? {
          "@type": "Brand",
          name: product.brand.title,
        }
      : undefined,
    category: product.productCategories?.[0]?.category?.name,
    aggregateRating:
      product.ratings > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratings,
            reviewCount: product.reviewsCount || 1,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: Number(product.price),
      url: absoluteUrl(`/products/${product.slug}`),
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition:
        product.condition === "PRE_OWNED"
          ? "https://schema.org/UsedCondition"
          : "https://schema.org/NewCondition",
    },
  };
}

export function buildFAQSchema(faqs: SchemaFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
  keywords = [],
}: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "en-BD",
    mainEntityOfPage: absoluteUrl(path),
    datePublished,
    dateModified,
    keywords,
    author: {
      "@type": "Organization",
      name: `${siteConfig.name} Team`,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/prism-bazar-logo.svg"),
      },
    },
    image: [absoluteUrl("/hero-banner-organic.jpg")],
  };
}

export function buildItemListSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}
