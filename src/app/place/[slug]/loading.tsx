export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-6">
      {/* Top bar: back + centered search */}
      <div className="relative mt-4 flex h-14 items-center justify-between">
        <div className="bg-muted h-9 w-9 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-muted h-10 w-[320px] rounded-full" />
        </div>
        <div className="h-9 w-9" />
      </div>

      {/* Title row + actions */}
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="bg-muted h-8 w-64 rounded" />
        <div className="flex items-center gap-2">
          <div className="bg-muted h-7 w-20 rounded-full" />
          <div className="bg-muted h-7 w-20 rounded-full" />
        </div>
      </div>

      {/* Gallery (streamed) */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        <div className="bg-muted aspect-[3/4] rounded-3xl" />
        <div className="bg-muted aspect-[3/4] rounded-3xl" />
        <div className="bg-muted aspect-[3/4] rounded-3xl" />
        <div className="bg-muted aspect-[3/4] rounded-3xl" />
      </div>

      {/* Main content grid */}
      <div className="mt-8 grid grid-cols-10 gap-24">
        {/* Left column */}
        <div className="col-span-10 lg:col-span-6">
          {/* Description */}
          <div className="border-border border-b pb-12">
            <div className="bg-muted h-5 w-80 rounded" />
            <div className="bg-muted mt-2 h-4 w-full rounded" />
            <div className="bg-muted mt-2 h-4 w-5/6 rounded" />
          </div>

          {/* Location & Hours (streamed) */}
          <div className="border-border border-b py-12">
            <div className="bg-muted h-6 w-40 rounded" />
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center gap-6">
                    <div className="bg-muted h-4 w-24 rounded" />
                    <div className="bg-muted h-4 w-40 rounded" />
                  </div>
                ))}
              </div>
              <div className="bg-muted h-64 rounded-3xl" />
            </div>
          </div>

          {/* Amenities (streamed) */}
          <div className="border-border border-b py-12">
            <div className="bg-muted h-6 w-32 rounded" />
            <div className="mt-6 grid grid-cols-2 gap-x-12 gap-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-muted h-6 w-6 rounded" />
                  <div className="bg-muted h-4 w-40 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Menu (streamed) */}
          <div className="border-border border-b py-12">
            <div className="bg-muted h-6 w-24 rounded" />
            <div className="mt-6 space-y-6">
              {[...Array(2)].map((_, sectionIdx) => (
                <div key={sectionIdx} className="space-y-3">
                  <div className="bg-muted h-5 w-32 rounded" />
                  <div className="grid gap-3 md:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="border-border rounded-2xl border p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-muted h-16 w-16 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <div className="bg-muted h-4 w-40 rounded" />
                            <div className="bg-muted h-3 w-56 rounded" />
                          </div>
                          <div className="bg-muted h-4 w-14 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-3">
                <div className="bg-muted h-5 w-24 rounded" />
                <div className="grid gap-3 md:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="border-border rounded-2xl border p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-muted h-16 w-16 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="bg-muted h-4 w-40 rounded" />
                          <div className="bg-muted h-3 w-56 rounded" />
                        </div>
                        <div className="bg-muted h-4 w-14 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Similar places (streamed) */}
          <div className="border-border border-b py-12">
            <div className="bg-muted h-6 w-40 rounded" />
            <div className="mt-6 grid gap-2 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="border-border rounded-3xl border px-4 py-3"
                >
                  <div className="bg-muted h-4 w-40 rounded" />
                  <div className="mt-2 flex items-center gap-2">
                    <div className="bg-muted h-3 w-24 rounded" />
                    <div className="bg-muted h-3 w-10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews (streamed) */}
          <div className="py-12">
            <div className="bg-muted h-6 w-40 rounded" />
            <div className="mt-6 space-y-10">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="bg-muted h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="bg-muted h-4 w-32 rounded" />
                        <div className="bg-muted h-4 w-16 rounded" />
                      </div>
                      <div className="bg-muted mt-2 h-3 w-20 rounded" />
                    </div>
                  </div>
                  <div className="bg-muted h-4 w-4/5 rounded" />
                  <div className="bg-muted h-4 w-2/3 rounded" />
                  <div className="mt-2 flex gap-2">
                    <div className="bg-muted h-24 w-40 rounded-xl" />
                    <div className="bg-muted h-24 w-40 rounded-xl" />
                  </div>
                  <div className="mt-2 flex gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-muted h-6 w-16 rounded-xl" />
                    ))}
                    <div className="bg-muted ml-auto h-6 w-12 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-10 lg:col-span-4">
          <div className="sticky top-12">
            <div className="border-border rounded-3xl border p-6 shadow-xl">
              <div className="mb-6 flex flex-col items-center gap-1 text-center">
                <div className="bg-muted h-10 w-20 rounded" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-muted h-4 w-4 rounded" />
                  ))}
                </div>
                <div className="bg-muted h-3 w-24 rounded" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="bg-muted h-4 w-24 rounded" />
                  <div className="bg-muted h-4 w-10 rounded" />
                </div>
                <div className="bg-muted h-3 w-28 rounded" />

                <hr className="border-border" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-4 w-4 rounded" />
                    <div className="bg-muted h-4 w-24 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-4 w-4 rounded" />
                    <div className="bg-muted h-4 w-28 rounded" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-muted mt-0.5 h-4 w-4 rounded" />
                    <div className="bg-muted h-10 w-48 rounded" />
                  </div>
                </div>

                <hr className="border-border" />

                <div className="space-y-2">
                  <div className="bg-muted h-10 w-full rounded-xl" />
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-muted h-10 w-full rounded-xl" />
                    <div className="bg-muted h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
