# Nextpedition

Logboek-app voor de Nextpedition: een persoonlijke link per deelnemer, legs die opengaan met een codewoord,
notities en opnames die eerst op de telefoon worden bewaard en zodra er bereik is naar de server gaan,
en een facilitatorscherm op `/admin`.

## Wat er al is
- Persoonlijke link per deelnemer: `/p/<token>`, geldig binnen de periode die je bij “De dag” instelt.
- Route en momenten volgens het design (Bever-groen en -goud).
- Dichte momenten gaan versleuteld naar de telefoon en openen alleen met het codewoord, ook zonder bereik.
  De codewoorden zelf verlaten de server nooit.
- Doorgeefzin: de zin aan het eind van een leg staat bovenaan het volgende moment.
- Energiekaart (2×2) bij Advanced Basecamp, de drie hoofdstuktitels uit de voorbereiding bij leg 1.
- Inspreken (max. 5 minuten per opname), bewaard zonder bereik en later verstuurd.
- Facilitatorscherm: deelnemers toevoegen en bewerken (met voorbereiding), links kopiëren, voortgang,
  codewoorden, geldigheid van de links, je reflectie bij het vuur.

## Wat nog komt (tweede ronde)
- Transcriptie van de opnames.
- Het verslag: AI-stap met de vaste grenzen, opmaak als pdf, downloaden per deelnemer om te WhatsAppen.

## Inhoud aanpassen
- Teksten en vragen per moment: `src/config/dag.ts`.
- Codewoorden: `src/config/codewoorden.ts`.

## Opzetten
1. **Supabase**: maak een project aan in regio EU. Open de SQL-editor en voer `supabase/schema.sql` uit.
   Pas daarna bij “De dag” in `/admin` de datum en de geldigheid van de links aan.
2. **Hosting (Vercel)**: koppel deze repository. Zet onder Environment Variables de waarden uit `.env.example`.
3. Open `/admin`, log in met `ADMIN_PASSWORD` en voeg de deelnemers toe.

## Lokaal
```
npm install
cp .env.example .env.local   # en vul de waarden in
npm run dev
npm test                      # test codewoorden en versleuteling
```
