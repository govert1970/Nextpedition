// De inhoud van de dag. Teksten kun je hier aanpassen zonder dat er iets herbouwd hoeft te worden:
// alleen het soort invoer per moment (velden, kaart, doorgeefzin) bepaalt welk scherm er komt.
// Codewoorden staan apart in codewoorden.ts (alleen op de server).

export type Veld = { id: string; label: string };

export type MomentInhoud = {
  label: string; // het label in beeld, bijv. "LEG 2 · DRIETAL"
  titel: string;
  concept?: string;
  chips?: string[]; // losse labels bij het concept (bijv. de vijf emoties)
  laatsteChipGestippeld?: boolean;
  start?: string; // openingsvraag die de draad uit de vorige leg oppakt
  rondes?: string[];
  rolwissel?: string; // regel onder het gesprek
  velden?: Veld[];
  energiekaart?: boolean; // de 2×2-kaart van Advanced Basecamp
  vraag?: string; // reflectievraag bij het waypoint (typen of inspreken)
  doorgeef?: string; // label van de zin die mee gaat naar het volgende moment
};

export type Moment = {
  id: string;
  route: string; // wat op de route staat zolang het moment dicht is
  soort: 'basecamp' | 'leg' | 'stop' | 'slot';
  dicht: boolean; // gaat pas open met een codewoord
  inhoud: MomentInhoud;
};

export const ENERGIEKAART: Veld[] = [
  { id: 'hl', label: 'Hoge energie · lage waarde' },
  { id: 'hh', label: 'Hoge energie · hoge waarde' },
  { id: 'll', label: 'Lage energie · lage waarde' },
  { id: 'lh', label: 'Lage energie · hoge waarde' },
];

export const MOMENTEN: Moment[] = [
  {
    id: 'basecamp', route: 'Basecamp', soort: 'basecamp', dicht: false,
    inhoud: {
      label: 'BASECAMP · CHECK-IN', titel: 'Een vak voor het leven',
      concept: 'Vroeger koos je één vak en bleef je er je hele leven mee verbonden. Eén curve.',
      rondes: [
        'Stel dat je vóór internet en de digitale revolutie had geleefd. Welk vak was het dan geworden? Waar en wanneer werk je, en heb je het gekozen of ben je erin gerold?',
        'Ga op de tijdlijn staan, in de tijd van je vak, en vertel het in één minuut.',
        'Brief van toen: lees hem in stilte terug. Heb je hem niet meer? Schrijf in één zin op wat je toen hoopte.',
      ],
      velden: [{ id: 'vak', label: 'Mijn vak, plaats en tijd' }],
      vraag: 'Wat zag je terug in je brief, of wat hoopte je toen?',
    },
  },
  {
    id: 'e1', route: 'Leg 1', soort: 'leg', dicht: true,
    inhoud: {
      label: 'LEG 1 · DRIETAL', titel: 'Toen en nu',
      concept: 'Je verhaal sinds de Expeditie, in drie hoofdstukken.',
      rondes: [
        'Vertel je drie hoofdstukken, elk met de titel die je vooraf koos.',
        'Wat was het hoogtepunt, wat het dieptepunt, en welk keerpunt zie je pas achteraf als keerpunt?',
        'Spiegel: benoem het patroon dat je hoorde en dat de verteller zelf niet uitsprak.',
      ],
      rolwissel: 'Wissel drie keer van rol, zodat iedereen één keer verteller is.',
      vraag: 'Welk patroon benoemde je spiegel, en klopt dat voor jou?',
      doorgeef: 'Het patroon in één zin',
    },
  },
  {
    id: 'e2', route: 'Leg 2', soort: 'leg', dicht: true,
    inhoud: {
      label: 'LEG 2 · DRIETAL', titel: 'Emotional map',
      concept: 'Vier basisemoties, en de vijfde: het gebrek aan emotie.',
      chips: ['Bang', 'Boos', 'Blij', 'Bedroefd', 'Gevoelloos'], laatsteChipGestippeld: true,
      start: 'Begin bij je patroon uit leg 1: welke emotie zit eronder?',
      rondes: [
        'Als elke emotie een persoon was: hoe dichtbij staat die bij jou? Wie houd je liever op afstand?',
        'Hoe reageer je als je die emotie bij een ander tegenkomt?',
        'Wat valt je op in je antwoorden? Zie je een patroon?',
      ],
      rolwissel: 'Wissel drie keer van rol, zodat iedereen één keer verteller is.',
      vraag: 'Welke emotie staat het verst van je af, en wat kost je dat?',
      doorgeef: 'De emotie die je het verst weghoudt',
    },
  },
  {
    id: 'e3', route: 'Leg 3', soort: 'leg', dicht: true,
    inhoud: {
      label: 'LEG 3 · DRIETAL', titel: 'Je volgende curve',
      concept: 'Elke fase volgt een S-curve: opstarten, groeien, afvlakken. Begin aan de volgende voordat de huidige zijn top bereikt.',
      rondes: [
        'Waar op je curve sta je nu: opstarten, groeien of afvlakken? Hoeveel curves heb je al doorlopen?',
        'Wat heeft je hier gebracht, en wat houd je daarvan vast terwijl het je volgende stap niet meer helpt?',
        'Wat vraagt je volgende curve van je, en wanneer zou je eraan moeten beginnen?',
      ],
      rolwissel: 'Wissel drie keer van rol, zodat iedereen één keer verteller is.',
      velden: [{ id: 'fase', label: 'Waar ik nu sta op mijn curve' }],
      vraag: 'Wat zou je moeten loslaten om aan je volgende curve te beginnen?',
      doorgeef: 'Waar je op je curve staat, in één zin',
    },
  },
  {
    id: 'lunch', route: 'Advanced Basecamp', soort: 'stop', dicht: true,
    inhoud: {
      label: 'ADVANCED BASECAMP · LUNCH', titel: 'Waar gaat je energie naartoe?',
      concept: 'Je agenda van de afgelopen twee weken, in trefwoorden. Tien minuten, aan tafel.',
      energiekaart: true,
      velden: [{ id: 'curve', label: 'Klopt je kaart met waar je op je curve staat?' }],
    },
  },
  {
    id: 'e4', route: 'Leg 4', soort: 'leg', dicht: true,
    inhoud: {
      label: 'LEG 4 · DRIETAL', titel: 'Wat draag je mee?',
      concept: 'Wat je zelf kiest, weegt anders dan wat op je bord belandt.',
      start: 'Pak je energiekaart erbij.',
      rondes: [
        'Wat staat er in ‘lage energie, hoge waarde’? Wat daarvan heb je zelf gekozen, en wat is op je bord beland?',
        'Wat had je allang neergelegd als je niet bang was iets te verliezen? Welke emotie van je kaart houdt je daar?',
        'Kies je kwestie voor de trojka in de volgende leg.',
      ],
      rolwissel: 'Wissel drie keer van rol, zodat iedereen één keer verteller is.',
      vraag: 'Wat zou je neerleggen, en wat houdt je tegen?',
      doorgeef: 'Je kwestie voor de trojka',
    },
  },
  {
    id: 'e5', route: 'Leg 5', soort: 'leg', dicht: true,
    inhoud: {
      label: 'LEG 5 · TROJKA', titel: 'Trojka',
      concept: 'Eén inbrenger, twee adviseurs. Iedereen is één keer inbrenger.',
      rondes: [
        'Inbrenger: leg je kwestie voor. De anderen vragen alleen door.',
        'Inbrenger loopt een stukje vooruit en luistert mee. De twee adviseurs bespreken de kwestie hardop.',
        'Inbrenger sluit weer aan: wat neem je mee, wat laat je liggen?',
      ],
      vraag: 'Welk advies blijft hangen?',
      doorgeef: 'Het advies dat je meeneemt',
    },
  },
  {
    id: 'e6', route: 'Leg 6', soort: 'leg', dicht: true,
    inhoud: {
      label: 'LEG 6 · DRIETAL', titel: 'Spijt voorkomen',
      concept: 'Over tien jaar: welke spijt zit er in je werk aan te komen?',
      rondes: [
        'Welke spijt wil je voorkomen? Maak het concreet: welk besluit, welke persoon.',
        'Ontwerp één klein, veilig experiment voor de komende weken. Gebruik het advies uit de trojka.',
        'Spreek af wie uit dit drietal je over zes weken belt.',
      ],
      velden: [
        { id: 'exp', label: 'Mijn experiment, in één zin' },
        { id: 'bel', label: 'Wie belt mij' },
        { id: 'datum', label: 'Wanneer (over zes weken)' },
      ],
      vraag: 'Wat maakt dit experiment voor jou spannend?',
    },
  },
  {
    id: 'pijplijn', route: 'Basecamp', soort: 'stop', dicht: true,
    inhoud: {
      label: 'BASECAMP · GROEPSOPDRACHT', titel: 'De pijplijn',
      concept: 'Loslaten en doorlopen.',
      rondes: ['Breng samen de bal naar de emmer, alleen via de buizen. Je mag niet lopen terwijl de bal in jouw buis ligt.'],
      vraag: 'Wanneer moest je loslaten om door te kunnen, en wanneer bleef je hangen?',
    },
  },
  {
    id: 'vuur', route: 'Kampvuur', soort: 'stop', dicht: true,
    inhoud: {
      label: 'KAMPVUUR', titel: 'Brief van nu',
      concept: 'Een brief aan jezelf, een jaar vooruit.',
      vraag: 'Wat schrijf je jezelf? Begin bij je experiment.',
    },
  },
  {
    id: 'slot', route: 'Afronding', soort: 'slot', dicht: true,
    inhoud: {
      label: 'AFRONDING', titel: 'Waar heb je de komende tijd het meest aan?',
      concept: 'Je keuze bepaalt het laatste deel van je verslag. Er is geen betere of slechtere keuze.',
    },
  },
];

export const SLOT_KEUZES = {
  verdieping: { label: 'Verder graven', uitleg: 'Je krijgt richtingen om op door te denken. Vragen die blijven werken.' },
  actie: { label: 'In beweging komen', uitleg: 'Je krijgt concrete stappen die uit jouw dag naar voren komen.' },
} as const;

export type EntryData = {
  notes?: string;
  fields?: Record<string, string>;
  door?: string;
  keuze?: keyof typeof SLOT_KEUZES;
  waarom?: string;
};
