import { supabase } from "../client";
import type { CuisineType } from "../client";

// Get all cuisine types
export async function getCuisineTypes(): Promise<CuisineType[]> {
  const { data, error } = await supabase
    .from("cuisine_types")
    .select("id, name, description, created_at")
    .order("name");

  if (error) throw error;
  return data || [];
}
