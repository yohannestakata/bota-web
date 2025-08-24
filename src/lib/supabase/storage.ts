import { supabase } from "./client";

export function getPublicUrlFromDbPath(dbPath: string): string {
  // dbPath expected like: images/avatars/<userId>/filename.jpg
  if (/^https?:\/\//i.test(dbPath)) return dbPath;
  const trimmed = dbPath.replace(/^\/+/, "");
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return `/${trimmed}`;
  return `${base}/storage/v1/object/public/${trimmed}`;
}

export async function uploadImageToBucket(params: {
  bucket: string; // typically 'images'
  objectPathWithinBucket: string; // e.g., avatars/<userId>/filename
  file: File | Blob;
  contentType?: string;
  upsert?: boolean;
}): Promise<{ dbPath: string; publicUrl: string }> {
  const { bucket, objectPathWithinBucket, file, contentType, upsert } = params;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(objectPathWithinBucket, file, {
      cacheControl: "3600",
      upsert: upsert ?? true,
      contentType: contentType,
    });
  if (error) throw error;
  const dbPath = `${bucket}/${data.path}`; // store bucket-prefixed path in DB
  const publicUrl = getPublicUrlFromDbPath(dbPath);
  return { dbPath, publicUrl };
}
