import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPlaceBySlugWithDetails } from "@/lib/supabase/queries";
import RequestEditForm from "@/features/place/components/request-edit-form.client";

export const dynamic = "force-dynamic";

export default async function RequestEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlugWithDetails(slug);
  if (!place) return notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-foreground font-heading text-4xl">
        Request an Edit for <span className="font-bold">{place.name}</span>
      </h1>
      <Suspense fallback={null}>
        {/* Use branch_id from details so request targets the main branch */}
        <RequestEditForm
          placeId={place.branch_id || place.id}
          placeSlug={place.slug}
        />
      </Suspense>
    </div>
  );
}
