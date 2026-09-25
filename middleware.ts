import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPERADMIN_ROUTES = ["/dashboard", "/users", "/syncdata"];
const ADMIN_ROUTES = ["/meetingdoc", "/relateddoc", "/assignuser", "/relatedassign"];
const PUBLIC_ROUTES = ["/signin", "/signup", "/resetpassword"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, Next.js internal files, and APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // Helper to create redirect/rewrite URL preserving basePath and origin
  const getUrl = (targetPath: string) => {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    return url;
  };

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // 1. If no token (not logged in)
  if (!token) {
    if (!isPublicRoute) {
      return NextResponse.redirect(getUrl('/signin'));
    }
    return NextResponse.next();
  }

  // 2. Validate token (format & expiration & roles)
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Corrupt or invalid token format -> delete cookie and redirect to signin
      const response = NextResponse.redirect(getUrl('/signin'));
      response.cookies.delete('token');
      return response;
    }

    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf8");
    const payload = JSON.parse(payloadJson) as {
      roleId?: number;
      exp?: number;
      sub?: string | number;
    };

    // Check token expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      const response = NextResponse.redirect(getUrl('/signin'));
      response.cookies.delete('token');
      return response;
    }

    const roleId = payload.roleId;

    // If authenticated user visits public auth routes or root, redirect to their role home page
    if (isPublicRoute || pathname === '/') {
      if (roleId === 1) {
        return NextResponse.redirect(getUrl('/dashboard'));
      } else if (roleId === 2) {
        return NextResponse.redirect(getUrl('/meetingdoc'));
      } else {
        return NextResponse.redirect(getUrl('/dashboard'));
      }
    }

    // Role-based route access guards
    const isSuperadminRoute = SUPERADMIN_ROUTES.some((route) => pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

    // If accessing Superadmin route without roleId === 1
    if (isSuperadminRoute && roleId !== 1) {
      return NextResponse.rewrite(getUrl('/unauthorized'));
    }

    // If accessing Admin route without roleId === 1 or 2
    if (isAdminRoute && roleId !== 2 && roleId !== 1) {
      return NextResponse.rewrite(getUrl('/unauthorized'));
    }
  } catch {
    // If token parsing fails, clear cookie and redirect to signin
    const response = NextResponse.redirect(getUrl('/signin'));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|sw.js|offline.html|icons|apple-touch-icon.png).*)',
  ],
};
