import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versleutel, ontsleutel, normaliseer } from '../src/lib/crypto.ts';
import { MOMENTEN } from '../src/config/dag.ts';
import { CODEWOORDEN } from '../src/config/codewoorden.ts';

test('elk dicht moment heeft een codewoord', () => {
  for (const m of MOMENTEN) if (m.dicht) assert.ok(CODEWOORDEN[m.id], `codewoord ontbreekt voor ${m.id}`);
});

test('momenten hebben unieke ids', () => {
  assert.equal(new Set(MOMENTEN.map((m) => m.id)).size, MOMENTEN.length);
});

test('juist codewoord opent de inhoud, ongeacht hoofdletters en spaties', async () => {
  const inhoud = { titel: 'Emotional map', rondes: ['a', 'b'] };
  const slot = await versleutel(inhoud, 'Lantaarn');
  assert.deepEqual(await ontsleutel(slot, '  LANTAARN '), inhoud);
});

test('verkeerd codewoord geeft niets terug', async () => {
  const slot = await versleutel({ x: 1 }, 'kompas');
  assert.equal(await ontsleutel(slot, 'kompass'), null);
});

test('versleutelde inhoud bevat de tekst niet leesbaar', async () => {
  const slot = await versleutel({ titel: 'Spijt voorkomen' }, 'vuurtoren');
  assert.ok(!JSON.stringify(slot).includes('Spijt'));
  assert.equal(normaliseer(' Vuur  Toren '), 'vuur toren');
});
