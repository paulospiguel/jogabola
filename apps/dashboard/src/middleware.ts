import { createRouteMatchers } from "@/lib/route";
import { configRoutes } from "@/settings/routes";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@auth";

export default async function middleware(req: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session;
  const { nextUrl } = req;

  const { isProtectedRoute, isPublicRoute, isApiRoute, isAuthRoute } =
    createRouteMatchers(configRoutes, req);

  console.log(`Public: ${isPublicRoute}`);
  console.log(`Protected: ${isProtectedRoute}`);
  console.log(`Api: ${isApiRoute}`);
  console.log(`Auth: ${isAuthRoute}`);

  if (isProtectedRoute && !isLoggedIn) {
    const url = new URL(nextUrl.toString());
    const redirectUrl = `/auth/login?redirect=${decodeURIComponent(
      url.toString()
    )}`;
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
