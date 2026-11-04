'use client';
import { useEffect, useRef, useState } from 'react';
import { opslag, type OpnameMeta } from '@/lib/opslag';

const MAX_SEC = 5 * 60;

function kiesType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  for (const t of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}
const tijd = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function MicIcoon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C2A29" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" />
    </svg>
  );
}

export default function Opname({ token, momentId, opnames, onNieuw }: {
  token: string; momentId: string; opnames: OpnameMeta[]; onNieuw: () => void;
}) {
  const [aan, setAan] = useState(false);
  const [sec, setSec] = useState(0);
  const [fout, setFout] = useState('');
  const rec = useRef<MediaRecorder | null>(null);
  const stukken = useRef<Blob[]>([]);
  const start = useRef(0);
  const klok = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (klok.current) clearInterval(klok.current); rec.current?.stream.getTracks().forEach((t) => t.stop()); }, []);

  async function begin() {
    setFout('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setFout('Inspreken werkt niet op deze telefoon. Typ je notitie hieronder.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = kiesType();
      const r = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 });
      stukken.current = [];
      r.ondataavailable = (e) => { if (e.data.size) stukken.current.push(e.data); };
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const duur = (Date.now() - start.current) / 1000;
        const blob = new Blob(stukken.current, { type: r.mimeType || mimeType || 'audio/webm' });
        const client_id = crypto.randomUUID();
        await opslag.zetBlob(token, client_id, blob);
        const lijst = await opslag.opnames(token);
        lijst.push({ client_id, moment_id: momentId, duur: Math.round(duur), verzonden: false, gemaakt: new Date().toISOString() });
        await opslag.zetOpnames(token, lijst);
        onNieuw();
      };
      rec.current = r;
      start.current = Date.now();
      r.start(1000);
      setAan(true); setSec(0);
      klok.current = setInterval(() => {
        const s = (Date.now() - start.current) / 1000;
        setSec(s);
        if (s >= MAX_SEC) stop();
      }, 500);
    } catch {
      setFout('Geen toegang tot de microfoon. Geef toegang in je instellingen, of typ je notitie hieronder.');
    }
  }

  function stop() {
    if (klok.current) { clearInterval(klok.current); klok.current = null; }
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop();
    setAan(false);
  }

  const hier = opnames.filter((o) => o.moment_id === momentId);
  return (
    <div className="sectie">
      <button type="button" className={`opneem${aan ? ' aan' : ''}`} onClick={aan ? stop : begin}>
        <span className="mic">{aan ? <span style={{ width: 14, height: 14, background: '#1C2A29', borderRadius: 3 }} /> : <MicIcoon />}</span>
        <span>
          {aan ? `Opnemen… ${tijd(sec)} · tik om te stoppen` : 'Inspreken'}
          <small>{aan ? `Maximaal ${MAX_SEC / 60} minuten` : 'Blijft bewaard, ook zonder bereik'}</small>
        </span>
      </button>
      {fout && <p className="fout" role="alert">{fout}</p>}
      {hier.length > 0 && (
        <ul className="opnamelijst" aria-label="Je opnames bij dit moment">
          {hier.map((o, i) => (
            <li key={o.client_id}>Opname {i + 1} · {tijd(o.duur)} · {o.verzonden ? 'verstuurd' : 'wacht op bereik'}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
