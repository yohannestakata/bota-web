"use client";

import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import useEmblaCarousel from "embla-carousel-react";

type Photo = {
  id: string;
  file_path: string;
  alt_text?: string | null;
  created_at?: string;
  photo_category_id?: number | null;
};

export default function GalleryImages({
  placeId,
  activeCategoryId,
  initialActiveCategoryId = null,
  initialPhotos,
}: {
  placeId: string;
  activeCategoryId: number | null;
  initialActiveCategoryId?: number | null;
  initialPhotos?: Photo[];
}) {
  const { data: photos = [], isFetching } = useQuery({
    queryKey: ["placePhotos", placeId, activeCategoryId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("placeId", placeId);
      if (activeCategoryId != null)
        params.set("categoryId", String(activeCategoryId));
      const res = await fetch(`/api/place/photos?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as { photos: Photo[] };
      return json.photos || [];
    },
    staleTime: 60_000,
    placeholderData: (prev) => prev as Photo[] | undefined,
    ...(activeCategoryId === initialActiveCategoryId && initialPhotos
      ? { initialData: initialPhotos as Photo[] }
      : {}),
  });

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  // Build mobile carousel as individual tiles (we'll show ~2.5 tiles via width)

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  return (
    <>
      {/* Mobile: horizontal carousel, ~2.5 tiles visible */}
      <div className="md:hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="min-w-0 flex-[0_0_40%] pr-2 first:ml-4 last:mr-4"
              >
                <button
                  type="button"
                  onClick={() => openAt(idx)}
                  className="aspect-portrait bg-muted relative w-full overflow-hidden"
                  aria-label="View photo"
                >
                  <Image
                    src={normalizeImageSrc(photo.file_path)}
                    alt={photo.alt_text || "place photo"}
                    fill
                    className="object-cover"
                    sizes="40vw"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="relative hidden md:block">
        <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
          <div className="flex gap-2">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openAt(i)}
                className="relative h-64 w-48 shrink-0 overflow-hidden"
                aria-label="View photo"
              >
                <Image
                  src={normalizeImageSrc(p.file_path)}
                  alt={p.alt_text || "place photo"}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </button>
            ))}
          </div>
        </div>

        {isFetching && (
          <div className="absolute inset-0 grid animate-pulse grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted/80 aspect-[3/4]" aria-hidden />
            ))}
          </div>
        )}
      </div>

      {open ? (
        <Dialog open={open} onOpenChange={setOpen} size="6xl">
          <div className="relative h-full p-3 md:p-4">
            {photos[index] ? (
              <div className="relative h-[calc(80vh-56px)] w-full bg-black/5">
                <Image
                  src={normalizeImageSrc(photos[index].file_path)}
                  alt={photos[index].alt_text || "place photo"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            ) : null}
            <div className="absolute right-3 bottom-3 flex gap-2">
              <button
                type="button"
                className="rounded border bg-white/90 px-3 py-1 text-sm"
                onClick={() =>
                  setIndex((i) => (i - 1 + photos.length) % photos.length)
                }
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded border bg-white/90 px-3 py-1 text-sm"
                onClick={() => setIndex((i) => (i + 1) % photos.length)}
              >
                Next
              </button>
            </div>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}
