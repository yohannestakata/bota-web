import { notFound } from "next/navigation";
// import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  getPlaceBySlugWithDetails,
  getPlacePhotoCategories,
  getPlacePhotos,
  getReviewsForPlace,
} from "@/lib/supabase/queries";
import Gallery from "@/features/place/components/gallery";
// Reviews list is rendered via server wrapper
import SimilarPlaces from "@/features/place/components/similar-places";
// Section is used inside feature components; not needed here
import Section from "@/features/place/components/section";
import Hours from "@/features/place/components/hours";
import Amenities from "@/features/place/components/amenities";
import Menu from "@/features/place/components/menu";
import BusinessQuickInfo from "@/features/place/components/business-quick-info";
import { RatingStars } from "@/components/ui/rating-stars";
import { getPlaceHours } from "@/lib/supabase/queries";
import type { HourRow } from "@/features/place/components/hours";

import { PlaceJsonLd } from "./structured-data";
import {
  LocationHoursSkeleton,
  AmenitiesSkeleton,
  MenuSkeleton,
  SimilarPlacesSkeleton,
  ReviewsSkeleton,
} from "@/features/place/components/skeletons";
import Reviews from "@/features/place/components/reviews";
import SearchBar from "@/components/search-bar";
import { ChevronLeftIcon } from "lucide-react";
import { format } from "date-fns";

export const experimental_ppr = true;

export default async function PlacePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { slug } = await params;
  console.log("[PlacePage] slug", slug);
  const { cat } = await searchParams;
  const activeCategoryId = cat ? Number(cat) : null;

  const place = await getPlaceBySlugWithDetails(slug);
  if (!place || !place.is_active) {
    console.warn("[PlacePage] place not found or inactive", { slug });
    return notFound();
  }
  console.log("[PlacePage] place loaded", {
    id: place.id,
    name: place.name,
    category_id: place.category_id,
    hasPhone: Boolean(place.phone),
    hasWebsite: Boolean(place.website_url),
    coords: {
      lat: place.latitude,
      lon: place.longitude,
    },
  });

  const avg = place.place_stats?.average_rating ?? 0;
  const reviews = place.place_stats?.review_count ?? 0;

  // Compute open/closed status from normalized hours if available
  let isOpenNow: boolean | undefined = undefined;
  try {
    const hours: HourRow[] = await getPlaceHours(place.id);
    if (hours && hours.length) {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday
      const row = hours.find((h) => h.day_of_week === currentDay);
      if (row) {
        if (row.is_24_hours) {
          isOpenNow = true;
        } else if (row.is_closed) {
          isOpenNow = false;
        } else if (row.open_time && row.close_time) {
          const [oH, oM] = row.open_time.split(":").map((n) => Number(n));
          const [cH, cM] = row.close_time.split(":").map((n) => Number(n));
          const openMinutes = (oH || 0) * 60 + (oM || 0);
          const closeMinutes = (cH || 0) * 60 + (cM || 0);
          const nowMinutes = now.getHours() * 60 + now.getMinutes();

          if (closeMinutes >= openMinutes) {
            // same-day close
            isOpenNow = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
          } else {
            // overnight (e.g., 18:00 – 02:00)
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

  // Select a "top" review to feature: by total reactions, then rating, then recency
  const topReview = await (async () => {
    try {
      const recent = await getReviewsForPlace(place.id, 6);
      if (!recent.length) return null;
      const sorted = [...recent].sort((a, b) => {
        const ra = a.review_stats?.total_reactions || 0;
        const rb = b.review_stats?.total_reactions || 0;
        if (rb !== ra) return rb - ra;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      return sorted[0];
    } catch {
      return null;
    }
  })();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PlaceJsonLd
        name={place.name}
        description={place.description}
        url={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://bota.local"}/place/${place.slug}`}
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
      />

      {/* Main content */}
      <div className="mt-5 grid grid-cols-10 gap-24">
        <div className="col-span-6">
          {/* Title and meta moved into left column */}
          <h1 className="text-foreground text-4xl font-semibold tracking-tight">
            {place.name}
          </h1>
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <RatingStars rating={avg} size={24} />
              <span className="text-foreground font-medium">
                {avg.toFixed(1)}
              </span>
              <span className="text-sm">
                ({reviews} review{reviews !== 1 ? "s" : ""})
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {isOpenNow !== undefined ? (
                <span
                  className={
                    isOpenNow
                      ? "font-medium text-green-600"
                      : "font-medium text-red-600"
                  }
                >
                  {isOpenNow ? "Open now" : "Closed"}
                </span>
              ) : (
                <span>Hours not set</span>
              )}
              {(place.category?.name || place.price_range) && <span>•</span>}
              {(place.category?.name || place.price_range) && (
                <span>
                  {place.category?.name}
                  {place.category?.name && place.price_range ? " · " : ""}
                  {place.price_range
                    ? "$".repeat(
                        Math.min(
                          Math.max(Number(place.price_range) || 0, 1),
                          4,
                        ),
                      )
                    : ""}
                </span>
              )}
              {(place.city || place.state) && <span>•</span>}
              {(place.city || place.state) && (
                <span>
                  {[place.city, place.state].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
          {/* Rating & Quick Info (mobile-first) */}
          <div className="lg:hidden">
            <BusinessQuickInfo
              place={place}
              averageRating={avg}
              reviewCount={reviews}
              isOpenNow={isOpenNow}
            />
          </div>

          {/* Top review */}
          {topReview ? (
            <div className="border-border mt-4 rounded-3xl border p-6">
              <div className="flex items-center gap-3.5">
                <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full font-medium">
                  {(
                    topReview.author?.full_name ||
                    topReview.author?.username ||
                    "?"
                  )
                    .toString()
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="text-foreground font-medium">
                    {topReview.author?.full_name ||
                      topReview.author?.username ||
                      "User"}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <RatingStars rating={topReview.rating} size={16} />
                    </div>
                    <span>•</span>
                    <span>
                      {format(
                        new Date(topReview.visited_at || topReview.created_at),
                        "LLLL yyyy",
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                {topReview.body ? (
                  <p className="text-foreground mt-3 line-clamp-3 leading-relaxed">
                    {topReview.body}
                  </p>
                ) : null}
                <div className="mt-2">
                  <a href="#reviews" className="font-medium underline">
                    Show more
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          {/* Photos */}
          <Section title="Photos">
            {/** Prefetch initial gallery data server-side for crawlability */}
            {await (async () => {
              const [initialCategories, initialPhotos] = await Promise.all([
                getPlacePhotoCategories(place.id).catch(() => []),
                getPlacePhotos(
                  place.id,
                  12,
                  activeCategoryId ?? undefined,
                ).catch(() => []),
              ]);
              return (
                <Gallery
                  placeId={place.id}
                  initialCategories={initialCategories}
                  initialPhotos={initialPhotos}
                  initialActiveCategoryId={activeCategoryId}
                />
              );
            })()}
          </Section>

          {/* Description + key details */}
          <div className="border-border border-b pb-12">
            <p>{place.description}</p>
          </div>

          {/* Location & Hours */}
          <Section title="Location & Hours">
            <Suspense fallback={<LocationHoursSkeleton />}>
              <Hours
                placeId={place.id}
                latitude={
                  place.latitude != null ? Number(place.latitude) : null
                }
                longitude={
                  place.longitude != null ? Number(place.longitude) : null
                }
                name={place.name}
              />
            </Suspense>
          </Section>

          {/* Amenities */}
          <Section title="Amenities">
            <Suspense fallback={<AmenitiesSkeleton />}>
              <Amenities placeId={place.id} />
            </Suspense>
          </Section>

          {/* Menu */}
          <Section title="Menu">
            <Suspense fallback={<MenuSkeleton />}>
              <Menu placeId={place.id} />
            </Suspense>
          </Section>

          {/* Similar Places */}
          <Section title="Similar Places">
            <Suspense fallback={<SimilarPlacesSkeleton />}>
              <SimilarPlaces
                categoryId={Number(place.category_id)}
                excludePlaceId={place.id}
              />
            </Suspense>
          </Section>

          {/* Reviews */}
          <div id="reviews" />
          <Section title="Reviews">
            <Suspense fallback={<ReviewsSkeleton />}>
              <Reviews placeId={place.id} />
            </Suspense>
          </Section>
        </div>

        <div className="col-span-4">
          <div className="sticky top-28">
            <div className="hidden lg:block">
              <BusinessQuickInfo
                place={place}
                averageRating={avg}
                reviewCount={reviews}
                isOpenNow={isOpenNow} // Calculated based on current time and hours
                showRatingHeader={false}
                showCategoryAndPrice={false}
                showOpenStatus={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlugWithDetails(slug);
  if (!place) return { title: "Place not found" };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bota.local";
  const url = `${baseUrl}/place/${place.slug}`;
  const title = `${place.name} – Bota`;
  const description = place.description || "Place details on Bota";
  const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(place.name)}`;
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
