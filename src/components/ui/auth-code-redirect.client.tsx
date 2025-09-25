"use client";

import { useEffect } from "react";

export default function AuthCodeRedirect() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);

      // Case 1: Password recovery hash params (Supabase uses hash with access_token, refresh_token, type=recovery)
      if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
        const type = hashParams.get("type");
        if (type === "recovery") {
          // Send to reset-password and keep the hash so the page can set the session
          const resetUrl = new URL("/auth/reset-password", url.origin);
          resetUrl.hash = url.hash;
          window.location.replace(resetUrl.toString());
          return;
        }
      }

      // Case 2: Code-based auth callback (email change confirm, magic link when using code query)
      const code = url.searchParams.get("code");
      if (!code) return;

      // Build redirect back to current location without the code param
      const redirectUrl = new URL(url.toString());
      redirectUrl.searchParams.delete("code");
      const redirect =
        redirectUrl.pathname +
        (redirectUrl.search || "") +
        (redirectUrl.hash || "");

      const callbackUrl = new URL("/auth/callback", url.origin);
      callbackUrl.searchParams.set("code", code);
      callbackUrl.searchParams.set("redirect", redirect || "/");

      // Use replace to avoid extra history entry
      window.location.replace(callbackUrl.toString());
    } catch {
      // no-op
    }
  }, []);

  return null;
}
