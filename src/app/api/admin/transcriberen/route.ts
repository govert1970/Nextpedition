import { db, isAdmin, json } from '@/lib/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PER_KEER = 2; // klein houden, zodat één aanroep binnen de tijdslimiet van de hosting blijft

async function transcribeer(bestand: Blob, naam: string, sleutel: string): Promise<string> {
  const modellen = [process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-transcribe', 'whisper-1'];
  let laatsteFout = '';
  for (const model of modellen) {
    const fd = new FormData();
    fd.set('file', bestand, naam);
    fd.set('model', model);
    fd.set('language', 'nl');
    fd.set('response_format', 'json');
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${sleutel}` }, body: fd,
    });
    if (res.ok) {
      const j = (await res.json()) as { text?: string };
      return (j.text ?? '').trim();
    }
    laatsteFout = `${res.status} ${(await res.text()).slice(0, 200)}`;
    if (res.status === 401 || res.status === 429) break; // sleutel of tegoed: geen zin om een ander model te proberen
  }
  throw new Error(laatsteFout);
}

export async function POST() {
  if (!isAdmin()) return json({ fout: 'Niet ingelogd.' }, 401);
  const sleutel = process.env.OPENAI_API_KEY;
  if (!sleutel) return json({ fout: 'OPENAI_API_KEY ontbreekt in Vercel.' }, 500);

  const { data: rijen, error } = await db().from('recordings').select('id, storage_path').is('transcript', null).order('created_at').limit(PER_KEER);
  if (error) return json({ fout: 'Opnames ophalen lukte niet.' }, 500);

  const fouten: string[] = [];
  let gedaan = 0;
  for (const r of rijen ?? []) {
    const dl = await db().storage.from('opnames').download(r.storage_path);
    if (dl.error || !dl.data) { fouten.push(`${r.storage_path}: niet gevonden`); continue; }
    try {
      const tekst = await transcribeer(dl.data, r.storage_path.split('/').pop() || 'opname.webm', sleutel);
      await db().from('recordings').update({ transcript: tekst || '(geen spraak herkend)' }).eq('id', r.id);
      gedaan++;
    } catch (e) {
      fouten.push(`${r.storage_path}: ${(e as Error).message}`);
    }
  }
  const { count } = await db().from('recordings').select('id', { count: 'exact', head: true }).is('transcript', null);
  return json({ gedaan, resterend: count ?? 0, fouten });
}
