import type { Metadata } from "next";

const fallbackSiteUrl = "https://prismbazar.com";

export const siteConfig = {
  name: "Prism Bazar",
  shortName: "PrismBazar",
  domain: process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl,
  description:
    "সিরাজগঞ্জ ও কাজীপুরসহ সারাদেশে খাঁটি অর্গানিক খাদ্য (মধু, ঘি, সরিষার তেল) এবং শিক্ষার্থীদের সহায়িকা ও ডিজিটাল শিট সরবরাহকারী অনলাইন প্ল্যাটফর্ম।",
  keywords: [
    "খাঁটি মধু",
    "গাওয়া ঘি",
    "ঘানিভাঙা সরিষার তেল",
    "অর্গানিক ফুড সিরাজগঞ্জ",
    "কাজীপুর লোকাল ডেলিভারি",
    "ডিজিটাল শিট পিডিএফ",
    "শিক্ষা সামগ্রী",
    "Prism Bazar",
    "প্রিজম বাজার",
  ],
  locale: "bn_BD",
  language: "bn",
  twitter: "@prismbazar",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.domain).toString();
}

export function buildMetadata({
  title,
  description,
  keywords = [],
  path = "/",
  images,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  images?: string[];
  noIndex?: boolean;
} = {}): Metadata {
  const resolvedTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} | খাঁটি অর্গানিক খাদ্য ও শিক্ষণ সামগ্রী`;
  const resolvedDescription = description || siteConfig.description;
  const canonical = absoluteUrl(path);
  const resolvedImages = images?.length
    ? images
    : [absoluteUrl("/OneTGrap.jpg")];

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: [...siteConfig.keywords, ...keywords],
    metadataBase: new URL(siteConfig.domain),
    alternates: {
      canonical,
      languages: {
        "en-BD": canonical,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: resolvedImages.map((image) => ({
        url: image,
        width: 1200,
        height: 630,
        alt: resolvedTitle,
      })),
    },
    twitter: {
      card: "summary_large_image",
      creator: siteConfig.twitter,
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImages,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            "max-snippet": 0,
            "max-image-preview": "none",
            "max-video-preview": 0,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
  };
}

export function sanitizeKeywords(values: Array<string | undefined | null>) {
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .filter((value, index, items) => items.indexOf(value) === index);
}
