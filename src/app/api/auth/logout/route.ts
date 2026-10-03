import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await deleteSession(token);
    }

    cookieStore.set(SESSION_COOKIE_NAME, '', {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 0,
    });

    return NextResponse.json({ success: true, authenticated: false });
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
