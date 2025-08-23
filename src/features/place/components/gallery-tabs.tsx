"use client";

import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

type CategoryCount = { id: number | null; name: string; count: number };
type Photo = { id: string; file_path: string; alt_text?: string | null };

export default function GalleryTabs({
  placeId,
  activeCategoryId,
  setActiveCategoryId,
  initialCategories,
}: {
  placeId: string;
  activeCategoryId: number | null;
  setActiveCategoryId: (id: number | null) => void;
  initialCategories?: CategoryCount[];
}) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery({
    queryKey: ["photoCategories", placeId],
    queryFn: async () => {
      const res = await fetch(
        `/api/place/photo-categories?placeId=${placeId}`,
        {
          cache: "no-store",
        },
      );
      const json = (await res.json()) as { categories: CategoryCount[] };
      return json.categories || [];
    },
    staleTime: 5 * 60_000,
    initialData: initialCategories,
  });

  const total = useMemo(
    () => categories.reduce((sum, c) => sum + c.count, 0),
    [categories],
  );
  const tabs = useMemo(
    () => [{ id: null, name: `All (${total})` }, ...categories],
    [categories, total],
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-6">
        {tabs.map((t) => {
          const isActive = activeCategoryId === t.id;
          return (
            <button
              key={t.id ?? -1}
              type="button"
              onClick={() => setActiveCategoryId(t.id ?? null)}
              onMouseEnter={() => {
                const key = ["placePhotos", placeId, t.id ?? null] as const;
                void queryClient.prefetchQuery({
                  queryKey: key,
                  queryFn: async () => {
                    const params = new URLSearchParams();
                    params.set("placeId", placeId);
                    if (t.id != null) params.set("categoryId", String(t.id));
                    const res = await fetch(
                      `/api/place/photos?${params.toString()}`,
                      {
                        cache: "no-store",
                      },
                    );
                    const json = (await res.json()) as { photos: Photo[] };
                    return json.photos || [];
                  },
                  staleTime: 60_000,
                });
              }}
              className={`relative pb-1 transition-colors ${
                isActive ? "font-semibold" : "font-normal"
              }`}
            >
              {t.name}
              {isActive ? (
                <motion.div
                  layoutId="gallery-underline"
                  className="bg-foreground absolute right-0 -bottom-px left-0 h-0.5"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
