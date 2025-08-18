import type { MetadataRoute } from "next";
import {
  getAllCategories,
  getAllActivePlaceSlugs,
} from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: "daily",
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/favorites`,
      changeFrequency: "weekly",
      priority: 0.4,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/place/add`,
      changeFrequency: "monthly",
      priority: 0.3,
      lastModified: new Date(),
    },
  ];

  // Categories
  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  try {
    categories = await getAllCategories();
  } catch {}

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: new Date(),
  }));

  // Full set of active place slugs via paged fetch
  let places: Awaited<ReturnType<typeof getAllActivePlaceSlugs>> = [];
  try {
    places = await getAllActivePlaceSlugs();
  } catch {}

  const placeRoutes: MetadataRoute.Sitemap = places.map((p) => {
    const lm = p.updated_at || new Date().toISOString();
    return {
      url: `${baseUrl}/place/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: new Date(lm),
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...placeRoutes];
}
