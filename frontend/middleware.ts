import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define route mappings - keep these URLs clean in the address bar
  const routeRewrites: Record<string, string> = {
    "/login": "/auth/login",
    "/register": "/auth/register",
    "/forgot-password": "/auth/forgot-password",
    "/reset-password": "/auth/reset-password",
    "/verify-email": "/auth/verify-email",
  };

  // Create reverse mappings for redirects
  const reverseRoutes: Record<string, string> = {
    "/auth/login": "/login",
    "/auth/register": "/register",
    "/auth/forgot-password": "/forgot-password",
    "/auth/reset-password": "/reset-password",
    "/auth/verify-email": "/verify-email",
  };

  // If someone accesses the original "/auth/..." paths, redirect them to clean URLs
  if (reverseRoutes[pathname]) {
    console.log(`Redirecting from ${pathname} to ${reverseRoutes[pathname]}`);
    return NextResponse.redirect(new URL(reverseRoutes[pathname], request.url));
  }

  // For the clean URLs, rewrite them internally to fetch the content from the actual paths
  if (routeRewrites[pathname]) {
    console.log(`Rewriting ${pathname} to ${routeRewrites[pathname]}`);
    return NextResponse.rewrite(new URL(routeRewrites[pathname], request.url));
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match both the short routes and the original routes
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",

    // Keep these exclusions for static assets
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
