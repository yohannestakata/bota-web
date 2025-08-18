import { notFound } from "next/navigation";
import { getPlacePageData } from "@/lib/supabase/queries";
import PlaceContent from "@/features/place/pages/place-content";
import { PlaceJsonLd } from "../structured-data";
import {
  ReviewWithAuthor,
  MenuSection,
  MenuItemWithPhotos,
  PlaceWithStats,
} from "@/lib/types/database";

export const experimental_ppr = true;

export default async function BranchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; branchslug: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { slug, branchslug } = await params;
  const { cat } = await searchParams;
  const activeCategoryId = cat ? Number(cat) : null;

  const pageData = await getPlacePageData(slug, branchslug, {
    photoLimit: 12,
    photoCategoryId: activeCategoryId ?? undefined,
    reviewLimit: 10,
    similarLimit: 6,
  });

  if (!pageData || !pageData.place.is_active) {
    console.warn("[BranchPage] place not found or inactive", { slug });
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

  // Create branch data object for PlaceContent
  // Since we're fetching branch-specific data, we need to create a branch object
  // from the place data (which now contains the branch data)
  const branchData = {
    id: place.branch_id || place.id,
    name: place.name,
    slug: branchslug,
    description: place.description,
    city: place.city,
    state: place.state,
    address_line1: place.address_line1,
    address_line2: place.address_line2,
    postal_code: place.postal_code,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
    phone: place.phone,
    website_url: place.website_url,
    hours: place.hours?.map((h) => ({
      day_of_week: h.day_of_week,
      open_time: h.open_time || null,
      close_time: h.close_time || null,
      is_closed: h.is_closed,
      is_24_hours: h.is_24_hours,
    })),
  };

  return (
    <>
      <PlaceJsonLd
        name={`${place.name} - ${branchData.name}`}
        description={branchData.description || place.description}
        url={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://botareview.com"}/place/${place.slug}/${branchData.slug}`}
        averageRating={avg}
        reviewCount={reviews}
        address={{
          streetAddress:
            [branchData.address_line1, branchData.address_line2]
              .filter(Boolean)
              .join(" ") || undefined,
          addressLocality: branchData.city || undefined,
          addressRegion: branchData.state || undefined,
          postalCode: branchData.postal_code || undefined,
          addressCountry: branchData.country || undefined,
        }}
        telephone={branchData.phone || place.phone || undefined}
        priceRange={place.price_range || undefined}
        geo={{
          latitude:
            branchData.latitude != null
              ? Number(branchData.latitude)
              : undefined,
          longitude:
            branchData.longitude != null
              ? Number(branchData.longitude)
              : undefined,
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
        branch={branchData}
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
        reviews={pageData.reviews as unknown as ReviewWithAuthor[]}
        showBackLink={true}
        backLinkText={`Back to ${place.name}`}
        backLinkHref={`/place/${place.slug}`}
      />
    </>
  );
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; branchslug: string }>;
}) {
  const { slug, branchslug } = await params;
  const pageData = await getPlacePageData(slug, branchslug);
  if (!pageData) return { title: "Place not found" };

  const place = pageData.place;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://botareview.com";
  const url = `${baseUrl}/place/${place.slug}/${branchslug}`;
  const title = `${place.name} - ${place.name}`;
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
