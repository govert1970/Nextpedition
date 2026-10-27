'use client';
import { useCallback, useEffect, useState } from 'react';

type Hoofdstuk = { titel: string; tekst: string };
type Deelnemer = {
  id: string; naam: string; telefoon: string; token: string; laatst_actief: string | null;
  voorbereiding: { vak?: string; hoofdstukken?: Hoofdstuk[] }; ingevuld: string[]; opnames: number;
};
type Overzicht = {
  event: { naam: string; datum: string | null; geldig_van: string; geldig_tot: string; reflectie_vuur: string };
  basis: string;
  momenten: { id: string; titel: string; route: string; code: string | null }[];
  deelnemers: Deelnemer[];
};

const leeg = { naam: '', telefoon: '', vak: '', h: [{ titel: '', tekst: '' }, { titel: '', tekst: '' }, { titel: '', tekst: '' }] as Hoofdstuk[] };
const lokaal = (iso: string) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export default function Admin() {
  const [ov, setOv] = useState<Overzicht | null>(null);
  const [ingelogd, setIngelogd] = useState<boolean | null>(null);
  const [melding, setMelding] = useState('');

  const laad = useCallback(async () => {
    const r = await fetch('/api/admin/overzicht', { cache: 'no-store' });
    if (r.status === 401) { setIngelogd(false); return; }
    if (!r.ok) { setMelding('Het overzicht laden lukte niet. Klopt de koppeling met de database?'); setIngelogd(true); return; }
    setOv(await r.json()); setIngelogd(true);
  }, []);
  useEffect(() => { laad(); }, [laad]);

  if (ingelogd === null) return <main className="app"><div className="melding"><p className="mono gedempt">Laden…</p></div></main>;
  if (!ingelogd) return <Login onKlaar={laad} />;

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', paddingBlock: 24, paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="rij"><span className="woordmerk" style={{ color: 'var(--groen)' }}>NEXTPEDITION · FACILITATOR</span>
        <button className="knop licht" style={{ width: 'auto', minHeight: 44 }} onClick={laad}>Vernieuwen</button></div>
      {melding && <p className="fout" role="alert">{melding}</p>}
      {ov && <>
        <Deelnemers ov={ov} onWijzig={laad} />
        <Codewoorden ov={ov} />
        <EventInstellingen ov={ov} onWijzig={laad} />
      </>}
    </main>
  );
}

function Login({ onKlaar }: { onKlaar: () => void }) {
  const [pw, setPw] = useState(''); const [fout, setFout] = useState('');
  return (
    <main className="app"><div className="inhoud" style={{ marginTop: 60 }}>
      <span className="woordmerk" style={{ color: 'var(--groen)' }}>NEXTPEDITION · FACILITATOR</span>
      <form className="slotkaart" onSubmit={async (e) => {
        e.preventDefault(); setFout('');
        const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ wachtwoord: pw }) });
        if (r.ok) onKlaar(); else setFout((await r.json().catch(() => ({}))).fout ?? 'Inloggen lukte niet.');
      }}>
        <div className="veld"><label htmlFor="pw">Wachtwoord</label><input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={{ width: '100%', background: 'var(--vlak)', border: '1px solid var(--lijn)', borderRadius: 12, padding: '12px 14px', minHeight: 48 }} /></div>
        {fout && <p className="fout" role="alert">{fout}</p>}
        <button className="knop" type="submit"><span>Inloggen</span></button>
      </form>
    </div></main>
  );
}

function Deelnemers({ ov, onWijzig }: { ov: Overzicht; onWijzig: () => void }) {
  const [form, setForm] = useState<typeof leeg & { id?: string }>(leeg);
  const [fout, setFout] = useState(''); const [gekopieerd, setGekopieerd] = useState('');
  const totaal = ov.momenten.length;
  const link = (t: string) => `${ov.basis || window.location.origin}/p/${t}`;

  async function opslaan(e: React.FormEvent) {
    e.preventDefault(); setFout('');
    const r = await fetch('/api/admin/deelnemers', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: form.id, naam: form.naam, telefoon: form.telefoon, voorbereiding: { vak: form.vak, hoofdstukken: form.h } }) });
    if (!r.ok) { setFout((await r.json().catch(() => ({}))).fout ?? 'Opslaan lukte niet.'); return; }
    setForm(leeg); onWijzig();
  }
  async function kopieer(t: string) {
    try { await navigator.clipboard.writeText(link(t)); setGekopieerd(t); setTimeout(() => setGekopieerd(''), 2000); } catch { window.prompt('Kopieer deze link', link(t)); }
  }
  async function verwijder(d: Deelnemer) {
    if (!window.confirm(`${d.naam} verwijderen, inclusief alles wat diegene heeft ingevuld?`)) return;
    await fetch(`/api/admin/deelnemers?id=${d.id}`, { method: 'DELETE' }); onWijzig();
  }

  return (
    <section className="sectie">
      <h2 style={{ fontSize: 30 }}>Deelnemers ({ov.deelnemers.length})</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead><tr style={{ textAlign: 'left', color: 'var(--gedempt)' }}>
            <th style={{ padding: 8 }}>Naam</th><th style={{ padding: 8 }}>Telefoon</th><th style={{ padding: 8 }}>Voorbereiding</th>
            <th style={{ padding: 8 }}>Ingevuld</th><th style={{ padding: 8 }}>Opnames</th><th style={{ padding: 8 }}>Laatst actief</th><th style={{ padding: 8 }} />
          </tr></thead>
          <tbody>{ov.deelnemers.map((d) => {
            const titels = (d.voorbereiding.hoofdstukken ?? []).filter((h) => h.titel).length;
            return (
              <tr key={d.id} style={{ borderTop: '1px solid var(--lijn)' }}>
                <td style={{ padding: 8, fontWeight: 600 }}>{d.naam}</td>
                <td style={{ padding: 8, fontVariantNumeric: 'tabular-nums' }}>{d.telefoon || '—'}</td>
                <td style={{ padding: 8 }}>{titels}/3 hoofdstukken{d.voorbereiding.vak ? ' · vak' : ''}</td>
                <td style={{ padding: 8, fontVariantNumeric: 'tabular-nums' }}>{d.ingevuld.length}/{totaal}</td>
                <td style={{ padding: 8, fontVariantNumeric: 'tabular-nums' }}>{d.opnames}</td>
                <td style={{ padding: 8 }}>{d.laatst_actief ? new Date(d.laatst_actief).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' }) : 'nog niet'}</td>
                <td style={{ padding: 8, whiteSpace: 'nowrap', display: 'flex', gap: 6 }}>
                  <button className="knop licht" style={{ minHeight: 36, padding: '6px 10px', width: 'auto', fontSize: 13 }} onClick={() => kopieer(d.token)}>{gekopieerd === d.token ? 'Gekopieerd' : 'Kopieer link'}</button>
                  <button className="knop licht" style={{ minHeight: 36, padding: '6px 10px', width: 'auto', fontSize: 13 }} onClick={() => setForm({ id: d.id, naam: d.naam, telefoon: d.telefoon, vak: d.voorbereiding.vak ?? '',
                    h: [0, 1, 2].map((i) => d.voorbereiding.hoofdstukken?.[i] ?? { titel: '', tekst: '' }) })}>Bewerken</button>
                  <button className="knop licht" style={{ minHeight: 36, padding: '6px 10px', width: 'auto', fontSize: 13, color: 'var(--fout)' }} onClick={() => verwijder(d)}>Verwijderen</button>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      <form className="kaart" onSubmit={opslaan}>
        <h3 style={{ fontSize: 22 }}>{form.id ? `${form.naam} bewerken` : 'Deelnemer toevoegen'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div className="veld"><label htmlFor="naam">Naam</label><input id="naam" type="text" value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })} /></div>
          <div className="veld"><label htmlFor="tel">Mobiel nummer</label><input id="tel" type="text" value={form.telefoon} onChange={(e) => setForm({ ...form, telefoon: e.target.value })} /></div>
          <div className="veld"><label htmlFor="vak">Vak (check-in, optioneel)</label><input id="vak" type="text" value={form.vak} onChange={(e) => setForm({ ...form, vak: e.target.value })} /></div>
        </div>
        {form.h.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(240px, 2fr)', gap: 12 }}>
            <div className="veld"><label htmlFor={`t${i}`}>Hoofdstuk {i + 1}: titel</label>
              <input id={`t${i}`} type="text" value={h.titel} onChange={(e) => { const n = [...form.h]; n[i] = { ...h, titel: e.target.value }; setForm({ ...form, h: n }); }} /></div>
            <div className="veld"><label htmlFor={`x${i}`}>Tekst</label>
              <textarea id={`x${i}`} style={{ minHeight: 70 }} value={h.tekst} onChange={(e) => { const n = [...form.h]; n[i] = { ...h, tekst: e.target.value }; setForm({ ...form, h: n }); }} /></div>
          </div>
        ))}
        {fout && <p className="fout" role="alert">{fout}</p>}
        <div className="rij" style={{ justifyContent: 'flex-start' }}>
          <button className="knop" type="submit" style={{ width: 'auto' }}><span>{form.id ? 'Opslaan' : 'Toevoegen'}</span></button>
          {form.id && <button className="knop licht" type="button" style={{ width: 'auto' }} onClick={() => setForm(leeg)}>Annuleren</button>}
        </div>
      </form>
    </section>
  );
}

function Codewoorden({ ov }: { ov: Overzicht }) {
  return (
    <section className="sectie">
      <h2 style={{ fontSize: 30 }}>Codewoorden</h2>
      <p style={{ color: 'var(--gedempt)', fontSize: 14 }}>Noem het woord bij het waypoint. Aanpassen kan in src/config/codewoorden.ts.</p>
      <div className="kaart" style={{ gap: 6 }}>
        {ov.momenten.filter((m) => m.code).map((m) => (
          <div key={m.id} className="rij" style={{ borderBottom: '1px solid var(--lijn-zacht)', paddingBlock: 6 }}>
            <span><b>{m.route}</b> · {m.titel}</span><span className="mono" style={{ fontSize: 13 }}>{m.code}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function EventInstellingen({ ov, onWijzig }: { ov: Overzicht; onWijzig: () => void }) {
  const [e, setE] = useState({ naam: ov.event.naam, datum: ov.event.datum ?? '', geldig_van: lokaal(ov.event.geldig_van), geldig_tot: lokaal(ov.event.geldig_tot), reflectie_vuur: ov.event.reflectie_vuur });
  const [status, setStatus] = useState('');
  return (
    <section className="sectie">
      <h2 style={{ fontSize: 30 }}>De dag</h2>
      <form className="kaart" onSubmit={async (ev) => {
        ev.preventDefault(); setStatus('');
        const r = await fetch('/api/admin/event', { method: 'PUT', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...e, geldig_van: new Date(e.geldig_van).toISOString(), geldig_tot: new Date(e.geldig_tot).toISOString() }) });
        setStatus(r.ok ? 'Opgeslagen' : 'Opslaan lukte niet'); if (r.ok) onWijzig();
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div className="veld"><label htmlFor="en">Naam</label><input id="en" type="text" value={e.naam} onChange={(x) => setE({ ...e, naam: x.target.value })} /></div>
          <div className="veld"><label htmlFor="ed">Datum</label><input id="ed" type="date" value={e.datum} onChange={(x) => setE({ ...e, datum: x.target.value })} style={{ minHeight: 48, borderRadius: 12, border: '1px solid var(--lijn)', padding: '10px 12px', background: 'var(--vlak)' }} /></div>
          <div className="veld"><label htmlFor="ev">Links werken vanaf</label><input id="ev" type="datetime-local" value={e.geldig_van} onChange={(x) => setE({ ...e, geldig_van: x.target.value })} style={{ minHeight: 48, borderRadius: 12, border: '1px solid var(--lijn)', padding: '10px 12px', background: 'var(--vlak)' }} /></div>
          <div className="veld"><label htmlFor="et">Links werken tot</label><input id="et" type="datetime-local" value={e.geldig_tot} onChange={(x) => setE({ ...e, geldig_tot: x.target.value })} style={{ minHeight: 48, borderRadius: 12, border: '1px solid var(--lijn)', padding: '10px 12px', background: 'var(--vlak)' }} /></div>
        </div>
        <div className="veld"><label htmlFor="er">Jouw reflectie bij het vuur (voor alle verslagen dezelfde)</label>
          <textarea id="er" value={e.reflectie_vuur} onChange={(x) => setE({ ...e, reflectie_vuur: x.target.value })} /></div>
        <div className="rij" style={{ justifyContent: 'flex-start' }}><button className="knop" type="submit" style={{ width: 'auto' }}><span>Opslaan</span></button><span className="status">{status}</span></div>
      </form>
    </section>
  );
}
