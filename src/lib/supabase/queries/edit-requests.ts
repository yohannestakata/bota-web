import { supabase } from "../client";

// Create place edit request
export async function createPlaceEditRequest(input: {
  placeId: string;
  requestType: string;
  proposedChanges: Record<string, unknown>;
  message?: string;
  evidenceUrl?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  // For now, we'll use the place ID as the branch ID (main branch)
  // In the future, this could be enhanced to handle multiple branches
  const { data, error } = await supabase
    .from("branch_edit_requests")
    .insert({
      branch_id: input.placeId, // Using place ID as branch ID for main branch
      requester_id: userId,
      field_name: input.requestType,
      current_value: "",
      proposed_value: JSON.stringify(input.proposedChanges),
      reason: input.message || "",
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get my place edit requests
export async function getMyPlaceEditRequests(branchId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("branch_edit_requests")
    .select(
      `
      id,
      field_name,
      current_value,
      proposed_value,
      reason,
      status,
      created_at,
      updated_at
    `,
    )
    .eq("branch_id", branchId)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
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
