import * as Icons from "lucide-react";
import { getPlaceAmenities } from "@/lib/supabase/queries";

interface Amenity {
  amenity?: {
    id: number;
    key: string;
    name: string;
    icon_name?: string | null;
  };
  value: boolean;
}

export default async function Amenities({ placeId }: { placeId: string }) {
  const amenities: Amenity[] = await getPlaceAmenities(placeId).catch(() => []);

  if (!amenities.length)
    return <div className="text-muted-foreground">No amenities listed.</div>;
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        {amenities.map((a, idx) => (
          <div
            key={`${a.amenity?.key}-${idx}`}
            className="border-border flex items-center gap-4"
          >
            {(() => {
              const iconName = (a.amenity?.icon_name ||
                "") as keyof typeof Icons;
              const Icon = Icons[iconName] as (props: {
                className?: string;
                strokeWidth?: number;
                size?: number;
              }) => React.JSX.Element;
              return Icon ? (
                <Icon size={24} strokeWidth={2} />
              ) : (
                <span className="bg-foreground/60 h-1.5 w-1.5 rounded-full" />
              );
            })()}
            <span>{a.amenity?.name || a.amenity?.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
