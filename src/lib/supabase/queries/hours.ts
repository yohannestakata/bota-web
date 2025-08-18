import { supabase } from "../client";

// Get place hours
export async function getPlaceHours(placeId: string) {
  const { data, error } = await supabase
    .from("branch_hours")
    .select("*")
    .eq("branch_id", placeId)
    .order("day_of_week");

  if (error) throw error;
  return data || [];
}
