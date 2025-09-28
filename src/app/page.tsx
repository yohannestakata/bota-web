import { CategoriesSection } from "@/features/home";
import MessageToast from "@/components/ui/message-toast.client";
import RecentReviews from "@/features/home/components/recent-reviews";
import SearchBar from "@/components/search-bar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    lat?: string;
    lon?: string;
    message?: string;
  }>;
}) {
  const { filter, lat, lon, message } = await searchParams;
  return (
    <div className="">
      <MessageToast serverMessage={message} />
      {/* Page-specific hero */}
      <section className="mx-auto mt-12 max-w-6xl px-4 md:mt-16">
        <h1 className="font-heading text-center text-5xl font-bold text-balance md:text-6xl">
          Discover the best places
        </h1>
        <div className="mx-auto mt-5 w-full max-w-3xl">
          <SearchBar size="large" />
        </div>
      </section>
      <RecentReviews
        filter={filter}
        lat={lat ? Number(lat) : undefined}
        lon={lon ? Number(lon) : undefined}
      />
      <CategoriesSection />
    </div>
  );
}

// Revalidate this route every hour to align with featured view refresh cadence
export const revalidate = 3600;

export const metadata = {
  title: "Best restaurants, cafes, and places to shop in Ethiopia",
  description:
    "Find the best places to dine and shop in Ethiopia. Browse restaurants, cafes, and more with reviews, ratings, photos, and menus.",
  alternates: { canonical: "/" },
  keywords: [
    "Ethiopia",
    "Addis Ababa",
    "best restaurants",
    "best cafes",
    "best places to dine",
    "shopping",
    "reviews",
  ],
  openGraph: {
    title: "Best restaurants, cafes, and places to shop in Ethiopia",
    description:
      "Discover top places across Ethiopia with photos, menus, and real reviews.",
    url: "/",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best restaurants, cafes, and places to shop in Ethiopia",
    description:
      "Discover top places across Ethiopia with photos, menus, and real reviews.",
    images: ["/opengraph-image"],
  },
} satisfies import("next").Metadata;
