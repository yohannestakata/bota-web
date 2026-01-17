import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = url.searchParams.get("redirect") || "/";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const res = NextResponse.redirect(new URL(redirect, appUrl));
  try {
    if (code) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
              cookiesToSet.forEach(({ name, value, options }) =>
                res.cookies.set(name, value, options),
              );
            },
          },
        },
      );
      await supabase.auth.exchangeCodeForSession(code);
      const { data } = await supabase.auth.getUser();
      console.log("[auth/callback] session exchanged", {
        userId: data.user?.id || null,
      });
    }
  } catch (e) {
    console.error("[auth/callback] exchange failed", e);
  }
  return res;
}
