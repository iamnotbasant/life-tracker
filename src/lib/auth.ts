import crypto from 'crypto';
import { getDb, ensureDbInitialized } from './db';

export const SESSION_COOKIE_NAME = 'lt_session';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export function verifyPassword(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const bufA = Buffer.from(provided, 'utf-8');
  const bufB = Buffer.from(expected, 'utf-8');
  if (bufA.length !== bufB.length) {
    // Perform dummy constant-time comparison to prevent length timing leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// In-memory rate limiting for login attempts (10 failed attempts per 60s per IP)
const failedAttempts = new Map<string, { count: number; firstAttempt: number }>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (now - record.firstAttempt > 60000) {
    failedAttempts.delete(ip);
    return false;
  }
  return record.count >= 10;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record || now - record.firstAttempt > 60000) {
    failedAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}

export function clearRateLimit(ip: string): void {
  failedAttempts.delete(ip);
}

export async function createSession(): Promise<string> {
  await ensureDbInitialized();
  const token = crypto.randomBytes(32).toString('hex');
  const sql = getDb();
  await sql`
    INSERT INTO sessions (token, created_at)
    VALUES (${token}, NOW())
  `;
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  try {
    await ensureDbInitialized();
    const sql = getDb();
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  } catch (err) {
    console.error('Error deleting session:', err);
  }
}

export async function validateSessionToken(token?: string | null): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  try {
    await ensureDbInitialized();
    const sql = getDb();
    const rows = await sql`
      SELECT token FROM sessions
      WHERE token = ${token}
      LIMIT 1
    `;
    return rows.length > 0;
  } catch (err) {
    console.error('Session validation error:', err);
    return false;
  }
}
