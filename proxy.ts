import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      console.error(
        "Admin Access Denied: No session found. Check BETTER_AUTH_URL and cookie configuration.",
      );
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
