import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/guides", "/search", "/about", "/contact"],
        disallow: [
          "/admin",
          "/checkout",
          "/dashboard",
          "/profile",
          "/api/",
          "/login",
          "/otp",
          "/success",
          "/cancel",
          "/fail",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
