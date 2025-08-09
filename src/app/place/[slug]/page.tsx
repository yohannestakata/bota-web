import { notFound } from "next/navigation";
// import Image from "next/image";
import Link from "next/link";
import {
  getPlaceBySlugWithDetails,
  getPlacePhotos,
  getReviewsForPlace,
  getSimilarPlaces,
  getPlaceHours,
  getPlaceAmenities,
  getPlaceMenu,
} from "@/lib/supabase/queries";
import Gallery from "@/features/place/components/gallery";
import Reviews from "@/features/place/components/reviews";
import SimilarPlaces from "@/features/place/components/similar-places";
import Hours from "@/features/place/components/hours";
import Amenities from "@/features/place/components/amenities";
import PlaceMap from "@/features/place/components/map";
import Menu from "@/features/place/components/menu";
import BusinessQuickInfo from "@/features/place/components/business-quick-info";

import { PlaceJsonLd } from "./structured-data";
import SearchBar from "@/components/search-bar";
import { ChevronLeftIcon, HeartIcon, Share2Icon } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function PlacePage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = resolvedParams.slug;
  console.log("[PlacePage] slug", slug);

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

  const [photos, placeReviews, similar, hours, amenities, menuData] =
    await Promise.all([
      getPlacePhotos(place.id, 12).catch(() => []),
      getReviewsForPlace(place.id, 8).catch(() => []),
      getSimilarPlaces(place.category_id, place.id, 6).catch(() => []),
      getPlaceHours(place.id).catch(() => []),
      getPlaceAmenities(place.id).catch(() => []),
      getPlaceMenu(place.id).catch(() => []),
    ]);
  console.log("[PlacePage] data counts", {
    photos: photos.length,
    reviews: placeReviews.length,
    similar: similar.length,
    hours: hours.length,
    amenities: amenities.length,
    menuSections:
      (menuData as unknown as { sections?: unknown[] })?.sections?.length ?? 0,
  });
  if (!hours.length) {
    console.warn("[PlacePage] no hours found for place", {
      id: place.id,
      slug,
    });
  }
  if (!amenities.length) {
    console.warn("[PlacePage] no amenities found for place", {
      id: place.id,
      slug,
    });
  }

  // Fetch replies for these reviews and attach
  const { getRepliesForReviewIds } = await import("@/lib/supabase/queries");
  const repliesMap = await getRepliesForReviewIds(
    placeReviews.map((r) => r.id),
  ).catch(() => new Map());
  const reviewsWithReplies = placeReviews.map((r) => ({
    ...r,
    replies: repliesMap.get(r.id) || [],
  }));

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

      <div className="relative mt-4 flex h-14 items-center justify-between">
        <Link
          href="/"
          className="text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-full p-2 transition-colors duration-150"
          aria-label="Back"
        >
          <ChevronLeftIcon size={24} />
        </Link>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <SearchBar />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-foreground text-3xl font-medium tracking-tight">
          {place.name}
        </h1>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-full px-2 py-1 underline underline-offset-4 transition-colors duration-150"
            aria-label="Share"
          >
            <Share2Icon size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Share</span>
          </Link>
          <Link
            href="/"
            className="text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-full px-2 py-1 underline underline-offset-4 transition-colors duration-150"
            aria-label="Share"
          >
            <HeartIcon size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Save</span>
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <Gallery photos={photos} />
      </div>

      <div className="mt-8 grid grid-cols-10 gap-24">
        <div className="col-span-6">
          {/* Description + key details */}
          <div className="border-border border-b pb-12">
            <p>{place.description}</p>
          </div>

          {/* Overview removed; key details merged into description */}

          <section className="border-border border-b py-12">
            <div className="text-foreground text-xl font-medium">
              Location &amp; Hours
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <Hours hours={hours} />
              </div>
              {place.latitude && place.longitude && (
                <div className="h-full overflow-hidden rounded-3xl">
                  <PlaceMap
                    lat={Number(place.latitude)}
                    lon={Number(place.longitude)}
                    name={place.name}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="border-border border-b py-12">
            <div className="text-foreground text-2xl font-medium">
              Amenities
            </div>
            <div className="mt-6">
              <Amenities amenities={amenities} />
            </div>
          </section>

          {(() => {
            type Section = {
              id: string;
              name: string;
              position?: number | null;
            };
            type Item = {
              id: string;
              name: string;
              description?: string | null;
              price?: number | null;
              currency?: string | null;
              is_available: boolean;
              menu_item_photos?: {
                id: string;
                file_path: string;
                alt_text?: string | null;
              }[];
            };
            const m = menuData as unknown as {
              sections?: Section[];
              itemsBySection?: Map<string, Item[]>;
              ungrouped?: Item[];
            };
            const sections = m.sections ?? [];
            let itemsBySection: Map<string, Item[]>;
            if (m.itemsBySection instanceof Map) {
              itemsBySection = m.itemsBySection as Map<string, Item[]>;
            } else {
              itemsBySection = new (Map as {
                new (): Map<string, Item[]>;
              })();
            }
            const ungrouped = m.ungrouped ?? [];

            // Show menu if there are any sections or ungrouped items
            const hasMenuContent = sections.length > 0 || ungrouped.length > 0;

            return hasMenuContent ? (
              <section className="border-border border-b py-12">
                <div className="text-foreground text-2xl font-medium">Menu</div>
                <div className="mt-6">
                  <Menu
                    sections={sections}
                    itemsBySection={itemsBySection}
                    ungrouped={ungrouped}
                  />
                </div>
              </section>
            ) : null;
          })()}

          <section className="border-border border-b py-12">
            <div className="text-foreground text-2xl font-medium">
              Similar places
            </div>
            <div className="mt-6">
              <SimilarPlaces places={similar} />
            </div>
          </section>

          <section className="border-border border-b py-12" id="recent-reviews">
            <div className="text-foreground text-2xl font-medium">
              Recent reviews
            </div>
            <div className="mt-6">
              <Reviews reviews={reviewsWithReplies} />
            </div>
          </section>
        </div>

        <div className="col-span-4">
          <div className="sticky top-12">
            <BusinessQuickInfo
              place={place}
              averageRating={avg}
              reviewCount={reviews}
              isOpenNow={true} // TODO: Calculate based on current time and hours
            />
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
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolved = params instanceof Promise ? await params : params;
  const place = await getPlaceBySlugWithDetails(resolved.slug);
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
