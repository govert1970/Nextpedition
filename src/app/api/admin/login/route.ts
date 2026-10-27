import { json, wachtwoordKlopt, zetAdminCookie } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { wachtwoord } = (await req.json().catch(() => ({}))) as { wachtwoord?: string };
  if (!wachtwoord || !wachtwoordKlopt(wachtwoord)) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ fout: 'Dat wachtwoord klopt niet.' }, 401);
  }
  zetAdminCookie();
  return json({ ok: true });
}
