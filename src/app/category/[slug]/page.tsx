import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import {
  getAllCategories,
  getPlacesByCategoryPaged,
} from "@/lib/supabase/queries";
import { RatingStars } from "@/components/ui/rating-stars";
import type { FeaturedPlaceListItem } from "@/lib/supabase/client";
// import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cats = await getAllCategories();
  const category = cats.find((c) => c.slug === slug);
  if (!category) return { title: "Category not found" };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";
  const url = `${baseUrl}/category/${category.slug}`;
  const title = `${category.name} places in Ethiopia`;
  const description =
    category.description ||
    `Discover the best ${category.name.toLowerCase()} in Ethiopia with photos, menus, and reviews.`;
  const og = `${baseUrl}/category/${category.slug}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  } satisfies import("next").Metadata;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const pageSize = 18;
  const page = Math.max(1, Number(sp?.page) || 1);
  const sortParam = (sp?.sort === "recent" ? "recent" : "rating") as
    | "rating"
    | "recent";
  const cats = await getAllCategories();
  const category = cats.find((c) => c.slug === slug);
  if (!category) return notFound();

  // Fetch category places with cover images and stats
  const { places, total } = await getPlacesByCategoryPaged(
    category.id,
    page,
    pageSize,
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold">{category.name}</h1>
      {category.description ? (
        <p className="text-muted-foreground mb-6 text-sm">
          {category.description}
        </p>
      ) : null}

      {/* SEO: ItemList schema for category listing */}
      {places.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: places.map((p, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                url: `${process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com"}/place/${p.slug}`,
                name: p.name,
              })),
            }),
          }}
        />
      ) : null}

      {places.length === 0 ? (
        <div className="text-muted-foreground">
          No places yet in this category.
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <li key={p.id} className="overflow-hidden border">
              <Link href={`/place/${p.slug}`}>
                <div className="relative aspect-video">
                  <Image
                    src={normalizeImageSrc(
                      (p as unknown as FeaturedPlaceListItem)
                        .cover_image_path || "/file.svg",
                    )}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground font-medium">{p.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {category.name}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center gap-1">
                      <RatingStars
                        rating={Number(p.place_stats?.average_rating || 0)}
                        size={16}
                      />
                      <span className="text-sm font-medium">
                        {Number(p.place_stats?.average_rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by</span>
          <Link
            href={`/category/${category.slug}?sort=rating${page > 1 ? `&page=${page}` : ""}`}
            className={`${sortParam === "rating" ? "underline" : "hover:underline"}`}
          >
            Top rated
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link
            href={`/category/${category.slug}?sort=recent${page > 1 ? `&page=${page}` : ""}`}
            className={`${sortParam === "recent" ? "underline" : "hover:underline"}`}
          >
            Most recent
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {(() => {
            const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
            const first = Math.max(1, page - 2);
            const last = Math.min(totalPages, first + 4);
            const nums = Array.from(
              { length: last - first + 1 },
              (_, i) => first + i,
            );
            return (
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={`/category/${category.slug}?sort=${sortParam}&page=${page - 1}`}
                    className="hover:underline"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Previous</span>
                )}
                <span className="text-muted-foreground">|</span>
                {nums.map((n) => (
                  <Link
                    key={n}
                    href={`/category/${category.slug}?sort=${sortParam}&page=${n}`}
                    className={`${n === page ? "underline" : "hover:underline"}`}
                  >
                    {n}
                  </Link>
                ))}
                {page < totalPages ? (
                  <Link
                    href={`/category/${category.slug}?sort=${sortParam}&page=${page + 1}`}
                    className="hover:underline"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Next</span>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
