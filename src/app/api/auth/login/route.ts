import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyPassword,
  isRateLimited,
  recordFailedAttempt,
  clearRateLimit,
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    const expectedPassword = process.env.APP_PASSWORD;
    if (!expectedPassword) {
      console.error('APP_PASSWORD environment variable is not configured');
      return NextResponse.json(
        { error: 'APP_PASSWORD is not configured on the server. Please set it in Vercel settings.' },
        { status: 500 }
      );
    }

    if (!password || typeof password !== 'string' || !verifyPassword(password, expectedPassword)) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    clearRateLimit(ip);

    const token = await createSession();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return NextResponse.json({ success: true, authenticated: true });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred during login' },
      { status: 500 }
    );
  }
}
