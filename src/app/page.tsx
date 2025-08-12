import { CategoriesSection, RecentReviews } from "@/features/home";
import SearchBar from "@/components/search-bar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; lat?: string; lon?: string }>;
}) {
  const { filter, lat, lon } = await searchParams;
  return (
    <div className="">
      {/* Page-specific hero */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <h1 className="font-heading text-center text-4xl font-semibold tracking-tight md:text-6xl">
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
