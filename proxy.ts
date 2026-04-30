import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Public route prefixes (no auth required). Everything else under the matcher
// requires a session cookie. Real session verification and role-based redirects
// happen in server components — this proxy is just a fast gate.
const publicPrefixes = [
  "/login",
  "/signup",
  "/units",
  "/about",
  "/contact",
  "/api",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    publicPrefixes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Uses the better-auth helper so the cookie name is correct in both dev
  // (`better-auth.session_token`) and production (`__Secure-better-auth.session_token`).
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)"],
};
