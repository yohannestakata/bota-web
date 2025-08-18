import { supabase } from "../client";

// Get place amenities
export async function getPlaceAmenities(placeId: string) {
  const { data, error } = await supabase
    .from("branch_amenities")
    .select(
      `
      id,
      amenity_type_id,
      value,
      amenity_types(
        id,
        name,
        description,
        icon_name
      )
    `,
    )
    .eq("branch_id", placeId)
    .order("amenity_types(name)");

  if (error) throw error;
  return data || [];
}
