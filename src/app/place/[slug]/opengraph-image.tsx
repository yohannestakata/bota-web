import { ImageResponse } from "next/og";
import { getPlaceBySlugWithDetails } from "@/lib/supabase/queries";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlugWithDetails(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";
  const title =
    place?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const subtitle = place?.city
    ? `${place.city}${place.state ? ", " + place.state : ""}`
    : "Reviews, photos, menu & hours";

  // Optional background image: use most recent branch photo if available
  let backgroundImage: string | undefined = undefined;
  try {
    if (place?.branch_id) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: photo } = await supabase
        .from("branch_photos")
        .select("file_path")
        .eq("branch_id", place.branch_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const filePath = (photo as { file_path?: string } | null)?.file_path;
      if (filePath) {
        if (/^https?:\/\//i.test(filePath)) {
          backgroundImage = filePath;
        } else if (filePath.startsWith("/")) {
          backgroundImage = `${baseUrl}${filePath}`;
        } else {
          const trimmed = filePath.replace(/^\/+/, "");
          backgroundImage = `${baseUrl}/public-images/${trimmed}`;
        }
      }
    }
  } catch {}
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0B0B0C 0%, #1c1c1f 100%)",
          color: "white",
          padding: 72,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {backgroundImage ? (
          <img
            src={backgroundImage}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.7)",
            }}
          />
        ) : null}
        {/* Overlay to improve text contrast on busy photos */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%)",
          }}
        />
        <div style={{ fontSize: 64, fontWeight: 700, textAlign: "center" }}>
          {title}
        </div>
        <div style={{ fontSize: 28, marginTop: 20, opacity: 0.9 }}>
          {subtitle}
        </div>
        <div
          style={{ position: "absolute", bottom: 40, right: 60, fontSize: 24 }}
        >
          {new URL(baseUrl).host}
        </div>
      </div>
    ),
    size,
  );
}
