"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthCodeRedirect() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);

      // Case 1: Password recovery hash params (Supabase uses hash with access_token, refresh_token, type=recovery)
      if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
        const type = hashParams.get("type");
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (type === "recovery") {
          // Send to reset-password and keep the hash so the page can set the session
          const resetUrl = new URL("/auth/reset-password", url.origin);
          resetUrl.hash = url.hash;
          window.location.replace(resetUrl.toString());
          return;
        }

        // Case 1b: Email verification with session tokens in hash
        if (access_token && refresh_token && !type) {
          // Set the session directly from the hash tokens
          supabase.auth
            .setSession({ access_token, refresh_token })
            .then(({ error }) => {
              if (error) {
                console.error("Failed to set session from hash:", error);
              } else {
                console.log("Session established from email verification");
                // Clean up the URL by removing the hash
                const cleanUrl = new URL(url.toString());
                cleanUrl.hash = "";
                window.history.replaceState({}, "", cleanUrl.toString());
              }
            });
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
