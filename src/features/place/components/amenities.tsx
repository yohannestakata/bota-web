import * as Icons from "lucide-react";
// Avoid async data fetching in client component; data is provided via props

interface AmenityType {
  id: number;
  name: string;
  description: string | null;
  icon_name: string | null;
}

interface Amenity {
  id: string;
  amenity_type_id: number;
  value: boolean;
  amenity_types: AmenityType[];
}

// New structure from RPC function
interface AmenityFromRPC {
  amenity_type_id: number;
  value: boolean;
  amenity: {
    id: number;
    key: string;
    name: string;
    icon_name?: string | null;
  };
}

export default function Amenities({
  amenities,
}: {
  amenities?: Amenity[] | AmenityFromRPC[];
}) {
  const amenitiesData = amenities || [];

  if (!amenitiesData.length)
    return <div className="text-muted-foreground">No amenities listed.</div>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:gap-x-12 md:gap-y-6">
        {amenitiesData.map((a, idx) => {
          // Handle both old and new structures
          let amenityInfo: AmenityType | null = null;
          let amenityId = `amenity-${idx}`;

          if ("amenity_types" in a) {
            // Old structure with amenity_types array
            amenityInfo = a.amenity_types[0];
            amenityId = a.id;
          } else if ("amenity" in a) {
            // New structure with amenity object
            amenityInfo = {
              id: a.amenity.id,
              name: a.amenity.name,
              description: null,
              icon_name: a.amenity.icon_name || null,
            };
            amenityId = `amenity-${a.amenity_type_id}-${idx}`;
          }

          if (!amenityInfo) return null;

          const iconName = (amenityInfo?.icon_name || "") as keyof typeof Icons;
          const Icon = Icons[iconName] as (props: {
            className?: string;
            strokeWidth?: number;
            size?: number;
          }) => React.JSX.Element;

          return (
            <div
              key={amenityId}
              className="border-border flex items-center gap-4"
            >
              {Icon ? (
                <Icon size={24} strokeWidth={2} />
              ) : (
                <span className="bg-foreground/60 h-1.5 w-1.5" />
              )}
              <span>{amenityInfo?.name || "Unknown amenity"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
