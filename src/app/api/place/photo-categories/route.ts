import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  console.log("[API/photo-categories] params", { placeId });
  if (!placeId) {
    return new Response(JSON.stringify({ error: "placeId is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const cookieStore = await cookies();
  const supabase =
    supabaseAdmin ||
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      },
    );

  const { data, error } = await supabase
    .from("branch_photos")
    .select(
      "photo_category_id, photo_categories(name), branches!inner(place_id)",
    )
    .eq("branches.place_id", placeId);
  if (error) {
    console.error("[API/photo-categories] query error", error);
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
