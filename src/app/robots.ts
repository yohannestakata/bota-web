import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/auth/", "/api/", "/account"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
