import Image from "next/image";
import { getPlacePhotos } from "@/lib/supabase/queries";

type Photo = {
  id: string;
  file_path: string;
  alt_text?: string | null;
  created_at?: string;
};

export default async function Gallery({ placeId }: { placeId: string }) {
  const photos: Photo[] = await getPlacePhotos(placeId, 12).catch(() => []);

  if (!photos?.length) return null;
  return (
    <div className="grid grid-cols-4 gap-2">
      {photos.slice(0, 4).map((p) => (
        <div key={p.id} className="aspect-portrait relative overflow-hidden">
          <Image
            src={p.file_path}
            alt={p.alt_text || "place photo"}
            fill
            className="rounded-3xl object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority
          />
        </div>
      ))}
    </div>
  );
}
