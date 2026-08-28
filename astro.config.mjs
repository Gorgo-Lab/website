// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { rehypeFigure, rehypeTableWrap } from './src/plugins/rehype-content.mjs';

// https://astro.build/config
export default defineConfig({
  // Dominio definitivo, deciso il 28 agosto 2026: il sito prende
  // www.gorgolab.it e la wiki storica viene dismessa. Da qui dipendono sitemap,
  // URL canonici e anteprime social, quindi finché il dominio non è collegato
  // le anteprime pubblicate su *.pages.dev si dichiarano già come www.
  site: 'https://www.gorgolab.it',
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
