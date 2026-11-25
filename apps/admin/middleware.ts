import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("pbAdminToken")?.value;
  const path = request.nextUrl.pathname;

  let decodedToken: DecodedToken | null = null;

  // ✅ Decode token safely
  if (token) {
    try {
      decodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Token expired
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("pbAdminToken");
        return response;
      }
    } catch (err) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("pbAdminToken");
      return response;
    }
  }

  // ✅ Block protected routes if no token
  if (
    (path.startsWith("/admin") || path.startsWith("/super-admin")) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (decodedToken) {
    const roles = decodedToken.roles || [];
    const isSuperAdmin = roles.includes("SUPER_ADMIN");
    const isAdmin = roles.includes("ADMIN");

    // ✅ Access Control
    // Only SUPER_ADMIN can access /super-admin
    if (path.startsWith("/super-admin") && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // ADMIN and SUPER_ADMIN can access /admin
    if (path.startsWith("/admin") && !isAdmin && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // ✅ Redirect to correct dashboard from root
    if (path === "/") {
      if (isSuperAdmin) {
        return NextResponse.redirect(new URL("/super-admin", request.url));
      } else if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}
