"use client";

import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      const url = `/api/place/photos?${params.toString()}`;
      try {
        console.log("[GalleryImages] fetching", {
          placeId,
          activeCategoryId,
          url,
        });
        const res = await fetch(url, {
          cache: "no-store",
        });
        console.log("[GalleryImages] response", res.status, res.ok);
        const json = (await res.json()) as { photos: Photo[] };
        console.log(
          "[GalleryImages] photos received",
          json?.photos?.length || 0,
        );
        return json.photos || [];
      } catch (e) {
        console.error("[GalleryImages] fetch error", e);
        return [];
      }
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
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

  // Fallback to initial SSR-provided photos when client fetch fails or is blocked
  const fallbackPhotos = useMemo(() => {
    const list = (initialPhotos || []) as Photo[];
    if (activeCategoryId == null) return list;
    return list.filter(
      (p: Photo) =>
        (p.photo_category_id ?? null) === (activeCategoryId ?? null),
    );
  }, [initialPhotos, activeCategoryId]);

  const displayedPhotos = photos && photos.length > 0 ? photos : fallbackPhotos;

  // Debug mount & state changes
  useEffect(() => {
    console.log("[GalleryImages] mount", {
      placeId,
      initialActiveCategoryId,
      initialPhotosCount: (initialPhotos || []).length,
    });
  }, [placeId, initialActiveCategoryId, initialPhotos]);
  useEffect(() => {
    console.log("[GalleryImages] state", {
      activeCategoryId,
      photosCount: photos.length,
      isFetching,
    });
  }, [activeCategoryId, photos, isFetching]);

  // Build mobile carousel as individual tiles (we'll show ~2.5 tiles via width)
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  // Desktop carousel instance
  const [emblaDesktopRef, emblaDesktop] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: true,
  });

  // Autoplay controls for desktop
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const AUTOPLAY_INTERVAL_MS = 3000;
  const AUTOPLAY_RESUME_DELAY_MS = 6000;

  const stopAutoplay = () => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  };
  const startAutoplay = () => {
    stopAutoplay();
    if (!emblaDesktop) return;
    if (!photos || photos.length <= 1) return;
    autoplayIntervalRef.current = setInterval(() => {
      emblaDesktop?.scrollNext();
    }, AUTOPLAY_INTERVAL_MS);
  };
  const pauseThenResume = () => {
    stopAutoplay();
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    resumeTimeoutRef.current = setTimeout(() => {
      startAutoplay();
    }, AUTOPLAY_RESUME_DELAY_MS);
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      stopAutoplay();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaDesktop, photos?.length]);

  return (
    <>
      {/* Mobile: horizontal carousel, ~2.5 tiles visible */}
      <div className="md:hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {displayedPhotos.map((photo: Photo, idx: number) => (
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

      {/* Desktop: carousel with arrow controls */}
      <div className="relative hidden md:block">
        <div className="-mx-1 px-1">
          <div className="overflow-hidden" ref={emblaDesktopRef}>
            <div className="flex gap-2">
              {displayedPhotos.map((p: Photo, i: number) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openAt(i)}
                  className="relative aspect-[3/4] w-full flex-[0_0_calc((100%_-_0.5rem*2)/3)] shrink-0 overflow-hidden"
                  aria-label="View photo"
                >
                  <Image
                    src={normalizeImageSrc(p.file_path)}
                    alt={p.alt_text || "place photo"}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 200px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            className="border-border hover:bg-muted flex items-center gap-2 rounded border px-3 py-1.5 text-sm"
            onClick={() => {
              pauseThenResume();
              console.log("[GalleryImages] arrow prev click");
              emblaDesktop?.scrollPrev();
            }}
            aria-label="Previous photos"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <button
            type="button"
            className="border-border hover:bg-muted flex items-center gap-2 rounded border px-3 py-1.5 text-sm"
            onClick={() => {
              pauseThenResume();
              console.log("[GalleryImages] arrow next click");
              emblaDesktop?.scrollNext();
            }}
            aria-label="Next photos"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        {isFetching &&
        (!photos || photos.length === 0) &&
        displayedPhotos.length === 0 ? (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/80 aspect-[3/4] animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        ) : null}
      </div>

      {open ? (
        <Dialog open={open} onOpenChange={setOpen} size="6xl">
          <div className="relative h-full p-3 md:p-4">
            {displayedPhotos[index] ? (
              <div className="relative h-[calc(80vh-56px)] w-full bg-black/5">
                <Image
                  src={normalizeImageSrc(displayedPhotos[index].file_path)}
                  alt={displayedPhotos[index].alt_text || "place photo"}
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
                  setIndex(
                    (i) =>
                      (i - 1 + displayedPhotos.length) % displayedPhotos.length,
                  )
                }
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded border bg-white/90 px-3 py-1 text-sm"
                onClick={() =>
                  setIndex((i) => (i + 1) % displayedPhotos.length)
                }
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
