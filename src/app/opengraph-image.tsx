import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const title = "Bota Review";
  const subtitle = "Discover the best places in Ethiopia";
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
          background: "#0B0B0C",
          color: "white",
          padding: 72,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, textAlign: "center" }}>
          {title}
        </div>
        <div style={{ fontSize: 28, marginTop: 20, opacity: 0.9 }}>
          {subtitle}
        </div>
        <div
          style={{ position: "absolute", bottom: 40, right: 60, fontSize: 24 }}
        >
          botareview.com
        </div>
      </div>
    ),
    size,
  );
}

