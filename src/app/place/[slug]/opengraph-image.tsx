import { ImageResponse } from "next/og";
import { getPlaceBySlugWithDetails } from "@/lib/supabase/queries";

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

  // Optional background image: use first available place photo if any, else a gradient
  let backgroundImage: string | undefined = undefined;
  try {
    // branches_with_details exposes photo_count but not image URLs here; rely on a generic bg
    // If you later pass a photo URL via query or enhance the query, you can swap it in
    backgroundImage = undefined;
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
          background: backgroundImage
            ? `url(${backgroundImage}) center/cover no-repeat, #0B0B0C`
            : "linear-gradient(135deg, #0B0B0C 0%, #1c1c1f 100%)",
          color: "white",
          padding: 72,
          position: "relative",
        }}
      >
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
