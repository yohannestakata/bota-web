import { notFound } from "next/navigation";
// import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getPlaceBySlugWithDetails } from "@/lib/supabase/queries";
import Gallery from "@/features/place/components/gallery";
// Reviews list is rendered via server wrapper
import SimilarPlaces from "@/features/place/components/similar-places";
// Section is used inside feature components; not needed here
import Section from "@/features/place/components/section";
import Hours from "@/features/place/components/hours";
import Amenities from "@/features/place/components/amenities";
import Menu from "@/features/place/components/menu";
import BusinessQuickInfo from "@/features/place/components/business-quick-info";

import { PlaceJsonLd } from "./structured-data";
import {
  GallerySkeleton,
  LocationHoursSkeleton,
  AmenitiesSkeleton,
  MenuSkeleton,
  SimilarPlacesSkeleton,
  ReviewsSkeleton,
} from "@/features/place/components/skeletons";
import Reviews from "@/features/place/components/reviews";
import SearchBar from "@/components/search-bar";
import { ChevronLeftIcon, HeartIcon, Share2Icon } from "lucide-react";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

      {/* Gallery */}
      <div className="mt-6">
        <Suspense fallback={<GallerySkeleton />}>
          <Gallery placeId={place.id} />
        </Suspense>
      </div>

      {/* Main content */}
      <div className="mt-8 grid grid-cols-10 gap-24">
        <div className="col-span-6">
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
          <Section title="Reviews">
            <Suspense fallback={<ReviewsSkeleton />}>
              <Reviews placeId={place.id} />
            </Suspense>
          </Section>
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
