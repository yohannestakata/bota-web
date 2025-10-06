"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import GoogleButton from "@/components/ui/google-button";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRouter } from "next/navigation";
import { getFriendlyAuthErrorMessage } from "@/lib/errors/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const captchaRef = useRef<HCaptcha | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!captchaToken) {
      setError("Please complete the CAPTCHA challenge.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });
    try {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(undefined);
    } catch {}
    if (error) setError(getFriendlyAuthErrorMessage(error));
    else {
      const dest = sp.get("redirect") || "/";
      router.replace(dest);
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-3xl font-semibold">Welcome back</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Sign in to pick up where you left off.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-input bg-background focus:ring-ring w-full border px-3 py-2 focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-input bg-background focus:ring-ring w-full border px-3 py-2 focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <div className="w-full">
            <HCaptcha
              ref={captchaRef}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(undefined)}
              onError={() => setCaptchaToken(undefined)}
            />
          </div>
          {!captchaToken && (
            <p className="text-muted-foreground mt-2 text-xs">
              Complete the CAPTCHA to continue.
            </p>
          )}
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !captchaToken}
          className="bg-primary text-primary-foreground w-full px-4 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing you in…" : "Sign in"}
        </button>
      </form>
      <div className="text-muted-foreground my-4 text-center text-sm">or</div>
      <GoogleButton
        onClick={async () => {
          const redirect = sp.get("redirect") || "/";
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              scopes: "openid email profile",
              redirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(
                redirect,
              )}`,
            },
          });
        }}
      />
      <p className="text-muted-foreground mt-4 text-sm">
        New here?{" "}
        <Link href="/signup" className="underline">
          Create an account
        </Link>
        <span className="mx-2">·</span>
        <Link href="/auth/forgot-password" className="underline">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}
