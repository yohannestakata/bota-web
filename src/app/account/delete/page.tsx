"use client";

import { useEffect, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<HCaptcha | null>(null);

  useEffect(() => {
    // ensure authenticated
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.replace("/login?redirect=/account/delete");
    })();
  }, [router]);

  async function onDelete() {
    if (!captchaToken) return;
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const access = session.session?.access_token;
      if (!access) throw new Error("Not authenticated");
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok) {
        let message = "Failed to delete account";
        try {
          const j = (await res.json()) as { error?: string };
          if (j && typeof j.error === "string") message = j.error;
        } catch {}
        throw new Error(message);
      }
      // Sign out locally and redirect home
      await supabase.auth.signOut();
      router.replace("/");
    } catch (e) {
      // reset captcha to allow retry
      try {
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(undefined);
      } catch {}
      alert(e instanceof Error ? e.message : "Failed to delete account");
    } finally {
      setLoading(false);
    }
  }

  const disabled = confirm !== "DELETE" || !captchaToken || loading;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Delete account</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        This action is permanent and cannot be undone. All your data will be
        deleted. Type <span className="font-semibold">DELETE</span> to confirm.
      </p>
      <div className="space-y-4">
        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="border-input bg-background focus:ring-ring w-full border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
        <HCaptcha
          ref={captchaRef}
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(undefined)}
          onError={() => setCaptchaToken(undefined)}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="bg-destructive text-destructive-foreground w-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </div>
  );
}
