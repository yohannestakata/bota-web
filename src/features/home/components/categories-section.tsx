import { Suspense } from "react";
import CategoriesList from "./categories-list";

export default function CategoriesSection() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-foreground text-2xl font-semibold">
        Explore by Category
      </h2>
      <Suspense
        fallback={
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-3xl bg-gray-200"
              />
            ))}
          </div>
        }
      >
        <CategoriesList />
      </Suspense>
    </section>
  );
}
