import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../site.config';
import { getPosts, getProjects } from '../lib/content';

/**
 * Feed unico per progetti e articoli, ordinati per data.
 *
 * Sono tenuti insieme di proposito: chi segue lo spazio vuole sapere cosa si
 * costruisce, e separare i due flussi obbligherebbe a iscriversi due volte.
 */
export async function GET(context: APIContext) {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);

  const items = [
    ...posts.map((p) => ({ ...p, link: `/blog/${p.id}/` })),
    ...projects.map((p) => ({ ...p, link: `/progetti/${p.id}/` })),
  ]
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((e) => ({
      title: e.data.title,
      description: e.data.summary,
      pubDate: e.data.date,
      link: e.link,
      categories: [...e.data.tags],
      author: e.data.authors.join(', '),
    }));

  return rss({
    title: `${SITE.name} — Progetti e blog`,
    description: SITE.description,
    site: context.site!,
    items,
    customData: '<language>it-it</language>',
  });
}
