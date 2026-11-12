// De inhoud van de dag. Teksten kun je hier aanpassen zonder dat er iets herbouwd hoeft te worden:
// alleen het soort invoer per moment (velden, kaart, doorgeefzin) bepaalt welk scherm er komt.
// Alle momenten zijn open: de vragen staan ook in de gedrukte veldgids. Codewoorden worden niet meer gebruikt.

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
    id: 'e1', route: 'Leg 1', soort: 'leg', dicht: false,
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
    id: 'e2', route: 'Leg 2', soort: 'leg', dicht: false,
    inhoud: {
      label: 'LEG 2 · DRIETAL', titel: 'Emotionele kaart',
      concept: 'Vaak worden vier basisemoties genoemd: angst, boosheid, verdriet en blijdschap. Daarnaast is er een andere positie: gevoelloosheid, het gebrek aan emotie. Bij de ene emotie kom je makkelijker dan bij de andere. Je beschrijft je relatie met elke emotie alsof het een persoon is. De spiegel geeft terug wat hij hoort.',
      chips: ['Angst', 'Boosheid', 'Verdriet', 'Blijdschap', 'Gevoelloosheid'], laatsteChipGestippeld: true,
      rondes: [
        'Als elke emotie een persoon was: hoe dichtbij staat die bij jou? Hoe zou je je relatie ermee beschrijven, en ben je daar blij mee?',
        'Hoe reageer je als je die emotie bij een ander tegenkomt?',
        'Wat valt je op in je antwoorden?',
      ],
      rolwissel: 'Wissel drie keer van rol, zodat iedereen één keer verteller is.',
      vraag: 'Welke emotie staat het verst van je af, en wat kost je dat? Welke staat het dichtst bij, en wat levert dat op? Andere inzichten mogen ook.',
    },
  },
  {
    id: 'e3', route: 'Leg 3', soort: 'leg', dicht: false,
    inhoud: {
      label: 'LEG 3 · DRIETAL', titel: 'Je volgende beklimming',
      concept: 'Charles Handy: alles wat groeit, ook een loopbaan, volgt een S-curve van opstarten, groeien en afvlakken. Begin aan de volgende curve vóór de top van de huidige (punt A). Waar je staat, hangt af van hoe lang je in je curve zit, niet van je leeftijd.',
      rondes: [
        'Waar op je curve sta je nu? Hoeveel curves heb je gehad?',
        'Wat heeft je hier gebracht, en wat houd je vast terwijl het je volgende stap niet meer helpt?',
        'Wat vraagt je volgende curve van je, en wanneer begin je aan de voorbereiding van deze nieuwe beklimming?',
      ],
      rolwissel: 'Wissel drie keer van rol, zodat iedereen één keer verteller is.',
      vraag: 'Waar sta je op je curve, en wat zou je moeten loslaten of juist beetpakken om aan de volgende te beginnen? Andere inzichten mogen ook.',
    },
  },
  {
    id: 'lunch', route: 'Advanced Basecamp', soort: 'stop', dicht: false,
    inhoud: {
      label: 'ADVANCED BASECAMP · LUNCH', titel: 'Waar gaat je energie naartoe?',
      concept: 'Vul aan tafel de energiekaart in je veldgids in: je agenda van de afgelopen twee weken, in trefwoorden. Kijk vooral naar het gouden vak: lage energie, hoge waarde. Je hebt de kaart nodig in leg 4.',
    },
  },
  {
    id: 'e4', route: 'Leg 4', soort: 'leg', dicht: false,
    inhoud: {
      label: 'LEG 4 · DRIETAL', titel: 'Wat draag je mee?',
      concept: 'Hoe zwaar iets voelt, hangt meer af van of je er zelf voor kiest dan van de hoeveelheid. Uit de positieve psychologie: veerkracht groeit niet alleen door minder te dragen, maar ook door wat je kracht geeft: je sterke kanten, mensen om je heen en momenten van herstel. Open je kaart.',
      rondes: [
        'Wat staat er in ‘lage energie, hoge waarde’? Wat heb je zelf gekozen, en wat is op je bord beland?',
        'Wat staat er in ‘hoge energie, hoge waarde’? Wat geeft je daar kracht?',
        'Wat stop je in je rugzak: iets lichts, waar je veel aan hebt?',
        'Wat had je allang neergelegd als je niet bang was iets te verliezen? Welke emotie houdt je daar?',
      ],
      rolwissel: 'Wissel drie keer van rol, zodat iedereen één keer verteller is.',
      vraag: 'Wat stop je in je rugzak, en wat leg je neer? Andere inzichten mogen ook.',
    },
  },
  {
    id: 'e5', route: 'Leg 5', soort: 'leg', dicht: false,
    inhoud: {
      label: 'LEG 5 · TROJKA', titel: 'Trojka',
      concept: 'Eén inbrenger, twee adviseurs. De eerste minuten loop je in stilte. Daarna lopen jullie gewoon naast elkaar verder. De adviseurs praten hardop met elkaar over de kwestie; de inbrenger luistert alleen. Iedereen is één keer inbrenger.',
      rondes: [
        'De inbrenger legt zijn kwestie voor. De adviseurs vragen alleen door.',
        'De inbrenger luistert. De adviseurs bespreken de kwestie hardop met elkaar.',
        'De inbrenger reageert: wat neem je mee, wat laat je liggen?',
      ],
      vraag: 'Wat kwam binnen, en wat raakte niet? Wat neem je mee aan inzicht?',
    },
  },
  {
    id: 'stil', route: 'Leg 6', soort: 'leg', dicht: false,
    inhoud: {
      label: 'LEG 6 · IN STILTE', titel: 'Terug naar Basecamp',
      concept: 'Je loopt terug naar Basecamp zonder te praten. Alleen jij, het pad en wat de dag heeft losgemaakt.',
      vraag: 'Terug in Basecamp: wat gaat er door je heen als je terugdenkt aan vandaag?',
    },
  },
  {
    id: 'buddy', route: 'Terug in Basecamp', soort: 'stop', dicht: false,
    inhoud: {
      label: 'TERUG IN BASECAMP · MAATJES', titel: 'Op wiens schouders',
      concept: 'Uit de positieve psychologie: je sterke kanten zie je het best in een moment waarop je op je best was. Wie een sterke kant op een nieuwe manier inzet, merkt daar ook maanden later nog iets van. Niemand komt daar alleen: je staat op de schouders van anderen. Wie die mensen bedankt, of zelf de schouders voor een ander wordt, maakt iets los dat blijft. Je doet dit met je maatje, iemand uit je eigen jaargang. Jullie zijn allebei een keer aan de beurt.',
      rondes: [
        'Vertel over een moment waarop je echt op je best was, in je werk of daarbuiten. Wat deed je precies?',
        'Maatje: welke sterke kanten hoor je in dat verhaal?',
        'Op wiens schouders stond je daar? Wie heeft je geholpen om zo te worden?',
        'Kies je experiment: zet één sterke kant de komende zes weken op een nieuwe manier in. Bijvoorbeeld in een andere rol, bij andere mensen, of door er iemand anders mee op weg te helpen.',
        'Bedank deze of volgende week degene op wiens schouders je stond.',
        'Spreek af wanneer je maatje je belt.',
      ],
      velden: [
        { id: 'exp', label: 'Mijn experiment' },
        { id: 'dank', label: 'Wie ga ik bedanken?' },
        { id: 'bel', label: 'Mijn maatje, en wanneer we bellen' },
      ],
    },
  },
  {
    id: 'terugblik', route: 'Terugblik', soort: 'terugblik', dicht: false,
    opent: '2026-11-13T00:00:00+01:00', sluit: '2026-11-18T00:00:00+01:00',
    inhoud: {
      label: 'TERUGBLIK', titel: 'Terugblik op je dag',
      concept: 'Een paar dagen later. Lees eerst rustig terug wat je onderweg vastlegde, hieronder onder Jouw dag. Neem er daarna de tijd voor: deze terugblik is de basis van je verslag.',
      vraag: 'Wat valt op? Wat blijft bij?',
      velden: [
        { id: 'geraakt', label: 'Wat raakte je het meest in de verhalen van anderen?' },
        { id: 'moment', label: 'Noem één moment uit een gesprek met een collega dat je bijblijft. Met naam en toenaam: wie was het, en wat gebeurde er?' },
        { id: 'patroon', label: 'Wat zie je terugkomen in wat je schreef, over de legs heen?' },
        { id: 'anders', label: 'Wat ga je de komende zes weken anders, bewuster, minder of meer doen? En waaraan merkt je maatje dat?' },
      ],
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
