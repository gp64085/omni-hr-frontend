import { NextResponse, type NextRequest } from "next/server";
import { STORAGE_KEYS, ROUTES } from "./constants";

const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.EMPLOYEES,
  ROUTES.ROLES,
  ROUTES.LEAVES,
  ROUTES.PROJECTS,
  ROUTES.TIMESHEETS,
  ROUTES.AUDIT_LOGS,
  ROUTES.PROFILE,
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isLoginRoute = pathname === ROUTES.LOGIN;

  // Unauthenticated user attempting to access protected route -> redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user attempting to access /login -> redirect to dashboard
  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/roles/:path*",
    "/leaves/:path*",
    "/projects/:path*",
    "/timesheets/:path*",
    "/audit-logs/:path*",
    "/profile/:path*",
    "/login",
  ],
};
