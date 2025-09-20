"use client";

import { useState } from "react";
import GalleryTabs from "./gallery-tabs";
import GalleryImages from "./gallery-images";
import { useQuery } from "@tanstack/react-query";

type Photo = {
  id: string;
  file_path: string;
  alt_text?: string | null;
  created_at?: string;
  photo_category_id?: number | null;
};

type CategoryCount = { id: number | null; name: string; count: number };

export default function Gallery({
  placeId,
  initialCategories,
  initialPhotos,
  initialActiveCategoryId = null,
}: {
  placeId: string;
  initialCategories?: CategoryCount[];
  initialPhotos?: Photo[];
  initialActiveCategoryId?: number | null;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    initialActiveCategoryId,
  );
  const { data: categoriesData } = useQuery({
    queryKey: ["photoCategories", placeId],
    queryFn: async () => {
      const res = await fetch(
        `/api/place/photo-categories?placeId=${placeId}`,
        {
          cache: "no-store",
        },
      );
      const json = (await res.json()) as {
        categories: { id: number | null; name: string; count: number }[];
      };
      return json.categories || [];
    },
    staleTime: 5 * 60_000,
    initialData: initialCategories,
  });

  return (
    <div>
      <div>
        <GalleryTabs
          placeId={placeId}
          activeCategoryId={activeCategoryId}
          setActiveCategoryId={setActiveCategoryId}
          initialCategories={categoriesData}
        />
      </div>

      <div className="-mx-4 mt-5 md:px-4">
        <GalleryImages
          placeId={placeId}
          activeCategoryId={activeCategoryId}
          initialActiveCategoryId={initialActiveCategoryId}
          initialPhotos={initialPhotos}
        />
      </div>
    </div>
  );
}
