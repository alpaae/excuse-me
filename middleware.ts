import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Simple pass-through middleware - no i18n logic needed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|fonts|images|favicon\\.ico|manifest\\.webmanifest|sw\\.js).*)'],
};