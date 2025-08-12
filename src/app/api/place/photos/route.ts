import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  const categoryId = searchParams.get("categoryId");

  if (!placeId) {
    return new Response(JSON.stringify({ error: "placeId is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  let query = supabase
    .from("place_photos")
    .select("id, file_path, alt_text, created_at, photo_category_id")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (categoryId) {
    query = query.eq("photo_category_id", Number(categoryId));
  }

  const { data, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ photos: data || [] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
