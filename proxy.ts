import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  const needsAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profil") ||
    pathname.startsWith("/proposer");

  if (needsAuth && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profil", "/proposer"],
};
