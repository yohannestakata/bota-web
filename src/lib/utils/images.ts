// Lightweight public URL builder for Supabase Storage (via Next.js rewrite)
function buildSupabasePublicUrl(path: string): string {
  const trimmed = path.replace(/^\/+/, "");
  // If already absolute (signed URL etc.), return as-is
  if (/^https?:\/\//i.test(path)) return path;
  // Route through Next.js rewrite to avoid hardcoding Supabase host
  return `/public-images/${trimmed}`;
}

/**
 * Normalize any stored image path into a URL that next/image accepts.
 * - Absolute URLs are returned as-is
 * - Rooted paths (starting with "/") are returned as-is
 * - Other strings are treated as Cloudinary public IDs
 */
export function normalizeImageSrc(input: string | null | undefined): string {
  const src = (input || "").trim();
  if (!src) return "";
  if (src.startsWith("placeholder/") || src.startsWith("/placeholder/")) {
    // Pending uploads placeholder: use a local fallback icon from public/
    return "/file.svg";
  }
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src;
  // Treat remaining values as Storage object paths relative to public bucket
  return buildSupabasePublicUrl(src);
}
