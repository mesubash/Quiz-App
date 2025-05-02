import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies;
  const role = cookies.get("role")?.value;
  const token = request.cookies.get("accessToken")?.value;

  // Define route mappings - keep these URLs clean in the address bar
  const routeRewrites: Record<string, string> = {
    // Auth routes
    "/login": "/auth/login",
    "/register": "/auth/register",
    "/forgot-password": "/auth/forgot-password",
    "/reset-password": "/auth/reset-password",
    "/verify-email": "/auth/verify-email",
    "/logout": "/auth/logout",

    // Admin routes
    "/admin": "/pages/admin",
    "/admin/users": "/pages/admin/users",
    "/admin/settings": "/pages/admin/settings",
    "/admin/quizzes": "/pages/admin/quizzes",
    "/admin/analytics": "/pages/admin/analytics",

    // User routes - directly under /pages/users
    "/dashboard": "/pages/users/dashboard",
    "/quizzes": "/pages/users/quizzes",
    "/my-quizzes": "/pages/users/my-quizzes",
    "/profile": "/pages/users/profile",
    "/settings": "/pages/users/settings",
    "/leaderboard": "/pages/users/leaderboard",
    "/history": "/pages/users/history",
    "/help": "/pages/users/help",
    "/contact": "/pages/users/contact",
    "/messages": "/pages/users/messages",
    "/analytics": "/pages/users/analytics",
  };

  // Create reverse mappings for redirects
  const reverseRoutes: Record<string, string> = Object.entries(
    routeRewrites
  ).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});

  // 1. Handle public routes first
  if (
    [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
      "/help",
      "/contact",
    ].includes(pathname)
  ) {
    if (token && !["/help", "/contact"].includes(pathname)) {
      // Only redirect authenticated users for auth routes, not help/contact
      const normalizedRole = role?.toLowerCase();
      return NextResponse.redirect(
        new URL(
          normalizedRole === "admin" ? "/admin" : "/dashboard",
          request.url
        )
      );
    }
    return routeRewrites[pathname]
      ? NextResponse.rewrite(new URL(routeRewrites[pathname], request.url))
      : NextResponse.next();
  }

  // 2. Check authentication for protected routes
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    [
      "/quizzes",
      "/my-quizzes",
      "/profile",
      "/settings",
      "/leaderboard",
      "/history",
      "/analytics",
      "/messages",
    ].some((route) => pathname.startsWith(route));

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Role-based access control
  if (token) {
    const isAdmin = role?.toLowerCase() === "admin";

    // Prevent non-admins from accessing admin routes
    if (!isAdmin && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Prevent admins from accessing user routes
    if (isAdmin && !pathname.startsWith("/admin") && pathname !== "/logout") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Handle clean URL rewrites
    if (routeRewrites[pathname]) {
      return NextResponse.rewrite(
        new URL(routeRewrites[pathname], request.url)
      );
    }

    // Handle reverse routes for clean URLs
    if (reverseRoutes[pathname]) {
      return NextResponse.redirect(
        new URL(reverseRoutes[pathname], request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Auth routes
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/logout",

    // Admin routes
    "/admin/:path*",

    // User routes
    "/dashboard",
    "/quizzes",
    "/my-quizzes",
    "/profile",
    "/settings",
    "/leaderboard",
    "/history",
    "/help",
    "/contact",
    "/messages",
    "/analytics",

    // Internal paths
    "/auth/:path*",
    "/pages/admin/:path*",
    "/pages/users/:path*",

    // Exclude static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
