import { NextRequest, NextResponse } from "next/server";

// Guard ringan: kalau cookie admin_token tidak ada sama sekali, langsung
// redirect ke /login. Validasi "asli" (apakah token valid/expired) tetap
// dilakukan oleh backend Flask di setiap request API (lihat auth.py).
export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token");

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
