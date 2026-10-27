import { MOMENTEN } from '@/config/dag';
import { db, deelnemerBijToken, json } from '@/lib/server';

export const dynamic = 'force-dynamic';
const IDS = new Set(MOMENTEN.map((m) => m.id));
const MAX_BYTES = 4_000_000; // past binnen de uploadlimiet van de hosting

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const r = await deelnemerBijToken(params.token);
  if ('fout' in r) return json({ fout: r.fout }, r.status);
  const form = await req.formData();
  const bestand = form.get('bestand');
  const moment_id = String(form.get('moment_id') ?? '');
  const client_id = String(form.get('client_id') ?? '');
  const duur = Number(form.get('duur') ?? 0);
  if (!(bestand instanceof Blob) || !IDS.has(moment_id) || !/^[A-Za-z0-9-]{8,64}$/.test(client_id)) {
    return json({ fout: 'Ongeldige opname.' }, 400);
  }
  if (bestand.size > MAX_BYTES) return json({ fout: 'Opname is te groot.' }, 413);
  const ext = bestand.type.includes('mp4') ? 'm4a' : bestand.type.includes('ogg') ? 'ogg' : 'webm';
  const pad = `${r.deelnemer.id}/${client_id}.${ext}`;
  const up = await db().storage.from('opnames').upload(pad, bestand, { contentType: bestand.type || 'audio/webm', upsert: true });
  if (up.error) return json({ fout: 'Uploaden lukte niet.' }, 500);
  const { error } = await db().from('recordings').upsert(
    { participant_id: r.deelnemer.id, moment_id, client_id, storage_path: pad, duur_sec: Math.round(duur) || null },
    { onConflict: 'participant_id,client_id', ignoreDuplicates: true },
  );
  if (error) return json({ fout: 'Opslaan lukte niet.' }, 500);
  return json({ ok: true });
}
