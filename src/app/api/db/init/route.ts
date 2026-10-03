import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { runSchemaMigrations } from '@/lib/db';
import { validateSessionToken, verifyPassword, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const isAuthenticated = await validateSessionToken(token);

    let authorized = isAuthenticated;

    if (!authorized) {
      const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
      const initTokenHeader = req.headers.get('x-init-token');
      const body = await req.json().catch(() => ({}));
      const expectedPassword = process.env.APP_PASSWORD;
      const expectedInitToken = process.env.INIT_TOKEN || expectedPassword;

      if (expectedPassword && authHeader && verifyPassword(authHeader, expectedPassword)) {
        authorized = true;
      } else if (expectedInitToken && initTokenHeader && verifyPassword(initTokenHeader, expectedInitToken)) {
        authorized = true;
      } else if (expectedPassword && body.password && verifyPassword(body.password, expectedPassword)) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await runSchemaMigrations();
    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
    });
  } catch (err: any) {
    console.error('Database init error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize database schema' },
      { status: 500 }
    );
  }
}
