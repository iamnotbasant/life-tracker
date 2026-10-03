import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb, ensureDbInitialized } from '@/lib/db';
import { validateSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const isValid = await validateSessionToken(token);

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDbInitialized();
    const sql = getDb();

    const [profileRows, daysRows, weightRows] = await Promise.all([
      sql`SELECT data FROM profiles WHERE id = 'default' LIMIT 1`,
      sql`SELECT date, data FROM days ORDER BY date ASC`,
      sql`SELECT id, date, weight_kg, note FROM weight_history ORDER BY date ASC`,
    ]);

    if (profileRows.length === 0 && daysRows.length === 0 && weightRows.length === 0) {
      return NextResponse.json({
        isEmpty: true,
        profile: null,
        days: {},
        weightHistory: [],
      });
    }

    const rawProfile = profileRows[0]?.data;
    const profile = typeof rawProfile === 'string' ? JSON.parse(rawProfile) : (rawProfile || null);

    const days: Record<string, any> = {};
    for (const row of daysRows) {
      days[row.date] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    }

    const weightHistory = weightRows.map((r: any) => ({
      id: r.id,
      date: r.date,
      weightKg: Number(r.weight_kg),
      note: r.note || undefined,
    }));

    return NextResponse.json({
      isEmpty: false,
      profile,
      days,
      weightHistory,
    });
  } catch (err: any) {
    console.error('Error fetching state:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch state' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const isValid = await validateSessionToken(token);

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid state payload' }, { status: 400 });
    }

    const { profile, days, weightHistory } = body;
    if (!profile || typeof profile !== 'object') {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }
    if (!days || typeof days !== 'object') {
      return NextResponse.json({ error: 'Invalid days data' }, { status: 400 });
    }
    if (!Array.isArray(weightHistory)) {
      return NextResponse.json({ error: 'Invalid weightHistory data' }, { status: 400 });
    }

    await ensureDbInitialized();
    const sql = getDb();

    // 1. Upsert Profile
    await sql`
      INSERT INTO profiles (id, data, updated_at)
      VALUES ('default', ${JSON.stringify(profile)}, NOW())
      ON CONFLICT (id) DO UPDATE
      SET data = ${JSON.stringify(profile)}, updated_at = NOW()
    `;

    // 2. Upsert Days
    const dayEntries = Object.entries(days);
    if (dayEntries.length > 0) {
      const dayPromises = dayEntries.map(([date, dayData]) => {
        return sql`
          INSERT INTO days (date, data, updated_at)
          VALUES (${date}, ${JSON.stringify(dayData)}, NOW())
          ON CONFLICT (date) DO UPDATE
          SET data = ${JSON.stringify(dayData)}, updated_at = NOW()
        `;
      });
      await Promise.all(dayPromises);
    }

    // 3. Upsert Weight History
    if (weightHistory.length === 0) {
      await sql`DELETE FROM weight_history`;
    } else {
      const validIds = weightHistory.map((w: any) => String(w.id));
      await sql`
        DELETE FROM weight_history
        WHERE NOT (id = ANY(${validIds}::text[]))
      `;

      const weightPromises = weightHistory.map((w: any) => {
        return sql`
          INSERT INTO weight_history (id, date, weight_kg, note, created_at)
          VALUES (
            ${String(w.id)},
            ${String(w.date)},
            ${Number(w.weightKg)},
            ${w.note ? String(w.note) : null},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET date = ${String(w.date)},
              weight_kg = ${Number(w.weightKg)},
              note = ${w.note ? String(w.note) : null}
        `;
      });
      await Promise.all(weightPromises);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating state:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update state' },
      { status: 500 }
    );
  }
}
