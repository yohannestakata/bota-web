"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import GoogleButton from "@/components/ui/google-button";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const { signUp } = useAuth();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password);
    if (error) setError(error);
    setLoading(false);
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground w-full rounded-md px-4 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
      <div className="text-muted-foreground my-4 text-center text-sm">or</div>
      <GoogleButton
        text="Sign up with Google"
        onClick={async () => {
          const redirect = sp.get("redirect") || "/";
          const origin = window.location.origin;
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(
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
