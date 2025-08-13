"use client";

import Image from "next/image";
import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 3).map((p) => (
          <div key={p.id} className="aspect-portrait relative overflow-hidden">
            <Image
              src={buildCloudinaryUrl(p.file_path, { w: 600, crop: "fill" })}
              alt={p.alt_text || "place photo"}
              fill
              className="rounded-3xl object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>

      {isFetching && (
        <div className="absolute inset-0 grid animate-pulse grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/80 aspect-[3/4] rounded-3xl"
              aria-hidden
            />
          ))}
        </div>
      )}
    </div>
  );
}
