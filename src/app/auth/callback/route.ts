import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirect = url.searchParams.get("redirect") || "/";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  return NextResponse.redirect(new URL(redirect, appUrl));
}
