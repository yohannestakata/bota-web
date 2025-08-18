import { supabase } from "../client";
import type { Category } from "../client";

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon_name, created_at")
    .order("name");

  if (error) throw error;
  return data || [];
}

// Get all categories (alias for getCategories)
export async function getAllCategories(): Promise<Category[]> {
  return getCategories();
}
