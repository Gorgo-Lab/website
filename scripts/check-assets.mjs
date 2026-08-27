#!/usr/bin/env node
/**
 * Guardia sui file di contenuto, pensata per girare in CI su ogni pull request.
 *
 * Non controlla il frontmatter: quello lo fa già lo schema Zod facendo fallire
 * la build. Qui si controlla solo ciò che la build accetterebbe volentieri ma
 * che rovinerebbe il repository nel tempo: file enormi, video committati,
 * immagini a piena risoluzione da fotocamera.
 *
 * La storia di git è per sempre: un file grosso committato per sbaglio resta
 * anche dopo averlo cancellato. Meglio bloccarlo prima del merge.
 */
import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = 'src/content';
const MAX_FILE_BYTES = 2 * 1024 * 1024;   // 2 MB per file
const MAX_IMAGE_EDGE = 3000;              // px sul lato lungo
const MAX_DIR_BYTES = 12 * 1024 * 1024;   // 12 MB per progetto

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
const BANNED_EXT = new Map([
  ['.mp4', 'i video vanno embeddati da YouTube o Vimeo con <Video />, mai committati'],
  ['.mov', 'i video vanno embeddati da YouTube o Vimeo con <Video />, mai committati'],
  ['.avi', 'i video vanno embeddati da YouTube o Vimeo con <Video />, mai committati'],
  ['.mkv', 'i video vanno embeddati da YouTube o Vimeo con <Video />, mai committati'],
  ['.heic', 'converti in JPG: HEIC non è supportato da tutti i browser'],
  ['.tif', 'converti in JPG: i TIFF sono enormi e non servono sul web'],
  ['.tiff', 'converti in JPG: i TIFF sono enormi e non servono sul web'],
  ['.psd', 'i file di lavorazione non vanno nel repository'],
  ['.ai', 'i file di lavorazione non vanno nel repository'],
]);

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
const errors = [];
const warnings = [];

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out; // la collezione può non esistere ancora
  }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = await walk(ROOT);
const dirTotals = new Map();

for (const f of files) {
  const rel = relative('.', f);
  const ext = extname(f).toLowerCase();
  const size = (await stat(f)).size;

  const dir = rel.split('/').slice(0, 4).join('/');
  dirTotals.set(dir, (dirTotals.get(dir) ?? 0) + size);

  if (BANNED_EXT.has(ext)) {
    errors.push(`${rel}\n    ${BANNED_EXT.get(ext)}`);
    continue;
  }

  if (size > MAX_FILE_BYTES) {
    errors.push(
      `${rel}\n    pesa ${mb(size)}, il limite è ${mb(MAX_FILE_BYTES)}.\n` +
        `    Se è un'immagine: npm run ingest la ricomprime da sola.`,
    );
    continue;
  }

  if (IMAGE_EXT.has(ext) && ext !== '.svg') {
    try {
      const { width = 0, height = 0 } = await sharp(f).metadata();
      if (Math.max(width, height) > MAX_IMAGE_EDGE) {
        errors.push(
          `${rel}\n    è ${width}×${height} px: oltre il limite di ${MAX_IMAGE_EDGE} px sul lato lungo.\n` +
            `    Ridimensionala prima di committarla (npm run ingest lo fa in automatico).`,
        );
      }
    } catch {
      warnings.push(`${rel} — non sono riuscito a leggerne le dimensioni`);
    }
  }
}

for (const [dir, total] of dirTotals) {
  if (total > MAX_DIR_BYTES) {
    errors.push(`${dir}/\n    la cartella pesa ${mb(total)} in tutto, il limite è ${mb(MAX_DIR_BYTES)}.`);
  }
}

if (warnings.length) {
  console.log('\x1b[33m! Avvisi:\x1b[0m');
  for (const w of warnings) console.log(`  ${w}`);
}

if (errors.length) {
  console.error(`\n\x1b[31m✗ ${errors.length} problem${errors.length === 1 ? 'a' : 'i'} nei file di contenuto:\x1b[0m\n`);
  for (const e of errors) console.error(`  • ${e}\n`);
  process.exit(1);
}

console.log(`\x1b[32m✓\x1b[0m ${files.length} file di contenuto, tutti entro i limiti.`);
