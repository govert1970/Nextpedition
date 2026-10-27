import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { MOMENTEN, type MomentInhoud } from '@/config/dag';
import { CODEWOORDEN } from '@/config/codewoorden';
import { versleutel, type Versleuteld } from '@/lib/crypto';

// ---------- Database ----------
let _db: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (_db) return _db;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY ontbreken in de omgeving.');
  _db = createClient(url, key, { auth: { persistSession: false } });
  return _db;
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

// ---------- Deelnemers ----------
export function nieuwToken(): string {
  return randomBytes(18).toString('base64url');
}

export type Deelnemer = {
  id: string; event_id: string; naam: string; telefoon: string; token: string;
  voorbereiding: { vak?: string; hoofdstukken?: { titel: string; tekst: string }[] };
};
export type Event = { id: string; slug: string; naam: string; datum: string | null; geldig_van: string; geldig_tot: string; reflectie_vuur: string };

/** Zoekt de deelnemer bij een persoonlijke link en controleert of de link nu geldig is. */
export async function deelnemerBijToken(token: string): Promise<{ deelnemer: Deelnemer; event: Event } | { fout: string; status: number }> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return { fout: 'Deze link klopt niet.', status: 404 };
  const { data, error } = await db().from('participants').select('*, events(*)').eq('token', token).maybeSingle();
  if (error) return { fout: 'Er ging iets mis bij het ophalen.', status: 500 };
  if (!data) return { fout: 'Deze link klopt niet.', status: 404 };
  const event = (data as { events: Event }).events;
  const nu = Date.now();
  if (nu < Date.parse(event.geldig_van) || nu > Date.parse(event.geldig_tot)) {
    return { fout: 'Deze link werkt alleen rond de dag van de Nextpedition.', status: 403 };
  }
  const { events: _e, ...deelnemer } = data as Deelnemer & { events: Event };
  return { deelnemer, event };
}

// ---------- Inhoud van de dag ----------
export type PubliekMoment =
  | { id: string; route: string; soort: string; dicht: false; inhoud: MomentInhoud }
  | { id: string; route: string; soort: string; dicht: true; slot: Versleuteld };

let _inhoud: Promise<PubliekMoment[]> | null = null;
/** Dichte momenten gaan versleuteld mee; het codewoord zelf verlaat de server nooit. */
export function dagInhoud(): Promise<PubliekMoment[]> {
  if (_inhoud) return _inhoud;
  _inhoud = Promise.all(
    MOMENTEN.map(async (m): Promise<PubliekMoment> => {
      if (!m.dicht) return { id: m.id, route: m.route, soort: m.soort, dicht: false, inhoud: m.inhoud };
      const code = CODEWOORDEN[m.id];
      if (!code) throw new Error(`Geen codewoord voor moment ${m.id}`);
      return { id: m.id, route: m.route, soort: m.soort, dicht: true, slot: await versleutel(m.inhoud, code) };
    }),
  );
  return _inhoud;
}

// ---------- Facilitator ----------
const COOKIE = 'np_admin';
function handtekening(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 24) throw new Error('ADMIN_SECRET ontbreekt of is te kort.');
  return createHmac('sha256', secret).update('facilitator-v1').digest('base64url');
}
export function wachtwoordKlopt(pw: string): boolean {
  const echt = process.env.ADMIN_PASSWORD ?? '';
  const a = Buffer.from(pw);
  const b = Buffer.from(echt);
  return echt.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}
export function zetAdminCookie() {
  cookies().set(COOKIE, handtekening(), { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 14 });
}
export function isAdmin(): boolean {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return false;
  const a = Buffer.from(c);
  const b = Buffer.from(handtekening());
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function huidigEvent(): Promise<Event> {
  const { data, error } = await db().from('events').select('*').order('created_at', { ascending: true }).limit(1).single();
  if (error || !data) throw new Error('Geen event gevonden. Draai eerst supabase/schema.sql.');
  return data as Event;
}
