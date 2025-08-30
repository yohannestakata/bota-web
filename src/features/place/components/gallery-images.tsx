"use client";

import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";

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

  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openAt(i)}
              className="aspect-portrait relative overflow-hidden"
              aria-label="View photo"
            >
              <Image
                src={normalizeImageSrc(p.file_path)}
                alt={p.alt_text || "place photo"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </button>
          ))}
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
