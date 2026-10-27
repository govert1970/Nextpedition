import { MOMENTEN } from '@/config/dag';
import { db, deelnemerBijToken, json } from '@/lib/server';

export const dynamic = 'force-dynamic';
const IDS = new Set(MOMENTEN.map((m) => m.id));
const MAX = 40_000;

export async function PUT(req: Request, { params }: { params: { token: string } }) {
  const r = await deelnemerBijToken(params.token);
  if ('fout' in r) return json({ fout: r.fout }, r.status);
  const tekst = await req.text();
  if (tekst.length > MAX) return json({ fout: 'Te veel tekst in één keer.' }, 413);
  let body: { moment_id?: string; data?: unknown; updated_at?: string };
  try { body = JSON.parse(tekst); } catch { return json({ fout: 'Ongeldige invoer.' }, 400); }
  if (!body.moment_id || !IDS.has(body.moment_id) || typeof body.data !== 'object' || body.data === null) {
    return json({ fout: 'Ongeldige invoer.' }, 400);
  }
  const updated_at = body.updated_at && !Number.isNaN(Date.parse(body.updated_at)) ? body.updated_at : new Date().toISOString();
  // Laatste schrijver wint, maar een oudere versie overschrijft nooit een nieuwere.
  const { data: bestaand } = await db().from('entries').select('updated_at')
    .eq('participant_id', r.deelnemer.id).eq('moment_id', body.moment_id).maybeSingle();
  if (bestaand && Date.parse(bestaand.updated_at) > Date.parse(updated_at)) return json({ ok: true, ouder: true });
  const { error } = await db().from('entries').upsert(
    { participant_id: r.deelnemer.id, moment_id: body.moment_id, data: body.data, updated_at },
    { onConflict: 'participant_id,moment_id' },
  );
  if (error) return json({ fout: 'Opslaan lukte niet.' }, 500);
  return json({ ok: true });
}
