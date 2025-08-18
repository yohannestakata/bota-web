import { supabase } from "../client";
import type { Profile, SearchHistoryRow } from "../client";

// Get profile by handle
export async function getProfileByHandle(
  handle: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      full_name,
      bio,
      avatar_url,
      created_at,
      updated_at
    `,
    )
    .eq("username", handle)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

// Get search history
export async function getSearchHistory(limit = 8): Promise<SearchHistoryRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("search_history")
    .select("id, user_id, query, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Save search query
export async function saveSearchQuery(queryText: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase.from("search_history").insert({
    user_id: userId,
    query: queryText,
  });

  if (error) throw error;
}

// Helper function to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getClaims();
    const sub = (data as unknown as { sub?: string })?.sub;
    if (sub) return sub;
  } catch {}
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
