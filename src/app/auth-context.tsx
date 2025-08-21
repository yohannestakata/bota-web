"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getFriendlyAuthErrorMessage } from "@/lib/errors/auth";
import { usePostHog } from "posthog-js/react";

type AuthContextValue = {
  user: { id: string; email?: string | null; avatarUrl?: string | null } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  setAvatarUrl: (url: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{
    id: string;
    email?: string | null;
    avatarUrl?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const posthog = usePostHog();

  const fetchProfileAvatar = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (data?.avatar_url) {
        setUser((prev) =>
          prev ? { ...prev, avatarUrl: data.avatar_url } : prev,
        );
      }
    } catch {}
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Prefer getClaims when available for faster local verification
      try {
        const claimsResult = await supabase.auth.getClaims?.();

        if (claimsResult?.data?.claims?.sub && mounted) {
          setUser((prev) => {
            const avatarFromClaims =
              (claimsResult.data.claims.avatar_url as string | undefined) ??
              null;
            const nextUser = {
              id: claimsResult.data.claims.sub,
              email: claimsResult.data.claims.email,
              avatarUrl: avatarFromClaims ?? prev?.avatarUrl ?? null,
            } as const;

            return nextUser;
          });
          setIsLoading(false);
          void fetchProfileAvatar(claimsResult.data.claims.sub);
          return;
        }
      } catch {}

      const { data } = await supabase.auth.getUser();

      if (!mounted) return;
      setUser((prev) => {
        const next = data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              avatarUrl:
                (data.user.user_metadata as { avatar_url?: string })
                  ?.avatar_url ??
                prev?.avatarUrl ??
                null,
            }
          : null;

        return next;
      });
      setIsLoading(false);
      if (data.user?.id) void fetchProfileAvatar(data.user.id);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser((prev) => {
          const next = session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
                avatarUrl:
                  (session.user.user_metadata as { avatar_url?: string })
                    ?.avatar_url ??
                  prev?.avatarUrl ??
                  null,
              }
            : null;

          return next;
        });
        if (session?.user?.id) void fetchProfileAvatar(session.user.id);
      },
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Identify user in PostHog when user state changes
  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        avatar_url: user.avatarUrl,
        $set: {
          email: user.email,
          avatar_url: user.avatarUrl,
        },
      });
    } else {
      // Reset to anonymous user
      posthog.reset();
    }
  }, [user, posthog]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return {
          error: error ? getFriendlyAuthErrorMessage(error) : undefined,
        };
      },
      signUp: async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return {
          error: error ? getFriendlyAuthErrorMessage(error) : undefined,
        };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      setAvatarUrl: (url: string | null) => {
        setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
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
