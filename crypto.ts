// Versleuteling van dichte momenten. Werkt zowel op de server (Node 20+) als in de browser (WebCrypto).
// Sleutel = PBKDF2(codewoord, salt) → AES-GCM. Zonder het juiste codewoord valt de inhoud niet te lezen.

export type Versleuteld = { salt: string; iv: string; data: string };

const ITERATIES = 150_000;
const enc = new TextEncoder();
const dec = new TextDecoder();

export function normaliseer(code: string): string {
  return code.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
}

function b64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sleutel(code: string, salt: Uint8Array): Promise<CryptoKey> {
  const basis = await crypto.subtle.importKey('raw', enc.encode(normaliseer(code)), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIES, hash: 'SHA-256' },
    basis,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function versleutel(waarde: unknown, code: string): Promise<Versleuteld> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await sleutel(code, salt);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, enc.encode(JSON.stringify(waarde))));
  return { salt: b64(salt), iv: b64(iv), data: b64(data) };
}

/** Geeft de inhoud terug, of null als het codewoord niet klopt. */
export async function ontsleutel<T>(v: Versleuteld, code: string): Promise<T | null> {
  try {
    const k = await sleutel(code, unb64(v.salt));
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(v.iv) }, k, unb64(v.data));
    return JSON.parse(dec.decode(plain)) as T;
  } catch {
    return null;
  }
}
