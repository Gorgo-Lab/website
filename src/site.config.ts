/**
 * Configurazione globale del sito.
 * Unico punto da toccare per nome, contatti e vocabolari controllati.
 */

export const SITE = {
  name: 'Gorgo Lab',
  /** Tutto maiuscolo attaccato: si usa solo nei manifesti e nel banner */
  wordmark: 'GORGOLAB',
  chant: 'GOGOGO',
  kicker: 'Makerspace di Gorgonzola',
  /** Prima variante dello slogan della home: le altre stanno in index.astro */
  tagline: 'Ti servono gli attrezzi? Qui ci sono.',
  description:
    'Un luogo fisico per programmazione, elettronica, tecnologia, artigianato, scienza, robotica, arte e fai-da-te. Aperto a chiunque.',
  email: 'info@martelab.it',
  address: "Ca' Busca, via Montenero, Gorgonzola (MI)",
  /** I documenti che descrivono valori e funzionamento del lab */
  governance: 'https://github.com/Gorgo-Lab/governance',
  /** Il repository del sito: è dove i maker aprono le pull request */
  repository: 'https://github.com/Gorgo-Lab/website',
  social: {
    instagram: '',
    github: '',
    mastodon: '',
  },
} as const;

/**
 * Vocabolario chiuso dei tag, allineato agli ambiti del lab:
 * programmazione, elettronica, tecnologia, artigianato, scienza,
 * robotica, arte e fai-da-te.
 *
 * È intenzionale che sia una lista fissa: senza vincolo nascono in fretta
 * "stampa3d", "stampa-3d" e "3dprint" come tag distinti. Aggiungere un tag
 * richiede di modificare questo file nella PR — un attrito voluto, non un bug.
 */
export const TAGS = [
  'programmazione',
  'elettronica',
  'robotica',
  'stampa-3d',
  'cnc',
  'laser',
  'falegnameria',
  'artigianato',
  'tessile',
  'scienza',
  'arte',
  'fai-da-te',
  'riparazione',
  'domotica',
  'workshop',
] as const;

/** Stato di avanzamento di un progetto (chiavi nel frontmatter, valori a video). */
export const PROJECT_STATUS_KEYS = ['idea', 'in-corso', 'completato', 'sospeso'] as const;

export const PROJECT_STATUS: Record<(typeof PROJECT_STATUS_KEYS)[number], string> = {
  idea: 'Idea',
  'in-corso': 'In corso',
  completato: 'Completato',
  sospeso: 'Sospeso',
};

/** Estensioni ammesse come allegato scaricabile. */
export const ATTACHMENT_EXTENSIONS = [
  'pdf', 'zip', 'stl', 'step', 'stp', '3mf', 'svg', 'dxf',
  'ino', 'kicad_pro', 'sch', 'csv', 'txt', 'gcode',
] as const;

/** Icona Lucide per ciascun tipo di allegato. */
export const ATTACHMENT_ICONS: Record<string, string> = {
  pdf: 'file-text', txt: 'file-text', csv: 'table-2',
  zip: 'file-archive',
  stl: 'box', step: 'box', stp: 'box', '3mf': 'box',
  svg: 'pen-tool', dxf: 'pen-tool',
  ino: 'cpu', sch: 'circuit-board', kicad_pro: 'circuit-board',
  gcode: 'printer',
};
