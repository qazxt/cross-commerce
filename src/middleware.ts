import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const publicPages = [
  '/',
  '/category',
  '/brand',
  '/search',
  '/product',
];

const intlMiddleware = createMiddleware({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'always',
});

// 不需要国际化的路径
const excludedPaths = ['/admin', '/api'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过 admin 和 api 路径
  if (excludedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // 检查是否是公共页面
  const isPublicPage = publicPages.some(
    (page) => pathname === page || pathname.startsWith(page + '/')
  );

  // 如果是公共页面且没有语言前缀，重定向到默认语言
  if (isPublicPage && !pathname.startsWith('/zh') && !pathname.startsWith('/en')) {
    request.nextUrl.pathname = '/zh' + pathname;
    return NextResponse.redirect(request.nextUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*', '/((?!api|_next|_vercel|favicon\\.ico|.*\\..*).*)'],
};
