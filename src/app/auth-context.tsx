"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type AuthContextValue = {
  user: { id: string; email?: string | null; avatarUrl?: string | null } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{
    id: string;
    email?: string | null;
    avatarUrl?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Prefer getClaims when available for faster local verification
      try {
        // @ts-expect-error: getClaims may not be in older SDKs
        const claimsResult = await (supabase.auth as any).getClaims?.();
        if (claimsResult?.data?.claims?.sub && mounted) {
          setUser({
            id: claimsResult.data.claims.sub,
            email: claimsResult.data.claims.email,
            avatarUrl:
              (claimsResult.data.claims.avatar_url as string | undefined) ??
              null,
          });
          setIsLoading(false);
          return;
        }
      } catch {}

      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(
        data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              avatarUrl: (data.user.user_metadata as any)?.avatar_url ?? null,
            }
          : null,
      );
      setIsLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(
          session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
                avatarUrl:
                  (session.user.user_metadata as any)?.avatar_url ?? null,
              }
            : null,
        );
      },
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { error: error?.message };
      },
      signUp: async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
