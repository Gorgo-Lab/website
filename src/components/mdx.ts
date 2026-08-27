import Callout from './Callout.astro';
import Specs from './Specs.astro';
import Video from './Video.astro';

/**
 * Componenti disponibili nei file .mdx dei maker SENZA bisogno di import.
 * Passati a <Content components={mdxComponents} /> nei layout.
 *
 * Vincolo: qui possono stare solo componenti che non hanno bisogno di
 * conoscere la cartella dell'entry (niente path relativi a file).
 * Immagini → sintassi markdown normale; galleria e allegati → frontmatter.
 */
export const mdxComponents = { Callout, Specs, Video };
