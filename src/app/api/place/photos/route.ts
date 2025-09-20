import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  const categoryId = searchParams.get("categoryId");

  console.log("[API/photos] params", { placeId, categoryId });

  if (!placeId) {
    return new Response(JSON.stringify({ error: "placeId is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const cookieStore = cookies();
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
          set() {
            /* noop */
          },
          remove() {
            /* noop */
          },
        },
      },
    );

  let query = supabase
    .from("branch_photos")
    .select(
      "id, file_path, alt_text, created_at, photo_category_id, branches!inner(place_id)",
    )
    .eq("branches.place_id", placeId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (categoryId) {
    query = query.eq("photo_category_id", Number(categoryId));
  }

  const { data, error } = await query;
  if (error) {
    console.error("[API/photos] query error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
  console.log("[API/photos] rows", data?.length || 0);
  return new Response(JSON.stringify({ photos: data || [] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
