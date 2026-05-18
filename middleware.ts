import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPERADMIN_ROUTES = ["/dashboard", "/users", "/syncdata"];
const ADMIN_ROUTES = ["/meetingdoc"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // ຖ້າບໍ່ມີ token (ບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ)
  if (!token) {
    if (pathname !== '/signin') {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  }

  // ກວດສອບສິດ (Role) ຈາກ JWT Token
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf8");
      const payload = JSON.parse(payloadJson);

      const roleId = payload.roleId;

      // ຖ້າມີ token ແລ້ວ ແຕ່ພະຍາຍາມເຂົ້າໜ້າ signin ຫລື ໜ້າທຳອິດ ໃຫ້ສົ່ງໄປໜ້າຫຼັກຕາມ Role
      if (pathname === '/signin' || pathname === '/') {
        if (roleId === 1) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else if (roleId === 2) {
          return NextResponse.redirect(new URL('/meetingdoc', request.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // ກວດສອບວ່າ path ນີ້ຕ້ອງການສິດຫຍັງແດ່
      const isSuperadminRoute = SUPERADMIN_ROUTES.some(route => pathname.startsWith(route));
      const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

      // ຖ້າເຂົ້າໜ້າຂອງ Superadmin ແຕ່ບໍ່ແມ່ນ Superadmin (roleId !== 1)
      if (isSuperadminRoute && roleId !== 1) {
        return NextResponse.rewrite(new URL('/unauthorized', request.url));
      }

      // ຖ້າເຂົ້າໜ້າຂອງ Admin ແຕ່ບໍ່ແມ່ນ Admin ຫລື Superadmin
      if (isAdminRoute && roleId !== 2) {
        return NextResponse.rewrite(new URL('/unauthorized', request.url));
      }
    }
  } catch (error) {
    // ຖ້າ token ມີບັນຫາ ໃຫ້ລຶບຖິ້ມແລ້ວໃຫ້ເຂົ້າສູ່ລະບົບໃໝ່
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
