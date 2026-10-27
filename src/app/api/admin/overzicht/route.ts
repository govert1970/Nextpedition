import { MOMENTEN } from '@/config/dag';
import { CODEWOORDEN } from '@/config/codewoorden';
import { db, huidigEvent, isAdmin, json } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return json({ fout: 'Niet ingelogd.' }, 401);
  const event = await huidigEvent();
  const [{ data: deelnemers }, { data: entries }, { data: opnames }] = await Promise.all([
    db().from('participants').select('id, naam, telefoon, token, voorbereiding, laatst_actief').eq('event_id', event.id).order('naam'),
    db().from('entries').select('participant_id, moment_id'),
    db().from('recordings').select('participant_id'),
  ]);
  const ingevuld = new Map<string, Set<string>>();
  for (const e of entries ?? []) {
    if (!ingevuld.has(e.participant_id)) ingevuld.set(e.participant_id, new Set());
    ingevuld.get(e.participant_id)!.add(e.moment_id);
  }
  const aantalOpnames = new Map<string, number>();
  for (const o of opnames ?? []) aantalOpnames.set(o.participant_id, (aantalOpnames.get(o.participant_id) ?? 0) + 1);
  return json({
    event,
    basis: process.env.PUBLIC_BASE_URL ?? '',
    momenten: MOMENTEN.map((m) => ({ id: m.id, titel: m.inhoud.titel, route: m.route, code: CODEWOORDEN[m.id] ?? null })),
    deelnemers: (deelnemers ?? []).map((d) => ({
      ...d,
      ingevuld: [...(ingevuld.get(d.id) ?? [])],
      opnames: aantalOpnames.get(d.id) ?? 0,
    })),
  });
}
