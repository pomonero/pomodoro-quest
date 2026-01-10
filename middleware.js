import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Google bot için izin ver
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i.test(userAgent);
  
  // Bot ise prerender için izin ver
  if (isBot) {
    response.headers.set('X-Robots-Tag', 'index, follow');
  }
  
  return response;
}

export const config = {
  matcher: [
    // Tüm sayfalar için çalış (static dosyalar hariç)
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
