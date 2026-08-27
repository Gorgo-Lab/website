#!/usr/bin/env node
/**
 * Genera una copertina segnaposto in stile Gorgo Lab.
 *
 *   npm run placeholder -- src/content/progetti/mio-progetto
 *   npm run placeholder -- src/content/progetti/mio-progetto/copertina.jpg
 *   npm run placeholder -- out.jpg --seed "tornio" --ratio 16:9
 *
 * Serve a due cose: riempire il sito di esempi coerenti, e dare una copertina
 * dignitosa al maker che ha finito il progetto ma non ha una foto decente.
 *
 * Le regole di marca valgono anche qui: due colori piatti, nessun gradiente,
 * nessuna texture. Solo forme geometriche grandi, come un manifesto serigrafato.
 *
 * Il disegno è deterministico: lo stesso nome produce sempre la stessa
 * immagine, così rigenerarla non cambia le carte in tavola.
 */
import { existsSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import sharp from 'sharp';

// Palette del design system: nient'altro è ammesso.
const GL = {
  blue: '#0071bc',
  blue800: '#003a66',
  orange: '#f15a24',
  orange700: '#c8421a',
  paper: '#f7f4ee',
  paper2: '#efece4',
  ink: '#0e1620',
};

/** Coppie fondo/inchiostro già verificate come leggibili e in tono. */
const PALETTES = [
  { bg: GL.blue, fg: GL.orange, alt: GL.paper },
  { bg: GL.paper, fg: GL.blue, alt: GL.orange },
  { bg: GL.orange, fg: GL.ink, alt: GL.paper },
  { bg: GL.paper2, fg: GL.orange700, alt: GL.blue },
  { bg: GL.ink, fg: GL.orange, alt: GL.blue },
  { bg: GL.blue800, fg: GL.paper, alt: GL.orange },
];

/**
 * Composizioni su tela 1800×1200. Ogni forma resta lontana dai bordi
 * orizzontali, così il ritaglio a 16:9 delle pagine progetto non decapita niente.
 */
const LAYOUTS = [
  // Cerchio e barra: la forma del logo, smontata.
  (p) => `
    <circle cx="640" cy="600" r="330" fill="${p.fg}"/>
    <rect x="900" y="540" width="900" height="120" fill="${p.alt}"/>`,

  // Lente: due archi contrapposti.
  (p) => `
    <path d="M 500 180 A 520 520 0 0 1 500 1020 Z" fill="${p.fg}"/>
    <path d="M 1300 180 A 520 520 0 0 0 1300 1020 Z" fill="${p.alt}"/>`,

  // Quadrato fuori squadra: l'asimmetria concessa dal design system.
  (p) => `
    <rect x="620" y="310" width="580" height="580" fill="${p.fg}" transform="rotate(-8 910 600)"/>
    <rect x="240" y="240" width="90" height="720" fill="${p.alt}"/>`,

  // Anello aperto, come una chiave o una fascetta.
  (p) => `
    <circle cx="900" cy="600" r="330" fill="none" stroke="${p.fg}" stroke-width="150"/>
    <rect x="860" y="180" width="620" height="150" fill="${p.bg}"/>
    <rect x="1180" y="530" width="620" height="140" fill="${p.alt}"/>`,

  // Diagonali: il taglio, la fresa, la lama.
  (p) => `
    <g fill="${p.fg}">
      <rect x="220" y="-260" width="150" height="1720" transform="rotate(22 295 600)"/>
      <rect x="700" y="-260" width="150" height="1720" transform="rotate(22 775 600)"/>
    </g>
    <rect x="1180" y="-260" width="150" height="1720" fill="${p.alt}" transform="rotate(22 1255 600)"/>`,

  // Pila di barre: strati, layer di stampa.
  (p) => `
    <g fill="${p.fg}">
      <rect x="420" y="300" width="960" height="110"/>
      <rect x="420" y="470" width="720" height="110"/>
      <rect x="420" y="640" width="960" height="110"/>
    </g>
    <rect x="420" y="810" width="380" height="110" fill="${p.alt}"/>`,

  // Cuneo: la punta, lo scalpello, la fresa che entra.
  (p) => `
    <path d="M 480 990 L 990 210 L 1500 990 Z" fill="${p.fg}"/>
    <rect x="480" y="210" width="110" height="780" fill="${p.alt}"/>`,

  // Mirino: due assi incrociati, il centro macchina.
  (p) => `
    <rect x="180" y="530" width="1440" height="140" fill="${p.fg}"/>
    <rect x="830" y="180" width="140" height="840" fill="${p.fg}"/>
    <circle cx="900" cy="600" r="250" fill="none" stroke="${p.alt}" stroke-width="80"/>`,

  // Scala: i gradini, l'incremento, il layer.
  (p) => `
    <g fill="${p.fg}">
      <rect x="380" y="760" width="300" height="230"/>
      <rect x="720" y="580" width="300" height="410"/>
      <rect x="1060" y="400" width="300" height="590"/>
    </g>
    <rect x="380" y="210" width="980" height="110" fill="${p.alt}"/>`,

  // Griglia di tre: bulloni, viti, fori.
  (p) => `
    <g fill="${p.fg}">
      <circle cx="620" cy="440" r="185"/>
      <circle cx="1180" cy="760" r="185"/>
    </g>
    <circle cx="1180" cy="440" r="185" fill="none" stroke="${p.alt}" stroke-width="70"/>
    <circle cx="620" cy="760" r="185" fill="none" stroke="${p.alt}" stroke-width="70"/>`,
];

/** Hash deterministico e stabile fra versioni di Node (FNV-1a). */
function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function pick(seed, list) {
  return list[hash(seed) % list.length];
}

function buildSvg(seed, width, height) {
  // Due semi indipendenti: derivare forma e colore dallo stesso hash con uno
  // shift lascia i valori correlati, e su pochi progetti si vedeva — la stessa
  // forma usciva tre volte su sette.
  const palette = pick(`${seed}#palette`, PALETTES);
  const layout = pick(`${seed}#layout`, LAYOUTS);

  // La tela di disegno è sempre 1800×1200; preserveAspectRatio ritaglia al centro.
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1800 1200" preserveAspectRatio="xMidYMid slice">
      <rect width="1800" height="1200" fill="${palette.bg}"/>
      ${layout(palette)}
    </svg>`,
  );
}

// --- argomenti ---------------------------------------------------------
const argv = process.argv.slice(2);
const target = argv.find((a) => !a.startsWith('--'));
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : fallback;
};

if (!target) {
  console.log(`
\x1b[1mUso:\x1b[0m npm run placeholder -- <cartella | file.jpg> [opzioni]

  --seed <testo>   cambia il disegno a parità di nome file
  --ratio <a:b>    proporzioni, default 3:2
  --width <px>     larghezza, default 1800
  --force          sovrascrive un file esistente

Passando una cartella scrive \x1b[1mcopertina.jpg\x1b[0m al suo interno.
`);
  process.exit(0);
}

const path = resolve(target);
const isDir = existsSync(path) && statSync(path).isDirectory();
const outFile = isDir ? join(path, 'copertina.jpg') : path;

if (!isDir && !existsSync(dirname(outFile))) {
  console.error(`\x1b[31m✗ La cartella "${dirname(outFile)}" non esiste.\x1b[0m`);
  process.exit(1);
}
if (existsSync(outFile) && !argv.includes('--force')) {
  console.error(`\x1b[31m✗ "${outFile}" esiste già. Usa --force per sovrascriverlo.\x1b[0m`);
  process.exit(1);
}

const [rw, rh] = opt('ratio', '3:2').split(':').map(Number);
if (!rw || !rh) {
  console.error('\x1b[31m✗ --ratio va scritto come "3:2".\x1b[0m');
  process.exit(1);
}

const width = Number(opt('width', 1800));
const height = Math.round((width * rh) / rw);

// Il seme di default è il nome della cartella del progetto, non quello del file:
// così copertina.jpg e le altre immagini dello stesso progetto restano coerenti.
const seed = opt('seed', isDir ? basename(path) : basename(outFile, extname(outFile)));

// Rasterizzo al doppio e riduco: i bordi diagonali escono puliti senza
// dover alzare la densità, che scalerebbe l'SVG oltre le dimensioni chieste.
const svg = buildSvg(seed, width * 2, height * 2);
await sharp(svg)
  .resize(width, height)
  .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile(outFile);

console.log(
  `\x1b[32m✓\x1b[0m ${outFile}  \x1b[2m${width}×${height}, seme "${seed}", ` +
    `tavolozza ${(hash(`${seed}#palette`) % PALETTES.length) + 1}/${PALETTES.length}, ` +
    `forma ${(hash(`${seed}#layout`) % LAYOUTS.length) + 1}/${LAYOUTS.length}\x1b[0m`,
);
