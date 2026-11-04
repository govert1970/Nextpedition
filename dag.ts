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
  doorgeef?: boolean; // het antwoord op de vraag staat bovenaan het volgende moment
};

export type Moment = {
  id: string;
  route: string; // wat op de route staat zolang het moment dicht is
  soort: 'basecamp' | 'leg' | 'stop' | 'terugblik';
  dicht: boolean; // gaat pas open met een codewoord
  opent?: string; // gaat vanzelf open op dit moment (ISO-datum)
  sluit?: string; // daarna kan er niets meer worden ingevuld
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
      vraag: 'Welk patroon benoemde je spiegel? Zeg het in één of een paar zinnen.',
      doorgeef: true,
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
        'Als elke emotie een persoon was: hoe is je relatie met die persoon? Hoe dichtbij staat die bij jou, en wie houd je liever op afstand? Wil je iets veranderen aan die relatie?',
        'Hoe reageer je als je die emotie bij een ander tegenkomt?',
        'Wat valt je op in je antwoorden? Zie je een patroon? Wat kost het, en wat levert het op?',
      ],
      rolwissel: 'Wissel drie keer van rol, zodat iedereen één keer verteller is.',
      vraag: 'Welke emotie staat het verst van je af, en wat kost je dat? Welke staat het dichtst bij, en wat levert dat op? Andere inzichten mogen ook.',
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
      vraag: 'Waar sta je op je curve, en wat zou je moeten loslaten of juist beetpakken om aan de volgende te beginnen? Andere inzichten mogen ook.',
    },
  },
  {
    id: 'lunch', route: 'Advanced Basecamp', soort: 'stop', dicht: true,
    inhoud: {
      label: 'ADVANCED BASECAMP · LUNCH', titel: 'Waar gaat je energie naartoe?',
      concept: 'Vul aan tafel de energiekaart op papier in: je agenda van de afgelopen twee weken, in trefwoorden. Kijk vooral naar het gouden vak: lage energie, hoge waarde. Neem de kaart mee naar leg 4.',
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
      vraag: 'Welke kwestie neem je mee naar de trojka? Zeg het in één of een paar zinnen.',
      doorgeef: true,
    },
  },
  {
    id: 'e5', route: 'Leg 5', soort: 'leg', dicht: true,
    inhoud: {
      label: 'LEG 5 · TROJKA', titel: 'Trojka',
      concept: 'Eén inbrenger, twee adviseurs. Iedereen is één keer inbrenger.',
      start: 'Deze leg begint in stilte. Loop vijf minuten zonder te praten en denk na over de kwestie die je inbrengt.',
      rondes: [
        'Inbrenger: leg je kwestie voor. De anderen vragen alleen door.',
        'Inbrenger loopt een stukje vooruit en luistert mee. De twee adviseurs bespreken de kwestie hardop.',
        'Inbrenger sluit weer aan: wat neem je mee, wat laat je liggen?',
      ],
      vraag: 'Wat kwam binnen, en wat raakte niet? Wat neem je mee aan inzicht?',
    },
  },
  {
    id: 'stil', route: 'Laatste leg', soort: 'leg', dicht: true,
    inhoud: {
      label: 'LAATSTE LEG · IN STILTE', titel: 'Terug naar Basecamp',
      concept: 'Je loopt terug in stilte, alleen met je gedachten. Denk terug aan de dag: de mensen, de gesprekken, wat je raakte.',
      vraag: 'Terug in Basecamp: wat gaat er door je heen als je terugdenkt aan vandaag?',
    },
  },
  {
    id: 'buddy', route: 'Basecamp Buddy’s', soort: 'stop', dicht: true,
    inhoud: {
      label: 'BASECAMP · BUDDY’S', titel: 'Spijt voorkomen',
      concept: 'Met je buddy uit je eigen leergang. Over tien jaar: welke spijt zit er in je werk aan te komen?',
      rondes: [
        'Welke spijt wil je voorkomen? Maak het concreet: welk besluit, welke persoon.',
        'Ontwerp één klein, veilig experiment voor de komende weken. Gebruik eventueel het advies uit de trojka.',
        'Je buddy belt je over zes weken om te vragen hoe het ging. Spreek af wanneer.',
      ],
      velden: [
        { id: 'exp', label: 'Mijn experiment, in één zin' },
        { id: 'bel', label: 'Mijn buddy, en wanneer we bellen' },
      ],
    },
  },
  {
    id: 'groep', route: 'Groepsopdracht', soort: 'stop', dicht: true,
    inhoud: {
      label: 'BASECAMP · GROEPSOPDRACHT', titel: 'Groepsopdracht',
      concept: 'De uitleg krijg je ter plekke.',
    },
  },
  {
    id: 'vuur', route: 'Kampvuur', soort: 'stop', dicht: true,
    inhoud: {
      label: 'KAMPVUUR', titel: 'Een kaart aan jezelf',
      concept: 'Bij het vuur schrijf je een korte kaart aan jezelf, op papier.',
    },
  },
  {
    id: 'terugblik', route: 'Terugblik', soort: 'terugblik', dicht: false,
    opent: '2026-11-13T00:00:00+01:00', sluit: '2026-11-18T00:00:00+01:00',
    inhoud: {
      label: 'TERUGBLIK', titel: 'Terugblik op je dag',
      concept: 'Een paar dagen later. Lees terug wat je onderweg vastlegde, en kijk wat er nu opvalt.',
      vraag: 'Wat valt op? Wat blijft bij?',
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
