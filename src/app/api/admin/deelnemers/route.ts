import { db, huidigEvent, isAdmin, json, nieuwToken } from '@/lib/server';

export const dynamic = 'force-dynamic';

type Invoer = {
  id?: string; naam?: string; telefoon?: string;
  voorbereiding?: { vak?: string; hoofdstukken?: { titel?: string; tekst?: string }[] };
};

function schoon(v: Invoer['voorbereiding']) {
  const h = (v?.hoofdstukken ?? []).slice(0, 3).map((x) => ({ titel: String(x?.titel ?? '').slice(0, 200), tekst: String(x?.tekst ?? '').slice(0, 6000) }));
  return { vak: String(v?.vak ?? '').slice(0, 300), hoofdstukken: h };
}

export async function POST(req: Request) {
  if (!isAdmin()) return json({ fout: 'Niet ingelogd.' }, 401);
  const body = (await req.json().catch(() => ({}))) as Invoer;
  const naam = String(body.naam ?? '').trim().slice(0, 120);
  if (!naam) return json({ fout: 'Vul een naam in.' }, 400);
  const rij = { naam, telefoon: String(body.telefoon ?? '').trim().slice(0, 40), voorbereiding: schoon(body.voorbereiding) };
  if (body.id) {
    const { error } = await db().from('participants').update(rij).eq('id', body.id);
    if (error) return json({ fout: 'Opslaan lukte niet.' }, 500);
    return json({ ok: true });
  }
  const event = await huidigEvent();
  const { error } = await db().from('participants').insert({ ...rij, event_id: event.id, token: nieuwToken() });
  if (error) return json({ fout: 'Toevoegen lukte niet.' }, 500);
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAdmin()) return json({ fout: 'Niet ingelogd.' }, 401);
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return json({ fout: 'Geen deelnemer opgegeven.' }, 400);
  const { error } = await db().from('participants').delete().eq('id', id);
  if (error) return json({ fout: 'Verwijderen lukte niet.' }, 500);
  return json({ ok: true });
}
