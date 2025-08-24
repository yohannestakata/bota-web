import { notFound } from "next/navigation";
import { getPlacePageData } from "@/lib/supabase/queries";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PlaceContent from "@/features/place/pages/place-content";
import { PlaceJsonLd } from "./structured-data";
import {
  ReviewWithAuthor,
  MenuSection,
  MenuItemWithPhotos,
  PlaceWithStats,
} from "@/lib/types/database";

export const experimental_ppr = true;

export default async function PlacePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { slug } = await params;
  const { cat } = await searchParams;
  const activeCategoryId = cat ? Number(cat) : null;

  // One-call RPC including my_reaction
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: pageData, error } = await supabase.rpc("get_place_page_data", {
    in_place_slug: slug,
    in_branch_slug: null,
    in_photo_limit: 12,
    in_photo_category_id: activeCategoryId ?? null,
    in_review_limit: 10,
    in_similar_limit: 6,
    in_user: user?.id ?? null,
  });

  if (!pageData || !pageData.place.is_active) {
    return notFound();
  }

  const place = pageData.place;
  const avg = place.average_rating ?? 0;
  const reviews = place.review_count ?? 0;

  // Compute open/closed status from normalized hours if available
  let isOpenNow: boolean | undefined = undefined;
  try {
    const hours = place.hours;
    if (hours && hours.length) {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday
      const row = hours.find(
        (h: { day_of_week: number }) => h.day_of_week === currentDay,
      );
      if (row) {
        if (row.is_24_hours) {
          isOpenNow = true;
        } else if (row.is_closed) {
          isOpenNow = false;
        } else if (row.open_time && row.close_time) {
          const [oH, oM] = row.open_time
            .split(":")
            .map((n: string) => Number(n));
          const [cH, cM] = row.close_time
            .split(":")
            .map((n: string) => Number(n));
          const openMinutes = (oH || 0) * 60 + (oM || 0);
          const closeMinutes = (cH || 0) * 60 + (cM || 0);
          const nowMinutes = now.getHours() * 60 + now.getMinutes();

          if (closeMinutes >= openMinutes) {
            isOpenNow = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
          } else {
            isOpenNow =
              nowMinutes >= openMinutes ||
              nowMinutes < (closeMinutes + 24 * 60) % (24 * 60);
          }
        }
      }
    }
  } catch {
    // Leave undefined if hours fetch fails
  }

  // Enrich reviews with current user's reaction (SSR highlight)
  let enrichedReviews = (pageData.reviews ||
    []) as unknown as ReviewWithAuthor[];
  try {
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
          setAll() {
            // no-op: middleware refreshes tokens
          },
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && enrichedReviews.length) {
      const reviewIds = enrichedReviews.map((r) => r.id);
      const { data: myReactions } = await supabase
        .from("review_reactions")
        .select("review_id, reaction_type")
        .eq("user_id", user.id)
        .in("review_id", reviewIds);
      const map = new Map<string, "like" | "love" | "meh" | "dislike">();
      for (const row of myReactions || []) {
        map.set(
          String(row.review_id),
          row.reaction_type as "like" | "love" | "meh" | "dislike",
        );
      }
      enrichedReviews = enrichedReviews.map((r) => ({
        ...(r as ReviewWithAuthor),
        my_reaction:
          (map.get(r.id) as "like" | "love" | "meh" | "dislike" | undefined) ??
          null,
      })) as unknown as ReviewWithAuthor[];
    }
  } catch {}

  return (
    <>
      <PlaceJsonLd
        name={place.name}
        description={place.description}
        url={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://botareview.com"}/place/${place.slug}`}
        averageRating={avg}
        reviewCount={reviews}
        address={{
          streetAddress:
            [place.address_line1, place.address_line2]
              .filter(Boolean)
              .join(" ") || undefined,
          addressLocality: place.city || undefined,
          addressRegion: place.state || undefined,
          postalCode: place.postal_code || undefined,
          addressCountry: place.country || undefined,
        }}
        telephone={place.phone || undefined}
        priceRange={place.price_range || undefined}
        geo={{
          latitude: place.latitude != null ? Number(place.latitude) : undefined,
          longitude:
            place.longitude != null ? Number(place.longitude) : undefined,
        }}
        image={undefined}
      />

      <PlaceContent
        place={
          place as unknown as {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            category_name?: string | null;
            category_slug?: string | null;
            price_range?: number | null;
            city?: string | null;
            state?: string | null;
            address_line1?: string | null;
            address_line2?: string | null;
            postal_code?: string | null;
            country?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            phone?: string | null;
            website_url?: string | null;
            average_rating?: number | null;
            review_count?: number | null;
            top_review?: ReviewWithAuthor | null;
            hours?: Array<{
              day_of_week: number;
              open_time: string | null;
              close_time: string | null;
              is_closed: boolean;
              is_24_hours: boolean;
            }>;
            branches?: Array<{
              id: string;
              name: string;
              slug: string;
              description?: string | null;
              phone?: string | null;
              website_url?: string | null;
              address_line1?: string | null;
              address_line2?: string | null;
              city?: string | null;
              state?: string | null;
              postal_code?: string | null;
              country?: string | null;
              latitude?: number | null;
              longitude?: number | null;
              is_main_branch: boolean;
              is_active: boolean;
              created_at: string;
              updated_at: string;
            }>;
            amenities?: Array<{
              amenity_type_id: number;
              value: boolean;
              amenity: {
                id: number;
                key: string;
                name: string;
                icon_name?: string | null;
              };
            }>;
            menu?: {
              sections?: MenuSection[];
              items?: MenuItemWithPhotos[];
            };
          }
        }
        averageRating={avg}
        reviewCount={reviews}
        isOpenNow={isOpenNow}
        photoCategories={
          pageData.photo_categories as unknown as Array<{
            id: number;
            name: string;
            created_by?: string | null;
            is_global: boolean;
            created_at: string;
          }>
        }
        photos={pageData.photos}
        activeCategoryId={activeCategoryId}
        similarPlaces={pageData.similar_places as unknown as PlaceWithStats[]}
        reviews={enrichedReviews}
      />
    </>
  );
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageData = await getPlacePageData(slug, null);
  if (!pageData) return { title: "Place not found" };
  const place = pageData.place;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://botareview.com";
  const url = `${baseUrl}/place/${place.slug}`;
  const title = `${place.name}`;
  const description =
    place.description ||
    `${place.name} — discover reviews, photos, menu, hours, and location.`;
  const ogImage = `${baseUrl}/place/${place.slug}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Bota",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
