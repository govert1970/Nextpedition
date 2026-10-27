import { dagInhoud, db, deelnemerBijToken, json } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const r = await deelnemerBijToken(params.token);
  if ('fout' in r) return json({ fout: r.fout }, r.status);
  const { deelnemer, event } = r;
  const [{ data: entries }, { data: opnames }] = await Promise.all([
    db().from('entries').select('moment_id, data, updated_at').eq('participant_id', deelnemer.id),
    db().from('recordings').select('client_id, moment_id, duur_sec').eq('participant_id', deelnemer.id),
  ]);
  await db().from('participants').update({ laatst_actief: new Date().toISOString() }).eq('id', deelnemer.id);
  return json({
    deelnemer: { naam: deelnemer.naam, voorbereiding: deelnemer.voorbereiding ?? {} },
    event: { naam: event.naam, datum: event.datum },
    momenten: await dagInhoud(),
    entries: Object.fromEntries((entries ?? []).map((e) => [e.moment_id, { data: e.data, updated_at: e.updated_at }])),
    opnames: opnames ?? [],
  });
}
