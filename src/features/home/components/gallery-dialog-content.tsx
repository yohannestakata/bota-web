"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import { normalizeImageSrc } from "@/lib/utils/images";

export interface GalleryPhoto {
  id: string;
  file_path: string;
  alt_text?: string;
}

export default function GalleryDialogContent({
  photos,
  place,
  startIndex = 0,
}: {
  photos: GalleryPhoto[];
  place: string;
  startIndex?: number;
}) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    startIndex,
    loop: true,
  });

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        embla?.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        embla?.scrollNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embla]);
  return (
    <div className="grid h-full grid-cols-12 gap-3 p-3 md:p-4">
      <div className="col-span-12 h-full md:col-span-9">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {photos.map((p) => (
              <div
                key={p.id}
                className="relative aspect-video min-w-0 shrink-0 grow-0 basis-full"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={normalizeImageSrc(p.file_path)}
                    alt={p.alt_text || place}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="bg-muted object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-12 overflow-y-scroll md:col-span-3">
        <div className="grid grid-cols-5 gap-1 md:grid-cols-2">
          {photos.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              className="border-border relative aspect-square overflow-hidden border"
              onClick={() => embla?.scrollTo(idx)}
              aria-label={`Go to image ${idx + 1}`}
            >
              <Image
                src={normalizeImageSrc(p.file_path)}
                alt={p.alt_text || place}
                fill
                sizes="96px"
                loading="lazy"
                decoding="async"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
