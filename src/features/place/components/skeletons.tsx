export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="bg-muted aspect-[3/4]" />
      <div className="bg-muted aspect-[3/4]" />
      <div className="bg-muted aspect-[3/4]" />
      <div className="bg-muted aspect-[3/4]" />
    </div>
  );
}

export function LocationHoursSkeleton() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-6">
            <div className="bg-muted h-4 w-24" />
            <div className="bg-muted h-4 w-40" />
          </div>
        ))}
      </div>
      <div className="bg-muted h-64" />
    </div>
  );
}

export function AmenitiesSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-12 gap-y-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="bg-muted h-6 w-6" />
          <div className="bg-muted h-4 w-40" />
        </div>
      ))}
    </div>
  );
}

export function MenuSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      {[...Array(2)].map((_, sectionIdx) => (
        <div key={sectionIdx} className="space-y-3">
          <div className="bg-muted h-5 w-32" />
          <div className="grid gap-3 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border-border border p-3">
                <div className="flex items-start gap-3">
                  <div className="bg-muted h-16 w-16" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted h-4 w-40" />
                    <div className="bg-muted h-3 w-56" />
                  </div>
                  <div className="bg-muted h-4 w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Ungrouped */}
      <div className="space-y-3">
        <div className="bg-muted h-5 w-24 rounded" />
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border-border border p-3">
              <div className="flex items-start gap-3">
                <div className="bg-muted h-16 w-16" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-40" />
                  <div className="bg-muted h-3 w-56" />
                </div>
                <div className="bg-muted h-4 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SimilarPlacesSkeleton() {
  return (
    <div className="mt-6 grid gap-2 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border-border border px-4 py-3">
          <div className="bg-muted h-4 w-40" />
          <div className="mt-2 flex items-center gap-2">
            <div className="bg-muted h-3 w-24" />
            <div className="bg-muted h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="mt-6 space-y-10">
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="bg-muted h-12 w-12" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="bg-muted h-4 w-32" />
                <div className="bg-muted h-4 w-16" />
              </div>
              <div className="bg-muted mt-2 h-3 w-20" />
            </div>
          </div>
          <div className="bg-muted h-4 w-4/5" />
          <div className="bg-muted h-4 w-2/3" />
          <div className="mt-2 flex gap-2">
            <div className="bg-muted h-24 w-40" />
            <div className="bg-muted h-24 w-40" />
          </div>
          <div className="mt-2 flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted h-6 w-16" />
            ))}
            <div className="bg-muted ml-auto h-6 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
