'use client';
// Alles wat een deelnemer invult, staat eerst op de eigen telefoon (IndexedDB) en gaat naar de server
// zodra er bereik is. Zo gaat er onderweg niets verloren.
import { get, set, del } from 'idb-keyval';
import type { EntryData, MomentInhoud } from '@/config/dag';
import type { Versleuteld } from '@/lib/crypto';

export type BundelMoment =
  | { id: string; route: string; soort: string; dicht: false; inhoud: MomentInhoud }
  | { id: string; route: string; soort: string; dicht: true; slot: Versleuteld };

export type Bundel = {
  deelnemer: { naam: string; voorbereiding: { vak?: string; hoofdstukken?: { titel: string; tekst: string }[] } };
  event: { naam: string; datum: string | null };
  momenten: BundelMoment[];
  entries: Record<string, { data: EntryData; updated_at: string }>;
  opnames: { client_id: string; moment_id: string; duur_sec: number | null }[];
};

export type LokaleInvoer = { data: EntryData; updated_at: string; teVersturen: boolean };
export type OpnameMeta = { client_id: string; moment_id: string; duur: number; verzonden: boolean; gemaakt: string };

const k = {
  bundel: (t: string) => `bundel:${t}`,
  open: (t: string) => `open:${t}`,
  invoer: (t: string) => `invoer:${t}`,
  opnames: (t: string) => `opnames:${t}`,
  blob: (t: string, id: string) => `blob:${t}:${id}`,
};

async function veilig<T>(fn: () => Promise<T>, terug: T): Promise<T> {
  try { return await fn(); } catch { return terug; }
}

export const opslag = {
  bundel: (t: string) => veilig(() => get<Bundel>(k.bundel(t)), undefined),
  zetBundel: (t: string, b: Bundel) => veilig(() => set(k.bundel(t), b), undefined),
  open: async (t: string) => (await veilig(() => get<Record<string, MomentInhoud>>(k.open(t)), undefined)) ?? {},
  zetOpen: (t: string, o: Record<string, MomentInhoud>) => veilig(() => set(k.open(t), o), undefined),
  invoer: async (t: string) => (await veilig(() => get<Record<string, LokaleInvoer>>(k.invoer(t)), undefined)) ?? {},
  zetInvoer: (t: string, i: Record<string, LokaleInvoer>) => veilig(() => set(k.invoer(t), i), undefined),
  opnames: async (t: string) => (await veilig(() => get<OpnameMeta[]>(k.opnames(t)), undefined)) ?? [],
  zetOpnames: (t: string, o: OpnameMeta[]) => veilig(() => set(k.opnames(t), o), undefined),
  blob: (t: string, id: string) => veilig(() => get<Blob>(k.blob(t, id)), undefined),
  zetBlob: (t: string, id: string, b: Blob) => veilig(() => set(k.blob(t, id), b), undefined),
  wisBlob: (t: string, id: string) => veilig(() => del(k.blob(t, id)), undefined),
};

/** Combineert wat de server heeft met wat lokaal staat: de nieuwste versie per moment wint. */
export function voegSamen(server: Bundel['entries'], lokaal: Record<string, LokaleInvoer>): Record<string, LokaleInvoer> {
  const uit: Record<string, LokaleInvoer> = {};
  for (const [id, s] of Object.entries(server)) uit[id] = { data: s.data, updated_at: s.updated_at, teVersturen: false };
  for (const [id, l] of Object.entries(lokaal)) {
    const s = uit[id];
    if (!s || Date.parse(l.updated_at) >= Date.parse(s.updated_at)) uit[id] = l;
  }
  return uit;
}

let bezig = false;
/** Verstuurt alles wat nog niet op de server staat. Geeft het aantal openstaande items terug. */
export async function synchroniseer(token: string): Promise<number> {
  if (bezig || (typeof navigator !== 'undefined' && !navigator.onLine)) return -1;
  bezig = true;
  let open = 0;
  try {
    const invoer = await opslag.invoer(token);
    for (const [moment_id, rij] of Object.entries(invoer)) {
      if (!rij.teVersturen) continue;
      try {
        const res = await fetch(`/api/p/${token}/entries`, {
          method: 'PUT', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ moment_id, data: rij.data, updated_at: rij.updated_at }),
        });
        if (res.ok) {
          const nu = await opslag.invoer(token);
          if (nu[moment_id]?.updated_at === rij.updated_at) { nu[moment_id].teVersturen = false; await opslag.zetInvoer(token, nu); }
        } else open++;
      } catch { open++; }
    }
    const opnames = await opslag.opnames(token);
    for (const o of opnames) {
      if (o.verzonden) continue;
      const blob = await opslag.blob(token, o.client_id);
      if (!blob) { o.verzonden = true; continue; }
      try {
        const fd = new FormData();
        fd.set('bestand', blob, `${o.client_id}`);
        fd.set('moment_id', o.moment_id);
        fd.set('client_id', o.client_id);
        fd.set('duur', String(o.duur));
        const res = await fetch(`/api/p/${token}/opnames`, { method: 'POST', body: fd });
        if (res.ok) { o.verzonden = true; await opslag.wisBlob(token, o.client_id); } else open++;
      } catch { open++; }
    }
    await opslag.zetOpnames(token, opnames);
  } finally {
    bezig = false;
  }
  return open;
}
