import { db, huidigEvent, isAdmin, json } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  if (!isAdmin()) return json({ fout: 'Niet ingelogd.' }, 401);
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const event = await huidigEvent();
  const upd: Record<string, string> = {};
  if (typeof b.naam === 'string' && b.naam.trim()) upd.naam = b.naam.trim().slice(0, 120);
  if (typeof b.datum === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.datum)) upd.datum = b.datum;
  for (const k of ['geldig_van', 'geldig_tot'] as const) {
    if (typeof b[k] === 'string' && !Number.isNaN(Date.parse(b[k]))) upd[k] = new Date(b[k]).toISOString();
  }
  if (typeof b.reflectie_vuur === 'string') upd.reflectie_vuur = b.reflectie_vuur.slice(0, 8000);
  const { error } = await db().from('events').update(upd).eq('id', event.id);
  if (error) return json({ fout: 'Opslaan lukte niet.' }, 500);
  return json({ ok: true });
}
