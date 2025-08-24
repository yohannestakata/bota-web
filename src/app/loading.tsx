export default function Loading() {
  return (
    <div className="">
      {/* Page-specific hero skeleton */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="mx-auto max-w-3xl">
          <div className="text-foreground/70 bg-muted mx-auto h-10 w-4/5 animate-pulse rounded md:h-16" />
          <div className="bg-muted mt-5 h-12 w-full animate-pulse rounded" />
        </div>
      </section>

      {/* Recent reviews skeleton */}
      <section className="container mx-auto mt-16 max-w-6xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-muted h-6 w-40 animate-pulse rounded" />
          <div className="bg-muted h-8 w-28 animate-pulse rounded" />
        </div>
        <div className="mt-4 grid animate-pulse gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="bg-muted h-20 w-28 rounded" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-40 rounded" />
                <div className="bg-muted h-3 w-24 rounded" />
                <div className="bg-muted h-3 w-5/6 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="container mx-auto mt-16 max-w-6xl px-4">
        <div className="bg-muted h-6 w-48 animate-pulse rounded" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-muted h-24 animate-pulse rounded" />
          ))}
        </div>
      </section>
    </div>
  );
}
