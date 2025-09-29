import { notFound } from "next/navigation";
import Link from "next/link";
import PlaceListCard from "@/components/places/place-list-card";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  getAllCategories,
  getPlacesByCategoryPaged,
} from "@/lib/supabase/queries";
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
    sortParam,
  );

  // Enrich with latest photo from main branch for each place
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const placeIds = places.map((p) => p.id);
  const { data: branches } = await supabase
    .from("branches")
    .select("id, place_id")
    .in("place_id", placeIds)
    .eq("is_main_branch", true);
  const placeIdToBranchId = new Map<string, string>(
    (branches || []).map((b) => [
      String((b as { place_id: string }).place_id),
      String((b as { id: string }).id),
    ]),
  );

  const mainBranchIds = (branches || []).map((b) =>
    String((b as { id: string }).id),
  );
  const { data: photos } = await supabase
    .from("branch_photos")
    .select("branch_id, file_path, created_at")
    .in("branch_id", mainBranchIds)
    .order("created_at", { ascending: false });
  const firstPhotoByBranch = new Map<string, string>();
  for (const row of photos || []) {
    const bid = String((row as { branch_id: string }).branch_id);
    if (!firstPhotoByBranch.has(bid)) {
      firstPhotoByBranch.set(
        bid,
        String((row as { file_path: string }).file_path),
      );
    }
  }

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
          {places.map((p) => {
            const branchId = placeIdToBranchId.get(p.id);
            const imageUrl = branchId
              ? firstPhotoByBranch.get(branchId) || "/file.svg"
              : "/file.svg";
            return (
              <li key={p.id} className="overflow-hidden">
                <PlaceListCard
                  href={`/place/${p.slug}`}
                  imageUrl={imageUrl}
                  title={p.name}
                  category={category.name}
                  rating={Number(p.place_stats?.average_rating || 0)}
                  reviewCount={Number(p.place_stats?.review_count || 0)}
                />
              </li>
            );
          })}
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
