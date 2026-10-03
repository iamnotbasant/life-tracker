import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const isValid = await validateSessionToken(token);
    return NextResponse.json({ authenticated: isValid });
  } catch (err: any) {
    console.error('Auth check error:', err);
    return NextResponse.json({ authenticated: false });
  }
}
