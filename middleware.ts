import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ログインページは認証不要
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Cookie から認証状態を確認
  const isAuthenticated = request.cookies.get('auth-token')?.value === 'authenticated';

  if (!isAuthenticated) {
    // 未認証の場合はログインページにリダイレクト
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
