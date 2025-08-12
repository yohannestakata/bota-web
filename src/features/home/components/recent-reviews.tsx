import { Suspense } from "react";
import RecentReviewsList from "./recent-reviews-list";
import FilterMenu from "./filter-menu";

export default function RecentReviews({
  filter,
  lat,
  lon,
}: {
  filter?: string;
  lat?: number;
  lon?: number;
}) {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-foreground text-2xl font-semibold">
          Recent Reviews
        </h2>
        <div>
          <FilterMenu active={filter} />
        </div>
      </div>
      <Suspense
        key={filter ?? "popular"}
        fallback={
          <div className="mt-4 grid animate-pulse gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="bg-muted h-20 w-28 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-40 rounded" />
                  <div className="bg-muted h-3 w-24 rounded" />
                  <div className="bg-muted h-3 w-5/6 rounded" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <RecentReviewsList filter={filter} lat={lat} lon={lon} />
      </Suspense>
    </section>
  );
}
