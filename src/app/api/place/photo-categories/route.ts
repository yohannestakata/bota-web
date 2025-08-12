import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  if (!placeId) {
    return new Response(JSON.stringify({ error: "placeId is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("place_photos")
    .select("photo_category_id, photo_categories(name)")
    .eq("place_id", placeId);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const rows = (data || []) as Array<{
    photo_category_id: number | null;
    photo_categories?: { name: string } | { name: string }[] | null;
  }>;
  const counts = new Map<
    number | null,
    { id: number | null; name: string; count: number }
  >();
  for (const row of rows) {
    const id = row.photo_category_id;
    const cat = row.photo_categories;
    const catName = Array.isArray(cat) ? cat[0]?.name : cat?.name;
    const resolvedName = catName ?? (id == null ? "Uncategorized" : "Category");
    const existing = counts.get(id) || { id, name: resolvedName, count: 0 };
    counts.set(id, { id, name: existing.name, count: existing.count + 1 });
  }

  return new Response(
    JSON.stringify({
      categories: Array.from(counts.values()).sort((a, b) => b.count - a.count),
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
