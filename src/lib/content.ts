import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * I draft restano fuori dal sito pubblico ma sono visibili in `astro dev` e
 * nelle deploy preview delle PR (dove SHOW_DRAFTS=true), così una bozza si può
 * revisionare prima del merge senza pubblicarla.
 */
const showDrafts = import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === 'true';

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime();

export async function getProjects(): Promise<CollectionEntry<'progetti'>[]> {
  const all = await getCollection('progetti', ({ data }) => showDrafts || !data.draft);
  return all.sort(byDateDesc);
}

export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const all = await getCollection('blog', ({ data }) => showDrafts || !data.draft);
  return all.sort(byDateDesc);
}

/** Conta le occorrenze di ogni tag, ordinate per frequenza. */
export function tagCounts(entries: { data: { tags: readonly string[] } }[]) {
  const counts = new Map<string, number>();
  for (const e of entries) {
    for (const t of e.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
