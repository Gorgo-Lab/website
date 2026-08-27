// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { rehypeFigure, rehypeTableWrap } from './src/plugins/rehype-content.mjs';

// https://astro.build/config
export default defineConfig({
  // TODO: confermare il dominio definitivo del sito (serve a sitemap, canonical
  // e anteprime social). Il wiki storico sta su gorgolab.it.
  site: 'https://gorgolab.it',
  integrations: [mdx(), sitemap()],
  image: {
    // srcset + sizes generati automaticamente per <Image /> e per le immagini markdown
    layout: 'constrained',
    responsiveStyles: true,
  },
  vite: {
    build: {
      // Gli allegati dei progetti non vanno mai inlinati come data: URI:
      // devono restare file veri e scaricabili, anche quando sono piccoli.
      assetsInlineLimit: (file) =>
        /\.(pdf|zip|stl|step|stp|3mf|svg|dxf|ino|kicad_pro|sch|csv|txt|gcode)$/i.test(file)
          ? false
          : undefined,
    },
  },
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
    rehypePlugins: [rehypeFigure, rehypeTableWrap],
  },
});
