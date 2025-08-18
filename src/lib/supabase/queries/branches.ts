import { supabase } from "../client";

export interface Place {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
}

export interface BranchFormData {
  place_id: string;
  name: string;
  description?: string;
  phone?: string;
  website_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  price_range?: number;
  is_main_branch?: boolean;
}

export async function getPlacesForBranchSelection(): Promise<{
  data: Place[] | null;
  error: unknown;
}> {
  const { data, error } = await supabase
    .from("places")
    .select("id, name, slug, city")
    .eq("is_active", true)
    .order("name");

  return { data, error };
}

export async function addBranch(branchData: BranchFormData): Promise<{
  data: unknown;
  error: unknown;
}> {
  const { data, error } = await supabase
    .from("branches")
    .insert([branchData])
    .select()
    .single();

  return { data, error };
}

export async function getBranchesForPlace(placeId: string): Promise<{
  data: unknown[] | null;
  error: unknown;
}> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("place_id", placeId)
    .eq("is_active", true)
    .order("is_main_branch", { ascending: false })
    .order("name");

  return { data, error };
}



