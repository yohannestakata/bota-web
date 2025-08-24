import { supabase } from "../client";

// Create branch edit request
export async function createPlaceEditRequest(input: {
  branchId: string;
  requestType: "correction" | "closure" | "duplicate" | "other" | string;
  proposedChanges: Record<string, unknown>;
  message?: string;
  evidenceUrl?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("branch_edit_requests")
    .insert({
      branch_id: input.branchId,
      author_id: userId,
      request_type: input.requestType,
      proposed_changes: input.proposedChanges,
      message: input.message || null,
      evidence_url: input.evidenceUrl || null,
      status: "pending",
    })
    .select("id, status, created_at")
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
      request_type,
      proposed_changes,
      message,
      evidence_url,
      status,
      created_at,
      updated_at
    `,
    )
    .eq("branch_id", branchId)
    .eq("author_id", userId)
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
