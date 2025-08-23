import { Suspense } from "react";
import CategoriesList from "./categories-list";

export default function CategoriesSection() {
  return (
    <section className="container mx-auto mt-16 mb-16 max-w-6xl px-4">
      <h2 className="text-foreground text-xl font-bold">Browse by category</h2>
      <Suspense
        fallback={
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-gray-200" />
            ))}
          </div>
        }
      >
        <CategoriesList />
      </Suspense>
    </section>
  );
}
