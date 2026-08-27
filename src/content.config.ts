import { defineCollection, type SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { TAGS, PROJECT_STATUS_KEYS } from './site.config';

/**
 * Campi condivisi da progetti e blog.
 *
 * `image()` risolve i path relativi al file di contenuto e verifica che
 * l'immagine esista davvero: un refuso nel nome file fa fallire la build,
 * non produce un box vuoto in produzione.
 */
const common = ({ image }: SchemaContext) =>
  z.object({
    title: z.string().min(3).max(90),
    // Testo dell'anteprima nel box della griglia: tenuto corto per forza.
    summary: z.string().min(20).max(220),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    authors: z.array(z.string().min(2)).min(1),
    cover: image(),
    coverAlt: z.string().min(3),
    tags: z.array(z.enum(TAGS)).min(1).max(6),
    draft: z.boolean().default(false),
  });

const attachment = z.object({
  // Nome del file dentro la cartella del progetto, es. "schema.pdf"
  file: z.string().min(1),
  label: z.string().min(2),
  note: z.string().optional(),
});

const link = z.object({
  label: z.string().min(2),
  url: z.url(),
});

const progetti = defineCollection({
  loader: glob({ pattern: '**/index.{md,mdx}', base: './src/content/progetti' }),
  schema: (ctx) =>
    common(ctx)
      .extend({
        status: z.enum(PROJECT_STATUS_KEYS),
        // Messo in evidenza in home. Da alzare solo da chi cura il sito.
        featured: z.boolean().default(false),
        gallery: z.array(ctx.image()).max(24).optional(),
        galleryAlt: z.array(z.string()).optional(),
        attachments: z.array(attachment).max(20).optional(),
        links: z.array(link).max(10).optional(),
        license: z.string().default('CC BY-SA 4.0'),
      })
      .refine(
        (d) => !d.gallery || !d.galleryAlt || d.galleryAlt.length === d.gallery.length,
        { message: 'galleryAlt deve avere un testo alternativo per ogni immagine di gallery' },
      ),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/index.{md,mdx}', base: './src/content/blog' }),
  schema: (ctx) => common(ctx),
});

export const collections = { progetti, blog };
