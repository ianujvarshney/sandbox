import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { configureMiddleware as configurePartnerMiddleware } from './lib/partners/usePartner';
import { getValidSubdomain } from '@/lib/utils/getValidSubdomain';
// RegExp for public files
const PUBLIC_FILE = /\.(.*)$/; // Files

export function middleware(request: NextRequest, event: NextFetchEvent) {
  configurePartnerMiddleware(request, event);

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const env = process.env.NODE_ENV;
  const url = request.nextUrl.clone();

  let cspHeader = '';
  if (env == 'development') {
    cspHeader = `...development headeres`;
  } else if (env == 'production') {
    cspHeader = `... production headers`
  }

  const requestHeaders = new Headers(request.headers);

  // Setting request headers
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(
    'Content-Security-Policy',
    // Replace newline characters and spaces
    cspHeader.replace(/\s{2,}/g, ' ').trim(),
  );

  // Skip public files
  if (!PUBLIC_FILE.test(url.pathname) || !url.pathname.includes('_next')) {
    const host = request.headers.get('host');
    const subdomain = getValidSubdomain(host);
    if (subdomain) {
      // Subdomain available, rewriting
      url.pathname = `/${subdomain}${url.pathname}`;
      url.search = request.nextUrl.search;
    }

    return NextResponse.rewrite(url, {
      headers: requestHeaders,
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|scripts|robots).*)',
    },
  ],
};
