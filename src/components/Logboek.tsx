'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ENERGIEKAART, SLOT_KEUZES, type EntryData, type MomentInhoud } from '@/config/dag';
import { ontsleutel } from '@/lib/crypto';
import { opslag, synchroniseer, voegSamen, type Bundel, type LokaleInvoer, type OpnameMeta } from '@/lib/opslag';
import Opname from '@/components/Opname';

type Weergave = { soort: 'route' } | { soort: 'moment'; id: string };

const Pijl = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EFBA28" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);
const Terug = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
);
const Slot = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
const Vinkje = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1C2A29" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
);
const Vlag = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EFBA28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 2 }}><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>
);
const Topo = () => (
  <svg className="topo" aria-hidden="true" width="390" height="300" viewBox="0 0 390 300" fill="none">
    <path d="M-10 70 C60 30 130 110 210 70 S330 20 400 60" stroke="#F4F6F2" strokeOpacity="0.10" />
    <path d="M-10 95 C55 60 140 135 220 95 S330 50 400 85" stroke="#F4F6F2" strokeOpacity="0.10" />
    <path d="M-10 120 C50 90 150 160 230 120 S330 80 400 110" stroke="#F4F6F2" strokeOpacity="0.10" />
    <circle cx="318" cy="208" r="22" stroke="#F4F6F2" strokeOpacity="0.10" />
    <circle cx="318" cy="208" r="44" stroke="#F4F6F2" strokeOpacity="0.10" />
    <circle cx="318" cy="208" r="68" stroke="#F4F6F2" strokeOpacity="0.10" />
    <path d="M262 46 C292 70 270 110 300 130 S346 160 330 196" stroke="#EFBA28" strokeWidth="2" strokeDasharray="5 6" />
    <circle cx="262" cy="46" r="5" fill="#EFBA28" />
    <circle cx="300" cy="130" r="5" fill="#EFBA28" />
    <circle cx="330" cy="196" r="6" fill="#2C4D4B" stroke="#EFBA28" strokeWidth="2" />
  </svg>
);

function heeftInhoud(d?: EntryData): boolean {
  if (!d) return false;
  return Boolean(d.notes?.trim() || d.door?.trim() || d.keuze || Object.values(d.fields ?? {}).some((v) => v?.trim()));
}

export default function Logboek({ token }: { token: string }) {
  const [bundel, setBundel] = useState<Bundel | null>(null);
  const [fout, setFout] = useState('');
  const [open, setOpen] = useState<Record<string, MomentInhoud>>({});
  const [invoer, setInvoer] = useState<Record<string, LokaleInvoer>>({});
  const [opnames, setOpnames] = useState<OpnameMeta[]>([]);
  const [weergave, setWeergave] = useState<Weergave>({ soort: 'route' });
  const [wachtend, setWachtend] = useState(0);
  const [online, setOnline] = useState(true);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- laden ----------
  useEffect(() => {
    let weg = false;
    (async () => {
      const [lb, lo, li, lop] = await Promise.all([opslag.bundel(token), opslag.open(token), opslag.invoer(token), opslag.opnames(token)]);
      let b: Bundel | undefined = lb;
      try {
        const res = await fetch(`/api/p/${token}`, { cache: 'no-store' });
        if (res.ok) { b = (await res.json()) as Bundel; await opslag.zetBundel(token, b); }
        else if (!lb) { const j = await res.json().catch(() => ({})); if (!weg) setFout(j.fout ?? 'Deze link werkt niet.'); return; }
      } catch { /* geen bereik: verder met wat lokaal staat */ }
      if (!b) { if (!weg) setFout('Er is nu geen bereik. Open de link opnieuw zodra je verbinding hebt.'); return; }
      const openNu = { ...lo };
      for (const m of b.momenten) if (!m.dicht) openNu[m.id] = m.inhoud;
      const samen = voegSamen(b.entries ?? {}, li);
      if (weg) return;
      setBundel(b); setOpen(openNu); setInvoer(samen); setOpnames(lop);
      await opslag.zetOpen(token, openNu); await opslag.zetInvoer(token, samen);
      try { localStorage.setItem('np_token', token); } catch { /* niet erg */ }
    })();
    return () => { weg = true; };
  }, [token]);

  // ---------- synchroniseren ----------
  const sync = useCallback(async () => {
    const n = await synchroniseer(token);
    if (n >= 0) setWachtend(n);
    setOpnames(await opslag.opnames(token));
  }, [token]);
  const syncStraks = useCallback(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(sync, 1200);
  }, [sync]);
  useEffect(() => {
    const aan = () => { setOnline(true); sync(); };
    const uit = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener('online', aan); window.addEventListener('offline', uit);
    const iv = setInterval(sync, 20000);
    sync();
    return () => { window.removeEventListener('online', aan); window.removeEventListener('offline', uit); clearInterval(iv); };
  }, [sync]);

  const bewaar = useCallback((momentId: string, data: EntryData) => {
    setInvoer((oud) => {
      const nieuw = { ...oud, [momentId]: { data, updated_at: new Date().toISOString(), teVersturen: true } };
      opslag.zetInvoer(token, nieuw);
      return nieuw;
    });
    syncStraks();
  }, [token, syncStraks]);

  const ontgrendel = useCallback(async (code: string): Promise<string[]> => {
    if (!bundel) return [];
    const nieuw: string[] = [];
    const openNu = { ...open };
    for (const m of bundel.momenten) {
      if (!m.dicht || openNu[m.id]) continue;
      const inhoud = await ontsleutel<MomentInhoud>(m.slot, code);
      if (inhoud) { openNu[m.id] = inhoud; nieuw.push(m.id); }
    }
    if (nieuw.length) { setOpen(openNu); await opslag.zetOpen(token, openNu); }
    return nieuw;
  }, [bundel, open, token]);

  const momenten = bundel?.momenten ?? [];
  const klaar = useMemo(() => new Set(momenten.filter((m) => heeftInhoud(invoer[m.id]?.data)).map((m) => m.id)), [momenten, invoer]);
  const opnameMomenten = useMemo(() => new Set(opnames.map((o) => o.moment_id)), [opnames]);

  if (fout) return <main className="app"><div className="melding"><span className="woordmerk" style={{ color: 'var(--groen)' }}>NEXTPEDITION</span><p>{fout}</p></div></main>;
  if (!bundel) return <main className="app"><div className="melding"><span className="woordmerk" style={{ color: 'var(--groen)' }}>NEXTPEDITION</span><p className="mono gedempt">Laden…</p></div></main>;

  const isKlaar = (id: string) => klaar.has(id) || opnameMomenten.has(id);
  const aantalKlaar = momenten.filter((m) => isKlaar(m.id)).length;
  const nuId = [...momenten].reverse().find((m) => open[m.id] && m.dicht && !isKlaar(m.id))?.id
    ?? momenten.find((m) => open[m.id] && !isKlaar(m.id))?.id;

  const statusRegel = !online ? 'Geen bereik · alles blijft bewaard op je telefoon'
    : wachtend > 0 ? `${wachtend} nog te versturen` : 'Alles is bewaard';

  if (weergave.soort === 'route') {
    const voornaam = bundel.deelnemer.naam.split(' ')[0];
    return (
      <main className="app">
        <header className="kop">
          <Topo />
          <div className="rij"><span className="woordmerk">NEXTPEDITION</span><span className="mono licht">BEVER · ALUMNI</span></div>
          <h1 style={{ marginTop: 8, fontSize: 46 }}>Welkom,<br />{voornaam}</h1>
          <p className="lead">Zes legs, één route. Na elke leg houd je vast wat je raakte, door te typen of in te spreken.</p>
          <div className="sectie" style={{ gap: 8, marginTop: 6 }}>
            <div className="rij mono licht"><span>{aantalKlaar} van {momenten.length} vastgelegd</span><span>{statusRegel}</span></div>
            <div className="balk"><i style={{ width: `${(aantalKlaar / momenten.length) * 100}%` }} /></div>
          </div>
        </header>
        <div className="inhoud" style={{ paddingTop: 14 }}>
          <ol className="route" aria-label="Route van de dag">
            {momenten.map((m) => {
              const isOpen = Boolean(open[m.id]);
              const k = isKlaar(m.id);
              const cls = ['stop', k ? 'klaar' : '', m.id === nuId ? 'nu' : '', !isOpen ? 'dicht' : ''].join(' ');
              return (
                <li key={m.id}>
                  <button type="button" className={cls} onClick={() => { setWeergave({ soort: 'moment', id: m.id }); window.scrollTo(0, 0); }}>
                    <span className="stip">{k && <Vinkje />}</span>
                    <span className="t">
                      <span className="mono gedempt" style={{ fontSize: 10.5 }}>{isOpen ? open[m.id].label : m.route.toUpperCase()}</span>
                      <b>{isOpen ? open[m.id].titel : 'Gaat open bij het waypoint'}</b>
                    </span>
                    {!isOpen ? <span className="slotje"><Slot /></span> : m.id === nuId ? <span className="label-goud">NU</span> : <span />}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </main>
    );
  }

  const idx = momenten.findIndex((m) => m.id === weergave.id);
  const m = momenten[idx];
  const volgende = momenten[idx + 1];
  const inhoud = open[m.id];
  const naarRoute = () => { setWeergave({ soort: 'route' }); window.scrollTo(0, 0); };
  const naar = (id: string) => { setWeergave({ soort: 'moment', id }); window.scrollTo(0, 0); };

  // zin uit het vorige moment met een doorgeefzin
  let vorige: { titel: string; zin: string } | null = null;
  for (let j = idx - 1; j >= 0; j--) {
    const vi = open[momenten[j].id];
    if (vi?.doorgeef) { const zin = invoer[momenten[j].id]?.data.door?.trim(); if (zin) vorige = { titel: vi.titel, zin }; break; }
  }

  return (
    <main className="app">
      <header className="kop">
        <div className="rij">
          <button type="button" className="terug" onClick={naarRoute}><Terug />Route</button>
          <span className="mono licht">Waypoint {String(idx + 1).padStart(2, '0')} / {momenten.length}</span>
        </div>
        <div className="balk" style={{ height: 4 }}><i style={{ width: `${((idx + 1) / momenten.length) * 100}%` }} /></div>
        {inhoud ? (
          <>
            <span className="label-goud">{inhoud.label}</span>
            <h1>{inhoud.titel}</h1>
            {vorige && (
              <div className="uit-vorige"><Vlag /><div><span className="mono">Uit {vorige.titel}</span><p>{vorige.zin}</p></div></div>
            )}
          </>
        ) : (
          <>
            <span className="label-goud">{m.route.toUpperCase()}</span>
            <h1>Nog dicht</h1>
          </>
        )}
      </header>
      {inhoud
        ? <MomentScherm key={m.id} token={token} id={m.id} inhoud={inhoud} bundel={bundel} invoer={invoer[m.id]?.data ?? {}}
            opnames={opnames} bewaar={bewaar} onOpname={sync} status={statusRegel}
            volgende={volgende ? { titel: open[volgende.id]?.titel ?? volgende.route, ga: () => naar(volgende.id) } : null}
            klaar={naarRoute} />
        : <Ontgrendel key={m.id} ontgrendel={ontgrendel} />}
    </main>
  );
}

function Ontgrendel({ ontgrendel }: { ontgrendel: (c: string) => Promise<string[]> }) {
  const [code, setCode] = useState('');
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState('');
  return (
    <div className="inhoud">
      <form className="slotkaart" onSubmit={async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setBezig(true); setFout('');
        const n = await ontgrendel(code);
        setBezig(false);
        if (!n.length) setFout('Dat codewoord klopt niet. Controleer de spelling, of vraag het nog een keer.');
      }}>
        <p>Deze leg gaat open bij het waypoint. Vul het codewoord in dat je facilitator noemt.</p>
        <div className="veld">
          <label htmlFor="code">Codewoord</label>
          <input id="code" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        {fout && <p className="fout" role="alert">{fout}</p>}
        <button className="knop" type="submit" disabled={bezig}><span>{bezig ? 'Even kijken…' : 'Openen'}</span><Pijl /></button>
      </form>
    </div>
  );
}

function MomentScherm({ token, id, inhoud, bundel, invoer, opnames, bewaar, onOpname, status, volgende, klaar }: {
  token: string; id: string; inhoud: MomentInhoud; bundel: Bundel; invoer: EntryData; opnames: OpnameMeta[];
  bewaar: (id: string, d: EntryData) => void; onOpname: () => void; status: string;
  volgende: { titel: string; ga: () => void } | null; klaar: () => void;
}) {
  const [data, setData] = useState<EntryData>(invoer);
  const zet = (patch: Partial<EntryData>) => { const nieuw = { ...data, ...patch }; setData(nieuw); bewaar(id, nieuw); };
  const zetVeld = (vid: string, v: string) => zet({ fields: { ...(data.fields ?? {}), [vid]: v } });
  const hoofdstukken = bundel.deelnemer.voorbereiding?.hoofdstukken?.filter((h) => h.titel?.trim()) ?? [];

  if (id === 'slot') {
    return (
      <div className="inhoud">
        <p style={{ color: 'var(--gedempt)' }}>{inhoud.concept}</p>
        <div className="keuzes">
          {(Object.keys(SLOT_KEUZES) as (keyof typeof SLOT_KEUZES)[]).map((k) => (
            <button key={k} type="button" className="keuze" aria-pressed={data.keuze === k} onClick={() => zet({ keuze: k })}>
              <b>{SLOT_KEUZES[k].label}</b><span>{SLOT_KEUZES[k].uitleg}</span>
            </button>
          ))}
        </div>
        <div className="veld">
          <label htmlFor="waarom">Waarom kies je dit?</label>
          <textarea id="waarom" style={{ minHeight: 110 }} value={data.waarom ?? ''} onChange={(e) => zet({ waarom: e.target.value })} placeholder="Een paar zinnen is genoeg" />
        </div>
        <p className="status" aria-live="polite">{status}</p>
        <button type="button" className="knop" onClick={klaar}><span>Afronden</span><Pijl /></button>
        <p style={{ fontSize: 14, color: 'var(--gedempt)' }}>Je verslag krijg je de ochtend na de dag van Govert, via WhatsApp.</p>
      </div>
    );
  }

  return (
    <div className="inhoud">
      {(inhoud.concept || inhoud.chips) && (
        <section className="sectie">
          <span className="mono gedempt">Centraal</span>
          {inhoud.chips && (
            <div className="chips">
              {inhoud.chips.map((c, i) => (
                <span key={c} className={`chip${inhoud.laatsteChipGestippeld && i === inhoud.chips!.length - 1 ? ' gestippeld' : ''}`}>{c}</span>
              ))}
            </div>
          )}
          {inhoud.concept && <p style={{ fontSize: 15, color: '#3F4F4D' }}>{inhoud.concept}</p>}
        </section>
      )}

      {id === 'e1' && hoofdstukken.length > 0 && (
        <section className="sectie">
          <span className="mono gedempt">Jouw hoofdstukken</span>
          <div className="chips">
            {hoofdstukken.map((h, i) => <span key={i} className="chip gestippeld">{i + 1} · {h.titel}</span>)}
          </div>
        </section>
      )}

      {(inhoud.start || inhoud.rondes) && (
        <section className="kaart">
          <div className="rij"><span className="mono gedempt">{(inhoud.rondes?.length ?? 0) > 1 ? 'Het gesprek' : 'Opdracht'}</span>
            {(inhoud.rondes?.length ?? 0) > 1 && <span style={{ fontSize: 13, color: 'var(--gedempt)' }}>Vrager · verteller · spiegel</span>}</div>
          {inhoud.start && <p style={{ fontWeight: 600, fontSize: 16 }}>{inhoud.start}</p>}
          {inhoud.rondes && inhoud.rondes.length > 1 ? (
            <ol className="rondes">{inhoud.rondes.map((r, i) => <li key={i}><span className="nr">{i + 1}</span><span>{r}</span></li>)}</ol>
          ) : inhoud.rondes?.[0] ? <p>{inhoud.rondes[0]}</p> : null}
          {inhoud.rolwissel && <p className="voetregel">{inhoud.rolwissel}</p>}
        </section>
      )}

      {inhoud.energiekaart && (
        <section className="energie" aria-label="Energiekaart">
          <div className="as-v" aria-hidden="true"><span>HOOG</span><b>ENERGIE</b><span>LAAG</span></div>
          <div className="vakken">
            {ENERGIEKAART.map((v) => (
              <div key={v.id} className={`vak${v.id === 'lh' ? ' goud' : ''}`}>
                <label htmlFor={`f-${v.id}`}>{v.label}</label>
                <textarea id={`f-${v.id}`} value={data.fields?.[v.id] ?? ''} onChange={(e) => zetVeld(v.id, e.target.value)} placeholder="Trefwoorden" />
              </div>
            ))}
          </div>
          <div className="as-h" aria-hidden="true"><span>LAAG</span><b>ONDERSCHEIDENDE WAARDE</b><span>HOOG</span></div>
        </section>
      )}

      {inhoud.velden?.map((v) => (
        <div key={v.id} className="veld">
          <label htmlFor={`f-${v.id}`}>{v.label}</label>
          <input id={`f-${v.id}`} type="text" value={data.fields?.[v.id] ?? ''} onChange={(e) => zetVeld(v.id, e.target.value)} />
        </div>
      ))}

      {inhoud.vraag && (
        <section className="sectie">
          <span className="mono gedempt">Bij het waypoint</span>
          <label htmlFor="notitie" className="vraag">{inhoud.vraag}</label>
          <Opname token={token} momentId={id} opnames={opnames} onNieuw={onOpname} />
          <textarea id="notitie" value={data.notes ?? ''} onChange={(e) => zet({ notes: e.target.value })} placeholder="Of typ hier wat je bezighoudt…" />
        </section>
      )}

      {inhoud.doorgeef && (
        <div className="veld">
          <label htmlFor="door">{inhoud.doorgeef}</label>
          <input id="door" type="text" className="doorgeef" value={data.door ?? ''} onChange={(e) => zet({ door: e.target.value })} />
          <span className="hint">Deze zin staat bovenaan het volgende moment.</span>
        </div>
      )}

      <p className="status" aria-live="polite">{status}</p>

      {volgende ? (
        <button type="button" className="knop" onClick={volgende.ga}>
          <span style={{ display: 'flex', flexDirection: 'column' }}><span className="mono">Volgende</span>{volgende.titel}</span><Pijl />
        </button>
      ) : (
        <button type="button" className="knop" onClick={klaar}><span>Terug naar de route</span><Pijl /></button>
      )}
    </div>
  );
}
