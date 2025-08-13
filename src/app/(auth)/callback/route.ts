import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirect = url.searchParams.get("redirect") || "/";
  return NextResponse.redirect(new URL(redirect, url.origin));
}

