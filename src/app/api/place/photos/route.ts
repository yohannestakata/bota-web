import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
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

  const cookieStore = await cookies();
  const supabase: SupabaseClient =
    (supabaseAdmin as SupabaseClient | null) ||
    (createServerClient(
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
    ) as unknown as SupabaseClient);

  // Special case: categoryId = -1 means "Reviews" tab; return review photos
  if (categoryId && Number(categoryId) === -1) {
    // Get all branch ids for the place
    const { data: branches, error: branchesErr } = await supabase
      .from("branches")
      .select("id")
      .eq("place_id", placeId);
    if (branchesErr) {
      console.error("[API/photos] branches error", branchesErr);
      return new Response(JSON.stringify({ error: branchesErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
    const branchIds = (branches || []).map((b: { id: string }) => b.id);
    if (branchIds.length === 0) {
      return new Response(JSON.stringify({ photos: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const { data: rphotos, error: rperr } = await supabase
      .from("review_photos")
      .select(
        "id, file_path, alt_text, created_at, is_active, reviews!inner(branch_id)",
      )
      .in("reviews.branch_id", branchIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(12);
    if (rperr) {
      console.error("[API/photos] review_photos error", rperr);
      return new Response(JSON.stringify({ error: rperr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ photos: rphotos || [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  // Default: branch photos (optionally filtered by photo_category_id)
  let query = supabase
    .from("branch_photos")
    .select(
      "id, file_path, alt_text, created_at, is_active, photo_category_id, branches!inner(place_id)",
    )
    .eq("branches.place_id", placeId)
    .eq("is_active", true)
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
