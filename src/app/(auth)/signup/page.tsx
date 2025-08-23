"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import GoogleButton from "@/components/ui/google-button";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { getFriendlyAuthErrorMessage } from "@/lib/errors/auth";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const sp = useSearchParams();
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { captchaToken },
    });
    // Reset captcha after attempt
    try {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(undefined);
    } catch {}
    if (error) setError(getFriendlyAuthErrorMessage(error));
    setLoading(false);
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-3xl font-semibold">Create your account</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Join Bota in a few quick steps.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-input bg-background focus:ring-ring w-full border px-3 py-2 focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-input bg-background focus:ring-ring w-full border px-3 py-2 focus:outline-none"
          />
        </div>
        <div>
          <HCaptcha
            ref={captchaRef}
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
            onVerify={(token) => setCaptchaToken(token)}
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground w-full px-4 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Creating your account…" : "Sign up"}
        </button>
      </form>
      <div className="text-muted-foreground my-4 text-center text-sm">or</div>
      <GoogleButton
        text="Sign up with Google"
        onClick={async () => {
          const redirect = sp.get("redirect") || "/";
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(
                redirect,
              )}`,
            },
          });
        }}
      />
      <p className="text-muted-foreground mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
