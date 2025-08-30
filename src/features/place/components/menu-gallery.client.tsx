"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import { normalizeImageSrc } from "@/lib/utils/images";
import type { MenuItemWithPhotos } from "@/lib/types/database";

export default function MenuGallery({
  items,
  currentItemIndex,
  setCurrentItemIndex,
  currentPhotoIndex,
  setCurrentPhotoIndex,
}: {
  items: MenuItemWithPhotos[];
  currentItemIndex: number;
  setCurrentItemIndex: (n: number) => void;
  currentPhotoIndex: number;
  setCurrentPhotoIndex: (n: number) => void;
}) {
  const item = items[currentItemIndex] || ({} as MenuItemWithPhotos);
  const photos = (item.menu_item_photos || []).map((p) => ({
    id: (p as { id?: string }).id || `${item.id}-${Math.random()}`,
    file_path: p.file_path,
    alt_text: (p as { alt_text?: string | null }).alt_text || item.name,
  }));
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    loop: true,
    startIndex: currentPhotoIndex,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") embla?.scrollPrev();
      if (e.key === "ArrowRight") embla?.scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embla]);

  const prevItem = () => {
    const next = (currentItemIndex - 1 + items.length) % items.length;
    setCurrentItemIndex(next);
    setCurrentPhotoIndex(0);
  };
  const nextItem = () => {
    const next = (currentItemIndex + 1) % items.length;
    setCurrentItemIndex(next);
    setCurrentPhotoIndex(0);
  };

  return (
    <div className="grid h-full grid-cols-12 gap-3 p-3 md:p-4">
      <div className="col-span-12 md:col-span-8">
        <div className="grid h-full grid-cols-12 gap-3">
          <div className="col-span-2 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  className={`relative aspect-square overflow-hidden border ${idx === currentPhotoIndex ? "ring-primary ring-2" : ""}`}
                  onClick={() => {
                    setCurrentPhotoIndex(idx);
                    embla?.scrollTo(idx);
                  }}
                >
                  <Image
                    src={normalizeImageSrc(p.file_path)}
                    alt={p.alt_text || item.name}
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
          <div className="col-span-10">
            <div className="h-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative min-w-0 shrink-0 grow-0 basis-full"
                  >
                    <div className="bg-muted relative h-full w-full">
                      <Image
                        src={normalizeImageSrc(p.file_path)}
                        alt={p.alt_text || item.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-4">
        <div className="p-2 md:p-3">
          <div className="text-lg font-semibold">{item.name}</div>
          {item.description ? (
            <p className="mt-2 text-sm whitespace-pre-wrap">
              {item.description}
            </p>
          ) : null}
          <div className="mt-2 text-sm font-medium">
            {item.price != null
              ? `${item.price.toFixed(0)} ${item.currency || "ETB"}`
              : ""}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between p-2">
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={prevItem}
          >
            Prev item
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={nextItem}
          >
            Next item
          </button>
        </div>
      </div>
    </div>
  );
}
