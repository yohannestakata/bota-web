import { Suspense } from "react";
import RecentReviewsList from "./recent-reviews-list";

export default function RecentReviews() {
  return (
    <section className="container mx-auto px-24 py-8">
      <h2 className="text-foreground text-2xl font-medium">Recent Reviews</h2>
      <Suspense
        fallback={
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        }
      >
        <RecentReviewsList />
      </Suspense>
    </section>
  );
}
