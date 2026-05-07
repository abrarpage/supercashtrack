// Next.js 16 Proxy (sebelumnya middleware.ts).
// Melindungi seluruh /dashboard/* — user yang belum login dialihkan ke /login.
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname, search } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname + (search ?? ""));
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mencoba akses /login atau /signup, alihkan ke /dashboard.
  if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Cocokkan semua path kecuali static files dan _next.
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};
