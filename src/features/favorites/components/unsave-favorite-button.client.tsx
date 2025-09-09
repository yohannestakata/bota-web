"use client";

import { supabase } from "@/lib/supabase/client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function UnsaveFavoriteButton({
  userId,
  branchId,
}: {
  userId: string;
  branchId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onClick() {
    startTransition(async () => {
      const { error } = await supabase
        .from("favorite_branches")
        .delete()
        .eq("user_id", userId)
        .eq("branch_id", branchId);
      if (!error) {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border hover:bg-muted w-full border px-3 py-2 disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Unsaving…" : "Unsave"}
    </button>
  );
}
