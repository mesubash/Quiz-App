import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Processing request for: ${pathname}`);

  // Get user information from cookies
  const cookies = request.cookies;
  const role = cookies.get("role")?.value;
  const token = cookies.get("accessToken")?.value;

  console.log(`User role: ${role}, Has token: ${token ? "Yes" : "No"}`);

  // Define route mappings - keep these URLs clean in the address bar
  const routeRewrites: Record<string, string> = {
    // Auth routes
    "/login": "/auth/login",
    "/register": "/auth/register",
    "/forgot-password": "/auth/forgot-password",
    "/reset-password": "/auth/reset-password",
    "/verify-email": "/auth/verify-email",
    "/logout": "/auth/logout",

    // Admin routes - map clean URLs to actual directory structure
    "/admin": "/pages/admin",
    "/admin/users": "/pages/admin/users",
    "/admin/settings": "/pages/admin/settings",
    "/admin/quizzes": "/pages/admin/quizzes",
    "/admin/analytics": "/pages/admin/analytics",

    // User routes - map clean URLs to actual directory structure
    "/dashboard": "/pages/users/dashboard",
    "/dashboard/profile": "/pages/users/dashboard/profile",
    "/dashboard/settings": "/pages/users/dashboard/settings",
    "/dashboard/quizzes": "/pages/users/dashboard/quizzes",
    "/dashboard/help": "/pages/users/dashboard/help",
    "/dashboard/faq": "/pages/users/dashboard/faq",
    "/dashboard/contact": "/pages/users/dashboard/contact",
  };

  // Create reverse mappings for redirects
  const reverseRoutes: Record<string, string> = {
    // Auth routes
    "/auth/login": "/login",
    "/auth/register": "/register",
    "/auth/forgot-password": "/forgot-password",
    "/auth/reset-password": "/reset-password",
    "/auth/verify-email": "/verify-email",

    // Admin routes - redirect from actual paths to clean URLs
    "/pages/admin": "/admin",
    "/pages/admin/users": "/admin/users",
    "/pages/admin/settings": "/admin/settings",
    "/pages/admin/quizzes": "/admin/quizzes",
    "/pages/admin/analytics": "/admin/analytics",

    // User routes - redirect from actual paths to clean URLs
    "/pages/users/dashboard": "/dashboard",
    "/pages/users/dashboard/profile": "/dashboard/profile",
    "/pages/users/dashboard/settings": "/dashboard/settings",
    "/pages/users/dashboard/quizzes": "/dashboard/quizzes",
    "/pages/users/dashboard/help": "/dashboard/help",
    "/pages/users/dashboard/faq": "/dashboard/faq",
    "/pages/users/dashboard/contact": "/dashboard/contact",
  };

  // Handle authentication and routing logic

  // 1. Handle public routes first - allow access regardless of authentication
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-email"
  ) {
    // If user is already authenticated, redirect to appropriate dashboard
    if (token) {
      // Check role (case-insensitive) to determine where to redirect
      const normalizedRole = role?.toLowerCase();
      if (normalizedRole === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // For unauthenticated users, rewrite to show auth pages
    if (routeRewrites[pathname]) {
      console.log(`Rewriting ${pathname} to ${routeRewrites[pathname]}`);
      return NextResponse.rewrite(
        new URL(routeRewrites[pathname], request.url)
      );
    }
  }

  // 2. Check authentication for protected routes
  if (
    !token &&
    (pathname.startsWith("/admin") || pathname.startsWith("/dashboard"))
  ) {
    // If not authenticated and trying to access protected routes, redirect to login
    console.log("Unauthenticated user trying to access protected route");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Check for role-based access
  // For admin routes - check if user has admin role (case-insensitive comparison)
  if (pathname.startsWith("/admin") && token) {
    const normalizedRole = role?.toLowerCase();
    if (normalizedRole !== "admin") {
      console.log("Non-admin user trying to access admin route");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 4. Role-specific dashboard redirection
  // If admin tries to access user dashboard, redirect to admin dashboard
  if (
    pathname.startsWith("/dashboard") &&
    token &&
    role?.toLowerCase() === "admin"
  ) {
    console.log("Admin user trying to access user dashboard");
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 5. Handle original directory path redirects (to show clean URLs)
  if (reverseRoutes[pathname]) {
    console.log(`Redirecting from ${pathname} to ${reverseRoutes[pathname]}`);
    return NextResponse.redirect(new URL(reverseRoutes[pathname], request.url));
  }

  // 6. Handle clean URL rewrites (to fetch content from actual paths)
  if (routeRewrites[pathname]) {
    console.log(`Rewriting ${pathname} to ${routeRewrites[pathname]}`);
    return NextResponse.rewrite(new URL(routeRewrites[pathname], request.url));
  }

  // 7. Handle more complex dynamic routes

  // Admin routes handling
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // For admin routes
    const targetPath =
      pathname === "/admin" ? "/pages/admin" : `/pages${pathname}`;
    console.log(`Rewriting admin path ${pathname} to ${targetPath}`);
    return NextResponse.rewrite(new URL(targetPath, request.url));
  }

  // Dashboard routes handling
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    // For dashboard routes
    const targetPath =
      pathname === "/dashboard"
        ? "/pages/users/dashboard"
        : `/pages/users${pathname}`;
    console.log(`Rewriting dashboard path ${pathname} to ${targetPath}`);
    return NextResponse.rewrite(new URL(targetPath, request.url));
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Auth routes
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/logout",
    "/auth/:path*",

    // Admin routes
    "/admin",
    "/admin/:path*",
    "/pages/admin/:path*",

    // User routes
    "/dashboard",
    "/dashboard/:path*",
    "/pages/users/dashboard/:path*",

    // Keep these exclusions for static assets
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
