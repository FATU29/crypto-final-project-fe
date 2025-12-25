import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { config } from "./config";

// AUTHENTICATION DISABLED FOR DEVELOPMENT
// Bypass login - allow access to all routes without authentication
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // Simply allow all requests to pass through
  return NextResponse.next();

  /* 
  // Original authentication code (disabled)
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(config.auth.tokenKey)?.value;

  // Check if the route is protected
  const isProtectedRoute = config.routes.protected.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const url = new URL(config.routes.loginRedirect, request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing auth pages with token
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(
      new URL(config.routes.authRedirect, request.url)
    );
  }

  return NextResponse.next();
  */
}

export const config_middleware = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
