"use client";

import { useState } from "react";
import ConfirmDialog from "./confirm-dialog";
import { useRouter } from "next/navigation";

export default function AuthGateDialog({
  open,
  onOpenChange,
  title = "Sign in to continue",
  description = "You need an account to do that.",
  redirectTo,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title?: string;
  description?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const target =
    redirectTo ||
    (typeof window !== "undefined" ? window.location.pathname : "/");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText="Sign in / Sign up"
      cancelText="Not now"
      onConfirm={() => {
        setBusy(true);
        router.push(`/login?redirect=${encodeURIComponent(target)}`);
      }}
      confirmLoading={busy}
    />
  );
}
