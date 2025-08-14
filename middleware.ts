import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAccessTokenValid } from "@/lib/auth/token";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const protectedPaths = ["/place/", "/place/add", "/reviews/add", "/account"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const accessToken = request.cookies.get("sb-access-token")?.value;
  if (isAccessTokenValid(accessToken)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set(
    "redirect",
    pathname + (searchParams.size ? `?${searchParams.toString()}` : ""),
  );
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/place/add",
    "/place/:path*/photos/add",
    "/place/:path*/request-edit",
    "/reviews/add",
    "/account/:path*",
  ],
};
