import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/owner": ["OWNER", "ADMIN"],
  "/dashboard": ["TENANT", "OWNER", "ADMIN"],
  "/bookings": ["TENANT", "OWNER", "ADMIN"],
  "/settings": ["TENANT", "OWNER", "ADMIN"],
};

// Public routes that don't require authentication.
// All /api/* paths are excluded — route handlers run their own auth checks
// and need to return 401, not be redirected to /login.
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

  // Allow public routes (exact match for "/", prefix match for the rest)
  if (pathname === "/" || publicPrefixes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and API routes (except protected ones)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get session from better-auth cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    // Not authenticated, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify session by calling the auth API
  try {
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!sessionResponse.ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await sessionResponse.json();

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = session.user.role || "TENANT";

    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // User doesn't have permission, redirect to appropriate dashboard
          if (userRole === "ADMIN") {
            return NextResponse.redirect(
              new URL("/admin/dashboard", request.url),
            );
          } else if (userRole === "OWNER") {
            return NextResponse.redirect(
              new URL("/owner/dashboard", request.url),
            );
          } else {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        }
        break;
      }
    }

    return NextResponse.next();
  } catch {
    // Error verifying session, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
};
