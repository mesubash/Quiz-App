import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies;
  const role = cookies.get("role")?.value;
  const token = request.cookies.get("accessToken")?.value;

  // Redirect logic for the base URL
  if (pathname === "/") {
    if (!token) {
      // If no token, redirect to the guest page
      return NextResponse.rewrite(new URL("/guest", request.url));
    } else if (role === "admin") {
      // If the user is an admin, redirect to the admin dashboard
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      // If the user is a regular user, redirect to the user dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Handle dynamic quiz attempt rewrites
  const quizAttemptMatch = pathname.match(/^\/quizzes\/([^\/]+)\/attempt\/?$/);
  if (quizAttemptMatch) {
    const quizId = quizAttemptMatch[1];
    return NextResponse.rewrite(
      new URL(`/pages/users/quizzes/${quizId}/attempt`, request.url)
    );
  }

  // Handle dynamic quiz result rewrites
  const quizResultMatch = pathname.match(
    /^\/quizzes\/([^\/]+)\/result\/([^\/]+)\/?$/
  );
  if (quizResultMatch) {
    const quizId = quizResultMatch[1];
    const attemptId = quizResultMatch[2];
    return NextResponse.rewrite(
      new URL(`/pages/users/quizzes/${quizId}/result/${attemptId}`, request.url)
    );
  }

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
    "/admin/help": "/pages/admin/help",

    // User routes - directly under /pages/users
    "/dashboard": "/pages/users/dashboard",
    "/my-quizzes": "/pages/users/my-quizzes",
    "/quizzes": "/pages/users/quizzes",

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
      "/help",
    ].some((route) => pathname.startsWith(route));

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prevent authenticated users from accessing guest routes
  const guestRoutes = ["/guest", "/about", "/contact"];
  if (guestRoutes.some((route) => pathname.startsWith(route)) && token) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
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

  // 4. Handle specific admin quiz routes
  if (pathname.startsWith("/admin/quizzes/create-quiz")) {
    return NextResponse.rewrite(
      new URL("/pages/admin/quizzes/create-quiz", request.url)
    );
  }

  if (pathname.startsWith("/admin/quizzes/edit-quiz")) {
    return NextResponse.rewrite(
      new URL("/pages/admin/quizzes/edit-quiz", request.url)
    );
  }
  const adminQuizPreviewMatch = pathname.match(
    /^\/admin\/quizzes\/preview\/([^\/]+)\/?$/
  );
  if (adminQuizPreviewMatch) {
    const quizId = adminQuizPreviewMatch[1];
    return NextResponse.rewrite(
      new URL(`/pages/admin/quizzes/preview/${quizId}`, request.url)
    );
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
