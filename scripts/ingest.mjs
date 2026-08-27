#!/usr/bin/env node
/**
 * Importa il materiale di un maker (uno zip o una cartella) dentro il sito.
 *
 *   npm run ingest -- ~/Downloads/braccio.zip
 *   npm run ingest -- ./cartella-del-maker --collection blog --slug serata-cnc
 *
 * Cosa fa, così non lo fai a mano:
 *  - ricomprime ogni immagine (max 2560 px, qualità 82) e le strippa dei
 *    metadati EXIF, geolocalizzazione compresa;
 *  - rinomina tutti i file in kebab-case;
 *  - tiene solo gli allegati con estensione ammessa e segnala gli scarti;
 *  - genera index.md con il frontmatter completo, riusando quello che il
 *    maker ha già scritto e lasciando TODO evidenti su quello che manca.
 *
 * Non pubblica niente: crea la cartella, poi la revisioni e fai commit.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { mkdir, readdir, readFile, stat, writeFile, copyFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const MAX_EDGE = 2560;      // px sul lato lungo
const JPEG_QUALITY = 82;
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.tif', '.tiff']);
const ATTACHMENT_EXT = new Set([
  '.pdf', '.zip', '.stl', '.step', '.stp', '.3mf', '.svg', '.dxf',
  '.ino', '.kicad_pro', '.sch', '.csv', '.txt', '.gcode',
]);

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  err: (s) => `\x1b[31m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
};

function die(msg) {
  console.error(c.err(`\n✗ ${msg}\n`));
  process.exit(1);
}

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Raccoglie ricorsivamente i file, ignorando la fuffa di macOS e Windows. */
async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === '__MACOSX' || e.name === 'Thumbs.db') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

// --- argomenti ---------------------------------------------------------
const argv = process.argv.slice(2);
const source = argv.find((a) => !a.startsWith('--'));
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : fallback;
};

if (!source) {
  console.log(`
${c.b('Uso:')} npm run ingest -- <file.zip | cartella> [opzioni]

  --collection  progetti (default) | blog
  --slug        nome della cartella di destinazione (default: dal nome del file)
  --force       sovrascrive una destinazione già esistente
`);
  process.exit(0);
}

const collection = opt('collection', 'progetti');
if (!['progetti', 'blog'].includes(collection)) die(`--collection deve essere "progetti" o "blog", non "${collection}"`);

const src = resolve(source);
if (!existsSync(src)) die(`Non trovo "${src}"`);

const slug = slugify(opt('slug', basename(src, extname(src))));
const destDir = resolve('src/content', collection, slug);

if (existsSync(destDir) && !argv.includes('--force')) {
  die(`"${destDir}" esiste già. Usa --force per sovrascriverla.`);
}

// --- estrazione --------------------------------------------------------
let workDir = src;
let tempDir = null;

if ((await stat(src)).isFile()) {
  if (extname(src).toLowerCase() !== '.zip') die('Passami una cartella o un file .zip');
  tempDir = mkdtempSync(join(tmpdir(), 'ingest-'));
  try {
    execFileSync('unzip', ['-q', '-o', src, '-d', tempDir]);
  } catch {
    die('Non riesco a scompattare lo zip. Serve il comando `unzip` installato.');
  }
  // Se lo zip contiene una sola cartella radice, entraci dentro.
  const top = (await readdir(tempDir, { withFileTypes: true })).filter((e) => !e.name.startsWith('.') && e.name !== '__MACOSX');
  workDir = top.length === 1 && top[0].isDirectory() ? join(tempDir, top[0].name) : tempDir;
}

console.log(`\n${c.b('Importo')} ${c.dim(workDir)}\n  → ${c.b(`src/content/${collection}/${slug}/`)}\n`);

const files = await walk(workDir);
if (files.length === 0) die('La cartella è vuota.');

await mkdir(destDir, { recursive: true });

// --- markdown di partenza ---------------------------------------------
const mdFile = files.find((f) => ['.md', '.mdx', '.markdown', '.txt'].includes(extname(f).toLowerCase()));
let body = '';
let fm = {};

if (mdFile) {
  const raw = await readFile(mdFile, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (m) {
    try {
      fm = parseYaml(m[1]) ?? {};
    } catch (e) {
      console.log(c.warn(`  ! Il frontmatter esistente non è YAML valido, lo ignoro: ${e.message}`));
    }
    body = m[2];
  } else {
    body = raw;
  }
  console.log(`  ${c.ok('md')}  ${basename(mdFile)}`);
} else {
  console.log(c.warn('  !   Nessun file markdown trovato: genero uno scheletro vuoto.'));
}

// --- immagini ----------------------------------------------------------
const images = [];
let savedBytes = 0;

for (const f of files.filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))) {
  const name = `${slugify(basename(f, extname(f)))}.jpg`;
  const dest = join(destDir, name);
  const before = (await stat(f)).size;

  try {
    await sharp(f, { failOn: 'none' })
      .rotate()                                     // applica l'orientamento EXIF, poi lo butta
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(dest);
  } catch (e) {
    console.log(c.err(`  ✗ img ${basename(f)} — non riesco a leggerla (${e.message})`));
    continue;
  }

  const after = (await stat(dest)).size;
  savedBytes += before - after;
  images.push(name);
  const kb = (n) => `${Math.round(n / 1024)} kB`;
  console.log(`  ${c.ok('img')} ${basename(f)} ${c.dim(`→ ${name}  ${kb(before)} → ${kb(after)}`)}`);
}

// --- allegati ----------------------------------------------------------
const attachments = [];

for (const f of files) {
  const ext = extname(f).toLowerCase();
  if (IMAGE_EXT.has(ext) || f === mdFile) continue;

  if (!ATTACHMENT_EXT.has(ext)) {
    console.log(c.warn(`  ! sca ${basename(f)} — estensione non ammessa, saltato`));
    continue;
  }
  const size = (await stat(f)).size;
  if (size > 2 * 1024 * 1024) {
    console.log(c.warn(`  ! big ${basename(f)} — ${Math.round(size / 1024 / 1024)} MB: troppo per il repository, saltato`));
    continue;
  }
  const name = `${slugify(basename(f, ext))}${ext}`;
  await copyFile(f, join(destDir, name));
  attachments.push(name);
  console.log(`  ${c.ok('all')} ${basename(f)} ${c.dim(`→ ${name}`)}`);
}

// --- frontmatter -------------------------------------------------------
const TODO = (what) => `TODO: ${what}`;
const cover = images.find((i) => /copertina|cover|hero|main/.test(i)) ?? images[0];
const gallery = images.filter((i) => i !== cover);

const out = {
  title: fm.title ?? TODO('titolo del progetto'),
  summary: fm.summary ?? TODO('descrizione di 20-220 caratteri per l\'anteprima'),
  date: fm.date ?? new Date().toISOString().slice(0, 10),
  authors: Array.isArray(fm.authors) ? fm.authors : fm.author ? [fm.author] : [TODO('nome autore')],
  tags: Array.isArray(fm.tags) ? fm.tags : [TODO('almeno un tag da src/site.config.ts')],
  cover: cover ? `./${cover}` : TODO('nessuna immagine trovata, serve una copertina'),
  coverAlt: fm.coverAlt ?? TODO('descrizione testuale della copertina'),
};

if (collection === 'progetti') {
  out.status = fm.status ?? 'in-corso';
  if (gallery.length) {
    out.gallery = gallery.map((g) => `./${g}`);
    out.galleryAlt = gallery.map(() => TODO('descrizione immagine'));
  }
  if (attachments.length) {
    out.attachments = attachments.map((a) => ({ file: a, label: TODO(`etichetta per ${a}`) }));
  }
  out.license = fm.license ?? 'CC BY-SA 4.0';
}

out.draft = true; // sempre bozza all'ingresso: si pubblica dopo la revisione

const frontmatter = stringifyYaml(out, { lineWidth: 88 }).trimEnd();
await writeFile(join(destDir, 'index.md'), `---\n${frontmatter}\n---\n\n${body.trim()}\n`, 'utf8');

if (tempDir) rmSync(tempDir, { recursive: true, force: true });

// --- riepilogo ---------------------------------------------------------
const todos = JSON.stringify(out).match(/TODO:/g)?.length ?? 0;

console.log(`
${c.ok('✓')} ${images.length} immagini, ${attachments.length} allegati${
  savedBytes > 0 ? c.dim(`  (${Math.round(savedBytes / 1024 / 1024 * 10) / 10} MB risparmiati)`) : ''
}

${c.b('Restano da fare:')}
  1. apri ${c.b(`src/content/${collection}/${slug}/index.md`)} e completa i ${todos} campi ${c.warn('TODO')}
  2. togli ${c.warn('draft: true')} quando è pronto per andare online
  3. ${c.dim('npm run dev')} per vedere il risultato
`);
