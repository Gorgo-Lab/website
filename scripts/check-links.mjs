#!/usr/bin/env node
/**
 * Verifica che ogni collegamento interno del sito porti da qualche parte.
 *
 * Lo schema Zod controlla il frontmatter e `check-assets` controlla i file, ma
 * nessuno dei due si accorge di un `[vedi qui](/progetti/nome-sbagliato/)`
 * scritto a mano nel testo: la build passa e il 404 si scopre mesi dopo, se si
 * scopre. Questo gira sulla build in `dist/`, quindi va lanciato dopo `build`.
 *
 * I collegamenti esterni non vengono contattati: farebbe fallire la CI ogni
 * volta che un sito altrui è giù, e non è un problema nostro.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';

if (!existsSync(DIST)) {
  console.error('\x1b[31m✗ Manca la cartella dist/: lancia prima `npm run build`.\x1b[0m');
  process.exit(1);
}

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = await walk(DIST);
const pagine = new Set();
const risorse = new Set();

for (const f of files) {
  const rel = '/' + relative(DIST, f).split('\\').join('/');
  risorse.add(rel);
  if (rel.endsWith('/index.html')) pagine.add(rel.replace(/index\.html$/, ''));
}

const html = files.filter((f) => f.endsWith('.html'));
const problemi = new Map();

for (const f of html) {
  const testo = await readFile(f, 'utf8');
  const origine = '/' + relative(DIST, f).replace(/index\.html$/, '');

  for (const m of testo.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (!raw.startsWith('/')) continue;          // esterni, ancore, mailto: non ci riguardano
    const url = raw.split('#')[0].split('?')[0];
    if (!url) continue;

    const ok = risorse.has(url) || pagine.has(url) || pagine.has(url + '/');
    if (!ok) {
      if (!problemi.has(url)) problemi.set(url, new Set());
      problemi.get(url).add(origine);
    }
  }
}

if (problemi.size > 0) {
  console.error(`\n\x1b[31m✗ ${problemi.size} collegament${problemi.size === 1 ? 'o interno rotto' : 'i interni rotti'}:\x1b[0m\n`);
  for (const [url, origini] of problemi) {
    console.error(`  • ${url}`);
    console.error(`    citato in: ${[...origini].join(', ')}\n`);
  }
  process.exit(1);
}

console.log(`\x1b[32m✓\x1b[0m ${pagine.size} pagine, tutti i collegamenti interni risolvono.`);
